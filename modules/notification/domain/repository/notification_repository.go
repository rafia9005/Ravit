package repository

import (
	"Ravit/modules/notification/domain/entity"
	"context"
)

// NotificationRepository defines the interface for notification data operations
type NotificationRepository interface {
	Create(ctx context.Context, notification *entity.Notification) error
	FindByID(ctx context.Context, id uint) (*entity.Notification, error)
	FindByUserID(ctx context.Context, userID uint, limit, offset int) ([]*entity.Notification, error)
	CountUnreadByUserID(ctx context.Context, userID uint) (int64, error)
	MarkAsRead(ctx context.Context, id uint) error
	MarkAllAsRead(ctx context.Context, userID uint) error
	Delete(ctx context.Context, id uint) error
}
