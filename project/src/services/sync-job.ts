import { prisma } from '@/lib/prisma';
import { IngestionService } from './ingestion';
import { AnalyticsService } from './analytics';

export class SyncJobService {
  async createJob(storeId: string, jobType: string) {
    return await prisma.syncJob.create({
      data: {
        storeId,
        jobType,
        status: 'pending',
      },
    });
  }

  async startJob(jobId: string) {
    await prisma.syncJob.update({
      where: { id: jobId },
      data: {
        status: 'running',
        startedAt: new Date(),
      },
    });
  }

  async completeJob(jobId: string, recordsSynced: number) {
    await prisma.syncJob.update({
      where: { id: jobId },
      data: {
        status: 'completed',
        completedAt: new Date(),
        recordsSynced,
      },
    });
  }

  async failJob(jobId: string, errorMessage: string) {
    await prisma.syncJob.update({
      where: { id: jobId },
      data: {
        status: 'failed',
        completedAt: new Date(),
        errorMessage,
      },
    });
  }

  async executeFullSync(storeId: string): Promise<void> {
    const store = await prisma.store.findUnique({
      where: { id: storeId },
    });

    if (!store) {
      throw new Error('Store not found');
    }

    const ingestion = new IngestionService(storeId, store.shopDomain, store.accessToken);
    const analytics = new AnalyticsService();

    const jobTypes = ['products', 'orders', 'customers'];

    for (const jobType of jobTypes) {
      const job = await this.createJob(storeId, jobType);

      try {
        await this.startJob(job.id);

        let recordsSynced = 0;

        switch (jobType) {
          case 'products':
            recordsSynced = await ingestion.syncProducts();
            break;
          case 'orders':
            recordsSynced = await ingestion.syncOrders();
            break;
          case 'customers':
            recordsSynced = await ingestion.syncCustomers();
            break;
        }

        await this.completeJob(job.id, recordsSynced);
      } catch (error) {
        await this.failJob(job.id, error instanceof Error ? error.message : 'Unknown error');
        throw error;
      }
    }

    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      await analytics.computeDailyAnalytics(storeId, date);
    }

    await prisma.store.update({
      where: { id: storeId },
      data: { lastSyncAt: new Date() },
    });
  }

  async getRecentJobs(storeId: string, limit: number = 10) {
    return await prisma.syncJob.findMany({
      where: { storeId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}
