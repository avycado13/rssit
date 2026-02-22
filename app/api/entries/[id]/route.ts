import { getEntriesByFeedId } from "@/lib/queries";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  const entries = await getEntriesByFeedId(Number(id));
  return NextResponse.json(entries);
};
