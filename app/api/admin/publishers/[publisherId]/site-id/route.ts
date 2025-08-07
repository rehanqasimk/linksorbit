import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';

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

    // Update publisher's site ID
    const publisher = await prisma.user.update({
      where: { id: publisherId },
      data: { siteId },
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
