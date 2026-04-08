const express = require('express');
const router = express.Router();
const InteractionController = require('../controllers/interactionController');

// GET /interactions/:guestId - Obtener historial del guest
router.get('/:guestId', InteractionController.getGuestHistory);

module.exports = router;
