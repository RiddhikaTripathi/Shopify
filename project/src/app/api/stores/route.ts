import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createStoreSchema = z.object({
  shopDomain: z.string().min(1),
  storeName: z.string().min(1),
  accessToken: z.string().min(1),
});

export async function GET(request: NextRequest) {
  try {
    const stores = await prisma.store.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        shopDomain: true,
        storeName: true,
        isActive: true,
        lastSyncAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ stores });
  } catch (error) {
    console.error('Error fetching stores:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stores' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = createStoreSchema.parse(body);

    const existingStore = await prisma.store.findUnique({
      where: { shopDomain: validated.shopDomain },
    });

    if (existingStore) {
      return NextResponse.json(
        { error: 'Store with this domain already exists' },
        { status: 400 }
      );
    }

    const store = await prisma.store.create({
      data: {
        shopDomain: validated.shopDomain,
        storeName: validated.storeName,
        accessToken: validated.accessToken,
      },
      select: {
        id: true,
        shopDomain: true,
        storeName: true,
        isActive: true,
        lastSyncAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ store }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating store:', error);
    return NextResponse.json(
      { error: 'Failed to create store' },
      { status: 500 }
    );
  }
}
