package repository

import (
	"Ravit/internal/pkg/database"
	"Ravit/modules/bookmarks/domain/entity"
	"context"
)

// BookmarkRepositoryImpl implements BookmarkRepository interface
type BookmarkRepositoryImpl struct{}

// NewBookmarkRepositoryImpl creates a new bookmark repository implementation
func NewBookmarkRepositoryImpl() BookmarkRepository {
	return &BookmarkRepositoryImpl{}
}

// Create creates a new bookmark
func (r *BookmarkRepositoryImpl) Create(ctx context.Context, bookmark *entity.Bookmark) error {
	return database.DB.WithContext(ctx).Create(bookmark).Error
}

// FindByUserIDAndPostID finds a bookmark by user and post ID
func (r *BookmarkRepositoryImpl) FindByUserIDAndPostID(ctx context.Context, userID, postID uint) (*entity.Bookmark, error) {
	var bookmark *entity.Bookmark
	err := database.DB.WithContext(ctx).
		Where("user_id = ? AND post_id = ?", userID, postID).
		First(&bookmark).Error
	if err != nil {
		return nil, err
	}
	return bookmark, nil
}

// FindByUserID finds all bookmarks for a user with pagination
func (r *BookmarkRepositoryImpl) FindByUserID(ctx context.Context, userID uint, limit, offset int) ([]*entity.Bookmark, error) {
	var bookmarks []*entity.Bookmark
	err := database.DB.WithContext(ctx).
		Where("user_id = ?", userID).
		Order("created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&bookmarks).Error
	if err != nil {
		return nil, err
	}
	return bookmarks, nil
}

// Delete deletes a bookmark by ID
func (r *BookmarkRepositoryImpl) Delete(ctx context.Context, id uint) error {
	return database.DB.WithContext(ctx).Delete(&entity.Bookmark{}, id).Error
}

// DeleteByUserIDAndPostID deletes a bookmark by user and post ID
func (r *BookmarkRepositoryImpl) DeleteByUserIDAndPostID(ctx context.Context, userID, postID uint) error {
	return database.DB.WithContext(ctx).
		Where("user_id = ? AND post_id = ?", userID, postID).
		Delete(&entity.Bookmark{}).Error
}
