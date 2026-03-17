import Fetch from "@/lib/fetch";
import type {
  ApiResponse,
  Post,
  User,
  PaginationParams,
  SearchParams,
} from "@/types";

class ExploreService {
  /**
   * Get trending posts
   */
  async getTrending(params?: PaginationParams): Promise<ApiResponse<Post[]>> {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.offset) queryParams.append("offset", params.offset.toString());

    const response = await Fetch.get<ApiResponse<Post[]>>(
      `/explore/trending?${queryParams.toString()}`
    );
    return response.data;
  }

  /**
   * Search posts by content
   */
  async searchPosts(params: SearchParams): Promise<ApiResponse<Post[]>> {
    const queryParams = new URLSearchParams();
    const searchQuery = params.q || params.query || "";
    if (searchQuery) queryParams.append("q", searchQuery);
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.offset) queryParams.append("offset", params.offset.toString());

    const response = await Fetch.get<ApiResponse<Post[]>>(
      `/explore/search?${queryParams.toString()}`
    );
    return response.data;
  }

  /**
   * Search users (if endpoint exists)
   */
  async searchUsers(params: SearchParams): Promise<ApiResponse<User[]>> {
    const queryParams = new URLSearchParams();
    const searchQuery = params.q || params.query || "";
    if (searchQuery) queryParams.append("q", searchQuery);
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.offset) queryParams.append("offset", params.offset.toString());

    const response = await Fetch.get<ApiResponse<User[]>>(
      `/explore/users?${queryParams.toString()}`
    );
    return response.data;
  }
}

export default new ExploreService();
