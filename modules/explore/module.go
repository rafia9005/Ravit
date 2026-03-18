package explore

import (
	"Ravit/internal/pkg/bus"
	"Ravit/internal/pkg/logger"
	"Ravit/modules/explore/handler"
	postRepository "Ravit/modules/post/domain/repository"
	postService "Ravit/modules/post/domain/service"
	userRepository "Ravit/modules/users/domain/repository"

	"github.com/labstack/echo"
	"gorm.io/gorm"
)

// Module implements the application Module interface for the explore module
type Module struct {
	db             *gorm.DB
	logger         *logger.Logger
	exploreHandler *handler.ExploreHandler
	event          *bus.EventBus
}

// Name returns the name of the module
func (m *Module) Name() string {
	return "explore"
}

// Initialize initializes the module
func (m *Module) Initialize(db *gorm.DB, log *logger.Logger, event *bus.EventBus) error {
	m.db = db
	m.logger = log
	m.event = event

	m.logger.Info("Initializing explore module")

	// Initialize user repository
	userRepo := userRepository.NewUserRepositoryImpl()

	// Initialize post repositories and service for like status
	postRepo := postRepository.NewPostRepositoryImpl()
	likeRepo := postRepository.NewLikeRepositoryImpl()
	postSvc := postService.NewPostService(postRepo, likeRepo)

	// Initialize handlers
	m.exploreHandler = handler.NewExploreHandler(m.logger, userRepo, postSvc)
	m.logger.Debug("Explore handler initialized")

	m.logger.Info("Explore module initialized successfully")
	return nil
}

// RegisterRoutes registers the module's routes
func (m *Module) RegisterRoutes(e *echo.Echo, basePath string) {
	m.logger.Info("Registering explore routes at %s/explore", basePath)
	m.exploreHandler.RegisterRoutes(e, basePath)
	m.logger.Debug("Explore routes registered successfully")
}

// Migrations returns the module's migrations (none for explore module)
func (m *Module) Migrations() error {
	m.logger.Info("No migrations for explore module")
	return nil
}

// Logger returns the module's logger
func (m *Module) Logger() *logger.Logger {
	return m.logger
}

// NewModule creates a new explore module
func NewModule() *Module {
	return &Module{}
}
