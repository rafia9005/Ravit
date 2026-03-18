package request

// LoginRequest represents a request to login a user
type LoginRequest struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required,min=6"`
}

// CreateUserRequest represents a request to create a user
type CreateUserRequest struct {
	Name     string `json:"name" validate:"required"`
	Username string `json:"username" validate:"omitempty,min=3,max=30"`
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required,min=6"`
	Role     string `json:"role" validate:"omitempty,oneof=admin user"`
	Bio      string `json:"bio" validate:"omitempty"`
	Avatar   string `json:"avatar" validate:"omitempty,url"`
	Banner   string `json:"banner" validate:"omitempty,url"`
}

// UpdateUserRequest represents a request to update a user
type UpdateUserRequest struct {
	Name     string `json:"name" validate:"omitempty"`
	Username string `json:"username" validate:"omitempty,min=3,max=30"`
	Email    string `json:"email" validate:"omitempty,email"`
	Password string `json:"password" validate:"omitempty,min=6"`
	Role     string `json:"role" validate:"omitempty,oneof=admin user"`
	Bio      string `json:"bio" validate:"omitempty"`
	Avatar   string `json:"avatar" validate:"omitempty,url"`
	Banner   string `json:"banner" validate:"omitempty,url"`
}

type ChnagePasswordRequest struct {
	Password        string `json:"password" validate:"required"`
	ConfirmPassword string `json:"confirm_password" validate:"required, min=6"`
}

// UpdateProfileRequest represents a request to update current user's profile
type UpdateProfileRequest struct {
	Name   string `json:"name" validate:"omitempty"`
	Bio    string `json:"bio" validate:"omitempty,max=500"`
	Avatar string `json:"avatar" validate:"omitempty"`
	Banner string `json:"banner" validate:"omitempty"`
}
