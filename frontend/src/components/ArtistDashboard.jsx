import React from 'react';
import { Calendar, User, ShoppingBag, Clock, MapPin, Instagram, Phone, Mail, LogOut, CheckCircle, AlertCircle, Edit, Trash2, X, Menu, CreditCard, FileText, BookOpen, Plus, ShieldAlert, Settings, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getPricingForDay } from '../utils/pricing';



export default function ArtistDashboard({ managerSettings, user, onLogout, onUpdateUser, bookings = [], setBookings }) {
  const navigate = useNavigate();
  const openingHour = parseInt((managerSettings?.operatingHours?.open || '10:00').split(':')[0]);
  const closingHour = parseInt((managerSettings?.operatingHours?.close || '18:00').split(':')[0]);

  const [activeTab, setActiveTab] = React.useState('overview');
  const [selectedCalendarDate, setSelectedCalendarDate] = React.useState(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = React.useState(false);

  // Mandatory legal agreements state
  const [agreedTerms, setAgreedTerms] = React.useState(false);
  const [agreedCancellation, setAgreedCancellation] = React.useState(false);

  // Filter: show only this artist's active (non-cancelled) bookings from global state
  const myBookings = bookings.filter(bookingItem => {
    const itemEmail = (bookingItem.email || bookingItem.artist_email || '').trim().toLowerCase();
    const userEmail = (user?.email || '').trim().toLowerCase();
    return itemEmail === userEmail && 
           bookingItem.status !== 'Cancelled' &&
           bookingItem.dateStr !== 'Invalid Date';
  });
  // All bookings including cancelled (for full history view)
  const myAllBookings = bookings.filter(bookingItem => {
    const itemEmail = (bookingItem.email || bookingItem.artist_email || '').trim().toLowerCase();
    const userEmail = (user?.email || '').trim().toLowerCase();
    return itemEmail === userEmail;
  });

  // Profile state — initialized from login data (populated during onboarding)
  const [profile, setProfile] = React.useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    ig: user?.ig || user?.instagram || '',
    bio: user?.bio || ''
  });

  // Sync profile state when user prop changes
  React.useEffect(() => {
    if (user) {
      setProfile({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        ig: user.ig || user.instagram || '',
        bio: user.bio || ''
      });
    }
  }, [user]);

  const [showProfileSuccess, setShowProfileSuccess] = React.useState(false);
  const [isProfileOpen, setIsProfileOpen] = React.useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = React.useState(false);

  // Fetch backend bookings to ensure data is synced
  React.useEffect(() => {
    const fetchBackendBookings = async () => {
      try {
        const { bookingAPI } = await import('../services/api.js');
        const res = await bookingAPI.getMyBookings();
        if (res && res.bookings && res.bookings.length > 0) {
          const synced = res.bookings.map(dbB => ({
            id: dbB.id,
            artist: user?.name || 'Artist',
            email: user?.email || '',
            phone: user?.phone || '',
            instagram: user?.ig || '',
            date: (dbB.booking_date && typeof dbB.booking_date === 'string') 
                    ? dbB.booking_date.split('T')[0] 
                    : (dbB.booking_date instanceof Date ? dbB.booking_date.toISOString().split('T')[0] : ''),
            dateStr: dbB.booking_date && !isNaN(new Date(dbB.booking_date).getTime()) 
                     ? new Date(dbB.booking_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) 
                     : 'Invalid Date',
            timeStr: `${dbB.start_hour}:00 - ${dbB.end_hour}:00`,
            start: Number(dbB.start_hour),
            end: Number(dbB.end_hour),
            station: Number(dbB.station_id),
            duration: Number(dbB.end_hour) - Number(dbB.start_hour),
            price: Number(dbB.total_price),
            status: dbB.status || 'Confirmed',
            location: dbB.location || 'Zurich',
            source: 'Backend Sync'
          }));
          
          setBookings(prev => {
            const existingIds = new Set(prev.map(b => b.id));
            const newToAdd = synced.filter(s => !existingIds.has(s.id));
            return [...newToAdd, ...prev];
          });
        }
      } catch (err) {
        console.log('Backend sync offline for fetching bookings:', err.message);
      }
    };
    if (user?.email) {
      fetchBackendBookings();
    }
  }, [user?.email, setBookings]);

  // Cancellation Modal States
  const [cancellingBooking, setCancellingBooking] = React.useState(null);

  // Legal Overlay States
  const [showTermsOverlay, setShowTermsOverlay] = React.useState(false);
  const [showCancelOverlay, setShowCancelOverlay] = React.useState(false);

  // Rescheduling Modal States
  const [reschedulingBooking, setReschedulingBooking] = React.useState(null);
  const [newDate, setNewDate] = React.useState('');
  const [newTime, setNewTime] = React.useState('11:00 - 15:00');

  // Get today's date in YYYY-MM-DD format (for default booking date)
  const todayStr = React.useMemo(() => {
    const t = new Date();
    const yyyy = t.getFullYear();
    const mm = String(t.getMonth() + 1).padStart(2, '0');
    const dd = String(t.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }, []);

  // 24-Hour Booking Management Policy helper
  // Returns true if less than 24 hours remain before the booking start time.
  // Appointment time is always interpreted in Europe/Zurich local time (studio timezone)
  // regardless of the user's browser locale or timezone, ensuring accuracy worldwide.
  const isWithin24Hours = (booking) => {
    if (!booking?.date) return false;
    const startHour = booking.start ?? parseInt((booking.timeStr || '10:00').split(':')[0]) ?? 10;

    // Build appointment timestamp in Zurich local time by getting the UTC offset
    // that Zurich observes on the actual appointment date (handles DST automatically).
    const zurichFormatter = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Europe/Zurich',
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: false
    });

    // Parse the appointment as a naive local Zurich time string, then resolve UTC
    const naiveDateStr = `${booking.date}T${String(startHour).padStart(2, '0')}:00:00`;
    // Temporarily treat it as UTC to get a Date object, then correct for Zurich offset
    const naiveUTC = new Date(naiveDateStr + 'Z');
    
    // Safely handle invalid dates to prevent RangeError
    if (isNaN(naiveUTC.getTime())) return false;

    // Format naiveUTC as Zurich time to find what Zurich clock reads at that UTC instant
    const parts = zurichFormatter.formatToParts(naiveUTC);
    const get = (type) => parseInt(parts.find(p => p.type === type)?.value ?? '0');
    // Difference: (what Zurich clock reads) - (what UTC reads) = Zurich offset in ms
    const zurichClockMs = Date.UTC(get('year'), get('month') - 1, get('day'), get('hour'), get('minute'), get('second'));
    const offsetMs = zurichClockMs - naiveUTC.getTime(); // Zurich is ahead of UTC
    // Correct: appointmentUTC = naiveUTC shifted back by Zurich offset
    const appointmentUTC = new Date(naiveUTC.getTime() - offsetMs);

    const now = new Date();
    const hoursRemaining = (appointmentUTC - now) / (1000 * 60 * 60);
    return hoursRemaining < 24;
  };

  // Direct Booking Form State
  const [bookingForm, setBookingForm] = React.useState({
    date: todayStr,
    station: 1,
    duration: 4,
    startHour: 10,
    location: 'Zurich'
  });

  // Success toast message
  const [toastMessage, setToastMessage] = React.useState('');

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    const updated = {
      name: profile.name,
      email: profile.email,
      phone: profile.phone,
      ig: profile.ig,
      instagram: profile.ig,
      bio: profile.bio
    };

    // Update parent state (currentUser & registeredArtists) and localStorage
    onUpdateUser?.(updated);

    // Sync with MySQL Backend
    try {
      const { authAPI } = await import('../services/api.js');
      const res = await authAPI.updateProfile({
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        instagram: profile.ig,
        bio: profile.bio
      });

      if (res && res.user) {
        const syncedUser = {
          name: res.user.name || profile.name,
          email: res.user.email || profile.email,
          phone: res.user.phone !== undefined ? res.user.phone : profile.phone,
          ig: res.user.instagram || profile.ig,
          instagram: res.user.instagram || profile.ig,
          bio: res.user.bio !== undefined ? res.user.bio : profile.bio,
          role: 'artist'
        };
        onUpdateUser?.(syncedUser);
      }
    } catch (err) {
      console.log('Backend profile sync offline:', err.message);
    }

    setShowProfileSuccess(true);
    triggerToast('Profile settings updated successfully!');
    setTimeout(() => setShowProfileSuccess(false), 3000);
  };

  const confirmCancel = async () => {
    if (!cancellingBooking) return;

    // Call MySQL Backend API to persist cancellation in database
    try {
      const { bookingAPI } = await import('../services/api.js');
      await bookingAPI.cancelBooking(cancellingBooking.id);
    } catch (err) {
      console.log('Backend booking cancel offline:', err.message);
    }

    // Mark as Cancelled in global state (keeps record for admin, removes from active slots)
    setBookings(prev => prev.map(b =>
      b.id === cancellingBooking.id ? { ...b, status: 'Cancelled' } : b
    ));
    triggerToast(`Booking for ${cancellingBooking.dateStr} has been cancelled.`);
    setCancellingBooking(null);
  };

  const confirmReschedule = (e) => {
    e.preventDefault();
    if (!reschedulingBooking || !newDate) return;

    const parsedDate = new Date(newDate + 'T00:00:00');
    const dayOfWeek = parsedDate.getDay(); // 0 = Sun, 1 = Mon, 2 = Tue
    const daysMap = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayName = daysMap[dayOfWeek];

    // Strict Client Business Rule: Studio CLOSED on configured days
    if (!managerSettings?.openingDays?.[dayName]) {
      triggerToast(`⚠️ Studio is CLOSED on ${dayName}s. Please select another date!`);
      return;
    }

    const options = { month: 'long', day: 'numeric', year: 'numeric' };
    const dateStr = parsedDate.toLocaleDateString('en-US', options);

    // Parse start/end from the selected time string e.g. '11:00 - 15:00'
    const timeParts = newTime.split(' - ');
    const newStart = parseInt(timeParts[0]?.split(':')[0]) || reschedulingBooking.start;
    const newEnd = parseInt(timeParts[1]?.split(':')[0]) || reschedulingBooking.end;

    // Strict Client Business Rule: Rescheduled booking cannot exceed closing time
    if (newEnd > closingHour) {
      triggerToast(`⚠️ Rescheduled booking exceeds studio operating hours! The studio closes at ${closingHour}:00.`);
      return;
    }

    // Check if selected station is already occupied at that time on that date (excluding this booking itself)
    const conflict = bookings.find(b =>
      b.id !== reschedulingBooking.id &&
      b.date === newDate &&
      Number(b.station) === Number(reschedulingBooking.station) &&
      b.status !== 'Cancelled' &&
      (b.location || 'Zurich') === reschedulingBooking.location &&
      !(newEnd <= Number(b.start) || newStart >= Number(b.end))
    );

    if (conflict) {
      triggerToast(`⚠️ Station ${reschedulingBooking.station} at ${reschedulingBooking.location} is already booked ${conflict.start}:00–${conflict.end}:00 on that date. Please choose another time slot!`);
      return;
    }

    const newDuration = newEnd - newStart;
    const newPrice = getDurationPrice(newDuration, newDate);

    setBookings(prev => prev.map(b => {
      if (b.id === reschedulingBooking.id) {
        return {
          ...b,
          date: newDate,
          dateStr,
          timeStr: newTime,
          start: newStart,
          end: newEnd,
          duration: newDuration,
          price: newPrice,
          source: 'Artist Portal (Rescheduled)'
        };
      }
      return b;
    }));

    triggerToast(`Booking successfully rescheduled to ${dateStr}.`);
    setReschedulingBooking(null);
  };

  // Get package price based on duration
  const getDurationPrice = (d, selectedDate) => {
    const duration = parseInt(d);
    const key = `${duration}H`;
    const currentPricing = getPricingForDay(managerSettings?.pricing, selectedDate);
    const price = currentPricing?.[key];
    return price !== undefined && price !== '' ? Number(price) : (duration * 30); // fallback
  };

  // Direct Booking Handler — syncs to global state and MySQL backend (Admin Dashboard also sees it)
  const handleDirectBookingSubmit = async (e) => {
    e.preventDefault();
    const parsedDate = new Date(bookingForm.date + 'T00:00:00');
    const dayOfWeek = parsedDate.getDay(); // 0 = Sun, 1 = Mon, 2 = Tue
    const daysMap = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayName = daysMap[dayOfWeek];

    // Strict Client Business Rule: Studio CLOSED on configured days
    if (!managerSettings?.openingDays?.[dayName]) {
      triggerToast(`⚠️ Studio is CLOSED on ${dayName}s. Please select another date!`);
      return;
    }

    const dateStr = parsedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    const durationHours = parseInt(bookingForm.duration);
    const startH = parseInt(bookingForm.startHour);
    const endH = startH + durationHours;

    // Strict Client Business Rule: Booking cannot exceed closing time
    if (endH > closingHour) {
      triggerToast(`⚠️ Booking exceeds studio operating hours! The studio closes at ${closingHour}:00. Please select a shorter duration or earlier start hour!`);
      return;
    }

    // Auto-assign first available station (from Stations 1 to 4)
    let assignedStation = null;
    for (let stationNum = 1; stationNum <= 4; stationNum++) {
      const conflict = bookings.find(b =>
        b.date === bookingForm.date &&
        Number(b.station) === stationNum &&
        b.status !== 'Cancelled' &&
        (b.location || 'Zurich') === bookingForm.location &&
        !(endH <= Number(b.start) || startH >= Number(b.end))
      );
      if (!conflict) {
        assignedStation = stationNum;
        break; // Found a free station!
      }
    }

    if (!assignedStation) {
      triggerToast(`⚠️ No workstations are available for the selected time slot (${startH}:00 – ${endH}:00) on this date. Please choose another slot!`);
      return;
    }

    const price = getDurationPrice(durationHours);

    // Call MySQL Backend API for instant server synchronization
    let backendBookingId = null;
    try {
      const { bookingAPI } = await import('../services/api.js');
      const res = await bookingAPI.createPublicBooking({
        artist: user?.name || 'Artist',
        email: user?.email || '',
        phone: user?.phone || '',
        instagram: user?.ig || user?.instagram || '',
        date: bookingForm.date,
        start: startH,
        end: endH,
        station: assignedStation,
        price: price,
        location: bookingForm.location
      });
      if (res && res.bookingId) {
        backendBookingId = res.bookingId;
      }
    } catch (err) {
      console.log('Backend sync offline, saved to local state:', err.message);
    }

    const newB = {
      id: backendBookingId || Date.now(),
      artist: user?.name || 'Artist',
      email: user?.email || '',
      artist_name: user?.name || 'Artist',
      artist_email: user?.email || '',
      phone: user?.phone || '',
      instagram: user?.ig || user?.instagram || '',
      date: bookingForm.date,
      dateStr,
      timeStr: `${startH}:00 - ${endH}:00`,
      start: startH,
      end: endH,
      station: assignedStation,
      duration: durationHours,
      price: price,
      status: 'Confirmed',
      location: bookingForm.location,
      source: 'Artist Portal'
    };

    // Add to GLOBAL bookings — visible in Admin Dashboard immediately
    setBookings(prev => [newB, ...prev.filter(b => String(b.id) !== String(newB.id))]);
    triggerToast(`Station ${assignedStation} successfully booked for ${dateStr}!`);
    setActiveTab('bookings');
  };


  // Calendar: current year/month with navigation capability
  const [calYear, setCalYear] = React.useState(() => new Date().getFullYear());
  const [calMonth, setCalMonth] = React.useState(() => new Date().getMonth()); // 0-indexed

  const goToPrevMonth = () => {
    if (calMonth === 0) {
      setCalMonth(11);
      setCalYear(y => y - 1);
    } else {
      setCalMonth(m => m - 1);
    }
  };

  const goToNextMonth = () => {
    if (calMonth === 11) {
      setCalMonth(0);
      setCalYear(y => y + 1);
    } else {
      setCalMonth(m => m + 1);
    }
  };

  const calMonthName = new Date(calYear, calMonth, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const calDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Check if a day has a booking (for calendar highlight) — uses myBookings only for current month
  const bookingsByDayNum = myBookings.reduce((acc, b) => {
    const parts = b.date.split('-');
    if (parts.length === 3) {
      const bYear = parseInt(parts[0]);
      const bMonth = parseInt(parts[1]) - 1; // 0-indexed
      const bDay = parseInt(parts[2]);
      if (bYear === calYear && bMonth === calMonth) {
        acc[bDay] = b;
      }
    }
    return acc;
  }, {});

  // Map myBookings to invoices
  const mockInvoices = myBookings.map((b, idx) => ({
    id: `INV-${b.date?.replace(/-/g, '')?.slice(0, 8) || '20260619'}-${1000 + idx}`,
    date: b.dateStr,
    amount: `${b.price}.00 CHF`,
    status: 'Paid',
    bookingId: b.id
  }));

  return (
    <div className="min-h-screen bg-zinc-50 text-black font-sans flex flex-col lg:flex-row relative">

      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-black border border-studio-pink/30 text-white px-5 py-3 shadow-[0_4px_20px_rgba(255,102,196,0.3)] flex items-center gap-3 animate-slide-up rounded-xl max-w-sm">
          <CheckCircle size={16} className="text-studio-pink" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Backdrop overlay for mobile drawer */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-45 lg:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Navigation Sidebar: Full-height on desktop, Drawer menu on mobile */}
      <aside className={`fixed inset-y-0 left-0 w-64 bg-white border-r border-zinc-200/80 flex flex-col justify-between flex-shrink-0 z-50 transition-transform duration-300 lg:translate-x-0 lg:h-screen lg:sticky lg:top-0 ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}>
        <div>
          {/* Brand Header & Mobile Close Button */}
          <div className="px-6 py-6 border-b border-zinc-100 flex items-center justify-between">
            <img
              src="/logo-1.png"
              alt="Tattooplatz Logo"
              className="h-5.5 w-auto object-contain cursor-pointer transition-transform hover:scale-105"
              onClick={() => setActiveTab('overview')}
            />
            <button
              onClick={() => setIsMobileSidebarOpen(false)}
              className="lg:hidden p-1 text-zinc-400 hover:text-black hover:bg-zinc-100 rounded-lg cursor-pointer transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Navigation Links with larger text and optimal spacing */}
          <nav className="p-4 flex flex-col gap-2">
            {[
              { id: 'overview', label: 'Overview', icon: <User size={18} /> },
              { id: 'bookings', label: 'My Bookings', icon: <Calendar size={18} /> },
              { id: 'book-station', label: 'Book a Station', icon: <Plus size={18} /> },
              { id: 'guidelines', label: 'Guidelines', icon: <BookOpen size={18} /> },
              { id: 'profile', label: 'Settings', icon: <Settings size={18} /> }

            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setIsMobileSidebarOpen(false);
                }}
                className={`px-5 py-3.5 text-[13px] font-black tracking-wider uppercase rounded-xl flex items-center gap-3.5 transition-all duration-200 whitespace-nowrap group cursor-pointer w-full ${activeTab === tab.id
                  ? 'bg-black text-white shadow-sm border-l-4 border-studio-pink pl-4'
                  : 'text-zinc-550 hover:bg-zinc-100/60 hover:text-black'
                  }`}
              >
                <span className={activeTab === tab.id ? 'text-studio-pink' : 'text-zinc-400 group-hover:text-black transition-colors'}>
                  {tab.icon}
                </span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Sidebar Footer: Logout Button */}
        <div className="p-4 border-t border-zinc-100">
          <button
            onClick={onLogout}
            className="w-full py-3.5 px-4 border border-zinc-200 hover:border-red-200 text-zinc-500 hover:text-red-650 text-xs font-black tracking-wider uppercase rounded-xl flex items-center justify-center gap-2 bg-white hover:bg-red-55 transition-all shadow-2xs cursor-pointer"
          >
            <LogOut size={14} /> Logout Portal
          </button>
        </div>
      </aside>

      {/* Right side container */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top Header navbar with Hamburger button for mobile drawer */}
        <header className="sticky top-0 z-30 bg-white border-b border-zinc-200/80 px-6 sm:px-8 py-4 flex items-center justify-between shadow-[0_2px_12px_rgba(0,0,0,0.015)]">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 text-zinc-550 hover:text-black hover:bg-zinc-50 rounded-xl cursor-pointer transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              <Menu size={20} />
            </button>
            <h1 className="text-sm font-black tracking-wider text-black uppercase">
              {activeTab === 'overview' && 'Artist Overview'}
              {activeTab === 'bookings' && 'My Bookings'}
              {activeTab === 'book-station' && 'Book a Workstation'}
              {activeTab === 'invoices' && 'Invoices & Billing'}
              {activeTab === 'guidelines' && 'Studio Guidelines'}
              {activeTab === 'profile' && 'Portal Profile Details'}
            </h1>
          </div>

          {/* Clickable user profile dropdown menu */}
          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 bg-zinc-50 hover:bg-zinc-100/80 border border-zinc-200/80 p-1 sm:pl-1.5 sm:pr-4 sm:py-1.5 rounded-full transition-all duration-200 shadow-2xs cursor-pointer group"
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-studio-pink to-studio-lightpink text-black font-black text-xs flex items-center justify-center shadow-2xs uppercase shrink-0">
                {profile.name.charAt(0)}
              </div>
              <div className="hidden sm:block text-left leading-tight">
                <span className="text-[10px] font-black text-black uppercase block">{profile.name}</span>
                <span className="text-[9px] text-zinc-400 font-sans block">{profile.email}</span>
              </div>
              <span className="hidden sm:inline text-zinc-450 group-hover:text-black transition-colors ml-1 text-[8px] font-bold">▼</span>
            </button>

            {/* Dropdown Menu */}
            {isProfileOpen && (
              <>
                {/* Backdrop overlay */}
                <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)} />

                <div className="absolute right-0 top-full mt-2.5 w-60 bg-white border border-zinc-200/80 rounded-2xl shadow-xl p-6 z-50 animate-scale-in text-left">
                  <div className="border-b border-zinc-100 pb-4 mb-4">
                    <span className="text-[9px] font-bold tracking-widest text-zinc-400 uppercase block mb-1.5">Signed In As</span>
                    <span className="text-sm font-black text-black uppercase block">{profile.name}</span>
                    <span className="text-xs text-zinc-500 font-sans block truncate mt-0.5">{profile.email}</span>
                  </div>

                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      setIsProfileModalOpen(true);
                    }}
                    className="w-full mb-2.5 py-3 px-4 bg-zinc-55 hover:bg-black hover:text-white text-black font-extrabold text-[10px] tracking-wider uppercase rounded-xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <User size={13} className="text-zinc-550" /> View Full Profile
                  </button>

                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      onLogout?.();
                    }}
                    className="w-full py-3 px-4 bg-black hover:bg-red-650 text-white hover:text-white font-extrabold text-[10px] tracking-wider uppercase rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                  >
                    <LogOut size={13} /> Logout Portal
                  </button>
                </div>
              </>
            )}
          </div>
        </header>

        {/* Content View Area */}
        <main className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 max-w-7xl w-full mx-auto flex-1">

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-8 animate-fade-in font-sans">

              {/* Welcome Card */}
              <div className="p-6 bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 border border-zinc-800 rounded-2xl shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-studio-pink/10 rounded-full blur-[60px] pointer-events-none" />
                <div className="relative z-10">
                  <h2 className="text-xl font-black text-white uppercase tracking-wider flex items-center gap-2">
                    WELCOME BACK, {profile.name}!
                  </h2>
                  <p className="text-[11px] text-zinc-400 max-w-md mt-1.5 leading-relaxed font-sans font-medium">
                    You have active co-working station reservations this month. View details, reschedule dates, or modify profile preferences below.
                  </p>
                </div>
                <div className="relative z-10 px-3.5 py-1.5 text-[9px] font-black tracking-widest bg-studio-pink text-black uppercase rounded-full shadow-[0_2px_10px_rgba(255,102,196,0.3)] shrink-0">
                  Active Spot
                </div>
              </div>

              {/* Stats Counters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { title: 'Upcoming Bookings', val: myBookings.length, icon: <Calendar className="text-studio-pink" size={18} />, border: 'border-t-4 border-t-studio-pink' },
                  { title: 'Hours Rented', val: `${myBookings.reduce((a, b) => a + (b.duration || (b.end && b.start ? Number(b.end) - Number(b.start) : 0)), 0)}h`, icon: <Clock className="text-blue-500" size={18} />, border: 'border-t-4 border-t-blue-500' }
                ].map((stat, i) => (
                  <div key={i} className={`p-6 bg-white border border-zinc-200/80 rounded-2xl shadow-xs transition-all duration-300 hover:shadow-md hover:scale-[1.01] ${stat.border} flex items-center justify-between`}>
                    <div>
                      <span className="block text-[8px] font-black text-zinc-400 uppercase tracking-wider">{stat.title}</span>
                      <span className="block text-2xl font-black text-black mt-2 leading-none">{stat.val}</span>
                    </div>
                    <div className="p-2 bg-zinc-50 border border-zinc-100 rounded-xl shadow-2xs">
                      {stat.icon}
                    </div>
                  </div>
                ))}
              </div>

              {/* Calendar & Next Booking Block */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">

                {/* Visual Calendar Grid */}
                <div className="md:col-span-7 p-6 bg-white border border-zinc-200/80 rounded-2xl shadow-xs">
                  <div className="flex items-center justify-between border-b border-zinc-100 pb-3 mb-4">
                    <button
                      type="button"
                      onClick={goToPrevMonth}
                      className="p-1.5 rounded-full hover:bg-zinc-100 border border-zinc-200 text-zinc-600 hover:text-black transition-colors cursor-pointer"
                      title="Previous Month"
                    >
                      <ChevronLeft size={14} />
                    </button>
                    <h4 className="text-[10px] font-black tracking-widest text-zinc-600 uppercase">
                      RESERVATIONS CALENDAR — {calMonthName.toUpperCase()}
                    </h4>
                    <button
                      type="button"
                      onClick={goToNextMonth}
                      className="p-1.5 rounded-full hover:bg-zinc-100 border border-zinc-200 text-zinc-600 hover:text-black transition-colors cursor-pointer"
                      title="Next Month"
                    >
                      <ChevronRight size={14} />
                    </button>
                  </div>
                  <div className="grid grid-cols-7 gap-2.5 text-center font-bold text-xs">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                      <span key={day} className="text-[9px] text-zinc-400 py-1 uppercase">{day}</span>
                    ))}

                    {/* Blank offset cells for correct day-of-week alignment */}
                    {Array.from({ length: (new Date(calYear, calMonth, 1).getDay() + 6) % 7 }).map((_, i) => (
                      <span key={`blank-${i}`} className="h-9" />
                    ))}

                    {calDays.map((day) => {
                      const bookItem = bookingsByDayNum[day];
                      // Build YYYY-MM-DD for this calendar day
                      const dayStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                      const dateObj = new Date(calYear, calMonth, day);
                      const dayOfWeek = dateObj.getDay(); // 0 = Sun, 1 = Mon, 2 = Tue
                      const daysMap = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                      const isClosed = !managerSettings?.openingDays?.[daysMap[dayOfWeek]];
                      const isSelected = selectedCalendarDate === dayStr;
                      const isToday = dayStr === todayStr;

                      return (
                        <div
                          key={day}
                          title={isClosed ? 'Studio Closed' : bookItem ? `Booked: Station ${bookItem.station} | ${bookItem.timeStr}` : `Click to book ${dayStr}`}
                          onClick={() => {
                            if (isClosed) return;
                            setSelectedCalendarDate(dayStr);
                            setBookingForm(prev => ({ ...prev, date: dayStr }));
                            setActiveTab('book-station');
                          }}
                          className={`h-9 flex items-center justify-center text-xs rounded-xl relative group transition-all duration-200 ${isClosed
                            ? 'bg-zinc-100/80 text-zinc-350 line-through opacity-40 cursor-not-allowed pointer-events-none border border-zinc-200/50'
                            : bookItem
                              ? 'bg-studio-pink text-black font-black shadow-[0_0_12px_rgba(255,102,196,0.5)] hover:scale-105 cursor-pointer'
                              : isSelected
                                ? 'bg-black text-white font-black ring-2 ring-studio-pink scale-105 cursor-pointer'
                                : isToday
                                  ? 'bg-zinc-900 text-white font-black ring-2 ring-zinc-400 cursor-pointer'
                                  : 'bg-zinc-50 border border-zinc-100/60 hover:border-studio-pink hover:bg-zinc-100 cursor-pointer'
                            }`}
                        >
                          <span>{day}</span>
                          {/* Tooltip on hover */}
                          {isClosed ? (
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-red-900 text-white text-[9px] font-black tracking-wider uppercase px-2.5 py-1.5 rounded-xl shadow-xl whitespace-nowrap z-20">
                              Closed
                            </div>
                          ) : bookItem ? (
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-black text-white text-[9px] font-black tracking-wider uppercase px-2.5 py-1.5 rounded-xl shadow-xl whitespace-nowrap z-20">
                              Station {bookItem.station} | {bookItem.timeStr}
                            </div>
                          ) : (
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-zinc-800 text-white text-[9px] font-black tracking-wider uppercase px-2.5 py-1.5 rounded-xl shadow-xl whitespace-nowrap z-20">
                              {isToday ? 'Today — Book now' : 'Book this date'}
                            </div>
                          )}
                        </div>
                      );
                    })}

                  </div>
                  <div className="mt-5 flex flex-col gap-2 pl-1">
                    <div className="flex items-center gap-2 text-[10px] text-zinc-550 font-sans font-medium">
                      <span className="w-2.5 h-2.5 bg-studio-pink rounded-md inline-block shadow-[0_0_5px_#FF66C4]" />
                      <span>Highlighted = confirmed booking</span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-zinc-550 font-sans font-medium">
                      <span className="w-2.5 h-2.5 bg-zinc-900 rounded-md inline-block" />
                      <span>Dark = today</span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-zinc-550 font-sans font-medium">
                      <span className="w-2.5 h-2.5 bg-zinc-100 border border-zinc-300 rounded-md inline-block" />
                      <span>Click any date to instantly book that slot</span>
                    </div>
                  </div>
                </div>

                {/* Profile Quick Details */}
                <div className="md:col-span-5 p-6 bg-white border border-zinc-200/80 rounded-2xl shadow-xs space-y-5">
                  <h4 className="text-[10px] font-black tracking-widest text-zinc-400 uppercase border-b border-zinc-100 pb-3">
                    ARTIST INFORMATION
                  </h4>
                  <div className="space-y-4 font-sans text-xs">
                    <div className="flex items-center gap-3.5">
                      <div className="p-2 bg-zinc-50 rounded-lg border border-zinc-100"><Instagram size={14} className="text-studio-pink" /></div>
                      <span className="text-zinc-650 font-mono font-semibold">{profile.ig}</span>
                    </div>
                    <div className="flex items-center gap-3.5">
                      <div className="p-2 bg-zinc-50 rounded-lg border border-zinc-100"><Mail size={14} className="text-studio-pink" /></div>
                      <span className="text-zinc-655 font-semibold">{profile.email}</span>
                    </div>
                    <div className="border-t border-zinc-100 pt-4">
                      <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest block mb-1.5">ARTIST BIO</span>
                      <p className="text-zinc-500 leading-relaxed italic font-medium">"{profile.bio}"</p>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: MY BOOKINGS LIST */}
          {activeTab === 'bookings' && (
            <div className="space-y-6 animate-fade-in font-sans">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                <div>
                  <h3 className="text-base font-black text-black uppercase tracking-wider">ACTIVE RESERVATIONS</h3>
                  <p className="text-xs text-zinc-400 mt-1 font-sans font-medium">Coordinate your co-working sessions at Zurich studio.</p>
                </div>
                <span className="w-fit self-start sm:self-auto text-[9px] font-black tracking-widest bg-white border border-zinc-200 px-3 py-1.5 text-zinc-500 rounded-full shadow-2xs uppercase">
                  {myBookings.length} Confirmed
                </span>
              </div>

              {myBookings.length === 0 ? (
                <div className="p-12 border border-zinc-200 rounded-2xl text-center bg-white shadow-xs text-zinc-400">
                  <AlertCircle size={32} className="mx-auto mb-3 text-studio-pink" />
                  <p className="text-sm font-medium">You do not have any active workstation reservations.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {myBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="p-6 bg-white border border-zinc-200/80 rounded-2xl shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:border-studio-pink transition-all duration-300 relative overflow-hidden"
                    >
                      <div className="absolute top-0 left-0 h-full w-[4px] bg-studio-pink" />

                      <div className="flex items-start gap-4">
                        <div className="p-3.5 bg-zinc-50 border border-zinc-100 text-studio-pink rounded-xl flex-shrink-0 shadow-2xs">
                          <Calendar size={18} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2.5">
                            <span className="text-sm font-black text-black uppercase">{booking.dateStr}</span>
                            <span className="text-[8px] font-black tracking-wider bg-emerald-55 text-emerald-600 border border-emerald-200/50 px-2 py-0.5 uppercase rounded-full">
                              {booking.status}
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-x-5 gap-y-1.5 mt-3 text-xs text-zinc-550 font-sans font-medium">
                            <span className="flex items-center gap-1.5">
                              <Clock size={13} className="text-studio-pink" />
                              {booking.timeStr} ({booking.duration}h)
                            </span>
                            <span className="flex items-center gap-1.5">
                              <MapPin size={13} className="text-studio-pink" />
                              Station {booking.station} ({booking.location || 'Zurich'})
                            </span>
                            <span className="font-black text-black bg-zinc-100 px-2 py-0.5 rounded-lg text-[10px]">
                              {booking.price}.00 CHF
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* 24-Hour Booking Management Policy */}
                      {(() => {
                        const locked = isWithin24Hours(booking);
                        return (
                          <div className="flex flex-col gap-1.5 w-full md:w-auto">
                            <div className="flex gap-2.5 w-full md:w-auto">
                              <button
                                onClick={() => {
                                  if (locked) {
                                    triggerToast('This booking can no longer be modified because less than 24 hours remain before your appointment.');
                                    return;
                                  }
                                  setReschedulingBooking(booking);
                                  setNewDate(booking.date);
                                  setNewTime(booking.timeStr);
                                }}
                                disabled={locked}
                                title={locked ? 'Cannot reschedule within 24 hours of appointment' : 'Reschedule this booking'}
                                className={`flex-1 md:flex-none px-5 py-2.5 border text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-2xs ${locked
                                  ? 'border-zinc-200 bg-zinc-50 text-zinc-350 cursor-not-allowed opacity-60'
                                  : 'border-zinc-250 hover:border-studio-pink hover:text-studio-pink bg-white cursor-pointer'
                                  }`}
                              >
                                <Edit size={12} />
                                Reschedule
                              </button>
                              <button
                                onClick={() => {
                                  if (locked) {
                                    triggerToast('This booking can no longer be modified because less than 24 hours remain before your appointment.');
                                    return;
                                  }
                                  setCancellingBooking(booking);
                                }}
                                disabled={locked}
                                title={locked ? 'Cannot cancel within 24 hours of appointment' : 'Cancel this booking'}
                                className={`flex-1 md:flex-none px-5 py-2.5 border text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-2xs ${locked
                                  ? 'border-zinc-200 bg-zinc-50 text-zinc-350 cursor-not-allowed opacity-60'
                                  : 'border-transparent hover:border-studio-pink bg-zinc-100/60 hover:bg-studio-pink/10 text-zinc-600 hover:text-studio-pink cursor-pointer'
                                  }`}
                              >
                                <Trash2 size={12} />
                                Cancel
                              </button>
                            </div>
                            {locked && (
                              <p className="text-[10px] text-studio-pink font-semibold bg-studio-pink/5 border border-studio-pink/30 rounded-lg px-3 py-2 leading-snug">
                                Bookings can only be managed, rescheduled, or cancelled up to 24 hours before your appointment.
                              </p>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: BOOK A STATION [NEW] */}
          {activeTab === 'book-station' && (
            <div className="bg-white border border-zinc-200/80 p-6 sm:p-8 rounded-2xl shadow-xs animate-fade-in font-sans space-y-6">
              <div>
                <h3 className="text-base font-black text-black uppercase tracking-wider">RENT A WORKSTATION</h3>
                <p className="text-xs text-zinc-450 mt-1 font-sans font-medium">Book standard co-working slots in our Zurich studio in real-time.</p>
              </div>

              <form onSubmit={handleDirectBookingSubmit} className="space-y-5 max-w-xl">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-[9px] font-black tracking-widest text-zinc-500 uppercase mb-2">Select Date *</label>
                    <input
                      required
                      type="date"
                      value={bookingForm.date}
                      min={todayStr}
                      onChange={e => {
                        const selectedVal = e.target.value;
                        if (selectedVal) {
                          const pDate = new Date(selectedVal + 'T00:00:00');
                          const dOfWeek = pDate.getDay();
                          const daysMap = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                          const dayName = daysMap[dOfWeek];
                          if (!managerSettings?.openingDays?.[dayName]) {
                            triggerToast(`⚠️ Studio is CLOSED on ${dayName}s! Please select a valid operating day.`);
                            setBookingForm({ ...bookingForm, date: '' });
                            return;
                          }
                        }
                        setBookingForm({ ...bookingForm, date: selectedVal });
                      }}
                      className="w-full px-4 py-3 bg-zinc-50/50 border border-zinc-200 text-black text-xs font-semibold rounded-xl focus:border-studio-pink focus:outline-none"
                    />
                    {(() => {
                      const daysObj = managerSettings?.openingDays || { Monday: false, Tuesday: false, Wednesday: true, Thursday: true, Friday: true, Saturday: true, Sunday: false };
                      const openDays = Object.entries(daysObj).filter(([_, isOpen]) => isOpen).map(([day]) => day);
                      const closedDays = Object.entries(daysObj).filter(([_, isOpen]) => !isOpen).map(([day]) => day);
                      return (
                        <div className="mt-2.5 space-y-2">
                          <div className="flex items-center gap-2 flex-wrap bg-zinc-50/50 p-2 rounded-lg border border-zinc-200/50">
                            <span className="text-[9px] font-black text-black uppercase tracking-widest flex items-center gap-1">
                              ✓ OPEN DAYS:
                            </span>
                            <div className="flex gap-1.5 flex-wrap">
                              {openDays.length > 0 ? openDays.map(day => (
                                <span key={day} className="px-2 py-1 bg-white text-black shadow-sm border border-zinc-200 rounded text-[8px] font-black uppercase tracking-wider">
                                  {day}
                                </span>
                              )) : <span className="text-[9px] text-zinc-500 font-bold uppercase">None</span>}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap bg-zinc-50/50 p-2 rounded-lg border border-zinc-200/50">
                            <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-1">
                              ✕ CLOSED DAYS:
                            </span>
                            <div className="flex gap-1.5 flex-wrap">
                              {closedDays.length > 0 ? closedDays.map(day => (
                                <span key={day} className="px-2 py-1 bg-zinc-100 text-zinc-400 shadow-sm border border-zinc-200/80 rounded text-[8px] font-black uppercase tracking-wider">
                                  {day}
                                </span>
                              )) : <span className="text-[9px] text-zinc-400 font-bold uppercase">None</span>}
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9px] font-black tracking-widest text-zinc-500 uppercase mb-2">Start Hour</label>
                    <select
                      value={bookingForm.startHour}
                      onChange={e => setBookingForm({ ...bookingForm, startHour: parseInt(e.target.value) })}
                      className="w-full px-4 py-3 bg-zinc-50/50 border border-zinc-200 text-black text-xs font-semibold rounded-xl focus:border-studio-pink focus:outline-none"
                    >
                      {Array.from({ length: closingHour - openingHour - 3 }).map((_, i) => {
                        const h = openingHour + i;
                        return (
                          <option key={h} value={h}>{h}:00 {h >= 12 ? 'PM' : 'AM'}</option>
                        );
                      })}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[9px] font-black tracking-widest text-zinc-500 uppercase mb-2">Duration *</label>
                    <select
                      value={bookingForm.duration}
                      onChange={e => setBookingForm({ ...bookingForm, duration: parseInt(e.target.value) })}
                      className="w-full px-4 py-3 bg-zinc-50/50 border border-zinc-200 text-black text-xs font-semibold rounded-xl focus:border-studio-pink focus:outline-none"
                    >
                      {Object.entries(getPricingForDay(managerSettings?.pricing, bookingForm.date ? new Date(bookingForm.date) : new Date()) || { '4H': 120, '6H': 180, '8H': 220 })
                        .filter(([pkg]) => pkg !== '1H')
                        .map(([pkg, price]) => {
                          const dur = parseInt(pkg.replace('H', ''));
                          return (
                            <option key={dur} value={dur}>{dur} Hours ({price} CHF)</option>
                          );
                        })}
                    </select>
                  </div>
                </div>

                <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-150 flex items-center justify-between">
                  <div>
                    <span className="block text-[8px] font-black text-zinc-400 uppercase tracking-widest">Rate Summary</span>
                    <span className="block text-sm font-black text-black uppercase mt-0.5">
                      {(() => {
                        const hours = bookingForm.duration || 4;
                        const currentPricing = getPricingForDay(managerSettings?.pricing, bookingForm.date ? new Date(bookingForm.date) : new Date());
                        const rawPrice = currentPricing?.[`${hours}H`];
                        const price = rawPrice !== undefined && rawPrice !== '' ? Number(rawPrice) : (hours * 30);
                        return (price / hours).toFixed(2);
                      })()} CHF / Hour Standard
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="block text-[8px] font-black text-zinc-400 uppercase tracking-widest">Estimated Total</span>
                    <span className="block text-lg font-black text-studio-pink">{getDurationPrice(bookingForm.duration)}.00 CHF</span>
                  </div>
                </div>

                {/* Mandatory Legal Agreements */}
                <div className="pt-4 border-t border-zinc-100 flex flex-col gap-3 mb-6">
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <div className="relative flex items-center justify-center mt-0.5 flex-shrink-0">
                      <input
                        type="checkbox"
                        checked={agreedTerms}
                        onChange={(e) => setAgreedTerms(e.target.checked)}
                        className="peer appearance-none w-5 h-5 border-2 border-zinc-300 rounded-md checked:bg-black checked:border-black transition-colors cursor-pointer"
                      />
                      <svg className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 5L4.5 8.5L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <span className="text-xs text-zinc-600 font-medium select-none group-hover:text-black transition-colors">
                      I have read and agree to the <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowTermsOverlay(true); }} className="text-studio-pink hover:underline font-bold bg-transparent border-0 p-0 inline cursor-pointer">Terms &amp; Conditions</button>. *
                    </span>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer group">
                    <div className="relative flex items-center justify-center mt-0.5 flex-shrink-0">
                      <input
                        type="checkbox"
                        checked={agreedCancellation}
                        onChange={(e) => setAgreedCancellation(e.target.checked)}
                        className="peer appearance-none w-5 h-5 border-2 border-zinc-300 rounded-md checked:bg-black checked:border-black transition-colors cursor-pointer"
                      />
                      <svg className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 5L4.5 8.5L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <span className="text-xs text-zinc-600 font-medium select-none group-hover:text-black transition-colors">
                      I have read and agree to the <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowCancelOverlay(true); }} className="text-studio-pink hover:underline font-bold bg-transparent border-0 p-0 inline cursor-pointer">Cancellation Policy</button>. *
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={!agreedTerms || !agreedCancellation}
                  className="px-6 py-3.5 bg-black hover:bg-studio-pink hover:text-black border border-black hover:border-studio-pink text-white font-extrabold text-[10px] tracking-widest uppercase transition-all duration-300 rounded-xl shadow-md cursor-pointer flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-black disabled:hover:border-black disabled:hover:text-white"
                >
                  <Plus size={14} /> Confirm Station Rent
                </button>
              </form>
            </div>
          )}


          {/* TAB 5: STUDIO GUIDELINES [NEW] */}
          {activeTab === 'guidelines' && (
            <div className="space-y-6 animate-fade-in font-sans">
              <div>
                <h3 className="text-base font-black text-black uppercase tracking-wider">STUDIO POLICY & GUIDELINES</h3>
                <p className="text-xs text-zinc-400 mt-1 font-sans font-medium">Essential information for operating inside the coworking studio.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Rules Card 1 */}
                <div className="p-6 bg-white border border-zinc-200/80 rounded-2xl shadow-xs space-y-4">
                  <h4 className="text-[10px] font-black tracking-widest text-zinc-400 uppercase border-b border-zinc-100 pb-3 flex items-center gap-2">
                    <ShieldAlert size={14} className="text-studio-pink" />
                    SWISS REGULATIONS
                  </h4>
                  <div className="space-y-3 text-xs text-zinc-550 leading-relaxed font-medium">
                    <p>
                      All tattoo artists acknowledge that they are solely responsible for ensuring they are properly registered on EasyGov.swiss, where required, at least 8 days before commencing work in Switzerland. Tattooplatz assumes no responsibility or liability for compliance with this registration requirement.
                    </p>
                  </div>
                </div>

                {/* Rules Card 2 */}
                <div className="p-6 bg-white border border-zinc-200/80 rounded-2xl shadow-xs space-y-4">
                  <h4 className="text-[10px] font-black tracking-widest text-zinc-400 uppercase border-b border-zinc-100 pb-3 flex items-center gap-2">
                    <Clock size={14} className="text-studio-pink" />
                    STUDIO HYGIENE CODE
                  </h4>
                  <div className="space-y-3 text-xs text-zinc-550 leading-relaxed font-medium">
                    <p>
                      Single-use needles, grips, and ink caps must be immediately disposed of in the designated biohazard sharps containers.
                    </p>
                    <p>
                      Clean the station frame, desk surface, and client leather chair with cantonal-approved surface disinfectants after every session.
                    </p>
                  </div>
                </div>



              </div>
            </div>
          )}

          {/* TAB 6: PROFILE FORM */}
          {activeTab === 'profile' && (
            <div className="bg-white border border-zinc-200/80 p-6 sm:p-8 rounded-2xl shadow-xs animate-fade-in font-sans">
              <h3 className="text-xs font-black text-black uppercase tracking-wider mb-6 border-b border-zinc-100 pb-4">
                EDIT PORTAL PROFILE DETAILS
              </h3>

              {showProfileSuccess && (
                <div className="mb-6 p-4 bg-studio-pink/10 border border-studio-pink/30 rounded-xl text-studio-pink text-xs font-semibold flex items-center gap-2 animate-fade-in">
                  <CheckCircle size={16} className="text-studio-pink" />
                  Your guest profile details have been saved successfully.
                </div>
              )}

              <form onSubmit={handleProfileSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9px] font-black tracking-widest text-zinc-500 uppercase mb-2">Full Name *</label>
                    <input
                      required
                      type="text"
                      value={profile.name}
                      onChange={e => setProfile({ ...profile, name: e.target.value })}
                      className="w-full px-4 py-3 bg-zinc-50/50 border border-zinc-200 text-black text-xs font-semibold rounded-xl focus:border-studio-pink focus:bg-white focus:outline-none focus:ring-4 focus:ring-studio-pink/5 font-sans"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-black tracking-widest text-zinc-500 uppercase mb-2">Email Address *</label>
                    <input
                      required
                      type="email"
                      value={profile.email}
                      onChange={e => setProfile({ ...profile, email: e.target.value })}
                      className="w-full px-4 py-3 bg-zinc-50/50 border border-zinc-200 text-black text-xs font-semibold rounded-xl focus:border-studio-pink focus:bg-white focus:outline-none focus:ring-4 focus:ring-studio-pink/5 font-sans"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] font-black tracking-widest text-zinc-500 uppercase mb-2">Instagram Username</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-zinc-400 text-xs pointer-events-none font-bold">@</span>
                    <input
                      type="text"
                      value={profile.ig.replace('@', '')}
                      onChange={e => setProfile({ ...profile, ig: `@${e.target.value}` })}
                      className="w-full pl-8 pr-4 py-3 bg-zinc-50/50 border border-zinc-200 text-black text-xs font-semibold rounded-xl focus:border-studio-pink focus:bg-white focus:outline-none focus:ring-4 focus:ring-studio-pink/5 font-sans"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] font-black tracking-widest text-zinc-500 uppercase mb-2">Short Biography</label>
                  <textarea
                    rows={4}
                    value={profile.bio}
                    onChange={e => setProfile({ ...profile, bio: e.target.value })}
                    className="w-full px-4 py-3 bg-zinc-50/50 border border-zinc-200 text-black text-xs font-semibold rounded-xl focus:border-studio-pink focus:bg-white focus:outline-none focus:ring-4 focus:ring-studio-pink/5 font-sans"
                  />
                </div>

                <button
                  type="submit"
                  className="px-6 py-3.5 bg-black hover:bg-studio-pink hover:text-black border border-black hover:border-studio-pink text-white font-extrabold text-[10px] tracking-widest uppercase transition-all duration-300 rounded-xl shadow-md cursor-pointer"
                >
                  Save Profile Settings
                </button>
              </form>
            </div>
          )}



        </main>
      </div>

      {/* ── INTERACTIVE MODAL: CANCELLATION ── */}
      {cancellingBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white border border-zinc-200/80 rounded-2xl max-w-sm w-full p-6 text-black relative shadow-2xl animate-scale-in">
            <h4 className="text-base font-black uppercase text-black mb-3 flex items-center gap-2">
              <AlertCircle className="text-red-500" size={18} />
              Cancel Reservation?
            </h4>
            <p className="text-xs text-zinc-500 font-sans leading-relaxed mb-6 font-medium">
              Are you sure you want to cancel your workspace workspace booking on <strong className="text-black">{cancellingBooking.dateStr}</strong> ({cancellingBooking.timeStr})? This station will be released to other guest artists.
            </p>
            <div className="flex gap-2.5 justify-end">
              <button
                onClick={() => setCancellingBooking(null)}
                className="px-5 py-2.5 border border-zinc-250 hover:bg-zinc-50 text-[9px] font-bold uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
              >
                Go Back
              </button>
              <button
                onClick={confirmCancel}
                className="px-5 py-2.5 bg-studio-pink text-white hover:bg-[#e052a9] text-[9px] font-bold uppercase tracking-wider rounded-xl transition-colors shadow-md cursor-pointer"
              >
                Yes, Cancel Slot
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── INTERACTIVE MODAL: RESCHEDULING ── */}
      {reschedulingBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white border border-zinc-200/80 rounded-2xl max-w-md w-full p-6 sm:p-8 text-black relative shadow-2xl animate-scale-in">

            <button
              onClick={() => setReschedulingBooking(null)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-black p-1.5 hover:bg-zinc-50 rounded-lg transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>

            <h4 className="text-base font-black uppercase text-black mb-5 pb-2 border-b border-zinc-100 flex items-center gap-2">
              <Edit className="text-studio-pink" size={18} />
              Reschedule Reservation
            </h4>

            <form onSubmit={confirmReschedule} className="space-y-4 font-sans text-xs">
              <p className="text-zinc-500 leading-relaxed mb-4 font-medium">
                Select a new date and time block for your reservation of <strong className="text-black">Station {reschedulingBooking.station}</strong>.
              </p>

              <div>
                <label className="block text-[9px] font-black tracking-widest text-zinc-400 uppercase mb-2">Selected Station</label>
                <input
                  disabled
                  type="text"
                  value={`Station ${reschedulingBooking.station} (${reschedulingBooking.duration}h)`}
                  className="w-full px-4 py-3 bg-zinc-100 border border-zinc-150 text-zinc-450 text-xs font-semibold rounded-xl"
                />
              </div>

              <div>
                <label className="block text-[9px] font-black tracking-widest text-zinc-400 uppercase mb-2">New Date *</label>
                <input
                  required
                  type="date"
                  value={newDate}
                  min={todayStr}
                  max="2027-12-31"
                  onChange={e => {
                    const selectedVal = e.target.value;
                    if (selectedVal) {
                      const pDate = new Date(selectedVal + 'T00:00:00');
                      const dOfWeek = pDate.getDay();
                      const daysMap = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                      const dayName = daysMap[dOfWeek];
                      if (!managerSettings?.openingDays?.[dayName]) {
                        triggerToast(`⚠️ Studio is CLOSED on ${dayName}s! Please select a valid operating day.`);
                        setNewDate('');
                        return;
                      }
                    }
                    setNewDate(selectedVal);
                  }}
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 text-black text-xs font-semibold rounded-xl focus:border-studio-pink focus:outline-none"
                />
              </div>


              <div>
                <label className="block text-[9px] font-black tracking-widest text-zinc-400 uppercase mb-2">New Time Slot *</label>
                <select
                  value={newTime}
                  onChange={e => setNewTime(e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 text-black text-xs font-semibold rounded-xl focus:border-studio-pink focus:outline-none"
                >
                  {(() => {
                    const currentPricing = getPricingForDay(managerSettings?.pricing, newDate || new Date()) || { '3H': 90, '4H': 120, '6H': 170, '8H': 220 };
                    const allSlots = [];
                    Object.entries(currentPricing).forEach(([pkg, price]) => {
                      if (pkg === '1H') return;
                      const dur = parseInt(pkg.replace('H', ''));
                      const safePrice = typeof price === 'object' ? 0 : price;
                      for (let h = openingHour; h <= Math.max(openingHour, closingHour - dur); h++) {
                        allSlots.push(
                          <option key={`${h}-${dur}`} value={`${h}:00 - ${h + dur}:00`}>
                            {h}:00 - {h + dur}:00 ({dur} Hours, {safePrice} CHF)
                          </option>
                        );
                      }
                    });
                    return allSlots.length ? allSlots : <option disabled>No slots available</option>;
                  })()}
                </select>
              </div>

              <div className="flex gap-3 justify-end pt-4 mt-4 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setReschedulingBooking(null)}
                  className="px-5 py-2.5 border border-zinc-250 hover:bg-zinc-50 font-bold uppercase tracking-wider rounded-xl transition-colors text-[9px] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-studio-pink text-black hover:bg-black hover:text-white font-extrabold uppercase tracking-wider rounded-xl transition-colors shadow-md text-[9px] cursor-pointer"
                >
                  Save New Date
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── USER PROFILE MODAL ── */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white border border-zinc-200/80 rounded-2xl max-w-sm w-full p-6 sm:p-8 text-black relative shadow-2xl animate-scale-in">

            <button
              onClick={() => setIsProfileModalOpen(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-black p-1.5 hover:bg-zinc-50 rounded-lg transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>

            <div className="flex flex-col items-center text-center pb-4 border-b border-zinc-100 mb-5">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-studio-pink to-studio-lightpink text-black font-black text-2xl flex items-center justify-center shadow-md uppercase mb-3">
                {profile.name.charAt(0)}
              </div>
              <h4 className="text-lg font-black uppercase text-black">{profile.name}</h4>
              <span className="px-2.5 py-0.5 text-[9px] font-black tracking-wider bg-studio-pink/10 border border-studio-pink/20 text-studio-pink uppercase rounded-full mt-1.5">
                Guest Tattoo Artist
              </span>
            </div>

            <div className="space-y-4 font-sans text-xs mb-6">
              <div className="flex justify-between items-center py-1.5 border-b border-zinc-50">
                <span className="text-zinc-400 font-bold uppercase tracking-wider text-[9px]">Email</span>
                <span className="text-black font-semibold font-mono">{profile.email}</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-zinc-50">
                <span className="text-zinc-400 font-bold uppercase tracking-wider text-[9px]">Instagram</span>
                <span className="text-studio-pink font-black">{profile.ig}</span>
              </div>
              <div className="flex flex-col gap-1 py-1.5">
                <span className="text-zinc-400 font-bold uppercase tracking-wider text-[9px]">Short Bio</span>
                <span className="text-zinc-650 leading-relaxed italic">"{profile.bio}"</span>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  setIsProfileModalOpen(false);
                  setActiveTab('profile');
                }}
                className="flex-1 py-3 bg-zinc-100 hover:bg-black hover:text-white text-black font-extrabold text-[9px] uppercase tracking-wider rounded-xl transition-all duration-300 cursor-pointer text-center"
              >
                Edit Profile
              </button>
              <button
                onClick={() => {
                  setIsProfileModalOpen(false);
                  onLogout?.();
                }}
                className="flex-1 py-3 bg-black hover:bg-red-650 text-white font-extrabold text-[9px] uppercase tracking-wider rounded-xl transition-all duration-300 shadow-md cursor-pointer text-center"
              >
                Logout Portal
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ── TERMS & CONDITIONS OVERLAY ── */}
      {showTermsOverlay && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white border border-zinc-200/80 rounded-2xl max-w-2xl w-full p-6 sm:p-8 text-black relative shadow-2xl text-left">
            <button
              onClick={() => setShowTermsOverlay(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-black p-1.5 hover:bg-zinc-100 rounded-lg transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
            <h4 className="text-base font-black uppercase text-black mb-4 pb-2 border-b border-zinc-100 flex items-center gap-2">
              <FileText className="text-studio-pink" size={18} />
              Terms &amp; Conditions / AGB (Tattooplatz)
            </h4>
            <div className="space-y-4 font-sans text-xs max-h-[60vh] overflow-y-auto pr-2 leading-relaxed">
              <div className="text-zinc-500 italic text-[10px] border border-zinc-100 bg-zinc-50 rounded-lg p-3">
                <p><strong>Re:</strong> Workspace including furnishings and ancillary rooms</p>
                <p className="mt-1">consisting of a visually separated workspace within the commercial premises, equipped for tattooing, and ancillary rooms (shared restrooms on the same floor) — hereinafter referred to as the <strong>"Property of Use"</strong></p>
                <p className="mt-1">located at <strong>Aargauerstrasse 180, 8048 Zurich.</strong></p>
              </div>
              <div>
                <h5 className="font-extrabold text-black mb-1 uppercase tracking-wide">I. Preamble</h5>
                <p className="text-zinc-600">The operator provides the user with a permanently assigned workspace including furnishings and ensures its proper functioning. In addition, the operator provides the user with a sink and a toilet for general (non-exclusive) use. The toilet is located on the same floor outside the commercial premises and is used by all tenants on the same floor. This framework agreement is limited solely to the provision of these premises, which must be handled with care in all cases. The operator has no authority over the user in connection with the tattooing process. In particular, the user determines when and how they perform a tattoo, and bears sole responsibility for this. Furthermore, it is the user's responsibility to acquire clients, determine their pricing, and set their own working hours. The operator has no authority to issue instructions in this regard.</p>
              </div>
              <div>
                <h5 className="font-extrabold text-black mb-1 uppercase tracking-wide">II. Subject Matter of the Agreement</h5>
                <p className="text-zinc-600"><strong>(1)</strong> This agreement is structured as a framework agreement and forms the basis for the individual user agreements concluded via the operator's online tool (www.tattooplatz.ch). The framework agreement therefore governs the fundamental terms and conditions between the operator and the user. This agreement does not create any entitlement for the user to use a workspace.</p>
              </div>
              <div>
                <h5 className="font-extrabold text-black mb-1 uppercase tracking-wide">III. Duration of Use</h5>
                <p className="text-zinc-600"><strong>(2)</strong> The duration of use is limited and ends automatically, without any action required by either party, depending on the duration booked on the operator's online tool (www.tattooplatz.ch). A tacit continuation of the agreement is excluded, although the user is free to book or arrange further time slots via the operator's online tool, provided spaces are available.</p>
              </div>
              <div>
                <h5 className="font-extrabold text-black mb-1 uppercase tracking-wide">IV. Usage Fee</h5>
                <p className="text-zinc-600 mb-2"><strong>A. Amount of the Usage Fee</strong></p>
                <p className="text-zinc-600 mb-2"><strong>(3)</strong> The fee for the use of a workspace and ancillary rooms is determined according to the price list, including cancellation fees, posted on the operator's website (www.tattooplatz.ch).</p>
                <p className="text-zinc-600 mb-2"><strong>(4)</strong> No additional fees (e.g., heating, electricity, waste disposal costs, internet) will be charged. Any claims arising from improper or careless use of the provided equipment, the commercial space including the workspace, and ancillary rooms are reserved.</p>
                <p className="text-zinc-600 mb-2"><strong>B. Due Date</strong></p>
                <p className="text-zinc-600"><strong>(5)</strong> The total usage fee is payable in advance. Payment is processed via the online tool on the operator's website (www.tattooplatz.ch).</p>
              </div>
              <div>
                <h5 className="font-extrabold text-black mb-1 uppercase tracking-wide">V. Use of the Workspace and Ancillary Rooms</h5>
                <p className="text-zinc-600"><strong>(6)</strong> The workspace provided on the operator's premises, including its facilities and ancillary rooms, must be used appropriately and carefully. Use is limited to tattooing. The provision or sale of any other services is prohibited. Furthermore, the user must be considerate of other users in the same premises and of all tenants of the entire property when using the workspace and ancillary rooms, and must adhere to the house rules. The user is also obligated to observe the studio's opening hours and to leave the premises after closing time.</p>
              </div>
              <div>
                <h5 className="font-extrabold text-black mb-1 uppercase tracking-wide">VI. Maintenance and Upkeep of the Premises</h5>
                <p className="text-zinc-600"><strong>(7)</strong> The user is obligated to treat the workspace and all premises with care and to maintain them in a usable and suitable condition. The user is responsible to the operator for any damage caused to the entire property as well as to valuables belonging to other users on the premises and is obligated to repair any damage immediately, provided the damage was caused by them, their customers and their companions, or their employees. The user shall indemnify the operator in this regard. The user waives the right to assert claims for damages against the operator if, in the event of damage caused by third parties.</p>
              </div>
            </div>
            <div className="flex justify-end pt-4 mt-4 border-t border-zinc-100">
              <button type="button" onClick={() => setShowTermsOverlay(false)} className="px-6 py-2.5 bg-black text-white hover:bg-studio-pink hover:text-black font-extrabold uppercase tracking-wider rounded-xl transition-colors text-[9px] cursor-pointer">Close / Schließen</button>
            </div>
          </div>
        </div>
      )}

      {/* ── CANCELLATION POLICY OVERLAY ── */}
      {showCancelOverlay && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white border border-zinc-200/80 rounded-2xl max-w-md w-full p-6 sm:p-8 text-black relative shadow-2xl text-left">
            <button
              onClick={() => setShowCancelOverlay(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-black p-1.5 hover:bg-zinc-100 rounded-lg transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
            <h4 className="text-base font-black uppercase text-black mb-4 pb-2 border-b border-zinc-100 flex items-center gap-2">
              <Clock className="text-studio-pink" size={18} />
              Cancellation Policy (Tattooplatz)
            </h4>
            <div className="space-y-4 font-sans text-xs leading-relaxed">
              <p className="text-zinc-700">Bookings can only be changed or canceled free of charge <strong>72 hours</strong> before the start of the booking.</p>
              <p className="text-zinc-700">If an appointment is missed without prior notice, we reserve the right to charge the <strong>full amount</strong>.</p>
            </div>
            <div className="flex justify-end pt-4 mt-4 border-t border-zinc-100">
              <button type="button" onClick={() => setShowCancelOverlay(false)} className="px-6 py-2.5 bg-black text-white hover:bg-studio-pink hover:text-black font-extrabold uppercase tracking-wider rounded-xl transition-colors text-[9px] cursor-pointer">Close / Schließen</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
