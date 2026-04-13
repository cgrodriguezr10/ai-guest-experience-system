const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Importar rutas
const webhookRoutes = require('./src/routes/webhookRoutes');
const guestRoutes = require('./src/routes/guestRoutes');
const interactionRoutes = require('./src/routes/interactionRoutes');
const receptionRoutes = require('./src/routes/receptionRoutes');
const pmsIntegrationRoutes = require('./src/routes/pmsIntegrationRoutes');

// Importar servicios
const aiService = require('./src/services/aiService');
const { initializeDatabase } = require('./src/config/database');

// Banner inicial
console.log(`
╔════════════════════════════════════════════════════════╗
║     AI GUEST EXPERIENCE SYSTEM - Starting Server       ║
║            WhatsApp Business Cloud API                 ║
╚════════════════════════════════════════════════════════╝
`);

console.log(`⚙️  Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`📍 Port: ${process.env.PORT || 3000}`);
console.log(`🏨 Hotel: The Plaza Hotel`);
console.log(`🗣️  Language: ES`);
console.log(`🕐 Timezone: America/Bogota`);
console.log(`📱 Platform: WhatsApp Business Cloud API`);

// Función de inicialización
async function initializeApp() {
  try {
    console.log(`📊 Initializing PostgreSQL database...`);
    await initializeDatabase();
    console.log(`✅ Database connected`);
    console.log(`✅ Database initialized with tables`);

    // Rutas de la aplicación
    app.use('/webhook', webhookRoutes);
    app.use('/api/guests', guestRoutes);
    app.use('/api/interactions', interactionRoutes);
    app.use('/api/reception', receptionRoutes);
    app.use('/api/pms', pmsIntegrationRoutes);

    // Health check
    app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'AI Guest Experience System',
        platform: 'WhatsApp Business Cloud API'
      });
    });

    // API Info
    app.get('/api/info', (req, res) => {
      res.json({
        service: 'AI Guest Experience System',
        version: '1.0.0',
        platform: 'WhatsApp Business Cloud API',
        endpoints: {
          health: '/health',
          webhook: '/webhook',
          guests: '/api/guests',
          interactions: '/api/interactions',
          reception: '/api/reception',
          pms: '/api/pms'
        }
      });
    });

    // Error handling
    app.use((err, req, res, next) => {
      console.error('❌ Error:', err);
      res.status(500).json({
        error: err.message,
        statusCode: 500
      });
    });

    // 404 handler
    app.use((req, res) => {
      res.status(404).json({
        error: {
          message: 'Route not found',
          statusCode: 404,
          path: req.path
        }
      });
    });

    console.log(`🚀 Server running at http://localhost:3000`);
    console.log(`📋 API Info: http://localhost:3000/api/info`);
    console.log(`💚 Health Check: http://localhost:3000/health`);
    console.log(`✨ Ready to receive WhatsApp messages!`);
    console.log(`📱 Webhook: http://localhost:3000/webhook`);

  } catch (error) {
    console.error('❌ Failed to initialize application:', error);
    process.exit(1);
  }
}

initializeApp();
module.exports = app;

// START SERVER
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 WhatsApp Webhook: https://ai-guest-experience-system.onrender.com/webhook`);
});