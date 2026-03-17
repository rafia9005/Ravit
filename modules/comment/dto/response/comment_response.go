package response

import (
	"Ravit/modules/comment/domain/entity"
	"time"
)

// CommentResponse represents a comment response
type CommentResponse struct {
	ID        uint      `json:"id"`
	UserID    uint      `json:"user_id"`
	PostID    uint      `json:"post_id"`
	Content   string    `json:"content"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// FromEntity converts a comment entity to a comment response
func FromEntity(comment *entity.Comment) *CommentResponse {
	return &CommentResponse{
		ID:        comment.ID,
		UserID:    comment.UserID,
		PostID:    comment.PostID,
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
