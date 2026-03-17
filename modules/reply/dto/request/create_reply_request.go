package request

// CreateReplyRequest represents the request to create a reply
type CreateReplyRequest struct {
	Content string `json:"content" validate:"required,min=1,max=500"`
}
