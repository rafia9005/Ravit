package handler

import (
	"Ravit/internal/pkg/bus"
	"Ravit/internal/pkg/logger"
	"Ravit/internal/pkg/media"
	"Ravit/internal/pkg/middleware"
	"Ravit/internal/pkg/utils"
	"Ravit/modules/post/domain/entity"
	"Ravit/modules/post/domain/service"
	"Ravit/modules/post/dto/request"
	"Ravit/modules/post/dto/response"
	userEntity "Ravit/modules/users/domain/entity"
	userRepository "Ravit/modules/users/domain/repository"
	"context"
	"encoding/json"
	"strconv"

	"github.com/labstack/echo"
)

// PostHandler handles HTTP requests for posts
type PostHandler struct {
	postService   *service.PostService
	userRepo      userRepository.UserRepository
	log           *logger.Logger
	event         *bus.EventBus
	r             *utils.Response
	mediaUploader *media.MediaUploader
}

// NewPostHandler creates a new post handler
func NewPostHandler(log *logger.Logger, event *bus.EventBus, postService *service.PostService, mediaUploader *media.MediaUploader, userRepo userRepository.UserRepository) *PostHandler {
	return &PostHandler{
		postService:   postService,
		userRepo:      userRepo,
		log:           log,
		event:         event,
		r:             &utils.Response{},
		mediaUploader: mediaUploader,
	}
}

// fetchUsersForPosts is a helper that fetches user info for a list of posts
func (h *PostHandler) fetchUsersForPosts(ctx context.Context, posts []*entity.Post) []*userEntity.User {
	// Collect unique user IDs from posts
	userIDSet := make(map[uint]bool)
	for _, post := range posts {
		userIDSet[post.UserID] = true
	}
	userIDs := make([]uint, 0, len(userIDSet))
	for id := range userIDSet {
		userIDs = append(userIDs, id)
	}

	// Fetch users
	users, err := h.userRepo.FindByIDs(ctx, userIDs)
	if err != nil {
		h.log.Error("Failed to fetch users for posts: %v", err)
		return nil
	}
	return users
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

	// Fetch users
	users := h.fetchUsersForPosts(ctx, posts)

	// Get post IDs for status check
	postIDs := make([]uint, len(posts))
	for i, post := range posts {
		postIDs[i] = post.ID
	}

	// Get like status for current user
	likeStatus, _ := h.postService.GetLikeStatusForPosts(ctx, userID, postIDs)

	return h.r.SuccessResponse(c, response.FromEntitiesWithUsersAndStatus(posts, users, likeStatus, nil), "Feed retrieved successfully")
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

	// Fetch user info for the post
	resp := response.FromEntity(post)
	user, err := h.userRepo.FindByID(ctx, post.UserID)
	if err == nil && user != nil {
		resp.User = &response.UserInfo{
			ID:       user.ID,
			Name:     user.Name,
			Username: user.Username,
			Avatar:   user.Avatar,
		}
	}

	return h.r.SuccessResponse(c, resp, "Post retrieved successfully")
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
		// Convert []string to JSON string
		mediaJSON, err := json.Marshal(req.MediaURLs)
		if err == nil {
			post.MediaURLs = string(mediaJSON)
		}
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

	// Get user ID from context (may be 0 if not authenticated)
	userID, _ := c.Get("user_id").(uint)

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

	// Fetch users and return replies with user info
	users := h.fetchUsersForPosts(ctx, replies)

	// Get like status for current user
	var likeStatus map[uint]bool
	if userID > 0 {
		postIDs := make([]uint, len(replies))
		for i, reply := range replies {
			postIDs[i] = reply.ID
		}
		likeStatus, _ = h.postService.GetLikeStatusForPosts(ctx, userID, postIDs)
	}

	return h.r.SuccessResponse(c, response.FromEntitiesWithUsersAndStatus(replies, users, likeStatus, nil), "Replies retrieved successfully")
}

// UploadImages uploads images for a post
func (h *PostHandler) UploadImages(c echo.Context) error {
	// Get user ID from context
	_, ok := c.Get("user_id").(uint)
	if !ok {
		return h.r.UnauthorizedResponse(c, "Unauthorized")
	}

	// Parse multipart form with max 50MB
	if err := c.Request().ParseMultipartForm(50 * 1024 * 1024); err != nil {
		return h.r.BadRequestResponse(c, "Failed to parse multipart form")
	}

	files := c.Request().MultipartForm.File["images"]
	if len(files) == 0 {
		return h.r.BadRequestResponse(c, "No images provided")
	}

	// Validate image count (max 10)
	if len(files) > 10 {
		return h.r.BadRequestResponse(c, "Maximum 10 images allowed per upload")
	}

	// Upload images
	var uploadedURLs []string
	for _, file := range files {
		// Upload image
		url, err := h.mediaUploader.UploadImage(file)
		if err != nil {
			h.log.Error("Failed to upload image", err)
			return h.r.BadRequestResponse(c, "Failed to upload image: "+err.Error())
		}

		uploadedURLs = append(uploadedURLs, url)
	}

	return h.r.SuccessResponse(c, map[string]interface{}{"media_urls": uploadedURLs}, "Images uploaded successfully")
}

