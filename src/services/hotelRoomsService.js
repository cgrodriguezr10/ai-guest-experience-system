const Database = require('../config/database');
const PMSSimulatorService = require('./pmsSimulatorService');

class HotelRoomsService {
  /**
   * Obtener disponibilidad de habitaciones
   */
  static async getAvailableRooms(checkInDate, checkOutDate) {
    try {
      // Llamar al PMS para obtener disponibilidad
      const availableRooms = await PMSSimulatorService.checkAvailability(checkInDate, checkOutDate);
      
      if (availableRooms.length === 0) {
        return {
          success: false,
          message: 'No available rooms for these dates',
          rooms: []
        };
      }

      return {
        success: true,
        message: `${availableRooms.length} rooms available`,
        rooms: availableRooms
      };
    } catch (error) {
      console.error('Error getting available rooms:', error);
      return {
        success: false,
        message: 'Error checking availability',
        rooms: []
      };
    }
  }

  /**
   * Obtener detalles de una habitación
   */
  static async getRoomDetails(roomNumber) {
    try {
      const room = PMSSimulatorService.getRoomDetails(roomNumber);
      
      if (!room) {
        return {
          success: false,
          message: 'Room not found',
          data: null
        };
      }

      return {
        success: true,
        message: 'Room details retrieved',
        data: room
      };
    } catch (error) {
      console.error('Error getting room details:', error);
      return {
        success: false,
        message: 'Error retrieving room details',
        data: null
      };
    }
  }

  /**
   * Guardar reserva de habitación en BD
   */
  static async saveRoomReservation(reservationData) {
    try {
      const result = await Database.query(
        `INSERT INTO room_reservations (guest_id, room_id, check_in, check_out, number_of_nights, total_price, status, confirmation_code, payment_status, payment_link, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         RETURNING *`,
        [
          reservationData.guest_id,
          reservationData.room_id,
          reservationData.check_in,
          reservationData.check_out,
          reservationData.number_of_nights,
          reservationData.total_price,
          'pending_payment',
          reservationData.confirmation_code,
          'pending',
          reservationData.payment_link,
          reservationData.notes || null
        ]
      );

      console.log(`🏨 Room reservation saved: ${reservationData.confirmation_code}`);
      return {
        success: true,
        data: result.rows[0]
      };
    } catch (error) {
      console.error('Error saving room reservation:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  /**
   * Confirmar reserva de habitación
   */
  static async confirmRoomReservation(confirmationCode) {
    try {
      const result = await Database.query(
        `UPDATE room_reservations SET status = 'confirmed', payment_status = 'completed' WHERE confirmation_code = $1 RETURNING *`,
        [confirmationCode]
      );

      if (result.rows.length === 0) {
        return {
          success: false,
          message: 'Reservation not found'
        };
      }

      console.log(`✅ Room reservation confirmed: ${confirmationCode}`);
      return {
        success: true,
        data: result.rows[0]
      };
    } catch (error) {
      console.error('Error confirming reservation:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  /**
   * Obtener reservas de un huésped
   */
  static async getGuestRoomReservations(guestId) {
    try {
      const result = await Database.query(
        `SELECT rr.*, r.room_number, r.room_type, r.price_per_night
         FROM room_reservations rr
         JOIN rooms r ON rr.room_id = r.id
         WHERE rr.guest_id = $1
         ORDER BY rr.created_at DESC`,
        [guestId]
      );

      return result.rows;
    } catch (error) {
      console.error('Error getting guest reservations:', error);
      return [];
    }
  }

  /**
   * Generar mensaje de disponibilidad
   */
  static async getAvailabilityMessage(checkInDate, checkOutDate, language = 'ES') {
    try {
      const availability = await this.getAvailableRooms(checkInDate, checkOutDate);

      if (!availability.success) {
        return language === 'ES'
          ? `❌ No hay habitaciones disponibles para esas fechas\n\n(${checkInDate} al ${checkOutDate})`
          : `❌ No available rooms for those dates\n\n(${checkInDate} to ${checkOutDate})`;
      }

      let message = language === 'ES'
        ? `🏨 HABITACIONES DISPONIBLES\n\n`
        : `🏨 AVAILABLE ROOMS\n\n`;

      message += language === 'ES'
        ? `📅 Del ${checkInDate} al ${checkOutDate}\n\n`
        : `📅 From ${checkInDate} to ${checkOutDate}\n\n`;

      availability.rooms.forEach((room, index) => {
        message += `${index + 1}. ${room.room_type} (${room.room_number})\n`;
        message += `   💰 $${room.price_per_night}/noche x ${room.numberOfNights} noches\n`;
        message += `   💵 Total: $${room.totalPrice}\n`;
        message += `   👥 Máximo: ${room.max_guests} huéspedes\n`;
        message += `   ✨ ${room.amenities.join(', ')}\n\n`;
      });

      message += language === 'ES'
        ? '¿Cuál te interesa? Escribe el número'
        : 'Which one interests you? Type the number';

      return message;
    } catch (error) {
      console.error('Error generating availability message:', error);
      return 'Error loading availability';
    }
  }

  /**
   * Generar código de confirmación
   */
  static generateConfirmationCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }
}

module.exports = HotelRoomsService;