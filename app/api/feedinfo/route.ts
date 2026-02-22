import { db } from "@/lib/db";
import { feeds as feedsTable } from "@/lib/schema";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json();
    const { title, url, siteUrl, description, format } = body;

    if (!title || !url) {
      return NextResponse.json(
        { error: "Title and URL are required" },
        { status: 400 }
      );
    }

    const newFeed = await db
      .insert(feedsTable)
      .values({
        title,
        url,
        siteUrl,
        description,
        format: format || "rss",
      })
      .returning();

    return NextResponse.json(newFeed[0], { status: 201 });
  } catch (error: unknown) {
    // Handle unique constraint violation for URL
    if (error instanceof Error && 'code' in error && error.code === "23505") {
      return NextResponse.json(
        { error: "A feed with this URL already exists" },
        { status: 409 }
      );
    }

    console.error("Error creating feed:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
};
