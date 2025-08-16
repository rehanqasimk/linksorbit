import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/auth';
import prisma from '@/lib/prisma';

// Get all program join requests (for admin)
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check if user is admin
  const user = await prisma.user.findUnique({
    where: { email: session.user.email as string },
  });

  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized, admin access required' }, { status: 403 });
  }

  try {
    const url = new URL(req.url);
    const status = url.searchParams.get('status') || undefined;
    
    const programRequests = await prisma.programRequest.findMany({
      where: status ? { status: status as any } : {},
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            siteId: true,
            website: true,
          },
        },
        program: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      programRequests,
    });
    
  } catch (error) {
    console.error('Error fetching program requests:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
