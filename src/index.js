require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');

const config = require('./config');
const routes = require('./routes');
const swaggerSpec = require('./config/swagger');
const { errorHandler, notFound } = require('./middleware/error');
const User = require('./models/User');

// Initialize database
require('./database');

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false // Disable for Swagger UI and static files
}));

// CORS
app.use(cors());

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Logging
if (config.nodeEnv !== 'test') {
  app.use(morgan('combined'));
}

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customSiteTitle: 'Holidays API Documentation'
}));

// API routes
app.use('/api', routes);

// Root route - serve index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling
app.use(notFound);
app.use(errorHandler);

// Create default admin user if not exists
const createDefaultAdmin = () => {
  const existingAdmin = User.findByEmail(config.admin.email);
  if (!existingAdmin) {
    User.create({
      email: config.admin.email,
      password: config.admin.password,
      name: 'Administrator',
      role: 'admin'
    });
    console.log(`Default admin user created: ${config.admin.email}`);
  }
};

// Start server
const startServer = () => {
  createDefaultAdmin();
  
  app.listen(config.port, '0.0.0.0', () => {
    console.log(`
╔════════════════════════════════════════════════════════════╗
║                    HOLIDAYS API                            ║
╠════════════════════════════════════════════════════════════╣
║  Server running on port ${config.port}                              ║
║  Environment: ${config.nodeEnv.padEnd(42)}║
║  API Documentation: http://localhost:${config.port}/api-docs          ║
╚════════════════════════════════════════════════════════════╝
    `);
  });
};

startServer();

module.exports = app;
