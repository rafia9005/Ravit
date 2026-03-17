package response

// TokenResponse represents the token response
type TokenResponse struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
	TokenType    string `json:"token_type"`
	ExpiresIn    int    `json:"expires_in"` // in seconds
}

// NewTokenResponse creates a new token response
func NewTokenResponse(accessToken, refreshToken string, expiresIn int) *TokenResponse {
	return &TokenResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		TokenType:    "Bearer",
		ExpiresIn:    expiresIn,
	}
}

// AuthResponse represents the complete auth response
type AuthResponse struct {
	User  interface{}   `json:"user"`
	Token TokenResponse `json:"token"`
}

// NewAuthResponse creates a new auth response
func NewAuthResponse(user interface{}, token TokenResponse) *AuthResponse {
	return &AuthResponse{
		User:  user,
		Token: token,
	}
}
