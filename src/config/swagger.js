const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Holidays API',
      version: '1.0.0',
      description: 'API for managing holidays with JWT authentication',
      contact: {
        name: 'API Support'
      }
    },
    servers: [
      {
        url: '/api',
        description: 'API Server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        Holiday: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            date: { type: 'string', description: 'Date in DD/MM/YYYY format' },
            date_iso: { type: 'string', description: 'Date in ISO format (YYYY-MM-DD)' },
            type: { type: 'string', enum: ['national', 'state', 'municipal', 'optional'] },
            description: { type: 'string' },
            recurring: { type: 'boolean' },
            active: { type: 'boolean' },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' }
          }
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            email: { type: 'string', format: 'email' },
            name: { type: 'string' },
            role: { type: 'string', enum: ['admin', 'user'] },
            active: { type: 'boolean' },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: { type: 'string' }
          }
        }
      }
    }
  },
  apis: ['./src/routes/*.js']
};

const specs = swaggerJsdoc(options);

module.exports = specs;
