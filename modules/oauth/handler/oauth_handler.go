package handler

import (
	"Ravit/internal/pkg/bus"
	"Ravit/internal/pkg/config"
	"Ravit/internal/pkg/jwt"
	"Ravit/internal/pkg/logger"
	"Ravit/modules/oauth/domain/service"
	userEntity "Ravit/modules/users/domain/entity"
	userRepository "Ravit/modules/users/domain/repository"
	"context"
	"crypto/rand"
	"encoding/base64"
	"fmt"
	"net/http"
	"net/url"
	"time"

	"github.com/labstack/echo"
)

type OAuthHandler struct {
	oauthService *service.OAuthService
	userRepo     userRepository.UserRepository
	jwtService   jwt.JWT
	log          *logger.Logger
	event        *bus.EventBus
}

func NewOAuthHandler(
	oauthService *service.OAuthService,
	userRepo userRepository.UserRepository,
	jwtService jwt.JWT,
	log *logger.Logger,
	event *bus.EventBus,
) *OAuthHandler {
	return &OAuthHandler{
		oauthService: oauthService,
		userRepo:     userRepo,
		jwtService:   jwtService,
		log:          log,
		event:        event,
	}
}

func generateStateToken() (string, error) {
	b := make([]byte, 32)
	_, err := rand.Read(b)
	if err != nil {
		return "", err
	}
	return base64.URLEncoding.EncodeToString(b), nil
}

// GoogleLogin initiates Google OAuth login
func (h *OAuthHandler) GoogleLogin(c echo.Context) error {
	state, err := generateStateToken()
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Gagal generate state token"})
	}

	// Get mode parameter (login or register)
	mode := c.QueryParam("mode")
	if mode != "register" {
		mode = "login" // default to login
	}

	// Store state in session/cookie for validation
	c.SetCookie(&http.Cookie{
		Name:     "oauth_state",
		Value:    state,
		Path:     "/",
		HttpOnly: true,
		Secure:   false, // Set to true in production with HTTPS
		MaxAge:   300,   // 5 minutes
	})

	// Store mode in cookie
	c.SetCookie(&http.Cookie{
		Name:     "oauth_mode",
		Value:    mode,
		Path:     "/",
		HttpOnly: true,
		Secure:   false,
		MaxAge:   300, // 5 minutes
	})

	url, err := h.oauthService.GetAuthURL(service.ProviderGoogle, state)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Gagal generate OAuth URL"})
	}

	return c.JSON(http.StatusOK, map[string]string{"url": url})
}

// GoogleCallback handles Google OAuth callback
func (h *OAuthHandler) GoogleCallback(c echo.Context) error {
	ctx := c.Request().Context()

	// Validate state
	stateCookie, err := c.Cookie("oauth_state")
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "State token tidak ditemukan"})
	}

	state := c.QueryParam("state")
	if state != stateCookie.Value {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "State token tidak valid"})
	}

	// Get mode from cookie
	modeCookie, err := c.Cookie("oauth_mode")
	mode := "login" // default
	if err == nil {
		mode = modeCookie.Value
	}

	// Clear state and mode cookies
	c.SetCookie(&http.Cookie{
		Name:   "oauth_state",
		Value:  "",
		Path:   "/",
		MaxAge: -1,
	})
	c.SetCookie(&http.Cookie{
		Name:   "oauth_mode",
		Value:  "",
		Path:   "/",
		MaxAge: -1,
	})

	code := c.QueryParam("code")
	if code == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Authorization code tidak ditemukan"})
	}

	// Exchange code for token
	token, err := h.oauthService.ExchangeCode(ctx, service.ProviderGoogle, code)
	if err != nil {
		h.log.Error("Failed to exchange code: %v", err)
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Gagal exchange authorization code"})
	}

	// Get user info
	userInfo, err := h.oauthService.GetUserInfo(ctx, service.ProviderGoogle, token)
	if err != nil {
		h.log.Error("Failed to get user info: %v", err)
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Gagal mendapatkan informasi pengguna"})
	}

	// Find or create user
	user, err := h.findOrCreateUser(ctx, userInfo, mode)
	if err != nil {
		h.log.Error("Failed to find or create user: %v", err)
		// Check if it's an auth type mismatch error or user not found on login
		frontendURL := config.GetString("APP_FRONTEND")
		redirectURL := fmt.Sprintf("%s/login?error=%s", frontendURL, url.QueryEscape(err.Error()))
		return c.Redirect(http.StatusFound, redirectURL)
	}

	// Generate JWT token
	jwtToken, err := h.jwtService.GenerateToken(map[string]interface{}{
		"user_id": user.ID,
		"email":   user.Email,
		"role":    user.Role,
	})
	if err != nil {
		h.log.Error("Failed to generate JWT: %v", err)
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Gagal generate token"})
	}

	// Redirect to frontend with token
	frontendURL := config.GetString("APP_FRONTEND")
	redirectURL := fmt.Sprintf("%s/auth/oauth-callback?token=%s", frontendURL, jwtToken)
	return c.Redirect(http.StatusFound, redirectURL)
}

