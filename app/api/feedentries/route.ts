import { getBestEntries } from "@/lib/queries";
import { NextResponse } from "next/server";

export const GET = async () => {
  const bestEntries = await getBestEntries();
  return NextResponse.json(bestEntries);
};
