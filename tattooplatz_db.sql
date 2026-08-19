-- Tattooplatz Studio Database Export
-- Generated: 2026-08-19T10:38:08.846Z

CREATE DATABASE IF NOT EXISTS `tattooplatz_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `tattooplatz_db`;

-- Table structure for `bookings`
DROP TABLE IF EXISTS `bookings`;
CREATE TABLE `bookings` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `station_id` int(11) NOT NULL,
  `booking_date` date NOT NULL,
  `start_hour` int(11) NOT NULL,
  `end_hour` int(11) NOT NULL,
  `total_price` decimal(10,2) NOT NULL,
  `status` enum('Confirmed','Cancelled','Blocked') DEFAULT 'Confirmed',
  `location` varchar(50) DEFAULT 'Zurich',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `reminder_sent` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `station_id` (`station_id`),
  KEY `idx_booking_slot` (`booking_date`,`station_id`,`status`),
  CONSTRAINT `bookings_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `bookings_ibfk_2` FOREIGN KEY (`station_id`) REFERENCES `stations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=95 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table `bookings`
INSERT INTO `bookings` (`id`, `user_id`, `station_id`, `booking_date`, `start_hour`, `end_hour`, `total_price`, `status`, `location`, `created_at`, `reminder_sent`) VALUES (32, 1, 1, '2026-07-03 18:30:00', 11, 17, '180.00', 'Cancelled', 'Zurich', '2026-07-03 06:00:30', 0);
INSERT INTO `bookings` (`id`, `user_id`, `station_id`, `booking_date`, `start_hour`, `end_hour`, `total_price`, `status`, `location`, `created_at`, `reminder_sent`) VALUES (33, 1, 1, '2026-07-04 18:30:00', 13, 17, '120.00', 'Cancelled', 'Zurich', '2026-07-03 06:01:23', 0);
INSERT INTO `bookings` (`id`, `user_id`, `station_id`, `booking_date`, `start_hour`, `end_hour`, `total_price`, `status`, `location`, `created_at`, `reminder_sent`) VALUES (34, NULL, 1, '2026-07-05 18:30:00', 10, 18, '0.00', 'Blocked', 'Zurich', '2026-07-03 06:26:16', 0);
INSERT INTO `bookings` (`id`, `user_id`, `station_id`, `booking_date`, `start_hour`, `end_hour`, `total_price`, `status`, `location`, `created_at`, `reminder_sent`) VALUES (35, NULL, 2, '2026-07-05 18:30:00', 10, 18, '0.00', 'Blocked', 'Zurich', '2026-07-03 06:26:16', 0);
INSERT INTO `bookings` (`id`, `user_id`, `station_id`, `booking_date`, `start_hour`, `end_hour`, `total_price`, `status`, `location`, `created_at`, `reminder_sent`) VALUES (36, NULL, 3, '2026-07-05 18:30:00', 10, 18, '0.00', 'Blocked', 'Zurich', '2026-07-03 06:26:16', 0);
INSERT INTO `bookings` (`id`, `user_id`, `station_id`, `booking_date`, `start_hour`, `end_hour`, `total_price`, `status`, `location`, `created_at`, `reminder_sent`) VALUES (37, NULL, 4, '2026-07-05 18:30:00', 10, 18, '0.00', 'Blocked', 'Zurich', '2026-07-03 06:26:16', 0);
INSERT INTO `bookings` (`id`, `user_id`, `station_id`, `booking_date`, `start_hour`, `end_hour`, `total_price`, `status`, `location`, `created_at`, `reminder_sent`) VALUES (38, NULL, 1, '2026-07-07 18:30:00', 10, 18, '0.00', 'Blocked', 'Zurich', '2026-07-03 06:27:50', 0);
INSERT INTO `bookings` (`id`, `user_id`, `station_id`, `booking_date`, `start_hour`, `end_hour`, `total_price`, `status`, `location`, `created_at`, `reminder_sent`) VALUES (39, NULL, 2, '2026-07-07 18:30:00', 10, 18, '0.00', 'Blocked', 'Zurich', '2026-07-03 06:27:50', 0);
INSERT INTO `bookings` (`id`, `user_id`, `station_id`, `booking_date`, `start_hour`, `end_hour`, `total_price`, `status`, `location`, `created_at`, `reminder_sent`) VALUES (40, NULL, 3, '2026-07-07 18:30:00', 10, 18, '0.00', 'Blocked', 'Zurich', '2026-07-03 06:27:50', 0);
INSERT INTO `bookings` (`id`, `user_id`, `station_id`, `booking_date`, `start_hour`, `end_hour`, `total_price`, `status`, `location`, `created_at`, `reminder_sent`) VALUES (41, NULL, 4, '2026-07-07 18:30:00', 10, 18, '0.00', 'Blocked', 'Zurich', '2026-07-03 06:27:50', 0);
INSERT INTO `bookings` (`id`, `user_id`, `station_id`, `booking_date`, `start_hour`, `end_hour`, `total_price`, `status`, `location`, `created_at`, `reminder_sent`) VALUES (42, NULL, 1, '2026-07-08 18:30:00', 10, 11, '0.00', 'Cancelled', 'Zurich', '2026-07-03 06:29:36', 0);
INSERT INTO `bookings` (`id`, `user_id`, `station_id`, `booking_date`, `start_hour`, `end_hour`, `total_price`, `status`, `location`, `created_at`, `reminder_sent`) VALUES (43, NULL, 1, '2026-07-09 18:30:00', 10, 18, '0.00', 'Cancelled', 'Zurich', '2026-07-03 06:46:55', 0);
INSERT INTO `bookings` (`id`, `user_id`, `station_id`, `booking_date`, `start_hour`, `end_hour`, `total_price`, `status`, `location`, `created_at`, `reminder_sent`) VALUES (44, NULL, 3, '2026-07-09 18:30:00', 10, 18, '0.00', 'Cancelled', 'Zurich', '2026-07-03 06:46:55', 0);
INSERT INTO `bookings` (`id`, `user_id`, `station_id`, `booking_date`, `start_hour`, `end_hour`, `total_price`, `status`, `location`, `created_at`, `reminder_sent`) VALUES (45, NULL, 4, '2026-07-09 18:30:00', 10, 18, '0.00', 'Cancelled', 'Zurich', '2026-07-03 06:46:55', 0);
INSERT INTO `bookings` (`id`, `user_id`, `station_id`, `booking_date`, `start_hour`, `end_hour`, `total_price`, `status`, `location`, `created_at`, `reminder_sent`) VALUES (46, 2, 1, '2026-07-16 18:30:00', 10, 16, '180.00', 'Cancelled', 'Zurich', '2026-07-07 06:47:27', 0);
INSERT INTO `bookings` (`id`, `user_id`, `station_id`, `booking_date`, `start_hour`, `end_hour`, `total_price`, `status`, `location`, `created_at`, `reminder_sent`) VALUES (47, 2, 1, '2026-07-17 18:30:00', 10, 14, '120.00', 'Cancelled', 'Zurich', '2026-07-07 07:01:52', 0);
INSERT INTO `bookings` (`id`, `user_id`, `station_id`, `booking_date`, `start_hour`, `end_hour`, `total_price`, `status`, `location`, `created_at`, `reminder_sent`) VALUES (48, NULL, 1, '2026-06-11 18:30:00', 10, 12, '0.00', 'Cancelled', 'Zurich', '2026-07-07 08:45:56', 0);
INSERT INTO `bookings` (`id`, `user_id`, `station_id`, `booking_date`, `start_hour`, `end_hour`, `total_price`, `status`, `location`, `created_at`, `reminder_sent`) VALUES (49, NULL, 2, '2026-06-11 18:30:00', 10, 12, '0.00', 'Cancelled', 'Zurich', '2026-07-07 08:45:56', 0);
INSERT INTO `bookings` (`id`, `user_id`, `station_id`, `booking_date`, `start_hour`, `end_hour`, `total_price`, `status`, `location`, `created_at`, `reminder_sent`) VALUES (50, NULL, 3, '2026-06-11 18:30:00', 10, 12, '0.00', 'Cancelled', 'Zurich', '2026-07-07 08:45:56', 0);
INSERT INTO `bookings` (`id`, `user_id`, `station_id`, `booking_date`, `start_hour`, `end_hour`, `total_price`, `status`, `location`, `created_at`, `reminder_sent`) VALUES (51, NULL, 4, '2026-06-11 18:30:00', 10, 12, '0.00', 'Cancelled', 'Zurich', '2026-07-07 08:45:56', 0);
INSERT INTO `bookings` (`id`, `user_id`, `station_id`, `booking_date`, `start_hour`, `end_hour`, `total_price`, `status`, `location`, `created_at`, `reminder_sent`) VALUES (52, NULL, 1, '2026-06-11 18:30:00', 10, 11, '0.00', 'Cancelled', 'Zurich', '2026-07-07 08:48:27', 0);
INSERT INTO `bookings` (`id`, `user_id`, `station_id`, `booking_date`, `start_hour`, `end_hour`, `total_price`, `status`, `location`, `created_at`, `reminder_sent`) VALUES (53, NULL, 1, '2026-06-11 18:30:00', 10, 14, '0.00', 'Cancelled', 'Zurich', '2026-07-07 09:19:42', 0);
INSERT INTO `bookings` (`id`, `user_id`, `station_id`, `booking_date`, `start_hour`, `end_hour`, `total_price`, `status`, `location`, `created_at`, `reminder_sent`) VALUES (54, NULL, 2, '2026-06-11 18:30:00', 10, 14, '0.00', 'Cancelled', 'Zurich', '2026-07-07 09:19:42', 0);
INSERT INTO `bookings` (`id`, `user_id`, `station_id`, `booking_date`, `start_hour`, `end_hour`, `total_price`, `status`, `location`, `created_at`, `reminder_sent`) VALUES (55, NULL, 3, '2026-06-11 18:30:00', 10, 14, '0.00', 'Cancelled', 'Zurich', '2026-07-07 09:19:42', 0);
INSERT INTO `bookings` (`id`, `user_id`, `station_id`, `booking_date`, `start_hour`, `end_hour`, `total_price`, `status`, `location`, `created_at`, `reminder_sent`) VALUES (56, NULL, 4, '2026-06-11 18:30:00', 10, 14, '0.00', 'Cancelled', 'Zurich', '2026-07-07 09:19:42', 0);
INSERT INTO `bookings` (`id`, `user_id`, `station_id`, `booking_date`, `start_hour`, `end_hour`, `total_price`, `status`, `location`, `created_at`, `reminder_sent`) VALUES (57, 2, 2, '2026-07-16 18:30:00', 10, 14, '120.00', 'Cancelled', 'Zurich', '2026-07-07 09:53:29', 0);
INSERT INTO `bookings` (`id`, `user_id`, `station_id`, `booking_date`, `start_hour`, `end_hour`, `total_price`, `status`, `location`, `created_at`, `reminder_sent`) VALUES (58, NULL, 1, '2026-07-06 18:30:00', 10, 14, '0.00', 'Blocked', 'Zurich', '2026-07-07 09:54:43', 0);
INSERT INTO `bookings` (`id`, `user_id`, `station_id`, `booking_date`, `start_hour`, `end_hour`, `total_price`, `status`, `location`, `created_at`, `reminder_sent`) VALUES (59, NULL, 2, '2026-07-06 18:30:00', 10, 14, '0.00', 'Blocked', 'Zurich', '2026-07-07 09:54:43', 0);
INSERT INTO `bookings` (`id`, `user_id`, `station_id`, `booking_date`, `start_hour`, `end_hour`, `total_price`, `status`, `location`, `created_at`, `reminder_sent`) VALUES (60, NULL, 3, '2026-07-06 18:30:00', 10, 14, '0.00', 'Blocked', 'Zurich', '2026-07-07 09:54:43', 0);
INSERT INTO `bookings` (`id`, `user_id`, `station_id`, `booking_date`, `start_hour`, `end_hour`, `total_price`, `status`, `location`, `created_at`, `reminder_sent`) VALUES (61, NULL, 4, '2026-07-06 18:30:00', 10, 14, '0.00', 'Blocked', 'Zurich', '2026-07-07 09:54:43', 0);
INSERT INTO `bookings` (`id`, `user_id`, `station_id`, `booking_date`, `start_hour`, `end_hour`, `total_price`, `status`, `location`, `created_at`, `reminder_sent`) VALUES (62, NULL, 1, '2026-06-11 18:30:00', 10, 14, '0.00', 'Cancelled', 'Zurich', '2026-07-07 11:25:11', 0);
INSERT INTO `bookings` (`id`, `user_id`, `station_id`, `booking_date`, `start_hour`, `end_hour`, `total_price`, `status`, `location`, `created_at`, `reminder_sent`) VALUES (63, NULL, 3, '2026-06-11 18:30:00', 10, 14, '0.00', 'Cancelled', 'Zurich', '2026-07-07 11:25:11', 0);
INSERT INTO `bookings` (`id`, `user_id`, `station_id`, `booking_date`, `start_hour`, `end_hour`, `total_price`, `status`, `location`, `created_at`, `reminder_sent`) VALUES (64, NULL, 4, '2026-06-11 18:30:00', 10, 14, '0.00', 'Cancelled', 'Zurich', '2026-07-07 11:25:11', 0);
INSERT INTO `bookings` (`id`, `user_id`, `station_id`, `booking_date`, `start_hour`, `end_hour`, `total_price`, `status`, `location`, `created_at`, `reminder_sent`) VALUES (65, NULL, 1, '2026-06-06 18:30:00', 10, 14, '0.00', 'Cancelled', 'Zurich', '2026-07-07 11:25:25', 0);
INSERT INTO `bookings` (`id`, `user_id`, `station_id`, `booking_date`, `start_hour`, `end_hour`, `total_price`, `status`, `location`, `created_at`, `reminder_sent`) VALUES (66, NULL, 3, '2026-06-06 18:30:00', 10, 14, '0.00', 'Cancelled', 'Zurich', '2026-07-07 11:25:25', 0);
INSERT INTO `bookings` (`id`, `user_id`, `station_id`, `booking_date`, `start_hour`, `end_hour`, `total_price`, `status`, `location`, `created_at`, `reminder_sent`) VALUES (67, NULL, 4, '2026-06-06 18:30:00', 10, 14, '0.00', 'Cancelled', 'Zurich', '2026-07-07 11:25:25', 0);
INSERT INTO `bookings` (`id`, `user_id`, `station_id`, `booking_date`, `start_hour`, `end_hour`, `total_price`, `status`, `location`, `created_at`, `reminder_sent`) VALUES (68, 2, 1, '2026-07-15 18:30:00', 10, 14, '200.00', 'Cancelled', 'Zurich', '2026-07-16 13:24:10', 0);
INSERT INTO `bookings` (`id`, `user_id`, `station_id`, `booking_date`, `start_hour`, `end_hour`, `total_price`, `status`, `location`, `created_at`, `reminder_sent`) VALUES (69, NULL, 1, '2026-06-20 18:30:00', 11, 11, '0.00', 'Blocked', 'Zurich', '2026-07-21 09:31:37', 0);
INSERT INTO `bookings` (`id`, `user_id`, `station_id`, `booking_date`, `start_hour`, `end_hour`, `total_price`, `status`, `location`, `created_at`, `reminder_sent`) VALUES (70, NULL, 2, '2026-06-20 18:30:00', 11, 11, '0.00', 'Blocked', 'Zurich', '2026-07-21 09:31:37', 0);
INSERT INTO `bookings` (`id`, `user_id`, `station_id`, `booking_date`, `start_hour`, `end_hour`, `total_price`, `status`, `location`, `created_at`, `reminder_sent`) VALUES (71, NULL, 3, '2026-06-20 18:30:00', 11, 11, '0.00', 'Blocked', 'Zurich', '2026-07-21 09:31:37', 0);
INSERT INTO `bookings` (`id`, `user_id`, `station_id`, `booking_date`, `start_hour`, `end_hour`, `total_price`, `status`, `location`, `created_at`, `reminder_sent`) VALUES (72, NULL, 4, '2026-06-20 18:30:00', 11, 11, '0.00', 'Blocked', 'Zurich', '2026-07-21 09:31:38', 0);
INSERT INTO `bookings` (`id`, `user_id`, `station_id`, `booking_date`, `start_hour`, `end_hour`, `total_price`, `status`, `location`, `created_at`, `reminder_sent`) VALUES (73, NULL, 1, '2026-06-20 18:30:00', 10, 17, '0.00', 'Blocked', 'Zurich', '2026-07-21 09:32:12', 0);
INSERT INTO `bookings` (`id`, `user_id`, `station_id`, `booking_date`, `start_hour`, `end_hour`, `total_price`, `status`, `location`, `created_at`, `reminder_sent`) VALUES (74, NULL, 2, '2026-06-20 18:30:00', 10, 17, '0.00', 'Blocked', 'Zurich', '2026-07-21 09:32:12', 0);
INSERT INTO `bookings` (`id`, `user_id`, `station_id`, `booking_date`, `start_hour`, `end_hour`, `total_price`, `status`, `location`, `created_at`, `reminder_sent`) VALUES (75, NULL, 3, '2026-06-20 18:30:00', 10, 17, '0.00', 'Blocked', 'Zurich', '2026-07-21 09:32:12', 0);
INSERT INTO `bookings` (`id`, `user_id`, `station_id`, `booking_date`, `start_hour`, `end_hour`, `total_price`, `status`, `location`, `created_at`, `reminder_sent`) VALUES (76, NULL, 4, '2026-06-20 18:30:00', 10, 17, '0.00', 'Blocked', 'Zurich', '2026-07-21 09:32:12', 0);
INSERT INTO `bookings` (`id`, `user_id`, `station_id`, `booking_date`, `start_hour`, `end_hour`, `total_price`, `status`, `location`, `created_at`, `reminder_sent`) VALUES (77, 11, 2, '2026-07-28 18:30:00', 13, 17, '120.00', 'Cancelled', 'Zurich', '2026-07-29 12:03:21', 0);
INSERT INTO `bookings` (`id`, `user_id`, `station_id`, `booking_date`, `start_hour`, `end_hour`, `total_price`, `status`, `location`, `created_at`, `reminder_sent`) VALUES (78, 11, 4, '2026-07-30 18:30:00', 11, 15, '120.00', 'Cancelled', 'Zurich', '2026-07-29 12:11:40', 0);
INSERT INTO `bookings` (`id`, `user_id`, `station_id`, `booking_date`, `start_hour`, `end_hour`, `total_price`, `status`, `location`, `created_at`, `reminder_sent`) VALUES (79, 12, 1, '2026-08-12 18:30:00', 14, 18, '120.00', 'Cancelled', 'Zurich', '2026-08-05 11:15:45', 0);
INSERT INTO `bookings` (`id`, `user_id`, `station_id`, `booking_date`, `start_hour`, `end_hour`, `total_price`, `status`, `location`, `created_at`, `reminder_sent`) VALUES (80, 12, 1, '2026-08-19 18:30:00', 11, 17, '170.00', 'Cancelled', 'Zurich', '2026-08-05 11:18:32', 0);
INSERT INTO `bookings` (`id`, `user_id`, `station_id`, `booking_date`, `start_hour`, `end_hour`, `total_price`, `status`, `location`, `created_at`, `reminder_sent`) VALUES (81, 12, 1, '2026-08-05 18:30:00', 10, 18, '230.00', 'Cancelled', 'Zurich', '2026-08-05 11:24:09', 0);
INSERT INTO `bookings` (`id`, `user_id`, `station_id`, `booking_date`, `start_hour`, `end_hour`, `total_price`, `status`, `location`, `created_at`, `reminder_sent`) VALUES (82, 12, 2, '2026-08-12 18:30:00', 10, 18, '230.00', 'Cancelled', 'Zurich', '2026-08-05 11:41:53', 0);
INSERT INTO `bookings` (`id`, `user_id`, `station_id`, `booking_date`, `start_hour`, `end_hour`, `total_price`, `status`, `location`, `created_at`, `reminder_sent`) VALUES (83, 13, 1, '2026-08-13 18:30:00', 11, 17, '170.00', 'Cancelled', 'Zurich', '2026-08-05 11:48:00', 0);
INSERT INTO `bookings` (`id`, `user_id`, `station_id`, `booking_date`, `start_hour`, `end_hour`, `total_price`, `status`, `location`, `created_at`, `reminder_sent`) VALUES (84, 13, 3, '2026-08-12 18:30:00', 15, 18, '90.00', 'Cancelled', 'Zurich', '2026-08-05 11:48:12', 0);
INSERT INTO `bookings` (`id`, `user_id`, `station_id`, `booking_date`, `start_hour`, `end_hour`, `total_price`, `status`, `location`, `created_at`, `reminder_sent`) VALUES (85, 19, 1, '2026-08-06 18:30:00', 10, 13, '90.00', 'Cancelled', 'Zurich', '2026-08-06 09:40:04', 0);
INSERT INTO `bookings` (`id`, `user_id`, `station_id`, `booking_date`, `start_hour`, `end_hour`, `total_price`, `status`, `location`, `created_at`, `reminder_sent`) VALUES (86, 19, 1, '2026-08-20 18:30:00', 10, 16, '150.00', 'Cancelled', 'Zurich', '2026-08-06 09:42:13', 0);
INSERT INTO `bookings` (`id`, `user_id`, `station_id`, `booking_date`, `start_hour`, `end_hour`, `total_price`, `status`, `location`, `created_at`, `reminder_sent`) VALUES (87, 19, 2, '2026-08-05 18:30:00', 10, 14, '120.00', 'Cancelled', 'Zurich', '2026-08-06 09:44:20', 0);
INSERT INTO `bookings` (`id`, `user_id`, `station_id`, `booking_date`, `start_hour`, `end_hour`, `total_price`, `status`, `location`, `created_at`, `reminder_sent`) VALUES (88, 21, 1, '2026-08-11 18:30:00', 10, 13, '90.00', 'Cancelled', 'Zurich', '2026-08-11 12:17:14', 0);
INSERT INTO `bookings` (`id`, `user_id`, `station_id`, `booking_date`, `start_hour`, `end_hour`, `total_price`, `status`, `location`, `created_at`, `reminder_sent`) VALUES (89, 1, 2, '2026-08-11 18:30:00', 10, 13, '90.00', 'Cancelled', 'Zurich', '2026-08-12 10:58:23', 0);
INSERT INTO `bookings` (`id`, `user_id`, `station_id`, `booking_date`, `start_hour`, `end_hour`, `total_price`, `status`, `location`, `created_at`, `reminder_sent`) VALUES (90, 1, 3, '2026-08-11 18:30:00', 10, 13, '90.00', 'Cancelled', 'Zurich', '2026-08-12 11:02:15', 0);
INSERT INTO `bookings` (`id`, `user_id`, `station_id`, `booking_date`, `start_hour`, `end_hour`, `total_price`, `status`, `location`, `created_at`, `reminder_sent`) VALUES (91, 24, 4, '2026-08-11 18:30:00', 10, 13, '90.00', 'Cancelled', 'Zurich', '2026-08-12 11:26:06', 0);
INSERT INTO `bookings` (`id`, `user_id`, `station_id`, `booking_date`, `start_hour`, `end_hour`, `total_price`, `status`, `location`, `created_at`, `reminder_sent`) VALUES (92, 25, 1, '2026-08-12 18:30:00', 10, 13, '90.00', 'Cancelled', 'Zurich', '2026-08-12 12:15:40', 0);
INSERT INTO `bookings` (`id`, `user_id`, `station_id`, `booking_date`, `start_hour`, `end_hour`, `total_price`, `status`, `location`, `created_at`, `reminder_sent`) VALUES (93, 27, 1, '2026-08-18 18:30:00', 11, 15, '120.00', 'Confirmed', 'Zurich', '2026-08-19 06:16:18', 0);
INSERT INTO `bookings` (`id`, `user_id`, `station_id`, `booking_date`, `start_hour`, `end_hour`, `total_price`, `status`, `location`, `created_at`, `reminder_sent`) VALUES (94, 27, 1, '2026-08-29 18:30:00', 11, 14, '90.00', 'Confirmed', 'Zurich', '2026-08-19 07:52:57', 0);

-- Table structure for `compliance_docs`
DROP TABLE IF EXISTS `compliance_docs`;
CREATE TABLE `compliance_docs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `doc_type` varchar(100) NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_url` text NOT NULL,
  `file_type` varchar(50) DEFAULT NULL,
  `status` enum('Pending','Approved','Rejected') DEFAULT 'Approved',
  `uploaded_by_admin_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `uploaded_by_admin_id` (`uploaded_by_admin_id`),
  CONSTRAINT `compliance_docs_ibfk_1` FOREIGN KEY (`uploaded_by_admin_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Table structure for `inquiries`
DROP TABLE IF EXISTS `inquiries`;
CREATE TABLE `inquiries` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `message` text NOT NULL,
  `submitted_date` date NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table `inquiries`
INSERT INTO `inquiries` (`id`, `name`, `email`, `message`, `submitted_date`, `created_at`) VALUES (4, 'Mailing List Subscriber', 'sarah123@gmail.com', 'Joined Mailing List', '2026-07-02 18:30:00', '2026-07-03 06:59:10');
INSERT INTO `inquiries` (`id`, `name`, `email`, `message`, `submitted_date`, `created_at`) VALUES (5, 'Newsletter Subscriber', 'siyaahh@gmail.com', 'Subscribed to dark banner newsletter', '2026-07-02 18:30:00', '2026-07-03 06:59:39');
INSERT INTO `inquiries` (`id`, `name`, `email`, `message`, `submitted_date`, `created_at`) VALUES (6, 'svana', 'svana@gmail.com', 'hello this only for ....', '2026-07-02 18:30:00', '2026-07-03 07:00:13');
INSERT INTO `inquiries` (`id`, `name`, `email`, `message`, `submitted_date`, `created_at`) VALUES (7, 'sdfkdlfg', 'dfd@gmail.com', 'gfgfh', '2026-07-06 18:30:00', '2026-07-07 12:47:38');
INSERT INTO `inquiries` (`id`, `name`, `email`, `message`, `submitted_date`, `created_at`) VALUES (8, 'sarh', 'sarah123@gmail.com', 'dfggdg', '2026-08-04 18:30:00', '2026-08-05 09:51:52');
INSERT INTO `inquiries` (`id`, `name`, `email`, `message`, `submitted_date`, `created_at`) VALUES (9, 'pia', 'pi@gmail.com', 'jsjgf', '2026-08-04 18:30:00', '2026-08-05 09:53:47');

-- Table structure for `manager_settings`
DROP TABLE IF EXISTS `manager_settings`;
CREATE TABLE `manager_settings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `opening_days` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`opening_days`)),
  `operating_hours` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`operating_hours`)),
  `pricing` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`pricing`)),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table `manager_settings`
