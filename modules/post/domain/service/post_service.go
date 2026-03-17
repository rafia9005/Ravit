package service

import (
	"Ravit/modules/post/domain/entity"
	"Ravit/modules/post/domain/repository"
	"context"
	"errors"
)

var (
	ErrPostNotFound = errors.New("post not found")
	ErrAlreadyLiked = errors.New("post already liked")
	ErrNotLiked     = errors.New("post not liked")
	ErrUnauthorized = errors.New("unauthorized")
)

type PostService struct {
	postRepo repository.PostRepository
	likeRepo repository.LikeRepository
}

func NewPostService(postRepo repository.PostRepository, likeRepo repository.LikeRepository) *PostService {
	return &PostService{postRepo: postRepo, likeRepo: likeRepo}
}

func (s *PostService) GetFeed(ctx context.Context, userID uint, limit, offset int) ([]*entity.Post, error) {
	return s.postRepo.FindFeed(ctx, userID, limit, offset)
}

func (s *PostService) GetPost(ctx context.Context, id uint) (*entity.Post, error) {
	post, err := s.postRepo.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if post == nil {
		return nil, ErrPostNotFound
	}
	return post, nil
}

// GetUserPosts gets posts by a specific user
func (s *PostService) GetUserPosts(ctx context.Context, userID uint, limit, offset int) ([]*entity.Post, error) {
	return s.postRepo.FindByUserID(ctx, userID, limit, offset)
}

// GetUserLikedPosts gets posts liked by a specific user
func (s *PostService) GetUserLikedPosts(ctx context.Context, userID uint, limit, offset int) ([]*entity.Post, error) {
	// Get likes by user
	likes, err := s.likeRepo.FindByUserID(ctx, userID, limit, offset)
	if err != nil {
		return nil, err
	}

	if len(likes) == 0 {
		return []*entity.Post{}, nil
	}

	// Get post IDs from likes
	postIDs := make([]uint, len(likes))
	for i, like := range likes {
		postIDs[i] = like.PostID
	}

	// Fetch posts by IDs (we need to maintain the order from likes)
	posts := make([]*entity.Post, 0, len(postIDs))
	for _, postID := range postIDs {
		post, err := s.postRepo.FindByID(ctx, postID)
		if err == nil && post != nil {
			posts = append(posts, post)
		}
	}

	return posts, nil
}

// GetLikeStatusForPosts checks like status for multiple posts
func (s *PostService) GetLikeStatusForPosts(ctx context.Context, userID uint, postIDs []uint) (map[uint]bool, error) {
	return s.likeRepo.HasUserLikedMultiple(ctx, userID, postIDs)
}

func (s *PostService) CreatePost(ctx context.Context, post *entity.Post) error {
	return s.postRepo.Create(ctx, post)
}

func (s *PostService) UpdatePost(ctx context.Context, post *entity.Post) error {
	existing, err := s.postRepo.FindByID(ctx, post.ID)
	if err != nil {
		return err
	}
	if existing == nil {
		return ErrPostNotFound
	}
	return s.postRepo.Update(ctx, post)
}
func (s *PostService) DeletePost(ctx context.Context, id uint) error {
	existing, err := s.postRepo.FindByID(ctx, id)
	if err != nil {
		return err
	}
	if existing == nil {
		return ErrPostNotFound
	}
	return s.postRepo.Delete(ctx, id)
}

func (s *PostService) GetReplies(ctx context.Context, postID uint, limit, offset int) ([]*entity.Post, error) {
	return s.postRepo.FindReplies(ctx, postID, limit, offset)
}

// LikePost likes a post
func (s *PostService) LikePost(ctx context.Context, userID, postID uint) error {
	// Check if post exists
	_, err := s.postRepo.FindByID(ctx, postID)
	if err != nil {
		return ErrPostNotFound
	}

	// Check if already liked
	hasLiked, err := s.likeRepo.HasUserLiked(ctx, userID, postID)
	if err != nil {
		return err
	}
	if hasLiked {
		return ErrAlreadyLiked
	}

	// Create like
	like := entity.NewLike(userID, postID)
	err = s.likeRepo.Create(ctx, like)
	if err != nil {
		return err
	}

	// Increment like count
	return s.postRepo.IncrementLikeCount(ctx, postID)
}

// UnlikePost unlikes a post
func (s *PostService) UnlikePost(ctx context.Context, userID, postID uint) error {
	// Check if post exists
	_, err := s.postRepo.FindByID(ctx, postID)
	if err != nil {
		return ErrPostNotFound
	}

	// Check if liked
	hasLiked, err := s.likeRepo.HasUserLiked(ctx, userID, postID)
	if err != nil {
		return err
	}
	if !hasLiked {
		return ErrNotLiked
	}

	// Delete like
	err = s.likeRepo.Delete(ctx, userID, postID)
	if err != nil {
		return err
	}

	// Decrement like count
	return s.postRepo.DecrementLikeCount(ctx, postID)
}

// IncrementViewCount increments view count
func (s *PostService) IncrementViewCount(ctx context.Context, postID uint) error {
	return s.postRepo.IncrementViewCount(ctx, postID)
}

// HasUserLiked checks if user has liked a post
func (s *PostService) HasUserLiked(ctx context.Context, userID, postID uint) (bool, error) {
	return s.likeRepo.HasUserLiked(ctx, userID, postID)
}
