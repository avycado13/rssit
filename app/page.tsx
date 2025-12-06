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
import { AddFeedDialog } from "@/components/add-feed-dialog"
import React from "react";
import { FeedList, getFeedEntries } from "@/components/feed-list";





export default async function Home() {
  const queryClient = new QueryClient()

  await queryClient.prefetchQuery({
    queryKey: ['feedentries'],
    queryFn: getFeedEntries,
  })

  const dehydratedState = dehydrate(queryClient)

  return (
    <HydrationBoundary state={dehydratedState}>
      <div className="min-h-screen bg-zinc-50 dark:bg-black text-slate-900 dark:text-zinc-50">
        <header className="border-b bg-white dark:bg-black/20">
          <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-semibold">rssit</h1>
              <span className="text-sm text-muted-foreground">A simple reddit-style feed</span>
            </div>
            <nav className="flex items-center gap-3">
              <AddFeedDialog />
              <Button variant="ghost" size="sm">New</Button>
              <Button variant="outline" size="sm">Top</Button>
            </nav>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-6 py-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <section className="lg:col-span-2 flex flex-col gap-6">
            <FeedList />
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
