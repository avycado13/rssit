"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { type Feed, type Entry } from "@/lib/types";
import Link from "next/link";

export function FeedPageContent({ feedId }: { feedId: number }) {
  const queryClient = useQueryClient();

  const { data: entries = [], isLoading } = useQuery<Entry[]>({
    queryKey: ["entries", feedId],
    queryFn: async () => {
      const res = await fetch(`/api/entries/${feedId}`);
      if (!res.ok) throw new Error("Failed to fetch entries");
      return res.json();
    },
  });

  const { data: feedinfo = null } = useQuery<Feed | null>({
    queryKey: ["feedinfo", feedId],
    queryFn: async () => {
      const res = await fetch(`/api/feedinfo/${feedId}`);
      if (!res.ok) throw new Error("Failed to fetch feed info");
      return res.json();
    },
  });

  const voteMutation = useMutation({
    mutationFn: async ({ id, type }: { id: number; type: number }) => {
      const res = await fetch(`/api/entries/${id}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });
      if (!res.ok) throw new Error("Failed to vote");
    },
    onMutate: async ({ id, type }) => {
      await queryClient.cancelQueries({ queryKey: ["entries", feedId] });
      const previous = queryClient.getQueryData<Entry[]>(["entries", feedId]);
      queryClient.setQueryData<Entry[]>(["entries", feedId], (old) =>
        old?.map((e) =>
          e.id === id ? { ...e, upvotesCount: e.upvotesCount + type } : e
        )
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["entries", feedId], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["entries", feedId] });
    },
  });

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black text-slate-900 dark:text-zinc-50">
      <header className="border-b bg-white dark:bg-black/20">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/">
              <h1 className="text-lg font-semibold">rssit</h1>
            </Link>
            <span className="text-sm text-muted-foreground hidden sm:inline">
              {feedinfo?.title ?? "Feed"}
            </span>
          </div>
          <nav className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/">← Home</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="lg:col-span-2 flex flex-col gap-6">
          {isLoading ? (
            <div className="flex flex-col gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-5 w-3/4 rounded bg-muted" />
                  </CardHeader>
                  <CardContent>
                    <div className="h-4 w-full rounded bg-muted" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : entries.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No entries in this feed yet.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="flex flex-col gap-4">
              {entries.map((p) => (
                <Card key={p.id}>
                  <CardHeader className="flex items-start gap-4">
                    <Avatar>
                      <AvatarFallback>
                        {p.author?.[0]?.toUpperCase() ?? "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <div className="text-sm font-medium">{p.author}</div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(p.createdAt).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </div>
                        </div>
                      </div>
                      <CardTitle className="mt-3">
                        <a
                          href={p.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline"
                        >
                          {p.title}
                        </a>
                      </CardTitle>
                    </div>
                  </CardHeader>
                  {p.content && (
                    <CardContent>
                      <CardDescription className="line-clamp-3">
                        {p.content}
                      </CardDescription>
                    </CardContent>
                  )}
                  <CardFooter>
                    <div className="flex items-center gap-2">
                      <button
                        aria-label="upvote"
                        onClick={() =>
                          voteMutation.mutate({ id: p.id, type: 1 })
                        }
                        className="rounded-md px-2 py-1 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                      >
                        ▲
                      </button>
                      <div className="text-sm font-medium">
                        {p.upvotesCount}
                      </div>
                      <button
                        aria-label="downvote"
                        onClick={() =>
                          voteMutation.mutate({ id: p.id, type: -1 })
                        }
                        className="rounded-md px-2 py-1 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                      >
                        ▼
                      </button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </section>

        <aside className="hidden lg:block">
          <div className="sticky top-6 flex flex-col gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">
                  {feedinfo?.title ?? "Feed"}
                </CardTitle>
                <CardDescription>
                  {feedinfo?.description ??
                    "Welcome to this feed! A place for discussions and sharing posts."}
                </CardDescription>
              </CardHeader>
              {feedinfo?.siteUrl && (
                <CardContent>
                  <a
                    href={feedinfo.siteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    Visit site →
                  </a>
                </CardContent>
              )}
            </Card>
          </div>
        </aside>
      </main>
    </div>
  );
}
