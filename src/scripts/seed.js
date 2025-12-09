require('dotenv').config();
const Holiday = require('../models/Holiday');
const User = require('../models/User');
const config = require('../config');

// Initialize database
require('../database');

console.log('Seeding database...\n');

// ===================
// CREATE USERS
// ===================
console.log('Creating users...');

// Admin user
const adminEmail = 'admin@holidays.local';
let admin = User.findByEmail(adminEmail);
if (!admin) {
  admin = User.create({
    email: adminEmail,
    password: 'teste',
    name: 'Administrator',
    role: 'admin'
  });
  console.log(`Created admin user: ${adminEmail} (password: teste)`);
} else {
  console.log(`Admin user already exists: ${adminEmail}`);
}

// Regular user - salgadinho
const userEmail = 'salgadinho@holidays.local';
let regularUser = User.findByEmail(userEmail);
if (!regularUser) {
  regularUser = User.create({
    email: userEmail,
    password: 'teste123',
    name: 'Salgadinho',
    role: 'user'
  });
  console.log(`Created user: ${userEmail} (password: teste123)`);
} else {
  console.log(`User already exists: ${userEmail}`);
}

console.log('');

// ===================
// CREATE HOLIDAYS
// ===================
console.log('Seeding database with Brazilian holidays...');

// Brazilian national holidays for 2024 and 2025
const brazilianHolidays = [
  // 2024
  { name: 'New Year', date: '01/01/2024', type: 'national', description: 'New Year\'s Day', recurring: true },
  { name: 'Carnival', date: '12/02/2024', type: 'national', description: 'Carnival Monday', recurring: false },
  { name: 'Carnival', date: '13/02/2024', type: 'national', description: 'Carnival Tuesday (Shrove Tuesday)', recurring: false },
  { name: 'Good Friday', date: '29/03/2024', type: 'national', description: 'Good Friday', recurring: false },
  { name: 'Tiradentes Day', date: '21/04/2024', type: 'national', description: 'Tiradentes Day', recurring: true },
  { name: 'Labor Day', date: '01/05/2024', type: 'national', description: 'International Workers\' Day', recurring: true },
  { name: 'Corpus Christi', date: '30/05/2024', type: 'national', description: 'Corpus Christi', recurring: false },
  { name: 'Independence Day', date: '07/09/2024', type: 'national', description: 'Brazilian Independence Day', recurring: true },
  { name: 'Our Lady of Aparecida', date: '12/10/2024', type: 'national', description: 'Patron Saint of Brazil', recurring: true },
  { name: 'All Souls\' Day', date: '02/11/2024', type: 'national', description: 'Day of the Dead', recurring: true },
  { name: 'Republic Day', date: '15/11/2024', type: 'national', description: 'Proclamation of the Republic', recurring: true },
  { name: 'National Day of Zumbi', date: '20/11/2024', type: 'national', description: 'Black Consciousness Day', recurring: true },
  { name: 'Christmas', date: '25/12/2024', type: 'national', description: 'Christmas Day', recurring: true },

  // 2025
  { name: 'New Year', date: '01/01/2025', type: 'national', description: 'New Year\'s Day', recurring: true },
  { name: 'Carnival', date: '03/03/2025', type: 'national', description: 'Carnival Monday', recurring: false },
  { name: 'Carnival', date: '04/03/2025', type: 'national', description: 'Carnival Tuesday (Shrove Tuesday)', recurring: false },
  { name: 'Good Friday', date: '18/04/2025', type: 'national', description: 'Good Friday', recurring: false },
  { name: 'Tiradentes Day', date: '21/04/2025', type: 'national', description: 'Tiradentes Day', recurring: true },
  { name: 'Labor Day', date: '01/05/2025', type: 'national', description: 'International Workers\' Day', recurring: true },
  { name: 'Corpus Christi', date: '19/06/2025', type: 'national', description: 'Corpus Christi', recurring: false },
  { name: 'Independence Day', date: '07/09/2025', type: 'national', description: 'Brazilian Independence Day', recurring: true },
  { name: 'Our Lady of Aparecida', date: '12/10/2025', type: 'national', description: 'Patron Saint of Brazil', recurring: true },
  { name: 'All Souls\' Day', date: '02/11/2025', type: 'national', description: 'Day of the Dead', recurring: true },
  { name: 'Republic Day', date: '15/11/2025', type: 'national', description: 'Proclamation of the Republic', recurring: true },
  { name: 'National Day of Zumbi', date: '20/11/2025', type: 'national', description: 'Black Consciousness Day', recurring: true },
  { name: 'Christmas', date: '25/12/2025', type: 'national', description: 'Christmas Day', recurring: true },

  // 2026
  { name: 'New Year', date: '01/01/2026', type: 'national', description: 'New Year\'s Day', recurring: true },
  { name: 'Carnival', date: '16/02/2026', type: 'national', description: 'Carnival Monday', recurring: false },
  { name: 'Carnival', date: '17/02/2026', type: 'national', description: 'Carnival Tuesday (Shrove Tuesday)', recurring: false },
  { name: 'Good Friday', date: '03/04/2026', type: 'national', description: 'Good Friday', recurring: false },
  { name: 'Tiradentes Day', date: '21/04/2026', type: 'national', description: 'Tiradentes Day', recurring: true },
  { name: 'Labor Day', date: '01/05/2026', type: 'national', description: 'International Workers\' Day', recurring: true },
  { name: 'Corpus Christi', date: '04/06/2026', type: 'national', description: 'Corpus Christi', recurring: false },
  { name: 'Independence Day', date: '07/09/2026', type: 'national', description: 'Brazilian Independence Day', recurring: true },
  { name: 'Our Lady of Aparecida', date: '12/10/2026', type: 'national', description: 'Patron Saint of Brazil', recurring: true },
  { name: 'All Souls\' Day', date: '02/11/2026', type: 'national', description: 'Day of the Dead', recurring: true },
  { name: 'Republic Day', date: '15/11/2026', type: 'national', description: 'Proclamation of the Republic', recurring: true },
  { name: 'National Day of Zumbi', date: '20/11/2026', type: 'national', description: 'Black Consciousness Day', recurring: true },
  { name: 'Christmas', date: '25/12/2026', type: 'national', description: 'Christmas Day', recurring: true }
];

// Get admin user for created_by reference
const createdBy = admin ? admin.id : null;

let created = 0;
let skipped = 0;

brazilianHolidays.forEach(holiday => {
  try {
    // Check if holiday already exists for this date
    const existing = Holiday.findByDate(holiday.date);
    const exists = existing.some(h => h.name === holiday.name);
    
    if (!exists) {
      Holiday.create({
        ...holiday,
        created_by: createdBy
      });
      created++;
      console.log(`Created: ${holiday.name} (${holiday.date})`);
    } else {
      skipped++;
    }
  } catch (error) {
    console.error(`Error creating holiday ${holiday.name}:`, error.message);
  }
});

console.log(`\nSeeding complete! Created: ${created}, Skipped: ${skipped}`);
