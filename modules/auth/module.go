package auth

import (
	"Ravit/internal/pkg/bus"
	"Ravit/internal/pkg/config"
	"Ravit/internal/pkg/logger"
	"Ravit/modules/auth/domain/entity"
	authRepository "Ravit/modules/auth/domain/repository"
	authService "Ravit/modules/auth/domain/service"
	authHandler "Ravit/modules/auth/handler"
	userRepository "Ravit/modules/users/domain/repository"

	"github.com/labstack/echo"
	"gorm.io/gorm"
)

type Module struct {
	db          *gorm.DB
	logger      *logger.Logger
	authService *authService.AuthService
	authHandler *authHandler.AuthHandler
	event       *bus.EventBus
}

func (m *Module) Name() string {
	return "auth"
}

func (m *Module) Initialize(db *gorm.DB, log *logger.Logger, event *bus.EventBus) error {
	m.db = db
	m.logger = log
	m.event = event

	// Initialize user repository
	userRepo := userRepository.NewUserRepositoryImpl()

	// Initialize token repository
	tokenRepo := authRepository.NewTokenRepositoryImpl()

	// Initialize JWT service
	jwtService := config.GetJWTService()

	// Initialize auth service
	m.authService = authService.NewAuthService(userRepo, tokenRepo, jwtService)

	// Initialize auth handler
	m.authHandler = authHandler.NewAuthHandler(m.logger, m.event, m.authService, jwtService)

	m.logger.Info("Auth module initialized successfully")
	return nil
}

func (m *Module) RegisterRoutes(e *echo.Echo, basePath string) {
	if m.authHandler == nil {
		m.logger.Error("AuthHandler is nil, cannot register routes")
		return
	}
	m.authHandler.RegisterRoutes(e, basePath)
}

func (m *Module) Migrations() error {
	m.logger.Info("Registering auth module migrations")
	return m.db.AutoMigrate(&entity.Token{})
}

func (m *Module) Logger() *logger.Logger {
	return m.logger
}

func NewModule() *Module {
	return &Module{}
}
