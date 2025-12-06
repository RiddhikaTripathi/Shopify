import { prisma } from '@/lib/prisma';
import { createShopifyClient } from '@/lib/shopify';
import { Prisma } from '@prisma/client';

export class IngestionService {
  private storeId: string;
  private shopifyClient: ReturnType<typeof createShopifyClient>;

  constructor(storeId: string, shop: string, accessToken: string) {
    this.storeId = storeId;
    this.shopifyClient = createShopifyClient({ shop, accessToken });
  }

  async syncProducts(): Promise<number> {
    let syncedCount = 0;
    let hasNextPage = true;
    let pageInfo: string | undefined;

    while (hasNextPage) {
      const query: Record<string, string> = { limit: '250' };
      if (pageInfo) {
        query.page_info = pageInfo;
      }

      const response = await this.shopifyClient.get({
        path: 'products',
        query,
      });

      const products = (response.body as any).products;

      for (const product of products) {
        await prisma.product.upsert({
          where: {
            storeId_shopifyId: {
              storeId: this.storeId,
              shopifyId: BigInt(product.id),
            },
          },
          create: {
            storeId: this.storeId,
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
        syncedCount++;
      }

      const linkHeader = response.headers['link'] as string | undefined;
      hasNextPage = linkHeader?.includes('rel="next"') || false;

      if (hasNextPage && linkHeader) {
        const match = linkHeader.match(/page_info=([^&>]+)/);
        pageInfo = match ? match[1] : undefined;
      }
    }

    return syncedCount;
  }

  async syncOrders(): Promise<number> {
    let syncedCount = 0;
    let hasNextPage = true;
    let pageInfo: string | undefined;

    while (hasNextPage) {
      const query: Record<string, string> = { limit: '250', status: 'any' };
      if (pageInfo) {
        query.page_info = pageInfo;
      }

      const response = await this.shopifyClient.get({
        path: 'orders',
        query,
      });

      const orders = (response.body as any).orders;

      for (const order of orders) {
        await prisma.order.upsert({
          where: {
            storeId_shopifyId: {
              storeId: this.storeId,
              shopifyId: BigInt(order.id),
            },
          },
          create: {
            storeId: this.storeId,
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
        syncedCount++;
      }

      const linkHeader = response.headers['link'] as string | undefined;
      hasNextPage = linkHeader?.includes('rel="next"') || false;

      if (hasNextPage && linkHeader) {
        const match = linkHeader.match(/page_info=([^&>]+)/);
        pageInfo = match ? match[1] : undefined;
      }
    }

    return syncedCount;
  }

  async syncCustomers(): Promise<number> {
    let syncedCount = 0;
    let hasNextPage = true;
    let pageInfo: string | undefined;

    while (hasNextPage) {
      const query: Record<string, string> = { limit: '250' };
      if (pageInfo) {
        query.page_info = pageInfo;
      }

      const response = await this.shopifyClient.get({
        path: 'customers',
        query,
      });

      const customers = (response.body as any).customers;

      for (const customer of customers) {
        await prisma.customer.upsert({
          where: {
            storeId_shopifyId: {
              storeId: this.storeId,
              shopifyId: BigInt(customer.id),
            },
          },
          create: {
            storeId: this.storeId,
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
        syncedCount++;
      }

      const linkHeader = response.headers['link'] as string | undefined;
      hasNextPage = linkHeader?.includes('rel="next"') || false;

      if (hasNextPage && linkHeader) {
        const match = linkHeader.match(/page_info=([^&>]+)/);
        pageInfo = match ? match[1] : undefined;
      }
    }

    return syncedCount;
  }
}
