package repository

import (
	"Ravit/internal/pkg/database"
	"Ravit/modules/post/domain/entity"
	"context"
)

// PostRepositoryImpl implements PostRepository
type PostRepositoryImpl struct{}

// NewPostRepositoryImpl creates a new post repository implementation
func NewPostRepositoryImpl() *PostRepositoryImpl {
	return &PostRepositoryImpl{}
}

// FindAll retrieves all posts with pagination
func (r *PostRepositoryImpl) FindAll(ctx context.Context, limit, offset int) ([]*entity.Post, error) {
	var posts []*entity.Post

	err := database.DB.WithContext(ctx).
		Order("created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&posts).Error

	return posts, err
}

// FindByID retrieves a post by ID
func (r *PostRepositoryImpl) FindByID(ctx context.Context, id uint) (*entity.Post, error) {
	var post entity.Post

	err := database.DB.WithContext(ctx).First(&post, id).Error
	if err != nil {
		return nil, err
	}

	return &post, nil
}

// FindByUserID retrieves posts by user ID
func (r *PostRepositoryImpl) FindByUserID(ctx context.Context, userID uint, limit, offset int) ([]*entity.Post, error) {
	var posts []*entity.Post

	err := database.DB.WithContext(ctx).
		Where("user_id = ?", userID).
		Order("created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&posts).Error

	return posts, err
}

// FindReplies retrieves replies to a post
func (r *PostRepositoryImpl) FindReplies(ctx context.Context, postID uint, limit, offset int) ([]*entity.Post, error) {
	var posts []*entity.Post

	err := database.DB.WithContext(ctx).
		Where("reply_to_id = ?", postID).
		Order("created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&posts).Error

	return posts, err
}

// FindFeed retrieves feed posts for a user (for now, just returns all posts)
func (r *PostRepositoryImpl) FindFeed(ctx context.Context, userID uint, limit, offset int) ([]*entity.Post, error) {
	// TODO: Implement actual feed algorithm based on following/followers
	return r.FindAll(ctx, limit, offset)
}

// Create creates a new post
func (r *PostRepositoryImpl) Create(ctx context.Context, post *entity.Post) error {
	return database.DB.WithContext(ctx).Create(post).Error
}

// Update updates a post
func (r *PostRepositoryImpl) Update(ctx context.Context, post *entity.Post) error {
	return database.DB.WithContext(ctx).Save(post).Error
}

// Delete deletes a post
func (r *PostRepositoryImpl) Delete(ctx context.Context, id uint) error {
	return database.DB.WithContext(ctx).Delete(&entity.Post{}, id).Error
}

// IncrementLikeCount increments the like count of a post
func (r *PostRepositoryImpl) IncrementLikeCount(ctx context.Context, postID uint) error {
	return database.DB.WithContext(ctx).
		Model(&entity.Post{}).
		Where("id = ?", postID).
		Update("like_count", database.DB.Raw("like_count + 1")).
		Error
}

// DecrementLikeCount decrements the like count of a post
func (r *PostRepositoryImpl) DecrementLikeCount(ctx context.Context, postID uint) error {
	return database.DB.WithContext(ctx).
		Model(&entity.Post{}).
		Where("id = ?", postID).
		Update("like_count", database.DB.Raw("like_count - 1")).
		Error
}

// IncrementReplyCount increments the reply count
func (r *PostRepositoryImpl) IncrementReplyCount(ctx context.Context, postID uint) error {
	return database.DB.WithContext(ctx).
		Model(&entity.Post{}).
		Where("id = ?", postID).
		Update("reply_count", database.DB.Raw("reply_count + 1")).
		Error
}

// IncrementRepostCount increments the repost count
func (r *PostRepositoryImpl) IncrementRepostCount(ctx context.Context, postID uint) error {
	return database.DB.WithContext(ctx).
		Model(&entity.Post{}).
		Where("id = ?", postID).
		Update("repost_count", database.DB.Raw("repost_count + 1")).
		Error
}

// DecrementRepostCount decrements the repost count
func (r *PostRepositoryImpl) DecrementRepostCount(ctx context.Context, postID uint) error {
	return database.DB.WithContext(ctx).
		Model(&entity.Post{}).
		Where("id = ?", postID).
		Update("repost_count", database.DB.Raw("repost_count - 1")).
		Error
}

// IncrementViewCount increments the view count
func (r *PostRepositoryImpl) IncrementViewCount(ctx context.Context, postID uint) error {
	return database.DB.WithContext(ctx).
		Model(&entity.Post{}).
		Where("id = ?", postID).
		Update("view_count", database.DB.Raw("view_count + 1")).
		Error
}
