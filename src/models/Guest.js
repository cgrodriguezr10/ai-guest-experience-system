const { query, queryOne, execute } = require('../config/database');

class Guest {
  static async findById(id) {
    return queryOne(
      'SELECT * FROM guests WHERE id = ?',
      [id]
    );
  }

  static async findByPhone(phone, hotelId) {
    return queryOne(
      'SELECT * FROM guests WHERE whatsapp_number = ? AND hotel_id = ?',
      [phone, hotelId]
    );
  }

  static async findAllByHotel(hotelId) {
    return query(
      'SELECT * FROM guests WHERE hotel_id = ? ORDER BY created_at DESC',
      [hotelId]
    );
  }

  static async create(data) {
    return execute(
      `INSERT INTO guests (
        hotel_id, whatsapp_number, name, language, trip_type, 
        dietary_preferences, interests, check_in_date, check_out_date, 
        room_number, onboarding_completed, profile_completed
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.hotel_id,
        data.whatsapp_number,
        data.name || null,
        data.language || 'EN',
        data.trip_type || null,
        data.dietary_preferences ? JSON.stringify(data.dietary_preferences) : null,
        data.interests ? JSON.stringify(data.interests) : null,
        data.check_in_date || null,
        data.check_out_date || null,
        data.room_number || null,
        data.onboarding_completed || false,
        data.profile_completed || false
      ]
    );
  }

  static async update(id, data) {
    return execute(
      `UPDATE guests SET 
        name = ?, language = ?, trip_type = ?, 
        dietary_preferences = ?, interests = ?,
        onboarding_completed = ?, profile_completed = ?,
        last_interaction_at = CURRENT_TIMESTAMP
      WHERE id = ?`,
      [
        data.name,
        data.language,
        data.trip_type,
        data.dietary_preferences ? JSON.stringify(data.dietary_preferences) : null,
        data.interests ? JSON.stringify(data.interests) : null,
        data.onboarding_completed || false,
        data.profile_completed || false,
        id
      ]
    );
  }
}

module.exports = Guest;
