import { db } from "@/lib/db";
import { feeds as feedsTable} from "@/lib/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";


interface Props {
  params: { feedId: string };
}

export const GET = async (req: NextRequest, { params }: Props) => {
    const feed = await db.select().from(feedsTable).where(eq(feedsTable.id, Number(params.feedId))).limit(1);
    return NextResponse.json(feed);
};