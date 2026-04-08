const GuestService = require('../services/guestService');
const Guest = require('../models/Guest');

class GuestController {
  /**
   * Obtener guest por ID
   */
  static async getGuest(req, res) {
    try {
      const { id } = req.params;
      const guest = await GuestService.getGuestWithHistory(id);

      if (!guest) {
        return res.status(404).json({ error: 'Guest not found' });
      }

      res.status(200).json(guest);
    } catch (error) {
      console.error('Error in getGuest:', error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Obtener todos los guests del hotel
   */
  static async getAllGuests(req, res) {
    try {
      const hotelId = req.params.hotelId || 1;
      const guests = await Guest.findAllByHotel(hotelId);

      res.status(200).json({
        total: guests.length,
        guests: guests
      });
    } catch (error) {
      console.error('Error in getAllGuests:', error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Obtener guest por teléfono
   */
  static async getGuestByPhone(req, res) {
    try {
      const { phone } = req.params;
      const hotelId = req.query.hotelId || 1;

      const guest = await Guest.findByPhone(phone, hotelId);

      if (!guest) {
        return res.status(404).json({ error: 'Guest not found' });
      }

      res.status(200).json(guest);
    } catch (error) {
      console.error('Error in getGuestByPhone:', error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Crear guest
   */
  static async createGuest(req, res) {
    try {
      const { whatsapp_number, hotel_id, language } = req.body;

      if (!whatsapp_number || !hotel_id) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const guest = await GuestService.getOrCreateGuest(whatsapp_number, hotel_id);

      res.status(201).json({
        message: 'Guest created/updated',
        guest: guest
      });
    } catch (error) {
      console.error('Error in createGuest:', error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Actualizar guest
   */
  static async updateGuest(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;

      const updatedGuest = await GuestService.updateGuestProfile(id, data);

      res.status(200).json({
        message: 'Guest updated',
        guest: updatedGuest
      });
    } catch (error) {
      console.error('Error in updateGuest:', error);
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = GuestController;