// GitHubLogin initiates GitHub OAuth login
func (h *OAuthHandler) GitHubLogin(c echo.Context) error {
	state, err := generateStateToken()
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Gagal generate state token"})
	}

	// Get mode parameter (login or register)
	mode := c.QueryParam("mode")
	if mode != "register" {
		mode = "login" // default to login
	}

	// Store state in session/cookie for validation
	c.SetCookie(&http.Cookie{
		Name:     "oauth_state",
		Value:    state,
		Path:     "/",
		HttpOnly: true,
		Secure:   false, // Set to true in production with HTTPS
		MaxAge:   300,   // 5 minutes
	})

	// Store mode in cookie
	c.SetCookie(&http.Cookie{
		Name:     "oauth_mode",
		Value:    mode,
		Path:     "/",
		HttpOnly: true,
		Secure:   false,
		MaxAge:   300, // 5 minutes
	})

	url, err := h.oauthService.GetAuthURL(service.ProviderGitHub, state)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Gagal generate OAuth URL"})
	}

	return c.JSON(http.StatusOK, map[string]string{"url": url})
}

// GitHubCallback handles GitHub OAuth callback
func (h *OAuthHandler) GitHubCallback(c echo.Context) error {
	ctx := c.Request().Context()

	// Validate state
	stateCookie, err := c.Cookie("oauth_state")
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "State token tidak ditemukan"})
	}

	state := c.QueryParam("state")
	if state != stateCookie.Value {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "State token tidak valid"})
	}

	// Get mode from cookie
	modeCookie, err := c.Cookie("oauth_mode")
	mode := "login" // default
	if err == nil {
		mode = modeCookie.Value
	}

	// Clear state and mode cookies
	c.SetCookie(&http.Cookie{
		Name:   "oauth_state",
		Value:  "",
		Path:   "/",
		MaxAge: -1,
	})
	c.SetCookie(&http.Cookie{
		Name:   "oauth_mode",
		Value:  "",
		Path:   "/",
		MaxAge: -1,
	})

	code := c.QueryParam("code")
	if code == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Authorization code tidak ditemukan"})
	}

	// Exchange code for token
	token, err := h.oauthService.ExchangeCode(ctx, service.ProviderGitHub, code)
	if err != nil {
		h.log.Error("Failed to exchange code: %v", err)
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Gagal exchange authorization code"})
	}

	// Get user info
	userInfo, err := h.oauthService.GetUserInfo(ctx, service.ProviderGitHub, token)
	if err != nil {
		h.log.Error("Failed to get user info: %v", err)
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Gagal mendapatkan informasi pengguna"})
	}

	// Find or create user
	user, err := h.findOrCreateUser(ctx, userInfo, mode)
	if err != nil {
		h.log.Error("Failed to find or create user: %v", err)
		// Check if it's an auth type mismatch error or user not found on login
		frontendURL := config.GetString("APP_FRONTEND")
		redirectURL := fmt.Sprintf("%s/login?error=%s", frontendURL, url.QueryEscape(err.Error()))
		return c.Redirect(http.StatusFound, redirectURL)
	}

	// Generate JWT token
	jwtToken, err := h.jwtService.GenerateToken(map[string]interface{}{
		"user_id": user.ID,
		"email":   user.Email,
		"role":    user.Role,
	})
	if err != nil {
		h.log.Error("Failed to generate JWT: %v", err)
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Gagal generate token"})
	}

	// Redirect to frontend with token
	frontendURL := config.GetString("APP_FRONTEND")
	redirectURL := fmt.Sprintf("%s/auth/oauth-callback?token=%s", frontendURL, jwtToken)
	return c.Redirect(http.StatusFound, redirectURL)
}

