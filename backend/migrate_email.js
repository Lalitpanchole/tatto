import db from './config/db.js';

async function run() {
  try {
    await db.query('ALTER TABLE bookings ADD COLUMN reminder_sent BOOLEAN DEFAULT FALSE;');
    console.log('Successfully added reminder_sent column to bookings table!');
    process.exit(0);
  } catch (e) {
    if (e.code === 'ER_DUP_FIELDNAME') {
      console.log('Column reminder_sent already exists, skipping.');
      process.exit(0);
    } else {
      console.error('Error adding column:', e);
      process.exit(1);
    }
  }
}

run();
