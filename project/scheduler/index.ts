import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';
import { SyncJobService } from '../src/services/sync-job';
import { AnalyticsService } from '../src/services/analytics';

const prisma = new PrismaClient();

console.log('Starting Shopify Analytics Scheduler...');

cron.schedule('0 */6 * * *', async () => {
  console.log('Running scheduled sync job...');

  try {
    const stores = await prisma.store.findMany({
      where: { isActive: true },
    });

    console.log(`Found ${stores.length} active stores to sync`);

    const syncJobService = new SyncJobService();
    const analyticsService = new AnalyticsService();

    for (const store of stores) {
      try {
        console.log(`Syncing store: ${store.storeName} (${store.shopDomain})`);
        await syncJobService.executeFullSync(store.id);

        const today = new Date();
        for (let i = 0; i < 7; i++) {
          const date = new Date(today);
          date.setDate(date.getDate() - i);
          await analyticsService.computeDailyAnalytics(store.id, date);
        }

        console.log(`Successfully synced store: ${store.storeName}`);
      } catch (error) {
        console.error(`Failed to sync store ${store.storeName}:`, error);
      }
    }

    console.log('Scheduled sync job completed');
  } catch (error) {
    console.error('Scheduler error:', error);
  }
});

cron.schedule('0 1 * * *', async () => {
  console.log('Running daily analytics computation...');

  try {
    const stores = await prisma.store.findMany({
      where: { isActive: true },
    });

    const analyticsService = new AnalyticsService();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    for (const store of stores) {
      try {
        console.log(`Computing analytics for store: ${store.storeName}`);
        await analyticsService.computeDailyAnalytics(store.id, yesterday);
      } catch (error) {
        console.error(`Failed to compute analytics for ${store.storeName}:`, error);
      }
    }

    console.log('Daily analytics computation completed');
  } catch (error) {
    console.error('Analytics computation error:', error);
  }
});

process.on('SIGINT', async () => {
  console.log('Shutting down scheduler...');
  await prisma.$disconnect();
  process.exit(0);
});

console.log('Scheduler is running...');
console.log('- Full sync: Every 6 hours');
console.log('- Analytics computation: Daily at 1:00 AM');
