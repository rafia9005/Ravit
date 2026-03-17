import Fetch from "@/lib/fetch";
import type {
  ApiResponse,
  Bookmark,
  PaginationParams,
} from "@/types";

class BookmarkService {
  /**
   * Get all bookmarks for the authenticated user
   */
  async getBookmarks(params?: PaginationParams): Promise<ApiResponse<Bookmark[]>> {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.offset) queryParams.append("offset", params.offset.toString());

    const response = await Fetch.get<ApiResponse<Bookmark[]>>(
      `/bookmarks?${queryParams.toString()}`
    );
    return response.data;
  }

  /**
   * Add a post to bookmarks
   */
  async addBookmark(postId: number): Promise<ApiResponse<Bookmark>> {
    const response = await Fetch.post<ApiResponse<Bookmark>>(
      `/posts/${postId}/bookmark`,
      {}
    );
    return response.data;
  }

  /**
   * Remove a post from bookmarks
   */
  async removeBookmark(postId: number): Promise<ApiResponse<null>> {
    const response = await Fetch.delete<ApiResponse<null>>(
      `/posts/${postId}/bookmark`
    );
    return response.data;
  }

  /**
   * Check if a post is bookmarked
   */
  async isBookmarked(postId: number): Promise<ApiResponse<{ is_bookmarked: boolean }>> {
    const response = await Fetch.get<ApiResponse<{ is_bookmarked: boolean }>>(
      `/posts/${postId}/bookmark/status`
    );
    return response.data;
  }
}

export default new BookmarkService();
