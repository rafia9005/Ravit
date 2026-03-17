package repository

import (
	"Ravit/internal/pkg/database"
	"Ravit/modules/notification/domain/entity"
	"context"
)

// NotificationRepositoryImpl implements NotificationRepository interface
type NotificationRepositoryImpl struct{}

// NewNotificationRepositoryImpl creates a new notification repository implementation
func NewNotificationRepositoryImpl() NotificationRepository {
	return &NotificationRepositoryImpl{}
}

// Create creates a new notification
func (r *NotificationRepositoryImpl) Create(ctx context.Context, notification *entity.Notification) error {
	return database.DB.WithContext(ctx).Create(notification).Error
}

// FindByID finds a notification by ID
func (r *NotificationRepositoryImpl) FindByID(ctx context.Context, id uint) (*entity.Notification, error) {
	var notification *entity.Notification
	err := database.DB.WithContext(ctx).Where("id = ?", id).First(&notification).Error
	if err != nil {
		return nil, err
	}
	return notification, nil
}

// FindByUserID finds notifications by user ID with pagination
func (r *NotificationRepositoryImpl) FindByUserID(ctx context.Context, userID uint, limit, offset int) ([]*entity.Notification, error) {
	var notifications []*entity.Notification
	err := database.DB.WithContext(ctx).
		Where("user_id = ?", userID).
		Order("created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&notifications).Error
	if err != nil {
		return nil, err
	}
	return notifications, nil
}

// CountUnreadByUserID counts unread notifications for a user
func (r *NotificationRepositoryImpl) CountUnreadByUserID(ctx context.Context, userID uint) (int64, error) {
	var count int64
	err := database.DB.WithContext(ctx).
		Model(&entity.Notification{}).
		Where("user_id = ? AND is_read = ?", userID, false).
		Count(&count).Error
	if err != nil {
		return 0, err
	}
	return count, nil
}

// MarkAsRead marks a notification as read
func (r *NotificationRepositoryImpl) MarkAsRead(ctx context.Context, id uint) error {
	return database.DB.WithContext(ctx).Model(&entity.Notification{}).Where("id = ?", id).Update("is_read", true).Error
}

// MarkAllAsRead marks all notifications for a user as read
func (r *NotificationRepositoryImpl) MarkAllAsRead(ctx context.Context, userID uint) error {
	return database.DB.WithContext(ctx).Model(&entity.Notification{}).Where("user_id = ?", userID).Update("is_read", true).Error
}

// Delete deletes a notification
func (r *NotificationRepositoryImpl) Delete(ctx context.Context, id uint) error {
	return database.DB.WithContext(ctx).Delete(&entity.Notification{}, id).Error
}
