import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth';

const prisma = new PrismaClient();

export async function PATCH(
  request: Request,
  { params }: { params: { publisherId: string } }
) {
  try {
    // Check if user is admin
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { siteId } = await request.json();
    const publisherId = params.publisherId;
    
    if (!siteId) {
      return NextResponse.json({ message: 'Site ID is required' }, { status: 400 });
    }
    
    // Check if site ID is already assigned to another user
    const existingUser = await prisma.user.findUnique({
      where: { siteId },
    });
    
    if (existingUser && existingUser.id !== publisherId) {
      return NextResponse.json(
        { message: 'Site ID is already assigned to another user' },
        { status: 400 }
      );
    }

    // Update publisher's site ID and set status to ACTIVE
    const publisher = await prisma.user.update({
      where: { id: publisherId },
      data: { 
        siteId,
        status: 'ACTIVE' 
      },
    });

    return NextResponse.json({ 
      message: 'Site ID updated successfully',
      publisher 
    });
  } catch (error) {
    console.error('Error updating site ID:', error);
    return NextResponse.json(
      { message: 'Error updating site ID' },
      { status: 500 }
    );
  }
}
