import { indexFeeds } from '@/app/workflows/indexfeeds';
import { start } from 'workflow/api';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await start(indexFeeds);
  return NextResponse.json({ message: 'Indexing started' });
}
