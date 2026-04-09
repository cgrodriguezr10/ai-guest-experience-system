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
        phone VARCHAR(20) UNIQUE NOT NULL,
        hotel_id INT REFERENCES hotels(id),
        name VARCHAR(255),
        language VARCHAR(10),
        room_number VARCHAR(50),
        trip_type VARCHAR(100),
        companion VARCHAR(100),
        dietary_preferences VARCHAR(255),
        interests TEXT,
        onboarding_completed BOOLEAN DEFAULT FALSE,
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

      // Tabla de reservas
      `CREATE TABLE IF NOT EXISTS reservations (
        id SERIAL PRIMARY KEY,
        guest_id INT REFERENCES guests(id),
        hotel_id INT REFERENCES hotels(id),
        reservation_type VARCHAR(100),
        details JSONB,
        status VARCHAR(50),
        confirmation_code VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
      await pool.query('DROP TABLE IF EXISTS reservations CASCADE');
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