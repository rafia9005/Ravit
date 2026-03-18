import { useState, useCallback } from "react";
import PostService from "@/services/post.service";
import type { Post, CreatePostInput, UpdatePostInput, PaginationParams } from "@/types";

export function usePosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const fetchFeed = useCallback(async (params?: PaginationParams) => {
    setLoading(true);
    setError(null);
    try {
      const response = await PostService.getFeed(params);
      const newPosts = response.data || [];
      
      if (params?.offset && params.offset > 0) {
        setPosts((prev) => [...prev, ...newPosts]);
      } else {
        setPosts(newPosts);
      }
      
      setHasMore(newPosts.length === (params?.limit || 20));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch posts");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPost = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await PostService.getPost(id);
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch post");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const createPost = useCallback(async (input: CreatePostInput) => {
    setLoading(true);
    setError(null);
    try {
      const response = await PostService.createPost(input);
      const newPost = response.data;
      setPosts((prev) => [newPost, ...prev]);
      return newPost;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create post");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePost = useCallback(async (id: number, input: UpdatePostInput) => {
    setLoading(true);
    setError(null);
    try {
      const response = await PostService.updatePost(id, input);
      const updatedPost = response.data;
      setPosts((prev) =>
        prev.map((post) => (post.id === id ? updatedPost : post))
      );
      return updatedPost;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update post");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deletePost = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await PostService.deletePost(id);
      setPosts((prev) => prev.filter((post) => post.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete post");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const likePost = useCallback(async (id: number) => {
    // Optimistically update UI for posts in this hook's state
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, like_count: p.like_count + 1, is_liked: true }
          : p
      )
    );
    
    try {
      await PostService.likePost(id);
    } catch (err) {
      // Revert optimistic update on error
      setPosts((prev) =>
        prev.map((p) =>
          p.id === id
            ? { ...p, like_count: Math.max(0, p.like_count - 1), is_liked: false }
            : p
        )
      );
      // Don't throw error for "already liked" - it's not a real error
      const errorMsg = err instanceof Error ? err.message : String(err);
      if (!errorMsg.includes("already liked")) {
        setError(errorMsg);
        throw err;
      }
    }
  }, []);

  const unlikePost = useCallback(async (id: number) => {
    // Optimistically update UI for posts in this hook's state
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, like_count: Math.max(0, p.like_count - 1), is_liked: false }
          : p
      )
    );
    
    try {
      await PostService.unlikePost(id);
    } catch (err) {
      // Revert optimistic update on error
      setPosts((prev) =>
        prev.map((p) =>
          p.id === id
            ? { ...p, like_count: p.like_count + 1, is_liked: true }
            : p
        )
      );
      // Don't throw error for "not liked" - it's not a real error
      const errorMsg = err instanceof Error ? err.message : String(err);
      if (!errorMsg.includes("not liked")) {
        setError(errorMsg);
        throw err;
      }
    }
  }, []);

  const fetchReplies = useCallback(async (postId: number, params?: PaginationParams) => {
    try {
      const response = await PostService.getReplies(postId, params);
      return response.data || [];
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch replies");
      return [];
    }
  }, []);

  const uploadImages = useCallback(async (files: File[]) => {
    try {
      const response = await PostService.uploadImages(files);
      return response.data.media_urls;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload images");
      throw err;
    }
  }, []);

  const uploadVideos = useCallback(async (files: File[]) => {
    try {
      const response = await PostService.uploadVideos(files);
      return response.data.media_urls;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload videos");
      throw err;
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return {
    posts,
    loading,
    error,
    hasMore,
    fetchFeed,
    fetchPost,
    createPost,
    updatePost,
    deletePost,
    likePost,
    unlikePost,
    fetchReplies,
    uploadImages,
    uploadVideos,
    clearError,
  };
}