// UploadVideos uploads videos for a post
func (h *PostHandler) UploadVideos(c echo.Context) error {
	// Get user ID from context
	_, ok := c.Get("user_id").(uint)
	if !ok {
		return h.r.UnauthorizedResponse(c, "Unauthorized")
	}

	// Parse multipart form with max 500MB
	if err := c.Request().ParseMultipartForm(500 * 1024 * 1024); err != nil {
		return h.r.BadRequestResponse(c, "Failed to parse multipart form")
	}

	files := c.Request().MultipartForm.File["videos"]
	if len(files) == 0 {
		return h.r.BadRequestResponse(c, "No videos provided")
	}

	// Validate video count (max 5)
	if len(files) > 5 {
		return h.r.BadRequestResponse(c, "Maximum 5 videos allowed per upload")
	}

	// Upload videos
	var uploadedURLs []string
	for _, file := range files {
		// Upload video
		url, err := h.mediaUploader.UploadVideo(file)
		if err != nil {
			h.log.Error("Failed to upload video", err)
			return h.r.BadRequestResponse(c, "Failed to upload video: "+err.Error())
		}

		uploadedURLs = append(uploadedURLs, url)
	}

	return h.r.SuccessResponse(c, map[string]interface{}{"media_urls": uploadedURLs}, "Videos uploaded successfully")
}

// GetUserPosts gets posts by a specific user
func (h *PostHandler) GetUserPosts(c echo.Context) error {
	ctx := c.Request().Context()

	userID, err := strconv.ParseUint(c.Param("userId"), 10, 32)
	if err != nil {
		return h.r.BadRequestResponse(c, "Invalid user ID")
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

	posts, err := h.postService.GetUserPosts(ctx, uint(userID), limit, offset)
	if err != nil {
		return h.r.InternalServerErrorResponse(c, "Failed to get user posts")
	}

	// Fetch users
	users := h.fetchUsersForPosts(ctx, posts)

	// Get current user ID if authenticated (optional for like status)
	currentUserID, _ := c.Get("user_id").(uint)

	// Get like status if user is authenticated
	var likeStatus map[uint]bool
	if currentUserID > 0 && len(posts) > 0 {
		postIDs := make([]uint, len(posts))
		for i, post := range posts {
			postIDs[i] = post.ID
		}
		likeStatus, _ = h.postService.GetLikeStatusForPosts(ctx, currentUserID, postIDs)
	}

	return h.r.SuccessResponse(c, response.FromEntitiesWithUsersAndStatus(posts, users, likeStatus, nil), "User posts retrieved successfully")
}

// GetUserLikes gets posts liked by a specific user
func (h *PostHandler) GetUserLikes(c echo.Context) error {
	ctx := c.Request().Context()

	userID, err := strconv.ParseUint(c.Param("userId"), 10, 32)
	if err != nil {
		return h.r.BadRequestResponse(c, "Invalid user ID")
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

	posts, err := h.postService.GetUserLikedPosts(ctx, uint(userID), limit, offset)
	if err != nil {
		return h.r.InternalServerErrorResponse(c, "Failed to get user likes")
	}

	// Fetch users
	users := h.fetchUsersForPosts(ctx, posts)

	// Get current user ID if authenticated (optional for like status)
	currentUserID, _ := c.Get("user_id").(uint)

	// Get like status if user is authenticated
	// For liked posts, all should be marked as liked by default for the viewing user
	var likeStatus map[uint]bool
	if currentUserID > 0 && len(posts) > 0 {
		postIDs := make([]uint, len(posts))
		for i, post := range posts {
			postIDs[i] = post.ID
		}
		likeStatus, _ = h.postService.GetLikeStatusForPosts(ctx, currentUserID, postIDs)
	}

	return h.r.SuccessResponse(c, response.FromEntitiesWithUsersAndStatus(posts, users, likeStatus, nil), "User likes retrieved successfully")
}

// RegisterRoutes registers the post routes
func (h *PostHandler) RegisterRoutes(e *echo.Echo, basePath string) {
	// Public routes (no auth required)
	publicGroup := e.Group(basePath + "/posts")
	publicGroup.GET("/:id", h.GetPost)
	publicGroup.GET("/:id/replies", h.GetReplies)

	// Protected routes (auth required)
	authGroup := e.Group(basePath + "/posts")
	authGroup.Use(middleware.Auth)

	// Feed
	authGroup.GET("/feed", h.GetFeed)

	// Posts CRUD
	authGroup.POST("", h.CreatePost)
	authGroup.PUT("/:id", h.UpdatePost)
	authGroup.DELETE("/:id", h.DeletePost)

	// Likes
	authGroup.POST("/:id/like", h.LikePost)
	authGroup.DELETE("/:id/like", h.UnlikePost)

	// Media uploads
	authGroup.POST("/media/upload-images", h.UploadImages)
	authGroup.POST("/media/upload-videos", h.UploadVideos)

	// User routes for posts (under /users prefix but handled by post handler)
	userGroup := e.Group(basePath + "/users")
	userGroup.Use(middleware.Auth)
	userGroup.GET("/:userId/posts", h.GetUserPosts)
	userGroup.GET("/:userId/likes", h.GetUserLikes)
}
