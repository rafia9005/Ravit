package handler

import (
	"Ravit/internal/pkg/bus"
	"Ravit/internal/pkg/logger"
	"Ravit/internal/pkg/middleware"
	"Ravit/internal/pkg/utils"
	"Ravit/modules/bookmarks/domain/service"
	"Ravit/modules/bookmarks/dto/request"
	"Ravit/modules/bookmarks/dto/response"
	"strconv"

	"github.com/labstack/echo"
)

// BookmarkHandler handles HTTP requests for bookmarks
type BookmarkHandler struct {
	bookmarkService *service.BookmarkService
	log             *logger.Logger
	event           *bus.EventBus
	r               *utils.Response
}

// NewBookmarkHandler creates a new bookmark handler
func NewBookmarkHandler(log *logger.Logger, event *bus.EventBus, bookmarkService *service.BookmarkService) *BookmarkHandler {
	return &BookmarkHandler{
		bookmarkService: bookmarkService,
		log:             log,
		event:           event,
		r:               &utils.Response{},
	}
}

// GetBookmarks gets all bookmarks for the authenticated user
func (h *BookmarkHandler) GetBookmarks(c echo.Context) error {
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

	bookmarks, err := h.bookmarkService.GetBookmarksByUserID(ctx, userID, limit, offset)
	if err != nil {
		return h.r.InternalServerErrorResponse(c, "Failed to get bookmarks")
	}

	return h.r.SuccessResponse(c, response.FromEntities(bookmarks), "Bookmarks retrieved successfully")
}

// CreateBookmark creates a bookmark for a post
func (h *BookmarkHandler) CreateBookmark(c echo.Context) error {
	ctx := c.Request().Context()

	// Get user ID from context
	userID, ok := c.Get("user_id").(uint)
	if !ok {
		return h.r.UnauthorizedResponse(c, "Unauthorized")
	}

	req := new(request.CreateBookmarkRequest)
	if err := c.Bind(req); err != nil {
		return h.r.BadRequestResponse(c, "Invalid request data")
	}

	if err := c.Validate(req); err != nil {
		return h.r.BadRequestResponse(c, "Validation failed")
	}

	err := h.bookmarkService.BookmarkPost(ctx, userID, req.PostID)
	if err != nil {
		if err == service.ErrAlreadyBookmarked {
			return h.r.BadRequestResponse(c, "Post already bookmarked")
		}
		return h.r.InternalServerErrorResponse(c, "Failed to bookmark post")
	}

	// Publish event
	h.event.Publish(bus.Event{Type: "bookmark.created", Payload: map[string]uint{
		"user_id": userID,
		"post_id": req.PostID,
	}})

	return h.r.CreatedResponse(c, nil, "Post bookmarked successfully")
}

// DeleteBookmark removes a bookmark for a post
func (h *BookmarkHandler) DeleteBookmark(c echo.Context) error {
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

	err = h.bookmarkService.UnbookmarkPost(ctx, userID, uint(postID))
	if err != nil {
		return h.r.InternalServerErrorResponse(c, "Failed to remove bookmark")
	}

	// Publish event
	h.event.Publish(bus.Event{Type: "bookmark.deleted", Payload: map[string]uint{
		"user_id": userID,
		"post_id": uint(postID),
	}})

	return h.r.SuccessResponse(c, nil, "Bookmark removed successfully")
}

// RegisterRoutes registers the bookmark routes
func (h *BookmarkHandler) RegisterRoutes(e *echo.Echo, basePath string) {
	group := e.Group(basePath + "/bookmarks")
	group.Use(middleware.Auth)

	group.GET("", h.GetBookmarks)
	group.POST("", h.CreateBookmark)
	group.DELETE("/:post_id", h.DeleteBookmark)
}
