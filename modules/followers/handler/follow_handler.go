package handler

import (
	"Ravit/internal/pkg/bus"
	"Ravit/internal/pkg/logger"
	"Ravit/internal/pkg/middleware"
	"Ravit/internal/pkg/utils"
	"Ravit/modules/followers/domain/service"
	"Ravit/modules/followers/dto/request"
	"Ravit/modules/followers/dto/response"
	userRepo "Ravit/modules/users/domain/repository"
	"strconv"

	"github.com/labstack/echo"
)

// FollowHandler handles HTTP requests for follows
type FollowHandler struct {
	followService *service.FollowService
	userRepo      userRepo.UserRepository
	log           *logger.Logger
	event         *bus.EventBus
	r             *utils.Response
}

// NewFollowHandler creates a new follow handler
func NewFollowHandler(log *logger.Logger, event *bus.EventBus, followService *service.FollowService, userRepo userRepo.UserRepository) *FollowHandler {
	return &FollowHandler{
		followService: followService,
		userRepo:      userRepo,
		log:           log,
		event:         event,
		r:             &utils.Response{},
	}
}

// FollowUser follows a user
func (h *FollowHandler) FollowUser(c echo.Context) error {
	ctx := c.Request().Context()

	// Get user ID from context (the follower)
	userID, ok := c.Get("user_id").(uint)
	if !ok {
		return h.r.UnauthorizedResponse(c, "Unauthorized")
	}

	req := new(request.FollowUserRequest)
	if err := c.Bind(req); err != nil {
		return h.r.BadRequestResponse(c, "Invalid request data")
	}

	if err := c.Validate(req); err != nil {
		return h.r.BadRequestResponse(c, "Validation failed")
	}

	err := h.followService.FollowUser(ctx, userID, req.UserID)
	if err != nil {
		if err == service.ErrAlreadyFollowing {
			return h.r.BadRequestResponse(c, "Already following this user")
		}
		if err == service.ErrCannotFollowSelf {
			return h.r.BadRequestResponse(c, "Cannot follow yourself")
		}
		return h.r.InternalServerErrorResponse(c, "Failed to follow user")
	}

	// Publish event
	h.event.Publish(bus.Event{Type: "follow.created", Payload: map[string]uint{
		"follower_id":  userID,
		"following_id": req.UserID,
	}})

	return h.r.CreatedResponse(c, nil, "User followed successfully")
}

// UnfollowUser unfollows a user
func (h *FollowHandler) UnfollowUser(c echo.Context) error {
	ctx := c.Request().Context()

	// Get user ID from context
	userID, ok := c.Get("user_id").(uint)
	if !ok {
		return h.r.UnauthorizedResponse(c, "Unauthorized")
	}

	followingID, err := strconv.ParseUint(c.Param("user_id"), 10, 32)
	if err != nil {
		return h.r.BadRequestResponse(c, "Invalid user ID")
	}

	err = h.followService.UnfollowUser(ctx, userID, uint(followingID))
	if err != nil {
		return h.r.InternalServerErrorResponse(c, "Failed to unfollow user")
	}

	// Publish event
	h.event.Publish(bus.Event{Type: "follow.deleted", Payload: map[string]uint{
		"follower_id":  userID,
		"following_id": uint(followingID),
	}})

	return h.r.SuccessResponse(c, nil, "User unfollowed successfully")
}

// GetFollowers gets all followers of a user
func (h *FollowHandler) GetFollowers(c echo.Context) error {
	ctx := c.Request().Context()

	userIDParam := c.Param("user_id")
	userID, err := strconv.ParseUint(userIDParam, 10, 32)
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

	follows, err := h.followService.GetFollowers(ctx, uint(userID), limit, offset)
	if err != nil {
		return h.r.InternalServerErrorResponse(c, "Failed to get followers")
	}

	// Get user IDs for enrichment
	userIDs := make([]uint, len(follows))
	for i, f := range follows {
		userIDs[i] = f.FollowerID
	}

	// Fetch user details
	users, err := h.userRepo.FindByIDs(ctx, userIDs)
	if err != nil {
		return h.r.InternalServerErrorResponse(c, "Failed to get user details")
	}

	// Create user map
	userMap := make(map[uint]*response.UserInfo)
	for _, u := range users {
		userMap[u.ID] = &response.UserInfo{
			ID:       u.ID,
			Username: u.Username,
			Name:     u.Name,
			Avatar:   u.Avatar,
		}
	}

	return h.r.SuccessResponse(c, response.FromEntitiesWithFollowerUsers(follows, userMap), "Followers retrieved successfully")
}

