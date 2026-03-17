package request

// UpdatePostRequest represents the request to update a post
type UpdatePostRequest struct {
	Content string `json:"content" validate:"required,min=1,max=280"`
}
