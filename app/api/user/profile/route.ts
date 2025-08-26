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
    // Get user with their site ID
    const user = await prisma.user.findUnique({
      where: { 
        email: session.user.email as string 
      },
      select: {
        id: true,
        name: true,
        email: true,
        siteId: true,
        role: true,
        // Don't include password hash
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user
    });
    
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'An error occurred while fetching user profile' 
    }, { status: 500 });
  }
}
