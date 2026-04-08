const environment = require('../config/environment');
const ExperienceService = require('./experienceService');
const GastronomyService = require('./gastronomyService');
const { OpenAI } = require('openai');

class AIService {
  static async generateResponse(guest, incomingMessage) {
    try {
      const openai = new OpenAI({
        apiKey: environment.OPENAI.API_KEY
      });

      const systemPrompt = `You are a luxury hotel concierge AI assistant at The Plaza Hotel in Bogotá, Colombia.
Your role is to provide personalized, warm, and helpful responses to guests.

Guest Information:
- Name: ${guest.name || 'Guest'}
- Language: ${guest.language === 'ES' ? 'Spanish' : 'English'}
- Trip Type: ${guest.trip_type || 'Unknown'}

IMPORTANT INSTRUCTIONS:
1. Always respond in the guest's language (Spanish or English)
2. Be warm, professional, and helpful
3. Keep responses concise (under 150 words)
4. Suggest hotel services, restaurants, and local Bogotá experiences
5. If guest asks about activities, food, or dining, provide specific recommendations

Available Experiences in Bogotá:
- Gold Museum - $18
- Monserrate - $25
- La Candelaria Walking Tour - $30
- Bogotá Botanic Garden - $12
- Coffee Plantation Tour - $65
- National Museum - $15
- Street Food Tour - $45
- Usaquén Market - Free
- Rafting Adventure - $80
- Colombian Cooking Class - $75
- Zipline Adventure - $70

Available Dishes:
- Ajiaco Santafereño - $12
- Bandeja Paisa - $18
- Ceviche - $16
- Empanadas - $5
- Sancocho - $14
- Arepa - $4
- Grilled Fish with Coconut Rice - $22
- Flan - $8
- Patacones - $6
- Hot Chocolate with Cheese - $7

Respond naturally and helpfully.`;

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: incomingMessage }
        ],
        max_tokens: 300,
        temperature: 0.7
      });

      const message = response.choices[0].message.content;
      const tokens = response.usage.total_tokens;

      console.log(`✅ OpenAI Response generated (${tokens} tokens)`);

      return {
        message: message,
        tokens: tokens
      };

    } catch (error) {
      console.error('Error calling OpenAI:', error.message);
      return {
        message: this.generateFallbackResponse(guest),
        tokens: 0
      };
    }
  }

  static generateFallbackResponse(guest) {
    const isSpanish = guest.language === 'ES';
    return isSpanish
      ? `Lo sentimos, tuvimos un problema. Por favor intenta de nuevo.`
      : `Sorry, we had an issue. Please try again.`;
  }
}

module.exports = AIService;