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

    const response = await fetch(yieldkitUrl, {
      headers: {
        'accept': 'application/json'
      }
    });

    if (!response.ok) {
      console.error('Yieldkit API error:', await response.text());
      return NextResponse.json({ error: 'Failed to fetch programs from Yieldkit' }, { status: response.status });
    }

    const data = await response.json();

    console.log("data",data);
    

    // Get user's program requests to mark joined programs
    const userProgramRequests = await prisma.programRequest.findMany({
      where: {
        userId: user.id
      }
    });

    // Map programs with join status
    const programsWithStatus = data.advertisers.map((program: any) => {
      const request = userProgramRequests.find(req => req.programId === program.id);
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
