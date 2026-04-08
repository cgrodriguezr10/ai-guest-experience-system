const AIService = require('../services/aiService');
const GuestService = require('../services/guestService');
const InteractionService = require('../services/interactionService');
const WhatsAppService = require('../services/whatsappService');

function detectMessageLanguage(message) {
  const messageLower = message.toLowerCase();
  
  // Palabras ÚNICAS del ESPAÑOL
  const spanishOnlyWords = ['qué', 'cómo', 'dónde', 'cuándo', 'por qué', 'tengo', 'hambre', 'actividades', 'experiencias', 'comida', 'restaurante', 'hotel', 'gracias', 'por favor', 'sí', 'buenos', 'buenas', 'días', 'tardes', 'noches', 'eres', 'estás', 'está', 'están', 'soy', 'somos', 'quisiera', 'me gustaría', 'del', 'de la', 'un', 'una', 'unos', 'unas', 'aquí', 'allá', 'aca', 'alla'];
  
  // Palabras ÚNICAS del INGLÉS
  const englishOnlyWords = ['what', 'where', 'when', 'why', 'how', 'hello', 'hi', 'hey', 'thank', 'please', 'help', 'available', 'activities', 'experience', 'restaurant', 'food', 'hungry', 'want', 'need', 'can', 'is', 'are', 'have', 'would', 'could', 'should', 'the', 'this', 'that', 'these', 'those', 'about', 'tell', 'show', 'give', 'get', 'very', 'good', 'bad', 'nice', 'friend', 'love', 'like', 'dog', 'cat', 'water', 'bread', 'milk', 'thirsty', 'im'];

  const spanishCount = spanishOnlyWords.filter(word => messageLower.includes(word)).length;
  const englishCount = englishOnlyWords.filter(word => messageLower.includes(word)).length;
  
  console.log(`🔍 Language detection - Spanish words: ${spanishCount}, English words: ${englishCount}`);
  
  if (spanishCount > englishCount) {
    return 'ES';
  }
  
  if (englishCount > spanishCount) {
    return 'EN';
  }
  
  return 'EN';
}

exports.receiveMessage = async (req, res) => {
  try {
    const { From, Body } = req.body;

    console.log('📨 Received webhook:', { From, Body });

    // Get or create guest
    let guest = GuestService.getGuestByPhone(From);
    if (!guest) {
      guest = GuestService.createGuest(From);
    }

    // SIEMPRE detectar idioma del mensaje actual
    guest.language = detectMessageLanguage(Body);

    console.log(`👤 Guest (Mock): ${guest.id}`);
    console.log(`🗣️  Language: ${guest.language}`);

    // Generate response usando OpenAI REAL
    const response = await AIService.generateResponse(guest, Body);

    console.log(`💬 Response: ${response.message}`);

    // Save interaction
    InteractionService.saveInteraction({
      guest_id: guest.id,
      incoming_message: Body,
      outgoing_message: response.message,
      message_type: 'user_question',
      tokens_used: response.tokens
    });

    // Send response via WhatsApp
    await WhatsAppService.sendMessage(From, response.message);

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error in receiveMessage:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getWebhookStatus = (req, res) => {
  res.json({
    status: 'active',
    webhook_url: '/webhook',
    timestamp: new Date().toISOString()
  });
};