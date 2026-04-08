class GastronomyService {
  static getDishes(language = 'EN') {
    const dishes = [
      {
        id: 1,
        name_en: 'Ajiaco Santafereño',
        name_es: 'Ajiaco Santafereño',
        description_en: 'Traditional bogotá soup with potatoes, corn, and chicken',
        description_es: 'Sopa tradicional bogotana con papas, maíz y pollo',
        ingredients: ['chicken', 'potatoes', 'corn', 'cilantro'],
        dietary_tags: ['vegetarian_option', 'gluten_free'],
        category: 'soup',
        price_usd: 12
      },
      {
        id: 2,
        name_en: 'Bandeja Paisa',
        name_es: 'Bandeja Paisa',
        description_en: 'Hearty Antioquia platter with beans, rice, meat, and more',
        description_es: 'Generoso plato de Antioquia con frijoles, arroz, carne y más',
        ingredients: ['beef', 'beans', 'rice', 'chorizo', 'fried egg'],
        dietary_tags: ['high_protein'],
        category: 'main_course',
        price_usd: 18
      },
      {
        id: 3,
        name_en: 'Ceviche',
        name_es: 'Ceviche',
        description_en: 'Fresh fish cured in citrus with coconut and tropical fruits',
        description_es: 'Pez fresco curado en cítricos con coco y frutas tropicales',
        ingredients: ['fish', 'lime', 'coconut', 'tropical_fruits'],
        dietary_tags: ['seafood', 'gluten_free'],
        category: 'appetizer',
        price_usd: 16
      },
      {
        id: 4,
        name_en: 'Empanadas',
        name_es: 'Empanadas',
        description_en: 'Golden fried pastries filled with meat or cheese',
        description_es: 'Pastelitos fritos rellenos de carne o queso',
        ingredients: ['flour', 'meat', 'cheese', 'fried'],
        dietary_tags: ['vegetarian_option'],
        category: 'appetizer',
        price_usd: 5
      },
      {
        id: 5,
        name_en: 'Sancocho',
        name_es: 'Sancocho',
        description_en: 'Hearty stew with vegetables, meat, and plantains',
        description_es: 'Guiso sustancioso con verduras, carne y plátanos',
        ingredients: ['beef', 'plantains', 'vegetables', 'tubers'],
        dietary_tags: ['hearty'],
        category: 'main_course',
        price_usd: 14
      },
      {
        id: 6,
        name_en: 'Arepa',
        name_es: 'Arepa',
        description_en: 'Corn cake filled with cheese, meat, or butter',
        description_es: 'Torta de maíz rellena de queso, carne o mantequilla',
        ingredients: ['corn', 'cheese', 'butter'],
        dietary_tags: ['vegetarian_option', 'gluten_free'],
        category: 'bread',
        price_usd: 4
      },
      {
        id: 7,
        name_en: 'Grilled Fish with Coconut Rice',
        name_es: 'Pescado a la Parrilla con Arroz de Coco',
        description_en: 'Fresh grilled fish served with creamy coconut rice',
        description_es: 'Pez fresco a la parrilla servido con arroz de coco cremoso',
        ingredients: ['fish', 'coconut', 'rice'],
        dietary_tags: ['seafood', 'gluten_free'],
        category: 'main_course',
        price_usd: 22
      },
      {
        id: 8,
        name_en: 'Flan',
        name_es: 'Flan',
        description_en: 'Creamy caramel custard dessert',
        description_es: 'Postre cremoso de flan de caramelo',
        ingredients: ['eggs', 'milk', 'sugar', 'vanilla'],
        dietary_tags: ['vegetarian'],
        category: 'dessert',
        price_usd: 8
      },
      {
        id: 9,
        name_en: 'Patacones',
        name_es: 'Patacones',
        description_en: 'Twice-fried plantain slices served with guacamole',
        description_es: 'Rodajas de plátano fritas dos veces con guacamole',
        ingredients: ['plantains', 'avocado', 'salt'],
        dietary_tags: ['vegan', 'gluten_free'],
        category: 'side_dish',
        price_usd: 6
      },
      {
        id: 10,
        name_en: 'Hot Chocolate with Cheese',
        name_es: 'Chocolate Caliente con Queso',
        description_en: 'Rich hot chocolate paired with melted cheese',
        description_es: 'Chocolate caliente rico acompañado de queso derretido',
        ingredients: ['chocolate', 'milk', 'cheese'],
        dietary_tags: ['vegetarian'],
        category: 'beverage',
        price_usd: 7
      }
    ];
    return dishes;
  }

  static formatDishesForWhatsApp(language = 'EN') {
    const dishes = this.getDishes(language);
    const isSpanish = language === 'ES';
    let message = isSpanish
      ? '🍽️ *Nuestros Platos Especiales:*\n\n'
      : '🍽️ *Our Special Dishes:*\n\n';
    dishes.forEach((dish, index) => {
      const name = language === 'ES' ? dish.name_es : dish.name_en;
      message += `${index + 1}. ${name} - $${dish.price_usd}\n`;
    });
    message += isSpanish
      ? '\n📝 Responde con el número del plato que deseas.'
      : '\n📝 Reply with the dish number you want.';
    return message;
  }

  static getDishById(id, language = 'EN') {
    const dishes = this.getDishes(language);
    return dishes.find(dish => dish.id === id);
  }

  static getDishesByDietaryTag(tag, language = 'EN') {
    const dishes = this.getDishes(language);
    return dishes.filter(dish => dish.dietary_tags.includes(tag));
  }

  static getPersonalizedRecommendation(preferences, language = 'EN') {
    const dishes = this.getDishes(language);
    const isSpanish = language === 'ES';
    let filtered = dishes;
    if (preferences && preferences.length > 0) {
      filtered = filtered.filter(dish => 
        preferences.some(pref => dish.dietary_tags.includes(pref))
      );
    }
    if (filtered.length === 0) {
      return isSpanish
        ? 'No hay platos disponibles para tus preferencias. Aquí están nuestros especiales:'
        : 'No dishes available for your preferences. Here are our specials:';
    }
    return filtered.slice(0, 3);
  }
}

module.exports = GastronomyService;