const { Pool } = require('pg');

class Database {
  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    });
  }

  async initialize() {
    try {
      // Test connection
      const result = await this.pool.query('SELECT NOW()');
      console.log('✅ Connected to PostgreSQL');

      // Create tables
      await this.createTables();
      return true;
    } catch (error) {
      console.error('❌ Database connection error:', error.message);
      throw error;
    }
  }

  async createTables() {
    const tables = [
      // Hotels table
      `CREATE TABLE IF NOT EXISTS hotels (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        city VARCHAR(100),
        country VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,

      // Guests table
      `CREATE TABLE IF NOT EXISTS guests (
        id SERIAL PRIMARY KEY,
        phone VARCHAR(20) UNIQUE NOT NULL,
        name VARCHAR(255),
        email VARCHAR(255),
        language VARCHAR(10) DEFAULT 'ES',
        hotel_id INT REFERENCES hotels(id),
        onboarding_step VARCHAR(50),
        preferences JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,

      // Interactions table
      `CREATE TABLE IF NOT EXISTS interactions (
        id SERIAL PRIMARY KEY,
        guest_id INT REFERENCES guests(id),
        message_type VARCHAR(50),
        message_text TEXT,
        response_text TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,

      // Catalog categories
      `CREATE TABLE IF NOT EXISTS catalog_categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        emoji VARCHAR(10),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,

      // Catalog products
      `CREATE TABLE IF NOT EXISTS catalog_products (
        id SERIAL PRIMARY KEY,
        category_id INT REFERENCES catalog_categories(id),
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10, 2),
        available BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,

      // Catalog orders
      `CREATE TABLE IF NOT EXISTS catalog_orders (
        id SERIAL PRIMARY KEY,
        guest_id INT REFERENCES guests(id),
        product_id INT REFERENCES catalog_products(id),
        quantity INT DEFAULT 1,
        confirmation_code VARCHAR(50),
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,

      // Rooms table
      `CREATE TABLE IF NOT EXISTS rooms (
        id SERIAL PRIMARY KEY,
        room_number VARCHAR(10) NOT NULL,
        room_type VARCHAR(50),
        capacity INT,
        price_per_night DECIMAL(10, 2),
        available BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,

      // Room reservations
      `CREATE TABLE IF NOT EXISTS room_reservations (
        id SERIAL PRIMARY KEY,
        guest_id INT REFERENCES guests(id),
        room_id INT REFERENCES rooms(id),
        check_in DATE NOT NULL,
        check_out DATE NOT NULL,
        confirmation_code VARCHAR(50),
        payment_link VARCHAR(500),
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,

      // Reception orders
      `CREATE TABLE IF NOT EXISTS reception_orders (
        id SERIAL PRIMARY KEY,
        guest_id INT REFERENCES guests(id),
        order_type VARCHAR(50),
        description TEXT,
        priority VARCHAR(20) DEFAULT 'normal',
        status VARCHAR(50) DEFAULT 'pending',
        assigned_to VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`
    ];

    for (const table of tables) {
      try {
        await this.pool.query(table);
      } catch (error) {
        console.error('Table creation error:', error.message);
      }
    }

    console.log('✅ All tables created/verified');
  }

  async query(text, params) {
    try {
      const result = await this.pool.query(text, params);
      return result;
    } catch (error) {
      console.error('Query error:', error);
      throw error;
    }
  }

  async close() {
    await this.pool.end();
  }

  async resetDatabase() {
    try {
      const connection = await this.pool.connect();
      await connection.query('DROP TABLE IF EXISTS room_reservations CASCADE');
      await connection.query('DROP TABLE IF EXISTS rooms CASCADE');
      await connection.query('DROP TABLE IF EXISTS catalog_orders CASCADE');
      await connection.query('DROP TABLE IF EXISTS catalog_products CASCADE');
      await connection.query('DROP TABLE IF EXISTS catalog_categories CASCADE');
      await connection.query('DROP TABLE IF EXISTS reception_orders CASCADE');
      await connection.query('DROP TABLE IF EXISTS interactions CASCADE');
      await connection.query('DROP TABLE IF EXISTS guests CASCADE');
      await connection.query('DROP TABLE IF EXISTS hotels CASCADE');
      connection.release();
      await this.createTables();
      console.log('✅ Database reset');
    } catch (error) {
      console.error('Database reset error:', error.message);
    }
  }
}

module.exports = Database;