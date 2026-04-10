const axios = require('axios');

class WhatsAppBusiness {
  constructor() {
    this.API_URL = 'https://graph.instagram.com/v18.0';
    this.PHONE_NUMBER_ID = process.env.WHATSAPP_BUSINESS_PHONE_ID;
    this.BUSINESS_ACCOUNT_ID = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;
    this.ACCESS_TOKEN = process.env.WHATSAPP_BUSINESS_ACCESS_TOKEN;
    this.WEBHOOK_VERIFY_TOKEN = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;
  }

  /**
   * Envía un mensaje de texto a través de WhatsApp Business
   */
  async sendMessage(phoneNumber, message) {
    try {
      const url = `${this.API_URL}/${this.PHONE_NUMBER_ID}/messages`;
      
      // Limpiar número: remover caracteres especiales
      const cleanPhone = phoneNumber.replace(/\D/g, '');
      
      const response = await axios.post(
        url,
        {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: cleanPhone,
          type: 'text',
          text: {
            preview_url: true,
            body: message
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log(`✅ WhatsApp message sent to ${cleanPhone}: ${response.data.messages[0].id}`);
      return response.data;
    } catch (error) {
      console.error('❌ Error sending WhatsApp message:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Envía un mensaje con botones
   */
  async sendButtonMessage(phoneNumber, message, buttons) {
    try {
      const url = `${this.API_URL}/${this.PHONE_NUMBER_ID}/messages`;
      const cleanPhone = phoneNumber.replace(/\D/g, '');

      const response = await axios.post(
        url,
        {
          messaging_product: 'whatsapp',
          to: cleanPhone,
          type: 'interactive',
          interactive: {
            type: 'button',
            body: {
              text: message
            },
            action: {
              buttons: buttons
            }
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log(`✅ Interactive message sent to ${cleanPhone}`);
      return response.data;
    } catch (error) {
      console.error('❌ Error sending interactive message:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Envía un mensaje con catálogo
   */
  async sendCatalogMessage(phoneNumber, catalogTitle, catalogDescription) {
    try {
      const url = `${this.API_URL}/${this.PHONE_NUMBER_ID}/messages`;
      const cleanPhone = phoneNumber.replace(/\D/g, '');

      const response = await axios.post(
        url,
        {
          messaging_product: 'whatsapp',
          to: cleanPhone,
          type: 'interactive',
          interactive: {
            type: 'product_list',
            header: {
              type: 'text',
              text: catalogTitle
            },
            body: {
              text: catalogDescription
            },
            action: {
              catalog_id: process.env.WHATSAPP_CATALOG_ID
            }
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log(`✅ Catalog message sent to ${cleanPhone}`);
      return response.data;
    } catch (error) {
      console.error('❌ Error sending catalog message:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Verifica webhook (requerido por Meta)
   */
  verifyWebhook(token) {
    return token === this.WEBHOOK_VERIFY_TOKEN;
  }

  /**
   * Extrae información del mensaje de Meta
   */
  parseWebhookMessage(body) {
    try {
      const message = body.entry[0].changes[0].value;
      
      if (message.messages && message.messages.length > 0) {
        const msg = message.messages[0];
        const contact = message.contacts[0];

        return {
          from: msg.from,
          body: msg.text?.body || '',
          type: msg.type,
          timestamp: msg.timestamp,
          id: msg.id,
          senderName: contact.profile.name,
          messageStatus: message.statuses?.[0]?.status || null
        };
      }
      return null;
    } catch (error) {
      console.error('Error parsing webhook message:', error);
      return null;
    }
  }

  /**
   * Marca un mensaje como leído
   */
  async markAsRead(messageId) {
    try {
      const url = `${this.API_URL}/${this.PHONE_NUMBER_ID}/messages`;
      
      await axios.post(
        url,
        {
          messaging_product: 'whatsapp',
          status: 'read',
          message_id: messageId
        },
        {
          headers: {
            'Authorization': `Bearer ${this.ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log(`✅ Message ${messageId} marked as read`);
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  }
}

module.exports = new WhatsAppBusiness();