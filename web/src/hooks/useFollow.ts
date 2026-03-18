import { useState, useCallback } from "react";
import FollowService from "@/services/follow.service";
import type { UserFollow, FollowCounts, PaginationParams } from "@/types";

export function useFollow() {
  const [followers, setFollowers] = useState<UserFollow[]>([]);
  const [following, setFollowing] = useState<UserFollow[]>([]);
  const [counts, setCounts] = useState<FollowCounts>({
    followers_count: 0,
    following_count: 0,
  });
  const [loading, setLoading] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMoreFollowers, setHasMoreFollowers] = useState(true);
  const [hasMoreFollowing, setHasMoreFollowing] = useState(true);

  /**
   * Follow a user
   */
  const followUser = useCallback(async (userId: number) => {
    setFollowLoading(true);
    setError(null);
    try {
      await FollowService.followUser(userId);
      setCounts((prev) => ({
        ...prev,
        following_count: prev.following_count + 1,
      }));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to follow user");
      return false;
    } finally {
      setFollowLoading(false);
    }
  }, []);

  /**
   * Unfollow a user
   */
  const unfollowUser = useCallback(async (userId: number) => {
    setFollowLoading(true);
    setError(null);
    try {
      await FollowService.unfollowUser(userId);
      setCounts((prev) => ({
        ...prev,
        following_count: Math.max(0, prev.following_count - 1),
      }));
      // Remove from following list if present
      setFollowing((prev) => prev.filter((f) => f.user_id !== userId));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to unfollow user");
      return false;
    } finally {
      setFollowLoading(false);
    }
  }, []);

  /**
   * Check if the authenticated user is following another user
   */
  const checkIsFollowing = useCallback(async (userId: number) => {
    try {
      const response = await FollowService.isFollowing(userId);
      return response.data?.is_following ?? false;
    } catch {
      return false;
    }
  }, []);

  /**
   * Fetch followers of a user
   */
  const fetchFollowers = useCallback(
    async (userId: number, params?: PaginationParams) => {
      setLoading(true);
      setError(null);
      try {
        const response = await FollowService.getFollowers(userId, params);
        const newFollowers = response.data || [];

        if (params?.offset && params.offset > 0) {
          setFollowers((prev) => [...prev, ...newFollowers]);
        } else {
          setFollowers(newFollowers);
        }

        setHasMoreFollowers(newFollowers.length === (params?.limit || 20));
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch followers"
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Fetch users that a user is following
   */
  const fetchFollowing = useCallback(
    async (userId: number, params?: PaginationParams) => {
      setLoading(true);
      setError(null);
      try {
        const response = await FollowService.getFollowing(userId, params);
        const newFollowing = response.data || [];

        if (params?.offset && params.offset > 0) {
          setFollowing((prev) => [...prev, ...newFollowing]);
        } else {
          setFollowing(newFollowing);
        }

        setHasMoreFollowing(newFollowing.length === (params?.limit || 20));
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch following"
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Fetch follow counts for a user
   */
  const fetchFollowCounts = useCallback(async (userId: number) => {
    try {
      const response = await FollowService.getFollowCounts(userId);
      if (response.data) {
        setCounts(response.data);
      }
      return response.data;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch follow counts"
      );
      return null;
    }
  }, []);

  /**
   * Clear followers list
   */
  const clearFollowers = useCallback(() => {
    setFollowers([]);
    setHasMoreFollowers(true);
  }, []);

  /**
   * Clear following list
   */
  const clearFollowing = useCallback(() => {
    setFollowing([]);
    setHasMoreFollowing(true);
  }, []);

  /**
   * Clear error
   */
  const clearError = useCallback(() => setError(null), []);

  return {
    followers,
    following,
    counts,
    loading,
    followLoading,
    error,
    hasMoreFollowers,
    hasMoreFollowing,
    followUser,
    unfollowUser,
    checkIsFollowing,
    fetchFollowers,
    fetchFollowing,
    fetchFollowCounts,
    clearFollowers,
    clearFollowing,
    clearError,
  };
}
