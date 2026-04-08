const environment = require('../config/environment');
const ExperienceService = require('./experienceService');
const GastronomyService = require('./gastronomyService');

class AIService {
  static async generateResponse(guest, incomingMessage) {
    try {
      // SIEMPRE usar mock mode - nunca intentar OpenAI
      return this.generateMockResponse(guest, incomingMessage);
    } catch (error) {
      console.error('Error in generateResponse:', error);
      return {
        message: this.generateFallbackResponse(guest),
        tokens: 0
      };
    }
  }

  static generateMockResponse(guest, message) {
    const guestName = guest.name || 'Guest';
    const isSpanish = guest.language === 'ES';
    const messageLower = message.toLowerCase();

    const experienceKeywords = ['experience', 'activity', 'activities', 'things', 'do', 'go', 'visit', 'tour', 'experiencia', 'actividad', 'hacer', 'visitar'];
    const hasExperienceKeywords = experienceKeywords.some(kw => messageLower.includes(kw));

    const foodKeywords = ['food', 'restaurant', 'eat', 'dinner', 'lunch', 'breakfast', 'dish', 'menu', 'comida', 'restaurante', 'comer', 'almuerzo', 'desayuno', 'plato', 'cena', 'menú', 'hambre'];
    const hasFoodKeywords = foodKeywords.some(kw => messageLower.includes(kw));

    if (hasExperienceKeywords) {
      return {
        message: ExperienceService.formatExperiencesForWhatsApp(guest.language),
        tokens: 100
      };
    }

    if (hasFoodKeywords) {
      return {
        message: GastronomyService.formatDishesForWhatsApp(guest.language),
        tokens: 100
      };
    }

    const mockResponses = {
      EN: [
        `Hello ${guestName}! 👋 Thank you for reaching out. How can I help you today?`,
        `Hi ${guestName}! We're delighted to have you at The Plaza Hotel.`,
        `Good day, ${guestName}! 🏨 Is there anything special you'd like to experience?`
      ],
      ES: [
        `¡Hola ${guestName}! 👋 Gracias por comunicarte. ¿Cómo puedo ayudarte?`,
        `¡Hola ${guestName}! Nos da mucho placer tenerte en The Plaza Hotel.`,
        `¡Buen día, ${guestName}! 🏨 ¿Hay algo especial que te gustaría?`
      ]
    };

    const responses = isSpanish ? mockResponses.ES : mockResponses.EN;
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];

    return {
      message: randomResponse,
      tokens: 50
    };
  }

  static generateFallbackResponse(guest) {
    const isSpanish = guest.language === 'ES';
    return isSpanish
      ? `Lo sentimos, tuvimos un problema procesando tu mensaje.`
      : `Sorry, we had an issue processing your message.`;
  }
}

module.exports = AIService;