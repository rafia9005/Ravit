// internal/modules/user/interfaces/handler/user_handler.go

package handler

import (
	"Ravit/internal/pkg/bus"
	"Ravit/internal/pkg/logger"
	"Ravit/internal/pkg/middleware"
	"Ravit/internal/pkg/utils"
	"Ravit/modules/users/domain/entity"
	"Ravit/modules/users/domain/service"
	"Ravit/modules/users/dto/request"
	"Ravit/modules/users/dto/response"
	"fmt"
	"net/http"
	"strconv"

	"github.com/labstack/echo"
)

// UserHandler handles HTTP requests for users
type UserHandler struct {
	userService *service.UserService
	log         *logger.Logger
	event       *bus.EventBus
	r           *utils.Response
}

// NewUserHandler creates a new user handler
func NewUserHandler(log *logger.Logger, event *bus.EventBus, userService *service.UserService) *UserHandler {
	return &UserHandler{
		userService: userService,
		log:         log,
		event:       event,
		r:           &utils.Response{},
	}
}

// Event Bus Event user created
func (h *UserHandler) Handle(event bus.Event) {
	fmt.Printf("User created: %v", event.Payload)
}

// GetAllUsers gets all users
func (h *UserHandler) GetAllUsers(c echo.Context) error {
	ctx := c.Request().Context()

	users, err := h.userService.GetAllUsers(ctx)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to get users"})
	}

	return c.JSON(http.StatusOK, response.FromEntities(users))
}

// GetUser gets a user by ID
func (h *UserHandler) GetUser(c echo.Context) error {
	ctx := c.Request().Context()

	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid user ID"})
	}

	user, err := h.userService.GetUserByID(ctx, uint(id))
	if err != nil {
		if err == service.ErrUserNotFound {
			return c.JSON(http.StatusNotFound, map[string]string{"error": "User not found"})
		}
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to get user"})
	}

	return c.JSON(http.StatusOK, response.FromEntity(user))
}

// CreateUser creates a new user
func (h *UserHandler) CreateUser(c echo.Context) error {
	ctx := c.Request().Context()

	req := new(request.CreateUserRequest)
	if err := c.Bind(req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid request data"})
	}

	if err := c.Validate(req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Validation failed"})
	}

	user := entity.NewUser(req.Name, req.Email, req.Password)
	if req.Role != "" {
		user.Role = req.Role
	}
	user.Bio = req.Bio
	user.Avatar = req.Avatar
	err := h.userService.CreateUser(ctx, user)
	if err != nil {
		if err == service.ErrEmailAlreadyUsed {
			return c.JSON(http.StatusConflict, map[string]string{"error": "Email already in use"})
		}
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to create user"})
	}

	// event bus publish
	h.event.Publish(bus.Event{Type: "user.created", Payload: user})

	return c.JSON(http.StatusCreated, response.FromEntity(user))
}

// UpdateUser updates a user
func (h *UserHandler) UpdateUser(c echo.Context) error {
	ctx := c.Request().Context()

	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid user ID"})
	}

	req := new(request.UpdateUserRequest)
	if err := c.Bind(req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid request data"})
	}

	if err := c.Validate(req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Validation failed"})
	}

	user, err := h.userService.GetUserByID(ctx, uint(id))
	if err != nil {
		if err == service.ErrUserNotFound {
			return c.JSON(http.StatusNotFound, map[string]string{"error": "User not found"})
		}
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to get user"})
	}

	user.Name = req.Name
	user.Email = req.Email
	if req.Password != "" {
		user.Password = req.Password
	}
	if req.Role != "" {
		user.Role = req.Role
	}
	user.Bio = req.Bio
	user.Avatar = req.Avatar

	err = h.userService.UpdateUser(ctx, user)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to update user"})
	}

	return c.JSON(http.StatusOK, response.FromEntity(user))
}

// DeleteUser deletes a user
func (h *UserHandler) DeleteUser(c echo.Context) error {
	ctx := c.Request().Context()

	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid user ID"})
	}

	err = h.userService.DeleteUser(ctx, uint(id))
	if err != nil {
		if err == service.ErrUserNotFound {
			return c.JSON(http.StatusNotFound, map[string]string{"error": "User not found"})
		}
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to delete user"})
	}

	return c.NoContent(http.StatusNoContent)
}

// GetCurrentUser gets the current authenticated user
func (h *UserHandler) GetCurrentUser(c echo.Context) error {
	ctx := c.Request().Context()

	// Get user ID from context (set by auth middleware)
	userID, ok := c.Get("user_id").(uint)
	if !ok {
		return h.r.UnauthorizedResponse(c, "Unauthorized")
	}

	user, err := h.userService.GetUserByID(ctx, userID)
	if err != nil {
		if err == service.ErrUserNotFound {
			return h.r.NotFoundResponse(c, "User not found")
		}
		return h.r.InternalServerErrorResponse(c, "Failed to get user")
	}

	return h.r.SuccessResponse(c, response.FromEntity(user), "User retrieved successfully")
}

// GetUserProfile gets a user profile by username
func (h *UserHandler) GetUserProfile(c echo.Context) error {
	ctx := c.Request().Context()

	username := c.Param("username")
	if username == "" {
		return h.r.BadRequestResponse(c, "Username is required")
	}

	user, err := h.userService.GetUserByUsername(ctx, username)
	if err != nil {
		if err == service.ErrUserNotFound {
			return h.r.NotFoundResponse(c, "User not found")
		}
		return h.r.InternalServerErrorResponse(c, "Failed to get user profile")
	}

	return h.r.SuccessResponse(c, response.FromEntity(user), "User profile retrieved successfully")
}

// RegisterRoutes registers the user routes
func (h *UserHandler) RegisterRoutes(e *echo.Echo, basePath string) {
	group := e.Group(basePath + "/users")

	// Public routes (no auth required)
	group.POST("", h.CreateUser)
	group.GET("/:username/profile", h.GetUserProfile)

	// Protected routes (auth required)
	authGroup := e.Group(basePath + "/users")
	authGroup.Use(middleware.Auth)
	authGroup.GET("", h.GetAllUsers)
	authGroup.GET("/me", h.GetCurrentUser)
	authGroup.GET("/:id", h.GetUser)
	authGroup.PUT("/:id", h.UpdateUser)
	authGroup.DELETE("/:id", h.DeleteUser)
}
