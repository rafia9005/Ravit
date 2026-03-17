package entity

import (
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
	Email     string    `json:"email"`
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
func NewUser(name, email, password string) *User {
	now := time.Now()
	return &User{
		Name:      name,
		Email:     email,
		Password:  password,
		AuthType:  AuthTypeEmail,
		CreatedAt: now,
		UpdatedAt: now,
	}
}

// NewOAuthUser creates a new user with OAuth authentication type
func NewOAuthUser(name, email, avatar, authType string) *User {
	now := time.Now()
	return &User{
		Name:      name,
		Email:     email,
		Avatar:    avatar,
		AuthType:  authType,
		Role:      "user",
		CreatedAt: now,
		UpdatedAt: now,
	}
}
