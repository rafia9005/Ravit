package entity

import (
	"time"
)

// Post represents a post/tweet entity
type Post struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	UserID      uint      `json:"user_id" gorm:"index"`
	Content     string    `json:"content" gorm:"type:text"`
	MediaURLs   string    `json:"media_urls" gorm:"type:text"` // JSON array stored as text
	ReplyToID   *uint     `json:"reply_to_id" gorm:"index"`    // For threaded conversations
	RepostID    *uint     `json:"repost_id" gorm:"index"`      // For reposts/retweets
	LikeCount   int       `json:"like_count" gorm:"default:0"`
	ReplyCount  int       `json:"reply_count" gorm:"default:0"`
	RepostCount int       `json:"repost_count" gorm:"default:0"`
	ViewCount   int       `json:"view_count" gorm:"default:0"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// TableName specifies the table name for Post
func (*Post) TableName() string {
	return "posts"
}

// NewPost creates a new post
func NewPost(userID uint, content string) *Post {
	now := time.Now()
	return &Post{
		UserID:    userID,
		Content:   content,
		CreatedAt: now,
		UpdatedAt: now,
	}
}

// NewReply creates a new reply to a post
func NewReply(userID uint, content string, replyToID uint) *Post {
	now := time.Now()
	return &Post{
		UserID:    userID,
		Content:   content,
		ReplyToID: &replyToID,
		CreatedAt: now,
		UpdatedAt: now,
	}
}

// NewRepost creates a new repost
func NewRepost(userID uint, repostID uint, content string) *Post {
	now := time.Now()
	return &Post{
		UserID:    userID,
		Content:   content, // Optional quote text
		RepostID:  &repostID,
		CreatedAt: now,
		UpdatedAt: now,
	}
}
