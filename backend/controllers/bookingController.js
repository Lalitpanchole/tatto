import BookingModel from '../models/bookingModel.js';
import UserModel from '../models/userModel.js';
import db from '../config/db.js';
import { sendConfirmationEmail } from '../services/email.service.js';

// @desc    Calculate free spots per day for chosen session duration
// @route   GET /api/bookings/availability
// @access  Public
export const getAvailability = async (req, res) => {
  try {
    const { date, duration = 3 } = req.query;
    if (!date) {
      return res.status(400).json({ message: 'Date parameter is required' });
    }

    const durationNum = parseInt(duration);
    const openingHour = 10;
    const closingHour = 18;
    const maxClosing = Math.max(closingHour, openingHour + durationNum);
    const stationsCount = 4;

    const cleanDate = typeof date === 'string' ? date.split('T')[0].split(' ')[0] : date;
    // Fetch all active bookings for this date
    const [activeBookings] = await db.query(
      `SELECT station_id, start_hour, end_hour FROM bookings WHERE DATE(booking_date) = DATE(?) AND status != 'Cancelled'`,
      [cleanDate]
    );

    let totalAvailableSpots = 0;

    for (let s = 1; s <= stationsCount; s++) {
      let isStationAvailable = false;
      for (let start = openingHour; start <= maxClosing - durationNum; start++) {
        const end = start + durationNum;
        const hasOverlap = activeBookings.some(b =>
          Number(b.station_id) === s &&
          ((start >= Number(b.start_hour) && start < Number(b.end_hour)) ||
           (end > Number(b.start_hour) && end <= Number(b.end_hour)) ||
           (start <= Number(b.start_hour) && end >= Number(b.end_hour)))
        );
        if (!hasOverlap) {
          isStationAvailable = true;
          break;
        }
      }
      if (isStationAvailable) totalAvailableSpots++;
    }

    res.json({ date, duration: durationNum, availableSpots: totalAvailableSpots });
  } catch (error) {
    console.error('Availability Calculation Error:', error);
    res.status(500).json({ message: 'Error checking availability', error: error.message });
  }
};

// @desc    Create new station booking reservation
// @route   POST /api/bookings
// @access  Private (Artist)
export const createBooking = async (req, res) => {
  try {
    const { stationId, bookingDate, startHour, endHour, totalPrice, location = 'Zurich' } = req.body;
    const userId = req.user.id;

    if (!stationId || !bookingDate || startHour === undefined || endHour === undefined || !totalPrice) {
      return res.status(400).json({ message: 'Please provide all required booking details' });
    }

    // Smart Station Allocation: Check overlap and fallback to any available station (1 to 4)
    let assignedStationId = Number(stationId);
    let isOverlap = await BookingModel.checkSlotOverlap(assignedStationId, bookingDate, startHour, endHour);

    if (isOverlap) {
      let foundFreeStation = null;
      for (let s = 1; s <= 4; s++) {
        const check = await BookingModel.checkSlotOverlap(s, bookingDate, startHour, endHour);
        if (!check) {
          foundFreeStation = s;
          break;
        }
      }
      if (foundFreeStation) {
        assignedStationId = foundFreeStation;
        isOverlap = false;
      }
    }

    if (isOverlap) {
      return res.status(400).json({ message: 'All 4 workstations are fully booked for this time slot. Please select another slot.' });
    }

    const bookingId = await BookingModel.create({
      userId,
      stationId: assignedStationId,
      bookingDate,
      startHour,
      endHour,
      totalPrice,
      location,
      status: 'Confirmed'
    });

    // Send confirmation email (Non-blocking)
    try {
      const user = await UserModel.findById(userId);
      if (user && user.email) {
        await sendConfirmationEmail({
          customerName: user.name,
          customerEmail: user.email,
          artistName: user.name, // In a co-working space, the artist is the customer
          sessionDate: bookingDate,
          sessionTime: `${startHour}:00 - ${endHour}:00`,
          bookingReference: `BKG-${bookingId}`,
          selectedServices: `Station ${stationId} at ${location}`
        });
      }
    } catch (emailError) {
      console.error('Failed to send confirmation email. Booking created successfully.', emailError);
    }

    res.status(201).json({
      message: 'Station reservation confirmed successfully',
      bookingId,
      details: { id: bookingId, userId, stationId, bookingDate, startHour, endHour, totalPrice, status: 'Confirmed' }
    });
  } catch (error) {
    console.error('Booking Creation Error:', error);
    res.status(500).json({ message: 'Error processing booking reservation' });
  }
};

// @desc    Get logged in artist's personal bookings
// @route   GET /api/bookings/my-bookings
// @access  Private (Artist)
export const getMyBookings = async (req, res) => {
  try {
    const bookings = await BookingModel.getByUserId(req.user.id);
    res.json({ bookings });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching personal bookings' });
  }
};

