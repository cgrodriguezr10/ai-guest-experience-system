const Database = require('../config/database');

class ReservationService {
  static async createReservation(guestId, hotelId, reservationType, details) {
    try {
      const confirmationCode = this.generateConfirmationCode();
      
      const result = await Database.query(
        `INSERT INTO reservations (guest_id, hotel_id, reservation_type, details, status, confirmation_code) 
         VALUES ($1, $2, $3, $4, $5, $6) 
         RETURNING *`,
        [guestId, hotelId, reservationType, JSON.stringify(details), 'pending', confirmationCode]
      );
      
      console.log(`📋 Reservation created: ${confirmationCode}`);
      return result.rows[0];
    } catch (error) {
      console.error('Error creating reservation:', error);
      return null;
    }
  }

  static async confirmReservation(reservationId) {
    try {
      const result = await Database.query(
        `UPDATE reservations SET status = 'confirmed', updated_at = CURRENT_TIMESTAMP 
         WHERE id = $1 
         RETURNING *`,
        [reservationId]
      );
      
      console.log(`✅ Reservation confirmed: ${reservationId}`);
      return result.rows[0];
    } catch (error) {
      console.error('Error confirming reservation:', error);
      return null;
    }
  }

  static async getReservationsByGuest(guestId) {
    try {
      const result = await Database.query(
        'SELECT * FROM reservations WHERE guest_id = $1 ORDER BY created_at DESC',
        [guestId]
      );
      return result.rows;
    } catch (error) {
      console.error('Error fetching reservations:', error);
      return [];
    }
  }

  static generateConfirmationCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }
}

module.exports = ReservationService;