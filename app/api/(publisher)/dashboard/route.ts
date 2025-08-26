import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const url = new URL(request.url);
    // Get date range from query params or default to last month
    const startDate = url.searchParams.get('start_date') || 
      new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0];
    const endDate = url.searchParams.get('end_date') || 
      new Date().toISOString().split('T')[0];

    // Get user to retrieve their siteId
    const user = await prisma.user.findUnique({
      where: { email: session.user.email as string },
    });

    if (!user || !user.siteId) {
      return NextResponse.json({ error: 'User has no associated site ID' }, { status: 400 });
    }

    // API credentials
    const apiKey = process.env.API_KEY;
    const apiSecret = process.env.API_SECRET;

    if (!apiKey || !apiSecret) {
      console.error("Missing API key or secret");
      return NextResponse.json({ error: 'API configuration error' }, { status: 500 });
    }

    // API URL for dashboard data - Remove site_id from the URL as API returns all sites
    const apiUrl = `https://account2.yieldkit.com/api/v3/reports/publisher/site/click?start_date=${startDate}&end_date=${endDate}&format=json`;

    console.log('Fetching dashboard data from:', apiUrl);
    const startTime = Date.now();
    
    try {
      // Set a timeout for the API call
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
      
      const response = await fetch(apiUrl, {
        headers: {
          'accept': 'application/json',
          'x-api-secret': apiSecret,
          'x-api-key': apiKey
        },
        signal: controller.signal
      });
      
      // Clear the timeout since the fetch completed
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        console.error('API error:', await response.text());
        return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: response.status });
      }
      
      const data = await response.json();
      console.log(`API responded in ${Date.now() - startTime}ms`);

      console.log("🟢 data",data);
      
      
      // Define interfaces for strong typing
      interface SiteStatistic {
        value: string;
        statistic: {
          clicks_forwarded: number;
          clicks_untracked: number;
          clicks_blocked: number;
          paid_commissions: number;
          confirmed_commissions: number;
          open_commissions: number;
          delayed_commissions: number;
          rejected_commissions: number;
          total_commission: number;
        };
      }

      interface ApiResponse {
        self: string;
        next: string;
        total_pages: number;
        content: SiteStatistic[];
        page_size: number;
      }
      
      // Type assertion for the response data
      const typedData = data as ApiResponse;
      
      // Filter the data to include ONLY the publisher's site ID
      if (typedData && typedData.content && Array.isArray(typedData.content)) {
        // Find the user's site data in the API response
        const userSiteData = typedData.content.find((site: SiteStatistic) => site.value === user.siteId);
        
        if (userSiteData) {
          console.log(`Found user's site data for site ID: ${user.siteId}`);
          // Only include the user's site data in the response
          typedData.content = [userSiteData];
        } else {
          console.log(`User site ID ${user.siteId} not found in API response`);
          // No data found for user's site ID, return empty content
          typedData.content = [];
        }
      }
      
      console.log("🔴 typedData",typedData);
      
      return NextResponse.json({
        success: true,
        data: typedData  // Return the modified data with sorted/filtered content
      });
      
    } catch (error: any) {
      const errorTime = Date.now() - startTime;
      
      if (error.name === 'AbortError') {
        console.error(`API timed out after ${errorTime}ms (15 second timeout reached)`);
        return NextResponse.json({ 
          error: 'API request took too long to respond, please try again later',
          success: false
        }, { status: 504 });
      }
      
      throw error; // Re-throw other errors to be caught by the outer catch block
    }
    
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'An unexpected error occurred while fetching dashboard data' 
    }, { status: 500 });
  }
}
