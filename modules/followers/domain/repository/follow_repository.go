package repository

import (
	"Ravit/modules/followers/domain/entity"
	"context"
)

// FollowRepository defines the interface for follow data operations
type FollowRepository interface {
	Create(ctx context.Context, follow *entity.Follow) error
	FindByFollowerAndFollowing(ctx context.Context, followerID, followingID uint) (*entity.Follow, error)
	FindFollowers(ctx context.Context, userID uint, limit, offset int) ([]*entity.Follow, error)
	FindFollowing(ctx context.Context, userID uint, limit, offset int) ([]*entity.Follow, error)
	Delete(ctx context.Context, id uint) error
	DeleteByFollowerAndFollowing(ctx context.Context, followerID, followingID uint) error
	CountFollowers(ctx context.Context, userID uint) (int64, error)
	CountFollowing(ctx context.Context, userID uint) (int64, error)
}
