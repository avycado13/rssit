import { db } from "@/lib/db";
import { entries, upvotes } from "@/lib/schema";
import { eq, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  const entryId = Number(id);
  const { type } = (await req.json()) as { type: number };

  if (type !== 1 && type !== -1) {
    return NextResponse.json({ error: "Invalid vote type" }, { status: 400 });
  }

  await db.insert(upvotes).values({ entryId });
  await db
    .update(entries)
    .set({ upvotesCount: sql`${entries.upvotesCount} + ${type}` })
    .where(eq(entries.id, entryId));

  return NextResponse.json({ success: true });
};
