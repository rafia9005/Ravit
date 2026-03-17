package repository

import (
	"Ravit/modules/bookmarks/domain/entity"
	"context"
)

// BookmarkRepository defines the interface for bookmark data operations
type BookmarkRepository interface {
	Create(ctx context.Context, bookmark *entity.Bookmark) error
	FindByUserIDAndPostID(ctx context.Context, userID, postID uint) (*entity.Bookmark, error)
	FindByUserID(ctx context.Context, userID uint, limit, offset int) ([]*entity.Bookmark, error)
	Delete(ctx context.Context, id uint) error
	DeleteByUserIDAndPostID(ctx context.Context, userID, postID uint) error
}
