import { Button } from "../components/ui/button"
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../components/ui/card"
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query'
import { AddFeedDialog } from "@/components/add-feed-dialog"
import { FeedList } from "@/components/feed-list"
import { getBestEntries } from "@/lib/queries"
import Link from "next/link"

export default async function Home() {
  const queryClient = new QueryClient()

  await queryClient.prefetchQuery({
    queryKey: ['feedentries'],
    queryFn: getBestEntries,
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="min-h-screen bg-zinc-50 dark:bg-black text-slate-900 dark:text-zinc-50">
        <header className="border-b bg-white dark:bg-black/20">
          <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <h1 className="text-lg font-semibold">rssit</h1>
              <span className="text-sm text-muted-foreground hidden sm:inline">A simple reddit-style feed</span>
            </Link>
            <nav className="flex items-center gap-3">
              <AddFeedDialog />
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
                  <CardTitle>About</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    rssit aggregates RSS feeds and ranks entries by community votes. Add your favorite feeds and upvote the best content.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Rules</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
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
