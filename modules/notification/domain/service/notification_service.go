package service

import (
	"Ravit/modules/notification/domain/entity"
	"Ravit/modules/notification/domain/repository"
	"context"
	"errors"
)

// Errors
var (
	ErrNotificationNotFound = errors.New("notification not found")
)

// NotificationService handles notification domain logic
type NotificationService struct {
	notificationRepo repository.NotificationRepository
}

// NewNotificationService creates a new notification service
func NewNotificationService(notificationRepo repository.NotificationRepository) *NotificationService {
	return &NotificationService{
		notificationRepo: notificationRepo,
	}
}

// CreateNotification creates a new notification
func (s *NotificationService) CreateNotification(ctx context.Context, notification *entity.Notification) error {
	return s.notificationRepo.Create(ctx, notification)
}

// GetNotificationByID gets a notification by ID
func (s *NotificationService) GetNotificationByID(ctx context.Context, id uint) (*entity.Notification, error) {
	notification, err := s.notificationRepo.FindByID(ctx, id)
	if err != nil {
		return nil, ErrNotificationNotFound
	}
	return notification, nil
}

// GetNotificationsByUserID gets all notifications for a user
func (s *NotificationService) GetNotificationsByUserID(ctx context.Context, userID uint, limit, offset int) ([]*entity.Notification, error) {
	return s.notificationRepo.FindByUserID(ctx, userID, limit, offset)
}

// GetUnreadCount gets the count of unread notifications for a user
func (s *NotificationService) GetUnreadCount(ctx context.Context, userID uint) (int64, error) {
	return s.notificationRepo.CountUnreadByUserID(ctx, userID)
}

// MarkAsRead marks a notification as read
func (s *NotificationService) MarkAsRead(ctx context.Context, id uint) error {
	return s.notificationRepo.MarkAsRead(ctx, id)
}

// MarkAllAsRead marks all notifications for a user as read
func (s *NotificationService) MarkAllAsRead(ctx context.Context, userID uint) error {
	return s.notificationRepo.MarkAllAsRead(ctx, userID)
}

// DeleteNotification deletes a notification
func (s *NotificationService) DeleteNotification(ctx context.Context, id uint) error {
	return s.notificationRepo.Delete(ctx, id)
}
