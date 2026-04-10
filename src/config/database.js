const { Pool } = require('pg');
const environment = require('./environment');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/ai_guest_experience',
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

class Database {
  static initialized = false;

  static async initialize() {
    if (this.initialized) {
      return;
    }

    try {
      console.log('📊 Initializing PostgreSQL database...');
      
      // Test connection
      const client = await pool.connect();
      console.log('✅ Database connected');
      client.release();

      // Create tables
      await this.createTables();
      
      this.initialized = true;
      console.log('✅ Database initialized with tables');
    } catch (error) {
      console.error('❌ Database initialization error:', error.message);
      throw error;
    }
  }

  static async createTables() {
    const queries = [
      // Tabla de hoteles
      `CREATE TABLE IF NOT EXISTS hotels (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        city VARCHAR(255),
        country VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,

      // Tabla de huéspedes
      `CREATE TABLE IF NOT EXISTS guests (
        id SERIAL PRIMARY KEY,
        phone VARCHAR(50) UNIQUE NOT NULL,
        hotel_id INT REFERENCES hotels(id),
        name VARCHAR(255),
        language VARCHAR(10),
        room_number VARCHAR(50),
        trip_type VARCHAR(100),
        companion VARCHAR(100),
        dietary_preferences VARCHAR(255),
        interests TEXT,
        onboarding_completed BOOLEAN DEFAULT FALSE,
        waiting_for_language_change BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,

      // Tabla de interacciones
      `CREATE TABLE IF NOT EXISTS interactions (
        id SERIAL PRIMARY KEY,
        guest_id INT REFERENCES guests(id),
        incoming_message TEXT,
        outgoing_message TEXT,
        message_type VARCHAR(50),
        category VARCHAR(50),
        tokens_used INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,

      // Tabla de categorías de catálogo
      `CREATE TABLE IF NOT EXISTS catalog_categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        icon VARCHAR(50),
        hotel_id INT REFERENCES hotels(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,

      // Tabla de productos
      `CREATE TABLE IF NOT EXISTS catalog_products (
        id SERIAL PRIMARY KEY,
        category_id INT REFERENCES catalog_categories(id),
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10, 2),
        image_url TEXT,
        availability BOOLEAN DEFAULT TRUE,
        hotel_id INT REFERENCES hotels(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,

      // Tabla de reservas de servicios/productos
      `CREATE TABLE IF NOT EXISTS catalog_orders (
        id SERIAL PRIMARY KEY,
        guest_id INT REFERENCES guests(id),
        product_id INT REFERENCES catalog_products(id),
        quantity INT DEFAULT 1,
        price DECIMAL(10, 2),
        notes TEXT,
        status VARCHAR(50),
        confirmation_code VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,

      // Tabla de habitaciones (ROOMS)
      `CREATE TABLE IF NOT EXISTS rooms (
        id SERIAL PRIMARY KEY,
        room_number VARCHAR(10) UNIQUE NOT NULL,
        room_type VARCHAR(100) NOT NULL,
        description TEXT,
        price_per_night DECIMAL(10, 2),
        max_guests INT DEFAULT 2,
        amenities TEXT,
        hotel_id INT REFERENCES hotels(id),
        availability_status VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,

      // Tabla de reservas de habitaciones
      `CREATE TABLE IF NOT EXISTS room_reservations (
        id SERIAL PRIMARY KEY,
        guest_id INT REFERENCES guests(id),
        room_id INT REFERENCES rooms(id),
        check_in DATE NOT NULL,
        check_out DATE NOT NULL,
        number_of_nights INT,
        total_price DECIMAL(10, 2),
        status VARCHAR(50),
        confirmation_code VARCHAR(50),
        payment_status VARCHAR(50),
        payment_link TEXT,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,

      // ⭐ NUEVA: Tabla de órdenes de recepción
      `CREATE TABLE IF NOT EXISTS reception_orders (
        id SERIAL PRIMARY KEY,
        guest_id INT REFERENCES guests(id),
        order_type VARCHAR(100) NOT NULL,
        confirmation_code VARCHAR(50),
        title VARCHAR(255) NOT NULL,
        description TEXT,
        guest_name VARCHAR(255),
        guest_room VARCHAR(50),
        guest_phone VARCHAR(50),
        priority VARCHAR(50),
        status VARCHAR(50),
        assigned_to VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        started_at TIMESTAMP,
        completed_at TIMESTAMP
      )`
    ];

    for (const query of queries) {
      try {
        await pool.query(query);
      } catch (error) {
        console.log(`Table creation note: ${error.message}`);
      }
    }
  }

  static getPool() {
    return pool;
  }

  static async query(text, params) {
    try {
      const result = await pool.query(text, params);
      return result;
    } catch (error) {
      console.error('Database query error:', error.message);
      throw error;
    }
  }

  static async reset() {
    try {
      await pool.query('DROP TABLE IF EXISTS reception_orders CASCADE');
      await pool.query('DROP TABLE IF EXISTS room_reservations CASCADE');
      await pool.query('DROP TABLE IF EXISTS rooms CASCADE');
      await pool.query('DROP TABLE IF EXISTS catalog_orders CASCADE');
      await pool.query('DROP TABLE IF EXISTS catalog_products CASCADE');
      await pool.query('DROP TABLE IF EXISTS catalog_categories CASCADE');
      await pool.query('DROP TABLE IF EXISTS interactions CASCADE');
      await pool.query('DROP TABLE IF EXISTS guests CASCADE');
      await pool.query('DROP TABLE IF EXISTS hotels CASCADE');
      console.log('✅ Database reset');
    } catch (error) {
      console.error('Database reset error:', error.message);
    }
  }
}

module.exports = Database;