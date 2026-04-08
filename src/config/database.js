const environment = require('./environment');

let db = null;

const initializeDatabase = async () => {
  if (db) return db;

  try {
    // Mock database para desarrollo
    console.log('✅ Database initialized (Mock mode - for development)');
    
    db = {
      connected: true,
      type: 'mock'
    };

    return db;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    throw error;
  }
};

// Mock queries - para desarrollo sin necesidad de base de datos real
const query = async (sql, params = []) => {
  console.log(`📝 Query: ${sql}`);
  return [];
};

const queryOne = async (sql, params = []) => {
  console.log(`📝 Query: ${sql}`);
  return null;
};

const execute = async (sql, params = []) => {
  console.log(`📝 Execute: ${sql}`);
  return { success: true };
};

module.exports = {
  initializeDatabase,
  query,
  queryOne,
  execute,
};
