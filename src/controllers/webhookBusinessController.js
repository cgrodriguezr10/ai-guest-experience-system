const AIService = require('../services/aiService');
const GuestService = require('../services/guestService');
const InteractionService = require('../services/interactionService');
const MessageClassifierService = require('../services/messageClassifierService');
const OnboardingService = require('../services/onboardingService');
const GalleryService = require('../services/galleryService');
const WhatsAppBusiness = require('../config/whatsappBusiness');

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

exports.handleWebhook = async (req, res) => {
  try {
    const body = req.body;

    // Webhook verification (primera vez que Meta conecta)
    if (req.method === 'GET') {
      const mode = req.query['hub.mode'];
      const token = req.query['hub.verify_token'];
      const challenge = req.query['hub.challenge'];

      if (mode === 'subscribe' && WhatsAppBusiness.verifyWebhook(token)) {
        console.log('✅ Webhook verified');
        return res.status(200).send(challenge);
      } else {
        console.log('❌ Token de verificación inválido');
        return res.sendStatus(403);
      }
    }

    // Procesar mensaje entrante
    if (body.object === 'whatsapp_business_account') {
      const entry = body.entry[0];
      
      if (entry.changes[0].value.messages) {
        const messageData = WhatsAppBusiness.parseWebhookMessage(body);
        
        if (messageData) {
          await processMessage(messageData);
        }
      }

      // Marcar como recibido
      return res.status(200).json({ status: 'ok' });
    }

    res.sendStatus(404);
  } catch (error) {
    console.error('Error in webhook:', error);
    res.status(500).json({ error: error.message });
  }
};

async function processMessage(messageData) {
  try {
    const { from, body, senderName } = messageData;

    console.log('📨 New message from:', from);
    console.log('📝 Body:', body);

    // Obtener o crear guest
    let guest = await GuestService.getGuestByPhone(from);
    if (!guest) {
      guest = await GuestService.createGuest(from);
      console.log(`👤 New guest created: ${guest.id}`);
    }

    // Detectar idioma solo si onboarding NO ha empezado
    if (!OnboardingService.getProgress(guest.id) && !guest.onboarding_completed) {
      guest.language = detectMessageLanguage(body);
      await GuestService.updateGuest(guest.id, { language: guest.language });
    }
    console.log(`🗣️  Language: ${guest.language}`);

    // ⭐ VERIFICAR SI USUARIO QUIERE CAMBIAR IDIOMA
    if (MessageClassifierService.isLanguageChangeRequest(body)) {
      console.log(`🔄 Language change requested by guest ${guest.id}`);
      
      const langChangeResponse = {
        EN: `Which language would you prefer?\n1️⃣ English\n2️⃣ Español`,
        ES: `¿Qué idioma prefieres?\n1️⃣ English\n2️⃣ Español`
      };

      const message = langChangeResponse[guest.language] || langChangeResponse['EN'];
      
      await GuestService.updateGuest(guest.id, {
        waiting_for_language_change: true
      });

      guest.waiting_for_language_change = true;

      await InteractionService.saveInteraction({
        guest_id: guest.id,
        incoming_message: body,
        outgoing_message: message,
        message_type: 'language_change_request',
        tokens_used: 0
      });

      await WhatsAppBusiness.sendMessage(from, message);
      return;
    }

    // ⭐ SI ESTÁ ESPERANDO RESPUESTA DE CAMBIO DE IDIOMA
    if (guest.waiting_for_language_change === true) {
      const trimmedResponse = body.trim().toLowerCase();
      const langMap = { '1': 'EN', '2': 'ES' };
      const newLanguage = langMap[trimmedResponse];

      if (newLanguage) {
        guest.language = newLanguage;

        console.log(`✅ Language changed to: ${newLanguage}`);

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
        }

        await InteractionService.saveInteraction({
          guest_id: guest.id,
          incoming_message: body,
          outgoing_message: message,
          message_type: 'language_changed',
          tokens_used: 0
        });

        await WhatsAppBusiness.sendMessage(from, message);
        return;
      } else {
        const retryMessages = {
          EN: `Please select a valid option:\n1️⃣ English\n2️⃣ Español`,
          ES: `Por favor selecciona una opción válida:\n1️⃣ English\n2️⃣ Español`
        };

        const message = retryMessages[guest.language];
        await WhatsAppBusiness.sendMessage(from, message);
        return;
      }
    }

    // ⭐ VERIFICAR SI ONBOARDING ESTÁ COMPLETO
    if (!guest.onboarding_completed) {
      console.log(`⏳ Onboarding in progress for guest ${guest.id}`);
      
      const response = OnboardingService.processOnboardingResponse(guest, body);

      console.log(`💬 Onboarding Response: ${response.message}`);

      await InteractionService.saveInteraction({
        guest_id: guest.id,
        incoming_message: body,
        outgoing_message: response.message,
        message_type: 'onboarding',
        tokens_used: response.tokens
      });

      await WhatsAppBusiness.sendMessage(from, response.message);

      await GuestService.updateGuest(guest.id, {
        name: guest.name,
        language: guest.language,
        room_number: guest.room_number,
        trip_type: guest.trip_type,
        companion: guest.companion,
        dietary_preferences: guest.dietary,
        onboarding_completed: guest.onboarding_completed
      });

      return;
    }

    console.log(`✅ Onboarding complete - Guest name: ${guest.name}, Language: ${guest.language}`);

    // ⭐ VERIFICAR SI USUARIO QUIERE VER CATÁLOGO/GALERÍA
    const catalogKeywords = ['catálogo', 'catalog', 'menu', 'menú', 'servicios', 'services', 'qué ofreces', 'what do you offer', 'galería', 'gallery', 'restaurante', 'restaurant', 'spa', 'gym', 'actividades', 'activities'];
    const wantsCatalog = catalogKeywords.some(keyword => body.toLowerCase().includes(keyword));

    if (wantsCatalog) {
      console.log(`📚 Gallery request from guest ${guest.id}`);
      
      const galleryMessage = await GalleryService.getCategoriesGallery(guest.language);

      await InteractionService.saveInteraction({
        guest_id: guest.id,
        incoming_message: body,
        outgoing_message: galleryMessage,
        message_type: 'gallery_request',
        tokens_used: 0
      });

      await WhatsAppBusiness.sendMessage(from, galleryMessage);
      return;
    }

    // ⭐ FILTRAR MENSAJES IRRELEVANTES
    const classification = MessageClassifierService.classifyMessage(body);
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
      response = await AIService.generateResponse(guest, body);
      response.isOffTopic = false;
    }

    console.log(`💬 Response: ${response.message}`);

    await InteractionService.saveInteraction({
      guest_id: guest.id,
      incoming_message: body,
      outgoing_message: response.message,
      message_type: classification.isRelevant ? 'user_question' : 'off_topic',
      tokens_used: response.tokens,
      category: classification.category
    });

    await WhatsAppBusiness.sendMessage(from, response.message);

  } catch (error) {
    console.error('Error processing message:', error);
  }
}

exports.getWebhookStatus = (req, res) => {
  res.json({
    status: 'active',
    webhook_url: '/webhook',
    platform: 'WhatsApp Business Cloud API',
    timestamp: new Date().toISOString()
  });
};