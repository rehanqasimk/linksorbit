import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth';
import { sendStatusUpdateEmail } from '@/lib/email';
import prisma from '@/lib/prisma';

export async function PATCH(
  request: Request,
  context: { params: Promise<{ publisherId: string }> }
) {
  try {
    // Check if user is admin
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { status } = await request.json();
    const params = await context.params;
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

    // Send email notification without awaiting (fire and forget)
    // This will make the API return faster
    sendStatusUpdateEmail(
      publisher.email || '',
      publisher.name || 'Publisher',
      status
    ).catch(err => {
      console.error('Error sending email (background):', err);
    });
    
    return NextResponse.json({ 
      message: 'Status updated successfully',
      previousStatus,
      currentStatus: status
    });
  } catch (error) {
    console.error('Error updating publisher status:', error);
    return NextResponse.json(
      { message: 'Error updating publisher status' },
      { status: 500 }
    );
  }
}
