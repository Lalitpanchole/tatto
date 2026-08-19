import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import db, { checkDbConnection } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import inquiryRoutes from './routes/inquiryRoutes.js';
import managerSettingsRoutes from './routes/managerSettingsRoutes.js';
import printfulRoutes from './routes/printful.routes.js';
import { startScheduler } from './services/scheduler.service.js';
import { verifyEmailConnection, sendEmail } from './src/services/emailService.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.set('etag', false); // Disable ETag to ensure 200 OK instead of 304 Not Modified in DevTools
app.use(cors());
app.use(express.json());

// Prevent response caching on API endpoints
app.use('/api', (req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  next();
});

// Seed Default Admin & Artist Accounts helper
const seedDefaultUsers = async () => {
  try {
    // 0. Ensure bio column exists in users table
    try {
      await db.query('ALTER TABLE users ADD COLUMN bio TEXT AFTER instagram');
      console.log('📝 Added bio column to users table in MySQL');
    } catch (e) {
      // Column bio already exists in MySQL DB
    }

    // 1. Seed Admin
    const [adminRows] = await db.query('SELECT * FROM users WHERE LOWER(email) = "chris@tattooplatz.ch"');
    if (adminRows.length === 0) {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash('admin123', salt);
      await db.query(
        'INSERT INTO users (name, email, password_hash, role, status, phone, instagram) VALUES (?, ?, ?, ?, ?, ?, ?)',
        ['Chris (Studio Manager)', 'chris@tattooplatz.ch', passwordHash, 'admin', 'Active', '+41 44 123 45 67', '@tattooplatz_zurich']
      );
      console.log('👑 Default Studio Admin created: chris@tattooplatz.ch / admin123');
    } else {
      // Ensure admin name is synced to Chris
      if (adminRows[0].name !== 'Chris') {
        await db.query('UPDATE users SET name = "Chris" WHERE LOWER(email) = "chris@tattooplatz.ch"');
        console.log('👑 Synced admin name to Chris for chris@tattooplatz.ch');
      }
      // Ensure admin password hash matches admin123 if not valid
      const isMatch = await bcrypt.compare('admin123', adminRows[0].password_hash);
      if (!isMatch) {
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash('admin123', salt);
        await db.query('UPDATE users SET password_hash = ? WHERE LOWER(email) = "chris@tattooplatz.ch"', [passwordHash]);
        console.log('👑 Synced admin password to admin123 for chris@tattooplatz.ch');
      }
    }


    // 2. Seed Default Artists (Only if no artist users exist in DB)
    const [artistCountRows] = await db.query('SELECT COUNT(*) AS cnt FROM users WHERE role = "artist"');
    const artistCount = artistCountRows[0]?.cnt || 0;

    if (artistCount === 0) {
      const defaultArtists = [
        { name: 'Joao Otereze', email: 'artist@tattooplatz.ch', pass: 'artist123', phone: '+41 79 123 45 67', ig: '@artist_instagram' },
        { name: 'Marco V.', email: 'marco.v@gmail.com', pass: 'marco2026', phone: '+41 78 234 56 78', ig: '@marco_tats' },
        { name: 'Alina R.', email: 'alina.r@gmail.com', pass: 'alina2026', phone: '+41 77 345 67 89', ig: '@alina_ink' },
        { name: 'Jonas K.', email: 'jonas.k@tattooplatz.ch', pass: 'jonas2026', phone: '+41 76 456 78 90', ig: '@jonas_tattoos' },
        { name: 'Sofia M.', email: 'sofia.m@gmail.com', pass: 'sofia2026', phone: '+41 75 567 89 01', ig: '@sofia_tattoos' },
        { name: 'RAM', email: 'ram@gmail.com', pass: '123456', phone: '+41 79 999 88 77', ig: '@asdfghj' }
      ];

      for (const artist of defaultArtists) {
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(artist.pass, salt);
        await db.query(
          'INSERT INTO users (name, email, password_hash, role, status, phone, instagram) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [artist.name, artist.email, passwordHash, 'artist', 'Active', artist.phone, artist.ig]
        );
        console.log(`🎨 Default Artist seeded into MySQL DB: ${artist.email}`);
      }
    }

    // Ensure RAM (ram@gmail.com) has active bookings seeded if none exist
    const [ramUser] = await db.query('SELECT id FROM users WHERE LOWER(email) = "ram@gmail.com"');
    if (ramUser.length > 0) {
      const [ramBookings] = await db.query('SELECT id FROM bookings WHERE user_id = ? AND status != "Cancelled"', [ramUser[0].id]);
      if (ramBookings.length === 0) {
        const todayStr = new Date().toISOString().split('T')[0];
        await db.query(
          'INSERT INTO bookings (user_id, station_id, booking_date, start_hour, end_hour, total_price, status, location) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [ramUser[0].id, 1, todayStr, 11, 15, 120, 'Confirmed', 'Zurich']
        );
        console.log('📅 Sample booking seeded for RAM (ram@gmail.com)');
      }
    }
  } catch (error) {
    console.error('User Seed Error:', error.message);
  }
};


// Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/inquiries', inquiryRoutes);
app.use('/api/manager/settings', managerSettingsRoutes);
app.use('/api/printful', printfulRoutes);

// Healthcheck Route
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Tattooplatz Backend API is running successfully!' });
});

// Start Server
app.listen(PORT, async () => {
  console.log(`🚀 Tattooplatz Server running on port ${PORT}`);
  await checkDbConnection();
  await verifyEmailConnection();
  await seedDefaultUsers();
  
  // Initialize email reminder scheduler
  startScheduler();
});

// Temporary test email function
const testHostingerEmail = async () => {
  try {
    await sendEmail({
      to: "your-gmail-address@gmail.com",
      subject: "Tattooplatz SMTP Test",
      text: "Hostinger SMTP integration is working successfully.",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>SMTP Integration Successful</h2>
          <p>This email was sent from the Tattooplatz Node.js backend.</p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Test email failed:", error);
  }
};

// Uncomment the line below to test sending an email when the server starts
// testHostingerEmail();
