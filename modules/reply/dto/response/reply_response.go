package response

import (
	"Ravit/modules/reply/domain/entity"
	"time"
)

// ReplyResponse represents a reply response
type ReplyResponse struct {
	ID        uint      `json:"id"`
	UserID    uint      `json:"user_id"`
	CommentID uint      `json:"comment_id"`
	Content   string    `json:"content"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// FromEntity converts a reply entity to a reply response
func FromEntity(reply *entity.Reply) *ReplyResponse {
	return &ReplyResponse{
		ID:        reply.ID,
		UserID:    reply.UserID,
		CommentID: reply.CommentID,
		Content:   reply.Content,
		CreatedAt: reply.CreatedAt,
		UpdatedAt: reply.UpdatedAt,
	}
}

// FromEntities converts a slice of reply entities to a slice of reply responses
func FromEntities(replies []*entity.Reply) []*ReplyResponse {
	replyResponses := make([]*ReplyResponse, len(replies))
	for i, reply := range replies {
		replyResponses[i] = FromEntity(reply)
	}
	return replyResponses
}
