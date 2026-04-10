/**
 * PAYMENT GATEWAY SIMULATOR
 * 
 * Simula integración con pasarelas de pago reales
 * En producción: Stripe, PayPal, Openpay, etc.
 * 
 * ESTRUCTURA LISTA PARA INTEGRAR PASARELA REAL DEL HOTEL
 */

class PaymentGatewaySimulator {
  constructor() {
    this.pendingPayments = {};
    console.log('💳 Payment Gateway Simulator initialized');
  }

  /**
   * Generar enlace de pago (SIMULADO)
   * EN PRODUCCIÓN: Llamar a API de Stripe/PayPal/Openpay
   */
  async generatePaymentLink(paymentData) {
    try {
      const paymentId = `PAY-${Date.now()}`;
      const paymentLink = `https://checkout.example.com/pay/${paymentId}`;

      this.pendingPayments[paymentId] = {
        id: paymentId,
        confirmation_code: paymentData.confirmation_code,
        amount: paymentData.amount,
        currency: paymentData.currency || 'USD',
        type: paymentData.type, // 'room' o 'service'
        guest_name: paymentData.guest_name,
        guest_email: paymentData.guest_email,
        guest_phone: paymentData.guest_phone,
        status: 'pending',
        created_at: new Date(),
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 horas
      };

      console.log(`💳 Payment link generated: ${paymentLink}`);

      return {
        success: true,
        payment_id: paymentId,
        payment_link: paymentLink,
        message: 'Payment link generated successfully'
      };
    } catch (error) {
      console.error('Error generating payment link:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  /**
   * Obtener estado de pago
   */
  async getPaymentStatus(paymentId) {
    try {
      const payment = this.pendingPayments[paymentId];

      if (!payment) {
        return {
          success: false,
          status: 'not_found',
          message: 'Payment not found'
        };
      }

      // Verificar si expiró
      if (new Date() > payment.expires_at) {
        payment.status = 'expired';
      }

      return {
        success: true,
        status: payment.status,
        payment: payment
      };
    } catch (error) {
      console.error('Error getting payment status:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  /**
   * Simular pago completado
   * EN PRODUCCIÓN: Webhook de Stripe/PayPal confirma esto
   */
  async completePayment(paymentId, transactionId) {
    try {
      const payment = this.pendingPayments[paymentId];

      if (!payment) {
        return {
          success: false,
          message: 'Payment not found'
        };
      }

      payment.status = 'completed';
      payment.transaction_id = transactionId;
      payment.completed_at = new Date();

      console.log(`✅ Payment completed: ${paymentId}`);

      return {
        success: true,
        payment: payment,
        message: 'Payment completed successfully'
      };
    } catch (error) {
      console.error('Error completing payment:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  /**
   * Procesar reembolso
   */
  async refundPayment(paymentId, amount) {
    try {
      const payment = this.pendingPayments[paymentId];

      if (!payment) {
        return {
          success: false,
          message: 'Payment not found'
        };
      }

      if (payment.status !== 'completed') {
        return {
          success: false,
          message: 'Only completed payments can be refunded'
        };
      }

      payment.status = 'refunded';
      payment.refunded_amount = amount;
      payment.refunded_at = new Date();

      console.log(`💸 Refund processed: ${paymentId}`);

      return {
        success: true,
        payment: payment,
        message: 'Refund processed successfully'
      };
    } catch (error) {
      console.error('Error refunding payment:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  /**
   * Generar mensaje de pago para WhatsApp
   */
  static getPaymentMessage(paymentData, language = 'ES') {
    if (language === 'ES') {
      return `💳 PAGO REQUERIDO\n\n` +
             `Monto: $${paymentData.amount} ${paymentData.currency || 'USD'}\n` +
             `Concepto: ${paymentData.type === 'room' ? 'Reserva de habitación' : 'Servicio'}\n\n` +
             `🔗 ENLACE DE PAGO:\n${paymentData.payment_link}\n\n` +
             `⏰ Válido por 24 horas\n` +
             `🔐 Código de confirmación: ${paymentData.confirmation_code}\n\n` +
             `Después de completar el pago, tu reserva será confirmada automáticamente.`;
    } else {
      return `💳 PAYMENT REQUIRED\n\n` +
             `Amount: $${paymentData.amount} ${paymentData.currency || 'USD'}\n` +
             `Concept: ${paymentData.type === 'room' ? 'Room Reservation' : 'Service'}\n\n` +
             `🔗 PAYMENT LINK:\n${paymentData.payment_link}\n\n` +
             `⏰ Valid for 24 hours\n` +
             `🔐 Confirmation code: ${paymentData.confirmation_code}\n\n` +
             `After completing the payment, your reservation will be confirmed automatically.`;
    }
  }

  /**
   * Obtener resumen de pagos pendientes
   */
  getPendingPayments() {
    return Object.values(this.pendingPayments).filter(p => p.status === 'pending');
  }

  /**
   * Obtener resumen de pagos completados
   */
  getCompletedPayments() {
    return Object.values(this.pendingPayments).filter(p => p.status === 'completed');
  }
}

module.exports = new PaymentGatewaySimulator();