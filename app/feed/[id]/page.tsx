"use client"

import Image from "next/image"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter,
} from "@/components/ui/card"
import { dehydrate, DehydratedState, HydrationBoundary, QueryClient, useQuery } from '@tanstack/react-query'


import { type Feed, type Entry } from "@/lib/types"
import { useCallback } from "react"

type FeedProps = {
    params: {
        id: string
    }
}

type ClientProps = {
    feedId: number
    dehydratedState: DehydratedState
}

export default function Feed({ params }: FeedProps) {
    const feedId = parseInt(params.id)
    const queryClient = new QueryClient()

    queryClient.prefetchQuery({
        queryKey: ['entries', feedId],
        queryFn: getFeedEntries,
    })

    queryClient.prefetchQuery({
        queryKey: ['feedinfo', feedId],
        queryFn: getFeedInfo,
    })

    const dehydratedState = dehydrate(queryClient)

    return (
        <HydrationBoundary state={dehydratedState}>
            <FeedPage feedId={feedId} dehydratedState={dehydratedState} />
        </HydrationBoundary>
    )
}

function FeedPage({ feedId }: ClientProps) {
    const { data: entries = null, isLoading } = useQuery({ queryKey: ['entries', feedId], queryFn: getFeedEntries })
    const { data: feedinfo = null } = useQuery({ queryKey: ['feedinfo', feedId], queryFn: getFeedInfo })

    const vote = useCallback((id: number, type: number) => {
        fetch(`/api/entries/${id}/vote`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ type }),
        }).catch((err) => {
            console.error('Failed to vote:', err);
        });
    }, [])

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black text-slate-900 dark:text-zinc-50">
            <header className="border-b bg-white dark:bg-black/20">
                <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Image src="/next.svg" alt="logo" width={36} height={24} className="dark:invert" />
                        <h1 className="text-lg font-semibold">rssit</h1>
                        <span className="text-sm text-muted-foreground">A simple reddit-style feed</span>
                    </div>
                    <nav className="flex items-center gap-3">
                        <Button variant="ghost" size="sm">New</Button>
                        <Button variant="outline" size="sm">Top</Button>
                    </nav>
                </div>
            </header>

            <main className="mx-auto max-w-6xl px-6 py-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
                <section className="lg:col-span-2 flex flex-col gap-6">


                    <div className="flex flex-col gap-4">
                        {isLoading ? (
                            <div className="p-4 text-center">Loading entries…</div>
                        ) : (
                            entries?.map((p) => (
                                <Card key={p.id} className="">
                                    <CardHeader className="flex items-start gap-4">
                                        <Avatar>
                                            {/* {p.avatar ? (
                        <AvatarImage src={p.avatar} alt={p.author} />
                      ) : ( */}
                                            <AvatarFallback>{p.author?.[0]?.toUpperCase() ?? "U"}</AvatarFallback>
                                            {/* )} */}
                                        </Avatar>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between gap-4">
                                                <div>
                                                    <div className="text-sm font-medium">{p.author}</div>
                                                    <div className="text-xs text-muted-foreground">{new Date(p.createdAt).toLocaleString()}</div>
                                                </div>
                                                {/* <div className="text-sm text-muted-foreground">{p.comments} comments</div> */}
                                            </div>
                                            <CardTitle className="mt-3">{p.title}</CardTitle>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <CardDescription>{p.content}</CardDescription>
                                    </CardContent>
                                    <CardFooter>
                                        <div className="flex items-center gap-2">
                                            <button
                                                aria-label="upvote"
                                                onClick={() => vote(p.id, 1)}
                                                className="rounded-md px-2 py-1 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-900"
                                            >
                                                ▲
                                            </button>
                                            <div className="text-sm font-medium">{p.upvotesCount}</div>
                                            <button
                                                aria-label="downvote"
                                                onClick={() => vote(p.id, -1)}
                                                className="rounded-md px-2 py-1 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-900"
                                            >
                                                ▼
                                            </button>
                                        </div>
                                    </CardFooter>
                                </Card>
                            ))
                        )}
                    </div>
                </section>

                <aside className="hidden lg:block">
                    <div className="sticky top-6 flex flex-col gap-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg font-semibold">
                                    {feedinfo?.title || "community"}
                                </CardTitle>
                                <CardDescription>
                                    {feedinfo?.description ? feedinfo.description : "Welcome to this feed! A place for discussions and sharing posts."}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex flex-col gap-3">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Members</span>
                                    <span className="font-medium">We don&apos;t know</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Online</span>
                                    <span className="font-medium">We don&apos;t know</span>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>Rules</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                                    <li>Be respectful and constructive</li>
                                    <li>No spam or self-promotion</li>
                                    <li>Keep discussions relevant to the topic</li>
                                </ul>
                            </CardContent>
                        </Card>
                    </div>
                </aside>
            </main>
        </div>
    )
}

async function getFeedEntries({ queryKey }: { queryKey: [string, number] }): Promise<Entry[]> {
    const [, feedId] = queryKey;
    try {
        const res = await fetch(`/api/entries/${feedId.toString()}`, {
            method: 'GET',
        });

        if (!res.ok) throw new Error("Network response was not ok");

        const data = await res.json();

        if (Array.isArray(data)) {
            return data as Entry[];
        }

        // fallback if data is not an array
        return [];
    } catch (err) {
        console.error("Failed to fetch feed posts:", err);
        return [];
    }
}

async function getFeedInfo({ queryKey }: { queryKey: [string, number] }): Promise<Feed | null> {
    const [, feedId] = queryKey;
    try {
        const res = await fetch(`/api/feedinfo/${feedId.toString()}`);
        if (!res.ok) throw new Error("Network response was not ok");

        const data = await res.json();

        if (data && typeof data.id === "number" && typeof data.title === "string" && typeof data.description === "string") {
            return data;
        }

        // fallback if data is not in the expected format
        return null;
    } catch (err) {
        console.error("Failed to fetch feed info:", err);
        return null;
    }
}
