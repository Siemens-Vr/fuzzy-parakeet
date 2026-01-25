// 
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { sendVerificationEmail } from '@/lib/email';
import { generateToken } from '@/lib/utils';

export async function POST(req: NextRequest) {
  try {
    const { email, password, name } = await req.json();

    // Validation
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
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

    // Create user with USER role
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: 'USER',
        emailVerified: false,
        verifyToken,
      }
    });

    // Send verification email
    let emailSent = false;
    try {
      console.log(`[UserRegister] Attempting to send verification email to: ${email}`);
      console.log(`[UserRegister] Token: ${verifyToken}`);
      await sendVerificationEmail(email, verifyToken);
      console.log(`[UserRegister] Email sent successfully via nodemailer`);
      emailSent = true;
    } catch (emailError) {
      console.error('[UserRegister] Failed to send verification email:', emailError);
    }

    return NextResponse.json({
      message: 'Registration successful. Please check your email.',
      userId: user.id,
      emailSent
    });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    );
  }
}

