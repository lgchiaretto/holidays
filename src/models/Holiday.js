const db = require('../database');

class Holiday {
  /**
   * Parse date from Brazilian format (DD/MM/YYYY) to ISO format (YYYY-MM-DD)
   */
  static parseDate(dateStr) {
    if (!dateStr) return null;
    
    // If already in ISO format
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return dateStr;
    }
    
    // Brazilian format DD/MM/YYYY
    const match = dateStr.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (match) {
      return `${match[3]}-${match[2]}-${match[1]}`;
    }
    
    return null;
  }

  /**
   * Format date from ISO format (YYYY-MM-DD) to Brazilian format (DD/MM/YYYY)
   */
  static formatDate(dateStr) {
    if (!dateStr) return null;
    
    const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      return `${match[3]}/${match[2]}/${match[1]}`;
    }
    
    return dateStr;
  }

  /**
   * Transform holiday object to include Brazilian date format
   */
  static transformHoliday(holiday) {
    if (!holiday) return null;
    return {
      ...holiday,
      date: this.formatDate(holiday.date),
      date_iso: holiday.date,
      active: Boolean(holiday.active),
      recurring: Boolean(holiday.recurring)
    };
  }

  static findById(id) {
    const holiday = db.prepare('SELECT * FROM holidays WHERE id = ?').get(id);
    return this.transformHoliday(holiday);
  }

  static findAll(options = {}) {
    const { 
      limit = 100, 
      offset = 0, 
      active, 
      type, 
      year,
      month,
      startDate,
      endDate,
      search,
      orderBy = 'date',
      orderDir = 'ASC'
    } = options;

    let query = 'SELECT * FROM holidays WHERE 1=1';
    const params = [];

    if (active !== undefined) {
      query += ' AND active = ?';
      params.push(active ? 1 : 0);
    }

    if (type) {
      query += ' AND type = ?';
      params.push(type);
    }

    if (year) {
      query += ' AND strftime("%Y", date) = ?';
      params.push(String(year));
    }

    if (month) {
      query += ' AND strftime("%m", date) = ?';
      params.push(String(month).padStart(2, '0'));
    }

    if (startDate) {
      const parsedStart = this.parseDate(startDate) || startDate;
      query += ' AND date >= ?';
      params.push(parsedStart);
    }

    if (endDate) {
      const parsedEnd = this.parseDate(endDate) || endDate;
      query += ' AND date <= ?';
      params.push(parsedEnd);
    }

    if (search) {
      query += ' AND (name LIKE ? OR description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    // Validate orderBy and orderDir
    const validOrderBy = ['date', 'name', 'type', 'created_at'];
    const validOrderDir = ['ASC', 'DESC'];
    const safeOrderBy = validOrderBy.includes(orderBy) ? orderBy : 'date';
    const safeOrderDir = validOrderDir.includes(orderDir.toUpperCase()) ? orderDir.toUpperCase() : 'ASC';

    query += ` ORDER BY ${safeOrderBy} ${safeOrderDir} LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const holidays = db.prepare(query).all(...params);
    return holidays.map(h => this.transformHoliday(h));
  }

  static create(holidayData) {
    const { name, date, type = 'national', description, recurring = true, created_by } = holidayData;
    const parsedDate = this.parseDate(date) || date;

    const stmt = db.prepare(`
      INSERT INTO holidays (name, date, type, description, recurring, created_by)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(name, parsedDate, type, description || null, recurring ? 1 : 0, created_by || null);
    return this.findById(result.lastInsertRowid);
  }

  static update(id, holidayData) {
    const { name, date, type, description, recurring, active } = holidayData;
    const fields = [];
    const params = [];

    if (name !== undefined) {
      fields.push('name = ?');
      params.push(name);
    }
    if (date !== undefined) {
      fields.push('date = ?');
      params.push(this.parseDate(date) || date);
    }
    if (type !== undefined) {
      fields.push('type = ?');
      params.push(type);
    }
    if (description !== undefined) {
      fields.push('description = ?');
      params.push(description);
    }
    if (recurring !== undefined) {
      fields.push('recurring = ?');
      params.push(recurring ? 1 : 0);
    }
    if (active !== undefined) {
      fields.push('active = ?');
      params.push(active ? 1 : 0);
    }

    if (fields.length === 0) return this.findById(id);

    fields.push("updated_at = datetime('now')");
    params.push(id);

    const stmt = db.prepare(`UPDATE holidays SET ${fields.join(', ')} WHERE id = ?`);
    stmt.run(...params);

    return this.findById(id);
  }

  static delete(id) {
    const stmt = db.prepare('DELETE FROM holidays WHERE id = ?');
    return stmt.run(id);
  }

  static count(options = {}) {
    const { active, type, year, month, startDate, endDate, search } = options;
    let query = 'SELECT COUNT(*) as count FROM holidays WHERE 1=1';
    const params = [];

    if (active !== undefined) {
      query += ' AND active = ?';
      params.push(active ? 1 : 0);
    }

    if (type) {
      query += ' AND type = ?';
      params.push(type);
    }

    if (year) {
      query += ' AND strftime("%Y", date) = ?';
      params.push(String(year));
    }

    if (month) {
      query += ' AND strftime("%m", date) = ?';
      params.push(String(month).padStart(2, '0'));
    }

    if (startDate) {
      const parsedStart = this.parseDate(startDate) || startDate;
      query += ' AND date >= ?';
      params.push(parsedStart);
    }

    if (endDate) {
      const parsedEnd = this.parseDate(endDate) || endDate;
      query += ' AND date <= ?';
      params.push(parsedEnd);
    }

    if (search) {
      query += ' AND (name LIKE ? OR description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    return db.prepare(query).get(...params).count;
  }

  static findByDate(date) {
    const parsedDate = this.parseDate(date) || date;
    const holidays = db.prepare('SELECT * FROM holidays WHERE date = ? AND active = 1').all(parsedDate);
    return holidays.map(h => this.transformHoliday(h));
  }

  static findUpcoming(days = 30) {
    const today = new Date().toISOString().split('T')[0];
    const future = new Date();
    future.setDate(future.getDate() + days);
    const futureDate = future.toISOString().split('T')[0];

    const holidays = db.prepare(`
      SELECT * FROM holidays 
      WHERE date >= ? AND date <= ? AND active = 1 
      ORDER BY date ASC
    `).all(today, futureDate);

    return holidays.map(h => this.transformHoliday(h));
  }

  static isHoliday(date) {
    const parsedDate = this.parseDate(date) || date;
    const result = db.prepare('SELECT COUNT(*) as count FROM holidays WHERE date = ? AND active = 1').get(parsedDate);
    return result.count > 0;
  }
}

module.exports = Holiday;
