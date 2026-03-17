package response

import (
	"Ravit/modules/post/domain/entity"
	"time"
)

// UserInfo represents minimal user info embedded in post response
type UserInfo struct {
	ID       uint   `json:"id"`
	Name     string `json:"name"`
	Username string `json:"username"`
	Avatar   string `json:"avatar"`
}

// PostResponse represents a post response
type PostResponse struct {
	ID           uint      `json:"id"`
	UserID       uint      `json:"user_id"`
	Content      string    `json:"content"`
	MediaURLs    string    `json:"media_urls,omitempty"`
	ReplyToID    *uint     `json:"reply_to_id,omitempty"`
	RepostID     *uint     `json:"repost_id,omitempty"`
	LikeCount    int       `json:"like_count"`
	ReplyCount   int       `json:"reply_count"`
	RepostCount  int       `json:"repost_count"`
	ViewCount    int       `json:"view_count"`
	IsLiked      bool      `json:"is_liked"`
	IsBookmarked bool      `json:"is_bookmarked"`
	User         *UserInfo `json:"user,omitempty"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

// FromEntity converts a post entity to a post response
func FromEntity(post *entity.Post) *PostResponse {
	return &PostResponse{
		ID:          post.ID,
		UserID:      post.UserID,
		Content:     post.Content,
		MediaURLs:   post.MediaURLs,
		ReplyToID:   post.ReplyToID,
		RepostID:    post.RepostID,
		LikeCount:   post.LikeCount,
		ReplyCount:  post.ReplyCount,
		RepostCount: post.RepostCount,
		ViewCount:   post.ViewCount,
		CreatedAt:   post.CreatedAt,
		UpdatedAt:   post.UpdatedAt,
	}
}

// FromEntityWithUser converts a post entity to a post response with user info
func FromEntityWithUser(post *entity.Post, userInfo *UserInfo) *PostResponse {
	resp := FromEntity(post)
	resp.User = userInfo
	return resp
}

// FromEntityWithLikeStatus converts a post entity to a post response with like/bookmark status
func FromEntityWithStatus(post *entity.Post, userInfo *UserInfo, isLiked, isBookmarked bool) *PostResponse {
	resp := FromEntity(post)
	resp.User = userInfo
	resp.IsLiked = isLiked
	resp.IsBookmarked = isBookmarked
	return resp
}

// FromEntities converts a slice of post entities to a slice of post responses
func FromEntities(posts []*entity.Post) []*PostResponse {
	postResponses := make([]*PostResponse, len(posts))
	for i, post := range posts {
		postResponses[i] = FromEntity(post)
	}
	return postResponses
}
