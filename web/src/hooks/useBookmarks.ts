import { useState, useCallback } from "react";
import BookmarkService from "@/services/bookmark.service";
import type { Bookmark, PaginationParams } from "@/types";

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const fetchBookmarks = useCallback(async (params?: PaginationParams) => {
    setLoading(true);
    setError(null);
    try {
      const response = await BookmarkService.getBookmarks(params);
      const newBookmarks = response.data || [];
      
      if (params?.offset && params.offset > 0) {
        setBookmarks((prev) => [...prev, ...newBookmarks]);
      } else {
        setBookmarks(newBookmarks);
      }
      
      setHasMore(newBookmarks.length === (params?.limit || 20));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch bookmarks");
    } finally {
      setLoading(false);
    }
  }, []);

  const addBookmark = useCallback(async (postId: number) => {
    try {
      const response = await BookmarkService.addBookmark(postId);
      const newBookmark = response.data;
      setBookmarks((prev) => [newBookmark, ...prev]);
      return newBookmark;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add bookmark");
      throw err;
    }
  }, []);

  const removeBookmark = useCallback(async (postId: number) => {
    try {
      await BookmarkService.removeBookmark(postId);
      setBookmarks((prev) => prev.filter((b) => b.post_id !== postId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove bookmark");
      throw err;
    }
  }, []);

  const isBookmarked = useCallback((postId: number) => {
    return bookmarks.some((b) => b.post_id === postId);
  }, [bookmarks]);

  const clearError = useCallback(() => setError(null), []);

  return {
    bookmarks,
    loading,
    error,
    hasMore,
    fetchBookmarks,
    addBookmark,
    removeBookmark,
    isBookmarked,
    clearError,
  };
}
