package jwt

import (
	"fmt"
	"time"

	gojwt "github.com/golang-jwt/jwt"
)

type JWT interface {
	GenerateToken(data map[string]interface{}) (string, error)
	ValidateToken(token string) (bool, error)
	ParseToken(tokenString string) (map[string]interface{}, error)
	GenerateAccessToken(data map[string]interface{}) (string, error)
	GenerateRefreshToken(data map[string]interface{}) (string, error)
}

type JWTImpl struct {
	SignatureKey      string
	Expiration        int // expiration in days
	AccessExpiration  int // access token expiration in minutes
	RefreshExpiration int // refresh token expiration in days
}

func NewJWTImpl(signatureKey string, expiration int) JWT {
	return &JWTImpl{
		SignatureKey:      signatureKey,
		Expiration:        expiration,
		AccessExpiration:  15, // 15 minutes
		RefreshExpiration: 7,  // 7 days
	}
}

func (j *JWTImpl) GenerateToken(data map[string]interface{}) (string, error) {
	var mySigningKey = []byte(j.SignatureKey)
	token := gojwt.New(gojwt.SigningMethodHS256)
	claims := token.Claims.(gojwt.MapClaims)

	for key, value := range data {
		claims[key] = value
	}

	/**
	-jwt expires in day-
	 for example, if j.Expiration is 20, then the token will expire in 20 days
	**/
	expirationDuration := time.Duration(j.Expiration) * 24 * time.Hour * 7
	expirationTime := time.Now().Add(expirationDuration).Unix()
	claims["exp"] = expirationTime

	tokenString, err := token.SignedString(mySigningKey)

	if err != nil {
		return "", err
	}
	return tokenString, nil
}

func (j *JWTImpl) ValidateToken(tokenString string) (bool, error) {
	token, err := gojwt.Parse(tokenString, func(token *gojwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*gojwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}

		return []byte(j.SignatureKey), nil
	})

	if err != nil {
		return false, err
	}

	claims, ok := token.Claims.(gojwt.MapClaims)
	if !ok || !token.Valid {
		return false, nil
	}

	expirationTime := claims["exp"].(float64)
	if time.Now().Unix() > int64(expirationTime) {
		return false, nil
	}

	return true, nil
}

func (j *JWTImpl) ParseToken(tokenString string) (map[string]interface{}, error) {
	token, err := gojwt.Parse(tokenString, func(token *gojwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*gojwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(j.SignatureKey), nil
	})

	if err != nil {
		return nil, err
	}

	claims, ok := token.Claims.(gojwt.MapClaims)
	if !ok || !token.Valid {
		return nil, fmt.Errorf("invalid token")
	}

	return claims, nil
}

// GenerateAccessToken generates a short-lived access token
func (j *JWTImpl) GenerateAccessToken(data map[string]interface{}) (string, error) {
	var mySigningKey = []byte(j.SignatureKey)
	token := gojwt.New(gojwt.SigningMethodHS256)
	claims := token.Claims.(gojwt.MapClaims)

	for key, value := range data {
		claims[key] = value
	}

	// Access token expires in minutes
	expirationDuration := time.Duration(j.AccessExpiration) * time.Minute
	expirationTime := time.Now().Add(expirationDuration).Unix()
	claims["exp"] = expirationTime
	claims["type"] = "access"

	tokenString, err := token.SignedString(mySigningKey)
	if err != nil {
		return "", err
	}
	return tokenString, nil
}

// GenerateRefreshToken generates a long-lived refresh token
func (j *JWTImpl) GenerateRefreshToken(data map[string]interface{}) (string, error) {
	var mySigningKey = []byte(j.SignatureKey)
	token := gojwt.New(gojwt.SigningMethodHS256)
	claims := token.Claims.(gojwt.MapClaims)

	for key, value := range data {
		claims[key] = value
	}

	// Refresh token expires in days
	expirationDuration := time.Duration(j.RefreshExpiration) * 24 * time.Hour
	expirationTime := time.Now().Add(expirationDuration).Unix()
	claims["exp"] = expirationTime
	claims["type"] = "refresh"

	tokenString, err := token.SignedString(mySigningKey)
	if err != nil {
		return "", err
	}
	return tokenString, nil
}
