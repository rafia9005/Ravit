import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { PostList } from "@/components/posts";
import { useBookmarks } from "@/hooks/useBookmarks";
import { usePosts } from "@/hooks/usePosts";
import { useAuth } from "@/hooks/useAuth";
import type { Post } from "@/types";

export default function BookmarksPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { bookmarks, loading, hasMore, fetchBookmarks, removeBookmark } = useBookmarks();
  const { likePost, unlikePost, deletePost } = usePosts();
  const [offset, setOffset] = useState(0);
  const limit = 20;

  useEffect(() => {
    fetchBookmarks({ limit, offset: 0 });
  }, [fetchBookmarks]);

  const handleLoadMore = useCallback(() => {
    const newOffset = offset + limit;
    setOffset(newOffset);
    fetchBookmarks({ limit, offset: newOffset });
  }, [offset, fetchBookmarks]);

  // Convert bookmarks to posts array
  const posts: Post[] = bookmarks
    .filter((b) => b.post)
    .map((b) => ({
      ...b.post!,
      is_bookmarked: true,
    }));

  const handleReply = (postId: number) => {
    navigate(`/post/${postId}`);
  };

  const handleRepost = (postId: number) => {
    navigate(`/post/${postId}`);
  };

  const handleRemoveBookmark = async (postId: number) => {
    await removeBookmark(postId);
  };

  return (
    <div className="flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 p-4 border-b bg-background/80 backdrop-blur-md">
        <h2 className="text-xl font-bold tracking-tight">Bookmarks</h2>
        <p className="text-sm text-muted-foreground">@{user?.email?.split("@")[0]}</p>
      </header>

      {/* Bookmarked Posts */}
      <PostList
        posts={posts}
        loading={loading}
        hasMore={hasMore}
        currentUserId={user?.id}
        onLoadMore={handleLoadMore}
        onLike={likePost}
        onUnlike={unlikePost}
        onRemoveBookmark={handleRemoveBookmark}
        onDelete={deletePost}
        onReply={handleReply}
        onRepost={handleRepost}
        emptyMessage="You haven't bookmarked any posts yet"
      />
    </div>
  );
}
