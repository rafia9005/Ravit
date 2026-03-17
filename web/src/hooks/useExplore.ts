import { useState, useCallback } from "react";
import ExploreService from "@/services/explore.service";
import type { Post, User, PaginationParams, SearchParams } from "@/types";

export function useExplore() {
  const [trendingPosts, setTrendingPosts] = useState<Post[]>([]);
  const [searchResults, setSearchResults] = useState<Post[]>([]);
  const [userResults, setUserResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const fetchTrending = useCallback(async (params?: PaginationParams) => {
    setLoading(true);
    setError(null);
    try {
      const response = await ExploreService.getTrending(params);
      const newPosts = response.data || [];
      
      if (params?.offset && params.offset > 0) {
        setTrendingPosts((prev) => [...prev, ...newPosts]);
      } else {
        setTrendingPosts(newPosts);
      }
      
      setHasMore(newPosts.length === (params?.limit || 20));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch trending posts");
    } finally {
      setLoading(false);
    }
  }, []);

  const searchPosts = useCallback(async (params: SearchParams) => {
    setLoading(true);
    setError(null);
    try {
      const response = await ExploreService.searchPosts(params);
      const newPosts = response.data || [];
      
      if (params?.offset && params.offset > 0) {
        setSearchResults((prev) => [...prev, ...newPosts]);
      } else {
        setSearchResults(newPosts);
      }
      
      setHasMore(newPosts.length === (params?.limit || 20));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to search posts");
    } finally {
      setLoading(false);
    }
  }, []);

  const searchUsers = useCallback(async (params: SearchParams) => {
    setLoading(true);
    setError(null);
    try {
      const response = await ExploreService.searchUsers(params);
      const newUsers = response.data || [];
      
      if (params?.offset && params.offset > 0) {
        setUserResults((prev) => [...prev, ...newUsers]);
      } else {
        setUserResults(newUsers);
      }
      
      setHasMore(newUsers.length === (params?.limit || 20));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to search users");
    } finally {
      setLoading(false);
    }
  }, []);

  const clearResults = useCallback(() => {
    setSearchResults([]);
    setUserResults([]);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return {
    trendingPosts,
    searchResults,
    userResults,
    loading,
    error,
    hasMore,
    fetchTrending,
    searchPosts,
    searchUsers,
    clearResults,
    clearError,
  };
}
