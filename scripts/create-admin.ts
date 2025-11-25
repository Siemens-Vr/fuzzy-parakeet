import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdminUser() {
  const email = 'admin@example.com';
  const password = 'admin123'; // Change this!
  const hashedPassword = await bcrypt.hash(password, 12);

  try {
    // Check if admin already exists
    const existing = await prisma.user.findUnique({
      where: { email }
    });

    if (existing) {
      console.log('Admin user already exists');
      return;
    }

    // Create admin user with reviewer profile
    const admin = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: 'Admin User',
        role: 'ADMIN',
        emailVerified: true,
        reviewer: {
          create: {
            department: 'Quality Assurance',
            level: 3
          }
        }
      },
      include: {
        reviewer: true
      }
    });

    console.log('Admin user created successfully:');
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('User ID:', admin.id);
    console.log('Reviewer ID:', admin.reviewer?.id);

  } catch (error) {
    console.error('Error creating admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();