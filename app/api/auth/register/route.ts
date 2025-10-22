import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { sendVerificationEmail } from '@/lib/email';
import { generateToken } from '@/lib/utils';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, name, company, organizationName, websiteUrl } = body;

    // Validation
    if (!email || !password || !name || !organizationName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    const verifyToken = generateToken();

    // Create user and developer profile
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        company,
        verifyToken,
        developer: {
          create: {
            organizationName,
            websiteUrl
          }
        }
      },
      include: {
        developer: true
      }
    });

    // Send verification email
    await sendVerificationEmail(email, verifyToken);

    return NextResponse.json({
      message: 'Registration successful. Please check your email to verify your account.',
      userId: user.id
    });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    );
  }
}