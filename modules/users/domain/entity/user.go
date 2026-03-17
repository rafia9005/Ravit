package entity

import (
	"Ravit/internal/pkg/utils"
	"time"
)

// AuthType constants for user authentication methods
const (
	AuthTypeEmail  = "email"
	AuthTypeGoogle = "google"
	AuthTypeGitHub = "github"
)

// User represents a user entity
type User struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Name      string    `json:"name"`
	Username  string    `json:"username" gorm:"uniqueIndex"`
	Email     string    `json:"email" gorm:"uniqueIndex"`
	Banner    string    `json:"banner"`
	AuthType  string    `json:"auth_type" gorm:"type:enum('email', 'google', 'github');default:'email'"`
	Role      string    `json:"role" gorm:"type:enum('admin', 'user', 'reviewer');default:'user'"`
	Bio       string    `json:"bio" gorm:"type:text"`
	Avatar    string    `json:"avatar"`
	Password  string    `json:"-"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// TableName specifies the table name for User
func (*User) TableName() string {
	return "users"
}

// NewUser creates a new user with email authentication type
// Username is auto-generated from email if not provided
func NewUser(name, email, password string) *User {
	now := time.Now()
	return &User{
		Name:      name,
		Username:  utils.GenerateUsernameFromEmail(email),
		Email:     email,
		Password:  password,
		AuthType:  AuthTypeEmail,
		CreatedAt: now,
		UpdatedAt: now,
	}
}

// NewOAuthUser creates a new user with OAuth authentication type
// Username is auto-generated from name + random suffix
func NewOAuthUser(name, email, avatar, authType string) *User {
	now := time.Now()
	return &User{
		Name:      name,
		Username:  utils.GenerateUsernameFromName(name),
		Email:     email,
		Avatar:    avatar,
		AuthType:  authType,
		Role:      "user",
		CreatedAt: now,
		UpdatedAt: now,
	}
}
