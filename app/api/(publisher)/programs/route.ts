import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/auth';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const url = new URL(req.url);
    const page = url.searchParams.get('page') || '1';
    const pageSize = url.searchParams.get('pageSize') || '10';
    let country = url.searchParams.get('country') || 'ALL';

    // Get user to retrieve their siteId
    const user = await prisma.user.findUnique({
      where: { email: session.user.email as string },
    });

    if (!user || !user.siteId) {
      return NextResponse.json({ error: 'User has no associated site ID' }, { status: 400 });
    }

    // Yieldkit API credentials
    const apiKey = process.env.API_KEY
    const apiSecret = process.env.API_SECRET

    // Make request to Yieldkit API
    // If country is 'ALL', don't include the country parameter
    let yieldkitUrl = `https://api.yieldkit.com/v1/advertiser?api_key=${apiKey}&api_secret=${apiSecret}&site_id=${user.siteId}&page_size=${pageSize}&page=${page}&format=json`;
    
    // Only add country parameter if it's not 'ALL'
    if (country !== 'ALL') {
      yieldkitUrl += `&country=${country}`;
    }

    console.log('Fetching from Yieldkit API:', yieldkitUrl);
    const startTime = Date.now();
    
    let data;
    
    try {
      // Set a timeout of 15 seconds for the API call
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
      
      const response = await fetch(yieldkitUrl, {
        headers: {
          'accept': 'application/json'
        },
        signal: controller.signal
      });
      
      // Clear the timeout since the fetch completed
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        console.error('Yieldkit API error:', await response.text());
        return NextResponse.json({ error: 'Failed to fetch programs from Yieldkit' }, { status: response.status });
      }
      
      data = await response.json();
      console.log(`Yieldkit API responded in ${Date.now() - startTime}ms`);
    } catch (error: any) {
      const errorTime = Date.now() - startTime;
      
      if (error.name === 'AbortError') {
        console.error(`Yieldkit API timed out after ${errorTime}ms (15 second timeout reached)`);
        return NextResponse.json({ 
          error: 'Yieldkit API request took too long to respond, please try again later',
          success: false,
          programs: [] 
        }, { status: 504 });
      }
      
      throw error; // Re-throw other errors to be caught by the outer catch block
    }
    
    // Start fetching program requests in parallel with processing the API response
    const userProgramRequestsPromise = prisma.programRequest.findMany({
      where: {
        userId: user.id
      },
      // Only fetch the fields we need
      select: {
        programId: true,
        status: true
      }
    });
    
    // Wait for the program requests to be fetched
    const userProgramRequests = await userProgramRequestsPromise;
    
    console.log(`Found ${userProgramRequests.length} program requests for user`);

    // Map programs with join status
    const programsWithStatus = data.advertisers.map((program: any) => {
      const request = userProgramRequests.find((req: {programId: string, status: string}) => 
        req.programId === program.id
      );
      return {
        ...program,
        joinStatus: request ? request.status : null
      };
    });

    return NextResponse.json({
      success: true,
      total: data.total,
      page: parseInt(page),
      pageSize: parseInt(pageSize),
      programs: programsWithStatus
    });
    
  } catch (error) {
    console.error('Error fetching programs:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
