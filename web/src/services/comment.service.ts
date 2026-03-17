import Fetch from "@/lib/fetch";
import type {
  ApiResponse,
  Comment,
  CreateCommentInput,
  PaginationParams,
} from "@/types";

class CommentService {
  /**
   * Get comments for a post
   */
  async getComments(postId: number, params?: PaginationParams): Promise<ApiResponse<Comment[]>> {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.offset) queryParams.append("offset", params.offset.toString());

    const response = await Fetch.get<ApiResponse<Comment[]>>(
      `/posts/${postId}/comments?${queryParams.toString()}`
    );
    return response.data;
  }

  /**
   * Create a new comment on a post
   */
  async createComment(postId: number, input: CreateCommentInput): Promise<ApiResponse<Comment>> {
    const response = await Fetch.post<ApiResponse<Comment>>(
      `/posts/${postId}/comments`,
      input
    );
    return response.data;
  }

  /**
   * Update a comment
   */
  async updateComment(
    postId: number,
    commentId: number,
    input: CreateCommentInput
  ): Promise<ApiResponse<Comment>> {
    const response = await Fetch.put<ApiResponse<Comment>>(
      `/posts/${postId}/comments/${commentId}`,
      input
    );
    return response.data;
  }

  /**
   * Delete a comment
   */
  async deleteComment(postId: number, commentId: number): Promise<ApiResponse<null>> {
    const response = await Fetch.delete<ApiResponse<null>>(
      `/posts/${postId}/comments/${commentId}`
    );
    return response.data;
  }
}

export default new CommentService();
