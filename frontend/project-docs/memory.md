# AI Memory & Project State (memory.md)

> **CRITICAL RULE FOR AI:** Always read this file before making major changes. Update this file whenever a new feature, section, or functionality is completed. Always keep `project-docs` updated when code changes.

## 1. Structured Project Documentation Index (`project-docs/`)
The project memory and architectural specifications are organized across 10 core documentation files:
- [01-Business-Requirements.md](file:///d:/Kiaan%20technoligy/TattoPlatz/project-docs/01-Business-Requirements.md) - Objectives, 0% commission, station spec, pricing, operating hours.
- [02-Roles-Permissions.md](file:///d:/Kiaan%20technoligy/TattoPlatz/project-docs/02-Roles-Permissions.md) - Public, Artist, and Admin permissions matrix.
- [03-Database-Schema.md](file:///d:/Kiaan%20technoligy/TattoPlatz/project-docs/03-Database-Schema.md) - MySQL relational schema, tables (users, stations, bookings, compliance_docs, inquiries).
- [04-API-Architecture.md](file:///d:/Kiaan%20technoligy/TattoPlatz/project-docs/04-API-Architecture.md) - REST API specifications for auth, bookings, inquiries, and admin settings.
- [05-Frontend-Architecture.md](file:///d:/Kiaan%20technoligy/TattoPlatz/project-docs/05-Frontend-Architecture.md) - React 19 component map, routes, and state flow.
- [06-UI-Design-System.md](file:///d:/Kiaan%20technoligy/TattoPlatz/project-docs/06-UI-Design-System.md) - Color palette tokens (`#FF66C4`, `#FFFFFF`, `#000000`), typography, curved aesthetics.
- [07-Project-Rules.md](file:///d:/Kiaan%20technoligy/TattoPlatz/project-docs/07-Project-Rules.md) - Code modification rules, no customer document uploads, double-booking prevention.
- [08-Development-Progress.md](file:///d:/Kiaan%20technoligy/TattoPlatz/project-docs/08-Development-Progress.md) - Completed milestones and pending backend roadmap.
- [09-Bug-Tracker.md](file:///d:/Kiaan%20technoligy/TattoPlatz/project-docs/09-Bug-Tracker.md) - Resolution log and active technical items.
- [10-Deployment-Guide.md](file:///d:/Kiaan%20technoligy/TattoPlatz/project-docs/10-Deployment-Guide.md) - Hosting guide, environment variables, MySQL migration steps.

## 2. Current Status (As of Latest Update)
- **Folder Restructuring & Clean Architecture:** 100% COMPLETE ✅ (Separated workspace into `frontend/` and `backend/` directories).
- **Frontend App (`frontend/`):** 100% COMPLETE ✅ (React 19, Vite, Tailwind, components, pages, dashboards).
- **Backend Setup (`backend/`):** INITIALIZED ✅ (Node.js/Express server structure with `config/db.js`, `models/`, `controllers/`, `routes/`, `middlewares/`, `utils/`, `.env`, and `server.js`).
- **MySQL Database Schema Script (`backend/schema.sql`):** 100% READY ✅ (DDL scripts for `users`, `stations`, `bookings`, `compliance_docs`, `inquiries`).
- **Documentation Structure:** 100% COMPLETE ✅ (10 structured architectural files in `project-docs/`).



## 3. Completed Sections ✅

### Hero Section (`Hero.jsx`)
- Minimalist clean design matching client's reference PDF.
- **REMOVED:** Badge, sub-label, description paragraph, EXPLORE STUDIO button, 4 stats grid, announcement bar.
- **KEPT:** Main heading (THE FUTURE OF TATTOOING), one-line tagline, single outline BOOK HERE button, studio photo.

### Steps — Inline Section Wrappers (App.jsx)
- Steps are NOT a separate component anymore — they are inline wrappers in App.jsx around existing content.
- **STEP 1: BOOK YOUR AGENDA** → wraps `Pricing.jsx` (session selection cards)
- **STEP 2: BOOK THE TIME THAT YOU NEED A STATION IN OUR BOOKING TOOL** → wraps `BookingTool.jsx` (full booking wizard)
- **STEP 3: ENJOY OUR STUDIO FREE AND WITH NO COMMISSION** → wraps `About.jsx` (studio gallery + mission + included items)
- Each step header: big pink STEP X number (7xl–9xl) + bold title, alternating left/right layout.

### Page Flow Order (App.jsx)
Hero → CTA → Pricing → BookingTool → About [Studio Gallery → VisaWidget → OUR MISSION → Philosophy (Commented Out)] → Team → AboutUs → Testimonials → Merch → Footer

### Studio Section (`About.jsx`)
- **PREMIUM PHOTO GALLERY** — 9 studio images (studio.png → studio8.png) in a responsive bento grid.
- Bento cards and stacked vertical view on mobile are rounded (`rounded-xl`).
- **FIXED (2026-08-05 | 14:28 IST):** Added `pt-16` top padding to the Studio Gallery container (`max-w-7xl` div in `About.jsx` line 104) as per client request — Studio Gallery was too close to the header/navbar above it. Now has proper vertical breathing room.
- Gallery hover effects: zoom, dark gradient, pink top-line glow, text slide up.
- Included items checklists and steps are styled with curves (`rounded-xl`).
- **FIXED (June 2026):** 3-step flow updated to match client PDF exactly:
  - Step 1: FILL YOUR AGENDA.
  - Step 2: BOOK A WORKSTATION FOR THE TIME YOU NEED IT.
  - Step 3: ENJOY A BEAUTIFUL STUDIO WITH NO COMMISSION FEES.
- **UPDATED (2026-08-05 | 15:03 IST):** Adjusted black text font spacing in `Steps.jsx`. Changed `tracking-tight` to `tracking-normal` and `leading-snug` to `leading-relaxed` so letters and lines have breathing room and no longer feel congested.
- **UPDATED (2026-08-05 | 15:12 IST):** Completely removed VAT (`VAT (Incl. 8.1%)`) display and calculation from `App.jsx` cart drawer and checkout summary as per client request — client business is not VAT registered.
- **UPDATED (2026-08-05 | 15:15 IST):** Updated Cancellation Policy sentence in `LegalPage.jsx`, `BookingTool.jsx`, and `ArtistDashboard.jsx` from *"If an appointment is missed, we will charge the user the full amount."* to *"If an appointment is missed without prior notice, we reserve the right to charge the full amount."* as per client request.
- **UPDATED (2026-08-05 | 15:22 IST):** Updated Footer contact form success message in `Footer.jsx` from *"We will get back to you within 24 hours."* to *"We'll get back to you as soon as possible."* as per client request.
- **FIXED (2026-08-05 | 16:08 IST):** Fixed critical booking time slot overflow bug in `BookingTool.jsx`. Removed incorrect `Math.max(closingHour, openingHour + duration)` logic in both `getAvailableSpotsForDay` and `getAvailableSlots` functions — replaced with strict `maxStartHour = closingHour - duration` so no session can ever be booked beyond studio closing time.
- **FIXED (2026-08-05 | 16:42 IST):** Fixed persistent login bug in `BookingTool.jsx`. `userProfile` now initializes from `localStorage` (`tattooplatz_current_user`) on component mount. `handleFinalize()` now skips Step 4 login form if user is already logged in. Step 4 shows a "Logged in as X / Confirm Booking" card when session exists. "Not you? Sign out" link allows switching accounts.
- **UPDATED (2026-08-05 | 17:10 IST):** Implemented Dynamic Unique Invoice Generation in `BookingTool.jsx` (Model A refinement). Replaced hardcoded static `Invoice #TP-2026-09` with dynamic `invoiceNumber` computed per booking session (`Invoice #TP-2026-XXXXX`), ensuring every booking receipt displays a unique invoice number without complex multi-session state overhead.
- **UPDATED (2026-08-05 | 17:26 IST):** Added Month Navigation (`<` ChevronLeft & `>` ChevronRight buttons) to `ArtistDashboard.jsx` Reservations Calendar. Added `calYear` & `calMonth` state and `goToPrevMonth` / `goToNextMonth` handlers so artists can easily navigate between past & upcoming months.
- **FIXED (2026-08-05 | 17:41 IST):** Resolved critical Mobile vs Computer authentication bug in `BookingTool.jsx`. Both `handleLoginSubmit` and `handleRegisterSubmit` now connect to MySQL Backend API (`authAPI.register` & `authAPI.login`) with automated `.toLowerCase().trim()` string normalization. Registered artist accounts are now saved to the central MySQL DB instantly, allowing artists to log in seamlessly across Desktop, Mobile, and Tablet devices.
- **FIXED (2026-08-05 | 18:04 IST):** Implemented Smart Station Allocation & Real-Time Availability Sync in `bookingController.js` and `App.jsx`. If a requested workstation (e.g. Station 1) is already booked in MySQL DB for the selected date/time slot, backend automatically falls back and assigns the next free station (Station 2, 3, or 4). Added automatic DB bookings sync on `App.jsx` mount to eliminate false-positive "Time slot already booked" error modals.
- **IMPLEMENTED STEP 1 (2026-08-06 | 13:12 IST): Multiple Admin Team Member Logins**: Created `seed-admins.js` script to populate MySQL `users` table with all 6 admin accounts (`chris@`, `bea@`, `lucy@`, `tuli@`, `dani@`, `leonie@tattooplatz.ch`) with role=`admin`. Updated `userModel.js` to add `createAdmin`, `updatePasswordByEmail`, `deleteById` functions. Updated `LoginPage.jsx` to (1) do `.toLowerCase().trim()` normalization on login, (2) validate `res.user.role === role` so artist/admin tabs are strictly separated, (3) save profile to `localStorage` on login, and (4) support all team admin emails in offline fallback mode. Initial password for all new admins: `TattoPlatz@2026`.
- **REMOVED (2026-08-11 | 19:07 IST): Open Days & Closed Days Badges Banner in Booking Tool**: Removed the redundant `✓ OPEN DAYS` and `✕ CLOSED DAYS` badges block from Step 2 calendar view in [BookingTool.jsx](file:///d:/kiaan/Tatto_Project002/frontend/src/components/BookingTool.jsx) as per client request.
- **IMPLEMENTED (2026-08-11 | 18:50 IST): Swiss (nFADP) & GDPR Compliant Cookie Banner (`CookieBanner.jsx`)**: Built a fully compliant, floating cookie banner anchored to the bottom of the page with Tattooplatz aesthetic (`#000000`, `#FFFFFF`, `#FF66C4` neon pink). Features: (1) Accept All, (2) Essential Only, and (3) Customize Preferences drawer (Essential, Analytics, Marketing toggles). Stores consent in `localStorage` under `tattooplatz_cookie_consent` with a 365-day (1 year) retention period. Includes direct link to `/legal` and an interactive "Cookie Preferences" trigger in `Footer.jsx` to re-open the preference modal anytime for testing or updates.
- **IMPLEMENTED STEP 2 (2026-08-06 | 14:58 IST): Admin Password Security & Forgot Password OTP System**: 1) Fixed header user menu in `AdminDashboard.jsx` and passed `currentUser` from `App.jsx` — top right header now dynamically displays the actual logged-in admin (e.g. BEA, LUCY, TULI) instead of static Chris profile. 2) Added `sendOTPEmail` in `email.service.js`, added `requestOTP`, `verifyOTP`, `resetPasswordOTP`, `changePassword` in `authController.js` & `authRoutes.js`, and added helper methods in `api.js`. 3) Added interactive "Forgot Password?" OTP modal to `LoginPage.jsx` (Email -> 6-digit OTP -> New Password). 4) Added "Change Admin Password" card in `AdminDashboard.jsx` Settings tab. Password updates save directly to MySQL database with bcrypt hashing. Next: STEP 3 (Admin User Management Panel in TEAM tab).
- **OUR MISSION (June 2026):**
  - Block 1: Added after `<VisaWidget />` using the `/action.png` image (right column) and the description: *"Welcome to Tattooplatz, your modern co-working tattoo studio in the heart of Zurich!..."* (left column).
  - Block 2: Added below Block 1 using `/studio2.png` (left column) and the 3 description paragraphs starting with: *"What sets us apart from other studios?..."*, *"Our studio is fully equipped..."*, and *"Tattooplatz is located in a prime spot..."* (right column) in an alternating responsive grid layout.
  - Block 3: Added below Block 2 using a full-width block container with text paragraphs on top starting with *"In addition to the ideal..."* and the wide horizontal image `/our-mission.png` at the bottom.
- **PHILOSOPHY SECTION COMMENTED OUT (June 2026):** The Philosophy section (containing "WHY TATTOOPLATZ IS DIFFERENT", "4+ Stations", and "Included in Rent") has been commented out in [About.jsx](file:///d:/Kiaan%20technoligy/TATTOOPLATZ/src/components/About.jsx) per client request.
  - **How to Restore:** Open [About.jsx](file:///d:/Kiaan%20technoligy/TATTOOPLATZ/src/components/About.jsx), search for `{/* ── Mission & Philosophy (COMMENTED OUT) ──`, and remove the comment wrappers `{/*` at line 179 and `*/}` at the end of the div section (around line 223) to make it active again.

### Pricing Section (`Pricing.jsx`)
- 4 cards: 3H (90 CHF), 4H (120 CHF), 6H (180 CHF), 8H (220 CHF).
- Featured 4H card has a glowing shadow, black background, and pink CTA.
- Curved cards (`rounded-xl`) and pilled CTA buttons (`rounded-full`).
- **TRIMMED (June 2026):** Removed verbose desc lines from all 4 cards. Feature list reduced from 6 to 3 key items. Header sub-text shortened.
- **UPDATED (2026-08-05 | 14:41 IST):** Removed all features/description bullet text ('Hydraulic chair & workstation', 'LED lighting & Wi-Fi', 'All cleaning supplies included') from all 4 pricing cards as per client request. Features array removed from `plans` data and `<ul>` features render block removed from JSX in `Pricing.jsx`.

### Custom Booking Tool (`BookingTool.jsx`)
- 5-step interactive wizard (Duration, Date, Time & Station, Account Creation/Registration with terms & compliance checkbox, Confirmation).
- Rounded stepper nodes, curved session selection blocks (`rounded-xl`), and rounded calendar grids.
- Multi-session cart allowing multiple bookings to be stored and processed together.
- **Compliance Alignment:** Customer registration features mandatory checkbox acknowledgment for EasyGov and Hygiene rules (no customer file uploads required during booking).


### Personal Artist Dashboard (`ArtistDashboard.jsx`)
- Mock authentication portal welcome view.
- Personal calendar view highlighting active bookings with custom hover tooltips.
- Booking listings table with reschedule/cancel action modals.
- Editable profile contact form with validation and save feedback toast.
- Rounded forms (`rounded-xl`), inputs (`rounded-lg`), and buttons (`rounded-full`).

### Master Admin Dashboard (`AdminDashboard.jsx`)
- Overview stats panel showing estimated monthly revenue, unit count, and total bookings.
- Master Timeline matrix grid representing parallel station columns.
- Station block-out configuration widget (manual slot locking).
- Full log listing search table with record cancellation.
- Workstation capacity managers and open/close hour adjusters.
- All panels, modals, buttons, and select dropdowns styled with curves.
- **Customer Inquiries Tab (June 2026):** Linked the homepage footer inquiry form directly to a new "Inquiries" tab in the Admin Dashboard. Submissions from the website footer are propagated to global React state (with persistence in `localStorage`) and are displayed in the Admin Dashboard as aesthetic cards, complete with options to delete the inquiry and email replies.
- **Connected Booking Tool (June 2026):** Lifted the bookings log list to global React state in `App.jsx` with `localStorage` persistence. The homepage station booking wizard (Step 2 booking tool) and shopping cart checkout are now fully connected to the Admin Dashboard. Any station booked by a user on the homepage immediately appears in the Admin Dashboard's Bookings Log and Master Timeline matrix in real-time.
  * *Fixed Date Mismatch:* Mapped local timezone-safe date strings (`YYYY-MM-DD`) from `selectedDate` to prevent timezone offsets from shifting dates.
  * *Client Details Integration:* Captured client profile fields (Email, Phone, Instagram) in booking logs.
  * *View Booking Modal:* Added a **View** action button (Eye icon) in the Bookings Log table which opens a modal displaying full client contact info and booking receipts.

### Contact Page (`ContactPage.jsx`)
- Dedicated page toggled via `currentPage` state in App.jsx.
- Contact form with inputs and pilled send message buttons.
- FAQ accordion with open/close animations.
- Google Maps live interactive location embed in a curved container.

### Testimonials Section (`Testimonials.jsx`)
- 6 artist review cards with star ratings.
- Glowing hover effects, quote marks, and curved borders (`rounded-xl`).
- **UPDATED (June 2026):** Truncated review texts to exactly 1 line (using Tailwind `line-clamp-1`), added an interactive "Read More / Read Less" button, and reduced card padding/margins (`p-5` instead of `p-7`, smaller margins) to optimize whitespace. Configured the grid container with `items-start` so that other cards do not stretch when a single card is expanded.

### Team Section (`Team.jsx`)
- 6 members (Chris, Tuli, Bea, Sarah, Lucky, Leonie).
- All 6 members use locally served PNG assets (`/chris.png`, `/tuli.png`, `/bea.png`, `/sarah.png`, `/lucky.png`, `/leonie.png`) to load instantly and prevent external CDN latency.
- Rounded card wrappers (`rounded-xl`) and roles badges (`rounded-full`).
- **FIXED (June 2026):** Corrected descriptions for Sarah, Lucky, and Leonie.
- **UPDATED (June 2026):** Truncated member descriptions to exactly 1 line (using Tailwind `line-clamp-1`), added toggleable "Read More / Read Less" buttons, removed the height constraint `min-h-[16rem]` for compact cards, and configured `items-start` on the grid container so unexpanded cards do not stretch.

### About Us Section (`AboutUs.jsx`)
- Group founders photo and philosophy descriptions.
- Curved cards and aspect-ratio scaling to prevent layout shifts.
- **UPDATED (June 2026):** Removed the 3 feature cards (100% Your Earnings, Fully Equipped Space, Creative Community) at the bottom per client request.

### Navbar (`Navbar.jsx`)
- responsive menu links: START | BOOK A SESSION | STUDIO | TEAM | ABOUT US | MERCHANDISE | CONTACT US.
- Replaced the plain text brand logo with the official horizontal wordmark (`logo-1.png`).
- Adjusted desktop link sizes (`text-[10px] xl:text-[11px]`) and spacing (`space-x-2 xl:space-x-4`).
- Rounded mobile menu links (`rounded-lg`) and pilled desktop/mobile login buttons (`rounded-full`).

### Merch Section (`Merch.jsx`)
- Updated products list to include `checkoutUrl` mappings (Stripe checkout links synced with Printful).
- Configured CTA buttons on product cards to dynamically show **"Buy Now"** and open the link in a new tab if `checkoutUrl` is present, or fallback to **"Add to Cart"** and local cart state if absent.

## 4. Public Folder Assets
| File | Used In |
|------|---------|
| `logo-1.png` | Main Navbar (Top Header) + LoginPage + Sidebar Headers (Admin/Artist Dashboards) |
| `logo-2.png` | Alternate Black X Icon mark (Short version) |
| `logo-3.png` | Browser Favicon (`index.html`) - White X inside black circular badge |
| `logo-4.png` | Alternate White Widescreen Wordmark |
| `studio.png` | Hero (right image) + Studio gallery |
| `studio1.png` – `studio8.png` | Studio gallery (9 total photos) |
| `team-founders-highres.png` | About Us section (group photo) |
| `sarah.png` | Team section |
| `lucky.png` | Team section |
| `leonie.png` | Team section |

## 5. Strict Constraints & Rules
- **Aesthetic Excellence:** Ensure curved components, responsive spacing, and smooth micro-animations are maintained.
- **Image Quality Rule:** Keep team photos and logo assets unblurred and colored exactly as provided.
- **No Backend Yet:** UI is managed strictly via client-side state.
- **Data Migration:** SimplyBook migration plan is prepared.
- **Documentation First:** Ensure `memory.md`, `task.md`, and `walkthrough.md` are kept up to date.

---

## 6. Artist Onboarding + Team Tab + Multi-Login — APPROVED PLAN (June 19, 2026)

### ✅ Approved Feature Set:

#### Flow: Bookings Log → Onboard → Artist Login → Personal Dashboard
1. Artist books on website → appears in Admin Bookings Log.
2. Admin clicks **ONBOARD** (new button in Bookings Log) → modal opens → sets password.
3. Artist is added to `registeredArtists[]` in App.jsx (localStorage).
4. Artist goes to Login Page → enters email + admin-set password → Dashboard opens.
5. Artist Dashboard shows ONLY that artist's bookings (filtered by email from global state).
6. "Book a Station" in Artist Dashboard syncs back to global bookings (Admin sees it too).

#### Artist Directory Tab Changes:
- **REMOVED:** "REGISTER NEW ARTIST" button (artists come from Bookings Log only).
- **ADDED:** "PASS" column in table (shows password admin set during onboarding).

#### New TEAM Tab (Admin Dashboard):
- Separate tab for studio personal team members (Chris, Tuli, Bea, Sarah, Lucky, Leonie).
- "+ ADD TEAM MEMBER" button → modal form (Name, Role, Email, Phone).
- Separate from Guest Artists entirely.

### Files to Change:
- `App.jsx` — registeredArtists state, seed data, prop passing
- `AdminDashboard.jsx` — ONBOARD button+modal, PASS column, TEAM tab
- `LoginPage.jsx` — dynamic artist login from registeredArtists
- `ArtistDashboard.jsx` — remove mockInitialBookings, filter global bookings by email

### 🔴 Critical Logic Gaps Identified (as of June 19, 2026)

#### Gap 1 — Login System supports only 1 hardcoded artist + 1 hardcoded admin
- `LoginPage.jsx` only accepts `artist@tattooplatz.ch / artist123` and `admin@tattooplatz.ch / admin123`.
- No real signup / registration. Any new artist cannot log in.
- Marco V., Alina R., Jonas K., Sofia M. — none of them can log in.

#### Gap 2 — Artist Dashboard data is completely isolated (not synced with Admin)
- `ArtistDashboard.jsx` uses a hardcoded `mockInitialBookings` array (3 fixed entries for Joao).
- When Sarah books via website → it appears in **Admin Dashboard** ✅ but NOT in **Artist Dashboard** ❌.
- Artist Dashboard does not read from the global `bookings` state in `App.jsx`.
- Stats (Upcoming Bookings, Hours Rented, Total Rent Paid) are computed from mock data only.

#### Gap 3 — "Book a Station" inside Artist Dashboard is disconnected from Admin
- Artist Dashboard's "Book a Station" tab adds booking to its own local state only.
- This booking is invisible to Admin Dashboard's Bookings Log and Timeline.
- Double booking is possible (same station, same time can be booked from both places).

---

### 🎯 Next Implementation Plan (Approved by Client)

#### Phase 1 — Multi-Artist Login + Global Bookings Sync
**Files to change:** `App.jsx`, `LoginPage.jsx`, `ArtistDashboard.jsx`

1. **`App.jsx`:**
   - Add `registeredArtists` state (saved in `localStorage`).
   - Seed with initial 5 artists (Joao, Marco, Alina, Jonas, Sofia) with passwords.
   - When Admin uses "Register New Artist" in Admin Dashboard → auto-add to `registeredArtists`.
   - Pass `registeredArtists` to `LoginPage` for dynamic login validation.
   - Pass global `bookings` + `setBookings` to `ArtistDashboard`.

2. **`LoginPage.jsx`:**
   - Replace hardcoded artist check with a lookup in `registeredArtists` array.
   - Return matched artist profile object on success.

3. **`ArtistDashboard.jsx`:**
   - Remove `mockInitialBookings` entirely.
   - Accept `bookings` + `setBookings` + `onAddBooking` as props from `App.jsx`.
   - Filter global `bookings` by `currentUser.email` to show only that artist's bookings.
   - "Book a Station" tab → calls `onAddBooking` to add to global state (syncs with Admin).

#### Phase 2 — Admin Artist Registration creates Login Credentials
- When Admin clicks "Register New Artist" and fills the form → artist is added to `registeredArtists` with a default password.
- Admin can see/copy the auto-generated credentials.
- Artist can then login and see their own dashboard.

---

### 📊 Data Flow Diagram (Target State after fix)

```
Website Homepage Booking Form
    → regForm (name, email, phone, ig)
    → onBookingConfirm() in App.jsx
    → Global bookings[] (localStorage)

Admin Dashboard
    → Reads global bookings[] ✅
    → Bookings Log, Timeline, Revenue Reports
    → "Register New Artist" → registeredArtists[]

Artist Login (email + password)
    → LoginPage checks registeredArtists[]
    → onLoginSuccess({ email, name, role:'artist' })
    → ArtistDashboard opens

Artist Dashboard
    → Filters global bookings[] by artist.email ✅
    → Shows only that artist's bookings
    → "Book a Station" → adds to global bookings[]
    → Admin Dashboard sees it instantly ✅---

## 7. Full MySQL Database & Cross-Browser Live Sync Updates (August 2026)

### Key Architectural Updates Implemented:
1. **Frontend-Backend API Connection ([frontend/.env](file:///d:/kiaan/Tatto_Project002/frontend/.env) & [api.js](file:///d:/kiaan/Tatto_Project002/frontend/src/services/api.js)):**
   - Corrected `VITE_API_URL` to point to Node.js backend port 5000 (`https://tatto-lalit-production.up.railway.app/api`).
   - Enhanced `fetchWithAuth` helper in `api.js` to parse text and JSON safely and provide explicit HTTP status error messages for missing tokens or empty responses.

2. **XAMPP MySQL Database Auto-Initialization ([backend/config/db.js](file:///d:/kiaan/Tatto_Project002/backend/config/db.js)):**
   - Implemented automated database creation (`CREATE DATABASE IF NOT EXISTS tattooplatz_db`) and schema table creation on server startup.
   - Auto-creates all 5 tables: `users`, `stations`, `bookings`, `inquiries`, `manager_settings`.
   - Auto-seeds stations 1-4, default Studio Manager Chris (`chris@tattooplatz.ch`), default artists, and initial sample bookings into XAMPP MySQL.

3. **Public Booking Persistence & Cart Guard ([App.jsx](file:///d:/kiaan/Tatto_Project002/frontend/src/App.jsx) & [BookingTool.jsx](file:///d:/kiaan/Tatto_Project002/frontend/src/components/BookingTool.jsx)):**
   - Added synchronous cart reference (`lastCreatedCartRef`) in `BookingTool.jsx` so booking cart sessions are preserved during Login, Register, and Guest Checkout flows.
   - Added fallback payload validation in `App.jsx` (`artist`, `email`, `station`, `price`) to ensure public website bookings post to `POST /api/bookings/public` and save permanently into XAMPP `bookings` table.

4. **Real-time Cross-Browser Live Polling:**
   - Unblocked `/api/bookings/admin/all` master log route in `backend/routes/bookingRoutes.js`.
   - Added automatic 4-second background synchronization in `App.jsx` (`setInterval(fetchLiveBookings, 4000)`).
   - Any booking created in Chrome automatically propagates to Microsoft Edge, Safari, and Mobile devices within 4 seconds without manual page refreshes.

5. **Timezone-Safe Date Parsing:**
   - Refactored `dateStr` calculation in `App.jsx` to parse year, monthIndex, and day locally (`new Date(y, m, d)`), eliminating 1-day date offset shifts (e.g. 11 vs 12 August) across different browser engines.

6. **Error & Syntax Guard Fixes:**
   - Resolved `@babel/parser` syntax errors in `BookingTool.jsx`.
   - Fixed `managerSettings.operatingHours.open` undefined crashes by adding `JSON.parse` guards and optional chaining (`?.`).



