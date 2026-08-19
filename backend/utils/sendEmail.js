import nodemailer from 'nodemailer';

export const sendEmail = async ({ to, subject, html, text }) => {
  try {
    let transporter;

    // Check if real SMTP settings exist in .env
    if (process.env.SMTP_HOST && process.env.SMTP_USER) {
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    } else {
      // Automatic fallback: Use Ethereal Test Account for instant local email verification
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    }

    const mailOptions = {
      from: `"Tattooplatz Zurich" <${process.env.SMTP_FROM || 'info@tattooplatz.ch'}>`,
      to,
      subject,
      text: text || html.replace(/<[^>]*>?/gm, ''),
      html,
    };

    const info = await transporter.sendMail(mailOptions);

    let previewUrl = null;
    if (nodemailer.getTestMessageUrl(info)) {
      previewUrl = nodemailer.getTestMessageUrl(info);
      console.log('📧 Ethereal Test Email Delivered! Preview Link:', previewUrl);
    } else {
      console.log('📧 Real Email Sent via SMTP successfully to:', to);
    }

    return { success: true, messageId: info.messageId, previewUrl };
  } catch (error) {
    console.error('🔴 Nodemailer Email Sending Error:', error.message);
    throw error;
  }
};

export default sendEmail;
