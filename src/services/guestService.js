class GuestService {
  static guests = {};
  static guestCounter = 0;

  static detectLanguage(phone) {
    // Si el teléfono es de Colombia (57...), usar español
    if (phone.includes('57')) {
      return 'ES';
    }
    return 'EN';
  }

  static getGuestByPhone(phone) {
    return Object.values(this.guests).find(guest => guest.phone === phone);
  }

  static createGuest(phone) {
    this.guestCounter++;
    const guest = {
      id: this.guestCounter,
      phone: phone,
      name: null,
      language: this.detectLanguage(phone),
      trip_type: null,
      dietary_preferences: null,
      created_at: new Date()
    };
    this.guests[guest.id] = guest;
    return guest;
  }

  static updateGuest(id, updates) {
    if (this.guests[id]) {
      this.guests[id] = { ...this.guests[id], ...updates };
      return this.guests[id];
    }
    return null;
  }

  static getGuestById(id) {
    return this.guests[id] || null;
  }

  static getAllGuests() {
    return Object.values(this.guests);
  }
}

module.exports = GuestService;