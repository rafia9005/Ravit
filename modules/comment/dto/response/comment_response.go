package response

import (
	"Ravit/modules/comment/domain/entity"
	userEntity "Ravit/modules/users/domain/entity"
	"time"
)

// UserInfo represents minimal user info embedded in comment response
type UserInfo struct {
	ID       uint   `json:"id"`
	Name     string `json:"name"`
	Username string `json:"username"`
	Avatar   string `json:"avatar"`
}

// CommentResponse represents a comment response
type CommentResponse struct {
	ID         uint               `json:"id"`
	UserID     uint               `json:"user_id"`
	PostID     uint               `json:"post_id"`
	ParentID   *uint              `json:"parent_id,omitempty"`
	Content    string             `json:"content"`
	User       *UserInfo          `json:"user,omitempty"`
	Replies    []*CommentResponse `json:"replies,omitempty"`
	ReplyCount int64              `json:"reply_count"`
	CreatedAt  time.Time          `json:"created_at"`
	UpdatedAt  time.Time          `json:"updated_at"`
}

// FromEntity converts a comment entity to a comment response
func FromEntity(comment *entity.Comment) *CommentResponse {
	return &CommentResponse{
		ID:        comment.ID,
		UserID:    comment.UserID,
		PostID:    comment.PostID,
		ParentID:  comment.ParentID,
		Content:   comment.Content,
		CreatedAt: comment.CreatedAt,
		UpdatedAt: comment.UpdatedAt,
	}
}

// FromEntities converts a slice of comment entities to a slice of comment responses
func FromEntities(comments []*entity.Comment) []*CommentResponse {
	commentResponses := make([]*CommentResponse, len(comments))
	for i, comment := range comments {
		commentResponses[i] = FromEntity(comment)
	}
	return commentResponses
}

// FromEntitiesWithUsers converts a slice of comment entities to responses with user info
func FromEntitiesWithUsers(comments []*entity.Comment, users []*userEntity.User) []*CommentResponse {
	// Create a map of user IDs to users for quick lookup
	userMap := make(map[uint]*userEntity.User)
	for _, user := range users {
		userMap[user.ID] = user
	}

	commentResponses := make([]*CommentResponse, len(comments))
	for i, comment := range comments {
		resp := FromEntity(comment)
		if user, ok := userMap[comment.UserID]; ok {
			resp.User = &UserInfo{
				ID:       user.ID,
				Name:     user.Name,
				Username: user.Username,
				Avatar:   user.Avatar,
			}
		}
		commentResponses[i] = resp
	}
	return commentResponses
}

// FromEntitiesWithUsersAndReplyCounts converts comments with user info and reply counts
func FromEntitiesWithUsersAndReplyCounts(comments []*entity.Comment, users []*userEntity.User, replyCounts map[uint]int64) []*CommentResponse {
	// Create a map of user IDs to users for quick lookup
	userMap := make(map[uint]*userEntity.User)
	for _, user := range users {
		userMap[user.ID] = user
	}

	commentResponses := make([]*CommentResponse, len(comments))
	for i, comment := range comments {
		resp := FromEntity(comment)
		if user, ok := userMap[comment.UserID]; ok {
			resp.User = &UserInfo{
				ID:       user.ID,
				Name:     user.Name,
				Username: user.Username,
				Avatar:   user.Avatar,
			}
		}
		if count, ok := replyCounts[comment.ID]; ok {
			resp.ReplyCount = count
		}
		commentResponses[i] = resp
	}
	return commentResponses
}
