const Database = require('../config/database');

class PMSIntegrationService {
  /**
   * Obtener todas las reservas pendientes de habitaciones
   * ENDPOINT: GET /api/pms/room-reservations/pending
   */
  static async getPendingRoomReservations() {
    try {
      const result = await Database.query(
        `SELECT 
          rr.id,
          rr.confirmation_code,
          rr.check_in,
          rr.check_out,
          rr.number_of_nights,
          rr.total_price,
          rr.status,
          rr.payment_status,
          r.room_number,
          r.room_type,
          r.price_per_night,
          g.name as guest_name,
          g.phone as guest_phone,
          g.language,
          g.room_number as guest_current_room
         FROM room_reservations rr
         JOIN rooms r ON rr.room_id = r.id
         JOIN guests g ON rr.guest_id = g.id
         WHERE rr.status IN ('pending', 'confirmed')
         ORDER BY rr.created_at DESC`
      );

      return {
        success: true,
        count: result.rows.length,
        reservations: result.rows
      };
    } catch (error) {
      console.error('Error fetching pending room reservations:', error);
      return {
        success: false,
        message: error.message,
        reservations: []
      };
    }
  }

  /**
   * Obtener todas las órdenes de servicios pendientes
   * ENDPOINT: GET /api/pms/service-orders/pending
   */
  static async getPendingServiceOrders() {
    try {
      const result = await Database.query(
        `SELECT 
          co.id,
          co.confirmation_code,
          co.quantity,
          co.price,
          co.notes,
          co.status,
          cp.name as service_name,
          cp.description as service_description,
          cp.price as unit_price,
          g.name as guest_name,
          g.phone as guest_phone,
          g.room_number,
          g.language,
          cc.name as category,
          co.created_at
         FROM catalog_orders co
         JOIN catalog_products cp ON co.product_id = cp.id
         JOIN catalog_categories cc ON cp.category_id = cc.id
         JOIN guests g ON co.guest_id = g.id
         WHERE co.status IN ('pending', 'confirmed')
         ORDER BY co.created_at DESC`
      );

      return {
        success: true,
        count: result.rows.length,
        orders: result.rows
      };
    } catch (error) {
      console.error('Error fetching pending service orders:', error);
      return {
        success: false,
        message: error.message,
        orders: []
      };
    }
  }

