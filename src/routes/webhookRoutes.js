const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhookController');
const OnboardingService = require('../services/onboardingService');
const GuestService = require('../services/guestService');

// POST webhook para recibir mensajes
router.post('/', webhookController.receiveMessage);

// GET para verificar status del webhook
router.get('/status', webhookController.getWebhookStatus);

// GET para resetear todos los guests (solo desarrollo)
router.get('/reset-all', (req, res) => {
  // Limpiar todos los guests y onboarding
  GuestService.guests = {};
  GuestService.guestCounter = 0;
  OnboardingService.guestProgress = {};

  res.json({
    success: true,
    message: 'All guests reset successfully',
    guests_cleared: Object.keys(GuestService.guests).length
  });
});

module.exports = router;