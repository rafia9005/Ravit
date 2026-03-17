package service

import (
	"Ravit/internal/pkg/jwt"
	"Ravit/internal/pkg/utils"
	authEntity "Ravit/modules/auth/domain/entity"
	authRepository "Ravit/modules/auth/domain/repository"
	userEntity "Ravit/modules/users/domain/entity"
	userRepository "Ravit/modules/users/domain/repository"
	"context"
	"errors"
	"time"
)

// Errors
var (
	ErrUserNotFound         = errors.New("user not found")
	ErrEmailAlreadyUsed     = errors.New("email already in use")
	ErrInvalidPassword      = errors.New("invalid password")
	ErrInvalidToken         = errors.New("invalid refresh token")
	ErrEmailRegisteredOAuth = errors.New("email sudah terdaftar dengan akun OAuth (Google/GitHub). Silakan login dengan OAuth atau gunakan email lain")
)

// AuthService handles user authentication
type AuthService struct {
	userRepo  userRepository.UserRepository
	tokenRepo authRepository.TokenRepository
	jwt       jwt.JWT
}

// NewAuthService creates a new AuthService
func NewAuthService(userRepo userRepository.UserRepository, tokenRepo authRepository.TokenRepository, jwtService jwt.JWT) *AuthService {
	if userRepo == nil {
		panic("userRepo cannot be nil")
	}
	if tokenRepo == nil {
		panic("tokenRepo cannot be nil")
	}
	if jwtService == nil {
		panic("jwtService cannot be nil")
	}
	return &AuthService{
		userRepo:  userRepo,
		tokenRepo: tokenRepo,
		jwt:       jwtService,
	}
}

// CreateUser creates a new user
func (s *AuthService) CreateUser(ctx context.Context, user *userEntity.User) error {
	if user.Email == "" || user.Password == "" {
		return errors.New("email and password cannot be empty")
	}

	existingUser, err := s.userRepo.FindByEmail(ctx, user.Email)
	if err != nil && err.Error() != "record not found" {
		return err
	}
	if existingUser != nil {
		// Check if user registered with OAuth
		if existingUser.AuthType == "google" || existingUser.AuthType == "github" {
			return ErrEmailRegisteredOAuth
		}
		// User exists with email auth type
		return ErrEmailAlreadyUsed
	}

	// Set auth type for email registration
	user.AuthType = "email"

	// Hash the password before saving the user
	hashedPassword, err := utils.HashPassword(user.Password)
	if err != nil {
		return err
	}
	user.Password = hashedPassword

	return s.userRepo.Create(ctx, user)
}

// ProcessLogin handles user login and password verification
func (s *AuthService) ProcessLogin(ctx context.Context, email, password string) (*userEntity.User, error) {
	// Validate input
	if email == "" || password == "" {
		return nil, errors.New("email and password cannot be empty")
	}

	// Find user by email
	existingUser, err := s.userRepo.FindByEmail(ctx, email)
	if err != nil {
		if err.Error() == "record not found" {
			return nil, ErrUserNotFound
		}
		return nil, err
	}

	// Compare the provided password with the hashed password in the database
	if !utils.CompareHashAndPassword(existingUser.Password, password) {
		return nil, ErrInvalidPassword
	}

	// Return the authenticated user
	return existingUser, nil
}

// GenerateTokens generates both access and refresh tokens
func (s *AuthService) GenerateTokens(ctx context.Context, user *userEntity.User) (*authEntity.Token, string, string, error) {
	tokenData := map[string]interface{}{
		"user_id": user.ID,
		"email":   user.Email,
		"name":    user.Name,
	}

	// Generate access token
	accessToken, err := s.jwt.GenerateAccessToken(tokenData)
	if err != nil {
		return nil, "", "", err
	}

	// Generate refresh token
	refreshToken, err := s.jwt.GenerateRefreshToken(tokenData)
	if err != nil {
		return nil, "", "", err
	}

	// Delete old refresh token if exists
	_ = s.tokenRepo.DeleteByUserID(ctx, user.ID)

	// Save refresh token to database
	expiresAt := time.Now().Add(7 * 24 * time.Hour)
	tokenEntity := authEntity.NewToken(user.ID, refreshToken, expiresAt)
	err = s.tokenRepo.Create(ctx, tokenEntity)
	if err != nil {
		return nil, "", "", err
	}

	return tokenEntity, accessToken, refreshToken, nil
}

// RefreshAccessToken refreshes the access token using refresh token
func (s *AuthService) RefreshAccessToken(ctx context.Context, refreshToken string) (string, error) {
	// Validate refresh token
	isValid, err := s.jwt.ValidateToken(refreshToken)
	if err != nil || !isValid {
		return "", ErrInvalidToken
	}

	// Parse refresh token to get user ID
	claims, err := s.jwt.ParseToken(refreshToken)
	if err != nil {
		return "", ErrInvalidToken
	}

	// Check if token type is refresh
	tokenType, ok := claims["type"].(string)
	if !ok || tokenType != "refresh" {
		return "", ErrInvalidToken
	}

	// Find token in database
	token, err := s.tokenRepo.FindByToken(ctx, refreshToken)
	if err != nil {
		return "", ErrInvalidToken
	}

	// Check if token is expired
	if token.IsExpired() {
		return "", ErrInvalidToken
	}

	// Get user
	userID, ok := claims["user_id"].(float64)
	if !ok {
		return "", ErrInvalidToken
	}

	user, err := s.userRepo.FindByID(ctx, uint(userID))
	if err != nil {
		return "", ErrUserNotFound
	}

	// Generate new access token
	tokenData := map[string]interface{}{
		"user_id": user.ID,
		"email":   user.Email,
		"name":    user.Name,
	}

	accessToken, err := s.jwt.GenerateAccessToken(tokenData)
	if err != nil {
		return "", err
	}

	return accessToken, nil
}

// ChangePassword changes user password
func (s *AuthService) ChangePassword(ctx context.Context, userID uint, password string) (*userEntity.User, error) {
	if password == "" {
		return nil, errors.New("password cannot be empty")
	}

	hashedPassword, err := utils.HashPassword(password)
	if err != nil {
		return nil, errors.New("failed to hash password")
	}

	user, err := s.userRepo.FindByID(ctx, userID)
	if err != nil {
		return nil, errors.New("user not found")
	}

	user.Password = hashedPassword

	err = s.userRepo.Update(ctx, user)
	if err != nil {
		return nil, errors.New("failed to update password")
	}

	return user, nil
}

// Logout invalidates the refresh token
func (s *AuthService) Logout(ctx context.Context, userID uint) error {
	return s.tokenRepo.DeleteByUserID(ctx, userID)
}
