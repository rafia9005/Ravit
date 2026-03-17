# Ravit - Social Media Platform

A comprehensive full-stack social media application built with modular Go backend architecture and React TypeScript frontend. Features OAuth2 authentication (Google & GitHub), content sharing, and community engagement.

## Project Overview

**Ravit** is a social media platform for users to share and engage with content, featuring:
- Multi-provider OAuth2 authentication (Google & GitHub)
- Role-based access control (Admin, User)
- Content sharing and management
- Community features (Comments, Replies, Likes)
- Modular, scalable Go backend with Domain-Driven Design
- Modern React TypeScript frontend with responsive UI

## Architecture

### Backend Stack
- **Framework**: Echo (Go web framework)
- **ORM**: GORM (SQL database ORM)
- **Database**: MySQL 8.0+
- **Authentication**: JWT + OAuth2
- **Architecture Pattern**: Domain-Driven Design with modular structure

### Frontend Stack
- **Framework**: React 18 with TypeScript
- **Routing**: React Router v6
- **Build Tool**: Vite
- **Component Library**: Custom UI components with Tailwind CSS
- **State Management**: React Context API + Cookies
- **Authentication**: JWT token with refresh capability

## Features

### Core Features
- ✅ **OAuth2 Authentication**: Google & GitHub login/registration
- ✅ **Traditional Authentication**: Email/password login and registration
- ✅ **User Management**: User profiles, roles, avatars
- ✅ **Content Management**: Create, read, update, delete posts
- ✅ **Content Types**: Supports file, video, link, and article content
- ✅ **Comments & Replies**: Nested comment system with parent references
- ✅ **Likes**: Toggle like functionality with like counts
- ✅ **Role-Based Access Control**: Admin and User roles

### Technical Features
- ✅ Modular architecture with independent feature modules
- ✅ Repository pattern with database abstraction
- ✅ Event bus system for cross-module communication
- ✅ Comprehensive error handling with Indonesian user messages
- ✅ JWT token with automatic refresh capability
- ✅ State token validation for OAuth2 security
- ✅ Environment-based configuration
- ✅ Database migrations system

## Modules

### Backend Modules

1. **User Module** (`modules/users/`)
   - User CRUD operations
   - User profile management
   - Avatar handling

2. **Auth Module** (`modules/auth/`)
   - Traditional email/password authentication
   - Token generation and validation
   - Logout functionality

3. **OAuth Module** (`modules/oauth/`)
   - Google OAuth2 integration
   - GitHub OAuth2 integration
   - User auto-creation on first OAuth login
   - Automatic user linking on subsequent logins

4. **Works Module** (`modules/works/`)
   - Create, read, update, delete works
   - Approval status management (pending, approved, rejected)
   - Slug-based lookups for SEO-friendly URLs
   - Support for multiple content types

5. **Likes Module** (`modules/likes/`)
   - Toggle like functionality
   - Like count tracking
   - Per-user like management

6. **Comments Module** (`modules/comments/`)
   - Create and retrieve comments
   - Parent-based reply references
   - Nested comment support

7. **Replies Module** (`modules/replies/`)
   - Dedicated reply entity for comments
   - Threaded conversation support

8. **Approvals Module** (`modules/approvals/`)
   - Approve/reject works
   - Reviewer assignment
   - Approval history tracking

## Getting Started

### Prerequisites

- **Backend**: Go 1.20+, MySQL 8.0+
- **Frontend**: Node.js 16+, npm or yarn
- **OAuth Setup**: Google & GitHub OAuth2 credentials
- **Docker** (optional): Docker & Docker Compose for containerized setup

### Installation

#### Option 1: Docker Setup (Recommended)

1. Clone the repository:
```bash
git clone https://github.com/yourusername/ravit.git
cd ravit
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your OAuth credentials and settings
```

3. Start the application:
```bash
./run.sh
```

4. Access the application:
   - Frontend: http://localhost:5173
   - API: http://localhost:8080

#### Option 2: Local Setup

**Backend:**
```bash
# Install dependencies
go mod download

# Set environment variables
export OAUTH_GOOGLE_CLIENT_ID="your-client-id"
export OAUTH_GOOGLE_CLIENT_SECRET="your-client-secret"
# ... (see .env.example for all variables)

# Run the application
go run main.go
```

