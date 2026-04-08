const { query, queryOne, execute } = require('../config/database');

class Interaction {
  static async findById(id) {
    return queryOne(
      'SELECT * FROM interactions WHERE id = ?',
      [id]
    );
  }

  static async findByGuestId(guestId, limit = 50) {
    return query(
      'SELECT * FROM interactions WHERE guest_id = ? ORDER BY created_at DESC LIMIT ?',
      [guestId, limit]
    );
  }

  static async create(data) {
    return execute(
      `INSERT INTO interactions (
        guest_id, message_type, incoming_message, 
        outgoing_message, sentiment, tokens_used
      ) VALUES (?, ?, ?, ?, ?, ?)`,
      [
        data.guest_id,
        data.message_type,
        data.incoming_message || null,
        data.outgoing_message || null,
        data.sentiment || 'neutral',
        data.tokens_used || 0
      ]
    );
  }

  static async getByGuestAndType(guestId, messageType) {
    return query(
      'SELECT * FROM interactions WHERE guest_id = ? AND message_type = ? ORDER BY created_at DESC LIMIT 10',
      [guestId, messageType]
    );
  }
}

module.exports = Interaction;
