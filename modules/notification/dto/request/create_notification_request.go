package request

import "Ravit/modules/notification/domain/entity"

// CreateNotificationRequest represents a create notification request
type CreateNotificationRequest struct {
	UserID   uint                    `json:"user_id" validate:"required"`
	ActorID  uint                    `json:"actor_id" validate:"required"`
	Type     entity.NotificationType `json:"type" validate:"required"`
	TargetID *uint                   `json:"target_id"`
	Content  string                  `json:"content" validate:"max=500"`
}
