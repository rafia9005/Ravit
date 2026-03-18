// API Response wrapper
export interface ApiResponse<T> {
  message: string;
  error: string;
  data: T;
}

// Pagination params
export interface PaginationParams {
  limit?: number;
  offset?: number;
}

// User types
export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  role: string;
  bio: string;
  avatar: string;
  banner: string;
  auth_type: string;
  created_at: string;
  updated_at: string;
  // Extended profile fields (computed by backend or frontend)
  followers_count?: number;
  following_count?: number;
  is_following?: boolean;
}

// Post types
export interface Post {
  id: number;
  user_id: number;
  content: string;
  media_urls?: string; // JSON string of media URLs
  reply_to_id?: number;
  repost_id?: number;
  like_count: number;
  reply_count: number;
  repost_count: number;
  view_count: number;
  created_at: string;
  updated_at: string;
  // Frontend computed fields
  user?: User;
  is_liked?: boolean;
  is_bookmarked?: boolean;
}

export interface CreatePostInput {
  content: string;
  media_urls?: string[];
  reply_to_id?: number;
  repost_id?: number;
}

export interface UpdatePostInput {
  content: string;
}

// Comment types
export interface Comment {
  id: number;
  user_id: number;
  post_id: number;
  parent_id?: number;
  content: string;
  reply_count: number;
  created_at: string;
  updated_at: string;
  user?: User;
  replies?: Comment[];
}

export interface CreateCommentInput {
  content: string;
  parent_id?: number;
}

// Reply types (comment on comment)
export interface Reply {
  id: number;
  user_id: number;
  comment_id: number;
  content: string;
  created_at: string;
  updated_at: string;
  user?: User;
}

export interface CreateReplyInput {
  content: string;
}

// Notification types
export type NotificationType = 'like' | 'comment' | 'reply' | 'follow' | 'repost';

export interface Notification {
  id: number;
  user_id: number;
  actor_id: number;
  type: NotificationType;
  target_id?: number;
  content: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
  actor?: User;
}

// Bookmark types
export interface Bookmark {
  id: number;
  user_id: number;
  post_id: number;
  created_at: string;
  updated_at: string;
  post?: Post;
}

// Explore/Search types
export interface SearchParams extends PaginationParams {
  q?: string;
  query?: string;
}

// Media upload response
export interface MediaUploadResponse {
  media_urls: string[];
}

// Like entity
export interface Like {
  id: number;
  user_id: number;
  post_id: number;
  created_at: string;
}

// Follow types
export interface Follow {
  id: number;
  follower_id: number;
  following_id: number;
  created_at: string;
}

export interface UserFollow {
  id: number;
  user_id: number;
  username: string;
  name: string;
  avatar: string;
  created_at: string;
}

export interface FollowCounts {
  followers_count: number;
  following_count: number;
}

export interface IsFollowingResponse {
  is_following: boolean;
}
