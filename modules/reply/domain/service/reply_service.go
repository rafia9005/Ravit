package service

import (
	"Ravit/modules/reply/domain/entity"
	"Ravit/modules/reply/domain/repository"
	"context"
	"errors"
)

// Errors
var (
	ErrReplyNotFound = errors.New("reply not found")
	ErrUnauthorized  = errors.New("unauthorized")
)

// ReplyService handles reply domain logic
type ReplyService struct {
	replyRepo repository.ReplyRepository
}

// NewReplyService creates a new reply service
func NewReplyService(replyRepo repository.ReplyRepository) *ReplyService {
	return &ReplyService{
		replyRepo: replyRepo,
	}
}

// GetRepliesByCommentID gets replies by comment ID
func (s *ReplyService) GetRepliesByCommentID(ctx context.Context, commentID uint, limit, offset int) ([]*entity.Reply, error) {
	return s.replyRepo.FindByCommentID(ctx, commentID, limit, offset)
}

// GetReplyByID gets a reply by ID
func (s *ReplyService) GetReplyByID(ctx context.Context, id uint) (*entity.Reply, error) {
	reply, err := s.replyRepo.FindByID(ctx, id)
	if err != nil {
		return nil, ErrReplyNotFound
	}
	return reply, nil
}

// CreateReply creates a new reply
func (s *ReplyService) CreateReply(ctx context.Context, reply *entity.Reply) error {
	return s.replyRepo.Create(ctx, reply)
}

// UpdateReply updates a reply
func (s *ReplyService) UpdateReply(ctx context.Context, reply *entity.Reply, userID uint) error {
	existingReply, err := s.replyRepo.FindByID(ctx, reply.ID)
	if err != nil {
		return ErrReplyNotFound
	}

	// Check if user owns the reply
	if existingReply.UserID != userID {
		return ErrUnauthorized
	}

	return s.replyRepo.Update(ctx, reply)
}

// DeleteReply deletes a reply
func (s *ReplyService) DeleteReply(ctx context.Context, id uint, userID uint) error {
	existingReply, err := s.replyRepo.FindByID(ctx, id)
	if err != nil {
		return ErrReplyNotFound
	}

	// Check if user owns the reply
	if existingReply.UserID != userID {
		return ErrUnauthorized
	}

	return s.replyRepo.Delete(ctx, id)
}
