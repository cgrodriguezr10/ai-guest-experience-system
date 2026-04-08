class AutomationService {
  static getTimeOfDay() {
    const hour = new Date().getHours();
    
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 21) return 'evening';
    return 'night';
  }

  static getMorningMessage(guestName, language = 'EN') {
    const isSpanish = language === 'ES';
    
    if (isSpanish) {
      return `¡Buenos días, ${guestName}! ☀️\n\nEsperamos que hayas dormido bien. ¿Te gustaría disfrutar de nuestro desayuno de lujo o explorar las atracciones cercanas hoy?`;
    } else {
      return `Good morning, ${guestName}! ☀️\n\nWe hope you slept well. Would you like to enjoy our luxury breakfast or explore nearby attractions today?`;
    }
  }

  static getAfternoonMessage(guestName, language = 'EN') {
    const isSpanish = language === 'ES';
    
    if (isSpanish) {
      return `¡Buenas tardes, ${guestName}! 🌤️\n\n¿Qué tal está tu día? Si te gustaría una experiencia especial o recomendaciones para comer, estoy aquí para ayudarte.`;
    } else {
      return `Good afternoon, ${guestName}! 🌤️\n\nHow's your day going? If you'd like a special experience or dining recommendations, I'm here to help.`;
    }
  }

  static getEveningMessage(guestName, language = 'EN') {
    const isSpanish = language === 'ES';
    
    if (isSpanish) {
      return `¡Buenas noches, ${guestName}! 🌙\n\nEs hora de relajarse. Te recomendamos disfrutar de nuestro spa o cenar en nuestro restaurante gourmet. ¿Te interesa?`;
    } else {
      return `Good evening, ${guestName}! 🌙\n\nTime to unwind. We recommend enjoying our spa or dining at our gourmet restaurant. Are you interested?`;
    }
  }

  static getNightMessage(guestName, language = 'EN') {
    const isSpanish = language === 'ES';
    
    if (isSpanish) {
      return `¡Buenas noches, ${guestName}! 😴\n\nEsperamos que descanses bien. Si necesitas algo durante la noche, nuestro equipo está disponible 24/7.`;
    } else {
      return `Good night, ${guestName}! 😴\n\nWe hope you rest well. If you need anything during the night, our team is available 24/7.`;
    }
  }

  static getTimeBasedMessage(guestName, language = 'EN') {
    const timeOfDay = this.getTimeOfDay();

    switch (timeOfDay) {
      case 'morning':
        return this.getMorningMessage(guestName, language);
      case 'afternoon':
        return this.getAfternoonMessage(guestName, language);
      case 'evening':
        return this.getEveningMessage(guestName, language);
      case 'night':
        return this.getNightMessage(guestName, language);
      default:
        return `Hello ${guestName}! How can we help?`;
    }
  }

  static getReviewRequest(guestName, language = 'EN') {
    const isSpanish = language === 'ES';
    
    if (isSpanish) {
      return `¡${guestName}, gracias por elegir The Plaza Hotel! 🙏\n\n¿Cómo fue tu experiencia? Nos encantaría conocer tu opinión. Por favor, comparte tu reseña con nosotros.\n\n⭐⭐⭐⭐⭐`;
    } else {
      return `Thank you for choosing The Plaza Hotel, ${guestName}! 🙏\n\nHow was your experience? We'd love to hear your feedback. Please share your review with us.\n\n⭐⭐⭐⭐⭐`;
    }
  }

  static shouldRequestReview(checkOutDate) {
    if (!checkOutDate) return false;
    
    const today = new Date();
    const checkout = new Date(checkOutDate);
    const daysDifference = Math.floor((checkout - today) / (1000 * 60 * 60 * 24));
    
    // Solicitar reseña 1 día antes del checkout
    return daysDifference === 1;
  }
}

module.exports = AutomationService;