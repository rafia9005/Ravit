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
	userRepository "Ravit/modules/users/domain/repository"
	"strconv"

	"github.com/labstack/echo"
)

// CommentHandler handles HTTP requests for comments
type CommentHandler struct {
	commentService *service.CommentService
	userRepo       userRepository.UserRepository
	log            *logger.Logger
	event          *bus.EventBus
	r              *utils.Response
}

// NewCommentHandler creates a new comment handler
func NewCommentHandler(log *logger.Logger, event *bus.EventBus, commentService *service.CommentService, userRepo userRepository.UserRepository) *CommentHandler {
	return &CommentHandler{
		commentService: commentService,
		userRepo:       userRepo,
		log:            log,
		event:          event,
		r:              &utils.Response{},
	}
}

// fetchUsersForComments extracts unique user IDs from a list of comments
func (h *CommentHandler) fetchUsersForComments(comments []*entity.Comment) []uint {
	userIDMap := make(map[uint]bool)
	for _, comment := range comments {
		userIDMap[comment.UserID] = true
	}
	userIDs := make([]uint, 0, len(userIDMap))
	for id := range userIDMap {
		userIDs = append(userIDs, id)
	}
	return userIDs
}

// GetCommentsByPost gets top-level comments for a post with reply counts
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

	// Get top-level comments only (parent_id IS NULL)
	comments, err := h.commentService.GetTopLevelCommentsByPostID(ctx, uint(postID), limit, offset)
	if err != nil {
		return h.r.InternalServerErrorResponse(c, "Failed to get comments")
	}

	// Fetch users for comments
	userIDs := h.fetchUsersForComments(comments)
	users, err := h.userRepo.FindByIDs(ctx, userIDs)
	if err != nil {
		h.log.Error("Failed to fetch users for comments: %v", err)
		return h.r.SuccessResponse(c, response.FromEntities(comments), "Comments retrieved successfully")
	}

	// Fetch reply counts for each comment
	replyCounts := make(map[uint]int64)
	for _, comment := range comments {
		count, err := h.commentService.CountReplies(ctx, comment.ID)
		if err == nil {
			replyCounts[comment.ID] = count
		}
	}

	return h.r.SuccessResponse(c, response.FromEntitiesWithUsersAndReplyCounts(comments, users, replyCounts), "Comments retrieved successfully")
}

// GetReplies gets replies for a specific comment
func (h *CommentHandler) GetReplies(c echo.Context) error {
	ctx := c.Request().Context()

	commentID, err := strconv.ParseUint(c.Param("id"), 10, 32)
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

	replies, err := h.commentService.GetRepliesByCommentID(ctx, uint(commentID), limit, offset)
	if err != nil {
		return h.r.InternalServerErrorResponse(c, "Failed to get replies")
	}

	// Fetch users for replies
	userIDs := h.fetchUsersForComments(replies)
	users, err := h.userRepo.FindByIDs(ctx, userIDs)
	if err != nil {
		h.log.Error("Failed to fetch users for replies: %v", err)
		return h.r.SuccessResponse(c, response.FromEntities(replies), "Replies retrieved successfully")
	}

	return h.r.SuccessResponse(c, response.FromEntitiesWithUsers(replies, users), "Replies retrieved successfully")
}

// CreateComment creates a new comment or reply
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

	var comment *entity.Comment

	// Check if this is a reply or a top-level comment
	if req.ParentID != nil {
		// Create a reply
		comment, err = h.commentService.CreateReply(ctx, userID, uint(postID), *req.ParentID, req.Content)
		if err != nil {
			if err == service.ErrInvalidParent {
				return h.r.BadRequestResponse(c, "Invalid parent comment")
			}
			return h.r.InternalServerErrorResponse(c, "Failed to create reply")
		}
		h.event.Publish(bus.Event{Type: "reply.created", Payload: comment})
	} else {
		// Create a top-level comment
		comment = entity.NewComment(userID, uint(postID), req.Content)
		err = h.commentService.CreateComment(ctx, comment)
		if err != nil {
			return h.r.InternalServerErrorResponse(c, "Failed to create comment")
		}
		h.event.Publish(bus.Event{Type: "comment.created", Payload: comment})
	}

	// Fetch user info for response
	user, _ := h.userRepo.FindByID(ctx, userID)
	resp := response.FromEntity(comment)
	if user != nil {
		resp.User = &response.UserInfo{
			ID:       user.ID,
			Name:     user.Name,
			Username: user.Username,
			Avatar:   user.Avatar,
		}
	}

	return h.r.CreatedResponse(c, resp, "Comment created successfully")
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
	commentGroup.GET("/:id/replies", h.GetReplies)
	commentGroup.PUT("/:id", h.UpdateComment)
	commentGroup.DELETE("/:id", h.DeleteComment)
}
