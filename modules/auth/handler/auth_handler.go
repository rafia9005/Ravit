package handler

import (
	"Ravit/internal/pkg/bus"
	"Ravit/internal/pkg/jwt"
	"Ravit/internal/pkg/logger"
	"Ravit/internal/pkg/utils"
	"Ravit/modules/auth/domain/service"
	authRequest "Ravit/modules/auth/dto/request"
	authResponse "Ravit/modules/auth/dto/response"
	userEntity "Ravit/modules/users/domain/entity"
	userRequest "Ravit/modules/users/dto/request"
	userResponse "Ravit/modules/users/dto/response"
	"fmt"
	"net/http"

	"github.com/labstack/echo"
)

// AuthHandler struct handles HTTP request for auth.
type AuthHandler struct {
	authService *service.AuthService
	log         *logger.Logger
	event       *bus.EventBus
	jwt         jwt.JWT
	r           *utils.Response
}

// NewAuthHandler creates a new auth handler.
func NewAuthHandler(log *logger.Logger, event *bus.EventBus, authService *service.AuthService, jwt jwt.JWT) *AuthHandler {
	return &AuthHandler{
		authService: authService,
		log:         log,
		event:       event,
		jwt:         jwt,
		r:           &utils.Response{},
	}
}

// Initialize Event Handle.
func (h *AuthHandler) Handle(event bus.Event) {
	fmt.Printf("User created: %v", event.Payload)
}

// Register handles user registration.
func (h *AuthHandler) Register(c echo.Context) error {
	h.log.Info("Handling register request")

	req := new(userRequest.CreateUserRequest)
	if err := c.Bind(req); err != nil {
		h.log.Error("Failed to bind request:", err)
		return h.r.ErrorResponse(c, http.StatusBadRequest, "Invalid request data")
	}

	if err := c.Validate(req); err != nil {
		h.log.Error("Validation failed:", err)
		return h.r.ErrorResponse(c, http.StatusBadRequest, "Validation failed")
	}

	h.log.Debug("Request validated successfully:", req)

	user := userEntity.NewUser(req.Name, req.Email, req.Password)
	if req.Role != "" {
		user.Role = req.Role
	}
	user.Bio = req.Bio
	user.Avatar = req.Avatar
	err := h.authService.CreateUser(c.Request().Context(), user)
	if err != nil {
		if err == service.ErrEmailAlreadyUsed {
			h.log.Warn("Email already in use:", req.Email)
			return h.r.ErrorResponse(c, http.StatusConflict, "Email already in use")
		}
		h.log.Error("Failed to create user:", err)
		return h.r.ErrorResponse(c, http.StatusInternalServerError, "Failed to create user")
	}

	h.log.Debug("User created successfully:", user)

	h.event.Publish(bus.Event{Type: "user.created", Payload: user})
	h.log.Debug("Event 'user.created' published successfully")

	return h.r.SuccessResponse(c, map[string]interface{}{
		"user": userResponse.FromEntity(user),
	}, "User registered successfully")
}

// Login handles user login.
func (h *AuthHandler) Login(c echo.Context) error {
	h.log.Info("Handling login request")

	req := new(userRequest.LoginRequest)
	if err := c.Bind(req); err != nil {
		h.log.Error("Failed to bind request:", err)
		return h.r.ErrorResponse(c, http.StatusBadRequest, "Invalid request data")
	}

	if err := c.Validate(req); err != nil {
		h.log.Error("Validation failed:", err)
		return h.r.ErrorResponse(c, http.StatusBadRequest, "Validation failed")
	}

	h.log.Debug("Request validated successfully:", req)

	user, err := h.authService.ProcessLogin(c.Request().Context(), req.Email, req.Password)
	if err != nil {
		if err == service.ErrUserNotFound || err == service.ErrInvalidPassword {
			h.log.Warn("Invalid email or password for:", req.Email)
			return h.r.ErrorResponse(c, http.StatusUnauthorized, "Invalid email or password")
		}
		h.log.Error("Failed to process login:", err)
		return h.r.ErrorResponse(c, http.StatusInternalServerError, "Failed to process login")
	}

	h.log.Debug("User authenticated successfully:", user)

	// Generate access and refresh tokens
	_, accessToken, refreshToken, err := h.authService.GenerateTokens(c.Request().Context(), user)
	if err != nil {
		h.log.Error("Failed to generate tokens:", err)
		return h.r.ErrorResponse(c, http.StatusInternalServerError, "Failed to generate tokens")
	}

	tokenResp := authResponse.NewTokenResponse(accessToken, refreshToken, 15*60)

	return h.r.SuccessResponse(c, map[string]interface{}{
		"token": tokenResp,
		"user":  userResponse.FromEntity(user),
	}, "Login successful")
}

// RefreshToken handles token refresh request
func (h *AuthHandler) RefreshToken(c echo.Context) error {
	h.log.Info("Handling refresh token request")

	req := new(authRequest.RefreshTokenRequest)
	if err := c.Bind(req); err != nil {
		h.log.Error("Failed to bind request:", err)
		return h.r.ErrorResponse(c, http.StatusBadRequest, "Invalid request data")
	}

	if err := c.Validate(req); err != nil {
		h.log.Error("Validation failed:", err)
		return h.r.ErrorResponse(c, http.StatusBadRequest, "Validation failed")
	}

	h.log.Debug("Request validated successfully")

	// Refresh access token
	accessToken, err := h.authService.RefreshAccessToken(c.Request().Context(), req.RefreshToken)
	if err != nil {
		h.log.Warn("Invalid refresh token:", err)
		return h.r.ErrorResponse(c, http.StatusUnauthorized, "Invalid refresh token")
	}

	h.log.Debug("Access token refreshed successfully")

	tokenResp := authResponse.NewTokenResponse(accessToken, req.RefreshToken, 15*60)

	return h.r.SuccessResponse(c, map[string]interface{}{
		"token": tokenResp,
	}, "Token refreshed successfully")
}

// Logout handles user logout
func (h *AuthHandler) Logout(c echo.Context) error {
	h.log.Info("Handling logout request")

	// Get user ID from context (set by auth middleware)
	userID, ok := c.Get("user_id").(uint)
	if !ok {
		// If user_id is not in context, it means token is invalid/expired
		// This is acceptable for logout - user is already effectively logged out
		h.log.Info("User ID not found in context, treating as already logged out")
		return h.r.SuccessResponse(c, map[string]interface{}{}, "Logged out successfully")
	}

	// Invalidate refresh token in database
	err := h.authService.Logout(c.Request().Context(), userID)
	if err != nil {
		h.log.Error("Failed to logout:", err)
		return h.r.ErrorResponse(c, http.StatusInternalServerError, "Failed to logout")
	}

	h.log.Debug("User logged out successfully")

	return h.r.SuccessResponse(c, map[string]interface{}{}, "Logged out successfully")
}

// RegisterRoutes sets up the auth routes.
func (h *AuthHandler) RegisterRoutes(e *echo.Echo, basePath string) {
	group := e.Group(basePath + "/auth")
	group.POST("/register", h.Register)
	group.POST("/login", h.Login)
	group.POST("/refresh", h.RefreshToken)
	group.POST("/logout", h.Logout)
}
