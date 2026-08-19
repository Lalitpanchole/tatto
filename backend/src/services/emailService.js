import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 465),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

const verifyEmailConnection = async () => {
  try {
    await transporter.verify();
    console.log("✅ Hostinger SMTP connected successfully");
  } catch (error) {
    console.error("❌ Hostinger SMTP connection failed:", error.message);
  }
};

const sendEmail = async ({
  to,
  subject,
  text,
  html,
  replyTo,
}) => {
  if (!to) {
    throw new Error("Recipient email address is required");
  }

  try {
    const result = await transporter.sendMail({
      from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM_ADDRESS}>`,
      to,
      subject,
      text,
      html,
      replyTo: replyTo || process.env.EMAIL_FROM_ADDRESS,
    });

    console.log("✅ Email sent:", result.messageId);

    return {
      success: true,
      messageId: result.messageId,
    };
  } catch (error) {
    console.error("❌ Email sending failed:", error.message);
    throw error;
  }
};

export {
  transporter,
  verifyEmailConnection,
  sendEmail,
};
