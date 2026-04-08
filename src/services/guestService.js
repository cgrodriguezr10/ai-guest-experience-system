const Guest = require('../models/Guest');

class GuestService {
  /**
   * Obtener o crear un guest por teléfono de WhatsApp
   */
  static async getOrCreateGuest(phone, hotelId) {
    try {
      // Buscar guest existente
      let guest = await Guest.findByPhone(phone, hotelId);

      if (!guest) {
        // Crear nuevo guest
        await Guest.create({
          hotel_id: hotelId,
          whatsapp_number: phone,
          language: 'EN',
          onboarding_completed: false,
          profile_completed: false
        });

        guest = await Guest.findByPhone(phone, hotelId);
      }

      return guest;
    } catch (error) {
      console.error('Error in getOrCreateGuest:', error);
      throw error;
    }
  }

  /**
   * Actualizar perfil de guest
   */
  static async updateGuestProfile(guestId, profileData) {
    try {
      await Guest.update(guestId, profileData);
      return await Guest.findById(guestId);
    } catch (error) {
      console.error('Error in updateGuestProfile:', error);
      throw error;
    }
  }

  /**
   * Obtener guest con historial de interacciones
   */
  static async getGuestWithHistory(guestId) {
    try {
      const guest = await Guest.findById(guestId);
      if (!guest) return null;

      return {
        ...guest,
        profile_completed: Boolean(guest.profile_completed),
        onboarding_completed: Boolean(guest.onboarding_completed)
      };
    } catch (error) {
      console.error('Error in getGuestWithHistory:', error);
      throw error;
    }
  }
}

module.exports = GuestService;
