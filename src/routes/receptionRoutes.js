const express = require('express');
const ReceptionService = require('../services/receptionService');

const router = express.Router();

/**
 * Obtener órdenes pendientes
 */
router.get('/pending', async (req, res) => {
  try {
    const orders = await ReceptionService.getPendingOrders();
    res.json({
      success: true,
      count: orders.length,
      orders: orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Obtener todas las órdenes
 */
router.get('/all', async (req, res) => {
  try {
    const orders = await ReceptionService.getAllOrders();
    res.json({
      success: true,
      count: orders.length,
      orders: orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Actualizar estado de orden
 */
router.put('/:orderId/status', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const result = await ReceptionService.updateOrderStatus(parseInt(orderId), status);

    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Asignar orden a staff
 */
router.put('/:orderId/assign', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { staff_name } = req.body;

    const result = await ReceptionService.assignOrder(parseInt(orderId), staff_name);

    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Obtener estadísticas
 */
router.get('/stats/overview', async (req, res) => {
  try {
    const stats = await ReceptionService.getOrderStatistics();
    res.json({
      success: true,
      statistics: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;