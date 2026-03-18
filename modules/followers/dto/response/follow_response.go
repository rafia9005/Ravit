package response

import (
	"Ravit/modules/followers/domain/entity"
	"time"
)

// FollowResponse represents a follow relationship response
type FollowResponse struct {
	ID          uint      `json:"id"`
	FollowerID  uint      `json:"follower_id"`
	FollowingID uint      `json:"following_id"`
	CreatedAt   time.Time `json:"created_at"`
}

// UserFollowResponse represents a user in a follow list with user details
type UserFollowResponse struct {
	ID        uint      `json:"id"`
	UserID    uint      `json:"user_id"`
	Username  string    `json:"username"`
	Name      string    `json:"name"`
	Avatar    string    `json:"avatar"`
	CreatedAt time.Time `json:"created_at"`
}

// FollowCountResponse represents follow count statistics
type FollowCountResponse struct {
	FollowersCount int64 `json:"followers_count"`
	FollowingCount int64 `json:"following_count"`
}

// IsFollowingResponse represents the is following check response
type IsFollowingResponse struct {
	IsFollowing bool `json:"is_following"`
}

// FromEntity converts an entity to a response
func FromEntity(follow *entity.Follow) *FollowResponse {
	return &FollowResponse{
		ID:          follow.ID,
		FollowerID:  follow.FollowerID,
		FollowingID: follow.FollowingID,
		CreatedAt:   follow.CreatedAt,
	}
}

// FromEntities converts multiple entities to responses
func FromEntities(follows []*entity.Follow) []*FollowResponse {
	responses := make([]*FollowResponse, len(follows))
	for i, follow := range follows {
		responses[i] = FromEntity(follow)
	}
	return responses
}

// UserInfo represents basic user info for enrichment
type UserInfo struct {
	ID       uint
	Username string
	Name     string
	Avatar   string
}

// FromEntitiesWithFollowerUsers converts follows to responses with follower user details
func FromEntitiesWithFollowerUsers(follows []*entity.Follow, users map[uint]*UserInfo) []*UserFollowResponse {
	responses := make([]*UserFollowResponse, 0, len(follows))
	for _, follow := range follows {
		if user, ok := users[follow.FollowerID]; ok {
			responses = append(responses, &UserFollowResponse{
				ID:        follow.ID,
				UserID:    follow.FollowerID,
				Username:  user.Username,
				Name:      user.Name,
				Avatar:    user.Avatar,
				CreatedAt: follow.CreatedAt,
			})
		}
	}
	return responses
}

// FromEntitiesWithFollowingUsers converts follows to responses with following user details
func FromEntitiesWithFollowingUsers(follows []*entity.Follow, users map[uint]*UserInfo) []*UserFollowResponse {
	responses := make([]*UserFollowResponse, 0, len(follows))
	for _, follow := range follows {
		if user, ok := users[follow.FollowingID]; ok {
			responses = append(responses, &UserFollowResponse{
				ID:        follow.ID,
				UserID:    follow.FollowingID,
				Username:  user.Username,
				Name:      user.Name,
				Avatar:    user.Avatar,
				CreatedAt: follow.CreatedAt,
			})
		}
	}
	return responses
}
