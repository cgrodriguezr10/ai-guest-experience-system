class MessageClassifierService {
  // Palabras clave relacionadas con el hotel
  static hotelKeywords = [
    // Actividades
    'experience', 'activity', 'tour', 'visit', 'activity', 'expedición',
    'monserrate', 'museum', 'museum', 'coffee', 'garden', 'market', 'rafting',
    'zipline', 'cooking', 'gold', 'candelaria', 'botanical',
    'experiencia', 'actividad', 'tour', 'visita', 'expedición',
    'monserrate', 'museo', 'café', 'jardín', 'mercado', 'rafting',
    'tirolesa', 'cocina', 'oro', 'candelaria', 'botánico',

    // Comida & Restaurante
    'food', 'eat', 'menu', 'restaurant', 'dish', 'dinner', 'lunch', 'breakfast',
    'drink', 'wine', 'cocktail', 'reservation', 'table',
    'comida', 'comer', 'menú', 'restaurante', 'plato', 'cena', 'almuerzo',
    'desayuno', 'bebida', 'vino', 'cóctel', 'reserva', 'mesa',

    // Hotel & Amenidades
    'hotel', 'room', 'suite', 'check-in', 'check-out', 'pool', 'gym', 'spa',
    'reception', 'concierge', 'service', 'amenity', 'facility',
    'hotel', 'habitación', 'suite', 'entrada', 'salida', 'piscina', 'gimnasio',
    'spa', 'recepción', 'conserje', 'servicio', 'amenidad', 'instalación',

    // Servicios
    'service', 'help', 'assist', 'support', 'information', 'info', 'booking',
    'reserve', 'schedule', 'arrange',
    'servicio', 'ayuda', 'asistencia', 'soporte', 'información', 'reserva',
    'agendar', 'programar', 'arreglar',

    // Historia & Arquitectura
    'history', 'architecture', 'building', 'design', 'art', 'culture',
    'historia', 'arquitectura', 'construcción', 'diseño', 'arte', 'cultura',

    // General positivo
    'hello', 'hi', 'help', 'please', 'thank', 'want', 'need', 'would like',
    'hola', 'ayuda', 'por favor', 'gracias', 'quiero', 'necesito', 'quisiera'
  ];

  // Palabras clave de temas NO relacionados (lista negra)
  static irrelevantKeywords = [
    // Política
    'president', 'government', 'politics', 'election', 'vote', 'parliament',
    'presidente', 'gobierno', 'política', 'elección', 'voto', 'parlamento',

    // Ciencia ficción
    'alien', 'ufo', 'extraterrestrial', 'space', 'mars', 'spaceship',
    'alienígena', 'ovni', 'extraterrestre', 'espacio', 'marte', 'nave',

    // Filosofía abstracta
    'meaning of life', 'god', 'religion', 'philosophy', 'existential',
    'sentido de la vida', 'dios', 'religión', 'filosofía', 'existencial',

    // Deportes (salvo si es actividad del hotel)
    'football', 'soccer', 'basketball', 'tennis', 'match', 'score', 'game',
    'fútbol', 'baloncesto', 'tenis', 'partido', 'marcador', 'juego',

    // Películas & Entretenimiento
    'movie', 'film', 'tv show', 'actor', 'actress', 'netflix',
    'película', 'cine', 'serie', 'actor', 'actriz', 'netflix',

    // Viajes a otros lugares
    'Paris', 'New York', 'London', 'Tokyo', 'Los Angeles',
    'París', 'Nueva York', 'Londres', 'Tokio',

    // Clima / Naturaleza general
    'weather', 'rain', 'snow', 'storm', 'wind',
    'clima', 'lluvia', 'nieve', 'tormenta', 'viento',

    // Salud (general, no del hotel)
    'covid', 'virus', 'disease', 'medicine', 'hospital',
    'covid', 'virus', 'enfermedad', 'medicina', 'hospital',

    // Compras generales
    'amazon', 'ebay', 'shopping', 'store', 'buy',
    'compras', 'tienda', 'comprar',

    // Educación general
    'homework', 'exam', 'school', 'university', 'study',
    'tarea', 'examen', 'escuela', 'universidad', 'estudiar',

    // Humor/Broma
    'joke', 'funny', 'laugh', 'meme',
    'chiste', 'gracioso', 'reír', 'meme'
  ];

  /**
   * Clasifica si un mensaje es relevante al hotel
   */
  static classifyMessage(message) {
    const messageLower = message.toLowerCase();

    let relevanceScore = 0;
    let irrelevanceScore = 0;

    this.hotelKeywords.forEach(keyword => {
      if (messageLower.includes(keyword)) {
        relevanceScore += 1;
      }
    });

    this.irrelevantKeywords.forEach(keyword => {
      if (messageLower.includes(keyword)) {
        irrelevanceScore += 2;
      }
    });

    const finalScore = relevanceScore - irrelevanceScore;
    const confidence = (relevanceScore / (relevanceScore + irrelevanceScore + 1)) * 100;

    const isRelevant = relevanceScore > 0 && finalScore > -2;

    let category = 'general';
    if (messageLower.includes('activity') || messageLower.includes('experiencia') || messageLower.includes('tour')) {
      category = 'activities';
    } else if (messageLower.includes('food') || messageLower.includes('menu') || messageLower.includes('comida') || messageLower.includes('restaurante')) {
      category = 'food';
    } else if (messageLower.includes('room') || messageLower.includes('habitación') || messageLower.includes('suite')) {
      category = 'accommodation';
    } else if (messageLower.includes('pool') || messageLower.includes('gym') || messageLower.includes('spa') || messageLower.includes('piscina') || messageLower.includes('gimnasio')) {
      category = 'amenities';
    } else if (messageLower.includes('history') || messageLower.includes('architecture') || messageLower.includes('historia') || messageLower.includes('arquitectura')) {
      category = 'hotel_info';
    }

    return {
      isRelevant,
      confidence: Math.round(confidence),
      category,
      relevanceScore,
      irrelevanceScore
    };
  }

  /**
   * Respuesta para mensajes irrelevantes
   */
  static getOffTopicResponse(language = 'EN') {
    const responses = {
      EN: `I appreciate your question, but I'm specifically here to help with The Plaza Hotel services, activities, dining, and accommodations. 

How can I assist you with:
✅ Available experiences & tours
✅ Restaurant menu & reservations
✅ Hotel amenities (pool, gym, spa)
✅ Room information
✅ Hotel history & services

What would you like to know?`,
      
      ES: `Aprecio tu pregunta, pero estoy aquí específicamente para ayudarte con los servicios, actividades, gastronomía y alojamiento de The Plaza Hotel.

¿Cómo puedo ayudarte con:
✅ Experiencias y tours disponibles
✅ Menú del restaurante y reservas
✅ Amenidades del hotel (piscina, gimnasio, spa)
✅ Información de habitaciones
✅ Historia y servicios del hotel

¿Qué te gustaría saber?`
    };

    return responses[language] || responses['EN'];
  }

  /**
   * Detecta si el usuario quiere cambiar de idioma
   * MÁS FLEXIBLE: reconoce cualquier combinación de "cambio/change/idioma/lenguage/language"
   */
  static isLanguageChangeRequest(message) {
    const messageLower = message.toLowerCase();
    
    // Palabras clave para cambio de idioma
    const changeWords = ['change', 'cambiar', 'switch', 'cambio'];
    const languageWords = ['language', 'idioma', 'lenguage', 'lenguaje', 'idiomas', 'languages', 'english', 'español', 'spanish'];
    
    // Verificar si contiene al menos una palabra de cambio y una de idioma
    const hasChangeWord = changeWords.some(word => messageLower.includes(word));
    const hasLanguageWord = languageWords.some(word => messageLower.includes(word));
    
    // También reconoce solo palabras de idioma si están solas
    if (hasChangeWord && hasLanguageWord) {
      return true;
    }
    
    // Si solo menciona idioma/lenguage/language/english/español
    const languageOnlyKeywords = ['idioma', 'lenguage', 'lenguaje', 'english', 'español', 'spanish'];
    const isLanguageOnly = languageOnlyKeywords.some(word => 
      messageLower.includes(word) && messageLower.length < 30
    );
    
    if (isLanguageOnly) {
      return true;
    }

    return false;
  }
}

module.exports = MessageClassifierService;