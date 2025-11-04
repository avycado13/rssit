import { db } from "@/lib/db";
import { entries, feeds } from "@/lib/schema";
import { sql, eq, desc, gt } from "drizzle-orm";
import { NextResponse } from "next/server";

export const GET = async (req: Request) => {
  const sevenDaysAgo = sql`NOW() - INTERVAL '7 days'`;

  const scoreCalculation = sql<number>`
    LOG10(GREATEST(${entries.upvotesCount}, 1)) +
    (EXTRACT(EPOCH FROM (${entries.createdAt} - NOW())) / 45000)
  `;

  const bestEntries = await db
    .select({
      id: entries.id,
      feedId: entries.feedId,
      feedTitle: feeds.title,
      entryTitle: entries.title,
      url: entries.link,
      content: entries.content,
      upvotes: entries.upvotesCount,
      createdAt: entries.createdAt,
      score: scoreCalculation,
    })
    .from(entries)
    .innerJoin(feeds, eq(entries.feedId, feeds.id))
    .where(gt(entries.createdAt, sevenDaysAgo))
    .orderBy(desc(scoreCalculation))
    .limit(50);
  return NextResponse.json(bestEntries);
};
