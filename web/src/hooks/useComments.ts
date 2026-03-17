import { useState, useCallback } from "react";
import CommentService from "@/services/comment.service";
import type { Comment, CreateCommentInput, PaginationParams } from "@/types";

export function useComments(postId: number) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const fetchComments = useCallback(async (params?: PaginationParams) => {
    setLoading(true);
    setError(null);
    try {
      const response = await CommentService.getComments(postId, params);
      const newComments = response.data || [];
      
      if (params?.offset && params.offset > 0) {
        setComments((prev) => [...prev, ...newComments]);
      } else {
        setComments(newComments);
      }
      
      setHasMore(newComments.length === (params?.limit || 20));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch comments");
    } finally {
      setLoading(false);
    }
  }, [postId]);

  const createComment = useCallback(async (input: CreateCommentInput) => {
    setLoading(true);
    setError(null);
    try {
      const response = await CommentService.createComment(postId, input);
      const newComment = response.data;
      setComments((prev) => [newComment, ...prev]);
      return newComment;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create comment");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [postId]);

  const updateComment = useCallback(async (commentId: number, input: CreateCommentInput) => {
    setLoading(true);
    setError(null);
    try {
      const response = await CommentService.updateComment(postId, commentId, input);
      const updatedComment = response.data;
      setComments((prev) =>
        prev.map((comment) => (comment.id === commentId ? updatedComment : comment))
      );
      return updatedComment;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update comment");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [postId]);

  const deleteComment = useCallback(async (commentId: number) => {
    setLoading(true);
    setError(null);
    try {
      await CommentService.deleteComment(postId, commentId);
      setComments((prev) => prev.filter((comment) => comment.id !== commentId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete comment");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [postId]);

  const clearError = useCallback(() => setError(null), []);

  return {
    comments,
    loading,
    error,
    hasMore,
    fetchComments,
    createComment,
    updateComment,
    deleteComment,
    clearError,
  };
}
