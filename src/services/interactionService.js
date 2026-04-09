const Database = require('../config/database');

class InteractionService {
  static async saveInteraction(data) {
    try {
      const result = await Database.query(
        `INSERT INTO interactions (guest_id, incoming_message, outgoing_message, message_type, category, tokens_used) 
         VALUES ($1, $2, $3, $4, $5, $6) 
         RETURNING *`,
        [
          data.guest_id,
          data.incoming_message,
          data.outgoing_message,
          data.message_type || 'user_question',
          data.category || 'general',
          data.tokens_used || 0
        ]
      );
      console.log(`📝 Interaction saved: ${result.rows[0].id}`);
      return result.rows[0];
    } catch (error) {
      console.error('Error saving interaction:', error);
      return null;
    }
  }

  static async getInteractionsByGuest(guestId) {
    try {
      const result = await Database.query(
        'SELECT * FROM interactions WHERE guest_id = $1 ORDER BY created_at DESC',
        [guestId]
      );
      return result.rows;
    } catch (error) {
      console.error('Error fetching interactions:', error);
      return [];
    }
  }

  static async getAllInteractions() {
    try {
      const result = await Database.query('SELECT * FROM interactions ORDER BY created_at DESC');
      return result.rows;
    } catch (error) {
      console.error('Error fetching all interactions:', error);
      return [];
    }
  }
}

module.exports = InteractionService;