class StorytellingService {
  static getStories(language = 'EN') {
    const stories = [
      {
        id: 1,
        title_en: 'The Plaza Hotel History',
        title_es: 'Historia de The Plaza Hotel',
        content_en: '🏨 The Plaza Hotel was founded in 1952 as a symbol of elegance and luxury in the heart of Bogotá. For over 70 years, we have welcomed guests from around the world, providing unforgettable experiences and world-class service.',
        content_es: '🏨 The Plaza Hotel fue fundado en 1952 como símbolo de elegancia y lujo en el corazón de Bogotá. Durante más de 70 años, hemos recibido huéspedes de todo el mundo, proporcionando experiencias inolvidables y servicio de clase mundial.',
        category: 'history'
      },
      {
        id: 2,
        title_en: 'Our Architecture',
        title_es: 'Nuestra Arquitectura',
        content_en: '🏛️ Our building is a masterpiece of neo-classical architecture, blending Colombian heritage with international design. Every corner tells a story of craftsmanship and attention to detail.',
        content_es: '🏛️ Nuestro edificio es una obra maestra de arquitectura neoclásica, fusionando la herencia colombiana con diseño internacional. Cada rincón cuenta una historia de artesanía y atención al detalle.',
        category: 'architecture'
      },
      {
        id: 3,
        title_en: 'Local Culture',
        title_es: 'Cultura Local',
        content_en: '🎭 Bogotá is the cultural heart of Colombia. We celebrate local artists, musicians, and traditions. Our hotel regularly hosts cultural events and exhibitions.',
        content_es: '🎭 Bogotá es el corazón cultural de Colombia. Celebramos artistas locales, músicos y tradiciones. Nuestro hotel alberga regularmente eventos y exposiciones culturales.',
        category: 'culture'
      },
      {
        id: 4,
        title_en: 'Sustainability',
        title_es: 'Sostenibilidad',
        content_en: '♻️ We are committed to environmental responsibility. Our hotel uses renewable energy and sustainable practices to minimize our carbon footprint.',
        content_es: '♻️ Estamos comprometidos con la responsabilidad ambiental. Nuestro hotel utiliza energía renovable y prácticas sostenibles para minimizar nuestra huella de carbono.',
        category: 'sustainability'
      },
      {
        id: 5,
        title_en: 'Our Team',
        title_es: 'Nuestro Equipo',
        content_en: '👥 Our staff is trained to provide exceptional service. Each team member is passionate about creating memorable experiences for our guests.',
        content_es: '👥 Nuestro personal está capacitado para proporcionar servicio excepcional. Cada miembro del equipo es apasionado por crear experiencias memorables para nuestros huéspedes.',
        category: 'team'
      }
    ];
    return stories;
  }

  static getStoryById(id, language = 'EN') {
    const stories = this.getStories(language);
    return stories.find(story => story.id === id);
  }

  static getStoriesByCategory(category, language = 'EN') {
    const stories = this.getStories(language);
    return stories.filter(story => story.category === category);
  }

  static formatStoriesForWhatsApp(language = 'EN') {
    const stories = this.getStories(language);
    const isSpanish = language === 'ES';

    let message = isSpanish
      ? '📖 *Historias de The Plaza Hotel:*\n\n'
      : '📖 *Stories About The Plaza Hotel:*\n\n';

    stories.forEach((story, index) => {
      const title = language === 'ES' ? story.title_es : story.title_en;
      message += `${index + 1}. ${title}\n`;
    });

    message += isSpanish
      ? '\n📝 Responde con el número de la historia que te interesa.'
      : '\n📝 Reply with the story number you\'re interested in.';

    return message;
  }

  static getRandomStory(language = 'EN') {
    const stories = this.getStories(language);
    const randomStory = stories[Math.floor(Math.random() * stories.length)];
    return language === 'ES' ? randomStory.content_es : randomStory.content_en;
  }
}

module.exports = StorytellingService;