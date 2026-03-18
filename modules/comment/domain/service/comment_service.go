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
	ErrInvalidParent   = errors.New("invalid parent comment")
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

// GetCommentsByPostID gets all comments by post ID (including replies)
func (s *CommentService) GetCommentsByPostID(ctx context.Context, postID uint, limit, offset int) ([]*entity.Comment, error) {
	return s.commentRepo.FindByPostID(ctx, postID, limit, offset)
}

// GetTopLevelCommentsByPostID gets only top-level comments (no replies)
func (s *CommentService) GetTopLevelCommentsByPostID(ctx context.Context, postID uint, limit, offset int) ([]*entity.Comment, error) {
	return s.commentRepo.FindTopLevelByPostID(ctx, postID, limit, offset)
}

// GetRepliesByCommentID gets replies to a specific comment
func (s *CommentService) GetRepliesByCommentID(ctx context.Context, commentID uint, limit, offset int) ([]*entity.Comment, error) {
	return s.commentRepo.FindRepliesByParentID(ctx, commentID, limit, offset)
}

// GetCommentByID gets a comment by ID
func (s *CommentService) GetCommentByID(ctx context.Context, id uint) (*entity.Comment, error) {
	comment, err := s.commentRepo.FindByID(ctx, id)
	if err != nil {
		return nil, ErrCommentNotFound
	}
	return comment, nil
}

// CreateComment creates a new top-level comment
func (s *CommentService) CreateComment(ctx context.Context, comment *entity.Comment) error {
	return s.commentRepo.Create(ctx, comment)
}

// CreateReply creates a reply to an existing comment
func (s *CommentService) CreateReply(ctx context.Context, userID, postID, parentID uint, content string) (*entity.Comment, error) {
	// Verify parent comment exists and belongs to the same post
	parent, err := s.commentRepo.FindByID(ctx, parentID)
	if err != nil {
		return nil, ErrInvalidParent
	}
	if parent.PostID != postID {
		return nil, ErrInvalidParent
	}

	reply := entity.NewReply(userID, postID, parentID, content)
	err = s.commentRepo.Create(ctx, reply)
	if err != nil {
		return nil, err
	}
	return reply, nil
}

// CountReplies counts replies to a comment
func (s *CommentService) CountReplies(ctx context.Context, commentID uint) (int64, error) {
	return s.commentRepo.CountRepliesByParentID(ctx, commentID)
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
