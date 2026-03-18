import { useState, useCallback } from "react";
import UserService, { type UpdateProfileInput } from "@/services/user.service";
import type { User, Post, PaginationParams, UserFollow, FollowCounts } from "@/types";

export function useProfile() {
  const [profile, setProfile] = useState<User | null>(null);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [userLikes, setUserLikes] = useState<Post[]>([]);
  const [followers, setFollowers] = useState<UserFollow[]>([]);
  const [following, setFollowing] = useState<UserFollow[]>([]);
  const [followCounts, setFollowCounts] = useState<FollowCounts>({
    followers_count: 0,
    following_count: 0,
  });
  const [loading, setLoading] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const fetchProfile = useCallback(async (userId: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await UserService.getProfile(userId);
      setProfile(response.data);
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch profile");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchProfileByUsername = useCallback(async (username: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await UserService.getProfileByUsername(username);
      setProfile(response.data);
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch profile");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMyProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await UserService.getMe();
      setProfile(response.data);
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch profile");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (input: UpdateProfileInput) => {
    setLoading(true);
    setError(null);
    try {
      const response = await UserService.updateProfile(input);
      setProfile(response.data);
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUserPosts = useCallback(async (userId: number, params?: PaginationParams) => {
    setLoading(true);
    setError(null);
    try {
      const response = await UserService.getUserPosts(userId, params);
      const newPosts = response.data || [];
      
      if (params?.offset && params.offset > 0) {
        setUserPosts((prev) => [...prev, ...newPosts]);
      } else {
        setUserPosts(newPosts);
      }
      
      setHasMore(newPosts.length === (params?.limit || 20));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch user posts");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUserLikes = useCallback(async (userId: number, params?: PaginationParams) => {
    setLoading(true);
    setError(null);
    try {
      const response = await UserService.getUserLikes(userId, params);
      const newPosts = response.data || [];
      
      if (params?.offset && params.offset > 0) {
        setUserLikes((prev) => [...prev, ...newPosts]);
      } else {
        setUserLikes(newPosts);
      }
      
      setHasMore(newPosts.length === (params?.limit || 20));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch user likes");
    } finally {
      setLoading(false);
    }
  }, []);

  const followUser = useCallback(async (userId: number) => {
    setFollowLoading(true);
    try {
      await UserService.followUser(userId);
      // Update profile's is_following status
      setProfile((prev) =>
        prev ? { ...prev, is_following: true, followers_count: (prev.followers_count || 0) + 1 } : null
      );
      setFollowCounts((prev) => ({
        ...prev,
        followers_count: prev.followers_count + 1,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to follow user");
      throw err;
    } finally {
      setFollowLoading(false);
    }
  }, []);

  const unfollowUser = useCallback(async (userId: number) => {
    setFollowLoading(true);
    try {
      await UserService.unfollowUser(userId);
      // Update profile's is_following status
      setProfile((prev) =>
        prev ? { ...prev, is_following: false, followers_count: Math.max(0, (prev.followers_count || 1) - 1) } : null
      );
      setFollowCounts((prev) => ({
        ...prev,
        followers_count: Math.max(0, prev.followers_count - 1),
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to unfollow user");
      throw err;
    } finally {
      setFollowLoading(false);
    }
  }, []);

  const checkIsFollowing = useCallback(async (userId: number) => {
    try {
      const response = await UserService.isFollowing(userId);
      return response.data?.is_following ?? false;
    } catch {
      return false;
    }
  }, []);

  const fetchFollowCounts = useCallback(async (userId: number) => {
    try {
      const response = await UserService.getFollowCounts(userId);
      if (response.data) {
        setFollowCounts(response.data);
        // Also update profile counts
        setProfile((prev) =>
          prev
            ? {
                ...prev,
                followers_count: response.data.followers_count,
                following_count: response.data.following_count,
              }
            : null
        );
      }
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch follow counts");
      return null;
    }
  }, []);

  const fetchFollowers = useCallback(async (userId: number, params?: PaginationParams) => {
    setLoading(true);
    setError(null);
    try {
      const response = await UserService.getFollowers(userId, params);
      const newFollowers = response.data || [];
      
      if (params?.offset && params.offset > 0) {
        setFollowers((prev) => [...prev, ...newFollowers]);
      } else {
        setFollowers(newFollowers);
      }
      
      setHasMore(newFollowers.length === (params?.limit || 20));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch followers");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchFollowing = useCallback(async (userId: number, params?: PaginationParams) => {
    setLoading(true);
    setError(null);
    try {
      const response = await UserService.getFollowing(userId, params);
      const newFollowing = response.data || [];
      
      if (params?.offset && params.offset > 0) {
        setFollowing((prev) => [...prev, ...newFollowing]);
      } else {
        setFollowing(newFollowing);
      }
      
      setHasMore(newFollowing.length === (params?.limit || 20));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch following");
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return {
    profile,
    userPosts,
    userLikes,
    followers,
    following,
    followCounts,
    loading,
    followLoading,
    error,
    hasMore,
    fetchProfile,
    fetchProfileByUsername,
    fetchMyProfile,
    updateProfile,
    fetchUserPosts,
    fetchUserLikes,
    followUser,
    unfollowUser,
    checkIsFollowing,
    fetchFollowCounts,
    fetchFollowers,
    fetchFollowing,
    clearError,
  };
}
