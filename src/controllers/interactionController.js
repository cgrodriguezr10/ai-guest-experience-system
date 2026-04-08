const InteractionService = require('../services/interactionService');

class InteractionController {
  /**
   * Obtener historial de guest
   */
  static async getGuestHistory(req, res) {
    try {
      const { guestId } = req.params;
      const limit = req.query.limit || 50;

      const interactions = await InteractionService.getGuestHistory(guestId, limit);

      res.status(200).json({
        guestId: guestId,
        total: interactions.length,
        interactions: interactions
      });
    } catch (error) {
      console.error('Error in getGuestHistory:', error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Obtener una interacción
   */
  static async getInteraction(req, res) {
    try {
      const { id } = req.params;
      
      if (!id) {
        return res.status(400).json({ error: 'Missing interaction ID' });
      }

      res.status(200).json({
        message: 'Use /interactions/:guestId to get guest history'
      });
    } catch (error) {
      console.error('Error in getInteraction:', error);
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = InteractionController;
