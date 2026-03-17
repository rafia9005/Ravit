package repository

import (
	"Ravit/modules/auth/domain/entity"
	"context"
)

// TokenRepository defines the token repository interface
type TokenRepository interface {
	Create(ctx context.Context, token *entity.Token) error
	FindByToken(ctx context.Context, tokenString string) (*entity.Token, error)
	FindByUserID(ctx context.Context, userID uint) (*entity.Token, error)
	DeleteByUserID(ctx context.Context, userID uint) error
	Delete(ctx context.Context, id uint) error
}
