package comment

import (
	"Ravit/internal/pkg/bus"
	"Ravit/internal/pkg/logger"
	"Ravit/modules/comment/domain/entity"
	"Ravit/modules/comment/domain/repository"
	"Ravit/modules/comment/domain/service"
	"Ravit/modules/comment/handler"

	"github.com/labstack/echo"
	"gorm.io/gorm"
)

// Module implements the application Module interface for the comment module
type Module struct {
	db             *gorm.DB
	logger         *logger.Logger
	commentService *service.CommentService
	commentHandler *handler.CommentHandler
	event          *bus.EventBus
}

// Name returns the name of the module
func (m *Module) Name() string {
	return "comment"
}

// Initialize initializes the module
func (m *Module) Initialize(db *gorm.DB, log *logger.Logger, event *bus.EventBus) error {
	m.db = db
	m.logger = log
	m.event = event

	m.logger.Info("Initializing comment module")

	// Initialize repositories
	commentRepo := repository.NewCommentRepositoryImpl()
	m.logger.Debug("Comment repository initialized")

	// Initialize services
	m.commentService = service.NewCommentService(commentRepo)
	m.logger.Debug("Comment service initialized")

	// Initialize handlers
	m.commentHandler = handler.NewCommentHandler(m.logger, m.event, m.commentService)
	m.logger.Debug("Comment handler initialized")

	m.logger.Info("Comment module initialized successfully")
	return nil
}

// RegisterRoutes registers the module's routes
func (m *Module) RegisterRoutes(e *echo.Echo, basePath string) {
	m.logger.Info("Registering comment routes at %s/comments", basePath)
	m.commentHandler.RegisterRoutes(e, basePath)
	m.logger.Debug("Comment routes registered successfully")
}

// Migrations returns the module's migrations
func (m *Module) Migrations() error {
	m.logger.Info("Registering comment module migrations")
	return m.db.AutoMigrate(&entity.Comment{})
}

// Logger returns the module's logger
func (m *Module) Logger() *logger.Logger {
	return m.logger
}

// NewModule creates a new comment module
func NewModule() *Module {
	return &Module{}
}
