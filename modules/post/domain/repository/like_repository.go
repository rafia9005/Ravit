package repository

import (
	"Ravit/modules/post/domain/entity"
	"context"
)

// LikeRepository defines the like repository interface
type LikeRepository interface {
	FindByPostID(ctx context.Context, postID uint) ([]*entity.Like, error)
	FindByUserID(ctx context.Context, userID uint, limit, offset int) ([]*entity.Like, error)
	FindByUserAndPost(ctx context.Context, userID, postID uint) (*entity.Like, error)
	HasUserLiked(ctx context.Context, userID, postID uint) (bool, error)
	HasUserLikedMultiple(ctx context.Context, userID uint, postIDs []uint) (map[uint]bool, error)
	Create(ctx context.Context, like *entity.Like) error
	Delete(ctx context.Context, userID, postID uint) error
	CountByPostID(ctx context.Context, postID uint) (int64, error)
}
