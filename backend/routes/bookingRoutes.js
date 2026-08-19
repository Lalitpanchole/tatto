import express from 'express';
import { 
  getAvailability, 
  createBooking,
  createPublicBooking,
  getMyBookings, 
  getAdminBookings, 
  cancelBooking, 
  blockStationSlot 
} from '../controllers/bookingController.js';
import { protect, adminOnly } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public route for availability query
router.get('/availability', getAvailability);

// Public route for website booking
router.post('/public', createPublicBooking);

// Protected artist routes
router.post('/', protect, createBooking);
router.get('/my-bookings', protect, getMyBookings);
router.patch('/:id/cancel', protect, cancelBooking);

// Admin dashboard master log route (Live sync across browsers)
router.get('/admin/all', getAdminBookings);
router.post('/admin/block', protect, adminOnly, blockStationSlot);


export default router;