  /**
   * Obtener estado de una reserva específica
   * ENDPOINT: GET /api/pms/room-reservations/:confirmationCode
   */
  static async getRoomReservationByCode(confirmationCode) {
    try {
      const result = await Database.query(
        `SELECT 
          rr.id,
          rr.confirmation_code,
          rr.check_in,
          rr.check_out,
          rr.number_of_nights,
          rr.total_price,
          rr.status,
          rr.payment_status,
          rr.payment_link,
          r.room_number,
          r.room_type,
          r.price_per_night,
          g.name as guest_name,
          g.phone as guest_phone,
          g.email,
          g.language
         FROM room_reservations rr
         JOIN rooms r ON rr.room_id = r.id
         JOIN guests g ON rr.guest_id = g.id
         WHERE rr.confirmation_code = $1`,
        [confirmationCode]
      );

      if (result.rows.length === 0) {
        return {
          success: false,
          message: 'Reservation not found'
        };
      }

      return {
        success: true,
        reservation: result.rows[0]
      };
    } catch (error) {
      console.error('Error getting reservation:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  /**
   * Actualizar estado de reserva desde PMS
   * ENDPOINT: PUT /api/pms/room-reservations/:confirmationCode
   */
  static async updateRoomReservationStatus(confirmationCode, newStatus) {
    try {
      const result = await Database.query(
        `UPDATE room_reservations 
         SET status = $1, updated_at = NOW()
         WHERE confirmation_code = $2
         RETURNING *`,
        [newStatus, confirmationCode]
      );

      if (result.rows.length === 0) {
        return {
          success: false,
          message: 'Reservation not found'
        };
      }

      console.log(`✅ Room reservation updated: ${confirmationCode} → ${newStatus}`);

      return {
        success: true,
        reservation: result.rows[0]
      };
    } catch (error) {
      console.error('Error updating reservation:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  /**
   * Obtener disponibilidad de habitaciones en rango de fechas
   * ENDPOINT: GET /api/pms/rooms/availability?from=DD/MM/YYYY&to=DD/MM/YYYY
   */
  static async getRoomAvailability(fromDate, toDate) {
    try {
      const result = await Database.query(
        `SELECT 
          r.id,
          r.room_number,
          r.room_type,
          r.price_per_night,
          r.max_guests,
          r.amenities,
          COUNT(rr.id) as bookings_count,
          CASE WHEN COUNT(rr.id) > 0 THEN false ELSE true END as available
         FROM rooms r
         LEFT JOIN room_reservations rr ON r.id = rr.room_id 
           AND rr.check_in < $2 AND rr.check_out > $1
           AND rr.status IN ('pending', 'confirmed')
         GROUP BY r.id
         ORDER BY r.room_number`
      );

      return {
        success: true,
        from_date: fromDate,
        to_date: toDate,
        available_rooms: result.rows.filter(r => r.available).length,
        total_rooms: result.rows.length,
        rooms: result.rows
      };
    } catch (error) {
      console.error('Error getting room availability:', error);
      return {
        success: false,
        message: error.message,
        rooms: []
      };
    }
  }

  /**
   * Obtener perfil completo de un huésped
   * ENDPOINT: GET /api/pms/guests/:phone
   */
  static async getGuestProfile(phoneNumber) {
    try {
      const guestResult = await Database.query(
        `SELECT * FROM guests WHERE phone = $1`,
        [phoneNumber]
      );

      if (guestResult.rows.length === 0) {
        return {
          success: false,
          message: 'Guest not found'
        };
      }

      const guest = guestResult.rows[0];

      // Obtener reservas de habitaciones
      const roomReservations = await Database.query(
        `SELECT rr.*, r.room_number, r.room_type 
         FROM room_reservations rr
         JOIN rooms r ON rr.room_id = r.id
         WHERE rr.guest_id = $1
         ORDER BY rr.created_at DESC`,
        [guest.id]
      );

      // Obtener órdenes de servicios
      const serviceOrders = await Database.query(
        `SELECT co.*, cp.name as service_name 
         FROM catalog_orders co
         JOIN catalog_products cp ON co.product_id = cp.id
         WHERE co.guest_id = $1
         ORDER BY co.created_at DESC`,
        [guest.id]
      );

      // Obtener historial de interacciones
      const interactions = await Database.query(
        `SELECT * FROM interactions 
         WHERE guest_id = $1
         ORDER BY created_at DESC
         LIMIT 20`,
        [guest.id]
      );

      return {
        success: true,
        guest: {
          ...guest,
          room_reservations: roomReservations.rows,
          service_orders: serviceOrders.rows,
          recent_interactions: interactions.rows
        }
      };
    } catch (error) {
      console.error('Error getting guest profile:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  /**
   * Obtener estadísticas generales
   * ENDPOINT: GET /api/pms/stats/overview
   */
  static async getOverallStatistics() {
    try {
      const activeGuestsResult = await Database.query(
        `SELECT COUNT(*) as count FROM guests WHERE onboarding_completed = true`
      );

      const pendingRoomsResult = await Database.query(
        `SELECT COUNT(*) as count FROM room_reservations WHERE status = 'pending'`
      );

      const pendingServicesResult = await Database.query(
        `SELECT COUNT(*) as count FROM catalog_orders WHERE status = 'pending'`
      );

      const totalRevenueResult = await Database.query(
        `SELECT COALESCE(SUM(total_price), 0) as total FROM room_reservations WHERE status = 'confirmed'`
      );

      const occupancyResult = await Database.query(
        `SELECT 
          COUNT(DISTINCT rr.room_id) as occupied_rooms,
          (SELECT COUNT(*) FROM rooms) as total_rooms
         FROM room_reservations rr
         WHERE rr.status IN ('pending', 'confirmed')`
      );

      return {
        success: true,
        statistics: {
          active_guests: parseInt(activeGuestsResult.rows[0].count),
          pending_room_reservations: parseInt(pendingRoomsResult.rows[0].count),
          pending_service_orders: parseInt(pendingServicesResult.rows[0].count),
          total_revenue: parseFloat(totalRevenueResult.rows[0].total),
          occupancy: {
            occupied: parseInt(occupancyResult.rows[0].occupied_rooms),
            total: parseInt(occupancyResult.rows[0].total_rooms),
            percentage: Math.round((parseInt(occupancyResult.rows[0].occupied_rooms) / parseInt(occupancyResult.rows[0].total_rooms)) * 100)
          }
        }
      };
    } catch (error) {
      console.error('Error getting statistics:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  /**
   * Webhook para que el PMS notifique cambios
   * ENDPOINT: POST /api/pms/webhook/notify
   */
  static async handlePMSWebhook(webhookData) {
    try {
      console.log('📡 Received webhook from PMS:', webhookData);

      // Aquí iría la lógica para procesar webhooks del PMS
      // Por ejemplo, actualizar estado de habitaciones, sincronizar disponibilidad, etc.

      return {
        success: true,
        message: 'Webhook received and processed'
      };
    } catch (error) {
      console.error('Error handling PMS webhook:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  /**
   * Generar reporte de auditoría
   * ENDPOINT: GET /api/pms/reports/audit?from=YYYY-MM-DD&to=YYYY-MM-DD
   */
  static async getAuditReport(fromDate, toDate) {
    try {
      const result = await Database.query(
        `SELECT 
          i.id,
          i.guest_id,
          g.name as guest_name,
          g.phone,
          i.incoming_message,
          i.outgoing_message,
          i.message_type,
          i.tokens_used,
          i.created_at
         FROM interactions i
         JOIN guests g ON i.guest_id = g.id
         WHERE i.created_at BETWEEN $1 AND $2
         ORDER BY i.created_at DESC`,
        [fromDate, toDate]
      );

      return {
        success: true,
        from_date: fromDate,
        to_date: toDate,
        total_interactions: result.rows.length,
        interactions: result.rows
      };
    } catch (error) {
      console.error('Error getting audit report:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }
}

module.exports = PMSIntegrationService;