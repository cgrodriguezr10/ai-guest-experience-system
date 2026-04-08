const environment = require('../config/environment');
const ExperienceService = require('./experienceService');
const GastronomyService = require('./gastronomyService');

class AIService {
  static async generateResponse(guest, incomingMessage) {
    try {
      // SIEMPRE usar mock mode si la key empieza con sk-proj-xxx
if (environment.OPENAI.API_KEY.includes('sk-proj-xxx')) {
  return this.generateMockResponse(guest, incomingMessage);
}
if (!environment.OPENAI.API_KEY) {
  return this.generateMockResponse(guest, incomingMessage);
}

      const { OpenAI } = require('openai');
      const openai = new OpenAI({
        apiKey: environment.OPENAI.API_KEY
      });

      const systemPrompt = this.buildSystemPrompt(guest);

      const response = await openai.chat.completions.create({
        model: environment.OPENAI.MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: incomingMessage }
        ],
        max_tokens: 500,
        temperature: 0.7
      });

      return {
        message: response.choices[0].message.content,
        tokens: response.usage.total_tokens
      };
    } catch (error) {
      console.error('Error in generateResponse:', error);
      return {
        message: this.generateFallbackResponse(guest),
        tokens: 0
      };
    }
  }

  static buildSystemPrompt(guest) {
    const language = guest.language === 'ES' ? 'Spanish' : 'English';
    const guestName = guest.name || 'Guest';

    return `You are a luxury hotel concierge AI assistant at The Plaza Hotel. 
Your role is to provide personalized, warm, and helpful responses to guests.

Guest Information:
- Name: ${guestName}
- Language: ${language}
- Trip Type: ${guest.trip_type || 'Unknown'}

Respond in ${language}.`;
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