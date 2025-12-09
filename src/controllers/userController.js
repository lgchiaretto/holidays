const User = require('../models/User');

/**
 * List all users (admin only)
 */
const list = (req, res) => {
  try {
    const { page = 1, limit = 100, active } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const options = {
      limit: parseInt(limit),
      offset,
      active: active !== undefined ? active === 'true' : undefined
    };

    const users = User.findAll(options);
    const total = User.count(options);

    res.json({
      success: true,
      data: users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
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
 * Get a single user by ID (admin only)
 */
const getById = (req, res) => {
  try {
    const { id } = req.params;
    const user = User.findById(parseInt(id));

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
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
 * Create a new user (admin only)
 */
const create = (req, res) => {
  try {
    const { email, password, name, role = 'user' } = req.body;

    // Check if email already exists
    const existingUser = User.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'Email already registered'
      });
    }

    const user = User.create({
      email,
      password,
      name,
      role
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
 * Update an existing user (admin only)
 */
const update = (req, res) => {
  try {
    const { id } = req.params;
    const { email, name, role, active } = req.body;

    const existingUser = User.findById(parseInt(id));
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Check if email is being changed and already exists
    if (email && email !== existingUser.email) {
      const userWithEmail = User.findByEmail(email);
      if (userWithEmail) {
        return res.status(409).json({
          success: false,
          error: 'Email already in use'
        });
      }
    }

    const user = User.update(parseInt(id), {
      email,
      name,
      role,
      active
    });

    res.json({
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
 * Delete a user (admin only)
 */
const remove = (req, res) => {
  try {
    const { id } = req.params;

    // Prevent self-deletion
    if (req.user.id === parseInt(id)) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete your own account'
      });
    }

    const existingUser = User.findById(parseInt(id));
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    User.delete(parseInt(id));

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Reset user password (admin only)
 */
const resetPassword = (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    const existingUser = User.findById(parseInt(id));
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    User.updatePassword(parseInt(id), newPassword);

    res.json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

module.exports = {
  list,
  getById,
  create,
  update,
  remove,
  resetPassword
};