func (h *OAuthHandler) findOrCreateUser(ctx context.Context, userInfo *service.OAuthUserInfo, mode string) (*userEntity.User, error) {
	// Determine auth type based on provider
	var expectedAuthType string
	if userInfo.Provider == "google" {
		expectedAuthType = userEntity.AuthTypeGoogle
	} else if userInfo.Provider == "github" {
		expectedAuthType = userEntity.AuthTypeGitHub
	} else {
		expectedAuthType = userEntity.AuthTypeEmail
	}

	// Try to find user by email
	user, err := h.userRepo.FindByEmail(ctx, userInfo.Email)
	if err == nil {
		// User exists, check if auth type matches
		if user.AuthType != expectedAuthType {
			// Auth type mismatch - user registered with different method
			h.log.Warn("Auth type mismatch for user %s: expected %s, got %s", user.Email, expectedAuthType, user.AuthType)
			return nil, fmt.Errorf("email %s sudah terdaftar dengan metode login berbeda. Silakan gunakan metode login yang sama atau email lain", user.Email)
		}

		// User exists with matching auth type, update avatar if different
		if user.Avatar != userInfo.Avatar {
			user.Avatar = userInfo.Avatar
			user.UpdatedAt = time.Now()
			if err := h.userRepo.Update(ctx, user); err != nil {
				h.log.Error("Failed to update user avatar: %v", err)
			}
		}
		return user, nil
	}

	// User doesn't exist
	// If mode is "login", don't allow creating new user
	if mode == "login" {
		h.log.Warn("User not found on login attempt for email: %s with provider: %s", userInfo.Email, userInfo.Provider)
		return nil, fmt.Errorf("email %s belum terdaftar. Silakan daftar terlebih dahulu atau gunakan email lain", userInfo.Email)
	}

	// If mode is "register", create new user with OAuth auth type
	newUser := userEntity.NewOAuthUser(
		userInfo.Name,
		userInfo.Email,
		userInfo.Avatar,
		expectedAuthType,
	)
	// Set placeholder password for OAuth users
	newUser.Password = fmt.Sprintf("oauth_%s_%s", userInfo.Provider, userInfo.ID)

	if err := h.userRepo.Create(ctx, newUser); err != nil {
		return nil, err
	}

	// Publish event
	h.event.Publish(bus.Event{
		Type: "user.created.oauth",
		Payload: map[string]interface{}{
			"user_id":  newUser.ID,
			"provider": userInfo.Provider,
		},
	})

	return newUser, nil
}

// RegisterRoutes registers OAuth routes
func (h *OAuthHandler) RegisterRoutes(e *echo.Echo, basePath string) {
	group := e.Group(basePath + "/oauth")

	// Google OAuth
	group.GET("/google/login", h.GoogleLogin)
	group.GET("/google/callback", h.GoogleCallback)

	// GitHub OAuth
	group.GET("/github/login", h.GitHubLogin)
	group.GET("/github/callback", h.GitHubCallback)
}
