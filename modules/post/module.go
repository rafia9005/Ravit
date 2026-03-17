package post

import (
	"Ravit/internal/pkg/bus"
	"Ravit/internal/pkg/logger"
	"Ravit/modules/post/domain/entity"
	"Ravit/modules/post/domain/repository"
	"Ravit/modules/post/domain/service"
	"Ravit/modules/post/handler"

	"github.com/labstack/echo"
	"gorm.io/gorm"
)

// Module implements the application Module interface for the post module
type Module struct {
	db          *gorm.DB
	logger      *logger.Logger
	postService *service.PostService
	postHandler *handler.PostHandler
	event       *bus.EventBus
}

// Name returns the name of the module
func (m *Module) Name() string {
	return "post"
}

// Initialize initializes the module
func (m *Module) Initialize(db *gorm.DB, log *logger.Logger, event *bus.EventBus) error {
	m.db = db
	m.logger = log
	m.event = event

	m.logger.Info("Initializing post module")

	// Initialize repositories
	postRepo := repository.NewPostRepositoryImpl()
	likeRepo := repository.NewLikeRepositoryImpl()
	m.logger.Debug("Post repositories initialized")

	// Initialize services
	m.postService = service.NewPostService(postRepo, likeRepo)
	m.logger.Debug("Post service initialized")

	// Initialize handlers
	m.postHandler = handler.NewPostHandler(m.logger, m.event, m.postService)
	m.logger.Debug("Post handler initialized")

	m.logger.Info("Post module initialized successfully")
	return nil
}

// RegisterRoutes registers the module's routes
func (m *Module) RegisterRoutes(e *echo.Echo, basePath string) {
	m.logger.Info("Registering post routes at %s/posts", basePath)
	m.postHandler.RegisterRoutes(e, basePath)
	m.logger.Debug("Post routes registered successfully")
}

// Migrations returns the module's migrations
func (m *Module) Migrations() error {
	m.logger.Info("Registering post module migrations")
	return m.db.AutoMigrate(&entity.Post{}, &entity.Like{})
}

// Logger returns the module's logger
func (m *Module) Logger() *logger.Logger {
	return m.logger
}

// NewModule creates a new post module
func NewModule() *Module {
	return &Module{}
}
