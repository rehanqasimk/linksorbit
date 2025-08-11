import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth';
import { sendStatusUpdateEmail } from '@/lib/email';

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

    const { status } = await request.json();
    const publisherId = params.publisherId;

    // Get the publisher's current status first
    const existingPublisher = await prisma.user.findUnique({
      where: { id: publisherId }
    });
    
    if (!existingPublisher) {
      return NextResponse.json({ message: 'Publisher not found' }, { status: 404 });
    }
    
    const previousStatus = existingPublisher.status;
    
    // Update publisher status
    const publisher = await prisma.user.update({
      where: { id: publisherId },
      data: { status },
    });

    // Send email notification
    await sendStatusUpdateEmail(
      publisher.email || '',
      publisher.name || 'Publisher',
      status
    );
    
    return NextResponse.json({ 
      message: 'Status updated successfully',
      previousStatus,
      currentStatus: status
    });

    return NextResponse.json({ message: 'Status updated successfully' });
  } catch (error) {
    console.error('Error updating publisher status:', error);
    return NextResponse.json(
      { message: 'Error updating publisher status' },
      { status: 500 }
    );
  }
}
