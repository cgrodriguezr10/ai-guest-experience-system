const express = require('express');
const router = express.Router();
const WebhookController = require('../controllers/webhookController');

// POST /webhook - Recibir mensajes de WhatsApp
router.post('/', WebhookController.receiveMessage);

// GET /webhook/status - Health check
router.get('/status', WebhookController.webhookStatus);

module.exports = router;
