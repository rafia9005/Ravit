package handler

import (
	"Ravit/internal/pkg/database"
	"Ravit/internal/pkg/logger"
	"Ravit/internal/pkg/middleware"
	"Ravit/internal/pkg/utils"
	"Ravit/modules/post/domain/entity"
	"Ravit/modules/post/domain/service"
	"Ravit/modules/post/dto/response"
	userEntity "Ravit/modules/users/domain/entity"
	userRepository "Ravit/modules/users/domain/repository"
	"context"
	"strconv"

	"github.com/labstack/echo"
)

// ExploreHandler handles HTTP requests for explore/discovery features
type ExploreHandler struct {
	log         *logger.Logger
	r           *utils.Response
	userRepo    userRepository.UserRepository
	postService *service.PostService
}

// NewExploreHandler creates a new explore handler
func NewExploreHandler(log *logger.Logger, userRepo userRepository.UserRepository, postService *service.PostService) *ExploreHandler {
	return &ExploreHandler{
		log:         log,
		r:           &utils.Response{},
		userRepo:    userRepo,
		postService: postService,
	}
}

// fetchUsersForPosts is a helper that fetches user info for a list of posts
func (h *ExploreHandler) fetchUsersForPosts(ctx context.Context, posts []*entity.Post) []*userEntity.User {
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

// GetTrending gets trending posts (most liked/replied in last 24 hours)
func (h *ExploreHandler) GetTrending(c echo.Context) error {
	ctx := c.Request().Context()

	// Get user ID from context (may be 0 if not authenticated)
	userID, _ := c.Get("user_id").(uint)

	// Parse pagination params
	limit, _ := strconv.Atoi(c.QueryParam("limit"))
	offset, _ := strconv.Atoi(c.QueryParam("offset"))

	if limit <= 0 || limit > 50 {
		limit = 20
	}
	if offset < 0 {
		offset = 0
	}

	var posts []*entity.Post
	err := database.DB.WithContext(ctx).
		Where("created_at >= NOW() - INTERVAL 24 HOUR").
		Order("(like_count + reply_count * 2) DESC").
		Limit(limit).
		Offset(offset).
		Find(&posts).Error

	if err != nil {
		return h.r.InternalServerErrorResponse(c, "Failed to get trending posts")
	}

	// Fetch users and return posts with user info
	users := h.fetchUsersForPosts(ctx, posts)

	// Get like status for current user
	var likeStatus map[uint]bool
	if userID > 0 {
		postIDs := make([]uint, len(posts))
		for i, post := range posts {
			postIDs[i] = post.ID
		}
		likeStatus, _ = h.postService.GetLikeStatusForPosts(ctx, userID, postIDs)
	}

	return h.r.SuccessResponse(c, response.FromEntitiesWithUsersAndStatus(posts, users, likeStatus, nil), "Trending posts retrieved successfully")
}

// SearchPosts searches for posts by content
func (h *ExploreHandler) SearchPosts(c echo.Context) error {
	ctx := c.Request().Context()

	// Get user ID from context (may be 0 if not authenticated)
	userID, _ := c.Get("user_id").(uint)

	query := c.QueryParam("q")
	if query == "" {
		return h.r.BadRequestResponse(c, "Search query is required")
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

	var posts []*entity.Post
	err := database.DB.WithContext(ctx).
		Where("content LIKE ?", "%"+query+"%").
		Order("created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&posts).Error

	if err != nil {
		return h.r.InternalServerErrorResponse(c, "Failed to search posts")
	}

	// Fetch users and return posts with user info
	users := h.fetchUsersForPosts(ctx, posts)

	// Get like status for current user
	var likeStatus map[uint]bool
	if userID > 0 {
		postIDs := make([]uint, len(posts))
		for i, post := range posts {
			postIDs[i] = post.ID
		}
		likeStatus, _ = h.postService.GetLikeStatusForPosts(ctx, userID, postIDs)
	}

	return h.r.SuccessResponse(c, response.FromEntitiesWithUsersAndStatus(posts, users, likeStatus, nil), "Search results retrieved successfully")
}

// RegisterRoutes registers the explore routes
func (h *ExploreHandler) RegisterRoutes(e *echo.Echo, basePath string) {
	group := e.Group(basePath + "/explore")
	group.Use(middleware.Auth)

	group.GET("/trending", h.GetTrending)
	group.GET("/search", h.SearchPosts)
}
