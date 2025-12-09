# Holidays API

A RESTful API for managing holidays with JWT authentication and a web interface. Supports admin and regular user roles, Brazilian date format (DD/MM/YYYY), and SQLite for portable database storage.

## Features

- 🔐 **JWT Authentication** - Secure token-based authentication
- 👥 **Role-based Access** - Admin (full CRUD) and User (read-only) roles
- 🖥️ **Web Interface** - Separate login pages for admin and users
- 📅 **Brazilian Date Format** - Dates displayed as DD/MM/YYYY
- 🗃️ **SQLite Database** - Portable and lightweight
- 📖 **Swagger Documentation** - Interactive API documentation
- 🐳 **Container Ready** - Podman/Docker support with Red Hat UBI image
- ☸️ **OpenShift/Kubernetes** - Production deployment manifests

## Default Users

| User | Email | Password | Role |
|------|-------|----------|------|
| Administrator | `admin@holidays.local` | `teste` | admin |
| Salgadinho | `salgadinho@holidays.local` | `teste123` | user |

## Web Interface

- **Home Page**: `http://localhost:3000/` - Choose login type
- **User Login**: `http://localhost:3000/login.html` - Regular user login
- **Admin Login**: `http://localhost:3000/admin/` - Admin login
- **User Dashboard**: `http://localhost:3000/user/dashboard.html` - View holidays
- **Admin Dashboard**: `http://localhost:3000/admin/dashboard.html` - Manage holidays and users

## Quick Start

### Running Locally (Development)

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Initialize database and create admin user
npm run init-db

# Seed with Brazilian holidays (optional)
npm run seed

# Start the server
npm start

# Or in development mode with auto-reload
npm run dev
```

The API will be available at `http://localhost:3000`

### Running with Podman

#### Option 1: Quick Start (Pull from Registry)

```bash
# Run the container
podman run -d \
  --name holidays-api \
  -p 3000:3000 \
  -v holidays-data:/app/data \
  -e JWT_SECRET="your-secret-key-change-in-production" \
  -e ADMIN_EMAIL="admin@holidays.local" \
  -e ADMIN_PASSWORD="admin123" \
  quay.io/chiaretto/holidays:latest

# Check logs
podman logs -f holidays-api

# Stop the container
podman stop holidays-api

# Remove the container
podman rm holidays-api
```

#### Option 2: Build and Run Locally

```bash
# Build the image
./build.sh

# Or with custom image name
./build.sh myregistry/holidays v1.0.0

# Run the container
podman run -d \
  --name holidays-api \
  -p 3000:3000 \
  -v holidays-data:/app/data \
  -e JWT_SECRET="your-secret-key-change-in-production" \
  -e ADMIN_EMAIL="admin@holidays.local" \
  -e ADMIN_PASSWORD="admin123" \
  quay.io/chiaretto/holidays:latest
```

#### Podman Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment mode | `production` |
| `JWT_SECRET` | Secret key for JWT tokens | (required) |
| `JWT_EXPIRES_IN` | Token expiration time | `24h` |
| `DATABASE_PATH` | Path to SQLite database | `/app/data/holidays.db` |
| `ADMIN_EMAIL` | Initial admin email | `admin@holidays.local` |
| `ADMIN_PASSWORD` | Initial admin password | `admin123` |

### Running on OpenShift

#### Prerequisites

- OpenShift CLI (`oc`) installed
- Logged in to an OpenShift cluster (`oc login`)
- Push access to a container registry (e.g., quay.io)

#### Build and Deploy

```bash
# Build image, push to registry, and deploy to OpenShift
./build-and-deploy.sh

# Or with custom image
./build-and-deploy.sh myregistry/holidays v1.0.0
```

#### Deploy Only (Image already in registry)

```bash
# Deploy using default image
./deploy.sh

# Or with custom image
./deploy.sh myregistry/holidays v1.0.0
```

#### Build Only

```bash
# Build the container image
./build.sh

# Or with custom image name and tag
./build.sh myregistry/holidays v1.0.0
```

#### Cleanup

```bash
# Remove all resources (will ask for confirmation)
./cleanup.sh

# Force cleanup without confirmation
./cleanup.sh --force
```

## API Documentation

Interactive Swagger documentation is available at `/api-docs` when the server is running.

### Authentication

#### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@holidays.local", "password": "admin123"}'
```

Response:
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "email": "admin@holidays.local",
      "name": "Administrator",
      "role": "admin"
    }
  }
}
```

#### Register New User

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123", "name": "John Doe"}'
```

### Holidays API

All holiday endpoints require authentication. Include the JWT token in the `Authorization` header:

```bash
Authorization: Bearer <your-token>
```

#### List Holidays

```bash
# List all holidays
curl -X GET http://localhost:3000/api/holidays \
  -H "Authorization: Bearer <token>"

# Filter by year
curl -X GET "http://localhost:3000/api/holidays?year=2025" \
  -H "Authorization: Bearer <token>"

