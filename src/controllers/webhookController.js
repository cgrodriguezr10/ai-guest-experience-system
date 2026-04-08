const AIService = require('../services/aiService');
const GuestService = require('../services/guestService');
const InteractionService = require('../services/interactionService');
const WhatsAppService = require('../services/whatsappService');

exports.receiveMessage = async (req, res) => {
  try {
    const { From, Body } = req.body;

    console.log('📨 Received webhook:', { From, Body });

    // Get or create guest
    let guest = GuestService.getGuestByPhone(From);
    if (!guest) {
      guest = GuestService.createGuest(From);
    }

    console.log(`👤 Guest (Mock): ${guest.id}`);
    console.log(`🗣️  Language: ${guest.language}`);

    // Generate response using MOCK mode ONLY
    const response = AIService.generateMockResponse(guest, Body);

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