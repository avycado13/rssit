import { indexFeeds } from '@/app/workflows/indexfeeds';
import { start } from 'workflow/api';

export async function POST() {
    console.log('Index feed workflow triggered');
    await start(indexFeeds);
    return new Response('Indexing started', { status: 200 });
}