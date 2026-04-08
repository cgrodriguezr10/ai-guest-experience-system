const AIService = require('../services/aiService');
const GuestService = require('../services/guestService');
const InteractionService = require('../services/interactionService');
const WhatsAppService = require('../services/whatsappService');
const MessageClassifierService = require('../services/messageClassifierService');
const OnboardingService = require('../services/onboardingService');

function detectMessageLanguage(message) {
  const messageLower = message.toLowerCase();
  
  const spanishOnlyWords = ['hola', 'qué', 'cómo', 'dónde', 'cuándo', 'por qué', 'tengo', 'hambre', 'actividades', 'experiencias', 'comida', 'restaurante', 'hotel', 'gracias', 'por favor', 'sí', 'buenos', 'buenas', 'días', 'tardes', 'noches', 'eres', 'estás', 'está', 'están', 'soy', 'somos', 'quisiera', 'me gustaría', 'del', 'de la', 'un', 'una', 'unos', 'unas', 'aquí', 'allá', 'aca', 'alla'];
  
  const englishOnlyWords = ['what', 'where', 'when', 'why', 'how', 'hello', 'hi', 'hey', 'thank', 'please', 'help', 'available', 'activities', 'experience', 'restaurant', 'food', 'hungry', 'want', 'need', 'can', 'is', 'are', 'have', 'would', 'could', 'should', 'the', 'this', 'that', 'these', 'those', 'about', 'tell', 'show', 'give', 'get', 'very', 'good', 'bad', 'nice', 'friend', 'love', 'like', 'dog', 'cat', 'water', 'bread', 'milk', 'thirsty', 'im'];

  const spanishCount = spanishOnlyWords.filter(word => messageLower.includes(word)).length;
  const englishCount = englishOnlyWords.filter(word => messageLower.includes(word)).length;
  
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
      console.log(`👤 New guest created: ${guest.id}`);
    }

    // Detectar idioma
    guest.language = detectMessageLanguage(Body);
    console.log(`🗣️  Language: ${guest.language}`);

    // ⭐ VERIFICAR SI ONBOARDING ESTÁ COMPLETO
    if (!guest.onboarding_completed) {
      console.log(`⏳ Onboarding in progress for guest ${guest.id}`);
      
      // Procesar respuesta del onboarding
      const response = OnboardingService.processOnboardingResponse(guest, Body);

      console.log(`💬 Onboarding Response: ${response.message}`);

      // Guardar interacción
      InteractionService.saveInteraction({
        guest_id: guest.id,
        incoming_message: Body,
        outgoing_message: response.message,
        message_type: 'onboarding',
        tokens_used: response.tokens
      });

      // Enviar respuesta
      await WhatsAppService.sendMessage(From, response.message);

      return res.status(200).json({ 
        success: true,
        type: 'onboarding',
        step: response.step
      });
    }

    console.log(`✅ Onboarding complete - Guest name: ${guest.name}`);

    // ⭐ FILTRAR MENSAJES IRRELEVANTES (solo si onboarding está completo)
    const classification = MessageClassifierService.classifyMessage(Body);
    console.log(`🔍 Message Classification:`, classification);

    let response;

    if (!classification.isRelevant) {
      // Mensaje irrelevante - respuesta genérica
      console.log(`⚠️  Message not relevant to hotel services`);
      response = {
        message: MessageClassifierService.getOffTopicResponse(guest.language),
        tokens: 0,
        isOffTopic: true
      };
    } else {
      // Mensaje relevante - procesar con OpenAI
      console.log(`✅ Message relevant - Processing with OpenAI`);
      response = await AIService.generateResponse(guest, Body);
      response.isOffTopic = false;
    }

    console.log(`💬 Response: ${response.message}`);

    // Guardar interacción
    InteractionService.saveInteraction({
      guest_id: guest.id,
      incoming_message: Body,
      outgoing_message: response.message,
      message_type: classification.isRelevant ? 'user_question' : 'off_topic',
      tokens_used: response.tokens,
      category: classification.category
    });

    // Enviar respuesta
    await WhatsAppService.sendMessage(From, response.message);

    res.status(200).json({ 
      success: true,
      relevant: classification.isRelevant,
      category: classification.category
    });
    
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