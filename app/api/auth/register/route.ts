import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import bcrypt from 'bcrypt';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, website } = body;

    // Validate input
    if (!name || !email || !password || !website) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check for existing user
    const existing = await prisma.publisher.findUnique({
      where: { email },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      );
    }

    // Create new publisher
    const hashedPassword = await bcrypt.hash(password, 10);
    const publisher = await prisma.publisher.create({
      data: {
        name,
        email,
        password: hashedPassword,
        website,
        status: 'PENDING',
      },
    });

    const { password: _, ...publisherWithoutPassword } = publisher;

    return NextResponse.json(
      {
        success: true,
        message: 'Registration successful. Waiting for admin approval.',
        publisher: publisherWithoutPassword,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Failed to register publisher' },
      { status: 500 }
    );
  }
}
