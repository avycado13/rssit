"use client"

import Image from "next/image"
import { Avatar, AvatarFallback } from "../components/ui/avatar"
import { Button } from "../components/ui/button"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "../components/ui/card"
import { DehydratedState } from '@tanstack/react-query';
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
  useQuery,
} from '@tanstack/react-query'
import { Entry } from "@/lib/types"


export async function getServerSideProps() {
  const queryClient = new QueryClient()

  await queryClient.prefetchQuery({
    queryKey: ['feedentries'],
    queryFn: getFeedEntries,
  })

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
  }
}

type HomeProps = {
  dehydratedState: DehydratedState
}

export default function Home({ dehydratedState }: HomeProps) {
  const { data: entries = [], isLoading } = useQuery({ queryKey: ['entries'], queryFn: getFeedEntries })


  function vote(id: number, type: number) {
    fetch(`/api/entries/${id}/vote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ type }),
    }).catch((err) => {
      console.error('Failed to vote:', err);
    });
  }


  return (
    <HydrationBoundary state={dehydratedState}>
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
                  <CardTitle>Rules</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc pl-5 text-sm text-muted-foreground">
                    <li>Be kind</li>
                    <li>No spam</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </aside>
        </main>
      </div>
    </HydrationBoundary>
  )
}
async function getFeedEntries(): Promise<Entry[]> {
  try {
    const res = await fetch("/api/feedentries");
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
