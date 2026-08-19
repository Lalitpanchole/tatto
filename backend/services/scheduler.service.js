import cron from 'node-cron';
import db from '../config/db.js';
import { sendReminderEmail, send1DayReminderEmail, sendTodayReminderEmail } from './email.service.js';

export const startScheduler = () => {
  // Run everyday at 08:00 AM (server time)
  cron.schedule('0 8 * * *', async () => {
    console.log('[Scheduler] Running daily reminder check...');
    try {
      // 1. Send 7-day reminders
      const query7Day = `
        SELECT b.*, u.name as customer_name, u.email as customer_email
        FROM bookings b
        JOIN users u ON b.user_id = u.id
        WHERE b.booking_date = DATE_ADD(CURDATE(), INTERVAL 7 DAY)
          AND b.reminder_sent = FALSE
          AND b.status != 'Cancelled'
      `;
      const [bookings7Day] = await db.query(query7Day);

      if (bookings7Day.length > 0) {
        console.log(`[Scheduler] Found ${bookings7Day.length} 7-day reminders to send.`);
        for (const booking of bookings7Day) {
          const success = await sendReminderEmail({
            customerName: booking.customer_name,
            customerEmail: booking.customer_email,
            sessionDate: booking.booking_date.toISOString().split('T')[0],
            sessionTime: `${booking.start_hour}:00 - ${booking.end_hour}:00`,
          });
          if (success) {
            await db.query('UPDATE bookings SET reminder_sent = TRUE WHERE id = ?', [booking.id]);
            console.log(`[Scheduler] 7-day reminder sent and updated for booking ID: ${booking.id}`);
          }
        }
      } else {
        console.log('[Scheduler] No 7-day reminders to send today.');
      }

      // 2. Send 1-day (Tomorrow) reminders
      const query1Day = `
        SELECT b.*, u.name as customer_name, u.email as customer_email
        FROM bookings b
        JOIN users u ON b.user_id = u.id
        WHERE b.booking_date = DATE_ADD(CURDATE(), INTERVAL 1 DAY)
          AND b.status != 'Cancelled'
      `;
      const [bookings1Day] = await db.query(query1Day);

      if (bookings1Day.length > 0) {
        console.log(`[Scheduler] Found ${bookings1Day.length} 1-day reminders to send.`);
        for (const booking of bookings1Day) {
          await send1DayReminderEmail({
            customerName: booking.customer_name,
            customerEmail: booking.customer_email,
            sessionDate: booking.booking_date.toISOString().split('T')[0],
            sessionTime: `${booking.start_hour}:00 - ${booking.end_hour}:00`,
          });
          console.log(`[Scheduler] 1-day reminder sent for booking ID: ${booking.id}`);
        }
      } else {
        console.log('[Scheduler] No 1-day reminders to send today.');
      }

      // 3. Send Today reminders
      const queryToday = `
        SELECT b.*, u.name as customer_name, u.email as customer_email
        FROM bookings b
        JOIN users u ON b.user_id = u.id
        WHERE b.booking_date = CURDATE()
          AND b.status != 'Cancelled'
      `;
      const [bookingsToday] = await db.query(queryToday);

      if (bookingsToday.length > 0) {
        console.log(`[Scheduler] Found ${bookingsToday.length} TODAY reminders to send.`);
        for (const booking of bookingsToday) {
          await sendTodayReminderEmail({
            customerName: booking.customer_name,
            customerEmail: booking.customer_email,
            sessionTime: `${booking.start_hour}:00 - ${booking.end_hour}:00`,
          });
          console.log(`[Scheduler] Today reminder sent for booking ID: ${booking.id}`);
        }
      } else {
        console.log('[Scheduler] No TODAY reminders to send.');
      }

    } catch (error) {
      console.error('[Scheduler] Error running reminder cron job:', error);
    }
  });

  console.log('Scheduler initialized: Reminder job scheduled for 08:00 AM daily.');
};
