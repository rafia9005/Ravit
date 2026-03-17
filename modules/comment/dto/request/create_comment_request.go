package request

// CreateCommentRequest represents the request to create a comment
type CreateCommentRequest struct {
	Content string `json:"content" validate:"required,min=1,max=500"`
}
