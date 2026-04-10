/**
 * PMS SIMULATOR SERVICE
 * 
 * Simula la conexión a un Property Management System real
 * Aquí se conectará a Opera, Fidelio, u otro PMS en producción
 * 
 * ESTRUCTURA LISTA PARA CONECTAR A API REAL DEL PMS
 */

class PMSSimulatorService {
  constructor() {
    this.rooms = this.initializeRooms();
    this.pmsConnected = false;
    console.log('📡 PMS Simulator initialized (simulating real PMS)');
  }

  /**
   * Inicializar habitaciones simuladas (ESTRUCTURA DE DATOS REAL)
   * En producción, estos datos vendrían del PMS real
   */
  initializeRooms() {
    return {
      101: {
        id: 1,
        room_number: '101',
        room_type: 'Standard',
        description: 'Comfortable room with city view',
        price_per_night: 80,
        max_guests: 2,
        amenities: ['WiFi', 'AC', 'TV', 'Bathroom'],
        pms_id: 'PMS-STD-001', // ID en el PMS real
        status: 'available',
        bookings: [] // Array de reservas
      },
      102: {
        id: 2,
        room_number: '102',
        room_type: 'Standard',
        description: 'Comfortable room with city view',
        price_per_night: 80,
        max_guests: 2,
        amenities: ['WiFi', 'AC', 'TV', 'Bathroom'],
        pms_id: 'PMS-STD-002',
        status: 'available',
        bookings: []
      },
      103: {
        id: 3,
        room_number: '103',
        room_type: 'Deluxe',
        description: 'Spacious room with balcony and premium amenities',
        price_per_night: 120,
        max_guests: 2,
        amenities: ['WiFi', 'AC', 'TV', 'Bathroom', 'Balcony', 'Minibar'],
        pms_id: 'PMS-DLX-001',
        status: 'available',
        bookings: []
      },
      104: {
        id: 4,
        room_number: '104',
        room_type: 'Deluxe',
        description: 'Spacious room with balcony and premium amenities',
        price_per_night: 120,
        max_guests: 2,
        amenities: ['WiFi', 'AC', 'TV', 'Bathroom', 'Balcony', 'Minibar'],
        pms_id: 'PMS-DLX-002',
        status: 'available',
        bookings: []
      },
      105: {
        id: 5,
        room_number: '105',
        room_type: 'Suite Deluxe',
        description: 'Luxury suite with separate living area and premium services',
        price_per_night: 180,
        max_guests: 4,
        amenities: ['WiFi', 'AC', 'TV', 'Bathroom', 'Living Area', 'Jacuzzi', 'Minibar', 'Safe'],
        pms_id: 'PMS-SUP-001',
        status: 'available',
        bookings: []
      },
      106: {
        id: 6,
        room_number: '106',
        room_type: 'Suite Deluxe',
        description: 'Luxury suite with separate living area and premium services',
        price_per_night: 180,
        max_guests: 4,
        amenities: ['WiFi', 'AC', 'TV', 'Bathroom', 'Living Area', 'Jacuzzi', 'Minibar', 'Safe'],
        pms_id: 'PMS-SUP-002',
        status: 'available',
        bookings: []
      },
      107: {
        id: 7,
        room_number: '107',
        room_type: 'Standard',
        description: 'Comfortable room with city view',
        price_per_night: 80,
        max_guests: 2,
        amenities: ['WiFi', 'AC', 'TV', 'Bathroom'],
        pms_id: 'PMS-STD-003',
        status: 'available',
        bookings: []
      },
      108: {
        id: 8,
        room_number: '108',
        room_type: 'Deluxe',
        description: 'Spacious room with balcony and premium amenities',
        price_per_night: 120,
        max_guests: 2,
        amenities: ['WiFi', 'AC', 'TV', 'Bathroom', 'Balcony', 'Minibar'],
        pms_id: 'PMS-DLX-003',
        status: 'available',
        bookings: []
      },
      109: {
        id: 9,
        room_number: '109',
        room_type: 'Suite Deluxe',
        description: 'Luxury suite with separate living area and premium services',
        price_per_night: 180,
        max_guests: 4,
        amenities: ['WiFi', 'AC', 'TV', 'Bathroom', 'Living Area', 'Jacuzzi', 'Minibar', 'Safe'],
        pms_id: 'PMS-SUP-003',
        status: 'available',
        bookings: []
      },
      110: {
        id: 10,
        room_number: '110',
        room_type: 'Standard',
        description: 'Comfortable room with city view',
        price_per_night: 80,
        max_guests: 2,
        amenities: ['WiFi', 'AC', 'TV', 'Bathroom'],
        pms_id: 'PMS-STD-004',
        status: 'available',
        bookings: []
      }
    };
  }

  /**
   * CONECTAR A PMS REAL (estructura lista)
   * En producción, reemplazar con llamada a API real
   */
  async connectToRealPMS() {
    try {
      // EJEMPLO: Conexión a Opera PMS
      // const response = await axios.get('https://pms.hotel.com/api/rooms', {
      //   headers: { Authorization: `Bearer ${process.env.PMS_API_KEY}` }
      // });
      // this.rooms = response.data;
      
      console.log('✅ Connected to PMS (Simulated)');
      this.pmsConnected = true;
      return true;
    } catch (error) {
      console.error('❌ Error connecting to PMS:', error);
      this.pmsConnected = false;
      return false;
    }
  }

