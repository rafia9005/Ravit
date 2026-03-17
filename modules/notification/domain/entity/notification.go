package entity

import (
	"time"
)

// NotificationType represents the type of notification
type NotificationType string

const (
	NotificationTypeLike    NotificationType = "like"
	NotificationTypeComment NotificationType = "comment"
	NotificationTypeReply   NotificationType = "reply"
	NotificationTypeFollow  NotificationType = "follow"
	NotificationTypeRepost  NotificationType = "repost"
)

// Notification represents a user notification
type Notification struct {
	ID        uint             `gorm:"primaryKey" json:"id"`
	UserID    uint             `gorm:"not null;index" json:"user_id"`         // User who receives the notification
	ActorID   uint             `gorm:"not null" json:"actor_id"`              // User who triggered the notification
	Type      NotificationType `gorm:"type:varchar(20);not null" json:"type"` // Type of notification
	TargetID  *uint            `json:"target_id"`                             // ID of the target entity (post, comment, etc.)
	Content   string           `gorm:"type:text" json:"content"`              // Optional notification content
	IsRead    bool             `gorm:"default:false" json:"is_read"`          // Whether notification has been read
	CreatedAt time.Time        `json:"created_at"`
	UpdatedAt time.Time        `json:"updated_at"`
}

// TableName specifies the table name
func (Notification) TableName() string {
	return "notifications"
}

// NewNotification creates a new notification
func NewNotification(userID, actorID uint, notifType NotificationType, targetID *uint, content string) *Notification {
	return &Notification{
		UserID:   userID,
		ActorID:  actorID,
		Type:     notifType,
		TargetID: targetID,
		Content:  content,
		IsRead:   false,
	}
}
