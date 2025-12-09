# Holidays API - AI Instructions

## Project Overview

This is a **Holidays Management API** built with Node.js and Express. The application provides a RESTful API for managing holidays with JWT-based authentication, supporting admin and regular user roles.

## Technology Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: SQLite (via better-sqlite3)
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **Validation**: express-validator
- **Documentation**: Swagger/OpenAPI (swagger-jsdoc, swagger-ui-express)
- **Security**: helmet, cors
- **Container**: Podman/Docker
- **Orchestration**: OpenShift/Kubernetes

## Project Structure

```
src/
├── config/           # Configuration files
├── controllers/      # Request handlers
├── database/         # SQLite setup and connection
├── middleware/       # Express middleware (auth, validation, error)
├── models/           # Data models (User, Holiday)
├── routes/           # API route definitions
├── scripts/          # Utility scripts (init-db, seed)
└── index.js          # Application entry point
```

## Key Conventions

### Date Format
- **Brazilian format** is the primary format: `DD/MM/YYYY`
- ISO format (`YYYY-MM-DD`) is also supported for input
- Responses always include both formats (`date` and `date_iso`)

### API Response Format
All API responses follow this structure:
```json
{
  "success": true|false,
  "data": {...},      // On success
  "error": "string",  // On failure
  "pagination": {...} // For list endpoints
}
```

### Authentication
- JWT tokens in `Authorization: Bearer <token>` header
- Two roles: `admin` (full access) and `user` (read-only for holidays)
- Admin required for: creating/updating/deleting holidays, user management

### Holiday Types
- `national`: National holidays
- `state`: State-level holidays
- `municipal`: Municipal holidays
- `optional`: Optional/facultative holidays

## Code Style Guidelines

1. **Use async/await** for asynchronous operations
2. **Validate all inputs** using express-validator
3. **Return consistent responses** using the standard format
4. **Handle errors** with try-catch and the error middleware
5. **Keep controllers thin** - business logic in models
6. **Use prepared statements** for all database queries (SQLite injection prevention)

## Common Tasks

### Adding a New Endpoint
1. Create/update controller in `src/controllers/`
2. Add route in `src/routes/`
3. Add validation rules using express-validator
4. Update Swagger documentation with JSDoc comments

### Adding a New Model
1. Create model file in `src/models/`
2. Add table creation in `src/database/index.js`
3. Follow the existing patterns for CRUD operations

### Modifying Authentication
- Auth middleware is in `src/middleware/auth.js`
- JWT configuration in `src/config/index.js`

## Testing

Run the API locally and test with curl or the Swagger UI at `/api-docs`.

## Environment Variables

- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment mode
- `JWT_SECRET`: Secret for signing JWT tokens
- `JWT_EXPIRES_IN`: Token expiration time
- `DATABASE_PATH`: Path to SQLite database file
- `ADMIN_EMAIL`: Initial admin email
- `ADMIN_PASSWORD`: Initial admin password

## Container/Deployment

- `build.sh`: Build container image
- `deploy.sh`: Deploy to OpenShift
- `build-and-deploy.sh`: Build, push, and deploy
- `cleanup.sh`: Remove all resources

## Important Notes

1. **SQLite is single-writer** - only one deployment replica should be used
2. **Database is in `/app/data/`** - ensure persistent storage in containers
3. **Default admin is created on first run** if not exists
4. **All dates internally stored as ISO format** in the database
