package repository

import (
	"Ravit/internal/pkg/database"
	"Ravit/modules/followers/domain/entity"
	"context"
)

// FollowRepositoryImpl implements FollowRepository interface
type FollowRepositoryImpl struct{}

// NewFollowRepositoryImpl creates a new follow repository implementation
func NewFollowRepositoryImpl() FollowRepository {
	return &FollowRepositoryImpl{}
}

// Create creates a new follow relationship
func (r *FollowRepositoryImpl) Create(ctx context.Context, follow *entity.Follow) error {
	return database.DB.WithContext(ctx).Create(follow).Error
}

// FindByFollowerAndFollowing finds a follow relationship
func (r *FollowRepositoryImpl) FindByFollowerAndFollowing(ctx context.Context, followerID, followingID uint) (*entity.Follow, error) {
	var follow *entity.Follow
	err := database.DB.WithContext(ctx).
		Where("follower_id = ? AND following_id = ?", followerID, followingID).
		First(&follow).Error
	if err != nil {
		return nil, err
	}
	return follow, nil
}

// FindFollowers finds all users following a specific user (their followers)
func (r *FollowRepositoryImpl) FindFollowers(ctx context.Context, userID uint, limit, offset int) ([]*entity.Follow, error) {
	var follows []*entity.Follow
	err := database.DB.WithContext(ctx).
		Where("following_id = ?", userID).
		Order("created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&follows).Error
	if err != nil {
		return nil, err
	}
	return follows, nil
}

// FindFollowing finds all users that a specific user is following
func (r *FollowRepositoryImpl) FindFollowing(ctx context.Context, userID uint, limit, offset int) ([]*entity.Follow, error) {
	var follows []*entity.Follow
	err := database.DB.WithContext(ctx).
		Where("follower_id = ?", userID).
		Order("created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&follows).Error
	if err != nil {
		return nil, err
	}
	return follows, nil
}

// Delete deletes a follow by ID
func (r *FollowRepositoryImpl) Delete(ctx context.Context, id uint) error {
	return database.DB.WithContext(ctx).Delete(&entity.Follow{}, id).Error
}

// DeleteByFollowerAndFollowing deletes a follow relationship
func (r *FollowRepositoryImpl) DeleteByFollowerAndFollowing(ctx context.Context, followerID, followingID uint) error {
	return database.DB.WithContext(ctx).
		Where("follower_id = ? AND following_id = ?", followerID, followingID).
		Delete(&entity.Follow{}).Error
}

// CountFollowers counts the number of followers for a user
func (r *FollowRepositoryImpl) CountFollowers(ctx context.Context, userID uint) (int64, error) {
	var count int64
	err := database.DB.WithContext(ctx).
		Model(&entity.Follow{}).
		Where("following_id = ?", userID).
		Count(&count).Error
	return count, err
}

// CountFollowing counts the number of users a user is following
func (r *FollowRepositoryImpl) CountFollowing(ctx context.Context, userID uint) (int64, error) {
	var count int64
	err := database.DB.WithContext(ctx).
		Model(&entity.Follow{}).
		Where("follower_id = ?", userID).
		Count(&count).Error
	return count, err
}
