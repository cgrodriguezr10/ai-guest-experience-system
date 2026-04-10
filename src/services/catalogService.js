const Catalog = require('../models/Catalog');

class CatalogService {
  constructor() {
    this.catalog = new Catalog();
    this.initializeDefaultCatalog();
  }

  /**
   * Inicializar catálogo con datos por defecto
   */
  initializeDefaultCatalog() {
    // CATEGORÍA 1: RESTAURANTE
    const restaurantCat = this.catalog.createCategory(
      'Restaurante',
      'Delicious dishes from our kitchen',
      '🍽️'
    );

    // Productos del restaurante
    const dishes = [
      { name: 'Ajiaco Santafereño', description: 'Traditional Colombian soup', price: 12, image: null },
      { name: 'Bandeja Paisa', description: 'Complete Colombian plate', price: 18, image: null },
      { name: 'Ceviche', description: 'Fresh seafood ceviche', price: 16, image: null },
      { name: 'Empanadas', description: 'Crispy empanadas (3 units)', price: 5, image: null },
      { name: 'Sancocho', description: 'Hearty stew', price: 14, image: null },
      { name: 'Arepa', description: 'Traditional corn arepa', price: 4, image: null },
      { name: 'Grilled Fish', description: 'Fresh fish with coconut rice', price: 22, image: null },
      { name: 'Flan', description: 'Creamy dessert', price: 8, image: null },
      { name: 'Patacones', description: 'Fried plantains', price: 6, image: null },
      { name: 'Hot Chocolate with Cheese', description: 'Traditional hot beverage', price: 7, image: null }
    ];

    dishes.forEach(dish => {
      this.catalog.createProduct(
        restaurantCat.id,
        dish.name,
        dish.description,
        dish.price,
        dish.image
      );
    });

    // CATEGORÍA 2: SPA
    const spaCat = this.catalog.createCategory(
      'Spa & Wellness',
      'Relax and rejuvenate',
      '🧖‍♀️'
    );

    const spaServices = [
      { name: 'Swedish Massage', description: '60 minutes full body', price: 75, image: null },
      { name: 'Facial Treatment', description: 'Deep cleansing facial', price: 65, image: null },
      { name: 'Hot Stone Massage', description: '90 minutes therapeutic', price: 95, image: null },
      { name: 'Manicure & Pedicure', description: 'Complete nail care', price: 45, image: null },
      { name: 'Aromatherapy Session', description: '45 minutes relaxation', price: 55, image: null }
    ];

    spaServices.forEach(service => {
      this.catalog.createProduct(
        spaCat.id,
        service.name,
        service.description,
        service.price,
        service.image
      );
    });

    // CATEGORÍA 3: GYM
    const gymCat = this.catalog.createCategory(
      'Gym & Fitness',
      'Stay fit during your stay',
      '💪'
    );

    const gymServices = [
      { name: 'Personal Training', description: '1 hour session', price: 50, image: null },
      { name: 'Gym Membership', description: 'Daily access', price: 25, image: null },
      { name: 'Yoga Class', description: '60 minutes session', price: 35, image: null }
    ];

    gymServices.forEach(service => {
      this.catalog.createProduct(
        gymCat.id,
        service.name,
        service.description,
        service.price,
        service.image
      );
    });

    // CATEGORÍA 4: ACTIVIDADES
    const activitiesCat = this.catalog.createCategory(
      'Activities',
      'Explore Bogotá',
      '🎭'
    );

    const activities = [
      { name: 'Gold Museum', description: 'World-class museum', price: 18, image: null },
      { name: 'Monserrate Tour', description: 'Sacred mountain visit', price: 25, image: null },
      { name: 'La Candelaria Walking Tour', description: 'Historic district exploration', price: 30, image: null },
      { name: 'Botanical Garden', description: 'Beautiful gardens', price: 12, image: null },
      { name: 'Coffee Tour', description: 'Colombian coffee plantation', price: 65, image: null }
    ];

    activities.forEach(activity => {
      this.catalog.createProduct(
        activitiesCat.id,
        activity.name,
        activity.description,
        activity.price,
        activity.image
      );
    });

    console.log('✅ Default catalog initialized');
  }

  /**
   * Obtener todas las categorías
   */
  getAllCategories() {
    return this.catalog.getAllCategories();
  }

  /**
   * Obtener productos de una categoría
   */
  getProductsByCategory(categoryId) {
    return this.catalog.getProductsByCategory(categoryId);
  }

  /**
   * Obtener catálogo formateado
   */
  getFormattedCatalog(language = 'ES') {
    return this.catalog.getFormattedCatalog(language);
  }

  /**
   * Obtener producto por ID
   */
  getProductById(productId) {
    return this.catalog.getProductById(productId);
  }

  /**
   * Obtener catálogo para Meta
   */
  getCatalogForMeta() {
    return this.catalog.exportForMeta();
  }

  /**
   * Buscar productos por nombre
   */
  searchProducts(query, categoryId = null) {
    const queryLower = query.toLowerCase();
    let results = Object.values(this.catalog.products).filter(product => 
      product.name.toLowerCase().includes(queryLower) ||
      product.description.toLowerCase().includes(queryLower)
    );

    if (categoryId) {
      results = results.filter(product => product.categoryId === categoryId);
    }

    return results;
  }
}

// Exportar como singleton
module.exports = new CatalogService();