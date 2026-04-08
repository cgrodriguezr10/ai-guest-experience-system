class ExperienceService {
  static getExperiences(language = 'EN') {
    const experiences = [
      {
        id: 1,
        name_en: 'Gold Museum',
        name_es: 'Museo del Oro',
        description_en: 'Explore the world\'s largest collection of pre-Hispanic gold artifacts',
        description_es: 'Explora la colección más grande del mundo de artefactos de oro prehispánico',
        category: 'culture',
        duration_minutes: 120,
        price_usd: 18,
        rating: 4.8
      },
      {
        id: 2,
        name_en: 'Monserrate',
        name_es: 'Monserrate',
        description_en: 'Visit the sanctuary atop a mountain with stunning city views',
        description_es: 'Visita el santuario en la cima de una montaña con vistas espectaculares',
        category: 'nature',
        duration_minutes: 180,
        price_usd: 25,
        rating: 4.7
      },
      {
        id: 3,
        name_en: 'La Candelaria Walking Tour',
        name_es: 'Tour a Pie La Candelaria',
        description_en: 'Discover colonial architecture and street art in historic neighborhood',
        description_es: 'Descubre arquitectura colonial y arte callejero en el barrio histórico',
        category: 'culture',
        duration_minutes: 150,
        price_usd: 30,
        rating: 4.6
      },
      {
        id: 4,
        name_en: 'Bogotá Botanic Garden',
        name_es: 'Jardín Botánico de Bogotá',
        description_en: 'Stroll through beautiful gardens with native Colombian plants',
        description_es: 'Pasea por hermosos jardines con plantas colombianas nativas',
        category: 'nature',
        duration_minutes: 90,
        price_usd: 12,
        rating: 4.5
      },
      {
        id: 5,
        name_en: 'Coffee Plantation Tour',
        name_es: 'Tour de Plantación de Café',
        description_en: 'Learn about coffee production and taste premium Colombian coffee',
        description_es: 'Aprende sobre la producción de café y prueba café colombiano premium',
        category: 'gastronomy',
        duration_minutes: 240,
        price_usd: 65,
        rating: 4.9
      },
      {
        id: 6,
        name_en: 'National Museum',
        name_es: 'Museo Nacional',
        description_en: 'Discover Colombian art and history through the centuries',
        description_es: 'Descubre el arte e historia colombiana a través de los siglos',
        category: 'culture',
        duration_minutes: 180,
        price_usd: 15,
        rating: 4.4
      },
      {
        id: 7,
        name_en: 'Street Food Tour',
        name_es: 'Tour de Comida Callejera',
        description_en: 'Taste authentic street food and local flavors',
        description_es: 'Prueba comida callejera auténtica y sabores locales',
        category: 'gastronomy',
        duration_minutes: 120,
        price_usd: 45,
        rating: 4.7
      },
      {
        id: 8,
        name_en: 'Usaquén Market',
        name_es: 'Mercado de Usaquén',
        description_en: 'Visit the bohemian neighborhood with crafts and local products',
        description_es: 'Visita el barrio bohemio con artesanías y productos locales',
        category: 'shopping',
        duration_minutes: 180,
        price_usd: 0,
        rating: 4.6
      },
      {
        id: 9,
        name_en: 'Rafting Adventure',
        name_es: 'Aventura de Rafting',
        description_en: 'Experience thrilling white-water rafting near Bogotá',
        description_es: 'Experimenta emocionante rafting en aguas blancas cerca de Bogotá',
        category: 'adventure',
        duration_minutes: 240,
        price_usd: 80,
        rating: 4.8
      },
      {
        id: 10,
        name_en: 'Colombian Cooking Class',
        name_es: 'Clase de Cocina Colombiana',
        description_en: 'Learn to cook traditional Colombian dishes with a local chef',
        description_es: 'Aprende a cocinar platos colombianos tradicionales con un chef local',
        category: 'gastronomy',
        duration_minutes: 180,
        price_usd: 75,
        rating: 4.9
      },
      {
        id: 11,
        name_en: 'Zipline Adventure',
        name_es: 'Aventura de Tirolesa',
        description_en: 'Fly through the Colombian mountains on exciting ziplines',
        description_es: 'Vuela a través de las montañas colombianas en tirolesas emocionantes',
        category: 'adventure',
        duration_minutes: 120,
        price_usd: 70,
        rating: 4.7
      }
    ];
    return experiences;
  }

  static formatExperiencesForWhatsApp(language = 'EN') {
    const experiences = this.getExperiences(language);
    const isSpanish = language === 'ES';
    let message = isSpanish
      ? '🌟 *Experiencias disponibles:*\n\n'
      : '🌟 *Available Experiences:*\n\n';
    experiences.forEach((exp, index) => {
      const name = language === 'ES' ? exp.name_es : exp.name_en;
      const price = exp.price_usd > 0 ? `$${exp.price_usd}` : isSpanish ? 'Gratis' : 'Free';
      message += `${index + 1}. ${name} - ${price}\n`;
    });
    message += isSpanish
      ? '\n📝 Responde con el número de la experiencia que te interesa.'
      : '\n📝 Reply with the experience number you\'re interested in.';
    return message;
  }

  static getExperienceById(id, language = 'EN') {
    const experiences = this.getExperiences(language);
    return experiences.find(exp => exp.id === id);
  }

  static getExperiencesByCategory(category, language = 'EN') {
    const experiences = this.getExperiences(language);
    return experiences.filter(exp => exp.category === category);
  }
}

module.exports = ExperienceService;