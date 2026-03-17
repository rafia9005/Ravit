package request

// RefreshTokenRequest represents a request to refresh token
type RefreshTokenRequest struct {
	RefreshToken string `json:"refresh_token" validate:"required"`
}
