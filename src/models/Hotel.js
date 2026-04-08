const { query, queryOne, execute } = require('../config/database');

class Hotel {
  static async findById(id) {
    return queryOne(
      'SELECT * FROM hotels WHERE id = ?',
      [id]
    );
  }

  static async findAll() {
    return query('SELECT * FROM hotels');
  }

  static async create(data) {
    return execute(
      'INSERT INTO hotels (name, language_default, timezone, description, country, city) VALUES (?, ?, ?, ?, ?, ?)',
      [data.name, data.language_default, data.timezone, data.description, data.country, data.city]
    );
  }

  static async update(id, data) {
    return execute(
      'UPDATE hotels SET name = ?, language_default = ?, timezone = ? WHERE id = ?',
      [data.name, data.language_default, data.timezone, id]
    );
  }
}

module.exports = Hotel;
