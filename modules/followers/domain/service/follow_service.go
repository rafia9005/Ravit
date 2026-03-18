package service

import (
	"Ravit/modules/followers/domain/entity"
	"Ravit/modules/followers/domain/repository"
	"context"
	"errors"
)

// Errors
var (
	ErrFollowNotFound   = errors.New("follow relationship not found")
	ErrAlreadyFollowing = errors.New("already following this user")
	ErrCannotFollowSelf = errors.New("cannot follow yourself")
)

// FollowService handles follow domain logic
type FollowService struct {
	followRepo repository.FollowRepository
}

// NewFollowService creates a new follow service
func NewFollowService(followRepo repository.FollowRepository) *FollowService {
	return &FollowService{
		followRepo: followRepo,
	}
}

// FollowUser creates a follow relationship
func (s *FollowService) FollowUser(ctx context.Context, followerID, followingID uint) error {
	// Cannot follow yourself
	if followerID == followingID {
		return ErrCannotFollowSelf
	}

	// Check if already following
	_, err := s.followRepo.FindByFollowerAndFollowing(ctx, followerID, followingID)
	if err == nil {
		return ErrAlreadyFollowing
	}

	follow := entity.NewFollow(followerID, followingID)
	return s.followRepo.Create(ctx, follow)
}

// UnfollowUser removes a follow relationship
func (s *FollowService) UnfollowUser(ctx context.Context, followerID, followingID uint) error {
	return s.followRepo.DeleteByFollowerAndFollowing(ctx, followerID, followingID)
}

// GetFollowers gets all followers of a user
func (s *FollowService) GetFollowers(ctx context.Context, userID uint, limit, offset int) ([]*entity.Follow, error) {
	return s.followRepo.FindFollowers(ctx, userID, limit, offset)
}

// GetFollowing gets all users that a user is following
func (s *FollowService) GetFollowing(ctx context.Context, userID uint, limit, offset int) ([]*entity.Follow, error) {
	return s.followRepo.FindFollowing(ctx, userID, limit, offset)
}

// IsFollowing checks if a user is following another user
func (s *FollowService) IsFollowing(ctx context.Context, followerID, followingID uint) (bool, error) {
	_, err := s.followRepo.FindByFollowerAndFollowing(ctx, followerID, followingID)
	if err != nil {
		return false, nil
	}
	return true, nil
}

// GetFollowerCount returns the number of followers for a user
func (s *FollowService) GetFollowerCount(ctx context.Context, userID uint) (int64, error) {
	return s.followRepo.CountFollowers(ctx, userID)
}

// GetFollowingCount returns the number of users a user is following
func (s *FollowService) GetFollowingCount(ctx context.Context, userID uint) (int64, error) {
	return s.followRepo.CountFollowing(ctx, userID)
}