// GetFollowing gets all users that a user is following
func (h *FollowHandler) GetFollowing(c echo.Context) error {
	ctx := c.Request().Context()

	userIDParam := c.Param("user_id")
	userID, err := strconv.ParseUint(userIDParam, 10, 32)
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

	follows, err := h.followService.GetFollowing(ctx, uint(userID), limit, offset)
	if err != nil {
		return h.r.InternalServerErrorResponse(c, "Failed to get following")
	}

	// Get user IDs for enrichment
	userIDs := make([]uint, len(follows))
	for i, f := range follows {
		userIDs[i] = f.FollowingID
	}

	// Fetch user details
	users, err := h.userRepo.FindByIDs(ctx, userIDs)
	if err != nil {
		return h.r.InternalServerErrorResponse(c, "Failed to get user details")
	}

	// Create user map
	userMap := make(map[uint]*response.UserInfo)
	for _, u := range users {
		userMap[u.ID] = &response.UserInfo{
			ID:       u.ID,
			Username: u.Username,
			Name:     u.Name,
			Avatar:   u.Avatar,
		}
	}

	return h.r.SuccessResponse(c, response.FromEntitiesWithFollowingUsers(follows, userMap), "Following retrieved successfully")
}

// CheckFollowing checks if the authenticated user is following another user
func (h *FollowHandler) CheckFollowing(c echo.Context) error {
	ctx := c.Request().Context()

	// Get authenticated user ID
	userID, ok := c.Get("user_id").(uint)
	if !ok {
		return h.r.UnauthorizedResponse(c, "Unauthorized")
	}

	targetUserID, err := strconv.ParseUint(c.Param("user_id"), 10, 32)
	if err != nil {
		return h.r.BadRequestResponse(c, "Invalid user ID")
	}

	isFollowing, err := h.followService.IsFollowing(ctx, userID, uint(targetUserID))
	if err != nil {
		return h.r.InternalServerErrorResponse(c, "Failed to check follow status")
	}

	return h.r.SuccessResponse(c, &response.IsFollowingResponse{IsFollowing: isFollowing}, "Follow status retrieved successfully")
}

// GetFollowCounts gets the follower and following counts for a user
func (h *FollowHandler) GetFollowCounts(c echo.Context) error {
	ctx := c.Request().Context()

	userIDParam := c.Param("user_id")
	userID, err := strconv.ParseUint(userIDParam, 10, 32)
	if err != nil {
		return h.r.BadRequestResponse(c, "Invalid user ID")
	}

	followersCount, err := h.followService.GetFollowerCount(ctx, uint(userID))
	if err != nil {
		return h.r.InternalServerErrorResponse(c, "Failed to get followers count")
	}

	followingCount, err := h.followService.GetFollowingCount(ctx, uint(userID))
	if err != nil {
		return h.r.InternalServerErrorResponse(c, "Failed to get following count")
	}

	return h.r.SuccessResponse(c, &response.FollowCountResponse{
		FollowersCount: followersCount,
		FollowingCount: followingCount,
	}, "Follow counts retrieved successfully")
}

// RegisterRoutes registers the follow routes
func (h *FollowHandler) RegisterRoutes(e *echo.Echo, basePath string) {
	group := e.Group(basePath + "/follows")

	// Public routes
	group.GET("/users/:user_id/followers", h.GetFollowers)
	group.GET("/users/:user_id/following", h.GetFollowing)
	group.GET("/users/:user_id/counts", h.GetFollowCounts)

	// Protected routes
	group.POST("", h.FollowUser, middleware.Auth)
	group.DELETE("/:user_id", h.UnfollowUser, middleware.Auth)
	group.GET("/check/:user_id", h.CheckFollowing, middleware.Auth)
}
