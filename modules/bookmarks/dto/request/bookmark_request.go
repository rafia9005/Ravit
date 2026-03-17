package request

// CreateBookmarkRequest represents a create bookmark request
type CreateBookmarkRequest struct {
	PostID uint `json:"post_id" validate:"required"`
}

// DeleteBookmarkRequest represents a delete bookmark request
type DeleteBookmarkRequest struct {
	PostID uint `json:"post_id" validate:"required"`
}
