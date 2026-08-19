import React from 'react';
import { createPortal } from 'react-dom';
import { Calendar as CalendarIcon, Clock, Check, Plus, ShoppingCart, User, AlertCircle, Wallet, X, FileText, Instagram, MessageSquare } from 'lucide-react';

import { useNavigate } from 'react-router-dom';
import { getPricingForDay } from '../utils/pricing';

export default function BookingTool({ managerSettings, bookings = [], registeredArtists = [], onRegisterArtist, onAddBookingToCart, onBookingConfirm, onAddInquiry, onLoginSuccess, onStep5Complete }) {
  const [showBanner, setShowBanner] = React.useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setShowBanner(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const navigate = useNavigate();
  const [step, setStep] = React.useState(1);
  const [selectedDuration, setSelectedDuration] = React.useState(null);
  const [selectedDate, setSelectedDate] = React.useState(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = React.useState(null);
  const [bookingCart, setBookingCart] = React.useState([]);
  const lastCreatedCartRef = React.useRef([]);

  // Persistent login: restore artist session from localStorage on mount
  const [userProfile, setUserProfile] = React.useState(() => {
    try {
      const saved = localStorage.getItem('tattooplatz_current_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.role === 'artist') return parsed;
      }
    } catch (e) {}
    return null;
  });
  const [isRegistering, setIsRegistering] = React.useState(false);
  const [copyToast, setCopyToast] = React.useState('');

  // Dynamic Unique Invoice Number for receipt
  const invoiceNumber = React.useMemo(() => {
    const lastBookingId = bookingCart[bookingCart.length - 1]?.id || Date.now();
    const num = String(lastBookingId).slice(-5);
    const currentYear = new Date().getFullYear();
    return `Invoice #TP-${currentYear}-${num}`;
  }, [step, bookingCart]);

  // Authentication State
  const [authTab, setAuthTab] = React.useState('login'); // 'login' | 'register'
  const [loginForm, setLoginForm] = React.useState({ email: '', password: '' });
  const [authError, setAuthError] = React.useState('');

  // Registration Form
  const [regForm, setRegForm] = React.useState({ name: '', email: '', phone: '', ig: '', password: '', easyGovFile: '', hygieneFile: '' });

  // Registration checkboxes & policy modals states
  const [agreeTerms, setAgreeTerms] = React.useState(false);
  const [agreeCancellation, setAgreeCancellation] = React.useState(false);
  const [showTermsModal, setShowTermsModal] = React.useState(false);
  const [showCancelModal, setShowCancelModal] = React.useState(false);

  // Opening hours
  const openingHour = parseInt((managerSettings?.operatingHours?.open || '10:00').split(':')[0]);
  const closingHour = parseInt((managerSettings?.operatingHours?.close || '18:00').split(':')[0]);
  const stationsCount = 4;

  // Get pricing dynamically based on selected date or current date
  const currentPricing = getPricingForDay(managerSettings?.pricing, selectedDate || new Date());

  const sessionOptions = Object.entries(currentPricing)
    .filter(([pkg]) => pkg !== '1H')
    .map(([pkg, price]) => {
      const hours = parseInt(pkg.replace('H', ''));
      // Prevent object rendering crash: if price is the corrupt object, fallback to 0 or extract a sensible value
      const safePrice = typeof price === 'object' ? 0 : price;
      return { hours, price: safePrice, label: `${hours} Hour Session` };
    })
    .sort((a, b) => a.hours - b.hours);

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const hrs = parseInt(params.get('hours'));
    const stepParam = parseInt(params.get('step'));

    if (stepParam === 4) {
      setStep(4);
    } else if (hrs) {
      const match = sessionOptions.find(opt => opt.hours === hrs);
      if (match) {
        setSelectedDuration(match);
        setStep(2);
      }
    }
  }, []);



  // Calendar navigation state — starts at current month
  const todayDate = React.useMemo(() => new Date(), []);
  const [calendarYear, setCalendarYear] = React.useState(() => new Date().getFullYear());
  const [calendarMonth, setCalendarMonth] = React.useState(() => new Date().getMonth()); // 0-indexed

  // Navigate months
  const goToPrevMonth = () => {
    if (calendarMonth === 0) { setCalendarMonth(11); setCalendarYear(y => y - 1); }
    else setCalendarMonth(m => m - 1);
  };
  const goToNextMonth = () => {
    if (calendarMonth === 11) { setCalendarMonth(0); setCalendarYear(y => y + 1); }
    else setCalendarMonth(m => m + 1);
  };

  // Get occupied slots for the selected date (live bookings and admin blocks)
  const getActiveBookings = (dateObj) => {
    if (!dateObj) return [];

    const year = dateObj.date.getFullYear();
    const month = String(dateObj.date.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.date.getDate()).padStart(2, '0');
    const targetDateStr = `${year}-${month}-${day}`;

    // Fetch real bookings and blocks from the global database that aren't cancelled
    return bookings
      .filter(b => (b.date === targetDateStr || (b.date && b.date.startsWith(targetDateStr))) && b.status !== 'Cancelled')
      .map(b => ({
        station: Number(b.station),
        start: Number(b.start),
        end: Number(b.end),
        status: b.status
      }));
  };

  const getAvailableSpotsForDay = (dateObj, duration) => {
    const activeBookings = getActiveBookings(dateObj);
    let totalAvailableSpots = 0;
    // Only allow slots that END at or before closing time
    const maxStartHour = closingHour - duration;

    for (let s = 1; s <= stationsCount; s++) {
      let isStationAvailableForDuration = false;
      for (let start = openingHour; start <= maxStartHour; start++) {
        const end = start + duration;
        const hasOverlap = activeBookings.some(b =>
          Number(b.station) === s &&
          ((start >= Number(b.start) && start < Number(b.end)) ||
            (end > Number(b.start) && end <= Number(b.end)) ||
            (start <= Number(b.start) && end >= Number(b.end)))
        );
        if (!hasOverlap) {
          isStationAvailableForDuration = true;
          break; // Found at least one slot for this station
        }
      }
      if (isStationAvailableForDuration) {
        totalAvailableSpots++;
      }
    }
    return totalAvailableSpots;
  };

  // Build calendar days for the selected calendarYear/calendarMonth
  const getCalendarDays = () => {
    const totalDays = new Date(calendarYear, calendarMonth + 1, 0).getDate();
    const days = [];
    const todayYMD = `${todayDate.getFullYear()}-${String(todayDate.getMonth() + 1).padStart(2, '0')}-${String(todayDate.getDate()).padStart(2, '0')}`;

    for (let d = 1; d <= totalDays; d++) {
      const date = new Date(calendarYear, calendarMonth, d);
      const dayOfWeek = date.getDay(); // 0=Sun,1=Mon,...,6=Sat
      const daysMap = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const dayName = daysMap[dayOfWeek];
      const isOperatingDay = managerSettings?.openingDays?.[dayName] === true;
      const dateStr = `${calendarYear}-${String(calendarMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const isPast = dateStr < todayYMD;

      const isBlocked = bookings.some(b => 
        b.status === 'Blocked' && 
        (b.date === dateStr || (b.date && b.date.startsWith(dateStr)))
      );

      let spotsLeft = 0;
      let isAvailable = isOperatingDay && !isPast;

      if (isAvailable && selectedDuration) {
        spotsLeft = getAvailableSpotsForDay({ date, dayNum: d }, selectedDuration.hours);
        isAvailable = spotsLeft > 0;
      }

      days.push({
        dayNum: d,
        date: date,
        dateStr,
        isToday: dateStr === todayYMD,
        isPast,
        isBlocked,
        isAvailable,
        spotsLeft,
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' })
      });
    }
    return days;
  };

  const calendarDays = getCalendarDays();

  // Automatically advance calendar to next month if current month has no available days
  React.useEffect(() => {
    if (selectedDuration && calendarYear === todayDate.getFullYear() && calendarMonth === todayDate.getMonth()) {
      const hasAnyAvailable = calendarDays.some(day => day.isAvailable);
      if (!hasAnyAvailable) {
        if (calendarMonth === 11) {
          setCalendarMonth(0);
          setCalendarYear(y => y + 1);
        } else {
          setCalendarMonth(m => m + 1);
        }
      }
    }
  }, [selectedDuration, calendarMonth, calendarYear, calendarDays]);

  // First day of this month for blank offset (Mon=0, Tue=1,...,Sun=6)
  const firstDayOffset = (new Date(calendarYear, calendarMonth, 1).getDay() + 6) % 7;
  const calendarMonthName = new Date(calendarYear, calendarMonth, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  // Can't go before current month
  const isCurrentMonth = calendarYear === todayDate.getFullYear() && calendarMonth === todayDate.getMonth();

  // Check which times are bookable for the chosen duration
  const getAvailableSlots = () => {
    if (!selectedDate || !selectedDuration) return [];

    const activeBookings = getActiveBookings(selectedDate);
    const slots = [];
    const duration = selectedDuration.hours;
    // Only allow slots that END at or before closing time (fixes mobile overflow bug)
    const maxStartHour = closingHour - duration;

    for (let start = openingHour; start <= maxStartHour; start++) {
      const end = start + duration;
      let availableStations = [];

      for (let s = 1; s <= stationsCount; s++) {
        const hasOverlap = activeBookings.some(b =>
          Number(b.station) === s &&
          ((start >= Number(b.start) && start < Number(b.end)) ||
            (end > Number(b.start) && end <= Number(b.end)) ||
            (start <= Number(b.start) && end >= Number(b.end)))
        );

        if (!hasOverlap) {
          availableStations.push(s);
        }
      }

      if (availableStations.length > 0) {
        slots.push({
          start,
          end,
          availableStations,
          freeStationsCount: availableStations.length
        });
      }
    }
    return slots;
  };


  const availableSlots = getAvailableSlots();

  const [blockedNoticeModal, setBlockedNoticeModal] = React.useState(null);

  const handleSelectDuration = (opt) => {
    setSelectedDuration(opt);
    setStep(2);
  };

  const handleSelectDate = (day) => {
    if (day.isBlocked) {
      setBlockedNoticeModal({
        dateStr: day.dateStr,
        dayNum: day.dayNum,
        message: 'This date or time range has been blocked by studio administration. Booking is unavailable for this slot. Please choose another date from the calendar.'
      });
      return;
    }
    if (!day.isAvailable) return;
    setSelectedDate(day);
    setSelectedTimeSlot(null);
    setStep(3);
  };

  const handleSelectTime = (slot) => {
    setSelectedTimeSlot(slot);
  };

  const handleAddSession = () => {
    if (!selectedDuration || !selectedDate || !selectedTimeSlot) return;

    const newSession = {
      id: Date.now(),
      date: `${selectedDate.date.getFullYear()}-${String(selectedDate.date.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.date.getDate()).padStart(2, '0')}`,
      dateStr: selectedDate.date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      timeStr: `${selectedTimeSlot.start}:00 - ${selectedTimeSlot.end}:00`,
      station: selectedTimeSlot.availableStations[0],
      duration: selectedDuration.hours,
      price: selectedDuration.price
    };

    const updatedCart = [...bookingCart, newSession];
    setBookingCart(updatedCart);
    onAddBookingToCart(newSession);

    setSelectedDate(null);
    setSelectedTimeSlot(null);
    setStep(1);
  };

  const handleSessionConfirm = () => {
    if (!selectedDate || !selectedTimeSlot || !selectedDuration) return;

    const finalSession = {
      id: Date.now(),
      date: `${selectedDate.date.getFullYear()}-${String(selectedDate.date.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.date.getDate()).padStart(2, '0')}`,
      dateStr: selectedDate.date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      timeStr: `${selectedTimeSlot.start}:00 - ${selectedTimeSlot.end}:00`,
      station: selectedTimeSlot.availableStations[0],
      duration: selectedDuration.hours,
      price: selectedDuration.price
    };

    const updatedCart = [...bookingCart, finalSession];
    setBookingCart(updatedCart);
    lastCreatedCartRef.current = updatedCart;
    onAddBookingToCart(finalSession);

    // Persistent login: if already logged in, skip step 4 and confirm directly
    if (userProfile) {
      if (onBookingConfirm) onBookingConfirm(updatedCart, userProfile);
      if (onStep5Complete) onStep5Complete();
      setStep(5);
    } else {
      setStep(4);
    }
  };

  const handleFinalize = handleSessionConfirm;




  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    if (!loginForm.email || !loginForm.password) return;

    const emailMatch = loginForm.email.toLowerCase().trim();

    // 1. Try MySQL Backend Auth API first (cross-device mobile + desktop sync)
    try {
      const { authAPI } = await import('../services/api.js');
      const res = await authAPI.login({ email: emailMatch, password: loginForm.password });
      if (res.token) {
        localStorage.setItem('tattooplatz_token', res.token);
      }
      const profileData = {
        id: res.user.id,
        name: res.user.name,
        email: res.user.email,
        phone: res.user.phone || '',
        ig: res.user.instagram || '',
        role: 'artist',
        status: 'Active'
      };
      setUserProfile(profileData);
      localStorage.setItem('tattooplatz_current_user', JSON.stringify(profileData));
      if (onLoginSuccess) onLoginSuccess(profileData);
      const cartToSend = (bookingCart && bookingCart.length > 0) ? bookingCart : lastCreatedCartRef.current;
      if (onBookingConfirm) onBookingConfirm(cartToSend, profileData);
      if (onStep5Complete) onStep5Complete();
      setStep(5);
      return;
    } catch (err) {
      console.log('Backend auth API failed, attempting local fallback:', err.message);
    }

    // 2. Fallback to local state if backend is offline
    const matched = registeredArtists.find(
      (a) => a.email?.toLowerCase().trim() === emailMatch &&
        a.password === loginForm.password &&
        a.status === 'Active'
    );

    if (matched) {
      const profileData = { ...matched, role: 'artist' };
      setUserProfile(profileData);
      localStorage.setItem('tattooplatz_current_user', JSON.stringify(profileData));
      if (onLoginSuccess) onLoginSuccess(profileData);
      const cartToSend = (bookingCart && bookingCart.length > 0) ? bookingCart : lastCreatedCartRef.current;
      if (onBookingConfirm) onBookingConfirm(cartToSend, profileData);

      if (onStep5Complete) onStep5Complete();
      setStep(5);
    } else {
      setAuthError('Invalid credentials. Please verify your email/password or Register as a new artist.');
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    if (!regForm.name || !regForm.email || !regForm.ig || !regForm.password) return;

    const emailMatch = regForm.email.toLowerCase().trim();

    // 1. Try MySQL Backend Registration API (saves user globally across all devices!)
    try {
      const { authAPI } = await import('../services/api.js');
      const res = await authAPI.register({
        name: regForm.name.trim(),
        email: emailMatch,
        password: regForm.password,
        phone: regForm.phone || '',
        instagram: regForm.ig.trim(),
        termsAccepted: true
      });

      if (res.token) {
        localStorage.setItem('tattooplatz_token', res.token);
      }

      const newArtist = {
        id: res.user?.id || Date.now(),
        name: regForm.name.trim(),
        email: emailMatch,
        password: regForm.password,
        ig: regForm.ig.trim(),
        phone: regForm.phone || '',
        status: 'Active',
        role: 'artist'
      };

      if (onRegisterArtist) onRegisterArtist(newArtist);
      setUserProfile(newArtist);
      localStorage.setItem('tattooplatz_current_user', JSON.stringify(newArtist));
      if (onLoginSuccess) onLoginSuccess(newArtist);
      const cartToSend = (bookingCart && bookingCart.length > 0) ? bookingCart : lastCreatedCartRef.current;
      if (onBookingConfirm) onBookingConfirm(cartToSend, newArtist);
      if (onStep5Complete) onStep5Complete();
      setStep(5);
      return;
    } catch (err) {
      console.log('Backend registration error or offline mode:', err.message);
      if (err.message && err.message.toLowerCase().includes('already exists')) {
        setAuthError('An account with this email is already registered. Please log in instead.');
        return;
      }
    }

    // 2. Fallback to local state registration if backend is offline
    const alreadyRegistered = registeredArtists.some(
      (a) => a.email?.toLowerCase().trim() === emailMatch
    );

    if (alreadyRegistered) {
      setAuthError('An account with this email is already registered. Please log in instead.');
      return;
    }

    const newArtist = {
      id: Date.now(),
      name: regForm.name.trim(),
      email: emailMatch,
      password: regForm.password,
      ig: regForm.ig.trim(),
      phone: regForm.phone || '',
      status: 'Active',
      role: 'artist'
    };

    if (onRegisterArtist) onRegisterArtist(newArtist);
    setUserProfile(newArtist);
    localStorage.setItem('tattooplatz_current_user', JSON.stringify(newArtist));
    if (onLoginSuccess) onLoginSuccess(newArtist);
    const cartToSendFallback = (bookingCart && bookingCart.length > 0) ? bookingCart : lastCreatedCartRef.current;
    if (onBookingConfirm) onBookingConfirm(cartToSendFallback, newArtist);

    if (onStep5Complete) onStep5Complete();
    setStep(5);
  };


  return (
    <section id="booking" className="relative bg-white border-t border-zinc-200 min-h-screen text-black w-full flex flex-col">

      {/* ── Top Pink Banner ── */}
      <div className={`relative w-full overflow-hidden transition-all duration-1000 ease-in-out ${showBanner ? 'h-[200px] md:h-[260px] opacity-100 mb-12' : 'h-0 opacity-0 mb-0'
        } bg-[#FF66C4] flex items-center justify-between px-8 md:px-24`}>
        <h2 className="relative z-10 text-white text-[28px] sm:text-[60px] md:text-[110px] font-black tracking-tighter uppercase leading-[0.95]">
          BOOK<br />YOUR<br />STATION
        </h2>

        {/* Massive White X on the right */}
        <div className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-[15%] w-[400px] h-[400px] items-center justify-center pointer-events-none">
          <div className="absolute w-[120%] h-[90px] bg-white rotate-45"></div>
          <div className="absolute w-[120%] h-[90px] bg-white -rotate-45"></div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10 w-full pb-8 md:pb-24">

        {/* Header */}
        <div className="text-center mb-16 animate-slide-in-left">
          <h2 className="text-xxs font-black tracking-[0.4em] text-black uppercase mb-2">STATION RESERVATIONS</h2>
          <h3 className="text-4xl sm:text-5xl font-black tracking-tight text-black uppercase leading-none">
            BOOK A CO-WORKING SPOT
          </h3>
          <p className="text-zinc-500 font-sans text-xs sm:text-sm max-w-md mx-auto mt-3">
            Rent space at our Zurich studio. Pay per session, zero commission, fully equipped stations.
          </p>
        </div>

        {/* Wizard Progress Steps Bar */}
        <div className="flex justify-between items-center max-w-2xl mx-auto mb-12 border border-zinc-200 bg-zinc-50 p-4 rounded-xl">
          {[
            { s: 1, label: 'Duration' },
            { s: 2, label: 'Date' },
            { s: 3, label: 'Time & Station' },
            { s: 4, label: 'Account' },
            { s: 5, label: 'Receipt' }
          ].map((item) => (
            <div key={item.s} className="flex flex-col items-center gap-1">
              <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step === item.s
                  ? 'bg-studio-pink text-black shadow-[0_0_10px_#FF66C4]'
                  : step > item.s
                    ? 'bg-zinc-200 text-studio-pink'
                    : 'bg-zinc-100 text-zinc-400'
                }`}>
                {step > item.s ? <Check size={14} /> : item.s}
              </span>
              <span className="text-xxs font-semibold tracking-wider text-zinc-500 uppercase hidden sm:inline">{item.label}</span>
            </div>
          ))}
        </div>

        {/* Step 1: Select Session Duration */}
        {step === 1 && (
          <div className="animate-fade-in font-sans">
            <h4 className="text-lg font-black text-black uppercase tracking-wider text-center mb-8">
              STEP 1: SELECT YOUR SESSION DURATION
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {sessionOptions.map((opt, idx) => (
                <div
                  key={idx}
                  onClick={() => handleSelectDuration(opt)}
                  className="group bg-zinc-50/50 border border-zinc-200 rounded-xl hover:border-studio-pink hover:bg-white hover:-translate-y-1 transition-all duration-300 p-8 cursor-pointer flex flex-col justify-between h-72 text-center shadow-sm"
                >
                  <div>
                    <h5 className="text-xl font-black text-black uppercase tracking-wide mb-2">
                      {opt.label}
                    </h5>

                  </div>

                  <div>
                    <div className="text-4xl font-black text-studio-pink tracking-tight mb-4">
                      {opt.price} CHF
                    </div>
                    <button className="w-full py-3 bg-zinc-100 border border-zinc-200 group-hover:bg-studio-pink group-hover:text-black group-hover:border-studio-pink font-bold text-xs uppercase tracking-widest text-black transition-all rounded-full">
                      Select
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Divider */}
            <div className="my-16 border-t border-zinc-200/80 max-w-5xl mx-auto" />

            {/* Mockup "BOOK HERE" horizontal list block */}
            <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
              <h4 className="text-4xl sm:text-5xl font-black text-studio-pink uppercase tracking-tight text-center mb-8">
                BOOK HERE
              </h4>

              <div className="space-y-4">
                {[...sessionOptions].reverse().map((opt, idx) => (
                  <div
                    key={idx}
                    className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 transition-all duration-300 hover:border-studio-pink/60 hover:shadow-md"
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-10 w-full sm:w-auto">
                      <div>
                        <h5 className="text-base font-extrabold text-black uppercase tracking-wide">
                          {opt.hours} hour session
                        </h5>
                      </div>

                      <div className="flex items-center gap-6 text-xs text-zinc-500 font-sans font-medium">
                        <span className="flex items-center gap-1.5">
                          <Clock size={14} className="text-zinc-400" />
                          {opt.hours} Std.
                        </span>
                        <span className="flex items-center gap-1.5 font-bold text-studio-pink">
                          <Wallet size={14} className="text-zinc-400" />
                          {Number(opt.price || 0).toFixed(2)} CHF
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleSelectDuration(opt)}
                      className="w-full sm:w-auto px-8 py-2.5 bg-studio-pink hover:bg-black text-black hover:text-studio-pink font-extrabold text-[11px] uppercase tracking-widest transition-all duration-300 rounded-lg shadow-[0_2px_8px_rgba(255,102,196,0.3)] cursor-pointer"
                    >
                      Select
                    </button>
                  </div>
                ))}
              </div>
            </div>



          </div>
        )}

        {/* Step 2: Choose Date */}
        {step === 2 && (
          <div className="animate-fade-in max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <button onClick={() => setStep(1)} className="text-xs font-bold text-zinc-500 hover:text-black uppercase tracking-wider">
                ← Back to Duration
              </button>
              <span className="text-sm font-black text-studio-pink uppercase">
                Selected Duration: {selectedDuration.hours} Hours ({selectedDuration.price} CHF)
              </span>
            </div>

            <h4 className="text-lg font-black text-black uppercase tracking-wider text-center mb-4">
              STEP 2: CHOOSE A DATE ON THE CALENDAR
            </h4>



            {/* Calendar */}
            <div className="bg-zinc-50 border border-zinc-200 p-6 rounded-xl shadow-sm">

              {/* Month Navigation Header */}
              <div className="flex items-center justify-between mb-5">
                <button
                  onClick={goToPrevMonth}
                  disabled={isCurrentMonth}
                  className={`p-2 rounded-xl border transition-all ${isCurrentMonth
                      ? 'border-zinc-100 text-zinc-300 cursor-not-allowed'
                      : 'border-zinc-200 text-zinc-600 hover:border-studio-pink hover:text-studio-pink cursor-pointer'
                    }`}
                >
                  ‹
                </button>
                <div className="text-center">
                  <span className="text-sm font-black text-black uppercase tracking-wider">{calendarMonthName}</span>
                </div>
                <button
                  onClick={goToNextMonth}
                  className="p-2 rounded-xl border border-zinc-200 text-zinc-600 hover:border-studio-pink hover:text-studio-pink transition-all cursor-pointer"
                >
                  ›
                </button>
              </div>

              {/* Day headers */}
              <div className="grid grid-cols-7 gap-2 text-center mb-4">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                  <span key={day} className="text-xxs font-black text-zinc-500 uppercase tracking-widest">{day}</span>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-1 sm:gap-2">
                {/* Blank offset cells */}
                {Array.from({ length: firstDayOffset }).map((_, i) => (
                  <div key={`blank-${i}`} className="h-11 xs:h-12 sm:h-14" />
                ))}

                {calendarDays.map((day, idx) => (
                  <button
                    key={idx}
                    disabled={day.isPast || (!day.isAvailable && !day.isBlocked)}
                    onClick={() => handleSelectDate(day)}
                    title={day.isBlocked ? 'This date has been blocked by studio administration.' : ''}
                    className={`h-11 xs:h-12 sm:h-14 border text-xs sm:text-sm font-bold rounded-lg transition-all flex flex-col justify-between p-1 sm:p-2 relative ${selectedDate?.dateStr === day.dateStr
                        ? 'bg-studio-pink text-black border-studio-pink shadow-[0_0_10px_#FF66C4]'
                        : day.isBlocked
                          ? 'bg-black text-white border-black shadow-md'
                          : day.isAvailable
                            ? day.isToday
                              ? 'bg-black text-white border-black hover:border-studio-pink hover:scale-105 shadow-sm'
                              : 'bg-white border-zinc-200 text-black hover:border-studio-pink hover:scale-105 shadow-sm'
                            : day.isPast
                              ? 'bg-zinc-50 border-zinc-100 text-zinc-200 cursor-not-allowed'
                              : 'bg-zinc-100/60 border-zinc-100 text-zinc-300 cursor-not-allowed'
                      }`}
                  >
                    <span>{day.dayNum}</span>
                    {day.isBlocked ? (
                      <span className="text-[7px] xs:text-[8px] sm:text-[9px] font-sans font-black text-pink-400 uppercase tracking-tighter block truncate max-w-full">
                        BLOCKED
                      </span>
                    ) : day.isAvailable ? (
                      <span className="text-[7px] xs:text-[8px] sm:text-[9px] font-sans font-semibold opacity-70 block truncate max-w-full">
                        {day.spotsLeft !== undefined ? `${day.spotsLeft} Spots` : 'Open'}
                      </span>
                    ) : day.isPast ? (
                      <span className="text-[7px] xs:text-[8px] sm:text-[9px] font-sans font-light text-zinc-200 block truncate max-w-full">Past</span>
                    ) : (
                      <span className="text-[7px] xs:text-[8px] sm:text-[9px] font-sans font-light text-zinc-300 block truncate max-w-full">Fully Booked</span>
                    )}
                  </button>
                ))}
              </div>

              {/* Legend */}
              <div className="flex flex-wrap justify-center gap-4 mt-6 border-t border-zinc-200 pt-5 text-xs text-zinc-500 font-sans">
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 bg-white border border-zinc-200 rounded-md inline-block" />
                  Spots Open
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 bg-black rounded-md inline-block" />
                  Studio Blocked / Today
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 bg-zinc-100 border border-zinc-150 rounded-md inline-block" />
                  Fully Booked / Past
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 bg-studio-pink rounded-md inline-block" />
                  Selected Day
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Select Time & Station */}
        {step === 3 && (
          <div className="animate-fade-in max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 border-b border-zinc-200 pb-4">
              <button onClick={() => setStep(2)} className="text-xs font-bold text-zinc-500 hover:text-black uppercase tracking-wider self-start">
                ← Back to Calendar
              </button>
              <div className="text-xs sm:text-sm text-right font-semibold space-y-1">
                <div className="text-zinc-500">Date: <strong className="text-black">{selectedDate.date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</strong></div>
                <div className="text-zinc-500">Duration: <strong className="text-black">{selectedDuration.hours} Hours</strong></div>
              </div>
            </div>

            <h4 className="text-lg font-black text-black uppercase tracking-wider text-center mb-8">
              STEP 3: SELECT AVAILABLE WORKSTATION SLOT
            </h4>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Daily Timeline Slots */}
              <div className="lg:col-span-8 space-y-4">
                <h5 className="text-xs font-black tracking-widest text-zinc-500 uppercase mb-4">
                  AVAILABLE DAILY TIMELINE
                </h5>

                {availableSlots.length === 0 ? (
                  <div className="p-8 bg-black text-white border border-zinc-800 text-center font-sans rounded-xl space-y-2 shadow-lg">
                    <AlertCircle size={28} className="mx-auto text-pink-500 mb-1" />
                    <h5 className="text-sm font-black uppercase text-white tracking-wider">STUDIO BLOCKED / NO SLOTS AVAILABLE</h5>
                    <p className="text-xs text-zinc-300">
                      This date or time range has been blocked by studio administration. Booking is unavailable for this slot.
                    </p>
                    <p className="text-xs text-zinc-400">Please choose another date from the calendar.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {availableSlots.map((slot, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSelectTime(slot)}
                        className={`p-4 border rounded-lg transition-all text-left flex justify-between items-center ${selectedTimeSlot?.start === slot.start
                            ? 'bg-studio-pink text-black border-studio-pink shadow-[0_0_10px_#FF66C4]'
                            : 'bg-white border-zinc-200 text-black hover:border-studio-pink shadow-sm'
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <Clock size={16} />
                          <div>
                            <span className="text-sm font-bold block">{slot.start}:00 - {slot.end}:00</span>
                            <span className="text-xxs font-sans opacity-70">
                              {slot.freeStationsCount} of {stationsCount} stations free
                            </span>
                          </div>
                        </div>
                        {selectedTimeSlot?.start === slot.start && <Check size={18} />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Summary Box */}
              <div className="lg:col-span-4 p-6 bg-zinc-50 border border-zinc-200 rounded-xl shadow-sm flex flex-col justify-between h-96">
                <div>
                  <h5 className="text-xs font-black tracking-widest text-zinc-500 uppercase mb-4 border-b border-zinc-200 pb-2">
                    RESERVATION SUMMARY
                  </h5>

                  {selectedTimeSlot ? (
                    <div className="space-y-4 font-sans text-sm">
                      <div className="flex justify-between py-1 border-b border-zinc-200">
                        <span className="text-zinc-500">Selected Station:</span>
                        <span className="text-black font-semibold">Station {selectedTimeSlot.availableStations[0]}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-zinc-200">
                        <span className="text-zinc-500">Duration:</span>
                        <span className="text-black font-semibold">{selectedDuration.hours} Hours</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-zinc-200">
                        <span className="text-zinc-500">Flat Session Cost:</span>
                        <span className="text-studio-pink font-black">{selectedDuration.price}.00 CHF</span>
                      </div>
                      <p className="text-[10px] text-zinc-500 italic mt-2 leading-relaxed">
                        Rent fee includes workspace setup, chairs, ring lights, and stencil equipment.
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs font-sans text-zinc-500 italic">
                      Please select an available time slot on the left to see details.
                    </p>
                  )}
                </div>

                <div className="space-y-2 mt-6">
                  <button
                    disabled={!selectedTimeSlot}
                    onClick={handleSessionConfirm}
                    className="w-full py-4 bg-studio-pink disabled:bg-zinc-100 disabled:text-zinc-300 disabled:border-zinc-205 disabled:cursor-not-allowed text-black font-extrabold text-xs uppercase tracking-widest shadow-[0_4px_10px_rgba(255,102,196,0.3)] hover:bg-black hover:text-white transition-all rounded-full"
                  >

                    Finalize Booking
                  </button>

                  <button
                    disabled={!selectedTimeSlot}
                    onClick={handleAddSession}
                    className="w-full py-3 bg-white border border-zinc-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-zinc-50 text-black font-bold text-xs uppercase tracking-wider transition-colors rounded-full"
                  >
                    Book Another Session
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Login / Profile */}
        {step === 4 && (
          <div className="animate-fade-in max-w-md mx-auto">
            <h4 className="text-lg font-black text-black uppercase tracking-wider text-center mb-8">
              STEP 4: CLIENT PORTAL ACCESS
            </h4>

            {/* Already logged in — auto confirm card */}
            {userProfile && (
              <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-6 mb-6 text-center font-sans">
                <div className="w-12 h-12 bg-studio-pink/20 border-2 border-studio-pink rounded-full flex items-center justify-center mx-auto mb-3">
                  <User size={20} className="text-studio-pink" />
                </div>
                <p className="text-xs text-zinc-500 uppercase tracking-widest font-black mb-1">Logged in as</p>
                <p className="text-base font-black text-black">{userProfile.name}</p>
                <p className="text-xs text-zinc-400 mb-5">{userProfile.email}</p>
                <button
                  type="button"
                  onClick={() => {
                    if (onBookingConfirm) onBookingConfirm(bookingCart, userProfile);
                    if (onStep5Complete) onStep5Complete();
                    setStep(5);
                  }}
                  className="w-full py-4 bg-studio-pink text-black font-extrabold text-xs uppercase tracking-widest hover:bg-black hover:text-white transition-all rounded-full shadow-[0_4px_10px_rgba(255,102,196,0.3)]"
                >
                  Confirm Booking
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setUserProfile(null);
                    localStorage.removeItem('tattooplatz_current_user');
                  }}
                  className="mt-3 text-xs text-zinc-400 hover:text-black underline cursor-pointer"
                >
                  Not you? Sign out
                </button>
              </div>
            )}

            {/* Login / Register form — only shown if NOT logged in */}
            {!userProfile && (<>

            {/* Tab Switcher */}
            <div className="flex bg-zinc-100 p-1 rounded-xl mb-6 font-sans">
              <button
                type="button"
                onClick={() => { setAuthTab('login'); setAuthError(''); }}
                className={`flex-1 py-3 text-xs font-black uppercase tracking-wider rounded-lg transition-all ${authTab === 'login'
                    ? 'bg-black text-white shadow-sm'
                    : 'text-zinc-500 hover:text-black'
                  }`}
              >
                Log In
              </button>
              <button
                type="button"
                onClick={() => { setAuthTab('register'); setAuthError(''); }}
                className={`flex-1 py-3 text-xs font-black uppercase tracking-wider rounded-lg transition-all ${authTab === 'register'
                    ? 'bg-black text-white shadow-sm'
                    : 'text-zinc-500 hover:text-black'
                  }`}
              >
                Register New
              </button>
            </div>

            {authError && (
              <div className="bg-studio-pink/10 border border-studio-pink/30 text-studio-pink text-xs font-semibold p-4 rounded-xl flex items-center gap-2 mb-6 animate-pulse font-sans">
                <AlertCircle size={16} className="shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            {authTab === 'login' ? (
              <form onSubmit={handleLoginSubmit} className="bg-zinc-50 border border-zinc-200 p-6 sm:p-8 rounded-xl shadow-sm space-y-4 font-sans text-left">
                <p className="text-xs text-zinc-500 leading-relaxed mb-4">
                  Log in with your existing artist account email and password to finalize your station booking.
                </p>

                <div>
                  <label className="block text-xxs font-black tracking-widest text-zinc-500 uppercase mb-1">Email Address *</label>
                  <input
                    required
                    type="email"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-zinc-200 text-black text-sm rounded-lg focus:border-studio-pink focus:outline-none"
                    placeholder="e.g. artist@tattooplatz.ch"
                  />
                </div>

                <div>
                  <label className="block text-xxs font-black tracking-widest text-zinc-500 uppercase mb-1">Password *</label>
                  <input
                    required
                    type="password"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-zinc-200 text-black text-sm rounded-lg focus:border-studio-pink focus:outline-none"
                    placeholder="••••••••"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-studio-pink text-black font-extrabold text-xs uppercase tracking-widest hover:bg-black hover:text-white transition-all rounded-full shadow-[0_4px_10px_rgba(255,102,196,0.3)] mt-6"
                >
                  Log In & Book Spot
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegisterSubmit} className="bg-zinc-50 border border-zinc-200 p-6 sm:p-8 rounded-xl shadow-sm space-y-4 font-sans text-left">
                <p className="text-xs text-zinc-500 leading-relaxed mb-4">
                  Create a new artist profile to book sessions, manage dates, and access the workspace dashboard.
                </p>

                <div>
                  <label className="block text-xxs font-black tracking-widest text-zinc-500 uppercase mb-1">Full Name *</label>
                  <input
                    required
                    type="text"
                    value={regForm.name}
                    onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-zinc-200 text-black text-sm rounded-lg focus:border-studio-pink focus:outline-none"
                    placeholder="e.g. Joao Otereze"
                  />
                </div>

                <div>
                  <label className="block text-xxs font-black tracking-widest text-zinc-500 uppercase mb-1">Email Address *</label>
                  <input
                    required
                    type="email"
                    value={regForm.email}
                    onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-zinc-200 text-black text-sm rounded-lg focus:border-studio-pink focus:outline-none"
                    placeholder="e.g. joao@tattooplatz.ch"
                  />
                </div>

                <div>
                  <label className="block text-xxs font-black tracking-widest text-zinc-500 uppercase mb-1">Instagram Username *</label>
                  <input
                    required
                    type="text"
                    value={regForm.ig}
                    onChange={(e) => setRegForm({ ...regForm, ig: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-zinc-200 text-black text-sm rounded-lg focus:border-studio-pink focus:outline-none"
                    placeholder="e.g. @artist_instagram"
                  />
                </div>

                <div>
                  <label className="block text-xxs font-black tracking-widest text-zinc-500 uppercase mb-1">Choose Password *</label>
                  <input
                    required
                    type="password"
                    value={regForm.password || ''}
                    onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-zinc-200 text-black text-sm rounded-lg focus:border-studio-pink focus:outline-none"
                    placeholder="Set your account password"
                  />
                </div>

                <div className="border-t border-zinc-200 pt-4 mt-4 space-y-3 font-sans text-left">
                  {/* Terms & Conditions Checkbox */}
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <div className="relative flex items-start mt-0.5">
                      <input
                        type="checkbox"
                        required
                        checked={agreeTerms}
                        onChange={(e) => setAgreeTerms(e.target.checked)}
                        className="w-4 h-4 rounded border-zinc-300 text-studio-pink focus:ring-studio-pink focus:ring-offset-0 cursor-pointer"
                      />
                    </div>
                    <span className="text-xs text-zinc-650 leading-relaxed select-none">
                      I agree with the <button type="button" onClick={() => setShowTermsModal(true)} className="underline text-studio-pink font-semibold hover:text-black transition-colors bg-transparent border-0 p-0 inline-block align-baseline">Terms & Conditions of tattooplatz</button> <span className="text-red-500 font-bold">*</span>
                    </span>
                  </label>

                  {/* Cancellation Policy Checkbox */}
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <div className="relative flex items-start mt-0.5">
                      <input
                        type="checkbox"
                        required
                        checked={agreeCancellation}
                        onChange={(e) => setAgreeCancellation(e.target.checked)}
                        className="w-4 h-4 rounded border-zinc-300 text-studio-pink focus:ring-studio-pink focus:ring-offset-0 cursor-pointer"
                      />
                    </div>
                    <span className="text-xs text-zinc-650 leading-relaxed select-none">
                      I agree with the <button type="button" onClick={() => setShowCancelModal(true)} className="underline text-studio-pink font-semibold hover:text-black transition-colors bg-transparent border-0 p-0 inline-block align-baseline">cancellation policy of tattooplatz</button> <span className="text-red-500 font-bold">*</span>
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-studio-pink text-black font-extrabold text-xs uppercase tracking-widest hover:bg-black hover:text-white transition-all rounded-full shadow-[0_4px_10px_rgba(255,102,196,0.3)] mt-6"
                >
                  Register and continue
                </button>
              </form>
            )}
            </>)}
          </div>
        )}

        {/* Step 5: Confirmation */}
        {step === 5 && (
          <div className="animate-fade-in max-w-xl mx-auto text-center font-sans text-black">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-studio-pink/10 border border-studio-pink rounded-full text-studio-pink shadow-sm mb-6 animate-pulse">
              <Check size={32} />
            </div>

            <h4 className="text-2xl font-black text-black uppercase tracking-tight mb-2">
              BOOKING CONFIRMED!
            </h4>
            <p className="text-sm text-zinc-500 max-w-md mx-auto mb-8 leading-relaxed">
              Hey <strong className="text-black">{userProfile?.name}</strong>, your workspace reservation has been successfully booked. You can access your artist portal at any time using your email (<strong className="text-black">{userProfile?.email}</strong>) and password.
            </p>

            {/* Receipt SUMMARY */}
            <div className="bg-zinc-50 border border-zinc-200 p-6 rounded-xl text-left shadow-sm mb-8 space-y-4">
              <div className="border-b border-zinc-200 pb-3 flex justify-between items-center text-xs font-black uppercase text-zinc-400 tracking-wider">
                <span>RESERVATION BILLING DETAILS</span>
                <span className="text-studio-pink">{invoiceNumber}</span>
              </div>

              {bookingCart.map((item, idx) => (
                <div key={idx} className="flex justify-between py-2 text-sm border-b border-zinc-250/50">
                  <div>
                    <span className="font-extrabold text-black block uppercase">CO-WORKING STATION {item.station}</span>
                    <span className="text-xs text-zinc-500">{item.dateStr} | {item.timeStr} ({item.duration}h)</span>
                  </div>
                  <span className="font-bold text-studio-pink">{item.price}.00 CHF</span>
                </div>
              ))}

              <div className="pt-2 flex justify-between items-center text-base font-black">
                <span className="text-black uppercase">TOTAL AMOUNT PAID:</span>
                <span className="text-studio-pink text-xl">
                  {bookingCart.reduce((acc, item) => acc + item.price, 0)}.00 CHF
                </span>
              </div>
            </div>

            {/* INSTAGRAM SUPPORT — rendered as part of the step 5 success screen */}
            <div className="mb-8 animate-fade-in flex flex-col items-center">
              <div className="flex items-center gap-3 mb-2">
                <MessageSquare className="text-studio-pink" size={20} />
                <h4 className="text-base font-black text-black uppercase tracking-tight">
                  Need Help Before Your Appointment?
                </h4>
              </div>

              <p className="text-sm text-zinc-500 leading-relaxed max-w-lg text-center">
                If you have any questions regarding your booking, equipment, materials, studio location, preparation, rescheduling, or anything else before your appointment, our team is happy to help via Instagram.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={() => {
                  setBookingCart([]);
                  setSelectedDuration(null);
                  setSelectedDate(null);
                  setSelectedTimeSlot(null);
                  setStep(1);
                  if (onStep5Complete) onStep5Complete();
                }}
                className="w-full sm:w-auto px-6 py-3 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-white font-bold text-xs uppercase tracking-wider rounded-full transition-all"
              >
                Book New Sessions
              </button>

              <button
                onClick={() => {
                  if (onStep5Complete) onStep5Complete();
                  navigate('/dashboard/artist');
                  window.scrollTo(0, 0);
                }}
                className="w-full sm:w-auto px-6 py-3 bg-studio-pink hover:bg-black hover:text-white text-black font-extrabold text-xs uppercase tracking-widest rounded-full transition-all shadow-[0_4px_10px_rgba(255,102,196,0.3)]"
              >
                Artist Dashboard
              </button>

              <a
                href="https://www.instagram.com/tattooplatz_zurich"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-6 py-3 bg-studio-pink hover:bg-black hover:text-white text-black font-extrabold text-xs uppercase tracking-wider rounded-full transition-all flex items-center justify-center gap-2 shadow-[0_4px_10px_rgba(255,102,196,0.3)]"
              >
                <Instagram size={14} />
                Instagram Support
              </a>
            </div>
          </div>
        )}

        {/* ── MODAL: TERMS & CONDITIONS ── */}
        {showTermsModal && createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <div className="bg-white border border-zinc-200/80 rounded-2xl max-w-2xl w-full p-6 sm:p-8 text-black relative shadow-2xl animate-scale-in text-left">
              <button
                onClick={() => setShowTermsModal(false)}
                className="absolute top-4 right-4 text-zinc-400 hover:text-black p-1.5 hover:bg-zinc-55 rounded-lg transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>

              <h4 className="text-base font-black uppercase text-black mb-4 pb-2 border-b border-zinc-100 flex items-center gap-2">
                <FileText className="text-studio-pink" size={18} />
                Terms & Conditions / AGB (tattooplatz)
              </h4>

              <div className="space-y-4 font-sans text-xs max-h-[60vh] overflow-y-auto pr-2 leading-relaxed">

                <div className="text-zinc-500 italic text-[10px] border border-zinc-100 bg-zinc-50 rounded-lg p-3">
                  <p><strong>Re:</strong> Workspace including furnishings and ancillary rooms</p>
                  <p className="mt-1">consisting of a visually separated workspace within the commercial premises, equipped for tattooing, and ancillary rooms (shared restrooms on the same floor) — hereinafter referred to as the <strong>"Property of Use"</strong></p>
                  <p className="mt-1">located at <strong>Aargauerstrasse 180, 8048 Zurich.</strong></p>
                </div>

                <div>
                  <h5 className="font-extrabold text-black mb-1 uppercase tracking-wide">I. Preamble</h5>
                  <p className="text-zinc-600">
                    The operator provides the user with a permanently assigned workspace including furnishings and ensures its proper functioning. In addition, the operator provides the user with a sink and a toilet for general (non-exclusive) use. The toilet is located on the same floor outside the commercial premises and is used by all tenants on the same floor. This framework agreement is limited solely to the provision of these premises, which must be handled with care in all cases. The operator has no authority over the user in connection with the tattooing process. In particular, the user determines when and how they perform a tattoo, and bears sole responsibility for this. Furthermore, it is the user's responsibility to acquire clients, determine their pricing, and set their own working hours. The operator has no authority to issue instructions in this regard.
                  </p>
                </div>

                <div>
                  <h5 className="font-extrabold text-black mb-1 uppercase tracking-wide">II. Subject Matter of the Agreement</h5>
                  <p className="text-zinc-600">
                    <strong>(1)</strong> This agreement is structured as a framework agreement and forms the basis for the individual user agreements concluded via the operator's online tool (www.tattooplatz.ch). The framework agreement therefore governs the fundamental terms and conditions between the operator and the user. This agreement does not create any entitlement for the user to use a workspace.
                  </p>
                </div>

                <div>
                  <h5 className="font-extrabold text-black mb-1 uppercase tracking-wide">III. Duration of Use</h5>
                  <p className="text-zinc-600">
                    <strong>(2)</strong> The duration of use is limited and ends automatically, without any action required by either party, depending on the duration booked on the operator's online tool (www.tattooplatz.ch). A tacit continuation of the agreement is excluded, although the user is free to book or arrange further time slots via the operator's online tool, provided spaces are available.
                  </p>
                </div>

                <div>
                  <h5 className="font-extrabold text-black mb-1 uppercase tracking-wide">IV. Usage Fee</h5>
                  <p className="text-zinc-600 mb-2">
                    <strong>A. Amount of the Usage Fee</strong>
                  </p>
                  <p className="text-zinc-600 mb-2">
                    <strong>(3)</strong> The fee for the use of a workspace and ancillary rooms is determined according to the price list, including cancellation fees, posted on the operator's website (www.tattooplatz.ch).
                  </p>
                  <p className="text-zinc-600 mb-2">
                    <strong>(4)</strong> No additional fees (e.g., heating, electricity, waste disposal costs, internet) will be charged. Any claims arising from improper or careless use of the provided equipment, the commercial space including the workspace, and ancillary rooms are reserved.
                  </p>
                  <p className="text-zinc-600 mb-2">
                    <strong>B. Due Date</strong>
                  </p>
                  <p className="text-zinc-600">
                    <strong>(5)</strong> The total usage fee is payable in advance. Payment is processed via the online tool on the operator's website (www.tattooplatz.ch).
                  </p>
                </div>

                <div>
                  <h5 className="font-extrabold text-black mb-1 uppercase tracking-wide">V. Use of the Workspace and Ancillary Rooms</h5>
                  <p className="text-zinc-600">
                    <strong>(6)</strong> The workspace provided on the operator's premises, including its facilities and ancillary rooms, must be used appropriately and carefully. Use is limited to tattooing. The provision or sale of any other services is prohibited. Furthermore, the user must be considerate of other users in the same premises and of all tenants of the entire property when using the workspace and ancillary rooms, and must adhere to the house rules. The user is also obligated to observe the studio's opening hours and to leave the premises after closing time.
                  </p>
                </div>

                <div>
                  <h5 className="font-extrabold text-black mb-1 uppercase tracking-wide">VI. Maintenance and Upkeep of the Premises</h5>
                  <p className="text-zinc-600">
                    <strong>(7)</strong> The user is obligated to treat the workspace and all premises with care and to maintain them in a usable and suitable condition. The user is responsible to the operator for any damage caused to the entire property as well as to valuables belonging to other users on the premises and is obligated to repair any damage immediately, provided the damage was caused by them, their customers and their companions, or their employees. The user shall indemnify the operator in this regard. The user waives the right to assert claims for damages against the operator if, in the event of damage caused by third parties.
                  </p>
                </div>

              </div>

              <div className="flex justify-end pt-4 mt-4 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setShowTermsModal(false)}
                  className="px-6 py-2.5 bg-black text-white hover:bg-studio-pink hover:text-black font-extrabold uppercase tracking-wider rounded-xl transition-colors text-[9px] cursor-pointer"
                >
                  Close / Schließen
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

        {/* ── MODAL: CANCELLATION POLICY ── */}
        {showCancelModal && createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <div className="bg-white border border-zinc-200/80 rounded-2xl max-w-md w-full p-6 sm:p-8 text-black relative shadow-2xl animate-scale-in text-left">
              <button
                onClick={() => setShowCancelModal(false)}
                className="absolute top-4 right-4 text-zinc-400 hover:text-black p-1.5 hover:bg-zinc-55 rounded-lg transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>

              <h4 className="text-base font-black uppercase text-black mb-4 pb-2 border-b border-zinc-100 flex items-center gap-2">
                <Clock className="text-studio-pink" size={18} />
                Cancellation Policy (tattooplatz)
              </h4>

              <div className="space-y-4 font-sans text-xs leading-relaxed">
                <div>
                  <p className="text-zinc-700 leading-relaxed">
                    Bookings can only be changed or canceled free of charge <strong>72 hours</strong> before the start of the booking.
                  </p>
                </div>
                <div>
                  <p className="text-zinc-700 leading-relaxed">
                    If an appointment is missed without prior notice, we reserve the right to charge the <strong>full amount</strong>.
                  </p>
                </div>
              </div>

              <div className="flex justify-end pt-4 mt-4 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setShowCancelModal(false)}
                  className="px-6 py-2.5 bg-black text-white hover:bg-studio-pink hover:text-black font-extrabold uppercase tracking-wider rounded-xl transition-colors text-[9px] cursor-pointer"
                >
                  Close / Schließen
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      </div>

      {/* BLOCKED DATE POPUP ALERT NOTICE MODAL */}
      {blockedNoticeModal && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in font-sans">
          <div className="bg-white border border-zinc-200 rounded-2xl max-w-md w-full p-6 text-black relative shadow-2xl animate-scale-in text-center">
            <button
              onClick={() => setBlockedNoticeModal(null)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-black p-1.5 hover:bg-zinc-100 rounded-lg transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="w-14 h-14 bg-black text-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-zinc-800 shadow-md">
              <AlertCircle size={32} />
            </div>

            <h4 className="text-base font-black uppercase text-black mb-2 tracking-wider">
              STUDIO DATE BLOCKED
            </h4>

            <p className="text-xs text-zinc-700 font-medium leading-relaxed mb-6 bg-zinc-50 border border-zinc-200/80 p-4 rounded-xl text-center">
              This date or time range has been blocked by studio administration. Booking is unavailable for this slot. Please choose another date from the calendar.
            </p>

            <button
              onClick={() => setBlockedNoticeModal(null)}
              className="w-full py-3 bg-black hover:bg-zinc-800 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer"
            >
              UNDERSTOOD & CHOOSE ANOTHER DATE
            </button>
          </div>
        </div>,
        document.body
      )}

      {/* SUCCESS TOAST */}
      {copyToast && createPortal(
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] animate-fade-in-up">
          <div className="bg-black text-white px-6 py-4 rounded-xl shadow-2xl border border-zinc-800 flex items-center gap-3">
            <Check size={18} className="text-green-400" />
            <span className="text-sm font-bold">{copyToast}</span>
          </div>
        </div>,
        document.body
      )}
    </section>
  );
}
