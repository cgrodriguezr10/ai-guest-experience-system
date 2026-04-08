const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const environment = require('./config/environment');

// Crear app
const app = express();

// ============================================
// MIDDLEWARES GLOBALES
// ============================================

// CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
}));

// Body Parsers
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Logger middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

// ============================================
// RUTAS
// ============================================

const webhookRoutes = require('./routes/webhookRoutes');
const guestRoutes = require('./routes/guestRoutes');
const interactionRoutes = require('./routes/interactionRoutes');

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    app: environment.APP.NAME,
    version: environment.APP.VERSION,
    environment: environment.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// API info
app.get('/api/info', (req, res) => {
  res.json({
    app: environment.APP.NAME,
    version: environment.APP.VERSION,
    description: 'AI-powered Guest Experience System for Hotels',
    endpoints: {
      health: 'GET /health',
      webhook: 'POST /webhook',
      guests: 'GET/POST /guests',
      interactions: 'GET /interactions/:guest_id',
    },
  });
});

// Registrar rutas
app.use('/webhook', webhookRoutes);
app.use('/guests', guestRoutes);
app.use('/interactions', interactionRoutes);

// ============================================
// ERROR HANDLER
// ============================================

app.use((err, req, res, next) => {
  const timestamp = new Date().toISOString();
  console.error(`[${timestamp}] Error:`, err.message);

  const statusCode = err.statusCode || 500;
  const message = environment.NODE_ENV === 'production'
    ? 'Internal server error'
    : err.message;

  res.status(statusCode).json({
    error: {
      message,
      statusCode,
      timestamp,
    },
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    error: {
      message: 'Route not found',
      statusCode: 404,
      path: req.path,
    },
  });
});

module.exports = app;
