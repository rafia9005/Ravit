package entity

import (
	"time"
)

// Comment represents a comment on a post (supports nested replies)
type Comment struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	UserID    uint      `json:"user_id" gorm:"index"`
	PostID    uint      `json:"post_id" gorm:"index"`
	ParentID  *uint     `json:"parent_id" gorm:"index"` // NULL for top-level comments, set for replies
	Content   string    `json:"content" gorm:"type:text"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// TableName specifies the table name for Comment
func (*Comment) TableName() string {
	return "comments"
}

// NewComment creates a new top-level comment
func NewComment(userID, postID uint, content string) *Comment {
	now := time.Now()
	return &Comment{
		UserID:    userID,
		PostID:    postID,
		ParentID:  nil,
		Content:   content,
		CreatedAt: now,
		UpdatedAt: now,
	}
}

// NewReply creates a reply to a comment
func NewReply(userID, postID, parentID uint, content string) *Comment {
	now := time.Now()
	return &Comment{
		UserID:    userID,
		PostID:    postID,
		ParentID:  &parentID,
		Content:   content,
		CreatedAt: now,
		UpdatedAt: now,
	}
}