INSERT INTO `manager_settings` (`id`, `opening_days`, `operating_hours`, `pricing`, `updated_at`) VALUES (1, '{"Monday":true,"Tuesday":true,"Wednesday":true,"Thursday":true,"Friday":true,"Saturday":true,"Sunday":true}', '{"open":"10:00","close":"18:00"}', '{"Sunday":{"1H":3000,"3H":60,"4H":100,"6H":170,"8H":200},"Monday":{"1H":3000,"3H":90,"4H":120,"6H":170,"8H":220},"Tuesday":{"1H":3000,"3H":90,"4H":120,"6H":170,"8H":220},"Wednesday":{"1H":3000,"3H":90,"4H":120,"6H":170,"8H":230},"Thursday":{"1H":3000,"3H":90,"4H":120,"6H":150,"8H":220},"Friday":{"1H":3000,"3H":90,"4H":120,"6H":170,"8H":220},"Saturday":{"1H":3000,"3H":90,"4H":120,"6H":170,"8H":220}}', '2026-07-28 11:32:18');

-- Table structure for `stations`
DROP TABLE IF EXISTS `stations`;
CREATE TABLE `stations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `station_number` int(11) NOT NULL,
  `name` varchar(50) NOT NULL,
  `location` varchar(50) DEFAULT 'Zurich',
  `is_active` tinyint(1) DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `station_number` (`station_number`)
) ENGINE=InnoDB AUTO_INCREMENT=146 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table `stations`
INSERT INTO `stations` (`id`, `station_number`, `name`, `location`, `is_active`) VALUES (1, 1, 'Station 1', 'Zurich', 1);
INSERT INTO `stations` (`id`, `station_number`, `name`, `location`, `is_active`) VALUES (2, 2, 'Station 2', 'Zurich', 1);
INSERT INTO `stations` (`id`, `station_number`, `name`, `location`, `is_active`) VALUES (3, 3, 'Station 3', 'Zurich', 1);
INSERT INTO `stations` (`id`, `station_number`, `name`, `location`, `is_active`) VALUES (4, 4, 'Station 4', 'Zurich', 1);

-- Table structure for `users`
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('artist','admin') NOT NULL DEFAULT 'artist',
  `phone` varchar(30) DEFAULT NULL,
  `instagram` varchar(100) DEFAULT NULL,
  `status` enum('Active','Blocked') DEFAULT 'Active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `bio` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table `users`
INSERT INTO `users` (`id`, `name`, `email`, `password_hash`, `role`, `phone`, `instagram`, `status`, `created_at`, `updated_at`, `bio`) VALUES (1, 'Chris', 'chris@tattooplatz.ch', '$2a$10$8d6jVwBwYPUhLcWY4pPSM.E3nH8rhWW.7XrO6UkPw8FV7jVCYnjwa', 'admin', '+41 44 123 45 67', '@tattooplatz_zurich', 'Active', '2026-06-29 09:32:59', '2026-08-19 10:22:24', 'helloo how are you ');
INSERT INTO `users` (`id`, `name`, `email`, `password_hash`, `role`, `phone`, `instagram`, `status`, `created_at`, `updated_at`, `bio`) VALUES (2, 'Joao Otereze', 'artist@tattooplatz.ch', '$2a$10$QQqg5ucODMlY.zjQ5cMpKelKCmFn5GPJcnNwknUUbSudy8QXA0FHq', 'artist', '+41 79 123 45 67', '@artist_instagram', 'Active', '2026-06-29 13:03:41', '2026-06-29 13:03:41', NULL);
INSERT INTO `users` (`id`, `name`, `email`, `password_hash`, `role`, `phone`, `instagram`, `status`, `created_at`, `updated_at`, `bio`) VALUES (7, 'Marco V.', 'marco.v@gmail.com', '$2a$10$4kzSyB7uX.4iDqztuu86VO/sHx9hDd8uZ.OXmcHMYJwcvnE/7iScS', 'artist', '+41 78 234 56 78', '@marco_tats', 'Active', '2026-07-03 05:39:57', '2026-07-03 05:39:57', NULL);
INSERT INTO `users` (`id`, `name`, `email`, `password_hash`, `role`, `phone`, `instagram`, `status`, `created_at`, `updated_at`, `bio`) VALUES (8, 'Alina R.', 'alina.r@gmail.com', '$2a$10$ioXX5oFpc/MlgvZA6u3a2uLVV5Wd4dhgybTZ9ZGDaCjV0pzmzqcYa', 'artist', '+41 77 345 67 89', '@alina_ink', 'Active', '2026-07-03 05:39:57', '2026-07-03 05:39:57', NULL);
INSERT INTO `users` (`id`, `name`, `email`, `password_hash`, `role`, `phone`, `instagram`, `status`, `created_at`, `updated_at`, `bio`) VALUES (9, 'Jonas K.', 'jonas.k@tattooplatz.ch', '$2a$10$ly/mmJAE6cm3KGA/vxuaAOB2SyuaXtHmPifF3cyvfg5qwEr/IkW6W', 'artist', '+41 76 456 78 90', '@jonas_tattoos', 'Active', '2026-07-03 05:39:57', '2026-07-03 05:39:57', NULL);
INSERT INTO `users` (`id`, `name`, `email`, `password_hash`, `role`, `phone`, `instagram`, `status`, `created_at`, `updated_at`, `bio`) VALUES (10, 'Sofia M.', 'sofia.m@gmail.com', '$2a$10$luu7T3ddxacNUJ2O8Xllaur2dJWNKLhUxFm7IdppOIOIyj11Zs8wa', 'artist', '+41 75 567 89 01', '@sofia_tattoos', 'Active', '2026-07-03 05:39:58', '2026-07-03 05:39:58', NULL);
INSERT INTO `users` (`id`, `name`, `email`, `password_hash`, `role`, `phone`, `instagram`, `status`, `created_at`, `updated_at`, `bio`) VALUES (11, 'demos', 'lalitpanchole6@gmail.com', '$2a$10$7lRpyy.U9fSZweUVFHepAOG9BVF7STtUAcGWilXve2oGYkmR9u8ku', 'admin', NULL, 'dgfjghk,', 'Active', '2026-07-29 12:03:21', '2026-08-19 09:41:32', NULL);
INSERT INTO `users` (`id`, `name`, `email`, `password_hash`, `role`, `phone`, `instagram`, `status`, `created_at`, `updated_at`, `bio`) VALUES (12, 'demo1', 'demo1@gmail.com', 'guest_account_no_login', 'artist', NULL, 'demo_rtist', 'Active', '2026-08-05 11:15:45', '2026-08-05 11:15:45', NULL);
INSERT INTO `users` (`id`, `name`, `email`, `password_hash`, `role`, `phone`, `instagram`, `status`, `created_at`, `updated_at`, `bio`) VALUES (13, 'kiaa', 'kiaa@gmail.com', 'guest_account_no_login', 'artist', NULL, 'kiaa@artist', 'Active', '2026-08-05 11:48:00', '2026-08-05 11:48:00', NULL);
INSERT INTO `users` (`id`, `name`, `email`, `password_hash`, `role`, `phone`, `instagram`, `status`, `created_at`, `updated_at`, `bio`) VALUES (14, 'Bea', 'bea@tattooplatz.ch', '$2a$10$w/6Qbx.USmstIAxCrcUQeO1ZhK/MkJSo.b4pOTeQFivPXZw8wV8be', 'admin', NULL, NULL, 'Active', '2026-08-06 07:41:29', '2026-08-10 11:19:40', NULL);
INSERT INTO `users` (`id`, `name`, `email`, `password_hash`, `role`, `phone`, `instagram`, `status`, `created_at`, `updated_at`, `bio`) VALUES (15, 'Lucy', 'lucy@tattooplatz.ch', '$2a$10$MMzKCXKDT.LNbe00X9TZY.uXuqvv5Jne2RsOJvvG9pYw4k9NSYP7O', 'admin', NULL, NULL, 'Active', '2026-08-06 07:41:29', '2026-08-06 07:41:29', NULL);
INSERT INTO `users` (`id`, `name`, `email`, `password_hash`, `role`, `phone`, `instagram`, `status`, `created_at`, `updated_at`, `bio`) VALUES (16, 'Tuli', 'tuli@tattooplatz.ch', '$2a$10$MMzKCXKDT.LNbe00X9TZY.uXuqvv5Jne2RsOJvvG9pYw4k9NSYP7O', 'admin', NULL, NULL, 'Active', '2026-08-06 07:41:29', '2026-08-06 07:41:29', NULL);
INSERT INTO `users` (`id`, `name`, `email`, `password_hash`, `role`, `phone`, `instagram`, `status`, `created_at`, `updated_at`, `bio`) VALUES (17, 'Dani', 'dani@tattooplatz.ch', '$2a$10$MMzKCXKDT.LNbe00X9TZY.uXuqvv5Jne2RsOJvvG9pYw4k9NSYP7O', 'admin', NULL, NULL, 'Active', '2026-08-06 07:41:29', '2026-08-06 07:41:29', NULL);
INSERT INTO `users` (`id`, `name`, `email`, `password_hash`, `role`, `phone`, `instagram`, `status`, `created_at`, `updated_at`, `bio`) VALUES (18, 'Leonie', 'leonie@tattooplatz.ch', '$2a$10$MMzKCXKDT.LNbe00X9TZY.uXuqvv5Jne2RsOJvvG9pYw4k9NSYP7O', 'admin', NULL, NULL, 'Active', '2026-08-06 07:41:30', '2026-08-06 07:41:30', NULL);
INSERT INTO `users` (`id`, `name`, `email`, `password_hash`, `role`, `phone`, `instagram`, `status`, `created_at`, `updated_at`, `bio`) VALUES (19, 'chikku', 'chikkuyadav125@gmail.com', '$2a$10$MpDh3d2fQs9Naw4EUcS0j.u06YlZGa6gqNhCL8llPedAMptHqxNIq', 'artist', NULL, 'chikku_artist', 'Active', '2026-08-06 09:40:04', '2026-08-06 10:48:40', NULL);
INSERT INTO `users` (`id`, `name`, `email`, `password_hash`, `role`, `phone`, `instagram`, `status`, `created_at`, `updated_at`, `bio`) VALUES (21, 'fefgdf', 'owner@gmail.com', '$2a$10$wt7yCIYqj66WUPVJ3DjaMeegkL5TMHEVAM/elcARUAsARHHynhFpO', 'artist', NULL, 'dgdfhgfh', 'Active', '2026-08-11 12:17:14', '2026-08-11 12:17:14', NULL);
INSERT INTO `users` (`id`, `name`, `email`, `password_hash`, `role`, `phone`, `instagram`, `status`, `created_at`, `updated_at`, `bio`) VALUES (24, 'lalit', 'lalitpanchole8@gmail.com', '$2a$10$Xh.0DYCZIbACCGR.m7Ng3uY6GZK0KcvbRkcPwsy2zhLxHhilz.RfC', 'artist', NULL, 'sdfdghf', 'Active', '2026-08-12 11:26:06', '2026-08-12 11:26:06', NULL);
INSERT INTO `users` (`id`, `name`, `email`, `password_hash`, `role`, `phone`, `instagram`, `status`, `created_at`, `updated_at`, `bio`) VALUES (25, 'hitesha', 'borsehitesha4@gmail.com', '$2a$10$Xl1/TJ8m7JemIaEV.DkdYucpMvTRJzEjQjwi.jiOMC9Yi0LAuf/.S', 'artist', NULL, 'fdfghjg', 'Active', '2026-08-12 12:15:19', '2026-08-12 12:15:19', NULL);
INSERT INTO `users` (`id`, `name`, `email`, `password_hash`, `role`, `phone`, `instagram`, `status`, `created_at`, `updated_at`, `bio`) VALUES (27, 'swe', 'swe@gmail.com', '$2a$10$JrIwMiY6vUFUiFBjYgj10eqBsOQQcOeN7VqDcRRvL/utcWiMtWCLi', 'artist', '+41 79 999 88 77', '@Chiayi', 'Active', '2026-08-19 06:16:18', '2026-08-19 07:35:31', 'how aree you name ....');

