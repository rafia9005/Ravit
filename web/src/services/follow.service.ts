import Fetch from "@/lib/fetch";
import type {
  ApiResponse,
  UserFollow,
  FollowCounts,
  IsFollowingResponse,
  PaginationParams,
} from "@/types";

class FollowService {
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
    const response = await Fetch.delete<ApiResponse<null>>(`/follows/${userId}`);
    return response.data;
  }

  /**
   * Check if the authenticated user is following another user
   */
  async isFollowing(userId: number): Promise<ApiResponse<IsFollowingResponse>> {
    const response = await Fetch.get<ApiResponse<IsFollowingResponse>>(
      `/follows/check/${userId}`
    );
    return response.data;
  }

  /**
   * Get followers of a user
   */
  async getFollowers(
    userId: number,
    params?: PaginationParams
  ): Promise<ApiResponse<UserFollow[]>> {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.offset) queryParams.append("offset", params.offset.toString());

    const response = await Fetch.get<ApiResponse<UserFollow[]>>(
      `/follows/users/${userId}/followers?${queryParams.toString()}`
    );
    return response.data;
  }

  /**
   * Get users that a user is following
   */
  async getFollowing(
    userId: number,
    params?: PaginationParams
  ): Promise<ApiResponse<UserFollow[]>> {
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

export default new FollowService();
