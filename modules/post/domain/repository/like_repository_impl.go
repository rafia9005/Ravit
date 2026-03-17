package repository

import (
	"Ravit/internal/pkg/database"
	"Ravit/modules/post/domain/entity"
	"context"
)

// LikeRepositoryImpl implements the LikeRepository interface
type LikeRepositoryImpl struct{}

// NewLikeRepositoryImpl creates a new LikeRepositoryImpl
func NewLikeRepositoryImpl() *LikeRepositoryImpl {
	return &LikeRepositoryImpl{}
}

// FindByPostID retrieves likes for a given post
func (r *LikeRepositoryImpl) FindByPostID(ctx context.Context, postID uint) ([]*entity.Like, error) {
	var likes []*entity.Like

	err := database.DB.WithContext(ctx).
		Where("post_id = ?", postID).
		Order("created_at DESC").
		Find(&likes).
		Error

	return likes, err
}

// FindByUserID retrieves likes for a given user with pagination
func (r *LikeRepositoryImpl) FindByUserID(ctx context.Context, userID uint, limit, offset int) ([]*entity.Like, error) {
	var likes []*entity.Like

	err := database.DB.WithContext(ctx).
		Where("user_id = ?", userID).
		Order("created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&likes).
		Error

	return likes, err
}

// FindByUserAndPost retrieves a like by user and post
func (r *LikeRepositoryImpl) FindByUserAndPost(ctx context.Context, userID, postID uint) (*entity.Like, error) {
	var like entity.Like
	err := database.DB.WithContext(ctx).
		Where("user_id = ? AND post_id = ?", userID, postID).
		First(&like).
		Error

	if err != nil {
		return nil, err
	}

	return &like, nil
}

// HasUserLiked checks whether a user already liked a post
func (r *LikeRepositoryImpl) HasUserLiked(ctx context.Context, userID, postID uint) (bool, error) {
	var count int64
	err := database.DB.WithContext(ctx).
		Model(&entity.Like{}).
		Where("user_id = ? AND post_id = ?", userID, postID).
		Count(&count).
		Error

	if err != nil {
		return false, err
	}

	return count > 0, nil
}

// HasUserLikedMultiple checks whether a user liked multiple posts
func (r *LikeRepositoryImpl) HasUserLikedMultiple(ctx context.Context, userID uint, postIDs []uint) (map[uint]bool, error) {
	result := make(map[uint]bool)
	if len(postIDs) == 0 {
		return result, nil
	}

	var likes []*entity.Like
	err := database.DB.WithContext(ctx).
		Where("user_id = ? AND post_id IN ?", userID, postIDs).
		Find(&likes).
		Error

	if err != nil {
		return nil, err
	}

	for _, like := range likes {
		result[like.PostID] = true
	}

	return result, nil
}

// Create persists a like
func (r *LikeRepositoryImpl) Create(ctx context.Context, like *entity.Like) error {
	return database.DB.WithContext(ctx).Create(like).Error
}

// Delete removes a like
func (r *LikeRepositoryImpl) Delete(ctx context.Context, userID, postID uint) error {
	return database.DB.WithContext(ctx).
		Where("user_id = ? AND post_id = ?", userID, postID).
		Delete(&entity.Like{}).
		Error
}

// CountByPostID returns the number of likes for a post
func (r *LikeRepositoryImpl) CountByPostID(ctx context.Context, postID uint) (int64, error) {
	var count int64
	err := database.DB.WithContext(ctx).
		Model(&entity.Like{}).
		Where("post_id = ?", postID).
		Count(&count).
		Error

	return count, err
}
