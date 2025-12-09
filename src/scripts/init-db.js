require('dotenv').config();
const User = require('../models/User');
const Holiday = require('../models/Holiday');
const config = require('../config');

// Initialize database (creates tables)
require('../database');

console.log('Database initialized successfully!');
console.log(`Database location: ${config.database.path}`);

// Create default admin user with password 'teste'
const adminEmail = 'admin@holidays.local';
const existingAdmin = User.findByEmail(adminEmail);
if (!existingAdmin) {
  User.create({
    email: adminEmail,
    password: 'teste',
    name: 'Administrator',
    role: 'admin'
  });
  console.log(`Default admin user created: ${adminEmail} (password: teste)`);
} else {
  console.log(`Admin user already exists: ${adminEmail}`);
}

console.log('\nDatabase initialization complete!');
