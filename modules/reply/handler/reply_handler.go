package handler

import (
	"Ravit/internal/pkg/bus"
	"Ravit/internal/pkg/logger"
	"Ravit/internal/pkg/middleware"
	"Ravit/internal/pkg/utils"
	"Ravit/modules/reply/domain/entity"
	"Ravit/modules/reply/domain/service"
	"Ravit/modules/reply/dto/request"
	"Ravit/modules/reply/dto/response"
	"strconv"

	"github.com/labstack/echo"
)

// ReplyHandler handles HTTP requests for replies
type ReplyHandler struct {
	replyService *service.ReplyService
	log          *logger.Logger
	event        *bus.EventBus
	r            *utils.Response
}

// NewReplyHandler creates a new reply handler
func NewReplyHandler(log *logger.Logger, event *bus.EventBus, replyService *service.ReplyService) *ReplyHandler {
	return &ReplyHandler{
		replyService: replyService,
		log:          log,
		event:        event,
		r:            &utils.Response{},
	}
}

// GetRepliesByComment gets replies for a specific comment
func (h *ReplyHandler) GetRepliesByComment(c echo.Context) error {
	ctx := c.Request().Context()

	commentID, err := strconv.ParseUint(c.Param("comment_id"), 10, 32)
	if err != nil {
		return h.r.BadRequestResponse(c, "Invalid comment ID")
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

	replies, err := h.replyService.GetRepliesByCommentID(ctx, uint(commentID), limit, offset)
	if err != nil {
		return h.r.InternalServerErrorResponse(c, "Failed to get replies")
	}

	return h.r.SuccessResponse(c, response.FromEntities(replies), "Replies retrieved successfully")
}

// CreateReply creates a new reply
func (h *ReplyHandler) CreateReply(c echo.Context) error {
	ctx := c.Request().Context()

	// Get user ID from context
	userID, ok := c.Get("user_id").(uint)
	if !ok {
		return h.r.UnauthorizedResponse(c, "Unauthorized")
	}

	commentID, err := strconv.ParseUint(c.Param("comment_id"), 10, 32)
	if err != nil {
		return h.r.BadRequestResponse(c, "Invalid comment ID")
	}

	req := new(request.CreateReplyRequest)
	if err := c.Bind(req); err != nil {
		return h.r.BadRequestResponse(c, "Invalid request data")
	}

	if err := c.Validate(req); err != nil {
		return h.r.BadRequestResponse(c, "Validation failed")
	}

	// Create reply entity
	reply := entity.NewReply(userID, uint(commentID), req.Content)

	err = h.replyService.CreateReply(ctx, reply)
	if err != nil {
		return h.r.InternalServerErrorResponse(c, "Failed to create reply")
	}

	// Publish event
	h.event.Publish(bus.Event{Type: "reply.created", Payload: reply})

	return h.r.CreatedResponse(c, response.FromEntity(reply), "Reply created successfully")
}

// UpdateReply updates a reply
func (h *ReplyHandler) UpdateReply(c echo.Context) error {
	ctx := c.Request().Context()

	// Get user ID from context
	userID, ok := c.Get("user_id").(uint)
	if !ok {
		return h.r.UnauthorizedResponse(c, "Unauthorized")
	}

	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return h.r.BadRequestResponse(c, "Invalid reply ID")
	}

	req := new(request.UpdateReplyRequest)
	if err := c.Bind(req); err != nil {
		return h.r.BadRequestResponse(c, "Invalid request data")
	}

	if err := c.Validate(req); err != nil {
		return h.r.BadRequestResponse(c, "Validation failed")
	}

	// Get existing reply
	reply, err := h.replyService.GetReplyByID(ctx, uint(id))
	if err != nil {
		if err == service.ErrReplyNotFound {
			return h.r.NotFoundResponse(c, "Reply not found")
		}
		return h.r.InternalServerErrorResponse(c, "Failed to get reply")
	}

	// Update reply
	reply.Content = req.Content
	err = h.replyService.UpdateReply(ctx, reply, userID)
	if err != nil {
		if err == service.ErrUnauthorized {
			return h.r.ForbiddenResponse(c, "You don't have permission to update this reply")
		}
		return h.r.InternalServerErrorResponse(c, "Failed to update reply")
	}

	return h.r.SuccessResponse(c, response.FromEntity(reply), "Reply updated successfully")
}

// DeleteReply deletes a reply
func (h *ReplyHandler) DeleteReply(c echo.Context) error {
	ctx := c.Request().Context()

	// Get user ID from context
	userID, ok := c.Get("user_id").(uint)
	if !ok {
		return h.r.UnauthorizedResponse(c, "Unauthorized")
	}

	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return h.r.BadRequestResponse(c, "Invalid reply ID")
	}

	err = h.replyService.DeleteReply(ctx, uint(id), userID)
	if err != nil {
		if err == service.ErrReplyNotFound {
			return h.r.NotFoundResponse(c, "Reply not found")
		}
		if err == service.ErrUnauthorized {
			return h.r.ForbiddenResponse(c, "You don't have permission to delete this reply")
		}
		return h.r.InternalServerErrorResponse(c, "Failed to delete reply")
	}

	return h.r.SuccessResponse(c, nil, "Reply deleted successfully")
}

// RegisterRoutes registers the reply routes
func (h *ReplyHandler) RegisterRoutes(e *echo.Echo, basePath string) {
	group := e.Group(basePath + "/comments")
	group.Use(middleware.Auth)

	// Replies for a comment
	group.GET("/:comment_id/replies", h.GetRepliesByComment)
	group.POST("/:comment_id/replies", h.CreateReply)

	// Individual reply operations
	replyGroup := e.Group(basePath + "/replies")
	replyGroup.Use(middleware.Auth)
	replyGroup.PUT("/:id", h.UpdateReply)
	replyGroup.DELETE("/:id", h.DeleteReply)
}
