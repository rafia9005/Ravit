package entity

import (
	"time"
)

// Reply represents a reply to a comment
type Reply struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	UserID    uint      `json:"user_id" gorm:"index"`
	CommentID uint      `json:"comment_id" gorm:"index"`
	Content   string    `json:"content" gorm:"type:text"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// TableName specifies the table name for Reply
func (*Reply) TableName() string {
	return "replies"
}

// NewReply creates a new reply
func NewReply(userID, commentID uint, content string) *Reply {
	now := time.Now()
	return &Reply{
		UserID:    userID,
		CommentID: commentID,
		Content:   content,
		CreatedAt: now,
		UpdatedAt: now,
	}
}
