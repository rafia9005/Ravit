package response

import (
	"Ravit/modules/bookmarks/domain/entity"
	"time"
)

// BookmarkResponse represents a bookmark response
type BookmarkResponse struct {
	ID        uint      `json:"id"`
	UserID    uint      `json:"user_id"`
	PostID    uint      `json:"post_id"`
	CreatedAt time.Time `json:"created_at"`
}

// FromEntity converts an entity to a response
func FromEntity(bookmark *entity.Bookmark) *BookmarkResponse {
	return &BookmarkResponse{
		ID:        bookmark.ID,
		UserID:    bookmark.UserID,
		PostID:    bookmark.PostID,
		CreatedAt: bookmark.CreatedAt,
	}
}

// FromEntities converts multiple entities to responses
func FromEntities(bookmarks []*entity.Bookmark) []*BookmarkResponse {
	responses := make([]*BookmarkResponse, len(bookmarks))
	for i, bookmark := range bookmarks {
		responses[i] = FromEntity(bookmark)
	}
	return responses
}
