import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { getEntriesByFeedId, getFeedById } from "@/lib/queries";
import { FeedPageContent } from "./feed-page-content";

export default async function FeedPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const feedId = parseInt(id);
  const queryClient = new QueryClient();

  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: ["entries", feedId],
      queryFn: () => getEntriesByFeedId(feedId),
    }),
    queryClient.prefetchQuery({
      queryKey: ["feedinfo", feedId],
      queryFn: () => getFeedById(feedId),
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <FeedPageContent feedId={feedId} />
    </HydrationBoundary>
  );
}
