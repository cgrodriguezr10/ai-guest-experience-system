require('dotenv').config();

const environment = {
  // Server
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',

  // Database
  DATABASE_URL: process.env.DATABASE_URL || 'sqlite:./database.sqlite',
  DATABASE_TYPE: process.env.DATABASE_TYPE || 'sqlite',

  // Twilio WhatsApp
  TWILIO: {
    ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
    AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
    WHATSAPP_NUMBER: process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155552671',
    WEBHOOK_URL: process.env.TWILIO_WEBHOOK_URL || 'http://localhost:3000/webhook',
  },

  // OpenAI
  OPENAI: {
    API_KEY: process.env.OPENAI_API_KEY,
    MODEL: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
  },

  // Hotel Configuration
  HOTEL: {
    DEFAULT_ID: parseInt(process.env.DEFAULT_HOTEL_ID || '1'),
    DEFAULT_NAME: process.env.DEFAULT_HOTEL_NAME || 'The Plaza Hotel',
    DEFAULT_LANGUAGE: process.env.DEFAULT_HOTEL_LANGUAGE || 'ES',
    DEFAULT_TIMEZONE: process.env.DEFAULT_HOTEL_TIMEZONE || 'America/Bogota',
  },

  // App
  APP: {
    NAME: process.env.APP_NAME || 'AI Guest Experience System',
    VERSION: process.env.APP_VERSION || '1.0.0',
  },
};

// Validar variables críticas
const validateEnvironment = () => {
  const required = [
    'TWILIO_ACCOUNT_SID',
    'TWILIO_AUTH_TOKEN',
    'OPENAI_API_KEY',
  ];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0 && environment.NODE_ENV === 'production') {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  if (missing.length > 0) {
    console.warn(`⚠️  Missing environment variables (development mode): ${missing.join(', ')}`);
  }
};

validateEnvironment();

module.exports = environment;
