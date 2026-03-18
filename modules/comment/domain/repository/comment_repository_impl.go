package repository

import (
	"Ravit/internal/pkg/database"
	"Ravit/modules/comment/domain/entity"
	"context"
)

// CommentRepositoryImpl implements CommentRepository
type CommentRepositoryImpl struct{}

// NewCommentRepositoryImpl creates a new comment repository implementation
func NewCommentRepositoryImpl() *CommentRepositoryImpl {
	return &CommentRepositoryImpl{}
}

// FindAll retrieves all comments with pagination
func (r *CommentRepositoryImpl) FindAll(ctx context.Context, limit, offset int) ([]*entity.Comment, error) {
	var comments []*entity.Comment
	err := database.DB.WithContext(ctx).
		Order("created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&comments).Error
	return comments, err
}

// FindByID retrieves a comment by ID
func (r *CommentRepositoryImpl) FindByID(ctx context.Context, id uint) (*entity.Comment, error) {
	var comment entity.Comment
	err := database.DB.WithContext(ctx).First(&comment, id).Error
	if err != nil {
		return nil, err
	}
	return &comment, nil
}

// FindByPostID retrieves all comments by post ID (including replies)
func (r *CommentRepositoryImpl) FindByPostID(ctx context.Context, postID uint, limit, offset int) ([]*entity.Comment, error) {
	var comments []*entity.Comment
	err := database.DB.WithContext(ctx).
		Where("post_id = ?", postID).
		Order("created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&comments).Error
	return comments, err
}

// FindTopLevelByPostID retrieves only top-level comments (parent_id IS NULL)
func (r *CommentRepositoryImpl) FindTopLevelByPostID(ctx context.Context, postID uint, limit, offset int) ([]*entity.Comment, error) {
	var comments []*entity.Comment
	err := database.DB.WithContext(ctx).
		Where("post_id = ? AND parent_id IS NULL", postID).
		Order("created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&comments).Error
	return comments, err
}

// FindRepliesByParentID retrieves replies to a specific comment
func (r *CommentRepositoryImpl) FindRepliesByParentID(ctx context.Context, parentID uint, limit, offset int) ([]*entity.Comment, error) {
	var comments []*entity.Comment
	err := database.DB.WithContext(ctx).
		Where("parent_id = ?", parentID).
		Order("created_at ASC"). // Replies ordered oldest first
		Limit(limit).
		Offset(offset).
		Find(&comments).Error
	return comments, err
}

// FindByUserID retrieves comments by user ID
func (r *CommentRepositoryImpl) FindByUserID(ctx context.Context, userID uint, limit, offset int) ([]*entity.Comment, error) {
	var comments []*entity.Comment
	err := database.DB.WithContext(ctx).
		Where("user_id = ?", userID).
		Order("created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&comments).Error
	return comments, err
}

// Create creates a new comment
func (r *CommentRepositoryImpl) Create(ctx context.Context, comment *entity.Comment) error {
	return database.DB.WithContext(ctx).Create(comment).Error
}

// Update updates a comment
func (r *CommentRepositoryImpl) Update(ctx context.Context, comment *entity.Comment) error {
	return database.DB.WithContext(ctx).Save(comment).Error
}

// Delete deletes a comment
func (r *CommentRepositoryImpl) Delete(ctx context.Context, id uint) error {
	return database.DB.WithContext(ctx).Delete(&entity.Comment{}, id).Error
}

// CountByPostID counts comments for a post
func (r *CommentRepositoryImpl) CountByPostID(ctx context.Context, postID uint) (int64, error) {
	var count int64
	err := database.DB.WithContext(ctx).
		Model(&entity.Comment{}).
		Where("post_id = ?", postID).
		Count(&count).Error
	return count, err
}

// CountRepliesByParentID counts replies to a specific comment
func (r *CommentRepositoryImpl) CountRepliesByParentID(ctx context.Context, parentID uint) (int64, error) {
	var count int64
	err := database.DB.WithContext(ctx).
		Model(&entity.Comment{}).
		Where("parent_id = ?", parentID).
		Count(&count).Error
	return count, err
}
