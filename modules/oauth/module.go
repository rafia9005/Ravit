package oauth

import (
	"Ravit/internal/pkg/bus"
	"Ravit/internal/pkg/config"
	"Ravit/internal/pkg/logger"
	"Ravit/modules/oauth/domain/service"
	"Ravit/modules/oauth/handler"
	userRepository "Ravit/modules/users/domain/repository"

	"github.com/labstack/echo"
	"gorm.io/gorm"
)

// Module implements the application Module interface for the oauth module
type Module struct {
	db           *gorm.DB
	logger       *logger.Logger
	oauthService *service.OAuthService
	oauthHandler *handler.OAuthHandler
	event        *bus.EventBus
}

// Name returns the name of the module
func (m *Module) Name() string {
	return "oauth"
}

// Initialize initializes the module
func (m *Module) Initialize(db *gorm.DB, log *logger.Logger, event *bus.EventBus) error {
	m.db = db
	m.logger = log
	m.event = event

	m.logger.Info("Initializing oauth module")

	// Get OAuth configurations
	googleConfig := config.GetGoogleOAuthConfig()
	githubConfig := config.GetGitHubOAuthConfig()

	// Initialize OAuth service
	m.oauthService = service.NewOAuthService(
		googleConfig.ClientID, googleConfig.ClientSecret, googleConfig.RedirectURL,
		githubConfig.ClientID, githubConfig.ClientSecret, githubConfig.RedirectURL,
	)
	m.logger.Debug("OAuth service initialized")

	// Initialize user repository (required for finding/creating users)
	userRepo := userRepository.NewUserRepositoryImpl()
	m.logger.Debug("User repository initialized for OAuth")

	// Get JWT service from config
	jwtService := config.GetJWTService()

	// Initialize OAuth handler
	m.oauthHandler = handler.NewOAuthHandler(m.oauthService, userRepo, jwtService, m.logger, m.event)
	m.logger.Debug("OAuth handler initialized")

	m.logger.Info("OAuth module initialized successfully")
	return nil
}

// RegisterRoutes registers the module's routes
func (m *Module) RegisterRoutes(e *echo.Echo, basePath string) {
	m.logger.Info("Registering oauth routes at %s/oauth", basePath)
	m.oauthHandler.RegisterRoutes(e, basePath)
	m.logger.Debug("OAuth routes registered successfully")
}

// Migrations returns the module's migrations
// OAuth module doesn't have its own database entities
func (m *Module) Migrations() error {
	m.logger.Info("OAuth module has no migrations")
	return nil
}

// Logger returns the module's logger
func (m *Module) Logger() *logger.Logger {
	return m.logger
}

// NewModule creates a new oauth module
func NewModule() *Module {
	return &Module{}
}
