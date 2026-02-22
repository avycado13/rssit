"use client"

import { Avatar, AvatarFallback } from "./ui/avatar";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "./ui/card";
import { type FeedEntry } from "@/lib/queries";
import Link from "next/link";

async function getFeedEntries(): Promise<FeedEntry[]> {
  const res = await fetch("/api/feedentries");
  if (!res.ok) throw new Error("Failed to fetch feed entries");
  return res.json();
}

export function FeedList() {
  const queryClient = useQueryClient();
  const { data: entries = [], isLoading } = useQuery({
    queryKey: ['feedentries'],
    queryFn: getFeedEntries,
  });

  const voteMutation = useMutation({
    mutationFn: async ({ id, type }: { id: number; type: number }) => {
      const res = await fetch(`/api/entries/${id}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      });
      if (!res.ok) throw new Error('Failed to vote');
    },
    onMutate: async ({ id, type }) => {
      await queryClient.cancelQueries({ queryKey: ['feedentries'] });
      const previous = queryClient.getQueryData<FeedEntry[]>(['feedentries']);
      queryClient.setQueryData<FeedEntry[]>(['feedentries'], (old) =>
        old?.map((e) =>
          e.id === id ? { ...e, upvotesCount: e.upvotesCount + type } : e
        )
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['feedentries'], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['feedentries'] });
    },
  });

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-full bg-muted" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-24 rounded bg-muted" />
                <div className="h-5 w-3/4 rounded bg-muted" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-4 w-full rounded bg-muted" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">No entries yet. Add a feed to get started!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {entries.map((p) => (
        <Card key={p.id}>
          <CardHeader className="flex items-start gap-4">
            <Avatar>
              <AvatarFallback>{p.author?.[0]?.toUpperCase() ?? "U"}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-medium">{p.author ?? p.feedTitle}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(p.createdAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </div>
                </div>
                <Link
                  href={`/feed/${p.feedId}`}
                  className="text-xs text-muted-foreground hover:underline"
                >
                  {p.feedTitle}
                </Link>
              </div>
              <CardTitle className="mt-3">
                <a href={p.link} target="_blank" rel="noopener noreferrer" className="hover:underline">
                  {p.title}
                </a>
              </CardTitle>
            </div>
          </CardHeader>
          {p.content && (
            <CardContent>
              <CardDescription className="line-clamp-3">{p.content}</CardDescription>
            </CardContent>
          )}
          <CardFooter>
            <div className="flex items-center gap-2">
              <button
                aria-label="upvote"
                onClick={() => voteMutation.mutate({ id: p.id, type: 1 })}
                className="rounded-md px-2 py-1 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
              >
                ▲
              </button>
              <div className="text-sm font-medium">{p.upvotesCount}</div>
              <button
                aria-label="downvote"
                onClick={() => voteMutation.mutate({ id: p.id, type: -1 })}
                className="rounded-md px-2 py-1 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
              >
                ▼
              </button>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
