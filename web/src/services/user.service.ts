import Fetch from "@/lib/fetch";
import type {
  ApiResponse,
  User,
  Post,
  PaginationParams,
  UserFollow,
  FollowCounts,
  IsFollowingResponse,
} from "@/types";

export interface UpdateProfileInput {
  name?: string;
  bio?: string;
  avatar?: string;
  banner?: string;
}

class UserService {
  /**
   * Get current user profile
   */
  async getMe(): Promise<ApiResponse<User>> {
    const response = await Fetch.get<ApiResponse<User>>("/users/me");
    return response.data;
  }

  /**
   * Get user profile by ID
   */
  async getProfile(userId: number): Promise<ApiResponse<User>> {
    const response = await Fetch.get<ApiResponse<User>>(`/users/${userId}`);
    return response.data;
  }

  /**
   * Get user profile by username
   */
  async getProfileByUsername(username: string): Promise<ApiResponse<User>> {
    const response = await Fetch.get<ApiResponse<User>>(`/users/${username}/profile`);
    return response.data;
  }

  /**
   * Update current user profile
   */
  async updateProfile(input: UpdateProfileInput): Promise<ApiResponse<User>> {
    const response = await Fetch.put<ApiResponse<User>>("/users/me", input);
    return response.data;
  }

  /**
   * Get user's posts
   */
  async getUserPosts(userId: number, params?: PaginationParams): Promise<ApiResponse<Post[]>> {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.offset) queryParams.append("offset", params.offset.toString());

    const response = await Fetch.get<ApiResponse<Post[]>>(
      `/users/${userId}/posts?${queryParams.toString()}`
    );
    return response.data;
  }

  /**
   * Get user's likes
   */
  async getUserLikes(userId: number, params?: PaginationParams): Promise<ApiResponse<Post[]>> {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.offset) queryParams.append("offset", params.offset.toString());

    const response = await Fetch.get<ApiResponse<Post[]>>(
      `/users/${userId}/likes?${queryParams.toString()}`
    );
    return response.data;
  }

  /**
   * Follow a user
   */
  async followUser(userId: number): Promise<ApiResponse<null>> {
    const response = await Fetch.post<ApiResponse<null>>("/follows", {
      user_id: userId,
    });
    return response.data;
  }

  /**
   * Unfollow a user
   */
  async unfollowUser(userId: number): Promise<ApiResponse<null>> {
    const response = await Fetch.delete<ApiResponse<null>>(
      `/follows/${userId}`
    );
    return response.data;
  }

  /**
   * Check if following a user
   */
  async isFollowing(userId: number): Promise<ApiResponse<IsFollowingResponse>> {
    const response = await Fetch.get<ApiResponse<IsFollowingResponse>>(
      `/follows/check/${userId}`
    );
    return response.data;
  }

  /**
   * Get user's followers
   */
  async getFollowers(userId: number, params?: PaginationParams): Promise<ApiResponse<UserFollow[]>> {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.offset) queryParams.append("offset", params.offset.toString());

    const response = await Fetch.get<ApiResponse<UserFollow[]>>(
      `/follows/users/${userId}/followers?${queryParams.toString()}`
    );
    return response.data;
  }

  /**
   * Get users that user is following
   */
  async getFollowing(userId: number, params?: PaginationParams): Promise<ApiResponse<UserFollow[]>> {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.offset) queryParams.append("offset", params.offset.toString());

    const response = await Fetch.get<ApiResponse<UserFollow[]>>(
      `/follows/users/${userId}/following?${queryParams.toString()}`
    );
    return response.data;
  }

  /**
   * Get follow counts for a user
   */
  async getFollowCounts(userId: number): Promise<ApiResponse<FollowCounts>> {
    const response = await Fetch.get<ApiResponse<FollowCounts>>(
      `/follows/users/${userId}/counts`
    );
    return response.data;
  }
}

export default new UserService();
