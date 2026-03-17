package handler

import (
	"Ravit/internal/pkg/bus"
	"Ravit/internal/pkg/logger"
	"Ravit/internal/pkg/middleware"
	"Ravit/internal/pkg/utils"
	"Ravit/modules/post/domain/entity"
	"Ravit/modules/post/domain/service"
	"Ravit/modules/post/dto/request"
	"Ravit/modules/post/dto/response"
	"strconv"

	"github.com/labstack/echo"
)

// PostHandler handles HTTP requests for posts
type PostHandler struct {
	postService *service.PostService
	log         *logger.Logger
	event       *bus.EventBus
	r           *utils.Response
}

// NewPostHandler creates a new post handler
func NewPostHandler(log *logger.Logger, event *bus.EventBus, postService *service.PostService) *PostHandler {
	return &PostHandler{
		postService: postService,
		log:         log,
		event:       event,
		r:           &utils.Response{},
	}
}

// GetFeed gets the feed for the authenticated user
func (h *PostHandler) GetFeed(c echo.Context) error {
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

	posts, err := h.postService.GetFeed(ctx, userID, limit, offset)
	if err != nil {
		return h.r.InternalServerErrorResponse(c, "Failed to get feed")
	}

	return h.r.SuccessResponse(c, response.FromEntities(posts), "Feed retrieved successfully")
}

// GetPost gets a post by ID
func (h *PostHandler) GetPost(c echo.Context) error {
	ctx := c.Request().Context()

	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return h.r.BadRequestResponse(c, "Invalid post ID")
	}

	post, err := h.postService.GetPost(ctx, uint(id))
	if err != nil {
		if err == service.ErrPostNotFound {
			return h.r.NotFoundResponse(c, "Post not found")
		}
		return h.r.InternalServerErrorResponse(c, "Failed to get post")
	}

	// Increment view count
	_ = h.postService.IncrementViewCount(ctx, uint(id))

	return h.r.SuccessResponse(c, response.FromEntity(post), "Post retrieved successfully")
}

// CreatePost creates a new post
func (h *PostHandler) CreatePost(c echo.Context) error {
	ctx := c.Request().Context()

	// Get user ID from context
	userID, ok := c.Get("user_id").(uint)
	if !ok {
		return h.r.UnauthorizedResponse(c, "Unauthorized")
	}

	req := new(request.CreatePostRequest)
	if err := c.Bind(req); err != nil {
		return h.r.BadRequestResponse(c, "Invalid request data")
	}

	if err := c.Validate(req); err != nil {
		return h.r.BadRequestResponse(c, "Validation failed")
	}

	// Create post entity
	var post *entity.Post
	if req.ReplyToID != nil {
		post = entity.NewReply(userID, req.Content, *req.ReplyToID)
	} else if req.RepostID != nil {
		post = entity.NewRepost(userID, *req.RepostID, req.Content)
	} else {
		post = entity.NewPost(userID, req.Content)
	}

	// Set media URLs if provided
	if len(req.MediaURLs) > 0 {
		// TODO: Convert []string to JSON string
		// post.MediaURLs = convertToJSON(req.MediaURLs)
	}

	err := h.postService.CreatePost(ctx, post)
	if err != nil {
		return h.r.InternalServerErrorResponse(c, "Failed to create post")
	}

	// Publish event
	h.event.Publish(bus.Event{Type: "post.created", Payload: post})

	return h.r.CreatedResponse(c, response.FromEntity(post), "Post created successfully")
}

// UpdatePost updates a post
func (h *PostHandler) UpdatePost(c echo.Context) error {
	ctx := c.Request().Context()

	// Get user ID from context
	userID, ok := c.Get("user_id").(uint)
	if !ok {
		return h.r.UnauthorizedResponse(c, "Unauthorized")
	}

	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return h.r.BadRequestResponse(c, "Invalid post ID")
	}

	req := new(request.UpdatePostRequest)
	if err := c.Bind(req); err != nil {
		return h.r.BadRequestResponse(c, "Invalid request data")
	}

	if err := c.Validate(req); err != nil {
		return h.r.BadRequestResponse(c, "Validation failed")
	}

	// Get existing post
	post, err := h.postService.GetPost(ctx, uint(id))
	if err != nil {
		if err == service.ErrPostNotFound {
			return h.r.NotFoundResponse(c, "Post not found")
		}
		return h.r.InternalServerErrorResponse(c, "Failed to get post")
	}

	// Check ownership
	if post.UserID != userID {
		return h.r.ForbiddenResponse(c, "You don't have permission to update this post")
	}

	// Update post
	post.Content = req.Content
	err = h.postService.UpdatePost(ctx, post)
	if err != nil {
		return h.r.InternalServerErrorResponse(c, "Failed to update post")
	}

	return h.r.SuccessResponse(c, response.FromEntity(post), "Post updated successfully")
}

