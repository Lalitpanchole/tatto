# 03 - MySQL Database Schema & ER Architecture

## 1. Database Specifications
- **Database Engine:** MySQL 8.0+
- **ORM / Query Builder:** Prisma / Sequelize / Knex
- **Transaction Locking:** Row-level locking / ACID transactions to prevent concurrent double-booking of workstations.

---

## 2. Relational Entity Tables

### 2.1 Table: `users`
Stores all registered artists and studio administrators.
```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('artist', 'admin') NOT NULL DEFAULT 'artist',
  phone VARCHAR(30),
  instagram VARCHAR(100),
  status ENUM('Active', 'Blocked') DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 2.2 Table: `stations`
Stores bookable workstations (default 4 stations).
```sql
CREATE TABLE stations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  station_number INT NOT NULL UNIQUE,
  name VARCHAR(50) NOT NULL,
  location VARCHAR(50) DEFAULT 'Zurich',
  is_active BOOLEAN DEFAULT TRUE
);
```

### 2.3 Table: `bookings`
Stores station rental reservations.
```sql
CREATE TABLE bookings (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  station_id INT NOT NULL,
  booking_date DATE NOT NULL,
  start_hour INT NOT NULL, -- e.g., 11 for 11:00
  end_hour INT NOT NULL,   -- e.g., 15 for 15:00
  total_price DECIMAL(10, 2) NOT NULL,
  status ENUM('Confirmed', 'Cancelled', 'Blocked') DEFAULT 'Confirmed',
  location VARCHAR(50) DEFAULT 'Zurich',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (station_id) REFERENCES stations(id) ON DELETE CASCADE,
  INDEX idx_booking_slot (booking_date, station_id, status)
);
```

### 2.4 Table: `compliance_docs`
Stores official studio hygiene and legal records managed by admin.
```sql
CREATE TABLE compliance_docs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  doc_type VARCHAR(100) NOT NULL, -- e.g., 'Swiss Hygiene Declaration'
  file_name VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  file_type VARCHAR(50),
  status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Approved',
  uploaded_by_admin_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (uploaded_by_admin_id) REFERENCES users(id) ON DELETE SET NULL
);
```

### 2.5 Table: `inquiries`
Stores contact form message submissions from website footer.
```sql
CREATE TABLE inquiries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL,
  message TEXT NOT NULL,
  submitted_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```
