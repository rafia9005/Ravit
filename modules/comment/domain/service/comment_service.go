package service

import (
	"Ravit/modules/comment/domain/entity"
	"Ravit/modules/comment/domain/repository"
	"context"
	"errors"
)

// Errors
var (
	ErrCommentNotFound = errors.New("comment not found")
	ErrUnauthorized    = errors.New("unauthorized")
)

// CommentService handles comment domain logic
type CommentService struct {
	commentRepo repository.CommentRepository
}

// NewCommentService creates a new comment service
func NewCommentService(commentRepo repository.CommentRepository) *CommentService {
	return &CommentService{
		commentRepo: commentRepo,
	}
}

// GetCommentsByPostID gets comments by post ID
func (s *CommentService) GetCommentsByPostID(ctx context.Context, postID uint, limit, offset int) ([]*entity.Comment, error) {
	return s.commentRepo.FindByPostID(ctx, postID, limit, offset)
}

// GetCommentByID gets a comment by ID
func (s *CommentService) GetCommentByID(ctx context.Context, id uint) (*entity.Comment, error) {
	comment, err := s.commentRepo.FindByID(ctx, id)
	if err != nil {
		return nil, ErrCommentNotFound
	}
	return comment, nil
}

// CreateComment creates a new comment
func (s *CommentService) CreateComment(ctx context.Context, comment *entity.Comment) error {
	return s.commentRepo.Create(ctx, comment)
}

// UpdateComment updates a comment
func (s *CommentService) UpdateComment(ctx context.Context, comment *entity.Comment, userID uint) error {
	existingComment, err := s.commentRepo.FindByID(ctx, comment.ID)
	if err != nil {
		return ErrCommentNotFound
	}

	// Check if user owns the comment
	if existingComment.UserID != userID {
		return ErrUnauthorized
	}

	return s.commentRepo.Update(ctx, comment)
}

// DeleteComment deletes a comment
func (s *CommentService) DeleteComment(ctx context.Context, id uint, userID uint) error {
	existingComment, err := s.commentRepo.FindByID(ctx, id)
	if err != nil {
		return ErrCommentNotFound
	}

	// Check if user owns the comment
	if existingComment.UserID != userID {
		return ErrUnauthorized
	}

	return s.commentRepo.Delete(ctx, id)
}
