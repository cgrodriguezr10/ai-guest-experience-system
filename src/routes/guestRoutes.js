const express = require('express');
const router = express.Router();
const GuestController = require('../controllers/guestController');

// GET /guests - Obtener todos
router.get('/hotel/:hotelId', GuestController.getAllGuests);

// GET /guests/:id - Obtener por ID
router.get('/:id', GuestController.getGuest);

// GET /guests/phone/:phone - Obtener por teléfono
router.get('/phone/:phone', GuestController.getGuestByPhone);

// POST /guests - Crear
router.post('/', GuestController.createGuest);

// PUT /guests/:id - Actualizar
router.put('/:id', GuestController.updateGuest);

module.exports = router;
