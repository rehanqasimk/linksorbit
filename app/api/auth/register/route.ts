import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { sendNewPublisherNotification } from '@/lib/email';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { email, password, name, website } = await req.json();

    // Validate input
    if (!email || !password || !name || !website) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        website,
        status: 'PENDING', // All new users start with pending status
        role: 'USER',
      },
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    // Send notification email to admin
    await sendNewPublisherNotification({
      name: user.name,
      email: user.email,
      website: user.website,
    });

    return NextResponse.json(
      { message: 'User registered successfully', user: userWithoutPassword },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { message: 'Error creating user' },
      { status: 500 }
    );
  }
}