# Filter by type
curl -X GET "http://localhost:3000/api/holidays?type=national" \
  -H "Authorization: Bearer <token>"

# Filter by date range (Brazilian format)
curl -X GET "http://localhost:3000/api/holidays?start_date=01/01/2025&end_date=31/12/2025" \
  -H "Authorization: Bearer <token>"
```

#### Get Holidays by Year

```bash
curl -X GET http://localhost:3000/api/holidays/year/2025 \
  -H "Authorization: Bearer <token>"
```

#### Get Holidays by Month

```bash
curl -X GET http://localhost:3000/api/holidays/year/2025/month/12 \
  -H "Authorization: Bearer <token>"
```

#### Check if Date is Holiday

```bash
# Brazilian format
curl -X GET http://localhost:3000/api/holidays/check/25/12/2025 \
  -H "Authorization: Bearer <token>"

# ISO format
curl -X GET http://localhost:3000/api/holidays/check/2025-12-25 \
  -H "Authorization: Bearer <token>"
```

#### Get Upcoming Holidays

```bash
curl -X GET "http://localhost:3000/api/holidays/upcoming?days=30" \
  -H "Authorization: Bearer <token>"
```

#### Create Holiday (Admin Only)

```bash
curl -X POST http://localhost:3000/api/holidays \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Company Anniversary",
    "date": "15/03/2025",
    "type": "optional",
    "description": "Company foundation day",
    "recurring": true
  }'
```

#### Update Holiday (Admin Only)

```bash
curl -X PUT http://localhost:3000/api/holidays/1 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Holiday Name",
    "active": false
  }'
```

#### Delete Holiday (Admin Only)

```bash
curl -X DELETE http://localhost:3000/api/holidays/1 \
  -H "Authorization: Bearer <token>"
```

### User Management (Admin Only)

#### List Users

```bash
curl -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer <token>"
```

#### Create User

```bash
curl -X POST http://localhost:3000/api/users \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "password123",
    "name": "New User",
    "role": "user"
  }'
```

#### Update User

```bash
curl -X PUT http://localhost:3000/api/users/2 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Name",
    "role": "admin"
  }'
```

#### Reset User Password

```bash
curl -X POST http://localhost:3000/api/users/2/reset-password \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"newPassword": "newpassword123"}'
```

## Holiday Types

| Type | Description |
|------|-------------|
| `national` | National holidays |
| `state` | State-level holidays |
| `municipal` | Municipal holidays |
| `optional` | Optional/facultative holidays |

## Date Formats

The API accepts dates in two formats:
- **Brazilian format**: `DD/MM/YYYY` (e.g., `25/12/2025`)
- **ISO format**: `YYYY-MM-DD` (e.g., `2025-12-25`)

Responses include both formats:
```json
{
  "date": "25/12/2025",
  "date_iso": "2025-12-25"
}
```

## Project Structure

```
holidays/
├── src/
│   ├── config/
│   │   ├── index.js          # App configuration
│   │   └── swagger.js        # Swagger/OpenAPI config
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── holidayController.js
│   │   └── userController.js
│   ├── database/
│   │   └── index.js          # SQLite setup
│   ├── middleware/
│   │   ├── auth.js           # JWT authentication
│   │   ├── error.js          # Error handling
│   │   └── validation.js     # Request validation
│   ├── models/
│   │   ├── Holiday.js
│   │   └── User.js
│   ├── public/
│   │   ├── css/
│   │   │   └── style.css     # Shared styles
│   │   ├── admin/
│   │   │   ├── index.html    # Admin login
│   │   │   └── dashboard.html # Admin dashboard
│   │   ├── user/
│   │   │   └── dashboard.html # User dashboard
│   │   ├── index.html        # Home page
│   │   └── login.html        # User login
│   ├── routes/
│   │   ├── index.js
│   │   ├── auth.js
│   │   ├── holidays.js
│   │   └── users.js
│   ├── scripts/
│   │   ├── init-db.js        # Database initialization
│   │   └── seed.js           # Seed users and holidays
│   └── index.js              # App entry point
├── openshift/
│   ├── namespace.yaml
│   ├── configmap.yaml
│   ├── secret.yaml
│   ├── pvc.yaml
│   ├── deployment.yaml
│   ├── service.yaml
│   └── route.yaml
├── build.sh
├── deploy.sh
├── build-and-deploy.sh
├── cleanup.sh
├── Dockerfile                 # Red Hat UBI9 Node.js 22
├── .dockerignore
├── .env.example
├── package.json
└── README.md
```

## Security Considerations

1. **Change default credentials** in production:
   - Update `JWT_SECRET` with a strong random string
   - Change `ADMIN_EMAIL` and `ADMIN_PASSWORD`

2. **Update the secret.yaml** before deploying to OpenShift:
   ```bash
   # Generate a secure JWT secret
   openssl rand -base64 32
   ```

3. **Enable HTTPS** in production (handled by OpenShift Route with TLS)

## License

MIT
