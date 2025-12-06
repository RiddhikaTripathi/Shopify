import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { startOfDay, endOfDay } from 'date-fns';

export class AnalyticsService {
  async computeDailyAnalytics(storeId: string, date: Date): Promise<void> {
    const dayStart = startOfDay(date);
    const dayEnd = endOfDay(date);

    const ordersForDay = await prisma.order.findMany({
      where: {
        storeId,
        createdAt: {
          gte: dayStart,
          lte: dayEnd,
        },
      },
    });

    const customersForDay = await prisma.customer.findMany({
      where: {
        storeId,
        createdAt: {
          gte: dayStart,
          lte: dayEnd,
        },
      },
    });

    const totalOrders = ordersForDay.length;
    const totalRevenue = ordersForDay.reduce(
      (sum, order) => sum + parseFloat(order.totalPrice.toString()),
      0
    );
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const newCustomers = customersForDay.length;

    await prisma.analyticsDaily.upsert({
      where: {
        storeId_date: {
          storeId,
          date: dayStart,
        },
      },
      create: {
        storeId,
        date: dayStart,
        totalOrders,
        totalRevenue: new Prisma.Decimal(totalRevenue),
        averageOrderValue: new Prisma.Decimal(averageOrderValue),
        newCustomers,
      },
      update: {
        totalOrders,
        totalRevenue: new Prisma.Decimal(totalRevenue),
        averageOrderValue: new Prisma.Decimal(averageOrderValue),
        newCustomers,
      },
    });
  }

  async getAnalyticsSummary(storeId: string, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const analytics = await prisma.analyticsDaily.findMany({
      where: {
        storeId,
        date: {
          gte: startDate,
        },
      },
      orderBy: {
        date: 'asc',
      },
    });

    const totalRevenue = analytics.reduce(
      (sum, day) => sum + parseFloat(day.totalRevenue.toString()),
      0
    );

    const totalOrders = analytics.reduce((sum, day) => sum + day.totalOrders, 0);

    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const totalNewCustomers = analytics.reduce((sum, day) => sum + day.newCustomers, 0);

    return {
      analytics,
      summary: {
        totalRevenue,
        totalOrders,
        averageOrderValue,
        totalNewCustomers,
      },
    };
  }
}
