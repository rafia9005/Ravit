import { useState, useCallback } from "react";
import UserService, { type UpdateProfileInput } from "@/services/user.service";
import type { User, Post, PaginationParams } from "@/types";

export function useProfile() {
  const [profile, setProfile] = useState<User | null>(null);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [userLikes, setUserLikes] = useState<Post[]>([]);
  const [followers, setFollowers] = useState<User[]>([]);
  const [following, setFollowing] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
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
    try {
      await UserService.followUser(userId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to follow user");
      throw err;
    }
  }, []);

  const unfollowUser = useCallback(async (userId: number) => {
    try {
      await UserService.unfollowUser(userId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to unfollow user");
      throw err;
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
    loading,
    error,
    hasMore,
    fetchProfile,
    fetchMyProfile,
    updateProfile,
    fetchUserPosts,
    fetchUserLikes,
    followUser,
    unfollowUser,
    fetchFollowers,
    fetchFollowing,
    clearError,
  };
}
