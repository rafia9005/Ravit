package media

import (
	"fmt"
	"io"
	"mime/multipart"
	"os"
	"path/filepath"
	"strings"
	"time"
)

// MediaType represents the type of media
type MediaType string

const (
	MediaTypeImage MediaType = "image"
	MediaTypeVideo MediaType = "video"
)

// AllowedImageExtensions contains allowed image extensions
var AllowedImageExtensions = map[string]bool{
	".jpg":  true,
	".jpeg": true,
	".png":  true,
	".gif":  true,
	".webp": true,
}

// AllowedVideoExtensions contains allowed video extensions
var AllowedVideoExtensions = map[string]bool{
	".mp4":  true,
	".webm": true,
	".mov":  true,
	".avi":  true,
}

// MaxImageSize is the maximum size for images (10MB)
const MaxImageSize = 10 * 1024 * 1024

// MaxVideoSize is the maximum size for videos (100MB)
const MaxVideoSize = 100 * 1024 * 1024

// AllowedImageMimeTypes contains allowed image MIME types
var AllowedImageMimeTypes = map[string]bool{
	"image/jpeg": true,
	"image/png":  true,
	"image/gif":  true,
	"image/webp": true,
}

// AllowedVideoMimeTypes contains allowed video MIME types
var AllowedVideoMimeTypes = map[string]bool{
	"video/mp4":       true,
	"video/webm":      true,
	"video/quicktime": true,
	"video/x-msvideo": true,
}

// MediaUploader handles media file uploads
type MediaUploader struct {
	basePath string
}

// NewMediaUploader creates a new media uploader
func NewMediaUploader(basePath string) *MediaUploader {
	return &MediaUploader{
		basePath: basePath,
	}
}

// ValidateImage validates an image file
func (m *MediaUploader) ValidateImage(file *multipart.FileHeader) error {
	// Check file size
	if file.Size > MaxImageSize {
		return fmt.Errorf("image size exceeds maximum limit of %d MB", MaxImageSize/(1024*1024))
	}

	// Check file extension
	ext := strings.ToLower(filepath.Ext(file.Filename))
	if !AllowedImageExtensions[ext] {
		return fmt.Errorf("image format not allowed. Allowed formats: jpg, jpeg, png, gif, webp")
	}

	return nil
}

// ValidateVideo validates a video file
func (m *MediaUploader) ValidateVideo(file *multipart.FileHeader) error {
	// Check file size
	if file.Size > MaxVideoSize {
		return fmt.Errorf("video size exceeds maximum limit of %d MB", MaxVideoSize/(1024*1024))
	}

	// Check file extension
	ext := strings.ToLower(filepath.Ext(file.Filename))
	if !AllowedVideoExtensions[ext] {
		return fmt.Errorf("video format not allowed. Allowed formats: mp4, webm, mov, avi")
	}

	return nil
}

// UploadImage uploads an image file
func (m *MediaUploader) UploadImage(file *multipart.FileHeader) (string, error) {
	// Validate image
	if err := m.ValidateImage(file); err != nil {
		return "", err
	}

	// Open uploaded file
	src, err := file.Open()
	if err != nil {
		return "", err
	}
	defer src.Close()

	// Generate unique filename
	filename := generateFilename(file.Filename)
	destPath := filepath.Join(m.basePath, "media", "posts", "images", filename)

	// Create directory if not exists
	if err := os.MkdirAll(filepath.Dir(destPath), os.ModePerm); err != nil {
		return "", err
	}

	// Create destination file
	dst, err := os.Create(destPath)
	if err != nil {
		return "", err
	}
	defer dst.Close()

	// Copy file
	if _, err := io.Copy(dst, src); err != nil {
		return "", err
	}

	// Return relative URL path
	return "/media/posts/images/" + filename, nil
}

// UploadVideo uploads a video file
func (m *MediaUploader) UploadVideo(file *multipart.FileHeader) (string, error) {
	// Validate video
	if err := m.ValidateVideo(file); err != nil {
		return "", err
	}

	// Open uploaded file
	src, err := file.Open()
	if err != nil {
		return "", err
	}
	defer src.Close()

	// Generate unique filename
	filename := generateFilename(file.Filename)
	destPath := filepath.Join(m.basePath, "media", "posts", "videos", filename)

	// Create directory if not exists
	if err := os.MkdirAll(filepath.Dir(destPath), os.ModePerm); err != nil {
		return "", err
	}

	// Create destination file
	dst, err := os.Create(destPath)
	if err != nil {
		return "", err
	}
	defer dst.Close()

	// Copy file
	if _, err := io.Copy(dst, src); err != nil {
		return "", err
	}

	// Return relative URL path
	return "/media/posts/videos/" + filename, nil
}

// generateFilename generates a unique filename
func generateFilename(originalFilename string) string {
	ext := filepath.Ext(originalFilename)
	timestamp := time.Now().UnixNano()
	return fmt.Sprintf("%d_%s%s", timestamp, strings.ReplaceAll(
		strings.TrimSuffix(originalFilename, ext), " ", "_"), ext)
}
