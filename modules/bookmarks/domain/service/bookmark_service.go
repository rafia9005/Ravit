package service

import (
	"Ravit/modules/bookmarks/domain/entity"
	"Ravit/modules/bookmarks/domain/repository"
	"context"
	"errors"
)

// Errors
var (
	ErrBookmarkNotFound  = errors.New("bookmark not found")
	ErrAlreadyBookmarked = errors.New("post already bookmarked")
)

// BookmarkService handles bookmark domain logic
type BookmarkService struct {
	bookmarkRepo repository.BookmarkRepository
}

// NewBookmarkService creates a new bookmark service
func NewBookmarkService(bookmarkRepo repository.BookmarkRepository) *BookmarkService {
	return &BookmarkService{
		bookmarkRepo: bookmarkRepo,
	}
}

// BookmarkPost creates a bookmark for a post
func (s *BookmarkService) BookmarkPost(ctx context.Context, userID, postID uint) error {
	// Check if already bookmarked
	_, err := s.bookmarkRepo.FindByUserIDAndPostID(ctx, userID, postID)
	if err == nil {
		return ErrAlreadyBookmarked
	}

	bookmark := entity.NewBookmark(userID, postID)
	return s.bookmarkRepo.Create(ctx, bookmark)
}

// UnbookmarkPost removes a bookmark for a post
func (s *BookmarkService) UnbookmarkPost(ctx context.Context, userID, postID uint) error {
	return s.bookmarkRepo.DeleteByUserIDAndPostID(ctx, userID, postID)
}

// GetBookmarksByUserID gets all bookmarks for a user
func (s *BookmarkService) GetBookmarksByUserID(ctx context.Context, userID uint, limit, offset int) ([]*entity.Bookmark, error) {
	return s.bookmarkRepo.FindByUserID(ctx, userID, limit, offset)
}

// IsPostBookmarked checks if a post is bookmarked by a user
func (s *BookmarkService) IsPostBookmarked(ctx context.Context, userID, postID uint) (bool, error) {
	_, err := s.bookmarkRepo.FindByUserIDAndPostID(ctx, userID, postID)
	if err != nil {
		return false, nil
	}
	return true, nil
}
