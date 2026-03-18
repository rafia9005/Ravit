package followers

import (
	"Ravit/internal/pkg/bus"
	"Ravit/internal/pkg/logger"
	"Ravit/modules/followers/domain/entity"
	"Ravit/modules/followers/domain/repository"
	"Ravit/modules/followers/domain/service"
	"Ravit/modules/followers/handler"
	userRepo "Ravit/modules/users/domain/repository"

	"github.com/labstack/echo"
	"gorm.io/gorm"
)

// Module implements the application Module interface for the followers module
type Module struct {
	db            *gorm.DB
	logger        *logger.Logger
	followService *service.FollowService
	followHandler *handler.FollowHandler
	event         *bus.EventBus
}

// Name returns the name of the module
func (m *Module) Name() string {
	return "followers"
}

// Initialize initializes the module
func (m *Module) Initialize(db *gorm.DB, log *logger.Logger, event *bus.EventBus) error {
	m.db = db
	m.logger = log
	m.event = event

	m.logger.Info("Initializing followers module")

	// Initialize repositories
	followRepo := repository.NewFollowRepositoryImpl()
	userRepository := userRepo.NewUserRepositoryImpl()
	m.logger.Debug("Follow repository initialized")

	// Initialize services
	m.followService = service.NewFollowService(followRepo)
	m.logger.Debug("Follow service initialized")

	// Initialize handlers
	m.followHandler = handler.NewFollowHandler(m.logger, m.event, m.followService, userRepository)
	m.logger.Debug("Follow handler initialized")

	m.logger.Info("Followers module initialized successfully")
	return nil
}

// RegisterRoutes registers the module's routes
func (m *Module) RegisterRoutes(e *echo.Echo, basePath string) {
	m.logger.Info("Registering followers routes at %s/follows", basePath)
	m.followHandler.RegisterRoutes(e, basePath)
	m.logger.Debug("Followers routes registered successfully")
}

// Migrations returns the module's migrations
func (m *Module) Migrations() error {
	m.logger.Info("Registering followers module migrations")
	return m.db.AutoMigrate(&entity.Follow{})
}

// Logger returns the module's logger
func (m *Module) Logger() *logger.Logger {
	return m.logger
}

// NewModule creates a new followers module
func NewModule() *Module {
	return &Module{}
}
