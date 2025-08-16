import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/auth';
import prisma from '@/lib/prisma';

// Submit a program join request
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { programId } = body;

    if (!programId) {
      return NextResponse.json({ error: 'Program ID is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email as string },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if program exists in our database, if not add it
    const existingProgram = await prisma.program.findUnique({
      where: { id: programId },
    });

    if (!existingProgram) {
      // Fetch program details from Yieldkit API to store in our database
      const apiUrl = `https://api.yieldkit.com/v1/advertiser?api_key=7d9190cbf12fe7bb14f1599e04ab57da&api_secret=64c067c1c1a01034238875b2beb7ee31&site_id=${user.siteId}&id=${programId}&format=json`;
      
      const response = await fetch(apiUrl, {
        headers: { 'accept': 'application/json' },
      });

      if (!response.ok) {
        return NextResponse.json(
          { error: 'Failed to fetch program details from Yieldkit API' }, 
          { status: response.status }
        );
      }

      const data = await response.json();
      
      if (!data.advertisers || data.advertisers.length === 0) {
        return NextResponse.json({ error: 'Program not found' }, { status: 404 });
      }

      const advertiser = data.advertisers[0];
      
      // Create the program in our database
      await prisma.program.create({
        data: {
          id: advertiser.id,
          name: advertiser.name,
          description: advertiser.description || '',
          image: advertiser.image || '',
          domain: advertiser.domain || '',
          url: advertiser.url || '',
          payPerLead: advertiser.payPerLead || 0,
          payPerSale: advertiser.payPerSale || 0,
          currency: advertiser.currency || 'EUR',
          categories: advertiser.categories || [],
          countries: advertiser.countries || [],
        },
      });
    }

    // Check if request already exists
    const existingRequest = await prisma.programRequest.findUnique({
      where: {
        userId_programId: {
          userId: user.id,
          programId: programId,
        },
      },
    });

    if (existingRequest) {
      return NextResponse.json({ 
        error: 'You have already requested to join this program',
        requestStatus: existingRequest.status
      }, { status: 400 });
    }

    // Create program request
    const programRequest = await prisma.programRequest.create({
      data: {
        userId: user.id,
        programId: programId,
        status: 'PENDING',
      },
    });

    return NextResponse.json({ 
      success: true,
      message: 'Program join request submitted successfully',
      programRequest
    });
    
  } catch (error) {
    console.error('Error submitting program join request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
