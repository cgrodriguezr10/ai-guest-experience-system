const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhookController');

// POST webhook para recibir mensajes
router.post('/', webhookController.receiveMessage);

// GET para verificar status del webhook
router.get('/status', webhookController.getWebhookStatus);

module.exports = router;