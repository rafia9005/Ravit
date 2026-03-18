package request

// FollowUserRequest represents a follow user request
type FollowUserRequest struct {
	UserID uint `json:"user_id" validate:"required"`
}

// UnfollowUserRequest represents an unfollow user request
type UnfollowUserRequest struct {
	UserID uint `json:"user_id" validate:"required"`
}
