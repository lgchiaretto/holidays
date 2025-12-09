const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config');

/**
 * Login user and return JWT token
 */
const login = (req, res) => {
  try {
    const { email, password } = req.body;

    const user = User.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    if (!user.active) {
      return res.status(401).json({
        success: false,
        error: 'User account is deactivated'
      });
    }

    if (!User.validatePassword(user, password)) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Register new user (admin only or public depending on config)
 */
const register = (req, res) => {
  try {
    const { email, password, name, role } = req.body;

    // Check if email already exists
    const existingUser = User.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'Email already registered'
      });
    }

    // Only admins can create admin users
    const userRole = (req.user && req.user.role === 'admin' && role === 'admin') ? 'admin' : 'user';

    const user = User.create({
      email,
      password,
      name,
      role: userRole
    });

    res.status(201).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Get current user profile
 */
const getProfile = (req, res) => {
  res.json({
    success: true,
    data: req.user
  });
};

/**
 * Update current user profile
 */
const updateProfile = (req, res) => {
  try {
    const { name, email } = req.body;
    
    // Check if email is being changed and already exists
    if (email && email !== req.user.email) {
      const existingUser = User.findByEmail(email);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          error: 'Email already in use'
        });
      }
    }

    const updatedUser = User.update(req.user.id, { name, email });
    
    res.json({
      success: true,
      data: updatedUser
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Change current user password
 */
const changePassword = (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    const user = User.findByEmail(req.user.email);
    
    if (!User.validatePassword(user, currentPassword)) {
      return res.status(400).json({
        success: false,
        error: 'Current password is incorrect'
      });
    }

    User.updatePassword(req.user.id, newPassword);

    res.json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Refresh JWT token
 */
const refreshToken = (req, res) => {
  try {
    const token = jwt.sign(
      { id: req.user.id, email: req.user.email, role: req.user.role },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    res.json({
      success: true,
      data: { token }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

module.exports = {
  login,
  register,
  getProfile,
  updateProfile,
  changePassword,
  refreshToken
};
