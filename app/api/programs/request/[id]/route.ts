import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/auth';
import prisma from '@/lib/prisma';

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
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
    const { id } = params;
    const body = await req.json();
    const { status } = body;

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status. Must be APPROVED or REJECTED' }, { status: 400 });
    }

    const programRequest = await prisma.programRequest.findUnique({
      where: { id },
      include: { user: true, program: true },
    });

    if (!programRequest) {
      return NextResponse.json({ error: 'Program request not found' }, { status: 404 });
    }

    // Update program request status
    const updatedRequest = await prisma.programRequest.update({
      where: { id },
      data: { status },
      include: { program: true },
    });

    return NextResponse.json({
      success: true,
      message: `Program request ${status.toLowerCase()}`,
      programRequest: updatedRequest,
    });
    
  } catch (error) {
    console.error('Error updating program request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
