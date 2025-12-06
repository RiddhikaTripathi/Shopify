import { NextRequest, NextResponse } from 'next/server';
import { SyncJobService } from '@/services/sync-job';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const syncJobService = new SyncJobService();

    await syncJobService.executeFullSync(params.id);

    return NextResponse.json({
      success: true,
      message: 'Sync completed successfully'
    });
  } catch (error) {
    console.error('Error syncing store:', error);
    return NextResponse.json(
      {
        error: 'Failed to sync store',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