// DeletePost deletes a post
func (h *PostHandler) DeletePost(c echo.Context) error {
	ctx := c.Request().Context()

	// Get user ID from context
	userID, ok := c.Get("user_id").(uint)
	if !ok {
		return h.r.UnauthorizedResponse(c, "Unauthorized")
	}

	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return h.r.BadRequestResponse(c, "Invalid post ID")
	}

	// Get existing post
	post, err := h.postService.GetPost(ctx, uint(id))
	if err != nil {
		if err == service.ErrPostNotFound {
			return h.r.NotFoundResponse(c, "Post not found")
		}
		return h.r.InternalServerErrorResponse(c, "Failed to get post")
	}

	// Check ownership
	if post.UserID != userID {
		return h.r.ForbiddenResponse(c, "You don't have permission to delete this post")
	}

	err = h.postService.DeletePost(ctx, uint(id))
	if err != nil {
		return h.r.InternalServerErrorResponse(c, "Failed to delete post")
	}

	return h.r.SuccessResponse(c, nil, "Post deleted successfully")
}

// LikePost likes a post
func (h *PostHandler) LikePost(c echo.Context) error {
	ctx := c.Request().Context()

	// Get user ID from context
	userID, ok := c.Get("user_id").(uint)
	if !ok {
		return h.r.UnauthorizedResponse(c, "Unauthorized")
	}

	postID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return h.r.BadRequestResponse(c, "Invalid post ID")
	}

	err = h.postService.LikePost(ctx, userID, uint(postID))
	if err != nil {
		if err == service.ErrPostNotFound {
			return h.r.NotFoundResponse(c, "Post not found")
		}
		if err == service.ErrAlreadyLiked {
			return h.r.BadRequestResponse(c, "Post already liked")
		}
		return h.r.InternalServerErrorResponse(c, "Failed to like post")
	}

	return h.r.SuccessResponse(c, nil, "Post liked successfully")
}

// UnlikePost unlikes a post
func (h *PostHandler) UnlikePost(c echo.Context) error {
	ctx := c.Request().Context()

	// Get user ID from context
	userID, ok := c.Get("user_id").(uint)
	if !ok {
		return h.r.UnauthorizedResponse(c, "Unauthorized")
	}

	postID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return h.r.BadRequestResponse(c, "Invalid post ID")
	}

	err = h.postService.UnlikePost(ctx, userID, uint(postID))
	if err != nil {
		if err == service.ErrPostNotFound {
			return h.r.NotFoundResponse(c, "Post not found")
		}
		if err == service.ErrNotLiked {
			return h.r.BadRequestResponse(c, "Post not liked")
		}
		return h.r.InternalServerErrorResponse(c, "Failed to unlike post")
	}

	return h.r.SuccessResponse(c, nil, "Post unliked successfully")
}

// GetReplies gets replies to a post
func (h *PostHandler) GetReplies(c echo.Context) error {
	ctx := c.Request().Context()

	postID, err := strconv.ParseUint(c.Param("id"), 10, 32)
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

	replies, err := h.postService.GetReplies(ctx, uint(postID), limit, offset)
	if err != nil {
		return h.r.InternalServerErrorResponse(c, "Failed to get replies")
	}

	return h.r.SuccessResponse(c, response.FromEntities(replies), "Replies retrieved successfully")
}

// RegisterRoutes registers the post routes
func (h *PostHandler) RegisterRoutes(e *echo.Echo, basePath string) {
	group := e.Group(basePath + "/posts")
	group.Use(middleware.Auth)

	// Feed
	group.GET("/feed", h.GetFeed)

	// Posts CRUD
	group.GET("/:id", h.GetPost)
	group.POST("", h.CreatePost)
	group.PUT("/:id", h.UpdatePost)
	group.DELETE("/:id", h.DeletePost)

	// Likes
	group.POST("/:id/like", h.LikePost)
	group.DELETE("/:id/like", h.UnlikePost)

	// Replies
	group.GET("/:id/replies", h.GetReplies)
}
