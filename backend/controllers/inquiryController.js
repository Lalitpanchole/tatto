import InquiryModel from '../models/inquiryModel.js';
import sendEmail from '../utils/sendEmail.js';

// @desc    Submit dark banner newsletter / footer contact inquiry
// @route   POST /api/inquiries
// @access  Public
export const submitInquiry = async (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Please provide your email address' });
    }

    const submittedDate = new Date().toISOString().split('T')[0];
    const inquiryId = await InquiryModel.create({
      name: name || 'Newsletter Subscriber',
      email,
      message: message || 'Subscribed to dark banner newsletter',
      submittedDate
    });

    res.status(201).json({ message: 'Thank you! We will write you back.', inquiryId });
  } catch (error) {
    console.error('Inquiry Submission Error:', error);
    res.status(500).json({ message: 'Error submitting inquiry message' });
  }
};

// @desc    Get all customer inquiries (Admin view)
// @route   GET /api/inquiries
// @access  Private (Admin)
export const getInquiries = async (req, res) => {
  try {
    const inquiries = await InquiryModel.getAll();
    res.json({ inquiries });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching customer inquiries' });
  }
};

// @desc    Delete an inquiry
// @route   DELETE /api/inquiries/:id
// @access  Private (Admin)
export const deleteInquiry = async (req, res) => {
  try {
    const { id } = req.params;
    const success = await InquiryModel.delete(id);
    if (!success) {
      return res.status(404).json({ message: 'Inquiry message not found' });
    }
    res.json({ message: 'Inquiry message removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting inquiry message' });
  }
};

// @desc    Send email reply to customer inquiry (Admin)
// @route   POST /api/inquiries/:id/reply
// @access  Private (Admin)
export const replyInquiry = async (req, res) => {
  try {
    const { email, subject, message } = req.body;
    if (!email || !subject || !message) {
      return res.status(400).json({ message: 'Please provide recipient email, subject, and message text' });
    }

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #111; color: #fff; border-radius: 10px;">
        <h2 style="color: #FF66C4; margin-bottom: 5px;">TATTOOPLATZ ZÜRICH</h2>
        <p style="color: #888; font-size: 14px; margin-top: 0;">Co-Working Studio Response</p>
        <hr style="border-color: #333;" />
        <div style="font-size: 16px; line-height: 1.6; white-space: pre-wrap; margin: 20px 0;">${message}</div>
        <hr style="border-color: #333;" />
        <p style="color: #888; font-size: 12px;">Tattooplatz Zürich | Baslerstrasse, Zürich | info@tattooplatz.ch</p>
      </div>
    `;

    const result = await sendEmail({
      to: email,
      subject,
      html: htmlContent,
      text: message
    });

    res.json({
      message: 'Email reply sent successfully!',
      previewUrl: result.previewUrl
    });
  } catch (error) {
    console.error('Email Reply Error:', error);
    res.status(500).json({ message: 'Failed to send email reply', error: error.message });
  }
};
