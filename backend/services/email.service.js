import { Resend } from 'resend';
import dotenv from 'dotenv';
dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendConfirmationEmail = async (bookingDetails) => {
  const { customerName, customerEmail, artistName, sessionDate, sessionTime, bookingReference, selectedServices } = bookingDetails;
  
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'noreply@tattooplatz.ch';
  const fromName = process.env.EMAIL_FROM_NAME || 'Tattooplatz';
  const adminEmail = process.env.SMTP_USER || 'noreply@tattooplatz.ch';

  const customerHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
      <h2 style="color: #333;">Booking Confirmation</h2>
      <p>Hi ${customerName},</p>
      <p>Your session has been successfully booked. Here are your booking details:</p>
      <ul>
        <li><strong>Artist Name:</strong> ${artistName || 'Not specified'}</li>
        <li><strong>Session Date:</strong> ${sessionDate}</li>
        <li><strong>Session Time:</strong> ${sessionTime}</li>
        ${bookingReference ? `<li><strong>Booking Reference:</strong> ${bookingReference}</li>` : ''}
        ${selectedServices ? `<li><strong>Selected Services:</strong> ${selectedServices}</li>` : ''}
      </ul>
      <p>We look forward to seeing you!</p>
      <br/>
      <p>Best regards,</p>
      <p>Tattooplatz Zürich Team</p>
    </div>
  `;

  const adminHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
      <h2 style="color: #333;">New Booking Received!</h2>
      <p>A new booking has just been completed. Details are below:</p>
      <ul>
        <li><strong>Customer Name:</strong> ${customerName}</li>
        <li><strong>Customer Email:</strong> ${customerEmail}</li>
        <li><strong>Artist Name:</strong> ${artistName || 'Not specified'}</li>
        <li><strong>Session Date:</strong> ${sessionDate}</li>
        <li><strong>Session Time:</strong> ${sessionTime}</li>
        ${bookingReference ? `<li><strong>Booking Reference:</strong> ${bookingReference}</li>` : ''}
        ${selectedServices ? `<li><strong>Selected Services:</strong> ${selectedServices}</li>` : ''}
      </ul>
    </div>
  `;

  try {
    // 1. Send email to customer
    await resend.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to: customerEmail,
      subject: 'Booking Confirmation – Your Session Has Been Successfully Booked',
      html: customerHtml,
    });
    console.log('Confirmation email sent successfully to customer');

    // 2. Send email to admin
    await resend.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to: adminEmail,
      subject: `New Booking Alert: ${customerName}`,
      html: adminHtml,
    });
    console.log('Admin notification email sent successfully');
    
    return true;
  } catch (error) {
    console.error('Error sending confirmation/admin emails via Resend:', error);
    return false;
  }
};

export const sendReminderEmail = async (bookingDetails) => {
  const { customerName, customerEmail, sessionDate, sessionTime } = bookingDetails;
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'noreply@tattooplatz.ch';
  const fromName = process.env.EMAIL_FROM_NAME || 'Tattooplatz';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
      <p>Hello ${customerName},</p>
      <p>This is a friendly reminder that your session at Tattooplatz Zurich is coming up in 7 days.</p>
      <p>Booking Details:</p>
      <ul>
        <li>Date: ${sessionDate}</li>
        <li>Time: ${sessionTime}</li>
      </ul>
      <p>If you need to cancel or reschedule your session, please let us know as soon as possible. If you have any questions, feel free to contact us at hello@tattooplatz.ch or via Instagram @tattooplatz_zurich.</p>
      <p>Please remember to bring your own equipment and materials.</p>
      <p>We look forward to seeing you!</p>
      <p>Best regards,<br>The Tattooplatz Team</p>
    </div>
  `;

  try {
    await resend.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to: customerEmail,
      subject: 'Reminder: Your Tattooplatz Session is in 7 Days',
      html,
    });
    console.log('Reminder email sent successfully');
    return true;
  } catch (error) {
    console.error('Error sending reminder email:', error);
    return false;
  }
};

export const sendTodayReminderEmail = async (bookingDetails) => {
  const { customerName, customerEmail, sessionTime } = bookingDetails;
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'noreply@tattooplatz.ch';
  const fromName = process.env.EMAIL_FROM_NAME || 'Tattooplatz';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
      <p>Hello ${customerName},</p>
      <p>This is a quick reminder that your session at Tattooplatz Zurich is <strong>TODAY</strong>.</p>
      <p><strong>Your Session Time:</strong> ${sessionTime}</p>
      <p>Please let us know as soon as possible if you need to cancel or reschedule your session, or if you have any questions.</p>
      <p>Please remember to bring your own equipment and materials.</p>
      <p>We look forward to seeing you!</p>
      <p>Best regards,<br>The Tattooplatz Team</p>
    </div>
  `;

  try {
    await resend.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to: customerEmail,
      subject: 'Reminder: Your Tattooplatz Session is TODAY',
      html,
    });
    console.log('Today reminder email sent successfully');
    return true;
  } catch (error) {
    console.error('Error sending today reminder email:', error);
    return false;
  }
};

