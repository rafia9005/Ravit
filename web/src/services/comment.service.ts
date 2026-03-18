import Fetch from "@/lib/fetch";
import type {
  ApiResponse,
  Comment,
  CreateCommentInput,
  PaginationParams,
} from "@/types";

class CommentService {
  /**
   * Get top-level comments for a post
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
   * Get replies for a specific comment
   */
  async getReplies(commentId: number, params?: PaginationParams): Promise<ApiResponse<Comment[]>> {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.offset) queryParams.append("offset", params.offset.toString());

    const response = await Fetch.get<ApiResponse<Comment[]>>(
      `/comments/${commentId}/replies?${queryParams.toString()}`
    );
    return response.data;
  }

  /**
   * Create a new comment on a post (optionally as a reply to another comment)
   */
  async createComment(postId: number, input: CreateCommentInput): Promise<ApiResponse<Comment>> {
    const response = await Fetch.post<ApiResponse<Comment>>(
      `/posts/${postId}/comments`,
      input
    );
    return response.data;
  }

  /**
   * Create a reply to a comment
   */
  async createReply(postId: number, parentId: number, content: string): Promise<ApiResponse<Comment>> {
    return this.createComment(postId, { content, parent_id: parentId });
  }

  /**
   * Update a comment
   */
  async updateComment(commentId: number, content: string): Promise<ApiResponse<Comment>> {
    const response = await Fetch.put<ApiResponse<Comment>>(
      `/comments/${commentId}`,
      { content }
    );
    return response.data;
  }

  /**
   * Delete a comment
   */
  async deleteComment(commentId: number): Promise<ApiResponse<null>> {
    const response = await Fetch.delete<ApiResponse<null>>(
      `/comments/${commentId}`
    );
    return response.data;
  }
}

export default new CommentService();
