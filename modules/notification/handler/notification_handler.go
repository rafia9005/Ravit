package handler

import (
	"Ravit/internal/pkg/bus"
	"Ravit/internal/pkg/logger"
	"Ravit/internal/pkg/middleware"
	"Ravit/internal/pkg/utils"
	"Ravit/modules/notification/domain/service"
	"Ravit/modules/notification/dto/response"
	"strconv"

	"github.com/labstack/echo"
)

// NotificationHandler handles HTTP requests for notifications
type NotificationHandler struct {
	notificationService *service.NotificationService
	log                 *logger.Logger
	event               *bus.EventBus
	r                   *utils.Response
}

// NewNotificationHandler creates a new notification handler
func NewNotificationHandler(log *logger.Logger, event *bus.EventBus, notificationService *service.NotificationService) *NotificationHandler {
	return &NotificationHandler{
		notificationService: notificationService,
		log:                 log,
		event:               event,
		r:                   &utils.Response{},
	}
}

// GetNotifications gets all notifications for the authenticated user
func (h *NotificationHandler) GetNotifications(c echo.Context) error {
	ctx := c.Request().Context()

	// Get user ID from context
	userID, ok := c.Get("user_id").(uint)
	if !ok {
		return h.r.UnauthorizedResponse(c, "Unauthorized")
	}

	// Parse pagination params
	limit, _ := strconv.Atoi(c.QueryParam("limit"))
	offset, _ := strconv.Atoi(c.QueryParam("offset"))

	if limit <= 0 || limit > 50 {
		limit = 20
	}
	if offset < 0 {
		offset = 0
	}

	notifications, err := h.notificationService.GetNotificationsByUserID(ctx, userID, limit, offset)
	if err != nil {
		return h.r.InternalServerErrorResponse(c, "Failed to get notifications")
	}

	// Get unread count
	unreadCount, _ := h.notificationService.GetUnreadCount(ctx, userID)

	data := map[string]interface{}{
		"notifications": response.FromEntities(notifications),
		"unread_count":  unreadCount,
	}

	return h.r.SuccessResponse(c, data, "Notifications retrieved successfully")
}

// MarkAsRead marks a notification as read
func (h *NotificationHandler) MarkAsRead(c echo.Context) error {
	ctx := c.Request().Context()

	// Get user ID from context
	userID, ok := c.Get("user_id").(uint)
	if !ok {
		return h.r.UnauthorizedResponse(c, "Unauthorized")
	}

	notificationID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return h.r.BadRequestResponse(c, "Invalid notification ID")
	}

	// Verify ownership
	notification, err := h.notificationService.GetNotificationByID(ctx, uint(notificationID))
	if err != nil {
		if err == service.ErrNotificationNotFound {
			return h.r.NotFoundResponse(c, "Notification not found")
		}
		return h.r.InternalServerErrorResponse(c, "Failed to get notification")
	}

	if notification.UserID != userID {
		return h.r.ForbiddenResponse(c, "You don't have permission to update this notification")
	}

	err = h.notificationService.MarkAsRead(ctx, uint(notificationID))
	if err != nil {
		return h.r.InternalServerErrorResponse(c, "Failed to mark notification as read")
	}

	return h.r.SuccessResponse(c, nil, "Notification marked as read")
}

// MarkAllAsRead marks all notifications for the user as read
func (h *NotificationHandler) MarkAllAsRead(c echo.Context) error {
	ctx := c.Request().Context()

	// Get user ID from context
	userID, ok := c.Get("user_id").(uint)
	if !ok {
		return h.r.UnauthorizedResponse(c, "Unauthorized")
	}

	err := h.notificationService.MarkAllAsRead(ctx, userID)
	if err != nil {
		return h.r.InternalServerErrorResponse(c, "Failed to mark all notifications as read")
	}

	return h.r.SuccessResponse(c, nil, "All notifications marked as read")
}

// DeleteNotification deletes a notification
func (h *NotificationHandler) DeleteNotification(c echo.Context) error {
	ctx := c.Request().Context()

	// Get user ID from context
	userID, ok := c.Get("user_id").(uint)
	if !ok {
		return h.r.UnauthorizedResponse(c, "Unauthorized")
	}

	notificationID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return h.r.BadRequestResponse(c, "Invalid notification ID")
	}

	// Verify ownership
	notification, err := h.notificationService.GetNotificationByID(ctx, uint(notificationID))
	if err != nil {
		if err == service.ErrNotificationNotFound {
			return h.r.NotFoundResponse(c, "Notification not found")
		}
		return h.r.InternalServerErrorResponse(c, "Failed to get notification")
	}

	if notification.UserID != userID {
		return h.r.ForbiddenResponse(c, "You don't have permission to delete this notification")
	}

	err = h.notificationService.DeleteNotification(ctx, uint(notificationID))
	if err != nil {
		return h.r.InternalServerErrorResponse(c, "Failed to delete notification")
	}

	return h.r.SuccessResponse(c, nil, "Notification deleted successfully")
}

// RegisterRoutes registers the notification routes
func (h *NotificationHandler) RegisterRoutes(e *echo.Echo, basePath string) {
	group := e.Group(basePath + "/notifications")
	group.Use(middleware.Auth)

	group.GET("", h.GetNotifications)
	group.PUT("/:id/read", h.MarkAsRead)
	group.PUT("/read-all", h.MarkAllAsRead)
	group.DELETE("/:id", h.DeleteNotification)
}
