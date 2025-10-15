// src/app/api/seed-production/route.ts
// Production database seeding endpoint
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    console.log('🌱 Starting production database seed...');

    // Check if tenant already exists
    let tenant = await prisma.tenant.findUnique({
      where: { slug: 'digiwize' },
    });

    if (!tenant) {
      // Create tenant
      tenant = await prisma.tenant.create({
        data: {
          name: 'Digiwize Logistics',
          slug: 'digiwize',
          settings: JSON.stringify({
            theme: 'blue',
            features: {
              alpr: true,
              biometrics: true,
              whatsapp: true,
            },
          }),
        },
      });
      console.log('✅ Created tenant:', tenant.name);
    } else {
      console.log('✅ Tenant already exists:', tenant.name);
    }

    // Check if admin user already exists
    let adminUser = await prisma.user.findUnique({
      where: { email: 'admin@digiwize.com' },
    });

    if (!adminUser) {
      // Create admin user
      const passwordHash = await bcrypt.hash('admin123', 12);
      adminUser = await prisma.user.create({
        data: {
          tenantId: tenant.id,
          email: 'admin@digiwize.com',
          passwordHash,
          role: 'ADMIN',
        },
      });
      console.log('✅ Created admin user:', adminUser.email);
    } else {
      console.log('✅ Admin user already exists:', adminUser.email);
    }

    return NextResponse.json({
      success: true,
      message: 'Production database seeded successfully',
      data: {
        tenant: {
          id: tenant.id,
          name: tenant.name,
          slug: tenant.slug,
        },
        user: {
          id: adminUser.id,
          email: adminUser.email,
          role: adminUser.role,
        },
      },
    });

  } catch (error) {
    console.error('❌ Production seed failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        details: error,
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function GET() {
  try {
    // Check if admin user exists
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@digiwize.com' },
      include: { tenant: true },
    });

    return NextResponse.json({
      success: true,
      adminUserExists: !!adminUser,
      adminUser: adminUser ? {
        id: adminUser.id,
        email: adminUser.email,
        role: adminUser.role,
        tenant: adminUser.tenant.slug,
      } : null,
    });

  } catch (error) {
    console.error('❌ Check failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
