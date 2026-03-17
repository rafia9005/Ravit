package config

import (
	"Ravit/internal/pkg/jwt"
	"log"
	"os"

	"github.com/spf13/viper"
)

type Config struct {
	filename string
}

func NewConfig(filename string) Config {
	return Config{filename: filename}
}
func (c *Config) Initialize() error {

	viper.SetConfigFile(c.filename)
	viper.SetConfigType("env")

	viper.AutomaticEnv()
	err := viper.ReadInConfig()

	if err != nil {
		if _, ok := err.(viper.ConfigFileNotFoundError); ok {
			return err
		}
		return err
	}

	return nil
}

func checkKey(key string) {
	if !viper.IsSet(key) {
		log.Fatalf("Configuration key %s not found; aborting \n", key)
		os.Exit(1)
	}
}

func GetString(key string) string {
	checkKey(key)
	return viper.GetString(key)
}

func GetInt(key string) int {
	checkKey(key)
	return viper.GetInt(key)
}

func GetBool(key string) bool {
	checkKey(key)
	return viper.GetBool(key)
}

func GetJWTService() jwt.JWT {
	signatureKey := GetString("JWT_SIGNATURE_KEY")
	if signatureKey == "" {
		panic("JWT signature key not found in configuration")
	}
	return jwt.NewJWTImpl(signatureKey, 7)
}

// OAuth configuration
type OAuthConfig struct {
	ClientID     string
	ClientSecret string
	RedirectURL  string
}

func GetGoogleOAuthConfig() OAuthConfig {
	return OAuthConfig{
		ClientID:     GetString("OAUTH_GOOGLE_CLIENT_ID"),
		ClientSecret: GetString("OAUTH_GOOGLE_CLIENT_SECRET"),
		RedirectURL:  GetString("OAUTH_GOOGLE_REDIRECT_URL"),
	}
}

func GetGitHubOAuthConfig() OAuthConfig {
	return OAuthConfig{
		ClientID:     GetString("OAUTH_GITHUB_CLIENT_ID"),
		ClientSecret: GetString("OAUTH_GITHUB_CLIENT_SECRET"),
		RedirectURL:  GetString("OAUTH_GITHUB_REDIRECT_URL"),
	}
}
