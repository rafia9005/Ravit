package utils

import (
	"fmt"
	"math/rand"
	"regexp"
	"strings"
	"time"

	"golang.org/x/crypto/bcrypt"
)

// HashPassword hashes a plain text password
func HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	return string(bytes), err
}

// CompareHashAndPassword verifies if the provided password matches the stored hashed password
func CompareHashAndPassword(hashedPassword, password string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(password))
	return err == nil
}

func RJson() {

}

// GenerateUsernameFromEmail creates a username from email
// e.g., "john.doe@gmail.com" -> "johndoe1234"
func GenerateUsernameFromEmail(email string) string {
	// Extract part before @
	parts := strings.Split(email, "@")
	if len(parts) == 0 {
		return generateRandomUsername()
	}

	base := parts[0]
	return sanitizeAndAddSuffix(base)
}

// GenerateUsernameFromName creates a username from name
// e.g., "John Doe" -> "johndoe1234"
func GenerateUsernameFromName(name string) string {
	if name == "" {
		return generateRandomUsername()
	}

	// Remove spaces and convert to lowercase
	base := strings.ToLower(strings.ReplaceAll(name, " ", ""))
	return sanitizeAndAddSuffix(base)
}

// sanitizeAndAddSuffix removes special characters and adds random suffix
func sanitizeAndAddSuffix(base string) string {
	// Remove special characters, keep only alphanumeric
	reg := regexp.MustCompile("[^a-z0-9]")
	base = reg.ReplaceAllString(strings.ToLower(base), "")

	// Ensure minimum length
	if len(base) < 3 {
		base = "user"
	}

	// Truncate if too long (max 12 chars for base to allow 4 digit suffix)
	if len(base) > 12 {
		base = base[:12]
	}

	// Add random 4-digit suffix
	rand.Seed(time.Now().UnixNano())
	suffix := rand.Intn(9000) + 1000 // 1000-9999

	return fmt.Sprintf("%s%d", base, suffix)
}

// generateRandomUsername generates a completely random username
func generateRandomUsername() string {
	rand.Seed(time.Now().UnixNano())
	suffix := rand.Intn(90000000) + 10000000 // 8-digit number
	return fmt.Sprintf("user%d", suffix)
}
