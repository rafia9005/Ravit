package request

// CreatePostRequest represents the request to create a post
type CreatePostRequest struct {
	Content   string   `json:"content" validate:"required,min=1,max=280"`
	MediaURLs []string `json:"media_urls,omitempty"`
	ReplyToID *uint    `json:"reply_to_id,omitempty"`
	RepostID  *uint    `json:"repost_id,omitempty"`
}
