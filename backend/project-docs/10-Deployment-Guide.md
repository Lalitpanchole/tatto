# 10 - Deployment & Infrastructure Guide

## 1. Production Deployment Architecture
- **Frontend App:** Static React build hosted on Vercel / Netlify / Cloudflare Pages.
- **Backend API:** Node.js / Express server hosted on Render / AWS EC2 / DigitalOcean.
- **Database Server:** Managed MySQL Server hosted on PlanetScale / AWS RDS / Hostinger.
- **File Storage:** Cloudinary / AWS S3 for admin compliance document uploads.

---

## 2. Frontend Build Commands
```bash
# Install dependencies
npm install

# Run local development server
npm run dev

# Build production bundle
npm run build

# Preview production bundle locally
npm run preview
```

---

## 3. Environment Variables (`.env.production`)
```env
VITE_API_BASE_URL=https://api.tattooplatz.ch
VITE_STRIPE_PUBLIC_KEY=pk_live_...
```

---

## 4. Database Migration Deployment Checklist
1. Export historical appointments from SimplyBook.
2. Run MySQL table creation scripts (`03-Database-Schema.md`).
3. Seed `stations` table (Stations 1 to 4).
4. Run data migration script to import historical customer profiles and bookings into MySQL database.
5. Verify SSL certificates and CORS headers on Express API server.
