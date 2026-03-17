package handler

import (
	"Ravit/internal/pkg/database"
	"Ravit/internal/pkg/logger"
	"Ravit/internal/pkg/middleware"
	"Ravit/internal/pkg/utils"
	"Ravit/modules/post/domain/entity"
	"Ravit/modules/post/dto/response"
	"strconv"

	"github.com/labstack/echo"
)

// ExploreHandler handles HTTP requests for explore/discovery features
type ExploreHandler struct {
	log *logger.Logger
	r   *utils.Response
}

// NewExploreHandler creates a new explore handler
func NewExploreHandler(log *logger.Logger) *ExploreHandler {
	return &ExploreHandler{
		log: log,
		r:   &utils.Response{},
	}
}

// GetTrending gets trending posts (most liked/replied in last 24 hours)
func (h *ExploreHandler) GetTrending(c echo.Context) error {
	ctx := c.Request().Context()

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
		Preload("User").
		Where("created_at >= NOW() - INTERVAL 24 HOUR").
		Order("(like_count + reply_count * 2) DESC").
		Limit(limit).
		Offset(offset).
		Find(&posts).Error

	if err != nil {
		return h.r.InternalServerErrorResponse(c, "Failed to get trending posts")
	}

	return h.r.SuccessResponse(c, response.FromEntities(posts), "Trending posts retrieved successfully")
}

// SearchPosts searches for posts by content
func (h *ExploreHandler) SearchPosts(c echo.Context) error {
	ctx := c.Request().Context()

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
		Preload("User").
		Where("content LIKE ?", "%"+query+"%").
		Order("created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&posts).Error

	if err != nil {
		return h.r.InternalServerErrorResponse(c, "Failed to search posts")
	}

	return h.r.SuccessResponse(c, response.FromEntities(posts), "Search results retrieved successfully")
}

// RegisterRoutes registers the explore routes
func (h *ExploreHandler) RegisterRoutes(e *echo.Echo, basePath string) {
	group := e.Group(basePath + "/explore")
	group.Use(middleware.Auth)

	group.GET("/trending", h.GetTrending)
	group.GET("/search", h.SearchPosts)
}
