-- ============================================
-- SCHEMA: AI GUEST EXPERIENCE SYSTEM
-- ============================================

-- ============================================
-- TABLE: HOTELS
-- ============================================
CREATE TABLE IF NOT EXISTS hotels (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  language_default VARCHAR(2) DEFAULT 'ES',
  timezone VARCHAR(50) DEFAULT 'America/Bogota',
  logo_url TEXT,
  description TEXT,
  country VARCHAR(100),
  city VARCHAR(100),
  address TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================
-- TABLE: GUESTS
-- ============================================
CREATE TABLE IF NOT EXISTS guests (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  hotel_id INTEGER NOT NULL,
  whatsapp_number VARCHAR(20) NOT NULL UNIQUE,
  name VARCHAR(255),
  language VARCHAR(2) DEFAULT 'EN',
  trip_type VARCHAR(50),
  dietary_preferences JSON,
  interests JSON,
  check_in_date DATE,
  check_out_date DATE,
  room_number VARCHAR(10),
  onboarding_completed BOOLEAN DEFAULT FALSE,
  profile_completed BOOLEAN DEFAULT FALSE,
  last_interaction_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (hotel_id) REFERENCES hotels(id),
  UNIQUE KEY unique_guest_per_hotel (hotel_id, whatsapp_number)
);

-- ============================================
-- TABLE: INTERACTIONS
-- ============================================
CREATE TABLE IF NOT EXISTS interactions (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  guest_id INTEGER NOT NULL,
  message_type VARCHAR(50),
  incoming_message TEXT,
  outgoing_message TEXT,
  sentiment VARCHAR(20),
  tokens_used INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (guest_id) REFERENCES guests(id)
);

-- ============================================
-- TABLE: EXPERIENCES
-- ============================================
CREATE TABLE IF NOT EXISTS experiences (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  hotel_id INTEGER NOT NULL,
  name_en VARCHAR(255),
  name_es VARCHAR(255),
  description_en TEXT,
  description_es TEXT,
  category VARCHAR(50),
  duration_minutes INTEGER,
  price_usd DECIMAL(10, 2),
  image_url TEXT,
  rating DECIMAL(3, 2),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (hotel_id) REFERENCES hotels(id)
);

-- ============================================
-- TABLE: GASTRONOMY
-- ============================================
CREATE TABLE IF NOT EXISTS gastronomy (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  hotel_id INTEGER NOT NULL,
  name_en VARCHAR(255),
  name_es VARCHAR(255),
  description_en TEXT,
  description_es TEXT,
  ingredients JSON,
  dietary_tags JSON,
  image_url TEXT,
  category VARCHAR(50),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (hotel_id) REFERENCES hotels(id)
);

-- ============================================
-- INDICES
-- ============================================
CREATE INDEX idx_guests_hotel_id ON guests(hotel_id);
CREATE INDEX idx_guests_whatsapp ON guests(whatsapp_number);
CREATE INDEX idx_interactions_guest_id ON interactions(guest_id);
CREATE INDEX idx_interactions_created_at ON interactions(created_at);
CREATE INDEX idx_experiences_hotel_id ON experiences(hotel_id);
CREATE INDEX idx_gastronomy_hotel_id ON gastronomy(hotel_id);

-- ============================================
-- SAMPLE DATA: HOTELS
-- ============================================
INSERT IGNORE INTO hotels (id, name, language_default, timezone, description, city, country)
VALUES (
  1,
  'The Plaza Hotel',
  'ES',
  'America/Bogota',
  'Luxury hotel in the heart of Bogotá',
  'Bogotá',
  'Colombia'
);
