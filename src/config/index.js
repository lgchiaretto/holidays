require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwt: {
    secret: process.env.JWT_SECRET || 'default-secret-change-me',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  },
  database: {
    path: process.env.DATABASE_PATH || './data/holidays.db'
  },
  admin: {
    email: process.env.ADMIN_EMAIL || 'admin@holidays.local',
    password: process.env.ADMIN_PASSWORD || 'admin123'
  }
};
