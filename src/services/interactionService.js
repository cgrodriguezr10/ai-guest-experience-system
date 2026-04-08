const Interaction = require('../models/Interaction');

class InteractionService {
  /**
   * Guardar una interacción
   */
  static async createInteraction(data) {
    try {
      const result = await Interaction.create({
        guest_id: data.guest_id,
        message_type: data.message_type,
        incoming_message: data.incoming_message,
        outgoing_message: data.outgoing_message,
        sentiment: data.sentiment || 'neutral',
        tokens_used: data.tokens_used || 0
      });

      return result;
    } catch (error) {
      console.error('Error in createInteraction:', error);
      throw error;
    }
  }

  /**
   * Obtener historial de guest
   */
  static async getGuestHistory(guestId, limit = 50) {
    try {
      return await Interaction.findByGuestId(guestId, limit);
    } catch (error) {
      console.error('Error in getGuestHistory:', error);
      throw error;
    }
  }

  /**
   * Obtener último tipo de mensaje
   */
  static async getLastMessageType(guestId) {
    try {
      const interactions = await Interaction.findByGuestId(guestId, 1);
      return interactions.length > 0 ? interactions[0].message_type : null;
    } catch (error) {
      console.error('Error in getLastMessageType:', error);
      throw error;
    }
  }
}

module.exports = InteractionService;
