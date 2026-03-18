import Fetch from "@/lib/fetch";
import type {
  ApiResponse,
  Post,
  CreatePostInput,
  UpdatePostInput,
  PaginationParams,
  MediaUploadResponse,
} from "@/types";

class PostService {
  /**
   * Get feed for authenticated user
   */
  async getFeed(params?: PaginationParams): Promise<ApiResponse<Post[]>> {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.offset) queryParams.append("offset", params.offset.toString());

    const response = await Fetch.get<ApiResponse<Post[]>>(
      `/posts/feed?${queryParams.toString()}`
    );
    return response.data;
  }

  /**
   * Get a single post by ID
   */
  async getPost(id: number): Promise<ApiResponse<Post>> {
    const response = await Fetch.get<ApiResponse<Post>>(`/posts/${id}`);
    return response.data;
  }

  /**
   * Create a new post
   */
  async createPost(input: CreatePostInput): Promise<ApiResponse<Post>> {
    const response = await Fetch.post<ApiResponse<Post>>("/posts", input);
    return response.data;
  }

  /**
   * Update a post
   */
  async updatePost(id: number, input: UpdatePostInput): Promise<ApiResponse<Post>> {
    const response = await Fetch.put<ApiResponse<Post>>(`/posts/${id}`, input);
    return response.data;
  }

  /**
   * Delete a post
   */
  async deletePost(id: number): Promise<ApiResponse<null>> {
    const response = await Fetch.delete<ApiResponse<null>>(`/posts/${id}`);
    return response.data;
  }

  /**
   * Like a post
   */
  async likePost(id: number): Promise<ApiResponse<null>> {
    const response = await Fetch.post<ApiResponse<null>>(`/posts/${id}/like`, {});
    return response.data;
  }

  /**
   * Unlike a post
   */
  async unlikePost(id: number): Promise<ApiResponse<null>> {
    const response = await Fetch.delete<ApiResponse<null>>(`/posts/${id}/like`);
    return response.data;
  }

  /**
   * Get replies to a post
   */
  async getReplies(postId: number, params?: PaginationParams): Promise<ApiResponse<Post[]>> {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.offset) queryParams.append("offset", params.offset.toString());

    const response = await Fetch.get<ApiResponse<Post[]>>(
      `/posts/${postId}/replies?${queryParams.toString()}`
    );
    return response.data;
  }

  /**
   * Upload images for a post
   */
  async uploadImages(files: File[]): Promise<ApiResponse<MediaUploadResponse>> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("images", file);
    });

    const response = await Fetch.post<ApiResponse<MediaUploadResponse>>(
      "/posts/media/upload-images",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  }

  /**
   * Upload media (images) - generic method for profile/posts
   */
  async uploadMedia(files: File[]): Promise<ApiResponse<MediaUploadResponse>> {
    return this.uploadImages(files);
  }

  /**
   * Upload videos for a post
   */
  async uploadVideos(files: File[]): Promise<ApiResponse<MediaUploadResponse>> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("videos", file);
    });

    const response = await Fetch.post<ApiResponse<MediaUploadResponse>>(
      "/posts/media/upload-videos",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  }
}

export default new PostService();
