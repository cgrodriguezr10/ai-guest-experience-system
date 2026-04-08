const twilio = require('twilio');
const environment = require('./environment');

let twilioClient = null;

const initializeTwilio = () => {
  if (twilioClient) return twilioClient;

  if (!environment.TWILIO.ACCOUNT_SID || !environment.TWILIO.AUTH_TOKEN) {
    console.warn('⚠️  Twilio credentials not configured. WhatsApp features will not work.');
    return null;
  }

  try {
    twilioClient = twilio(
      environment.TWILIO.ACCOUNT_SID,
      environment.TWILIO.AUTH_TOKEN
    );
    console.log('✅ Twilio initialized');
    return twilioClient;
  } catch (error) {
    console.error('❌ Twilio initialization failed:', error.message);
    return null;
  }
};

const getTwilioClient = () => {
  if (!twilioClient) {
    return initializeTwilio();
  }
  return twilioClient;
};

const sendWhatsAppMessage = async (to, message, mediaUrl = null) => {
  const client = getTwilioClient();

  if (!client) {
    console.error('Twilio client not initialized');
    return null;
  }

  try {
    const payload = {
      from: environment.TWILIO.WHATSAPP_NUMBER,
      to: `whatsapp:${to}`,
      body: message,
    };

    if (mediaUrl) {
      payload.mediaUrl = [mediaUrl];
    }

    const result = await client.messages.create(payload);
    console.log(`✅ Message sent to ${to}: ${result.sid}`);
    return result;
  } catch (error) {
    console.error(`❌ Failed to send message to ${to}:`, error.message);
    return null;
  }
};

const verifyWebhook = (token, twilioSignature, url, params) => {
  try {
    const isValid = twilio.validateRequest(
      environment.TWILIO.AUTH_TOKEN,
      twilioSignature,
      url,
      params
    );
    return isValid;
  } catch (error) {
    console.error('Webhook validation error:', error.message);
    return false;
  }
};

module.exports = {
  initializeTwilio,
  getTwilioClient,
  sendWhatsAppMessage,
  verifyWebhook,
};
