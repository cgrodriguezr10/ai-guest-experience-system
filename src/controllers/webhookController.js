const GuestService = require('../services/guestService');
const InteractionService = require('../services/interactionService');
const AIService = require('../services/aiService');
const WhatsAppService = require('../services/whatsappService');
const environment = require('../config/environment');

class WebhookController {
  static async receiveMessage(req, res) {
    try {
      const body = req.body;
      console.log('📨 Received webhook:', JSON.stringify(body, null, 2));

      const incomingMessage = body.Body || '';
      const senderPhone = body.From || '';

      if (!senderPhone || !incomingMessage) {
        console.log('⚠️  Missing required fields');
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const hotelId = environment.HOTEL.DEFAULT_ID;

      // Detectar idioma del mensaje (caracteres españoles)
      const messageLower = incomingMessage.toLowerCase();
      const hasSpanishChars = /[áéíóúñ¿¡]/.test(incomingMessage);
      const detectedLanguage = hasSpanishChars ? 'ES' : 'EN';

      // Mock guest para desarrollo
      const mockGuest = {
        id: 1,
        hotel_id: hotelId,
        whatsapp_number: senderPhone,
        name: null,
        language: detectedLanguage,
        trip_type: null,
        onboarding_completed: false,
        profile_completed: false
      };

      console.log(`👤 Guest (Mock): ${mockGuest.name || 'New'} (ID: ${mockGuest.id})`);
      console.log(`🗣️  Language: ${mockGuest.language}`);

      let messageType = 'user_question';
      let outgoingMessage = '';

      // Detectar si pregunta por experiencias o comida (palabras clave)
      const keywordsExperiences = ['experience', 'activities', 'activity', 'things', 'do', 'go', 'visit', 'tour', 'experiencia', 'actividad', 'hacer', 'visitar', 'tour'];
      const keywordsFood = ['food', 'restaurant', 'eat', 'dinner', 'lunch', 'breakfast', 'dish', 'comida', 'restaurante', 'comer', 'almuerzo', 'desayuno', 'plato', 'cena'];

      const asksForExperiences = keywordsExperiences.some(keyword => messageLower.includes(keyword));
      const asksForFood = keywordsFood.some(keyword => messageLower.includes(keyword));

      // Si pregunta por experiencias o comida, usa IA directamente
      if (asksForExperiences || asksForFood) {
        messageType = 'user_question';
        const aiResponse = await AIService.generateResponse(mockGuest, incomingMessage);
        outgoingMessage = aiResponse.message;
      } else if (!mockGuest.profile_completed && !mockGuest.onboarding_completed) {
        // Flujo de onboarding
        messageType = 'onboarding_language';
        
        if (detectedLanguage === 'ES') {
          outgoingMessage = `¡Perfecto! Continuaremos en Español. ¿Cuál es tu nombre?`;
          mockGuest.language = 'ES';
        } else {
          outgoingMessage = `Perfect! Let's continue in English. What's your name?`;
          mockGuest.language = 'EN';
        }
      } else {
        // Usar IA para responder
        messageType = 'user_question';
        const aiResponse = await AIService.generateResponse(mockGuest, incomingMessage);
        outgoingMessage = aiResponse.message;
      }

      console.log(`📝 Message Type: ${messageType}`);
      console.log(`💬 Response: ${outgoingMessage}`);

      // Guardar interacción (mock)
      await InteractionService.createInteraction({
        guest_id: mockGuest.id,
        message_type: messageType,
        incoming_message: incomingMessage,
        outgoing_message: outgoingMessage,
        sentiment: 'neutral'
      });

      // Enviar por WhatsApp
      await WhatsAppService.sendMessage(senderPhone, outgoingMessage);

      res.status(200).json({
        success: true,
        message: 'Message processed',
        guestId: mockGuest.id,
        messageType: messageType
      });

    } catch (error) {
      console.error('❌ Error in receiveMessage:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error.message
      });
    }
  }

  static async webhookStatus(req, res) {
    res.status(200).json({
      status: 'webhook_ready',
      timestamp: new Date().toISOString(),
      hotelId: environment.HOTEL.DEFAULT_ID,
      hotelName: environment.HOTEL.DEFAULT_NAME
    });
  }
}

module.exports = WebhookController;