**Frontend:**
```bash
cd web

# Install dependencies
npm install

# Set environment variables
echo 'VITE_API_URL=http://localhost:8080' > .env.local

# Start development server
npm run dev
```

## Configuration

### Environment Variables

**Backend (.env):**
```
# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=password
DB_NAME=ravit

# Server
SERVER_PORT=8080
APP_FRONTEND=http://localhost:5173

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRATION=900

# Google OAuth
OAUTH_GOOGLE_CLIENT_ID=your-google-client-id
OAUTH_GOOGLE_CLIENT_SECRET=your-google-secret
OAUTH_GOOGLE_REDIRECT_URL=http://localhost:8080/api/v1/oauth/google/callback

# GitHub OAuth
OAUTH_GITHUB_CLIENT_ID=your-github-client-id
OAUTH_GITHUB_CLIENT_SECRET=your-github-secret
OAUTH_GITHUB_REDIRECT_URL=http://localhost:8080/api/v1/oauth/github/callback

# Logging
LOG_LEVEL=INFO
```

**Frontend (.env.local):**
```
VITE_API_URL=http://localhost:8080
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/login` - Email/password login
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - User logout

### OAuth
- `GET /api/v1/oauth/google/login` - Initiate Google OAuth
- `GET /api/v1/oauth/google/callback` - Google OAuth callback
- `GET /api/v1/oauth/github/login` - Initiate GitHub OAuth
- `GET /api/v1/oauth/github/callback` - GitHub OAuth callback

### Users
- `GET /api/v1/users/me` - Get current user
- `GET /api/v1/users/:id` - Get user by ID
- `PUT /api/v1/users/:id` - Update user

### Works
- `GET /api/v1/works` - List all works
- `GET /api/v1/works/:id` - Get work by ID
- `GET /api/v1/works/slug/:slug` - Get work by slug
- `POST /api/v1/works` - Create work (requires auth)
- `PUT /api/v1/works/:id` - Update work (requires ownership/admin)
- `DELETE /api/v1/works/:id` - Delete work (requires ownership/admin)

### Comments
- `GET /api/v1/works/:workId/comments` - Get comments for a work
- `POST /api/v1/works/:workId/comments` - Add comment
- `DELETE /api/v1/comments/:id` - Delete comment

### Likes
- `GET /api/v1/works/:workId/likes` - Get like count
- `POST /api/v1/works/:workId/likes/toggle` - Toggle like

### Approvals
- `POST /api/v1/works/:workId/approvals/approve` - Approve work (admin/reviewer)
- `POST /api/v1/works/:workId/approvals/reject` - Reject work (admin/reviewer)

## OAuth2 Flow

### Google/GitHub OAuth Flow
1. User clicks "Login with Google/GitHub" button on frontend
2. Frontend redirects to `{API_URL}/api/v1/oauth/{provider}/login`
3. Backend generates state token and returns OAuth provider authorization URL
4. Frontend redirects user to provider's OAuth consent screen
5. User authorizes the application
6. Provider redirects to `{API_URL}/api/v1/oauth/{provider}/callback`
7. Backend exchanges authorization code for access token
8. Backend fetches user info and creates/finds user in database
9. Backend generates JWT token
10. Backend redirects to `{APP_FRONTEND}/auth/oauth-callback?token={JWT}`
11. Frontend OAuth callback handler extracts token, stores in cookies
12. Frontend fetches user data from `/users/me` endpoint
13. Frontend redirects to dashboard

## Project Structure

```
ravit/
├── main.go                          # Application entry point
├── internal/
│   └── pkg/
│       ├── config/                  # Configuration management
│       ├── database/                # Database connection
│       ├── jwt/                     # JWT token handling
│       ├── logger/                  # Logging system
│       ├── middleware/              # Echo middleware
│       └── bus/                     # Event bus system
└── modules/
    ├── users/                       # User module
    ├── auth/                        # Auth module
    ├── oauth/                       # OAuth2 module
    ├── works/                       # Works module
    ├── comments/                    # Comments module
    ├── replies/                     # Replies module
    ├── likes/                       # Likes module
    └── approvals/                   # Approvals module
├── web/                             # React frontend
│   ├── src/
│   │   ├── pages/                   # Page components
│   │   ├── components/              # Reusable components
│   │   ├── hooks/                   # React hooks
│   │   ├── services/                # API services
│   │   ├── context/                 # Context providers
│   │   ├── validations/             # Form validations
│   │   └── lib/                     # Utility functions
│   ├── vite.config.ts               # Vite configuration
│   └── package.json                 # Dependencies
├── docker-compose.yml               # Docker Compose configuration
├── Dockerfile                       # Backend Docker image
├── .env.example                     # Environment variables template
└── README.MD                        # This file
```

