ALTER TABLE "entries" ADD COLUMN "upvotes_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
CREATE INDEX "entries_title_search_index" ON "entries" USING gin (to_tsvector('english', "title"));--> statement-breakpoint
CREATE INDEX "entries_link_search_index" ON "entries" USING gin (to_tsvector('english', "link"));--> statement-breakpoint
CREATE INDEX "entries_content_search_index" ON "entries" USING gin (to_tsvector('english', "content"));--> statement-breakpoint
CREATE INDEX "entries_author_search_index" ON "entries" USING gin (to_tsvector('english', "author"));--> statement-breakpoint
CREATE INDEX "feed_title_search_index" ON "feeds" USING gin (to_tsvector('english', "title"));--> statement-breakpoint
CREATE INDEX "feed_url_search_index" ON "feeds" USING gin (to_tsvector('english', "url"));--> statement-breakpoint
CREATE INDEX "feed_description_search_index" ON "feeds" USING gin (to_tsvector('english', "description"));