// @desc    Get master bookings log (Admin view)
// @route   GET /api/bookings/admin/all
// @access  Private (Admin)
export const getAdminBookings = async (req, res) => {
  try {
    const { location } = req.query;
    const bookings = await BookingModel.getAll(location);
    res.json({ bookings });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching master admin bookings log' });
  }
};

// @desc    Cancel a booking
// @route   PATCH /api/bookings/:id/cancel
// @access  Private
export const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const success = await BookingModel.updateStatus(id, 'Cancelled');
    res.json({ message: 'Booking reservation status updated successfully', success: true });
  } catch (error) {
    res.status(500).json({ message: 'Error cancelling booking reservation' });
  }
};

// @desc    Reschedule a booking reservation
// @route   PUT /api/bookings/:id/reschedule
// @access  Private
export const rescheduleBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { bookingDate, startHour, endHour, totalPrice } = req.body;

    if (!bookingDate || startHour === undefined || endHour === undefined) {
      return res.status(400).json({ message: 'Please provide new date and time slot details' });
    }

    const success = await BookingModel.reschedule(id, { bookingDate, startHour, endHour, totalPrice });
    res.json({ message: 'Booking reservation rescheduled successfully in database', success: true });
  } catch (error) {
    console.error('Reschedule Error:', error);
    res.status(500).json({ message: 'Error rescheduling booking reservation' });
  }
};

// @desc    Block out station slot for studio maintenance (Admin)
// @route   POST /api/bookings/admin/block
// @access  Private (Admin)
export const blockStationSlot = async (req, res) => {
  try {
    const { stationId, bookingDate, startHour, endHour, location = 'Zurich' } = req.body;
    const blockId = await BookingModel.create({
      userId: null,
      stationId,
      bookingDate,
      startHour,
      endHour,
      totalPrice: 0,
      location,
      status: 'Blocked'
    });
    res.status(201).json({ message: 'Station slot blocked out successfully', blockId });
  } catch (error) {
    res.status(500).json({ message: 'Error blocking workstation slot' });
  }
};

// @desc    Create new booking from public website (No Auth Required)
// @route   POST /api/bookings/public
// @access  Public
export const createPublicBooking = async (req, res) => {
  try {
    const { artist, email, phone, instagram, date, start, end, station, price, location = 'Zurich' } = req.body;

    if (!station || !date || start === undefined || end === undefined || !price || !artist || !email) {
      return res.status(400).json({ message: 'Please provide all required booking details including name and email' });
    }

    // Smart Station Allocation: Check overlap and fallback to any available station (1 to 4)
    let assignedStationId = Number(station);
    let isOverlap = await BookingModel.checkSlotOverlap(assignedStationId, date, start, end);

    if (isOverlap) {
      let foundFreeStation = null;
      for (let s = 1; s <= 4; s++) {
        const check = await BookingModel.checkSlotOverlap(s, date, start, end);
        if (!check) {
          foundFreeStation = s;
          break;
        }
      }
      if (foundFreeStation) {
        assignedStationId = foundFreeStation;
        isOverlap = false;
      }
    }

    if (isOverlap) {
      return res.status(400).json({ message: 'All 4 workstations are fully booked for this time slot. Please select another slot.' });
    }

    // Find or create user
    let user = await UserModel.findByEmail(email);
    let userId;

    if (user) {
      userId = user.id;
    } else {
      // Create guest user
      userId = await UserModel.createArtist({
        name: artist,
        email: email,
        passwordHash: 'guest_account_no_login',
        phone: phone || '',
        instagram: instagram || ''
      });
      user = { id: userId, name: artist, email: email };
    }

    const bookingId = await BookingModel.create({
      userId,
      stationId: assignedStationId,
      bookingDate: date,
      startHour: start,
      endHour: end,
      totalPrice: price,
      location,
      status: 'Confirmed'
    });

    // Send confirmation email (Non-blocking)
    try {
      await sendConfirmationEmail({
        customerName: user.name,
        customerEmail: user.email,
        artistName: user.name,
        sessionDate: date,
        sessionTime: `${start}:00 - ${end}:00`,
        bookingReference: `BKG-${bookingId}`,
        selectedServices: `Station ${station} at ${location}`
      });
    } catch (emailError) {
      console.error('Failed to send public confirmation email.', emailError);
    }

    res.status(201).json({
      message: 'Public reservation confirmed successfully',
      bookingId,
      details: { id: bookingId, userId, stationId: station, bookingDate: date, startHour: start, endHour: end, totalPrice: price, status: 'Confirmed' }
    });
  } catch (error) {
    console.error('Public Booking Creation Error:', error);
    res.status(500).json({ message: 'Error creating public booking reservation', error: error.message });
  }
};
