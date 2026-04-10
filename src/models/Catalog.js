class Catalog {
  constructor() {
    this.categories = {};
    this.products = {};
    this.categoryCounter = 0;
    this.productCounter = 0;
  }

  /**
   * Crear categoría de catálogo
   */
  createCategory(name, description, icon = null) {
    this.categoryCounter++;
    const category = {
      id: this.categoryCounter,
      name: name,
      description: description,
      icon: icon,
      products: [],
      created_at: new Date()
    };
    this.categories[category.id] = category;
    return category;
  }

  /**
   * Crear producto en el catálogo
   */
  createProduct(categoryId, name, description, price, image_url = null, availability = true) {
    this.productCounter++;
    const product = {
      id: this.productCounter,
      categoryId: categoryId,
      name: name,
      description: description,
      price: price,
      image_url: image_url,
      availability: availability,
      created_at: new Date()
    };
    this.products[product.id] = product;
    
    // Agregar a categoría
    if (this.categories[categoryId]) {
      this.categories[categoryId].products.push(product.id);
    }
    
    return product;
  }

  /**
   * Obtener todas las categorías
   */
  getAllCategories() {
    return Object.values(this.categories);
  }

  /**
   * Obtener productos de una categoría
   */
  getProductsByCategory(categoryId) {
    const category = this.categories[categoryId];
    if (!category) return [];
    
    return category.products.map(productId => this.products[productId]);
  }

  /**
   * Obtener producto por ID
   */
  getProductById(productId) {
    return this.products[productId] || null;
  }

  /**
   * Obtener categoría por ID
   */
  getCategoryById(categoryId) {
    return this.categories[categoryId] || null;
  }

  /**
   * Exportar catálogo en formato para Meta
   */
  exportForMeta() {
    return {
      categories: Object.values(this.categories),
      products: Object.values(this.products),
      total_categories: Object.keys(this.categories).length,
      total_products: Object.keys(this.products).length
    };
  }

  /**
   * Obtener catálogo formateado para WhatsApp
   */
  getFormattedCatalog(language = 'ES') {
    const categories = Object.values(this.categories);
    let formatted = language === 'ES' 
      ? '📋 CATÁLOGO DE SERVICIOS\n\n' 
      : '📋 SERVICES CATALOG\n\n';

    categories.forEach(category => {
      formatted += `${category.icon} ${category.name}\n`;
      const products = this.getProductsByCategory(category.id);
      products.forEach(product => {
        formatted += `   • ${product.name}: $${product.price}\n`;
      });
      formatted += '\n';
    });

    return formatted;
  }
}

module.exports = Catalog;