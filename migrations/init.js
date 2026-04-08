const path = require('path');
const fs = require('fs');
require('dotenv').config();

const environment = require('../src/config/environment');

const initDB = async () => {
  try {
    console.log('🚀 Initializing database...');
    console.log(`📍 Database Type: ${environment.DATABASE_TYPE}`);

    // Para desarrollo, simplemente creamos un archivo vacío
    // La base de datos se inicializará automáticamente cuando se necesite

    const dbPath = environment.DATABASE_URL.replace('sqlite:', '');
    
    // Verificar si la carpeta existe, si no crearla
    const dbDir = path.dirname(dbPath);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    // Crear el archivo de BD si no existe
    if (!fs.existsSync(dbPath)) {
      fs.writeFileSync(dbPath, '');
      console.log(`✅ Database file created at: ${dbPath}`);
    } else {
      console.log(`✅ Database file already exists at: ${dbPath}`);
    }

    console.log('📊 Database ready for use!');
    console.log('⚠️  Note: For production, use PostgreSQL instead of SQLite');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
};

initDB();
