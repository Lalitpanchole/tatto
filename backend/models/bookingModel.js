import db from '../config/db.js';

export const BookingModel = {
  // Check if station has overlap for specific date & hours
  checkSlotOverlap: async (stationId, bookingDate, startHour, endHour) => {
    const cleanDate = typeof bookingDate === 'string' ? bookingDate.split('T')[0].split(' ')[0] : bookingDate;
    const [rows] = await db.query(
      `SELECT * FROM bookings 
       WHERE station_id = ? 
         AND DATE(booking_date) = DATE(?) 
         AND status != 'Cancelled'
         AND ((start_hour <= ? AND end_hour > ?) OR (start_hour < ? AND end_hour >= ?) OR (start_hour >= ? AND end_hour <= ?))`,
      [stationId, cleanDate, startHour, startHour, endHour, endHour, startHour, endHour]
    );
    return rows.length > 0;
  },

  // Create new booking reservation
  create: async ({ userId, stationId, bookingDate, startHour, endHour, totalPrice, location = 'Zurich', status = 'Confirmed' }) => {
    const cleanDate = typeof bookingDate === 'string' ? bookingDate.split('T')[0].split(' ')[0] : bookingDate;
    const [result] = await db.query(
      `INSERT INTO bookings (user_id, station_id, booking_date, start_hour, end_hour, total_price, status, location)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, stationId, cleanDate, startHour, endHour, totalPrice, status, location]
    );
    return result.insertId;
  },

  // Get bookings by artist ID
  getByUserId: async (userId) => {
    const [rows] = await db.query(
      `SELECT b.id, b.user_id, b.station_id, DATE_FORMAT(b.booking_date, '%Y-%m-%d') AS booking_date, b.start_hour, b.end_hour, b.total_price, b.status, b.location, b.reminder_sent, b.created_at, s.station_number, s.name as station_name 
       FROM bookings b 
       JOIN stations s ON b.station_id = s.id 
       WHERE b.user_id = ? 
       ORDER BY b.booking_date DESC, b.start_hour ASC`,
      [userId]
    );
    return rows;
  },

  // Get master bookings log for Admin Dashboard
  getAll: async (location = null) => {
    let query = `
      SELECT b.id, b.user_id, b.station_id, DATE_FORMAT(b.booking_date, '%Y-%m-%d') AS booking_date, b.start_hour, b.end_hour, b.total_price, b.status, b.location, b.reminder_sent, b.created_at, s.station_number, u.name as artist_name, u.email as artist_email, u.phone as artist_phone, u.instagram as artist_instagram
      FROM bookings b
      JOIN stations s ON b.station_id = s.id
      LEFT JOIN users u ON b.user_id = u.id

    `;
    const params = [];
    if (location) {
      query += ` WHERE b.location = ?`;
      params.push(location);
    }
    query += ` ORDER BY b.booking_date DESC, b.start_hour ASC`;
    const [rows] = await db.query(query, params);
    return rows;
  },

  // Update booking status (e.g. Cancelled)
  updateStatus: async (id, status) => {
    const [result] = await db.query('UPDATE bookings SET status = ? WHERE id = ?', [status, id]);
    return result.affectedRows > 0;
  }
};

export default BookingModel;
