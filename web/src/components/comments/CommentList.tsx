import { useEffect, useRef } from "react";
import { CommentCard } from "./CommentCard";
import { Skeleton } from "@/components/ui/skeleton";
import type { Comment, User } from "@/types";

interface CommentListProps {
  comments: Comment[];
  postId: number;
  loading?: boolean;
  hasMore?: boolean;
  currentUserId?: number;
  onLoadMore?: () => void;
  onDelete?: (commentId: number) => void;
  onEdit?: (commentId: number, content: string) => void;
  onReplyCreated?: (reply: Comment) => void;
  emptyMessage?: string;
  getUserForComment?: (comment: Comment) => User | undefined;
}

export function CommentList({
  comments,
  postId,
  loading = false,
  hasMore = false,
  currentUserId,
  onLoadMore,
  onDelete,
  onEdit,
  onReplyCreated,
  emptyMessage = "No comments yet",
  getUserForComment,
}: CommentListProps) {
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

  if (loading && comments.length === 0) {
    return (
      <div className="flex flex-col">
        {[...Array(3)].map((_, i) => (
          <CommentSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!loading && comments.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        <p className="text-sm">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {comments.map((comment) => (
        <CommentCard
          key={comment.id}
          comment={comment}
          postId={postId}
          currentUserId={currentUserId}
          user={getUserForComment?.(comment)}
          onDelete={onDelete}
          onEdit={onEdit}
          onReplyCreated={onReplyCreated}
        />
      ))}

      {/* Load more trigger */}
      {hasMore && (
        <div ref={loadMoreRef} className="p-4">
          {loading && <CommentSkeleton />}
        </div>
      )}
    </div>
  );
}

function CommentSkeleton() {
  return (
    <div className="p-4 flex gap-3 border-b">
      <Skeleton className="size-9 rounded-full" />
      <div className="flex-1 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-16" />
        </div>
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
      </div>
    </div>
  );
}
