import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { PostCard } from "@/components/posts";
import { CommentList, CommentComposer } from "@/components/comments";
import { usePosts } from "@/hooks/usePosts";
import { useComments } from "@/hooks/useComments";
import { useBookmarks } from "@/hooks/useBookmarks";
import { useAuth } from "@/hooks/useAuth";
import type { Post } from "@/types";

export default function PostPage() {
  const navigate = useNavigate();
  const { postId } = useParams<{ postId: string }>();
  const { user } = useAuth();
  const { likePost, unlikePost, deletePost } = usePosts();
  const { addBookmark, removeBookmark } = useBookmarks();

  const numericPostId = postId ? parseInt(postId) : 0;
  const {
    comments,
    loading: commentsLoading,
    hasMore,
    fetchComments,
    createComment,
    deleteComment,
  } = useComments(numericPostId);

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const limit = 20;

  // Fetch post details
  useEffect(() => {
    const fetchPost = async () => {
      if (!numericPostId) return;

      setLoading(true);
      setError(null);
      try {
        const PostService = (await import("@/services/post.service")).default;
        const response = await PostService.getPost(numericPostId);
        setPost(response.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch post");
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [numericPostId]);

  // Fetch comments
  useEffect(() => {
    if (numericPostId) {
      fetchComments({ limit, offset: 0 });
    }
  }, [numericPostId, fetchComments]);

  const handleLoadMoreComments = useCallback(() => {
    const newOffset = offset + limit;
    setOffset(newOffset);
    fetchComments({ limit, offset: newOffset });
  }, [offset, fetchComments]);

  const handleLike = async (id: number) => {
    await likePost(id);
    if (post && post.id === id) {
      setPost({ ...post, is_liked: true, like_count: (post.like_count || 0) + 1 });
    }
  };

  const handleUnlike = async (id: number) => {
    await unlikePost(id);
    if (post && post.id === id) {
      setPost({ ...post, is_liked: false, like_count: Math.max(0, (post.like_count || 1) - 1) });
    }
  };

  const handleBookmark = async (id: number) => {
    await addBookmark(id);
    if (post && post.id === id) {
      setPost({ ...post, is_bookmarked: true });
    }
  };

  const handleRemoveBookmark = async (id: number) => {
    await removeBookmark(id);
    if (post && post.id === id) {
      setPost({ ...post, is_bookmarked: false });
    }
  };

  const handleDelete = async (id: number) => {
    await deletePost(id);
    navigate(-1);
  };

  const handleReply = () => {
    // Scroll to comment composer
    document.getElementById("comment-composer")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleRepost = (id: number) => {
    navigate(`/compose?repost=${id}`);
  };

  const handleCommentCreated = async (content: string) => {
    await createComment({ content });
    // Update post reply count
    if (post) {
      setPost({ ...post, reply_count: (post.reply_count || 0) + 1 });
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    await deleteComment(commentId);
    // Update post reply count
    if (post) {
      setPost({ ...post, reply_count: Math.max(0, (post.reply_count || 1) - 1) });
    }
  };

  return (
    <div className="flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 p-4 border-b bg-background/80 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 hover:bg-muted rounded-full transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h2 className="text-xl font-bold tracking-tight">Post</h2>
        </div>
      </header>

      {/* Loading State */}
      {loading && (
        <div className="p-8 flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="p-8 text-center text-destructive">
          <p>{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 text-primary hover:underline"
          >
            Go back
          </button>
        </div>
      )}

      {/* Post Content */}
      {post && !loading && (
        <>
          {/* Main Post */}
          <PostCard
            post={post}
            currentUserId={user?.id}
            onLike={handleLike}
            onUnlike={handleUnlike}
            onBookmark={handleBookmark}
            onRemoveBookmark={handleRemoveBookmark}
            onDelete={handleDelete}
            onReply={handleReply}
            onRepost={handleRepost}
          />

          {/* Comment Composer */}
          <div id="comment-composer" className="border-b">
            <CommentComposer
              onSubmit={handleCommentCreated}
            />
          </div>

          {/* Comments Section */}
          <div>
            <div className="p-4 border-b">
              <h3 className="font-semibold">
                Comments{" "}
                {post.reply_count ? (
                  <span className="text-muted-foreground font-normal">
                    ({post.reply_count})
                  </span>
                ) : null}
              </h3>
            </div>

            <CommentList
              comments={comments}
              postId={numericPostId}
              loading={commentsLoading}
              hasMore={hasMore}
              currentUserId={user?.id}
              onLoadMore={handleLoadMoreComments}
              onDelete={handleDeleteComment}
              emptyMessage="No comments yet. Be the first to comment!"
            />
          </div>
        </>
      )}
    </div>
  );
}
