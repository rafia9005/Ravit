package repository

import (
	"Ravit/internal/pkg/database"
	"Ravit/modules/reply/domain/entity"
	"context"
)

// ReplyRepositoryImpl implements ReplyRepository
type ReplyRepositoryImpl struct{}

// NewReplyRepositoryImpl creates a new reply repository implementation
func NewReplyRepositoryImpl() *ReplyRepositoryImpl {
	return &ReplyRepositoryImpl{}
}

// FindAll retrieves all replies with pagination
func (r *ReplyRepositoryImpl) FindAll(ctx context.Context, limit, offset int) ([]*entity.Reply, error) {
	var replies []*entity.Reply
	err := database.DB.WithContext(ctx).
		Order("created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&replies).Error
	return replies, err
}

// FindByID retrieves a reply by ID
func (r *ReplyRepositoryImpl) FindByID(ctx context.Context, id uint) (*entity.Reply, error) {
	var reply entity.Reply
	err := database.DB.WithContext(ctx).First(&reply, id).Error
	if err != nil {
		return nil, err
	}
	return &reply, nil
}

// FindByCommentID retrieves replies by comment ID
func (r *ReplyRepositoryImpl) FindByCommentID(ctx context.Context, commentID uint, limit, offset int) ([]*entity.Reply, error) {
	var replies []*entity.Reply
	err := database.DB.WithContext(ctx).
		Where("comment_id = ?", commentID).
		Order("created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&replies).Error
	return replies, err
}

// FindByUserID retrieves replies by user ID
func (r *ReplyRepositoryImpl) FindByUserID(ctx context.Context, userID uint, limit, offset int) ([]*entity.Reply, error) {
	var replies []*entity.Reply
	err := database.DB.WithContext(ctx).
		Where("user_id = ?", userID).
		Order("created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&replies).Error
	return replies, err
}

// Create creates a new reply
func (r *ReplyRepositoryImpl) Create(ctx context.Context, reply *entity.Reply) error {
	return database.DB.WithContext(ctx).Create(reply).Error
}

// Update updates a reply
func (r *ReplyRepositoryImpl) Update(ctx context.Context, reply *entity.Reply) error {
	return database.DB.WithContext(ctx).Save(reply).Error
}

// Delete deletes a reply
func (r *ReplyRepositoryImpl) Delete(ctx context.Context, id uint) error {
	return database.DB.WithContext(ctx).Delete(&entity.Reply{}, id).Error
}

// CountByCommentID counts replies for a comment
func (r *ReplyRepositoryImpl) CountByCommentID(ctx context.Context, commentID uint) (int64, error) {
	var count int64
	err := database.DB.WithContext(ctx).
		Model(&entity.Reply{}).
		Where("comment_id = ?", commentID).
		Count(&count).Error
	return count, err
}
