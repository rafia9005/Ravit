package main

import (
	"Ravit/internal/app"
	"Ravit/internal/pkg/config"
	"Ravit/internal/pkg/logger"
	"Ravit/internal/pkg/middleware"
	"Ravit/modules/auth"
	"Ravit/modules/bookmarks"
	"Ravit/modules/comment"
	"Ravit/modules/explore"
	"Ravit/modules/notification"
	"Ravit/modules/oauth"
	"Ravit/modules/post"
	"Ravit/modules/reply"
	user "Ravit/modules/users"
	"flag"
	"log"
	"os"
)

var configFile *string

func init() {
	configFile = flag.String("c", ".env", "configuration file")
	flag.Parse()
}

func main() {

	// Load configuration
	cfg := config.NewConfig(*configFile)
	if err := cfg.Initialize(); err != nil {
		log.Fatalf("Error reading config : %v", err)
		os.Exit(1)
	}

	// initialize logger
	logCfg := logger.DefaultConfig()

	// Start the application
	app, err := app.NewApp(&logCfg)
	if err != nil {
		log.Fatalf("Error creating application : %v", err)
		os.Exit(1)
	}

	// Initialize Auth middleware
	jwtSignatureKey := config.GetJWTService()
	middleware.InitializeAuth(jwtSignatureKey)

	// register modules
	app.RegisterModule(user.NewModule())
	app.RegisterModule(auth.NewModule())
	app.RegisterModule(oauth.NewModule())
	app.RegisterModule(post.NewModule())
	app.RegisterModule(comment.NewModule())
	app.RegisterModule(reply.NewModule())
	app.RegisterModule(explore.NewModule())
	app.RegisterModule(notification.NewModule())
	app.RegisterModule(bookmarks.NewModule())

	// initialize the application
	if err := app.Initialize(); err != nil {
		log.Fatalf("Error initializing application : %v", err)
		os.Exit(1)
	}

	// Start the application
	app.Start()
}
