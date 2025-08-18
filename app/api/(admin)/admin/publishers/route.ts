import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/auth';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    // Check if user is admin
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Get all publishers
    const publishers = await prisma.user.findMany({
      where: {
        role: 'USER',
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        name: true,
        email: true,
        website: true,
        status: true,
        siteId: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ publishers });
  } catch (error) {
    console.error('Error fetching publishers:', error);
    return NextResponse.json(
      { message: 'Error fetching publishers' },
      { status: 500 }
    );
  }
}
