const express = require('express');
const authRoutes = require('./auth');
const holidayRoutes = require('./holidays');
const userRoutes = require('./users');

const router = express.Router();

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString()
  });
});

// Mount routes
router.use('/auth', authRoutes);
router.use('/holidays', holidayRoutes);
router.use('/users', userRoutes);

module.exports = router;
