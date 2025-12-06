import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import crypto from 'crypto';

function verifyShopifyWebhook(body: string, hmac: string): boolean {
  const secret = process.env.SHOPIFY_API_SECRET;
  if (!secret) return false;

  const hash = crypto
    .createHmac('sha256', secret)
    .update(body, 'utf8')
    .digest('base64');

  return hash === hmac;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const hmac = request.headers.get('x-shopify-hmac-sha256');
    const topic = request.headers.get('x-shopify-topic');
    const shopDomain = request.headers.get('x-shopify-shop-domain');

    if (!hmac || !verifyShopifyWebhook(body, hmac)) {
      return NextResponse.json(
        { error: 'Invalid webhook signature' },
        { status: 401 }
      );
    }

    if (!shopDomain) {
      return NextResponse.json(
        { error: 'Missing shop domain' },
        { status: 400 }
      );
    }

    const store = await prisma.store.findUnique({
      where: { shopDomain },
    });

    if (!store) {
      return NextResponse.json(
        { error: 'Store not found' },
        { status: 404 }
      );
    }

    const data = JSON.parse(body);

    switch (topic) {
      case 'products/create':
      case 'products/update':
        await handleProductWebhook(store.id, data);
        break;
      case 'orders/create':
      case 'orders/updated':
        await handleOrderWebhook(store.id, data);
        break;
      case 'customers/create':
      case 'customers/update':
        await handleCustomerWebhook(store.id, data);
        break;
      default:
        console.log(`Unhandled webhook topic: ${topic}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handleProductWebhook(storeId: string, product: any) {
  await prisma.product.upsert({
    where: {
      storeId_shopifyId: {
        storeId,
        shopifyId: BigInt(product.id),
      },
    },
    create: {
      storeId,
      shopifyId: BigInt(product.id),
      title: product.title,
      vendor: product.vendor,
      productType: product.product_type,
      status: product.status,
      tags: product.tags ? product.tags.split(',').map((t: string) => t.trim()) : [],
      price: product.variants?.[0]?.price ? new Prisma.Decimal(product.variants[0].price) : null,
      inventoryQuantity: product.variants?.reduce((sum: number, v: any) => sum + (v.inventory_quantity || 0), 0) || 0,
    },
    update: {
      title: product.title,
      vendor: product.vendor,
      productType: product.product_type,
      status: product.status,
      tags: product.tags ? product.tags.split(',').map((t: string) => t.trim()) : [],
      price: product.variants?.[0]?.price ? new Prisma.Decimal(product.variants[0].price) : null,
      inventoryQuantity: product.variants?.reduce((sum: number, v: any) => sum + (v.inventory_quantity || 0), 0) || 0,
    },
  });
}

async function handleOrderWebhook(storeId: string, order: any) {
  await prisma.order.upsert({
    where: {
      storeId_shopifyId: {
        storeId,
        shopifyId: BigInt(order.id),
      },
    },
    create: {
      storeId,
      shopifyId: BigInt(order.id),
      orderNumber: order.order_number?.toString() || order.name,
      email: order.email,
      totalPrice: new Prisma.Decimal(order.total_price),
      subtotalPrice: order.subtotal_price ? new Prisma.Decimal(order.subtotal_price) : null,
      totalTax: order.total_tax ? new Prisma.Decimal(order.total_tax) : null,
      financialStatus: order.financial_status,
      fulfillmentStatus: order.fulfillment_status,
      currency: order.currency,
      createdAt: new Date(order.created_at),
    },
    update: {
      orderNumber: order.order_number?.toString() || order.name,
      email: order.email,
      totalPrice: new Prisma.Decimal(order.total_price),
      subtotalPrice: order.subtotal_price ? new Prisma.Decimal(order.subtotal_price) : null,
      totalTax: order.total_tax ? new Prisma.Decimal(order.total_tax) : null,
      financialStatus: order.financial_status,
      fulfillmentStatus: order.fulfillment_status,
      currency: order.currency,
    },
  });
}

async function handleCustomerWebhook(storeId: string, customer: any) {
  await prisma.customer.upsert({
    where: {
      storeId_shopifyId: {
        storeId,
        shopifyId: BigInt(customer.id),
      },
    },
    create: {
      storeId,
      shopifyId: BigInt(customer.id),
      email: customer.email,
      firstName: customer.first_name,
      lastName: customer.last_name,
      totalSpent: customer.total_spent ? new Prisma.Decimal(customer.total_spent) : new Prisma.Decimal(0),
      ordersCount: customer.orders_count || 0,
      state: customer.state,
      createdAt: new Date(customer.created_at),
    },
    update: {
      email: customer.email,
      firstName: customer.first_name,
      lastName: customer.last_name,
      totalSpent: customer.total_spent ? new Prisma.Decimal(customer.total_spent) : new Prisma.Decimal(0),
      ordersCount: customer.orders_count || 0,
      state: customer.state,
    },
  });
}
