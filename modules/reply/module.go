package reply

import (
	"Ravit/internal/pkg/bus"
	"Ravit/internal/pkg/logger"
	"Ravit/modules/reply/domain/entity"
	"Ravit/modules/reply/domain/repository"
	"Ravit/modules/reply/domain/service"
	"Ravit/modules/reply/handler"

	"github.com/labstack/echo"
	"gorm.io/gorm"
)

// Module implements the application Module interface for the reply module
type Module struct {
	db           *gorm.DB
	logger       *logger.Logger
	replyService *service.ReplyService
	replyHandler *handler.ReplyHandler
	event        *bus.EventBus
}

// Name returns the name of the module
func (m *Module) Name() string {
	return "reply"
}

// Initialize initializes the module
func (m *Module) Initialize(db *gorm.DB, log *logger.Logger, event *bus.EventBus) error {
	m.db = db
	m.logger = log
	m.event = event

	m.logger.Info("Initializing reply module")

	// Initialize repositories
	replyRepo := repository.NewReplyRepositoryImpl()
	m.logger.Debug("Reply repository initialized")

	// Initialize services
	m.replyService = service.NewReplyService(replyRepo)
	m.logger.Debug("Reply service initialized")

	// Initialize handlers
	m.replyHandler = handler.NewReplyHandler(m.logger, m.event, m.replyService)
	m.logger.Debug("Reply handler initialized")

	m.logger.Info("Reply module initialized successfully")
	return nil
}

// RegisterRoutes registers the module's routes
func (m *Module) RegisterRoutes(e *echo.Echo, basePath string) {
	m.logger.Info("Registering reply routes at %s/comments/:comment_id/replies", basePath)
	m.replyHandler.RegisterRoutes(e, basePath)
	m.logger.Debug("Reply routes registered successfully")
}

// Migrations returns the module's migrations
func (m *Module) Migrations() error {
	m.logger.Info("Registering reply module migrations")
	return m.db.AutoMigrate(&entity.Reply{})
}

// Logger returns the module's logger
func (m *Module) Logger() *logger.Logger {
	return m.logger
}

// NewModule creates a new reply module
func NewModule() *Module {
	return &Module{}
}
