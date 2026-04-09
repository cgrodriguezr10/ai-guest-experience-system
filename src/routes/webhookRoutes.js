const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhookController');
const OnboardingService = require('../services/onboardingService');
const GuestService = require('../services/guestService');

// POST webhook para recibir mensajes
router.post('/', webhookController.receiveMessage);

// GET para verificar status del webhook
router.get('/status', webhookController.getWebhookStatus);

// GET para resetear un guest (solo desarrollo)
router.get('/reset/:guestId', (req, res) => {
  const guestId = parseInt(req.params.guestId);
  const guest = GuestService.getGuestById(guestId);

  if (!guest) {
    return res.status(404).json({ error: 'Guest not found' });
  }

  // Resetear onboarding
  OnboardingService.guestProgress[guestId] = null;
  guest.onboarding_completed = false;
  guest.name = null;
  guest.trip_type = null;
  guest.companion = null;
  guest.dietary = null;
  guest.interests = [];
  guest.waiting_for_language_change = false;

  res.json({
    success: true,
    message: `Guest ${guestId} reset successfully`,
    guest: guest
  });
});

module.exports = router;