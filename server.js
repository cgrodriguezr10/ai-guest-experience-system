const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const environment = require('./src/config/environment');
const Database = require('./src/config/database');
const webhookBusinessController = require('./src/controllers/webhookBusinessController');
const guestRoutes = require('./src/routes/guestRoutes');
const interactionRoutes = require('./src/routes/interactionRoutes');
const receptionRoutes = require('./src/routes/receptionRoutes');

const app = express();
const PORT = environment.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ASCII Art Banner
console.log(`
╔════════════════════════════════════════════════════════╗
║     AI GUEST EXPERIENCE SYSTEM - Starting Server       ║
║            WhatsApp Business Cloud API                 ║
╚════════════════════════════════════════════════════════╝
`);

console.log(`⚙️  Environment: ${environment.NODE_ENV}`);
console.log(`📍 Port: ${PORT}`);
console.log(`🏨 Hotel: The Plaza Hotel`);
console.log(`🗣️  Language: ES`);
console.log(`🕐 Timezone: America/Bogota`);
console.log(`📱 Platform: WhatsApp Business Cloud API`);

// Initialize Database
async function initializeApp() {
  try {
    await Database.initialize();
    
    // ⭐ WHATSAPP BUSINESS WEBHOOK
    app.get('/webhook', (req, res) => {
      webhookBusinessController.handleWebhook(req, res);
    });

    app.post('/webhook', (req, res) => {
      webhookBusinessController.handleWebhook(req, res);
    });

    // Routes
    app.use('/api/guests', guestRoutes);
    app.use('/api/interactions', interactionRoutes);
    app.use('/api/reception', receptionRoutes);

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
          webhook: '/webhook',
          health: '/health',
          guests: '/api/guests',
          interactions: '/api/interactions',
          reception: '/api/reception'
        }
      });
    });

    // Reset endpoint (development only)
    app.get('/webhook/reset-all', async (req, res) => {
      try {
        const GuestService = require('./src/services/guestService');
        const OnboardingService = require('./src/services/onboardingService');
        
        GuestService.guests = {};
        GuestService.guestCounter = 0;
        OnboardingService.guestProgress = {};

        res.json({
          success: true,
          message: 'All guests reset successfully',
          guests_cleared: 0
        });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // 404 Handler
    app.use((req, res) => {
      res.status(404).json({
        error: {
          message: 'Route not found',
          statusCode: 404,
          path: req.path
        }
      });
    });

    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
      console.log(`📋 API Info: http://localhost:${PORT}/api/info`);
      console.log(`💚 Health Check: http://localhost:${PORT}/health`);
      console.log(`✨ Ready to receive WhatsApp messages!`);
      console.log(`📱 Webhook: http://localhost:${PORT}/webhook`);
    });
  } catch (error) {
    console.error('❌ Failed to initialize application:', error);
    process.exit(1);
  }
}

initializeApp();

module.exports = app;