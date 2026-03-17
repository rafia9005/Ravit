package repository

import (
	"Ravit/modules/post/domain/entity"
	"context"
)

// PostRepository defines the post repository interface
type PostRepository interface {
	FindAll(ctx context.Context, limit, offset int) ([]*entity.Post, error)
	FindByID(ctx context.Context, id uint) (*entity.Post, error)
	FindByUserID(ctx context.Context, userID uint, limit, offset int) ([]*entity.Post, error)
	FindReplies(ctx context.Context, postID uint, limit, offset int) ([]*entity.Post, error)
	FindFeed(ctx context.Context, userID uint, limit, offset int) ([]*entity.Post, error)
	Create(ctx context.Context, post *entity.Post) error
	Update(ctx context.Context, post *entity.Post) error
	Delete(ctx context.Context, id uint) error
	IncrementLikeCount(ctx context.Context, postID uint) error
	DecrementLikeCount(ctx context.Context, postID uint) error
	IncrementReplyCount(ctx context.Context, postID uint) error
	IncrementRepostCount(ctx context.Context, postID uint) error
	DecrementRepostCount(ctx context.Context, postID uint) error
	IncrementViewCount(ctx context.Context, postID uint) error
}
