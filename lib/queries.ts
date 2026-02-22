import { db } from "./db";
import { entries, feeds } from "./schema";
import { sql, eq, desc, gt } from "drizzle-orm";

export type FeedEntry = {
  id: number;
  feedId: number;
  feedTitle: string;
  title: string;
  link: string;
  content: string | null;
  author: string | null;
  upvotesCount: number;
  createdAt: Date;
  score: number;
};

export async function getBestEntries(): Promise<FeedEntry[]> {
  const sevenDaysAgo = sql`NOW() - INTERVAL '7 days'`;
  const scoreCalculation = sql<number>`
    LOG10(GREATEST(${entries.upvotesCount}, 1)) +
    (EXTRACT(EPOCH FROM (${entries.createdAt} - NOW())) / 45000)
  `;

  return db
    .select({
      id: entries.id,
      feedId: entries.feedId,
      feedTitle: feeds.title,
      title: entries.title,
      link: entries.link,
      content: entries.content,
      author: entries.author,
      upvotesCount: entries.upvotesCount,
      createdAt: entries.createdAt,
      score: scoreCalculation,
    })
    .from(entries)
    .innerJoin(feeds, eq(entries.feedId, feeds.id))
    .where(gt(entries.createdAt, sevenDaysAgo))
    .orderBy(desc(scoreCalculation))
    .limit(50);
}

export async function getEntriesByFeedId(feedId: number) {
  return db
    .select()
    .from(entries)
    .where(eq(entries.feedId, feedId))
    .limit(50);
}

export async function getFeedById(feedId: number) {
  const result = await db
    .select()
    .from(feeds)
    .where(eq(feeds.id, feedId))
    .limit(1);
  return result[0] ?? null;
}
