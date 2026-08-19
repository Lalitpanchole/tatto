# 05 - Frontend Architecture & Component Structure

## 1. Tech Stack & Setup
- **Framework:** React 19
- **Build Tool:** Vite 5
- **Routing:** React Router DOM (v7)
- **Styling:** Tailwind CSS + PostCSS + Vanilla CSS
- **Icons:** Lucide React

---

## 2. Component Hierarchy & Routing Map

```text
src/
├── App.jsx                 # Master Router, Global State (bookings, artists, inquiries, cart)
├── main.jsx                # Application Entry Point & Provider Wrappers
├── index.css               # Design Tokens, Custom Animations, Global Styling
└── components/
    ├── Navbar.jsx          # Header Navigation & Cart Drawer Trigger
    ├── Hero.jsx            # Minimalist Hero Section
    ├── Steps.jsx           # 3-Step Guided Workflow Section
    ├── VisaWidget.jsx      # Work Visa Registration Guidance Widget (EU vs Non-EU)
    ├── Pricing.jsx         # Station Package Cards (1h, 3h, 4h, 6h, 8h)
    ├── BookingTool.jsx     # 5-Step Space-Rental Booking Engine Wizard
    ├── About.jsx           # Studio Bento Photo Gallery & Included Equipment Checklist
    ├── AboutUs.jsx         # Comprehensive Mission & Philosophy Pages
    ├── Team.jsx            # Studio Founders & Team Biographies (Chris, Tuli, Bea, Dani)
    ├── Testimonials.jsx    # Artist Reviews Slider Cards
    ├── Merch.jsx           # Merchandise E-Commerce Storefront
    ├── ContactPage.jsx     # Contact Form & Google Maps Interactive Embed
    ├── LoginPage.jsx       # Auth Portal (Login / Artist Registration)
    ├── ArtistDashboard.jsx # Personal Artist Reservation Management Portal
    ├── AdminDashboard.jsx  # Master Studio Control Console & Master Timeline Grid
    ├── CookieBanner.jsx    # Swiss nFADP & GDPR Cookie Consent Banner (Bottom Anchored Modal)
    └── Footer.jsx          # Studio Footer, Opening Hours, Location Map Embed
```

---

## 3. State Management Flow
- **Current State:** Lifted state in `App.jsx` synchronized with `localStorage` persistence.
- **Data Collections:** `registeredArtists`, `bookings`, `inquiries`, `complianceRecords`, `currentUser`.
- **Real-Time Props Sync:** Homepage bookings and inquiries propagate instantly to `AdminDashboard` components.