## Module Development

### Creating a New Module

1. Create module directory:
```bash
mkdir -p modules/mymodule/{domain/{entity,repository,service},dto/{request,response},handler,middleware}
```

2. Implement the Module interface in `module.go`:
```go
package mymodule

import "github.com/labstack/echo"

type Module struct {
    // fields
}

func (m *Module) Name() string {
    return "mymodule"
}

func (m *Module) Initialize(db *gorm.DB, log *logger.Logger) error {
    // Initialize module
    return nil
}

func (m *Module) RegisterRoutes(e *echo.Echo, basePath string) {
    // Register routes
}

func (m *Module) Migrations() []interface{} {
    return []interface{}{
        // Entity structs for migration
    }
}

func (m *Module) Logger() *logger.Logger {
    // Return module logger
}
```

3. Register module in `main.go`:
```go
modules := []app.Module{
    mymodule.NewModule(),
    // other modules...
}
```

## Authentication Flow

### JWT Token Management
- **Access Token**: 15-minute expiration (900 seconds)
- **Refresh Token**: Longer expiration for token refresh
- **Token Storage**: HTTP-only cookies (when possible) or localStorage (frontend)
- **Auto-refresh**: Tokens automatically refreshed on 401 responses

### OAuth2 Integration
- **State Token**: 5-minute expiration for CSRF protection
- **Auto-creation**: Users automatically created on first OAuth login
- **Auto-linking**: Existing users linked by email on OAuth login
- **Avatar Storage**: User avatars from OAuth providers stored in database

## Error Handling

All errors include Indonesian language messages for users:
- `ErrUserNotFound` - "Pengguna tidak ditemukan"
- `ErrSlugAlreadyUsed` - "Slug sudah digunakan"
- `ErrWorkNotFound` - "Karya tidak ditemukan"
- `ErrUnauthorized` - "Anda tidak memiliki akses"

## Testing

Run tests for backend:
```bash
go test ./...
```

Run tests for frontend:
```bash
cd web
npm test
```

## Performance Considerations

- **Database**: Indexed queries for works, comments, likes
- **Caching**: User avatars cached from OAuth providers
- **Token Refresh**: Automatic background refresh to prevent login interruption
- **Modular Loading**: Modules loaded only when needed
- **Event Bus**: Decoupled module communication without tight coupling

## Security Features

- ✅ JWT token-based authentication
- ✅ OAuth2 state token validation
- ✅ CSRF protection with state tokens
- ✅ HTTP-only cookies for token storage (production)
- ✅ Role-based access control
- ✅ Password hashing (bcrypt)
- ✅ Environment-based configuration
- ✅ Request validation with Zod/custom validators

## Deployment

### Docker Deployment
```bash
docker-compose up -d
```

### Production Checklist
- [ ] Set `JWT_SECRET` to a strong random value
- [ ] Set `Secure: true` in OAuth cookie settings
- [ ] Enable HTTPS for all endpoints
- [ ] Configure CORS properly
- [ ] Set up database backups
- [ ] Enable logging and monitoring
- [ ] Set appropriate `LOG_LEVEL`
- [ ] Configure OAuth redirect URLs

## Troubleshooting

### Common Issues

**OAuth Login Fails**
- Check OAuth credentials in `.env`
- Verify redirect URLs match provider settings
- Check application permissions in OAuth provider dashboard

**Database Connection Error**
- Verify MySQL is running
- Check database credentials in `.env`
- Ensure database exists: `CREATE DATABASE library_works;`

**Frontend Can't Connect to API**
- Check `VITE_API_URL` in frontend `.env.local`
- Verify backend is running on correct port
- Check CORS configuration in backend

**Token Expired Error**
- Ensure JWT token refresh endpoint is working
- Check token expiration time in `.env`
- Clear browser cookies and login again

## Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Commit with clear messages
5. Push to your fork
6. Create a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Author

**Ravit** - A social media platform built with modular architecture, OAuth2 integration, and modern web technologies.

---

**Last Updated**: March 17, 2026
**Version**: 1.0.0
