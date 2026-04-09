class Database {
  static initialized = false;

  static initialize() {
    if (this.initialized) {
      return;
    }

    console.log('📊 Initializing database...');
    
    // Mock database initialization
    this.data = {
      hotels: [],
      guests: [],
      interactions: []
    };

    this.initialized = true;
    console.log('✅ Database initialized (Mock mode - for development)');
    console.log('✅ Database connected');

    return this.data;
  }

  static getData() {
    return this.data;
  }

  static reset() {
    this.data = {
      hotels: [],
      guests: [],
      interactions: []
    };
  }
}

module.exports = Database;