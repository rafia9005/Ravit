package service

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"

	"golang.org/x/oauth2"
	"golang.org/x/oauth2/github"
	"golang.org/x/oauth2/google"
)

var (
	ErrInvalidProvider = errors.New("invalid OAuth provider")
	ErrCodeExchange    = errors.New("failed to exchange authorization code")
	ErrUserInfo        = errors.New("failed to get user info")
)

type OAuthProvider string

const (
	ProviderGoogle OAuthProvider = "google"
	ProviderGitHub OAuthProvider = "github"
)

type OAuthUserInfo struct {
	ID       string `json:"id"`
	Email    string `json:"email"`
	Name     string `json:"name"`
	Avatar   string `json:"avatar"`
	Provider string `json:"provider"`
}

type OAuthService struct {
	googleConfig *oauth2.Config
	githubConfig *oauth2.Config
}

func NewOAuthService(googleClientID, googleClientSecret, googleRedirectURL string,
	githubClientID, githubClientSecret, githubRedirectURL string) *OAuthService {

	googleConfig := &oauth2.Config{
		ClientID:     googleClientID,
		ClientSecret: googleClientSecret,
		RedirectURL:  googleRedirectURL,
		Scopes: []string{
			"https://www.googleapis.com/auth/userinfo.email",
			"https://www.googleapis.com/auth/userinfo.profile",
		},
		Endpoint: google.Endpoint,
	}

	githubConfig := &oauth2.Config{
		ClientID:     githubClientID,
		ClientSecret: githubClientSecret,
		RedirectURL:  githubRedirectURL,
		Scopes:       []string{"user:email"},
		Endpoint:     github.Endpoint,
	}

	return &OAuthService{
		googleConfig: googleConfig,
		githubConfig: githubConfig,
	}
}

func (s *OAuthService) GetAuthURL(provider OAuthProvider, state string) (string, error) {
	switch provider {
	case ProviderGoogle:
		return s.googleConfig.AuthCodeURL(state), nil
	case ProviderGitHub:
		return s.githubConfig.AuthCodeURL(state), nil
	default:
		return "", ErrInvalidProvider
	}
}

func (s *OAuthService) ExchangeCode(ctx context.Context, provider OAuthProvider, code string) (*oauth2.Token, error) {
	switch provider {
	case ProviderGoogle:
		return s.googleConfig.Exchange(ctx, code)
	case ProviderGitHub:
		return s.githubConfig.Exchange(ctx, code)
	default:
		return nil, ErrInvalidProvider
	}
}

func (s *OAuthService) GetUserInfo(ctx context.Context, provider OAuthProvider, token *oauth2.Token) (*OAuthUserInfo, error) {
	switch provider {
	case ProviderGoogle:
		return s.getGoogleUserInfo(ctx, token)
	case ProviderGitHub:
		return s.getGitHubUserInfo(ctx, token)
	default:
		return nil, ErrInvalidProvider
	}
}

func (s *OAuthService) getGoogleUserInfo(ctx context.Context, token *oauth2.Token) (*OAuthUserInfo, error) {
	client := s.googleConfig.Client(ctx, token)

	resp, err := client.Get("https://www.googleapis.com/oauth2/v2/userinfo")
	if err != nil {
		return nil, fmt.Errorf("%w: %v", ErrUserInfo, err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("%w: %v", ErrUserInfo, err)
	}

	var data struct {
		ID      string `json:"id"`
		Email   string `json:"email"`
		Name    string `json:"name"`
		Picture string `json:"picture"`
	}

	if err := json.Unmarshal(body, &data); err != nil {
		return nil, fmt.Errorf("%w: %v", ErrUserInfo, err)
	}

	return &OAuthUserInfo{
		ID:       data.ID,
		Email:    data.Email,
		Name:     data.Name,
		Avatar:   data.Picture,
		Provider: string(ProviderGoogle),
	}, nil
}

func (s *OAuthService) getGitHubUserInfo(ctx context.Context, token *oauth2.Token) (*OAuthUserInfo, error) {
	client := s.githubConfig.Client(ctx, token)

	// Get user profile
	resp, err := client.Get("https://api.github.com/user")
	if err != nil {
		return nil, fmt.Errorf("%w: %v", ErrUserInfo, err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("%w: %v", ErrUserInfo, err)
	}

	var data struct {
		ID        int64  `json:"id"`
		Login     string `json:"login"`
		Name      string `json:"name"`
		Email     string `json:"email"`
		AvatarURL string `json:"avatar_url"`
	}

	if err := json.Unmarshal(body, &data); err != nil {
		return nil, fmt.Errorf("%w: %v", ErrUserInfo, err)
	}

	// If email is not public, fetch from emails endpoint
	email := data.Email
	if email == "" {
		emailResp, err := client.Get("https://api.github.com/user/emails")
		if err == nil {
			defer emailResp.Body.Close()
			emailBody, err := io.ReadAll(emailResp.Body)
			if err == nil {
				var emails []struct {
					Email    string `json:"email"`
					Primary  bool   `json:"primary"`
					Verified bool   `json:"verified"`
				}
				if json.Unmarshal(emailBody, &emails) == nil {
					for _, e := range emails {
						if e.Primary && e.Verified {
							email = e.Email
							break
						}
					}
				}
			}
		}
	}

	name := data.Name
	if name == "" {
		name = data.Login
	}

	return &OAuthUserInfo{
		ID:       fmt.Sprintf("%d", data.ID),
		Email:    email,
		Name:     name,
		Avatar:   data.AvatarURL,
		Provider: string(ProviderGitHub),
	}, nil
}
