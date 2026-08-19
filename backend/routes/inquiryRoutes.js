import express from 'express';
import { submitInquiry, getInquiries, deleteInquiry, replyInquiry } from '../controllers/inquiryController.js';
import { protect, adminOnly } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public contact form submission
router.post('/', submitInquiry);

// Admin protected routes
router.get('/', protect, adminOnly, getInquiries);
router.delete('/:id', protect, adminOnly, deleteInquiry);
router.post('/:id/reply', protect, adminOnly, replyInquiry);

export default router;
