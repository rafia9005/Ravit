package repository

import (
	"Ravit/modules/comment/domain/entity"
	"context"
)

// CommentRepository defines the comment repository interface
type CommentRepository interface {
	FindAll(ctx context.Context, limit, offset int) ([]*entity.Comment, error)
	FindByID(ctx context.Context, id uint) (*entity.Comment, error)
	FindByPostID(ctx context.Context, postID uint, limit, offset int) ([]*entity.Comment, error)
	FindByUserID(ctx context.Context, userID uint, limit, offset int) ([]*entity.Comment, error)
	Create(ctx context.Context, comment *entity.Comment) error
	Update(ctx context.Context, comment *entity.Comment) error
	Delete(ctx context.Context, id uint) error
	CountByPostID(ctx context.Context, postID uint) (int64, error)
}
