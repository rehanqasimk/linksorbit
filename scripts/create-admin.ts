const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const prisma = new PrismaClient();

async function createAdminUser() {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) {
    console.error('ADMIN_EMAIL environment variable is not set');
    process.exit(1);
  }

  try {
    // Check if admin user already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (existingAdmin) {
      console.log('Admin user already exists');
      process.exit(0);
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10); // Change this password!
    
    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        name: 'Admin User',
        role: 'ADMIN',
        status: 'ACTIVE',
      },
    });

    console.log('Admin user created successfully:', admin.email);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();
