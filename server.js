const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const environment = require('./src/config/environment');
const webhookRoutes = require('./src/routes/webhookRoutes');
const guestRoutes = require('./src/routes/guestRoutes');
const interactionRoutes = require('./src/routes/interactionRoutes');

const app = express();
const PORT = environment.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ASCII Art Banner
console.log(`
╔════════════════════════════════════════════════════════╗
║     AI GUEST EXPERIENCE SYSTEM - Starting Server       ║
╚════════════════════════════════════════════════════════╝
`);

console.log(`⚙️  Environment: ${environment.NODE_ENV}`);
console.log(`📍 Port: ${PORT}`);
console.log(`🏨 Hotel: The Plaza Hotel`);
console.log(`🗣️  Language: ES`);
console.log(`🕐 Timezone: America/Bogota`);

// Database
console.log(`📊 Initializing database...`);
const database = require('./src/config/database');
database.initialize();
console.log(`✅ Database initialized (Mock mode - for development)`);
console.log(`✅ Database connected`);

// Routes
app.use('/webhook', webhookRoutes);
app.use('/api/guests', guestRoutes);
app.use('/api/interactions', interactionRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'AI Guest Experience System'
  });
});

// API Info
app.get('/api/info', (req, res) => {
  res.json({
    service: 'AI Guest Experience System',
    version: '1.0.0',
    endpoints: {
      webhook: '/webhook',
      health: '/health',
      guests: '/api/guests',
      interactions: '/api/interactions'
    }
  });
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
});

module.exports = app;