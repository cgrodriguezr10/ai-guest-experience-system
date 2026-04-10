const Database = require('../config/database');

class CatalogDatabaseService {
  /**
   * Guardar categoría en BD
   */
  static async saveCategory(categoryData) {
    try {
      const result = await Database.query(
        `INSERT INTO catalog_categories (name, description, icon, hotel_id) 
         VALUES ($1, $2, $3, $4) 
         RETURNING *`,
        [categoryData.name, categoryData.description, categoryData.icon, categoryData.hotel_id || 1]
      );
      console.log(`📂 Category saved: ${categoryData.name}`);
      return result.rows[0];
    } catch (error) {
      console.error('Error saving category:', error);
      return null;
    }
  }

  /**
   * Guardar producto en BD
   */
  static async saveProduct(productData) {
    try {
      const result = await Database.query(
        `INSERT INTO catalog_products (category_id, name, description, price, image_url, availability, hotel_id) 
         VALUES ($1, $2, $3, $4, $5, $6, $7) 
         RETURNING *`,
        [
          productData.category_id,
          productData.name,
          productData.description,
          productData.price,
          productData.image_url || null,
          productData.availability !== false,
          productData.hotel_id || 1
        ]
      );
      console.log(`🛍️ Product saved: ${productData.name}`);
      return result.rows[0];
    } catch (error) {
      console.error('Error saving product:', error);
      return null;
    }
  }

  /**
   * Obtener todas las categorías
   */
  static async getAllCategories(hotelId = 1) {
    try {
      const result = await Database.query(
        'SELECT * FROM catalog_categories WHERE hotel_id = $1 ORDER BY id',
        [hotelId]
      );
      return result.rows;
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  }

  /**
   * Obtener productos de una categoría
   */
  static async getProductsByCategory(categoryId) {
    try {
      const result = await Database.query(
        'SELECT * FROM catalog_products WHERE category_id = $1 AND availability = true ORDER BY name',
        [categoryId]
      );
      return result.rows;
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  }

  /**
   * Obtener producto por ID
   */
  static async getProductById(productId) {
    try {
      const result = await Database.query(
        'SELECT * FROM catalog_products WHERE id = $1',
        [productId]
      );
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error fetching product:', error);
      return null;
    }
  }

  /**
   * Buscar productos por nombre
   */
  static async searchProducts(query, hotelId = 1) {
    try {
      const result = await Database.query(
        `SELECT * FROM catalog_products 
         WHERE hotel_id = $1 
         AND (name ILIKE $2 OR description ILIKE $2)
         AND availability = true
         ORDER BY name`,
        [hotelId, `%${query}%`]
      );
      return result.rows;
    } catch (error) {
      console.error('Error searching products:', error);
      return [];
    }
  }

  /**
   * Crear orden de producto
   */
  static async createOrder(orderData) {
    try {
      const confirmationCode = this.generateConfirmationCode();
      
      const result = await Database.query(
        `INSERT INTO catalog_orders (guest_id, product_id, quantity, price, notes, status, confirmation_code) 
         VALUES ($1, $2, $3, $4, $5, $6, $7) 
         RETURNING *`,
        [
          orderData.guest_id,
          orderData.product_id,
          orderData.quantity || 1,
          orderData.price,
          orderData.notes || null,
          'pending',
          confirmationCode
        ]
      );
      
      console.log(`📦 Order created: ${confirmationCode}`);
      return result.rows[0];
    } catch (error) {
      console.error('Error creating order:', error);
      return null;
    }
  }

  /**
   * Confirmar orden
   */
  static async confirmOrder(orderId) {
    try {
      const result = await Database.query(
        `UPDATE catalog_orders SET status = 'confirmed' WHERE id = $1 RETURNING *`,
        [orderId]
      );
      
      console.log(`✅ Order confirmed: ${orderId}`);
      return result.rows[0];
    } catch (error) {
      console.error('Error confirming order:', error);
      return null;
    }
  }

  /**
   * Obtener órdenes de un huésped
   */
  static async getGuestOrders(guestId) {
    try {
      const result = await Database.query(
        `SELECT co.*, cp.name as product_name, cp.description 
         FROM catalog_orders co
         JOIN catalog_products cp ON co.product_id = cp.id
         WHERE co.guest_id = $1
         ORDER BY co.created_at DESC`,
        [guestId]
      );
      return result.rows;
    } catch (error) {
      console.error('Error fetching guest orders:', error);
      return [];
    }
  }

  /**
   * Obtener catálogo formateado para WhatsApp
   */
  static async getFormattedCatalog(hotelId = 1, language = 'ES') {
    try {
      const categories = await this.getAllCategories(hotelId);
      
      let formatted = language === 'ES' 
        ? '📋 CATÁLOGO DE SERVICIOS\n\n' 
        : '📋 SERVICES CATALOG\n\n';

      for (const category of categories) {
        const products = await this.getProductsByCategory(category.id);
        formatted += `${category.icon} ${category.name}\n`;
        products.forEach(product => {
          formatted += `   • ${product.name}: $${product.price}\n`;
        });
        formatted += '\n';
      }

      return formatted;
    } catch (error) {
      console.error('Error getting formatted catalog:', error);
      return '';
    }
  }

  /**
   * Generar código de confirmación
   */
  static generateConfirmationCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }
}

module.exports = CatalogDatabaseService;