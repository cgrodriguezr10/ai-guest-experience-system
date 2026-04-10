const Database = require('../config/database');
const ReceptionOrder = require('../models/ReceptionOrder');

class ReceptionService {
  constructor() {
    this.receptionOrder = new ReceptionOrder();
  }

  /**
   * Crear orden en BD para recepción
   */
  static async createReceptionOrder(orderData) {
    try {
      const result = await Database.query(
        `INSERT INTO reception_orders 
         (guest_id, order_type, confirmation_code, title, description, guest_name, guest_room, guest_phone, priority, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING *`,
        [
          orderData.guest_id,
          orderData.type,
          orderData.confirmation_code,
          orderData.title,
          orderData.description,
          orderData.guest_name,
          orderData.guest_room,
          orderData.guest_phone,
          orderData.priority || 'normal',
          'pending'
        ]
      );

      console.log(`📞 Reception order created: ${orderData.confirmation_code}`);
      
      return {
        success: true,
        data: result.rows[0]
      };
    } catch (error) {
      console.error('Error creating reception order:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  /**
   * Obtener órdenes pendientes
   */
  static async getPendingOrders() {
    try {
      const result = await Database.query(
        `SELECT * FROM reception_orders 
         WHERE status = 'pending'
         ORDER BY CASE priority WHEN 'urgent' THEN 0 WHEN 'normal' THEN 1 WHEN 'low' THEN 2 END,
                  created_at ASC`
      );

      return result.rows;
    } catch (error) {
      console.error('Error getting pending orders:', error);
      return [];
    }
  }

  /**
   * Obtener todas las órdenes
   */
  static async getAllOrders() {
    try {
      const result = await Database.query(
        `SELECT * FROM reception_orders 
         ORDER BY created_at DESC`
      );

      return result.rows;
    } catch (error) {
      console.error('Error getting all orders:', error);
      return [];
    }
  }

  /**
   * Actualizar estado de orden
   */
  static async updateOrderStatus(orderId, newStatus) {
    try {
      const result = await Database.query(
        `UPDATE reception_orders 
         SET status = $1, 
             started_at = CASE WHEN $1 = 'in_progress' THEN NOW() ELSE started_at END,
             completed_at = CASE WHEN $1 = 'completed' THEN NOW() ELSE completed_at END
         WHERE id = $2
         RETURNING *`,
        [newStatus, orderId]
      );

      if (result.rows.length === 0) {
        return { success: false, message: 'Order not found' };
      }

      console.log(`✅ Order ${orderId} status updated to: ${newStatus}`);
      
      return {
        success: true,
        data: result.rows[0]
      };
    } catch (error) {
      console.error('Error updating order status:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  /**
   * Asignar orden a staff
   */
  static async assignOrder(orderId, staffName) {
    try {
      const result = await Database.query(
        `UPDATE reception_orders 
         SET assigned_to = $1
         WHERE id = $2
         RETURNING *`,
        [staffName, orderId]
      );

      if (result.rows.length === 0) {
        return { success: false, message: 'Order not found' };
      }

      return {
        success: true,
        data: result.rows[0]
      };
    } catch (error) {
      console.error('Error assigning order:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  /**
   * Generar notificación para recepción
   */
  static generateReceptionNotification(order, language = 'ES') {
    if (language === 'ES') {
      return `📞 NUEVA ORDEN DE RECEPCIÓN\n\n` +
             `🆔 ID: ${order.id}\n` +
             `🔐 Código: ${order.confirmation_code}\n` +
             `👤 Huésped: ${order.guest_name}\n` +
             `🏠 Habitación: ${order.guest_room}\n` +
             `📱 Teléfono: ${order.guest_phone}\n\n` +
             `📋 ${order.title}\n` +
             `📝 ${order.description}\n\n` +
             `⚠️ Prioridad: ${order.priority.toUpperCase()}\n` +
             `⏰ Creada: ${new Date(order.created_at).toLocaleString()}`;
    } else {
      return `📞 NEW RECEPTION ORDER\n\n` +
             `🆔 ID: ${order.id}\n` +
             `🔐 Code: ${order.confirmation_code}\n` +
             `👤 Guest: ${order.guest_name}\n` +
             `🏠 Room: ${order.guest_room}\n` +
             `📱 Phone: ${order.guest_phone}\n\n` +
             `📋 ${order.title}\n` +
             `📝 ${order.description}\n\n` +
             `⚠️ Priority: ${order.priority.toUpperCase()}\n` +
             `⏰ Created: ${new Date(order.created_at).toLocaleString()}`;
    }
  }

  /**
   * Obtener estadísticas de órdenes
   */
  static async getOrderStatistics() {
    try {
      const pendingResult = await Database.query(
        `SELECT COUNT(*) as count FROM reception_orders WHERE status = 'pending'`
      );

      const inProgressResult = await Database.query(
        `SELECT COUNT(*) as count FROM reception_orders WHERE status = 'in_progress'`
      );

      const completedResult = await Database.query(
        `SELECT COUNT(*) as count FROM reception_orders WHERE status = 'completed'`
      );

      const urgentResult = await Database.query(
        `SELECT COUNT(*) as count FROM reception_orders WHERE priority = 'urgent' AND status = 'pending'`
      );

      return {
        pending: parseInt(pendingResult.rows[0].count),
        in_progress: parseInt(inProgressResult.rows[0].count),
        completed: parseInt(completedResult.rows[0].count),
        urgent_pending: parseInt(urgentResult.rows[0].count)
      };
    } catch (error) {
      console.error('Error getting statistics:', error);
      return { pending: 0, in_progress: 0, completed: 0, urgent_pending: 0 };
    }
  }
}

module.exports = ReceptionService;