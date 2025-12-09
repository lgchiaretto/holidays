const express = require('express');
const { body, param, query } = require('express-validator');
const holidayController = require('../controllers/holidayController');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { handleValidation } = require('../middleware/validation');

const router = express.Router();

// Date validation regex for Brazilian format (DD/MM/YYYY) or ISO format (YYYY-MM-DD)
const dateRegex = /^(\d{2}\/\d{2}\/\d{4}|\d{4}-\d{2}-\d{2})$/;

/**
 * @swagger
 * /api/holidays:
 *   get:
 *     summary: List all holidays
 *     tags: [Holidays]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Items per page
 *       - in: query
 *         name: active
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [national, state, municipal, optional]
 *         description: Filter by holiday type
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         description: Filter by year
 *       - in: query
 *         name: month
 *         schema:
 *           type: integer
 *         description: Filter by month (1-12)
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *         description: Start date (DD/MM/YYYY or YYYY-MM-DD)
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *         description: End date (DD/MM/YYYY or YYYY-MM-DD)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in name and description
 *     responses:
 *       200:
 *         description: List of holidays
 */
router.get('/', authenticate, holidayController.list);

/**
 * @swagger
 * /api/holidays/upcoming:
 *   get:
 *     summary: Get upcoming holidays
 *     tags: [Holidays]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *         description: Number of days to look ahead (default 30)
 *     responses:
 *       200:
 *         description: List of upcoming holidays
 */
router.get('/upcoming', authenticate, holidayController.upcoming);

/**
 * @swagger
 * /api/holidays/year/{year}:
 *   get:
 *     summary: Get holidays for a specific year
 *     tags: [Holidays]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: year
 *         required: true
 *         schema:
 *           type: integer
 *         description: Year (e.g., 2024)
 *     responses:
 *       200:
 *         description: List of holidays for the year
 */
router.get('/year/:year', [
  authenticate,
  param('year').isInt({ min: 1900, max: 2100 }).withMessage('Invalid year'),
  handleValidation
], holidayController.byYear);

/**
 * @swagger
 * /api/holidays/year/{year}/month/{month}:
 *   get:
 *     summary: Get holidays for a specific month
 *     tags: [Holidays]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: year
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: month
 *         required: true
 *         schema:
 *           type: integer
 *         description: Month (1-12)
 *     responses:
 *       200:
 *         description: List of holidays for the month
 */
router.get('/year/:year/month/:month', [
  authenticate,
  param('year').isInt({ min: 1900, max: 2100 }).withMessage('Invalid year'),
  param('month').isInt({ min: 1, max: 12 }).withMessage('Invalid month'),
  handleValidation
], holidayController.byMonth);

/**
 * @swagger
 * /api/holidays/check/{date}:
 *   get:
 *     summary: Check if a date is a holiday
 *     tags: [Holidays]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *         description: Date to check (DD/MM/YYYY or YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Holiday check result
 */
router.get('/check/:date', [
  authenticate,
  param('date').matches(dateRegex).withMessage('Invalid date format. Use DD/MM/YYYY or YYYY-MM-DD'),
  handleValidation
], holidayController.checkDate);

/**
 * @swagger
 * /api/holidays/{id}:
 *   get:
 *     summary: Get a holiday by ID
 *     tags: [Holidays]
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
 *         description: Holiday details
 *       404:
 *         description: Holiday not found
 */
router.get('/:id', [
  authenticate,
  param('id').isInt().withMessage('Invalid holiday ID'),
  handleValidation
], holidayController.getById);

/**
 * @swagger
 * /api/holidays:
 *   post:
 *     summary: Create a new holiday (admin only)
 *     tags: [Holidays]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - date
 *             properties:
 *               name:
 *                 type: string
 *               date:
 *                 type: string
 *                 description: Date in DD/MM/YYYY or YYYY-MM-DD format
 *               type:
 *                 type: string
 *                 enum: [national, state, municipal, optional]
 *               description:
 *                 type: string
 *               recurring:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Holiday created
 *       403:
 *         description: Admin access required
 */
router.post('/', [
  authenticate,
  requireAdmin,
  body('name').notEmpty().withMessage('Name is required'),
  body('date').matches(dateRegex).withMessage('Invalid date format. Use DD/MM/YYYY or YYYY-MM-DD'),
  body('type').optional().isIn(['national', 'state', 'municipal', 'optional']).withMessage('Invalid holiday type'),
  body('description').optional().isString(),
  body('recurring').optional().isBoolean(),
  handleValidation
], holidayController.create);

/**
 * @swagger
 * /api/holidays/{id}:
 *   put:
 *     summary: Update a holiday (admin only)
 *     tags: [Holidays]
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
 *               name:
 *                 type: string
 *               date:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [national, state, municipal, optional]
 *               description:
 *                 type: string
 *               recurring:
 *                 type: boolean
 *               active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Holiday updated
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Holiday not found
 */
router.put('/:id', [
  authenticate,
  requireAdmin,
  param('id').isInt().withMessage('Invalid holiday ID'),
  body('name').optional().notEmpty().withMessage('Name cannot be empty'),
  body('date').optional().matches(dateRegex).withMessage('Invalid date format. Use DD/MM/YYYY or YYYY-MM-DD'),
  body('type').optional().isIn(['national', 'state', 'municipal', 'optional']).withMessage('Invalid holiday type'),
  body('description').optional().isString(),
  body('recurring').optional().isBoolean(),
  body('active').optional().isBoolean(),
  handleValidation
], holidayController.update);

/**
 * @swagger
 * /api/holidays/{id}:
 *   delete:
 *     summary: Delete a holiday (admin only)
 *     tags: [Holidays]
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
 *         description: Holiday deleted
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Holiday not found
 */
router.delete('/:id', [
  authenticate,
  requireAdmin,
  param('id').isInt().withMessage('Invalid holiday ID'),
  handleValidation
], holidayController.remove);

module.exports = router;
