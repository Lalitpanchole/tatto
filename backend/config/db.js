import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Create MySQL connection pool
const db = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'tattooplatz_db',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Auto-create database & tables in XAMPP if they do not exist
export const checkDbConnection = async () => {
  try {
    const dbName = process.env.DB_NAME || 'tattooplatz_db';

    // 1. Ensure database exists in XAMPP
    const tempConn = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      port: process.env.DB_PORT || 3306
    });

    await tempConn.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    await tempConn.end();

    const connection = await db.getConnection();
    console.log(`🟢 XAMPP MySQL Database '${dbName}' connected & initialized successfully!`);

    // 2. Auto-create tables in XAMPP
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        role ENUM('artist', 'admin') NOT NULL DEFAULT 'artist',
        phone VARCHAR(30),
        instagram VARCHAR(100),
        bio TEXT,
        status ENUM('Active', 'Blocked') DEFAULT 'Active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    try {
      await db.query('ALTER TABLE users ADD COLUMN bio TEXT');
    } catch (e) {
      // Column already exists
    }

    await db.query(`
      CREATE TABLE IF NOT EXISTS stations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        station_number INT NOT NULL UNIQUE,
        name VARCHAR(50) NOT NULL,
        location VARCHAR(50) DEFAULT 'Zurich',
        is_active BOOLEAN DEFAULT TRUE
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        station_id INT NOT NULL,
        booking_date DATE NOT NULL,
        start_hour INT NOT NULL,
        end_hour INT NOT NULL,
        total_price DECIMAL(10, 2) NOT NULL,
        status ENUM('Confirmed', 'Cancelled', 'Blocked') DEFAULT 'Confirmed',
        location VARCHAR(50) DEFAULT 'Zurich',
        reminder_sent BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_booking_slot (booking_date, station_id, status)
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS inquiries (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) NOT NULL,
        message TEXT NOT NULL,
        submitted_date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS manager_settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        opening_days JSON,
        operating_hours JSON,
        pricing JSON,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Seed Stations 1 to 4
    await db.query(`
      INSERT INTO stations (station_number, name, location) VALUES 
      (1, 'Station 1', 'Zurich'),
      (2, 'Station 2', 'Zurich'),
      (3, 'Station 3', 'Zurich'),
      (4, 'Station 4', 'Zurich')
      ON DUPLICATE KEY UPDATE name=VALUES(name)
    `);

    connection.release();
  } catch (error) {
    console.error('🔴 MySQL Database initialization failed:', error.message);
  }
};

export default db;

