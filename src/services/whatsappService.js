const { sendWhatsAppMessage } = require('../config/whatsapp');

class WhatsAppService {
  /**
   * Enviar mensaje de WhatsApp
   */
  static async sendMessage(phone, message, mediaUrl = null) {
    try {
      // Formato para Twilio: +5731234567 (sin whatsapp:)
      const formattedPhone = phone.replace('whatsapp:', '').replace(/^\+/, '');

      const result = await sendWhatsAppMessage(
        formattedPhone,
        message,
        mediaUrl
      );

      if (result) {
        console.log(`✅ Message sent to ${phone}`);
        return {
          success: true,
          messageId: result.sid
        };
      } else {
        console.log(`⚠️  Message not sent (Twilio not configured)`);
        return {
          success: false,
          messageId: null,
          reason: 'Twilio not configured'
        };
      }
    } catch (error) {
      console.error('Error in sendMessage:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Enviar mensaje de bienvenida
   */
  static async sendWelcomeMessage(phone, guestName, language) {
    const isSpanish = language === 'ES';
    const message = isSpanish
      ? `¡Hola ${guestName}! 👋\n\nBienvenido a The Plaza Hotel. Soy tu asistente de IA y estoy aquí para ayudarte con recomendaciones personalizadas, reservas y cualquier cosa que necesites.\n\n¿Cómo puedo ayudarte hoy?`
      : `Hello ${guestName}! 👋\n\nWelcome to The Plaza Hotel. I'm your AI assistant here to help with personalized recommendations, reservations, and anything you need.\n\nHow can I help you today?`;

    return this.sendMessage(phone, message);
  }

  /**
   * Enviar mensaje de confirmación de perfil
   */
  static async sendProfileConfirmation(phone, guestName, language) {
    const isSpanish = language === 'ES';
    const message = isSpanish
      ? `¡Perfecto, ${guestName}! 📝\n\nHe guardado tu perfil. Ahora puedo ofrecerte sugerencias personalizadas según tus preferencias.\n\n¿Te gustaría conocer nuestras experiencias disponibles?`
      : `Perfect, ${guestName}! 📝\n\nI've saved your profile. Now I can offer personalized suggestions based on your preferences.\n\nWould you like to know about our available experiences?`;

    return this.sendMessage(phone, message);
  }
}

module.exports = WhatsAppService;
