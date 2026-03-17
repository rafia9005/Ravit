package request

// UpdateReplyRequest represents the request to update a reply
type UpdateReplyRequest struct {
	Content string `json:"content" validate:"required,min=1,max=500"`
}
