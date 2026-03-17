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
