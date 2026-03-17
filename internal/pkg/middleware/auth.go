package middleware

import (
	"Ravit/internal/pkg/jwt"
	"fmt"
	"net/http"
	"strings"

	"github.com/labstack/echo"
)

var jwtService jwt.JWT

func InitializeAuth(service jwt.JWT) {
	jwtService = service
}

func Auth(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		authHeader := c.Request().Header.Get("Authorization")
		if authHeader == "" {
			return c.JSON(http.StatusUnauthorized, map[string]interface{}{
				"error":   "Authorization header is missing",
				"message": "Unauthorized",
			})
		}

		if !strings.HasPrefix(authHeader, "Bearer ") {
			return c.JSON(http.StatusUnauthorized, map[string]interface{}{
				"error":   "Invalid Authorization header format",
				"message": "Unauthorized",
			})
		}

		token := strings.TrimPrefix(authHeader, "Bearer ")

		claims, err := jwtService.ParseToken(token)
		if err != nil {
			return c.JSON(http.StatusUnauthorized, map[string]interface{}{
				"error":   fmt.Sprintf("Invalid token: %v", err),
				"message": "Unauthorized",
			})
		}

		// Extract user_id from claims and set it in context
		userID, ok := claims["user_id"].(float64)
		if !ok {
			return c.JSON(http.StatusUnauthorized, map[string]interface{}{
				"error":   "Invalid token claims",
				"message": "Unauthorized",
			})
		}

		c.Set("user_id", uint(userID))
		c.Set("user", claims)

		// Extract user_role from claims and set it in context
		if userRole, ok := claims["role"].(string); ok {
			c.Set("user_role", userRole)
		}

		return next(c)
	}
}
