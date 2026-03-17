package request

// UpdateCommentRequest represents the request to update a comment
type UpdateCommentRequest struct {
	Content string `json:"content" validate:"required,min=1,max=500"`
}
