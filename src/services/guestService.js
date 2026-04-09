const Database = require('../config/database');

class GuestService {
  static async getGuestByPhone(phone) {
    try {
      const result = await Database.query(
        'SELECT * FROM guests WHERE phone = $1',
        [phone]
      );
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error fetching guest:', error);
      return null;
    }
  }

  static async createGuest(phone) {
    try {
      const result = await Database.query(
        `INSERT INTO guests (phone, language, onboarding_completed) 
         VALUES ($1, $2, $3) 
         RETURNING *`,
        [phone, 'EN', false]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error creating guest:', error);
      return null;
    }
  }

  static async updateGuest(id, updates) {
    try {
      const fields = Object.keys(updates);
      const values = Object.values(updates);
      
      const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');
      
      const result = await Database.query(
        `UPDATE guests SET ${setClause}, updated_at = CURRENT_TIMESTAMP 
         WHERE id = $${fields.length + 1} 
         RETURNING *`,
        [...values, id]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error updating guest:', error);
      return null;
    }
  }

  static async getGuestById(id) {
    try {
      const result = await Database.query(
        'SELECT * FROM guests WHERE id = $1',
        [id]
      );
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error fetching guest by id:', error);
      return null;
    }
  }

  static async getAllGuests() {
    try {
      const result = await Database.query('SELECT * FROM guests');
      return result.rows;
    } catch (error) {
      console.error('Error fetching all guests:', error);
      return [];
    }
  }
}

module.exports = GuestService;