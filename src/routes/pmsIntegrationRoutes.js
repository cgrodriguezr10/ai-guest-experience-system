const express = require('express');
const PMSIntegrationService = require('../services/pmsIntegrationService');

const router = express.Router();

/**
 * GET /api/pms/room-reservations/pending
 * Obtener todas las reservas de habitaciones pendientes
 */
router.get('/room-reservations/pending', async (req, res) => {
  try {
    const result = await PMSIntegrationService.getPendingRoomReservations();
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/pms/room-reservations/:confirmationCode
 * Obtener detalles de una reserva específica
 */
router.get('/room-reservations/:confirmationCode', async (req, res) => {
  try {
    const { confirmationCode } = req.params;
    const result = await PMSIntegrationService.getRoomReservationByCode(confirmationCode);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * PUT /api/pms/room-reservations/:confirmationCode
 * Actualizar estado de una reserva
 */
router.put('/room-reservations/:confirmationCode', async (req, res) => {
  try {
    const { confirmationCode } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, message: 'Status is required' });
    }

    const result = await PMSIntegrationService.updateRoomReservationStatus(confirmationCode, status);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/pms/service-orders/pending
 * Obtener todas las órdenes de servicios pendientes
 */
router.get('/service-orders/pending', async (req, res) => {
  try {
    const result = await PMSIntegrationService.getPendingServiceOrders();
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/pms/rooms/availability
 * Obtener disponibilidad de habitaciones
 * Query params: from=DD/MM/YYYY&to=DD/MM/YYYY
 */
router.get('/rooms/availability', async (req, res) => {
  try {
    const { from, to } = req.query;

    if (!from || !to) {
      return res.status(400).json({ 
        success: false, 
        message: 'from and to dates are required (format: DD/MM/YYYY)' 
      });
    }

    const result = await PMSIntegrationService.getRoomAvailability(from, to);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/pms/guests/:phone
 * Obtener perfil completo de un huésped
 */
router.get('/guests/:phone', async (req, res) => {
  try {
    const { phone } = req.params;
    const result = await PMSIntegrationService.getGuestProfile(phone);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/pms/stats/overview
 * Obtener estadísticas generales
 */
router.get('/stats/overview', async (req, res) => {
  try {
    const result = await PMSIntegrationService.getOverallStatistics();
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/pms/webhook/notify
 * Recibir webhooks del PMS
 */
router.post('/webhook/notify', async (req, res) => {
  try {
    const webhookData = req.body;
    const result = await PMSIntegrationService.handlePMSWebhook(webhookData);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/pms/reports/audit
 * Obtener reporte de auditoría
 * Query params: from=YYYY-MM-DD&to=YYYY-MM-DD
 */
router.get('/reports/audit', async (req, res) => {
  try {
    const { from, to } = req.query;

    if (!from || !to) {
      return res.status(400).json({ 
        success: false, 
        message: 'from and to dates are required (format: YYYY-MM-DD)' 
      });
    }

    const result = await PMSIntegrationService.getAuditReport(from, to);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;