export const send1DayReminderEmail = async (bookingDetails) => {
  const { customerName, customerEmail, sessionDate, sessionTime } = bookingDetails;
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'noreply@tattooplatz.ch';
  const fromName = process.env.EMAIL_FROM_NAME || 'Tattooplatz';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
      <p>Hello ${customerName},</p>
      <p>This is a friendly reminder that your session at Tattooplatz Zurich is tomorrow.</p>
      <p>Booking Details:</p>
      <ul>
        <li>Date: ${sessionDate}</li>
        <li>Time: ${sessionTime}</li>
      </ul>
      <p>If you need to cancel or reschedule your session, please let us know as soon as possible. If you have any questions, feel free to contact us at hello@tattooplatz.ch or via Instagram @tattooplatz_zurich.</p>
      <p>Please remember to bring your own equipment and materials.</p>
      <p>We look forward to seeing you!</p>
      <p>Best regards,<br>The Tattooplatz Team</p>
    </div>
  `;

  try {
    await resend.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to: customerEmail,
      subject: 'Reminder: Your Tattooplatz Session is in 1 Day',
      html,
    });
    console.log('1-Day reminder email sent successfully');
    return true;
  } catch (error) {
    console.error('Error sending 1-Day reminder email:', error);
    return false;
  }
};

export const sendOTPEmail = async (recipientEmail, otpCode) => {
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'noreply@tattooplatz.ch';
  const fromName = process.env.EMAIL_FROM_NAME || 'Tattooplatz';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #e4e4e7; border-radius: 12px; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="color: #000000; margin: 0; font-size: 20px; font-weight: 800; letter-spacing: 1px;">TATTOOPLATZ ZÜRICH</h2>
        <p style="color: #71717a; font-size: 12px; text-transform: uppercase; letter-spacing: 1.5px; margin-top: 4px;">Security & Password Reset</p>
      </div>

      <div style="background-color: #fafafa; border: 1px solid #f4f4f5; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 20px;">
        <p style="color: #3f3f46; font-size: 13px; margin-top: 0;">Use the following 6-digit OTP verification code to reset your account password. This code is valid for 15 minutes.</p>
        <div style="font-size: 32px; font-weight: 900; letter-spacing: 6px; color: #ff66c4; margin: 16px 0; font-family: monospace;">
          ${otpCode}
        </div>
      </div>

      <p style="color: #a1a1aa; font-size: 11px; text-align: center; margin: 0;">
        If you did not request a password reset, please ignore this email or contact studio administration.
      </p>
    </div>
  `;

  try {
    await resend.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to: recipientEmail,
      subject: `[Tattooplatz] Password Reset Verification Code: ${otpCode}`,
      html,
    });
    console.log(`OTP Email sent successfully to ${recipientEmail}`);
    return true;
  } catch (error) {
    console.error('Error sending OTP email via Resend:', error.message);
    return false;
  }
};

