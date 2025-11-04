import { db } from "@/lib/db";
import { entries, feeds } from "@/lib/schema";
import { parseFeed } from "feedsmith";

interface ParsedFeedItem {
    id?: string;
    guid?: { value?: string; isPermaLink?: boolean };
    title?: string;
    link?: string;
    external_url?: string;
    content?: { encoded?: string } | string | Array<string | { encoded?: string }>;
    content_html?: string;
    links?: Array<{ href?: string }>;
}

interface ParsedFeed {
    format: string;
    feed?: {
        items?: ParsedFeedItem[];
        entries?: ParsedFeedItem[];
    };
}

async function getFeeds() {
    "use step"; 
    return await db.query.feeds.findMany();
}

async function fetchAndParseFeed(feed: typeof feeds.$inferSelect): Promise<ParsedFeed | null> {
    "use step"; 
    console.log("Processing feed:", feed.title);

    try {
        const feedContent = await fetch(feed.url).then((res) => res.text());
        let parsedFeed: ParsedFeed;
        try {
            parsedFeed = parseFeed(feedContent) as ParsedFeed;
        } catch (error) {
            console.error("Error parsing feed content:", feed.url, error);
            return null; // Return null to indicate parsing failed
        }
        return parsedFeed;
    } catch (error) {
        console.error("Error parsing feed:", feed.url, error);
        return null; // Return null to indicate fetching failed
    }
}

async function processFeedItems(parsedFeed: ParsedFeed, feedId: number) {
    "use step"; 
    if (!parsedFeed || !parsedFeed.feed) return;

    if (parsedFeed.format === "rss") {
        for (const item of parsedFeed.feed?.items || []) {
            await processItem(item, feedId, "rss");
        }
    } else if (parsedFeed.format === "json") {
        for (const item of parsedFeed.feed?.items || []) {
            await processItem(item, feedId, "json");
        }
    } else if (parsedFeed.format === "atom") {
        for (const item of parsedFeed.feed?.entries || []) {
            await processItem(item, feedId, "atom");
        }
    }
}

async function processItem(item: ParsedFeedItem, feedId: number, format: string) {
    "use step"; 
    let guid: string;
    let title: string;
    let link: string;
    let content: string;

    // Normalize item data based on format
    switch (format) {
        case "rss":
            guid = item.guid?.value || "";
            title = item.title || "No title";
            link = item.link || "";
            content = (typeof item.content === 'object' && !Array.isArray(item.content) && item.content?.encoded) || "";
            break;
        case "json":
            guid = item.id || "";
            title = item.title || "No title";
            link = item.external_url || "";
            content = item.content_html || "";
            break;
        case "atom":
            guid = item.id || "";
            title = item.title || "No title";
            link = item.links?.[0]?.href || "";
            if (typeof item.content === 'string') {
                content = item.content;
            } else if (Array.isArray(item.content) && item.content.length > 0) {
                const firstContent = item.content[0];
                content = (typeof firstContent === 'string' ? firstContent : firstContent?.encoded) || "";
            } else {
                content = "";
            }
            break;
        default:
            return; // Unknown format, skip
    }

    // Check if entry already exists
    const existingEntry = await db.query.entries.findFirst({
        where: (entries, { eq }) => eq(entries.guid, guid),
    });

    if (!existingEntry) {
        // Insert new entry
        await db.insert(entries).values({
            feedId,
            guid,
            title,
            link,
            content,
        });
    }
}

export async function indexFeeds(): Promise<void> {
    "use workflow";

    const feedsList = await getFeeds();

    for (const feed of feedsList) {
        const parsedFeed = await fetchAndParseFeed(feed);
        if (parsedFeed) {
            await processFeedItems(parsedFeed, feed.id);
        }
    }
}
