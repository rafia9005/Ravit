package entity

import (
	"time"
)

// Bookmark represents a user's bookmarked post
type Bookmark struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	UserID    uint      `gorm:"not null;index" json:"user_id"` // User who bookmarked
	PostID    uint      `gorm:"not null;index" json:"post_id"` // Post that was bookmarked
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// TableName specifies the table name
func (Bookmark) TableName() string {
	return "bookmarks"
}

// NewBookmark creates a new bookmark
func NewBookmark(userID, postID uint) *Bookmark {
	return &Bookmark{
		UserID: userID,
		PostID: postID,
	}
}
