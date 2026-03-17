package repository

import (
	"Ravit/modules/users/domain/entity"
	"context"
)

// UserRepository defines the user repository interface
type UserRepository interface {
	FindAll(ctx context.Context) ([]*entity.User, error)
	FindByID(ctx context.Context, id uint) (*entity.User, error)
	FindByEmail(ctx context.Context, email string) (*entity.User, error)
	FindByUsername(ctx context.Context, username string) (*entity.User, error)
	Create(ctx context.Context, user *entity.User) error
	Update(ctx context.Context, user *entity.User) error
	Delete(ctx context.Context, id uint) error
}
