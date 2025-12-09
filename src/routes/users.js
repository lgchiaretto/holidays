const express = require('express');
const { body, param } = require('express-validator');
const userController = require('../controllers/userController');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { handleValidation } = require('../middleware/validation');

const router = express.Router();

// All user routes require admin access
router.use(authenticate, requireAdmin);

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: List all users (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: active
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: List of users
 *       403:
 *         description: Admin access required
 */
router.get('/', userController.list);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get a user by ID (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User details
 *       403:
 *         description: Admin access required
 *       404:
 *         description: User not found
 */
router.get('/:id', [
  param('id').isInt().withMessage('Invalid user ID'),
  handleValidation
], userController.getById);

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Create a new user (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - name
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 6
 *               name:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [user, admin]
 *     responses:
 *       201:
 *         description: User created
 *       403:
 *         description: Admin access required
 *       409:
 *         description: Email already exists
 */
router.post('/', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('name').notEmpty().withMessage('Name is required'),
  body('role').optional().isIn(['user', 'admin']).withMessage('Role must be user or admin'),
  handleValidation
], userController.create);

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Update a user (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               name:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [user, admin]
 *               active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: User updated
 *       403:
 *         description: Admin access required
 *       404:
 *         description: User not found
 */
router.put('/:id', [
  param('id').isInt().withMessage('Invalid user ID'),
  body('email').optional().isEmail().withMessage('Valid email is required'),
  body('name').optional().notEmpty().withMessage('Name cannot be empty'),
  body('role').optional().isIn(['user', 'admin']).withMessage('Role must be user or admin'),
  body('active').optional().isBoolean(),
  handleValidation
], userController.update);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete a user (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User deleted
 *       400:
 *         description: Cannot delete own account
 *       403:
 *         description: Admin access required
 *       404:
 *         description: User not found
 */
router.delete('/:id', [
  param('id').isInt().withMessage('Invalid user ID'),
  handleValidation
], userController.remove);

/**
 * @swagger
 * /api/users/{id}/reset-password:
 *   post:
 *     summary: Reset user password (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - newPassword
 *             properties:
 *               newPassword:
 *                 type: string
 *                 minLength: 6
 *     responses:
 *       200:
 *         description: Password reset
 *       403:
 *         description: Admin access required
 *       404:
 *         description: User not found
 */
router.post('/:id/reset-password', [
  param('id').isInt().withMessage('Invalid user ID'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
  handleValidation
], userController.resetPassword);

module.exports = router;
