const Holiday = require('../models/Holiday');

/**
 * List all holidays with filtering and pagination
 */
const list = (req, res) => {
  try {
    const {
      page = 1,
      limit = 100,
      active,
      type,
      year,
      month,
      start_date,
      end_date,
      search,
      order_by = 'date',
      order_dir = 'ASC'
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const options = {
      limit: parseInt(limit),
      offset,
      active: active !== undefined ? active === 'true' : undefined,
      type,
      year: year ? parseInt(year) : undefined,
      month: month ? parseInt(month) : undefined,
      startDate: start_date,
      endDate: end_date,
      search,
      orderBy: order_by,
      orderDir: order_dir
    };

    const holidays = Holiday.findAll(options);
    const total = Holiday.count(options);

    res.json({
      success: true,
      data: holidays,
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
 * Get a single holiday by ID
 */
const getById = (req, res) => {
  try {
    const { id } = req.params;
    const holiday = Holiday.findById(parseInt(id));

    if (!holiday) {
      return res.status(404).json({
        success: false,
        error: 'Holiday not found'
      });
    }

    res.json({
      success: true,
      data: holiday
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Create a new holiday (admin only)
 */
const create = (req, res) => {
  try {
    const { name, date, type, description, recurring } = req.body;

    const holiday = Holiday.create({
      name,
      date,
      type,
      description,
      recurring,
      created_by: req.user.id
    });

    res.status(201).json({
      success: true,
      data: holiday
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Update an existing holiday (admin only)
 */
const update = (req, res) => {
  try {
    const { id } = req.params;
    const { name, date, type, description, recurring, active } = req.body;

    const existingHoliday = Holiday.findById(parseInt(id));
    if (!existingHoliday) {
      return res.status(404).json({
        success: false,
        error: 'Holiday not found'
      });
    }

    const holiday = Holiday.update(parseInt(id), {
      name,
      date,
      type,
      description,
      recurring,
      active
    });

    res.json({
      success: true,
      data: holiday
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Delete a holiday (admin only)
 */
const remove = (req, res) => {
  try {
    const { id } = req.params;

    const existingHoliday = Holiday.findById(parseInt(id));
    if (!existingHoliday) {
      return res.status(404).json({
        success: false,
        error: 'Holiday not found'
      });
    }

    Holiday.delete(parseInt(id));

    res.json({
      success: true,
      message: 'Holiday deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Check if a specific date is a holiday
 */
const checkDate = (req, res) => {
  try {
    const { date } = req.params;
    const isHoliday = Holiday.isHoliday(date);
    const holidays = Holiday.findByDate(date);

    res.json({
      success: true,
      data: {
        date,
        is_holiday: isHoliday,
        holidays
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
 * Get upcoming holidays
 */
const upcoming = (req, res) => {
  try {
    const { days = 30 } = req.query;
    const holidays = Holiday.findUpcoming(parseInt(days));

    res.json({
      success: true,
      data: holidays
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Get holidays for a specific year
 */
const byYear = (req, res) => {
  try {
    const { year } = req.params;
    const holidays = Holiday.findAll({
      year: parseInt(year),
      active: true,
      limit: 366,
      orderBy: 'date',
      orderDir: 'ASC'
    });

    res.json({
      success: true,
      data: holidays
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Get holidays for a specific month
 */
const byMonth = (req, res) => {
  try {
    const { year, month } = req.params;
    const holidays = Holiday.findAll({
      year: parseInt(year),
      month: parseInt(month),
      active: true,
      limit: 31,
      orderBy: 'date',
      orderDir: 'ASC'
    });

    res.json({
      success: true,
      data: holidays
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
  checkDate,
  upcoming,
  byYear,
  byMonth
};
