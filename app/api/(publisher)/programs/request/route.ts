import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/auth';
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

    console.log("Checking program existence:", programId, existingProgram ? "exists" : "doesn't exist");

    if (!existingProgram) {
      console.log("Creating new program in our database for:", programId);
      
      try {
        // First, try to create the program directly with minimal information
        // This is a fallback in case the API call fails
        await prisma.program.create({
          data: {
            id: programId,
            name: `Program ${programId}`,
            description: '',
            categories: [],
            countries: [],
          },
        });
        
        console.log("Created program with minimal information");
        
        // Even though we created a minimal record, still try to fetch more details
        // from the Yieldkit API to update our record with better information
        const apiKey = process.env.API_KEY || '7d9190cbf12fe7bb14f1599e04ab57da';
        const apiSecret = process.env.API_SECRET || '64c067c1c1a01034238875b2beb7ee31';
        const apiUrl = `https://api.yieldkit.com/v1/advertiser?api_key=${apiKey}&api_secret=${apiSecret}&site_id=${user.siteId}&id=${programId}&format=json`;
        
        console.log("Fetching program details from API:", apiUrl);
        
        const response = await fetch(apiUrl, {
          headers: { 'accept': 'application/json' },
        });

        if (response.ok) {
          const data = await response.json();
          
          if (data.advertisers && data.advertisers.length > 0) {
            // Look for the exact matching program by ID
            const advertiser = data.advertisers.find((adv: any) => adv.id === programId) || data.advertisers[0];
            
            // Log which program we're using
            console.log("Found program:", advertiser.id, advertiser.name);
            
            // Double check if this is the right program
            if (advertiser.id !== programId) {
              console.warn(`Warning: API returned program ${advertiser.id} but we requested ${programId}`);
            }
            
            // Update the program with full details
            await prisma.program.update({
              where: { id: programId },
              data: {
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
            
            console.log("Updated program with API details");
          }
        } else {
          console.log("Failed to fetch program details from API, but continuing with minimal record");
        }
      } catch (error) {
        console.error("Error creating program:", error);
        return NextResponse.json({ error: 'Failed to create program record' }, { status: 500 });
      }
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
