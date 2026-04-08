#!/usr/bin/env node

const path = require('path');
require('dotenv').config();

const environment = require('./src/config/environment');
const { initializeDatabase } = require('./src/config/database');
const app = require('./src/app');

// ============================================
// CONFIGURACIÓN INICIAL
// ============================================

const PORT = environment.PORT;
const NODE_ENV = environment.NODE_ENV;

console.log('╔════════════════════════════════════════════════════════╗');
console.log('║     AI GUEST EXPERIENCE SYSTEM - Starting Server       ║');
console.log('╚════════════════════════════════════════════════════════╝');
console.log(`\n⚙️  Environment: ${NODE_ENV}`);
console.log(`📍 Port: ${PORT}`);
console.log(`🏨 Hotel: ${environment.HOTEL.DEFAULT_NAME}`);
console.log(`🗣️  Language: ${environment.HOTEL.DEFAULT_LANGUAGE}`);
console.log(`🕐 Timezone: ${environment.HOTEL.DEFAULT_TIMEZONE}\n`);

// ============================================
// INICIALIZAR BASE DE DATOS
// ============================================

const startServer = async () => {
  try {
    // Inicializar BD
    console.log('📊 Initializing database...');
    const db = await initializeDatabase();
    console.log('✅ Database connected\n');

    // Iniciar servidor
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
      console.log(`📋 API Info: http://localhost:${PORT}/api/info`);
      console.log(`💚 Health Check: http://localhost:${PORT}/health`);
      console.log('\n✨ Ready to receive WhatsApp messages!\n');
    });

    // Graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n🛑 Shutting down gracefully...');
      server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
