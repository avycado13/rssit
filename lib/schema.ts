import { pgTable, serial, text, varchar, timestamp, integer, pgEnum, index } from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";
import { createSelectSchema } from 'drizzle-zod';

export const FeedFormat = pgEnum("feed_format", ["rss", "atom", "json"]);

// === Feeds Table ===
export const feeds = pgTable("feeds", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  url: text("url").notNull().unique(),
  siteUrl: text("site_url"),
  description: text("description"),
  lastFetchedAt: timestamp("last_fetched_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  format: FeedFormat("format").notNull().default("rss")

}, (table) => [
  index('feed_title_search_index').using('gin', sql`to_tsvector('english', ${table.title})`),
  index('feed_url_search_index').using('gin', sql`to_tsvector('english', ${table.url})`),
  index('feed_description_search_index').using('gin', sql`to_tsvector('english', ${table.description})`),
]);

// === Entries Table ===
export const entries = pgTable("entries", {
  id: serial("id").primaryKey(),
  feedId: integer("feed_id")
    .notNull()
    .references(() => feeds.id, { onDelete: "cascade" }),
  guid: text("guid").notNull(), // often unique identifier from the RSS feed
  title: text("title").notNull(),
  link: text("link").notNull(),
  content: text("content"),
  author: varchar("author", { length: 255 }),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  upvotesCount: integer("upvotes_count").default(0).notNull(),
}, (table) => [
  index('entries_title_search_index').using('gin', sql`to_tsvector('english', ${table.title})`),
  index('entries_link_search_index').using('gin', sql`to_tsvector('english', ${table.link})`),
  index('entries_content_search_index').using('gin', sql`to_tsvector('english', ${table.content})`),
  index('entries_author_search_index').using('gin', sql`to_tsvector('english', ${table.author})`),

]);


// // === Comments Table ===
// export const comments = pgTable("comments", {
//   id: serial("id").primaryKey(),
//   entryId: integer("entry_id")
//     .notNull()
//     .references(() => entries.id, { onDelete: "cascade" }),
//   userId: varchar("user_id", { length: 64 }).notNull(), // replace with users table FK if you have one
//   content: text("content").notNull(),
//   parentId: integer("parent_id").references(() => comments.id, { onDelete: "cascade" }), // threaded comments
//   createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
// });

// === Upvotes Table ===
export const upvotes = pgTable("upvotes", {
  id: serial("id").primaryKey(),
  //   userId: varchar("user_id", { length: 64 }).notNull(),
  entryId: integer("entry_id").references(() => entries.id, { onDelete: "cascade" }),
  // commentId: integer("comment_id").references(() => comments.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// === Relations ===
export const feedsRelations = relations(feeds, ({ many }) => ({
  entries: many(entries),
}));

export const entriesRelations = relations(entries, ({ one, many }) => ({
  feed: one(feeds, { fields: [entries.feedId], references: [feeds.id] }),
  //   comments: many(comments),
  upvotes: many(upvotes),
}));

// export const commentsRelations = relations(comments, ({ one, many }) => ({
//   entry: one(entries, { fields: [comments.entryId], references: [entries.id] }),
//   parent: one(comments, { fields: [comments.parentId], references: [comments.id] }),
//   replies: many(comments),
//   upvotes: many(upvotes),
// }));

export const upvotesRelations = relations(upvotes, ({ one }) => ({
  entry: one(entries, { fields: [upvotes.entryId], references: [entries.id] }),
  //   comment: one(comments, { fields: [upvotes.commentId], references: [comments.id] }),
}));

export const Schema = {
  feeds: feeds,
  entries,
  //   comments,
  upvotes,
};

export const FeedSelectSchema = createSelectSchema(feeds);
export const EntrySelectSchema = createSelectSchema(entries);
// export const CommentSelectSchema = createSelectSchema(comments);
export const UpvoteSelectSchema = createSelectSchema(upvotes);