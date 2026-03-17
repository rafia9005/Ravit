package notification

import (
	"Ravit/internal/pkg/bus"
	"Ravit/internal/pkg/logger"
	"Ravit/modules/notification/domain/entity"
	"Ravit/modules/notification/domain/repository"
	"Ravit/modules/notification/domain/service"
	"Ravit/modules/notification/handler"

	"github.com/labstack/echo"
	"gorm.io/gorm"
)

// Module implements the application Module interface for the notification module
type Module struct {
	db                  *gorm.DB
	logger              *logger.Logger
	notificationService *service.NotificationService
	notificationHandler *handler.NotificationHandler
	event               *bus.EventBus
}

// Name returns the name of the module
func (m *Module) Name() string {
	return "notification"
}

// Initialize initializes the module
func (m *Module) Initialize(db *gorm.DB, log *logger.Logger, event *bus.EventBus) error {
	m.db = db
	m.logger = log
	m.event = event

	m.logger.Info("Initializing notification module")

	// Initialize repositories
	notificationRepo := repository.NewNotificationRepositoryImpl()
	m.logger.Debug("Notification repository initialized")

	// Initialize services
	m.notificationService = service.NewNotificationService(notificationRepo)
	m.logger.Debug("Notification service initialized")

	// Initialize handlers
	m.notificationHandler = handler.NewNotificationHandler(m.logger, m.event, m.notificationService)
	m.logger.Debug("Notification handler initialized")

	m.logger.Info("Notification module initialized successfully")
	return nil
}

// RegisterRoutes registers the module's routes
func (m *Module) RegisterRoutes(e *echo.Echo, basePath string) {
	m.logger.Info("Registering notification routes at %s/notifications", basePath)
	m.notificationHandler.RegisterRoutes(e, basePath)
	m.logger.Debug("Notification routes registered successfully")
}

// Migrations returns the module's migrations
func (m *Module) Migrations() error {
	m.logger.Info("Registering notification module migrations")
	return m.db.AutoMigrate(&entity.Notification{})
}

// Logger returns the module's logger
func (m *Module) Logger() *logger.Logger {
	return m.logger
}

// NewModule creates a new notification module
func NewModule() *Module {
	return &Module{}
}
