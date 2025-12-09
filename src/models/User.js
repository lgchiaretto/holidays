const db = require('../database');
const bcrypt = require('bcryptjs');

class User {
  static findById(id) {
    return db.prepare('SELECT id, email, name, role, active, created_at, updated_at FROM users WHERE id = ?').get(id);
  }

  static findByEmail(email) {
    return db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  }

  static findAll(options = {}) {
    const { limit = 100, offset = 0, active } = options;
    let query = 'SELECT id, email, name, role, active, created_at, updated_at FROM users';
    const params = [];

    if (active !== undefined) {
      query += ' WHERE active = ?';
      params.push(active ? 1 : 0);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    return db.prepare(query).all(...params);
  }

  static create(userData) {
    const { email, password, name, role = 'user' } = userData;
    const hashedPassword = bcrypt.hashSync(password, 10);

    const stmt = db.prepare(`
      INSERT INTO users (email, password, name, role)
      VALUES (?, ?, ?, ?)
    `);

    const result = stmt.run(email, hashedPassword, name, role);
    return this.findById(result.lastInsertRowid);
  }

  static update(id, userData) {
    const { email, name, role, active } = userData;
    const fields = [];
    const params = [];

    if (email !== undefined) {
      fields.push('email = ?');
      params.push(email);
    }
    if (name !== undefined) {
      fields.push('name = ?');
      params.push(name);
    }
    if (role !== undefined) {
      fields.push('role = ?');
      params.push(role);
    }
    if (active !== undefined) {
      fields.push('active = ?');
      params.push(active ? 1 : 0);
    }

    if (fields.length === 0) return this.findById(id);

    fields.push("updated_at = datetime('now')");
    params.push(id);

    const stmt = db.prepare(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`);
    stmt.run(...params);

    return this.findById(id);
  }

  static updatePassword(id, newPassword) {
    const hashedPassword = bcrypt.hashSync(newPassword, 10);
    const stmt = db.prepare("UPDATE users SET password = ?, updated_at = datetime('now') WHERE id = ?");
    stmt.run(hashedPassword, id);
  }

  static delete(id) {
    const stmt = db.prepare('DELETE FROM users WHERE id = ?');
    return stmt.run(id);
  }

  static validatePassword(user, password) {
    return bcrypt.compareSync(password, user.password);
  }

  static count(options = {}) {
    const { active } = options;
    let query = 'SELECT COUNT(*) as count FROM users';
    const params = [];

    if (active !== undefined) {
      query += ' WHERE active = ?';
      params.push(active ? 1 : 0);
    }

    return db.prepare(query).get(...params).count;
  }
}

module.exports = User;
