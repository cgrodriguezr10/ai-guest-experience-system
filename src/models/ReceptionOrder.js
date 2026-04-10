class ReceptionOrder {
  constructor() {
    this.orders = {};
    this.orderCounter = 0;
  }

  /**
   * Crear orden para recepción
   */
  createOrder(orderData) {
    this.orderCounter++;
    const order = {
      id: this.orderCounter,
      guest_id: orderData.guest_id,
      type: orderData.type, // 'room_reservation', 'service_reservation', 'urgent_request'
      confirmation_code: orderData.confirmation_code,
      title: orderData.title,
      description: orderData.description,
      guest_name: orderData.guest_name,
      guest_room: orderData.guest_room,
      guest_phone: orderData.guest_phone,
      priority: orderData.priority || 'normal', // 'urgent', 'normal', 'low'
      status: 'pending', // pending, in_progress, completed, cancelled
      assigned_to: null,
      created_at: new Date(),
      started_at: null,
      completed_at: null,
      notes: []
    };
    this.orders[order.id] = order;
    return order;
  }

  /**
   * Obtener orden por ID
   */
  getOrderById(orderId) {
    return this.orders[orderId] || null;
  }

  /**
   * Obtener todas las órdenes pendientes
   */
  getPendingOrders() {
    return Object.values(this.orders)
      .filter(o => o.status === 'pending')
      .sort((a, b) => {
        // Ordenar por prioridad
        const priorityOrder = { urgent: 0, normal: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });
  }

  /**
   * Obtener todas las órdenes
   */
  getAllOrders() {
    return Object.values(this.orders);
  }

  /**
   * Cambiar estado de orden
   */
  updateOrderStatus(orderId, newStatus) {
    if (this.orders[orderId]) {
      const order = this.orders[orderId];
      order.status = newStatus;

      if (newStatus === 'in_progress') {
        order.started_at = new Date();
      } else if (newStatus === 'completed') {
        order.completed_at = new Date();
      }

      return order;
    }
    return null;
  }

  /**
   * Asignar orden a staff
   */
  assignOrder(orderId, staffName) {
    if (this.orders[orderId]) {
      this.orders[orderId].assigned_to = staffName;
      return this.orders[orderId];
    }
    return null;
  }

  /**
   * Agregar nota a orden
   */
  addNote(orderId, note) {
    if (this.orders[orderId]) {
      this.orders[orderId].notes.push({
        text: note,
        added_at: new Date(),
        added_by: 'system'
      });
      return this.orders[orderId];
    }
    return null;
  }

  /**
   * Cancelar orden
   */
  cancelOrder(orderId) {
    if (this.orders[orderId]) {
      this.orders[orderId].status = 'cancelled';
      return this.orders[orderId];
    }
    return null;
  }
}

module.exports = ReceptionOrder;