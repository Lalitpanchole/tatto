import express from 'express';
import { registerArtist, loginUser, getMe, updateProfile, seedAdmins, requestOTP, verifyOTP, resetPasswordOTP, changePassword, getAdminTeam, addAdminMember, removeAdminMember, resetAdminPassword, getAllArtists } from '../controllers/authController.js';
import { protect, adminOnly } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Authentication Routes
router.post('/register', registerArtist);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.get('/artists', getAllArtists);

// Password Management & OTP Routes
router.post('/forgot-password', requestOTP);
router.post('/verify-otp', verifyOTP);
router.post('/reset-password', resetPasswordOTP);
router.post('/change-password', protect, changePassword);

// Seed all studio admin team accounts (run once)
router.post('/seed-admins', protect, adminOnly, seedAdmins);

// Admin Team Management Routes (Protected — Admin only)
router.get('/admin-team', protect, adminOnly, getAdminTeam);
router.post('/admin-team', protect, adminOnly, addAdminMember);
router.delete('/admin-team/:id', protect, adminOnly, removeAdminMember);
router.post('/admin-team/:id/reset-password', protect, adminOnly, resetAdminPassword);

export default router;

