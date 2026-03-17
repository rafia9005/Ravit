package repository

import (
	"Ravit/modules/reply/domain/entity"
	"context"
)

// ReplyRepository defines the reply repository interface
type ReplyRepository interface {
	FindAll(ctx context.Context, limit, offset int) ([]*entity.Reply, error)
	FindByID(ctx context.Context, id uint) (*entity.Reply, error)
	FindByCommentID(ctx context.Context, commentID uint, limit, offset int) ([]*entity.Reply, error)
	FindByUserID(ctx context.Context, userID uint, limit, offset int) ([]*entity.Reply, error)
	Create(ctx context.Context, reply *entity.Reply) error
	Update(ctx context.Context, reply *entity.Reply) error
	Delete(ctx context.Context, id uint) error
	CountByCommentID(ctx context.Context, commentID uint) (int64, error)
}
