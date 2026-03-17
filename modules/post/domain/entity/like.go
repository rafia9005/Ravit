package entity

import (
	"time"
)

// Like represents a like on a post
type Like struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	UserID    uint      `json:"user_id" gorm:"index;uniqueIndex:idx_user_post"`
	PostID    uint      `json:"post_id" gorm:"index;uniqueIndex:idx_user_post"`
	CreatedAt time.Time `json:"created_at"`
}

// TableName specifies the table name for Like
func (*Like) TableName() string {
	return "likes"
}

// NewLike creates a new like
func NewLike(userID, postID uint) *Like {
	return &Like{
		UserID:    userID,
		PostID:    postID,
		CreatedAt: time.Now(),
	}
}
