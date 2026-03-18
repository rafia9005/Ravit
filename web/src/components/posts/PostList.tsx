import { useEffect, useRef } from "react";
import { PostCard } from "./PostCard";
import { Skeleton } from "@/components/ui/skeleton";
import type { Post, User } from "@/types";

interface PostListProps {
  posts: Post[];
  loading?: boolean;
  hasMore?: boolean;
  currentUserId?: number;
  onLoadMore?: () => void;
  onLike?: (postId: number) => void;
  onUnlike?: (postId: number) => void;
  onBookmark?: (postId: number) => void;
  onRemoveBookmark?: (postId: number) => void;
  onDelete?: (postId: number) => void;
  onReply?: (postId: number) => void;
  onRepost?: (postId: number) => void;
  emptyMessage?: string;
  getUserForPost?: (post: Post) => User | undefined;
}

export function PostList({
  posts,
  loading = false,
  hasMore = false,
  currentUserId,
  onLoadMore,
  onLike,
  onUnlike,
  onBookmark,
  onRemoveBookmark,
  onDelete,
  onReply,
  onRepost,
  emptyMessage = "No posts yet",
  getUserForPost,
}: PostListProps) {
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Infinite scroll observer
  useEffect(() => {
    if (!hasMore || loading || !onLoadMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loading, onLoadMore]);

  if (loading && posts.length === 0) {
    return (
      <div className="flex flex-col">
        {[...Array(5)].map((_, i) => (
          <PostSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!loading && posts.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 p-3">
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          currentUserId={currentUserId}
          user={getUserForPost?.(post)}
          onLike={onLike}
          onUnlike={onUnlike}
          onBookmark={onBookmark}
          onRemoveBookmark={onRemoveBookmark}
          onDelete={onDelete}
          onReply={onReply}
          onRepost={onRepost}
        />
      ))}

      {/* Load more trigger */}
      {hasMore && (
        <div ref={loadMoreRef} className="p-4">
          {loading && <PostSkeleton />}
        </div>
      )}
    </div>
  );
}

function PostSkeleton() {
  return (
    <div className="bg-card border rounded-xl overflow-hidden flex h-40">
      <div className="w-12 bg-muted/20 flex flex-col items-center py-2 gap-2 border-r">
        <Skeleton className="size-6 rounded" />
        <Skeleton className="h-4 w-6" />
        <Skeleton className="size-6 rounded" />
      </div>
      <div className="flex-1 p-3 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Skeleton className="size-6 rounded-full" />
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-12" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        <div className="flex gap-4 mt-auto">
          <Skeleton className="h-8 w-24 rounded" />
          <Skeleton className="h-8 w-24 rounded" />
        </div>
      </div>
    </div>
  );
}
