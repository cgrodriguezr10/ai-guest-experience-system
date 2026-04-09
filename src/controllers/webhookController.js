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
    let guest = await GuestService.getGuestByPhone(From);
    if (!guest) {
      guest = await GuestService.createGuest(From);
      console.log(`👤 New guest created: ${guest.id}`);
    }

    // Detectar idioma SOLO si onboarding NO ha empezado
    if (!OnboardingService.getProgress(guest.id) && !guest.onboarding_completed) {
      guest.language = detectMessageLanguage(Body);
    }
    console.log(`🗣️  Language: ${guest.language}`);

    // ⭐ VERIFICAR SI USUARIO QUIERE CAMBIAR IDIOMA (EN CUALQUIER MOMENTO)
    if (MessageClassifierService.isLanguageChangeRequest(Body)) {
      console.log(`🔄 Language change requested by guest ${guest.id}`);
      
      const langChangeResponse = {
        EN: `Which language would you prefer?\n1️⃣ English\n2️⃣ Español`,
        ES: `¿Qué idioma prefieres?\n1️⃣ English\n2️⃣ Español`
      };

      const message = langChangeResponse[guest.language] || langChangeResponse['EN'];
      
      console.log(`💬 Language Change Options: ${message}`);

      // Guardar en BD que está esperando cambio de idioma
      await GuestService.updateGuest(guest.id, {
        waiting_for_language_change: true
      });

      guest.waiting_for_language_change = true;

      await InteractionService.saveInteraction({
        guest_id: guest.id,
        incoming_message: Body,
        outgoing_message: message,
        message_type: 'language_change_request',
        tokens_used: 0
      });

      await WhatsAppService.sendMessage(From, message);

      return res.status(200).json({ 
        success: true,
        type: 'language_change_request'
      });
    }

    // ⭐ SI ESTÁ ESPERANDO RESPUESTA DE CAMBIO DE IDIOMA
    if (guest.waiting_for_language_change === true) {
      const trimmedResponse = Body.trim().toLowerCase();
      const langMap = { '1': 'EN', '2': 'ES' };
      const newLanguage = langMap[trimmedResponse];

      if (newLanguage) {
        guest.language = newLanguage;

        console.log(`✅ Language changed to: ${newLanguage}`);

        // Guardar cambio de idioma en BD
        await GuestService.updateGuest(guest.id, {
          language: newLanguage,
          waiting_for_language_change: false
        });

        let message;
        if (!guest.onboarding_completed) {
          const onboardingResponse = OnboardingService.getStepQuestion(guest);
          message = onboardingResponse.message;
          console.log(`📝 Onboarding question in new language: ${guest.language}`);
        } else {
          const confirmMessages = {
            EN: `Language changed to English! 🇺🇸\n\nHow can I help you?`,
            ES: `¡Idioma cambiado a español! 🇪🇸\n\n¿Cómo puedo ayudarte?`
          };
          message = confirmMessages[newLanguage];
          console.log(`✅ Language changed to: ${newLanguage} (Onboarding complete)`);
        }

        await InteractionService.saveInteraction({
          guest_id: guest.id,
          incoming_message: Body,
          outgoing_message: message,
          message_type: 'language_changed',
          tokens_used: 0
        });

        await WhatsAppService.sendMessage(From, message);

        return res.status(200).json({ 
          success: true,
          type: 'language_changed',
          new_language: newLanguage
        });
      } else {
        const retryMessages = {
          EN: `Please select a valid option:\n1️⃣ English\n2️⃣ Español`,
          ES: `Por favor selecciona una opción válida:\n1️⃣ English\n2️⃣ Español`
        };

        const message = retryMessages[guest.language];

        await WhatsAppService.sendMessage(From, message);

        return res.status(200).json({ 
          success: true,
          type: 'language_change_invalid'
        });
      }
    }

    // ⭐ VERIFICAR SI ONBOARDING ESTÁ COMPLETO
    if (!guest.onboarding_completed) {
      console.log(`⏳ Onboarding in progress for guest ${guest.id}`);
      
      const response = OnboardingService.processOnboardingResponse(guest, Body);

      console.log(`💬 Onboarding Response: ${response.message}`);

      await InteractionService.saveInteraction({
        guest_id: guest.id,
        incoming_message: Body,
        outgoing_message: response.message,
        message_type: 'onboarding',
        tokens_used: response.tokens
      });

      await WhatsAppService.sendMessage(From, response.message);

      // Guardar cambios del guest en BD
      await GuestService.updateGuest(guest.id, {
        name: guest.name,
        language: guest.language,
        room_number: guest.room_number,
        trip_type: guest.trip_type,
        companion: guest.companion,
        dietary_preferences: guest.dietary,
        onboarding_completed: guest.onboarding_completed
      });

      return res.status(200).json({ 
        success: true,
        type: 'onboarding',
        step: response.step
      });
    }

    console.log(`✅ Onboarding complete - Guest name: ${guest.name}, Language: ${guest.language}`);

    // ⭐ FILTRAR MENSAJES IRRELEVANTES
    const classification = MessageClassifierService.classifyMessage(Body);
    console.log(`🔍 Message Classification:`, classification);

    let response;

    if (!classification.isRelevant) {
      console.log(`⚠️  Message not relevant to hotel services`);
      response = {
        message: MessageClassifierService.getOffTopicResponse(guest.language),
        tokens: 0,
        isOffTopic: true
      };
    } else {
      console.log(`✅ Message relevant - Processing with OpenAI`);
      response = await AIService.generateResponse(guest, Body);
      response.isOffTopic = false;
    }

    console.log(`💬 Response: ${response.message}`);

    await InteractionService.saveInteraction({
      guest_id: guest.id,
      incoming_message: Body,
      outgoing_message: response.message,
      message_type: classification.isRelevant ? 'user_question' : 'off_topic',
      tokens_used: response.tokens,
      category: classification.category
    });

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