class ReviewService {
  static getRatingEmoji(rating) {
    const stars = parseInt(rating);
    const emojis = {
      1: '⭐',
      2: '⭐⭐',
      3: '⭐⭐⭐',
      4: '⭐⭐⭐⭐',
      5: '⭐⭐⭐⭐⭐'
    };
    return emojis[stars] || '⭐⭐⭐⭐';
  }

  static formatReviewMessage(guestName, rating, comment, language = 'EN') {
    const isSpanish = language === 'ES';
    const emoji = this.getRatingEmoji(rating);

    if (isSpanish) {
      return `✅ ¡Gracias por tu reseña, ${guestName}!\n\n${emoji}\n\n"${comment}"\n\nTu opinión es muy importante para nosotros. ¡Esperamos verte pronto!`;
    } else {
      return `✅ Thank you for your review, ${guestName}!\n\n${emoji}\n\n"${comment}"\n\nYour feedback is very important to us. We hope to see you soon!`;
    }
  }

  static getReviewPrompt(language = 'EN') {
    const isSpanish = language === 'ES';

    if (isSpanish) {
      return `📝 *¿Cómo fue tu experiencia?*\n\nResponde con:\n1️⃣ Excelente\n2️⃣ Muy bueno\n3️⃣ Bueno\n4️⃣ Regular\n5️⃣ Malo`;
    } else {
      return `📝 *How was your experience?*\n\nRate us:\n1️⃣ Excellent\n2️⃣ Very Good\n3️⃣ Good\n4️⃣ Fair\n5️⃣ Poor`;
    }
  }

  static parseRating(response) {
    const ratings = {
      '1': 5,
      'excellent': 5,
      'excelente': 5,
      '2': 4,
      'very good': 4,
      'muy bueno': 4,
      '3': 3,
      'good': 3,
      'bueno': 3,
      '4': 2,
      'fair': 2,
      'regular': 2,
      '5': 1,
      'poor': 1,
      'malo': 1
    };

    const key = response.toLowerCase().trim();
    return ratings[key] || null;
  }

  static generateThankYouMessage(guestName, language = 'EN') {
    const isSpanish = language === 'ES';

    if (isSpanish) {
      return `¡Muchas gracias, ${guestName}! 🙏\n\nTu reseña nos ayuda a mejorar. ¡Esperamos tu próxima visita a The Plaza Hotel!`;
    } else {
      return `Thank you so much, ${guestName}! 🙏\n\nYour review helps us improve. We look forward to your next visit to The Plaza Hotel!`;
    }
  }

  static generateFeedbackMessage(rating, language = 'EN') {
    const isSpanish = language === 'ES';

    if (rating >= 4) {
      return isSpanish
        ? '¡Nos alegra que hayas disfrutado tu estancia! 😊'
        : 'We\'re glad you enjoyed your stay! 😊';
    } else if (rating >= 3) {
      return isSpanish
        ? 'Apreciamos tu feedback. Nos gustaría mejorar tu próxima experiencia. 💪'
        : 'We appreciate your feedback. We\'d like to improve your next experience. 💪';
    } else {
      return isSpanish
        ? 'Lamentamos no haber cumplido tus expectativas. Por favor contáctanos para ayudarte. 📞'
        : 'We\'re sorry we didn\'t meet your expectations. Please contact us to help. 📞';
    }
  }
}

module.exports = ReviewService;