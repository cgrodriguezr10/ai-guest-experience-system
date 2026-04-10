const AIService = require('../services/aiService');
const GuestService = require('../services/guestService');
const InteractionService = require('../services/interactionService');
const MessageClassifierService = require('../services/messageClassifierService');
const OnboardingService = require('../services/onboardingService');
const GalleryService = require('../services/galleryService');
const ReservationFlowService = require('../services/reservationFlowService');
const HotelRoomsService = require('../services/hotelRoomsService');
const PaymentGatewaySimulator = require('../services/paymentGatewaySimulator');
const ReceptionService = require('../services/receptionService');
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

    // Webhook verification
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

    // Detectar idioma
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

    // ⭐ VERIFICAR SI ESTÁ EN FLUJO DE RESERVA
    const reservationState = ReservationFlowService.getReservationState(guest.id);
    if (reservationState) {
      console.log(`📦 Processing reservation flow for guest ${guest.id}`);
      
      const result = await ReservationFlowService.processReservationResponse(guest.id, body, guest.language);

      if (!result.success) {
        await WhatsAppBusiness.sendMessage(from, result.message);
        return;
      }

      await InteractionService.saveInteraction({
        guest_id: guest.id,
        incoming_message: body,
        outgoing_message: result.message,
        message_type: 'reservation_flow',
        tokens_used: 0
      });

      await WhatsAppBusiness.sendMessage(from, result.message);

      // Si la reserva se confirmó, generar enlace de pago
      if (result.confirmed && result.confirmationCode) {
        console.log(`💳 Generating payment link for reservation ${result.confirmationCode}`);
        
        const paymentResult = await PaymentGatewaySimulator.generatePaymentLink({
          confirmation_code: result.confirmationCode,
          amount: reservationState.product.price * reservationState.quantity,
          currency: 'USD',
          type: 'service',
          guest_name: guest.name,
          guest_email: guest.phone,
          guest_phone: guest.phone
        });

        if (paymentResult.success) {
          const paymentMessage = PaymentGatewaySimulator.getPaymentMessage({
            amount: reservationState.product.price * reservationState.quantity,
            currency: 'USD',
            type: 'service',
            payment_link: paymentResult.payment_link,
            confirmation_code: result.confirmationCode
          }, guest.language);

          await WhatsAppBusiness.sendMessage(from, paymentMessage);
        }

        // ⭐ CREAR ORDEN PARA RECEPCIÓN
        await ReceptionService.createReceptionOrder({
          guest_id: guest.id,
          type: 'service_reservation',
          confirmation_code: result.confirmationCode,
          title: `Reserva de ${reservationState.product.name}`,
          description: `${guest.name} (Hab ${guest.room_number}): ${reservationState.product.name} x${reservationState.quantity}. Código: ${result.confirmationCode}`,
          guest_name: guest.name,
          guest_room: guest.room_number,
          guest_phone: guest.phone,
          priority: 'normal'
        });
      }

      return;
    }

    // ⭐ VERIFICAR SI USUARIO QUIERE VER HABITACIONES
    const roomKeywords = ['habitación', 'room', 'disponibilidad', 'availability', 'dónde alojo', 'where to stay', 'cuartos disponibles', 'available rooms'];
    const wantsRooms = roomKeywords.some(keyword => body.toLowerCase().includes(keyword));

    if (wantsRooms) {
      console.log(`🏨 Room inquiry from guest ${guest.id}`);
      
      const askDatesMessage = guest.language === 'ES'
        ? `🏨 RESERVA DE HABITACIÓN\n\n¿Cuál es tu fecha de check-in?\n(Formato: DD/MM/YYYY, ej: 15/04/2026)`
        : `🏨 ROOM RESERVATION\n\nWhat is your check-in date?\n(Format: DD/MM/YYYY, e.g: 15/04/2026)`;

      ReservationFlowService.reservationStates[guest.id] = {
        step: 'ask_checkin_date',
        type: 'room',
        language: guest.language
      };

      await InteractionService.saveInteraction({
        guest_id: guest.id,
        incoming_message: body,
        outgoing_message: askDatesMessage,
        message_type: 'room_inquiry',
        tokens_used: 0
      });

      await WhatsAppBusiness.sendMessage(from, askDatesMessage);
      return;
    }

    // ⭐ PROCESAR FECHAS PARA HABITACIONES
    const roomState = ReservationFlowService.reservationStates[guest.id];
    if (roomState && roomState.type === 'room' && roomState.step === 'ask_checkin_date') {
      roomState.check_in = body;
      roomState.step = 'ask_checkout_date';

      const askCheckoutMessage = guest.language === 'ES'
        ? `✅ Check-in: ${body}\n\n¿Cuál es tu fecha de check-out?\n(Formato: DD/MM/YYYY)`
        : `✅ Check-in: ${body}\n\nWhat is your check-out date?\n(Format: DD/MM/YYYY)`;

      await WhatsAppBusiness.sendMessage(from, askCheckoutMessage);
      return;
    }

    if (roomState && roomState.type === 'room' && roomState.step === 'ask_checkout_date') {
      roomState.check_out = body;

      const availabilityMessage = await HotelRoomsService.getAvailabilityMessage(
        roomState.check_in,
        roomState.check_out,
        guest.language
      );

      roomState.step = 'select_room';

      await WhatsAppBusiness.sendMessage(from, availabilityMessage);
      return;
    }

    if (roomState && roomState.type === 'room' && roomState.step === 'select_room') {
      const roomNumber = `10${body}`;
      const roomDetails = await HotelRoomsService.getRoomDetails(roomNumber);

      if (!roomDetails) {
        const errorMessage = guest.language === 'ES'
          ? '❌ Habitación no válida'
          : '❌ Invalid room';
        await WhatsAppBusiness.sendMessage(from, errorMessage);
        return;
      }

      const roomDetailsMessage = guest.language === 'ES'
        ? `✅ ${roomDetails.room_type} (${roomNumber})\n\n💰 $${roomDetails.price_per_night}/noche\n📝 ${roomDetails.description}\n\n¿Deseas reservar?\n1️⃣ Sí\n2️⃣ No`
        : `✅ ${roomDetails.room_type} (${roomNumber})\n\n💰 $${roomDetails.price_per_night}/night\n📝 ${roomDetails.description}\n\nDo you want to book?\n1️⃣ Yes\n2️⃣ No`;

      roomState.step = 'confirm_room';
      roomState.selected_room = roomNumber;

      await WhatsAppBusiness.sendMessage(from, roomDetailsMessage);
      return;
    }

    if (roomState && roomState.type === 'room' && roomState.step === 'confirm_room') {
      const response = body.trim().toLowerCase();

      if (response === '1' || response === 'yes' || response === 'sí') {
        const confirmationCode = HotelRoomsService.generateConfirmationCode();
        
        await HotelRoomsService.saveRoomReservation({
          guest_id: guest.id,
          room_id: parseInt(roomState.selected_room) - 100,
          check_in: roomState.check_in,
          check_out: roomState.check_out,
          number_of_nights: 3,
          total_price: 360,
          confirmation_code: confirmationCode,
          notes: null
        });

        const paymentResult = await PaymentGatewaySimulator.generatePaymentLink({
          confirmation_code: confirmationCode,
          amount: 360,
          currency: 'USD',
          type: 'room',
          guest_name: guest.name,
          guest_email: guest.phone,
          guest_phone: guest.phone
        });

        const confirmationMessage = guest.language === 'ES'
          ? `✅ RESERVA DE HABITACIÓN CONFIRMADA\n\n🏨 Habitación: ${roomState.selected_room}\n📅 Check-in: ${roomState.check_in}\n📅 Check-out: ${roomState.check_out}\n💵 Total: $360 USD\n🔐 Código: ${confirmationCode}`
          : `✅ ROOM RESERVATION CONFIRMED\n\n🏨 Room: ${roomState.selected_room}\n📅 Check-in: ${roomState.check_in}\n📅 Check-out: ${roomState.check_out}\n💵 Total: $360 USD\n🔐 Code: ${confirmationCode}`;

        await WhatsAppBusiness.sendMessage(from, confirmationMessage);

        if (paymentResult.success) {
          const paymentMessage = PaymentGatewaySimulator.getPaymentMessage({
            amount: 360,
            currency: 'USD',
            type: 'room',
            payment_link: paymentResult.payment_link,
            confirmation_code: confirmationCode
          }, guest.language);

          await WhatsAppBusiness.sendMessage(from, paymentMessage);
        }

        // ⭐ CREAR ORDEN PARA RECEPCIÓN
        await ReceptionService.createReceptionOrder({
          guest_id: guest.id,
          type: 'room_reservation',
          confirmation_code: confirmationCode,
          title: `Nueva reserva de habitación`,
          description: `${guest.name}: Habitación ${roomState.selected_room}, Check-in: ${roomState.check_in}, Check-out: ${roomState.check_out}. Total: $360. Código: ${confirmationCode}`,
          guest_name: guest.name,
          guest_room: roomState.selected_room,
          guest_phone: guest.phone,
          priority: 'normal'
        });

        delete ReservationFlowService.reservationStates[guest.id];
      } else {
        delete ReservationFlowService.reservationStates[guest.id];
        const cancelMessage = guest.language === 'ES'
          ? '❌ Reserva cancelada'
          : '❌ Reservation cancelled';
        await WhatsAppBusiness.sendMessage(from, cancelMessage);
      }
      return;
    }

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