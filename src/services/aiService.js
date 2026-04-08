const environment = require('../config/environment');
const ExperienceService = require('./experienceService');
const GastronomyService = require('./gastronomyService');

class AIService {
  static async generateResponse(guest, incomingMessage) {
    try {
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

    const experienceKeywords = ['experience', 'activity', 'activities', 'things', 'do', 'go', 'visit', 'tour', 'experiencia', 'actividad', 'actividades', 'hacer', 'visitar', 'qué'];
    const hasExperienceKeywords = experienceKeywords.some(kw => messageLower.includes(kw));

    const foodKeywords = ['food', 'restaurant', 'eat', 'dinner', 'lunch', 'breakfast', 'dish', 'menu', 'comida', 'restaurante', 'comer', 'almuerzo', 'desayuno', 'plato', 'cena', 'menú', 'hambre', 'hungry'];
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

    // Respuestas generales según idioma
    if (isSpanish) {
      const spanishResponses = [
        `¡Hola ${guestName}! 👋 Gracias por comunicarte. ¿Cómo puedo ayudarte hoy?`,
        `¡Hola ${guestName}! Nos da mucho placer tenerte en The Plaza Hotel.`,
        `¡Buen día, ${guestName}! 🏨 ¿Hay algo especial que te gustaría experimentar?`
      ];
      const randomResponse = spanishResponses[Math.floor(Math.random() * spanishResponses.length)];
      return {
        message: randomResponse,
        tokens: 50
      };
    } else {
      const englishResponses = [
        `Hello ${guestName}! 👋 Thank you for reaching out. How can I help you today?`,
        `Hi ${guestName}! We're delighted to have you at The Plaza Hotel.`,
        `Good day, ${guestName}! 🏨 Is there anything special you'd like to experience?`
      ];
      const randomResponse = englishResponses[Math.floor(Math.random() * englishResponses.length)];
      return {
        message: randomResponse,
        tokens: 50
      };
    }
  }

  static generateFallbackResponse(guest) {
    const isSpanish = guest.language === 'ES';
    return isSpanish
      ? `Lo sentimos, tuvimos un problema procesando tu mensaje.`
      : `Sorry, we had an issue processing your message.`;
  }
}

module.exports = AIService;