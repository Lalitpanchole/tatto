# 04 - API Architecture & Endpoint Specifications

## 1. Overview
The backend provides a RESTful JSON API with JWT authentication header verification (`Authorization: Bearer <token>`).

---

## 2. API Endpoints Reference

### 2.1 Authentication & User Management
- `POST /api/auth/register` - Register a new artist account (with compliance terms acknowledgment checkbox).
- `POST /api/auth/login` - Authenticate artist or admin and issue JWT token.
- `GET /api/auth/me` - Fetch current authenticated user profile.

### 2.2 Workstation Bookings (`/api/bookings`)
- `GET /api/bookings/availability?date=YYYY-MM-DD&duration=X` - Public endpoint to query free station count per day.
- `GET /api/bookings` - Fetch booking list (Filtered by artist ID for artists, master list for admins).
- `POST /api/bookings` - Create new station booking slot (Includes MySQL ACID transaction locking).
- `PATCH /api/bookings/:id/cancel` - Cancel a booking reservation.
- `POST /api/bookings/block` - Admin endpoint to block out workstations for maintenance.

### 2.3 Customer Inquiries (`/api/inquiries`)
- `POST /api/inquiries` - Public submission endpoint for website dark contact banner form.
- `GET /api/inquiries` - Admin endpoint to view message list.
- `DELETE /api/inquiries/:id` - Admin endpoint to remove inquiry record.
- `POST /api/inquiries/:id/reply` - Admin endpoint to reply to customer via email API.

### 2.4 Studio Compliance & Settings (`/api/admin`)
- `GET /api/admin/compliance` - Fetch official studio compliance files.
- `POST /api/admin/compliance/upload` - Admin file upload endpoint (Multer + Cloudinary/S3).
- `PATCH /api/admin/settings` - Adjust operating hours and station capacities dynamically.
