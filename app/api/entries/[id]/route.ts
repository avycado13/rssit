import { db } from "@/lib/db";
import { entries as entriesTable} from "@/lib/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";


interface Props {
  params: { id: string };
}

export const GET = async (req: NextRequest, { params }: Props) => {
    const entries = await db.select().from(entriesTable).where(eq(entriesTable.feedId, Number(params.id))).limit(10);
    return NextResponse.json(entries);
};