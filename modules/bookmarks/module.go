package bookmarks

import (
	"Ravit/internal/pkg/bus"
	"Ravit/internal/pkg/logger"
	"Ravit/modules/bookmarks/domain/entity"
	"Ravit/modules/bookmarks/domain/repository"
	"Ravit/modules/bookmarks/domain/service"
	"Ravit/modules/bookmarks/handler"

	"github.com/labstack/echo"
	"gorm.io/gorm"
)

// Module implements the application Module interface for the bookmarks module
type Module struct {
	db              *gorm.DB
	logger          *logger.Logger
	bookmarkService *service.BookmarkService
	bookmarkHandler *handler.BookmarkHandler
	event           *bus.EventBus
}

// Name returns the name of the module
func (m *Module) Name() string {
	return "bookmarks"
}

// Initialize initializes the module
func (m *Module) Initialize(db *gorm.DB, log *logger.Logger, event *bus.EventBus) error {
	m.db = db
	m.logger = log
	m.event = event

	m.logger.Info("Initializing bookmarks module")

	// Initialize repositories
	bookmarkRepo := repository.NewBookmarkRepositoryImpl()
	m.logger.Debug("Bookmark repository initialized")

	// Initialize services
	m.bookmarkService = service.NewBookmarkService(bookmarkRepo)
	m.logger.Debug("Bookmark service initialized")

	// Initialize handlers
	m.bookmarkHandler = handler.NewBookmarkHandler(m.logger, m.event, m.bookmarkService)
	m.logger.Debug("Bookmark handler initialized")

	m.logger.Info("Bookmarks module initialized successfully")
	return nil
}

// RegisterRoutes registers the module's routes
func (m *Module) RegisterRoutes(e *echo.Echo, basePath string) {
	m.logger.Info("Registering bookmarks routes at %s/bookmarks", basePath)
	m.bookmarkHandler.RegisterRoutes(e, basePath)
	m.logger.Debug("Bookmarks routes registered successfully")
}

// Migrations returns the module's migrations
func (m *Module) Migrations() error {
	m.logger.Info("Registering bookmarks module migrations")
	return m.db.AutoMigrate(&entity.Bookmark{})
}

// Logger returns the module's logger
func (m *Module) Logger() *logger.Logger {
	return m.logger
}

// NewModule creates a new bookmarks module
func NewModule() *Module {
	return &Module{}
}
