package handler

import (
	"Ravit/internal/pkg/bus"
	"Ravit/internal/pkg/logger"
	"Ravit/internal/pkg/middleware"
	"Ravit/internal/pkg/utils"
	"Ravit/modules/comment/domain/entity"
	"Ravit/modules/comment/domain/service"
	"Ravit/modules/comment/dto/request"
	"Ravit/modules/comment/dto/response"
	"strconv"

	"github.com/labstack/echo"
)

// CommentHandler handles HTTP requests for comments
type CommentHandler struct {
	commentService *service.CommentService
	log            *logger.Logger
	event          *bus.EventBus
	r              *utils.Response
}

// NewCommentHandler creates a new comment handler
func NewCommentHandler(log *logger.Logger, event *bus.EventBus, commentService *service.CommentService) *CommentHandler {
	return &CommentHandler{
		commentService: commentService,
		log:            log,
		event:          event,
		r:              &utils.Response{},
	}
}

// GetCommentsByPost gets comments for a post
func (h *CommentHandler) GetCommentsByPost(c echo.Context) error {
	ctx := c.Request().Context()

	postID, err := strconv.ParseUint(c.Param("post_id"), 10, 32)
	if err != nil {
		return h.r.BadRequestResponse(c, "Invalid post ID")
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

	comments, err := h.commentService.GetCommentsByPostID(ctx, uint(postID), limit, offset)
	if err != nil {
		return h.r.InternalServerErrorResponse(c, "Failed to get comments")
	}

	return h.r.SuccessResponse(c, response.FromEntities(comments), "Comments retrieved successfully")
}

// CreateComment creates a new comment
func (h *CommentHandler) CreateComment(c echo.Context) error {
	ctx := c.Request().Context()

	// Get user ID from context
	userID, ok := c.Get("user_id").(uint)
	if !ok {
		return h.r.UnauthorizedResponse(c, "Unauthorized")
	}

	postID, err := strconv.ParseUint(c.Param("post_id"), 10, 32)
	if err != nil {
		return h.r.BadRequestResponse(c, "Invalid post ID")
	}

	req := new(request.CreateCommentRequest)
	if err := c.Bind(req); err != nil {
		return h.r.BadRequestResponse(c, "Invalid request data")
	}

	if err := c.Validate(req); err != nil {
		return h.r.BadRequestResponse(c, "Validation failed")
	}

	// Create comment entity
	comment := entity.NewComment(userID, uint(postID), req.Content)

	err = h.commentService.CreateComment(ctx, comment)
	if err != nil {
		return h.r.InternalServerErrorResponse(c, "Failed to create comment")
	}

	// Publish event
	h.event.Publish(bus.Event{Type: "comment.created", Payload: comment})

	return h.r.CreatedResponse(c, response.FromEntity(comment), "Comment created successfully")
}

// UpdateComment updates a comment
func (h *CommentHandler) UpdateComment(c echo.Context) error {
	ctx := c.Request().Context()

	// Get user ID from context
	userID, ok := c.Get("user_id").(uint)
	if !ok {
		return h.r.UnauthorizedResponse(c, "Unauthorized")
	}

	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return h.r.BadRequestResponse(c, "Invalid comment ID")
	}

	req := new(request.UpdateCommentRequest)
	if err := c.Bind(req); err != nil {
		return h.r.BadRequestResponse(c, "Invalid request data")
	}

	if err := c.Validate(req); err != nil {
		return h.r.BadRequestResponse(c, "Validation failed")
	}

	// Get existing comment
	comment, err := h.commentService.GetCommentByID(ctx, uint(id))
	if err != nil {
		if err == service.ErrCommentNotFound {
			return h.r.NotFoundResponse(c, "Comment not found")
		}
		return h.r.InternalServerErrorResponse(c, "Failed to get comment")
	}

	// Update comment content
	comment.Content = req.Content
	err = h.commentService.UpdateComment(ctx, comment, userID)
	if err != nil {
		if err == service.ErrUnauthorized {
			return h.r.ForbiddenResponse(c, "You don't have permission to update this comment")
		}
		return h.r.InternalServerErrorResponse(c, "Failed to update comment")
	}

	return h.r.SuccessResponse(c, response.FromEntity(comment), "Comment updated successfully")
}

// DeleteComment deletes a comment
func (h *CommentHandler) DeleteComment(c echo.Context) error {
	ctx := c.Request().Context()

	// Get user ID from context
	userID, ok := c.Get("user_id").(uint)
	if !ok {
		return h.r.UnauthorizedResponse(c, "Unauthorized")
	}

	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return h.r.BadRequestResponse(c, "Invalid comment ID")
	}

	err = h.commentService.DeleteComment(ctx, uint(id), userID)
	if err != nil {
		if err == service.ErrCommentNotFound {
			return h.r.NotFoundResponse(c, "Comment not found")
		}
		if err == service.ErrUnauthorized {
			return h.r.ForbiddenResponse(c, "You don't have permission to delete this comment")
		}
		return h.r.InternalServerErrorResponse(c, "Failed to delete comment")
	}

	return h.r.SuccessResponse(c, nil, "Comment deleted successfully")
}

// RegisterRoutes registers the comment routes
func (h *CommentHandler) RegisterRoutes(e *echo.Echo, basePath string) {
	group := e.Group(basePath + "/posts/:post_id/comments")
	group.Use(middleware.Auth)

	group.GET("", h.GetCommentsByPost)
	group.POST("", h.CreateComment)

	commentGroup := e.Group(basePath + "/comments")
	commentGroup.Use(middleware.Auth)
	commentGroup.PUT("/:id", h.UpdateComment)
	commentGroup.DELETE("/:id", h.DeleteComment)
}