  /**
   * Obtener disponibilidad en fecha específica
   * LLAMADA AL PMS REAL EN PRODUCCIÓN
   */
  async checkAvailability(checkInDate, checkOutDate) {
    try {
      const availableRooms = [];
      const checkIn = new Date(checkInDate);
      const checkOut = new Date(checkOutDate);

      for (const [roomNumber, room] of Object.entries(this.rooms)) {
        // Verificar si hay conflicto de reservas
        const hasConflict = room.bookings.some(booking => {
          const bookingCheckIn = new Date(booking.check_in);
          const bookingCheckOut = new Date(booking.check_out);
          return (checkIn < bookingCheckOut && checkOut > bookingCheckIn);
        });

        if (!hasConflict && room.status === 'available') {
          const numberOfNights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
          availableRooms.push({
            ...room,
            numberOfNights: numberOfNights,
            totalPrice: room.price_per_night * numberOfNights
          });
        }
      }

      console.log(`✅ Found ${availableRooms.length} available rooms`);
      return availableRooms;
    } catch (error) {
      console.error('Error checking availability:', error);
      return [];
    }
  }

  /**
   * Obtener detalles de una habitación
   */
  getRoomDetails(roomNumber) {
    const room = this.rooms[roomNumber];
    if (!room) {
      return null;
    }
    return room;
  }

  /**
   * Obtener todas las habitaciones
   */
  getAllRooms() {
    return Object.values(this.rooms);
  }

  /**
   * Crear reserva en PMS (simula llamada a PMS real)
   * EN PRODUCCIÓN: Envía a API del PMS
   */
  async createReservationInPMS(roomNumber, checkInDate, checkOutDate, guestData) {
    try {
      const room = this.rooms[roomNumber];
      
      if (!room) {
        return { success: false, message: 'Room not found' };
      }

      // Simular creación en PMS
      const reservation = {
        pms_reservation_id: `PMS-RES-${Date.now()}`,
        room_number: roomNumber,
        check_in: checkInDate,
        check_out: checkOutDate,
        guest_name: guestData.name,
        guest_email: guestData.email,
        guest_phone: guestData.phone,
        status: 'pending_payment',
        created_at: new Date()
      };

      // Guardar en simulación
      room.bookings.push(reservation);

      console.log(`✅ Reservation created in PMS: ${reservation.pms_reservation_id}`);

      return {
        success: true,
        reservation: reservation,
        message: 'Reservation created successfully'
      };
    } catch (error) {
      console.error('Error creating reservation in PMS:', error);
      return { success: false, message: error.message };
    }
  }

  /**
   * Cancelar reserva en PMS
   */
  async cancelReservationInPMS(pmsReservationId) {
    try {
      for (const [roomNumber, room] of Object.entries(this.rooms)) {
        const bookingIndex = room.bookings.findIndex(b => b.pms_reservation_id === pmsReservationId);
        if (bookingIndex !== -1) {
          room.bookings.splice(bookingIndex, 1);
          console.log(`✅ Reservation cancelled in PMS: ${pmsReservationId}`);
          return { success: true, message: 'Reservation cancelled' };
        }
      }
      return { success: false, message: 'Reservation not found' };
    } catch (error) {
      console.error('Error cancelling reservation:', error);
      return { success: false, message: error.message };
    }
  }

  /**
   * Obtener estado de habitación EN TIEMPO REAL (desde PMS)
   */
  async getRoomStatusRealTime(roomNumber) {
    try {
      // EN PRODUCCIÓN: Llamar a API del PMS
      // const status = await axios.get(`https://pms.hotel.com/api/rooms/${roomNumber}/status`);
      
      const room = this.rooms[roomNumber];
      if (!room) return null;

      return {
        room_number: roomNumber,
        status: room.status,
        available: room.bookings.length === 0,
        current_guest: room.bookings.length > 0 ? room.bookings[0].guest_name : null,
        check_out_today: this.hasCheckOutToday(room)
      };
    } catch (error) {
      console.error('Error getting room status:', error);
      return null;
    }
  }

  /**
   * Verificar si hay check-out hoy
   */
  hasCheckOutToday(room) {
    const today = new Date().toDateString();
    return room.bookings.some(booking => 
      new Date(booking.check_out).toDateString() === today
    );
  }

  /**
   * Obtener precio de habitación en fecha específica
   * (En producción, incluir tarifas dinámicas)
   */
  getRoomPrice(roomNumber, checkInDate) {
    const room = this.rooms[roomNumber];
    if (!room) return null;

    // EN PRODUCCIÓN: Implementar tarifas dinámicas
    // const dynamicPrice = await getPricingRules(checkInDate);
    
    return {
      room_number: roomNumber,
      base_price: room.price_per_night,
      final_price: room.price_per_night, // Sin descuentos por ahora
      currency: 'USD'
    };
  }
}

module.exports = new PMSSimulatorService();