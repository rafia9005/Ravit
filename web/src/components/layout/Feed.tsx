import { useEffect, useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PostComposer, PostList } from "@/components/posts";
import { useAuth } from "@/hooks/useAuth";
import { usePosts } from "@/hooks/usePosts";
import { useBookmarks } from "@/hooks/useBookmarks";

export function Feed() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAuthenticated = !!user;
  const {
    posts,
    loading,
    hasMore,
    error,
    fetchFeed,
    createPost,
    likePost,
    unlikePost,
    deletePost,
    uploadImages,
    uploadVideos,
  } = usePosts();
  const { addBookmark, removeBookmark } = useBookmarks();
  const [offset, setOffset] = useState(0);
  const limit = 20;

  // Fetch feed on mount
  useEffect(() => {
    if (isAuthenticated) {
      fetchFeed({ limit, offset: 0 });
    }
  }, [isAuthenticated, fetchFeed]);

  const handleLoadMore = useCallback(() => {
    const newOffset = offset + limit;
    setOffset(newOffset);
    fetchFeed({ limit, offset: newOffset });
  }, [offset, fetchFeed]);

  const handleCreatePost = async (input: Parameters<typeof createPost>[0]) => {
    await createPost(input);
  };

  const handleReply = (postId: number) => {
    navigate(`/post/${postId}`);
  };

  const handleRepost = (postId: number) => {
    // For now, navigate to post. In the future, could open repost modal
    navigate(`/post/${postId}`);
  };

  return (
    <div className="flex flex-col min-h-screen border-x bg-background/50 backdrop-blur-sm">
      <header className="sticky top-0 z-10 p-4 border-b bg-background/80 backdrop-blur-md flex items-center justify-between">
        <h2 className="text-xl font-bold tracking-tight">Home</h2>
      </header>

      {/* Post Composer */}
      {isAuthenticated && (
        <PostComposer
          onSubmit={handleCreatePost}
          onUploadImages={uploadImages}
          onUploadVideos={uploadVideos}
        />
      )}

      {/* Error Display */}
      {error && (
        <div className="p-4 text-center text-red-500 text-sm">
          {error}
        </div>
      )}

      {/* Posts Feed */}
      <PostList
        posts={posts}
        loading={loading}
        hasMore={hasMore}
        currentUserId={user?.id}
        onLoadMore={handleLoadMore}
        onLike={likePost}
        onUnlike={unlikePost}
        onBookmark={addBookmark}
        onRemoveBookmark={removeBookmark}
        onDelete={deletePost}
        onReply={handleReply}
        onRepost={handleRepost}
        emptyMessage={
          isAuthenticated
            ? "No posts in your feed yet. Follow people to see their posts!"
            : "Login to see your personalized feed"
        }
      />
    </div>
  );
}
