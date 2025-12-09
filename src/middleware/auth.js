const jwt = require('jsonwebtoken');
const config = require('../config');
const User = require('../models/User');

/**
 * Middleware to authenticate JWT token
 */
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      success: false,
      error: 'Access denied. No token provided.'
    });
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({
      success: false,
      error: 'Invalid token format. Use: Bearer <token>'
    });
  }

  const token = parts[1];

  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    const user = User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User not found.'
      });
    }

    if (!user.active) {
      return res.status(401).json({
        success: false,
        error: 'User account is deactivated.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token expired.'
      });
    }
    return res.status(401).json({
      success: false,
      error: 'Invalid token.'
    });
  }
};

/**
 * Middleware to check if user has admin role
 */
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Access denied. Admin privileges required.'
    });
  }
  next();
};

/**
 * Middleware to check if user has admin role or is the same user
 */
const requireAdminOrSelf = (req, res, next) => {
  const targetUserId = parseInt(req.params.id);
  
  if (req.user.role === 'admin' || req.user.id === targetUserId) {
    return next();
  }
  
  return res.status(403).json({
    success: false,
    error: 'Access denied. You can only access your own data.'
  });
};

/**
 * Optional authentication - attaches user if token is valid, but doesn't require it
 */
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return next();
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return next();
  }

  const token = parts[1];

  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    const user = User.findById(decoded.id);
    if (user && user.active) {
      req.user = user;
    }
  } catch (error) {
    // Ignore invalid tokens for optional auth
  }

  next();
};

module.exports = {
  authenticate,
  requireAdmin,
  requireAdminOrSelf,
  optionalAuth
};
