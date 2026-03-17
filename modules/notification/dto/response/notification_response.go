package response

import (
	"Ravit/modules/notification/domain/entity"
	"time"
)

// NotificationResponse represents a notification response
type NotificationResponse struct {
	ID        uint                    `json:"id"`
	UserID    uint                    `json:"user_id"`
	ActorID   uint                    `json:"actor_id"`
	Type      entity.NotificationType `json:"type"`
	TargetID  *uint                   `json:"target_id"`
	Content   string                  `json:"content"`
	IsRead    bool                    `json:"is_read"`
	CreatedAt time.Time               `json:"created_at"`
}

// FromEntity converts an entity to a response
func FromEntity(notification *entity.Notification) *NotificationResponse {
	return &NotificationResponse{
		ID:        notification.ID,
		UserID:    notification.UserID,
		ActorID:   notification.ActorID,
		Type:      notification.Type,
		TargetID:  notification.TargetID,
		Content:   notification.Content,
		IsRead:    notification.IsRead,
		CreatedAt: notification.CreatedAt,
	}
}

// FromEntities converts multiple entities to responses
func FromEntities(notifications []*entity.Notification) []*NotificationResponse {
	responses := make([]*NotificationResponse, len(notifications))
	for i, notification := range notifications {
		responses[i] = FromEntity(notification)
	}
	return responses
}
