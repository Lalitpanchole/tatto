import 'dotenv/config';
import { sendConfirmationEmail } from './services/email.service.js';

async function testBookingEmail() {
  console.log("Simulating bookingController.js email sending...");
  
  // Simulated data from controller
  const user = { name: 'Test User', email: 'pancholelalit52@gmail.com' };
  const bookingDate = '2026-08-01';
  const startHour = 10;
  const endHour = 12;
  const bookingId = 12345;
  const stationId = 1;
  const location = 'Zurich';

  try {
    const success = await sendConfirmationEmail({
      customerName: user.name,
      customerEmail: user.email,
      artistName: user.name, // In a co-working space, the artist is the customer
      sessionDate: bookingDate,
      sessionTime: `${startHour}:00 - ${endHour}:00`,
      bookingReference: `BKG-${bookingId}`,
      selectedServices: `Station ${stationId} at ${location}`
    });
    
    console.log("Simulation finished. Success:", success);
  } catch (err) {
    console.error("Simulation error:", err);
  }
}

testBookingEmail();
