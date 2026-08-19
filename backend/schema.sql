-- Tattooplatz Zürich MySQL Database Schema Script
-- Run this script in MySQL Workbench or phpMyAdmin to initialize tables.

CREATE DATABASE IF NOT EXISTS tattooplatz_db;
USE tattooplatz_db;

-- 1. Users Table (Admin & Artists)
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
);

-- 2. Stations Table
CREATE TABLE IF NOT EXISTS stations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  station_number INT NOT NULL UNIQUE,
  name VARCHAR(50) NOT NULL,
  location VARCHAR(50) DEFAULT 'Zurich',
  is_active BOOLEAN DEFAULT TRUE
);

-- 3. Bookings Table
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
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (station_id) REFERENCES stations(id) ON DELETE CASCADE,
  INDEX idx_booking_slot (booking_date, station_id, status)
);

-- 4. Compliance Documents Table (Managed by Admin) [COMMENTED OUT]
-- CREATE TABLE IF NOT EXISTS compliance_docs (
--   id INT AUTO_INCREMENT PRIMARY KEY,
--   doc_type VARCHAR(100) NOT NULL,
--   file_name VARCHAR(255) NOT NULL,
--   file_url TEXT NOT NULL,
--   file_type VARCHAR(50),
--   status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Approved',
--   uploaded_by_admin_id INT,
--   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--   FOREIGN KEY (uploaded_by_admin_id) REFERENCES users(id) ON DELETE SET NULL
-- );


-- 5. Customer Inquiries Table
CREATE TABLE IF NOT EXISTS inquiries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL,
  message TEXT NOT NULL,
  submitted_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed Initial Stations (Stations 1 to 4)
INSERT INTO stations (station_number, name, location) VALUES 
(1, 'Station 1', 'Zurich'),
(2, 'Station 2', 'Zurich'),
(3, 'Station 3', 'Zurich'),
(4, 'Station 4', 'Zurich')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 6. Manager Settings Table
CREATE TABLE IF NOT EXISTS manager_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  opening_days JSON,
  operating_hours JSON,
  pricing JSON,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
