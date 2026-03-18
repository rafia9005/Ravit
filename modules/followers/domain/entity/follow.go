package entity

import (
	"time"
)

// Follow represents a follow relationship between users
type Follow struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	FollowerID  uint      `gorm:"not null;index" json:"follower_id"`  // User who follows
	FollowingID uint      `gorm:"not null;index" json:"following_id"` // User being followed
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// TableName specifies the table name
func (Follow) TableName() string {
	return "follows"
}

// NewFollow creates a new follow relationship
func NewFollow(followerID, followingID uint) *Follow {
	return &Follow{
		FollowerID:  followerID,
		FollowingID: followingID,
	}
}
