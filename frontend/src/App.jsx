import React from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import AboutUs from './components/AboutUs';
import VisaWidget from './components/VisaWidget';
import Steps from './components/Steps';
import Team from './components/Team';
import Pricing from './components/Pricing';
import Merch from './components/Merch';
import BookingTool from './components/BookingTool';
import Footer from './components/Footer';
import LoginPage from './components/LoginPage';
import ArtistDashboard from './components/ArtistDashboard';
import AdminDashboard from './components/AdminDashboard';
import LegalPage from './components/LegalPage';
import CookieBanner from './components/CookieBanner';
import { getPricingForDay, initializeDayBasedPricing } from './utils/pricing';
import { ShoppingBag, X, Trash2, Calendar, Sparkles, Clock, Wallet, Instagram, Mail } from 'lucide-react';

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname;

  let activeSection = 'start';
  if (path === '/booking') activeSection = 'booking';
  else if (path === '/studio') activeSection = 'studio';
  else if (path === '/team') activeSection = 'team';
  else if (path === '/about') activeSection = 'about';
  else if (path === '/merch') activeSection = 'merch';
  else if (path === '/contact') activeSection = 'contact';

  const [cart, setCart] = React.useState([]);
  const [isCartOpen, setIsCartOpen] = React.useState(false);
  const [isCheckoutCompleted, setIsCheckoutCompleted] = React.useState(false);
  const [isCookieModalOpen, setIsCookieModalOpen] = React.useState(false);
  const [currentUser, setCurrentUser] = React.useState(() => {
    const saved = localStorage.getItem('tattooplatz_current_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return null;
  });

  React.useEffect(() => {
    if (currentUser) {
      localStorage.setItem('tattooplatz_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('tattooplatz_current_user');
    }
  }, [currentUser]);

  const [registeredArtists, setRegisteredArtists] = React.useState(() => {
    // One-time cache clear for clean testing
    const hasReset = localStorage.getItem('tattooplatz_fresh_reset_final_v110');
    if (!hasReset) {
      localStorage.removeItem('tattooplatz_bookings');
      localStorage.removeItem('tattooplatz_inquiries');
      localStorage.removeItem('tattooplatz_registered_artists');
      localStorage.setItem('tattooplatz_fresh_reset_final_v110', 'true');
    }

    const saved = localStorage.getItem('tattooplatz_registered_artists');
    if (saved) {
      try { 
        const parsed = JSON.parse(saved); 
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) { console.error(e); }
    }
    return [
      { id: 1, name: 'Joao Otereze',  email: 'artist@tattooplatz.ch', password: 'artist123', phone: '+41 79 123 45 67', ig: '@artist_instagram', status: 'Active' }
    ];
  });

  React.useEffect(() => {
    localStorage.setItem('tattooplatz_registered_artists', JSON.stringify(registeredArtists));
  }, [registeredArtists]);

  // Live Sync Registered Artists from MySQL Database
  React.useEffect(() => {
    const fetchArtists = async () => {
      try {
        const { authAPI } = await import('./services/api.js');
        const data = await authAPI.getArtists();
        if (data && Array.isArray(data)) {
          const syncedArtists = data.map(u => ({
            id: u.id,
            name: u.name,
            email: u.email,
            phone: u.phone || '',
            ig: u.instagram || '',
            bio: u.bio || '',
            password: '123456',
            status: u.status || 'Active'
          }));
          setRegisteredArtists(syncedArtists);
        }
      } catch (err) {
        console.log('Backend artist fetch offline:', err.message);
      }
    };
    fetchArtists();
    const interval = setInterval(fetchArtists, 4000);
    return () => clearInterval(interval);
  }, []);

  // Manage inquiries state with localStorage persistence
  const [inquiries, setInquiries] = React.useState(() => {
    const saved = localStorage.getItem('tattooplatz_inquiries');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error(e);
      }
    }
    return [];
  });

  React.useEffect(() => {
    localStorage.setItem('tattooplatz_inquiries', JSON.stringify(inquiries));
  }, [inquiries]);

  const [bookings, setBookings] = React.useState(() => {
    const saved = localStorage.getItem('tattooplatz_bookings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Sanitize: ensure station/start/end are always numbers
          return parsed.map(b => ({
            ...b,
            station: parseInt(b.station),
            start: parseInt(b.start),
            end: parseInt(b.end),
            duration: b.duration !== undefined ? parseInt(b.duration) : (parseInt(b.end) - parseInt(b.start))
          }));
        }
      } catch (e) {
        console.error(e);
      }
    }
    return [];
  });

  React.useEffect(() => {
    localStorage.setItem('tattooplatz_bookings', JSON.stringify(bookings));
  }, [bookings]);

  // Fetch live bookings from MySQL Backend on mount to ensure 100% real-time slot synchronization
  React.useEffect(() => {
    const fetchLiveBookings = async () => {
      try {
        const { bookingAPI } = await import('./services/api.js');
        const res = await bookingAPI.getAdminBookings();

        const rawBookings = Array.isArray(res) ? res : (res && Array.isArray(res.bookings) ? res.bookings : []);
        if (rawBookings && rawBookings.length > 0) {
          const synced = rawBookings.map(dbB => {
            let formattedDate = '';
            if (dbB.booking_date) {
              if (typeof dbB.booking_date === 'string') {
                formattedDate = dbB.booking_date.split('T')[0];
              } else if (dbB.booking_date instanceof Date) {
                const d = dbB.booking_date;
                const y = d.getFullYear();
                const m = String(d.getMonth() + 1).padStart(2, '0');
                const day = String(d.getDate()).padStart(2, '0');
                formattedDate = `${y}-${m}-${day}`;
              }
            }
            let dateStrVal = 'Invalid Date';
            if (formattedDate) {
              const parts = formattedDate.split('-');
              if (parts.length === 3) {
                const y = parseInt(parts[0], 10);
                const m = parseInt(parts[1], 10) - 1;
                const d = parseInt(parts[2], 10);
                dateStrVal = new Date(y, m, d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
              }
            }

            return {
              id: dbB.id,
              artist: dbB.artist_name || 'Artist',
              email: dbB.artist_email || '',
              phone: dbB.artist_phone || '',
              instagram: dbB.artist_instagram || '',
              date: formattedDate,
              dateStr: dateStrVal,
              timeStr: `${dbB.start_hour}:00 - ${dbB.end_hour}:00`,
              start: Number(dbB.start_hour),
              end: Number(dbB.end_hour),
              station: Number(dbB.station_id),
              duration: Number(dbB.end_hour) - Number(dbB.start_hour),
              price: Number(dbB.total_price),
              status: dbB.status || 'Confirmed',
              location: dbB.location || 'Zurich',
              source: 'Backend Sync'
            };
          });


          setBookings(prev => {
            const backendIds = new Set(synced.map(b => String(b.id)));
            const localOnly = prev.filter(b => !backendIds.has(String(b.id)));
            return [...synced, ...localOnly];
          });
        }
      } catch (err) {
        console.log('Backend live bookings fetch offline:', err.message);
      }
    };

    fetchLiveBookings();
    const interval = setInterval(fetchLiveBookings, 4000);
    return () => clearInterval(interval);
  }, []);




  // One-time cleanup: Force remove old mock data and unwanted test data (Guest Artist, John)
  React.useEffect(() => {
    setBookings(prev => {
      const cleaned = prev.filter(b => {
        // Remove old hardcoded mocks (IDs 201-205)
        if (b.id >= 201 && b.id <= 205) return false;
        // Remove specific unwanted test names
        const artistName = b.artist?.toLowerCase() || '';
        if (artistName === 'guest artist' || artistName === 'john') return false;
        return true; // Keep everything else (like Semii)
      });
      return cleaned.length !== prev.length ? cleaned : prev;
    });
  }, []);

  const [managerSettings, setManagerSettingsState] = React.useState({
    operatingHours: { open: '10:00', close: '18:00' },
    openingDays: { Monday: false, Tuesday: false, Wednesday: true, Thursday: true, Friday: true, Saturday: true, Sunday: false },
    pricing: { '3H': 90, '4H': 120, '6H': 180, '8H': 220 }
  });
  const [isLoadingSettings, setIsLoadingSettings] = React.useState(true);

  React.useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { managerSettingsAPI } = await import('./services/api.js');
        const data = await managerSettingsAPI.getSettings();
        
        if (data) {
          let parsedPricing = data.pricing;
          if (typeof parsedPricing === 'string') {
            try { parsedPricing = JSON.parse(parsedPricing); } catch(e) { parsedPricing = null; }
          }
          while (parsedPricing && typeof parsedPricing === 'object' && parsedPricing.pricing) {
            parsedPricing = parsedPricing.pricing;
          }
          parsedPricing = initializeDayBasedPricing(parsedPricing);

          let rawHours = data.operatingHours || data.operating_hours;
          if (typeof rawHours === 'string') {
            try { rawHours = JSON.parse(rawHours); } catch(e) { rawHours = null; }
          }
          if (!rawHours || typeof rawHours !== 'object' || !rawHours.open) {
            rawHours = { open: '10:00', close: '18:00' };
          }

          let rawDays = data.openingDays || data.opening_days;
          if (typeof rawDays === 'string') {
            try { rawDays = JSON.parse(rawDays); } catch(e) { rawDays = null; }
          }
          if (!rawDays || typeof rawDays !== 'object') {
            rawDays = { Monday: false, Tuesday: false, Wednesday: true, Thursday: true, Friday: true, Saturday: true, Sunday: false };
          }

          setManagerSettingsState({
            operatingHours: rawHours,
            openingDays: rawDays,
            pricing: parsedPricing
          });

          if (localStorage.getItem('tattooplatz_manager_settings')) {
            localStorage.removeItem('tattooplatz_manager_settings');
          }
        } else {
          // Migration from LocalStorage to MySQL
          const saved = localStorage.getItem('tattooplatz_manager_settings');
          if (saved) {
            const parsed = JSON.parse(saved);
            if (parsed.pricing) {
              parsed.pricing = initializeDayBasedPricing(parsed.pricing);
            }
            await managerSettingsAPI.updateSettings(parsed);
            setManagerSettingsState(parsed);
            localStorage.removeItem('tattooplatz_manager_settings');
          } else {
             // Initial seed if both are empty
             const seededSettings = { ...managerSettings };
             seededSettings.pricing = initializeDayBasedPricing(seededSettings.pricing);
             await managerSettingsAPI.updateSettings(seededSettings);
             setManagerSettingsState(seededSettings);
          }
        }
      } catch (err) {
        console.error('Failed to load manager settings from API:', err);
      } finally {
        setIsLoadingSettings(false);
      }
    };
    fetchSettings();
  }, []);

  const setManagerSettings = async (newSettings) => {
    // Optimistic update
    setManagerSettingsState(newSettings);
    try {
      const { managerSettingsAPI } = await import('./services/api.js');
      await managerSettingsAPI.updateSettings(newSettings);
    } catch (err) {
      console.error('Failed to update manager settings to DB:', err);
    }
  };

  // const [complianceRecords, setComplianceRecords] = React.useState(() => {
  //   const saved = localStorage.getItem('tattooplatz_compliance_records');
  //   if (saved) {
  //     try { 
  //       const parsed = JSON.parse(saved); 
  //       if (Array.isArray(parsed) && parsed.length > 0) return parsed;
  //     } catch (e) { console.error(e); }
  //   }
  //   return [
  //     { id: 1, artist: 'Joao Otereze', email: 'artist@tattooplatz.ch', docType: 'EasyGov Swiss Registration', date: '2026-06-10', status: 'Approved', fileName: 'easygov_joao.pdf' },
  //     { id: 2, artist: 'Marco V.', email: 'marco.v@gmail.com', docType: 'EasyGov Swiss Registration', date: '2026-06-11', status: 'Approved', fileName: 'easygov_marco.pdf' },
  //     { id: 3, artist: 'Alina R.', email: 'alina.r@gmail.com', docType: 'EasyGov Swiss Registration', date: '2026-06-11', status: 'Approved', fileName: 'easygov_alina.pdf' },
  //     { id: 4, artist: 'Jonas K.', email: 'jonas.k@tattooplatz.ch', docType: 'EasyGov Swiss Registration', date: '2026-06-12', status: 'Pending', fileName: 'easygov_jonas.pdf' },
  //     { id: 5, artist: 'Sofia M.', email: 'sofia.m@gmail.com', docType: 'Swiss Hygiene Declaration', date: '2026-06-09', status: 'Approved', fileName: 'hygiene_sofia.pdf' },
  //   ];
  // });

  // React.useEffect(() => {
  //   localStorage.setItem('tattooplatz_compliance_records', JSON.stringify(complianceRecords));
  // }, [complianceRecords]);


  // Global Scroll Reveal Animation Logic
  React.useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animation-running');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    const observeElements = () => {
      const animatedElements = document.querySelectorAll(
        '.animate-slide-in-left, .animate-slide-in-right, .animate-slide-up, .animate-fade-in, .animate-scale-up'
      );
      animatedElements.forEach((el) => {
        // Only observe if it hasn't been triggered yet
        if (!el.classList.contains('animation-running')) {
          observer.observe(el);
        }
      });
    };

    // Initial check
    observeElements();
    const timeout = setTimeout(observeElements, 100);

    // Set up a MutationObserver to catch elements added dynamically by React (like form steps)
    const mutationObserver = new MutationObserver(() => {
      observeElements();
    });

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true
    });

    return () => {
      clearTimeout(timeout);
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, []); // Run once on mount, MutationObserver handles everything else


  // const handleAddComplianceRecord = (artistName, docType, fileName, fileBase64, fileType) => {
  //   const newRecord = {
  //     id: Date.now() + Math.random(),
  //     artist: artistName,
  //     docType: docType,
  //     date: new Date().toISOString().split('T')[0],
  //     status: 'Pending',
  //     fileName: fileName,
  //     fileBase64: fileBase64 || null,  // base64 data URI for preview
  //     fileType: fileType || null        // MIME type e.g. 'application/pdf' or 'image/jpeg'
  //   };
  //   setComplianceRecords(prev => [newRecord, ...prev]);
  // };


  const handleBookingConfirm = async (sessions, artistDetails) => {
    try {
      const { bookingAPI } = await import('./services/api.js');
      
      const newBookings = [];
      const sessionList = (Array.isArray(sessions) && sessions.length > 0) ? sessions : (Array.isArray(cart) && cart.length > 0 ? cart : []);

      for (const [index, session] of sessionList.entries()) {
        const times = (session.timeStr || '11:00 - 15:00').split(' - ');
        const startHour = parseInt(times[0].split(':')[0]) || 11;
        const endHour = parseInt(times[1].split(':')[0]) || 15;

        
        const artistName = (artistDetails && (artistDetails.name || artistDetails.artist)) ? (artistDetails.name || artistDetails.artist) : (currentUser?.name || 'Guest Artist');
        const artistEmail = (artistDetails && artistDetails.email) ? artistDetails.email : (currentUser?.email || 'guest@tattooplatz.ch');
        const stationNum = parseInt(session.station) || 1;
        const sessionPrice = Number(session.price) || 120;

        const bookingPayload = {
          artist: artistName,
          email: artistEmail,
          phone: artistDetails?.phone || '',
          instagram: artistDetails?.ig || artistDetails?.instagram || 'Not provided',
          date: session.date || new Date().toISOString().split('T')[0],
          start: parseInt(startHour),
          end: parseInt(endHour),
          station: stationNum,
          price: sessionPrice,
          location: 'Zurich'
        };

        // Call backend API
        const response = await bookingAPI.createPublicBooking(bookingPayload);

        
        // Prepare local state object
        newBookings.push({
          ...bookingPayload,
          id: response.bookingId || (Date.now() + index),
          dateStr: session.dateStr,
          timeStr: session.timeStr,
          duration: parseInt(endHour) - parseInt(startHour),
          status: 'Confirmed',
          source: 'Public Website'
        });
      }

      setBookings(prev => [...newBookings, ...prev]);
      setCart([]);
    } catch (err) {
      console.error('Failed to create public booking:', err);
      alert(err.message);
      navigate('/');
      window.scrollTo(0, 0);
    }

    // Create compliance records if documents were uploaded during booking [COMMENTED OUT]
    // if (artistDetails.easyGovFile) {
    //   handleAddComplianceRecord(
    //     artistDetails.name,
    //     'EasyGov Swiss Registration',
    //     artistDetails.easyGovFile,
    //     artistDetails.easyGovBase64 || null,
    //     artistDetails.easyGovType || null
    //   );
    // }
    // if (artistDetails.hygieneFile) {
    //   handleAddComplianceRecord(
    //     artistDetails.name,
    //     'Swiss Hygiene Declaration',
    //     artistDetails.hygieneFile,
    //     artistDetails.hygieneBase64 || null,
    //     artistDetails.hygieneType || null
    //   );
    // }
  };

  const handleAddInquiry = async (inquiry) => {
    setInquiries((prev) => [inquiry, ...prev]);
    try {
      const { inquiryAPI } = await import('./services/api.js');
      await inquiryAPI.submitInquiry({ name: inquiry.name, email: inquiry.email, message: inquiry.message });
    } catch (err) {
      console.log('Backend sync offline, saved locally:', err.message);
    }
  };

  const handleDeleteInquiry = async (id) => {
    setInquiries((prev) => prev.filter(item => item.id !== id));
    try {
      const { inquiryAPI } = await import('./services/api.js');
      await inquiryAPI.deleteInquiry(id);
    } catch (err) {
      console.log('Backend delete sync offline:', err.message);
    }
  };

  const handleNavClick = (sectionId) => {
    let targetPath = '/';
    if (sectionId === 'booking') targetPath = '/booking';
    else if (sectionId === 'studio') targetPath = '/studio';
    else if (sectionId === 'team') targetPath = '/team';
    else if (sectionId === 'about') targetPath = '/about';
    else if (sectionId === 'merch') targetPath = '/merch';
    else if (sectionId === 'contact') targetPath = '/contact';

    navigate(targetPath);
    window.scrollTo(0, 0);
  };

  const handleAddToCart = (product) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.id === product.id && item.type === 'merch');
      if (existing) {
        return prevCart.map((item) =>
          item.id === product.id && item.type === 'merch'
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { ...product, type: 'merch', quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const handleAddBookingToCart = (booking) => {
    setCart((prevCart) => [
      ...prevCart,
      { ...booking, type: 'booking', name: `Station ${booking.station} Rent`, quantity: 1 }
    ]);
  };

  const handleRemoveFromCart = (id, type) => {
    setCart((prevCart) => prevCart.filter((item) => !(item.id === id && item.type === type)));
  };

  const cartSubtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const handleCheckout = () => {
    setIsCartOpen(false);
    navigate('/booking?step=4');
    window.scrollTo(0, 0);
  };

  const formatDays = (daysObj) => {
    if (!daysObj) return 'WEDNESDAY TO SUNDAY';
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const openDays = days.filter(d => daysObj[d]);
    if (openDays.length === 0) return 'CLOSED';
    if (openDays.length === 7) return 'MONDAY TO SUNDAY';
    return openDays.join(', ').toUpperCase();
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '10:00 AM';
    const [h, m] = timeStr.split(':');
    const hh = parseInt(h);
    const ampm = hh >= 12 ? 'PM' : 'AM';
    const h12 = hh % 12 || 12;
    return `${h12}:${m} ${ampm}`;
  };

  const showNavAndFooter = !['/login', '/dashboard/artist', '/dashboard/admin'].includes(path);
  const showFullFooter = path === '/contact';

  if (isLoadingSettings) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-studio-pink"></div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen text-black font-sans selection:bg-studio-pink selection:text-black">

      {/* Header Navigation */}
      {showNavAndFooter && (
        <Navbar
          activeSection={activeSection}
          onNavClick={handleNavClick}
          cartCount={cart.reduce((acc, item) => acc + item.quantity, 0)}
          onOpenCart={() => setIsCartOpen(true)}
          onLoginClick={() => { navigate('/login'); window.scrollTo(0, 0); }}
        />
      )}

      {/* Page Routing Switch */}
      <div className={path !== '/' && showNavAndFooter ? 'pt-20' : ''}>
        {showNavAndFooter && path !== '/' && (
          <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 pb-2 animate-fade-in">
            <nav className="flex items-center space-x-2 text-[10px] font-black tracking-[0.2em] text-zinc-400 uppercase font-sans">
              <button
                onClick={() => { navigate('/'); window.scrollTo(0, 0); }}
                className="hover:text-studio-pink transition-colors duration-200 cursor-pointer"
              >
                HOME
              </button>
              <span className="text-zinc-300 font-normal">/</span>
              <span className="text-black font-black">
                {path === '/booking' && 'BOOK A SESSION'}
                {path === '/studio' && 'STUDIO'}
                {path === '/pricing' && 'PRICING'}
                {path === '/team' && 'TEAM'}
                {path === '/about' && 'ABOUT US'}
                {path === '/merch' && 'MERCH'}
                {path === '/contact' && 'CONTACT'}
              </span>
            </nav>
          </div>
        )}
        <Routes>
          <Route path="/" element={
            <>
              <Hero onBookClick={() => { navigate('/booking'); window.scrollTo(0, 0); }} />

              {/* ── Steps Section ── */}
              <Steps />

              {/* ── Book Here (Packages List) Section ── */}
              <section id="pricing-packages" className="w-full bg-white text-black py-16 overflow-hidden border-t border-zinc-150 font-display">
                <div className="max-w-5xl mx-auto px-6 text-center">
                  <h2 className="text-[44px] sm:text-[56px] font-black text-[#FF66C4] tracking-tighter mb-4 uppercase">
                    BOOK HERE
                  </h2>

                  <div className="space-y-4 max-w-4xl mx-auto text-left">
                    {(() => {
                      const currentPricing = getPricingForDay(managerSettings?.pricing);
                      return [
                        { title: '3 hour session', duration: '3 Hrs', price: `${currentPricing['3H'] || 90}.00 CHF`, hours: 3 },
                        { title: '4 hour session', duration: '4 Hrs', price: `${currentPricing['4H'] || 120}.00 CHF`, hours: 4 },
                        { title: '6 hour session', duration: '6 Hrs', price: `${currentPricing['6H'] || 150}.00 CHF`, hours: 6 },
                        { title: '8 hour session', duration: '8 Hrs', price: `${currentPricing['8H'] || 220}.00 CHF`, hours: 8 },
                      ].map((pkg, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-6 sm:p-7 md:p-8 bg-white border border-zinc-200 rounded-[20px] shadow-sm hover:border-[#FF66C4] transition-all duration-300"
                      >
                        <div className="space-y-1">
                          <h4 className="text-lg sm:text-xl md:text-2xl font-black text-black uppercase tracking-tight leading-none">
                            {pkg.title}
                          </h4>
                          <div className="flex items-center gap-6 text-xs sm:text-sm font-bold text-zinc-400 uppercase font-sans">
                            <span className="flex items-center gap-1.5">
                              <Clock size={16} className="text-[#FF66C4]" />
                              {pkg.duration}
                            </span>
                            <span className="flex items-center gap-1.5 text-[#FF66C4] font-black">
                              <Wallet size={16} className="text-[#FF66C4]" />
                              {pkg.price}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            navigate(`/booking?hours=${pkg.hours}`);
                            window.scrollTo(0, 0);
                          }}
                          className="px-6 py-2.5 sm:px-8 sm:py-3 bg-[#FF66C4] text-white text-xs sm:text-sm font-black tracking-widest uppercase hover:bg-black hover:text-white transition-all duration-300 rounded-[10px] shadow-xs"
                        >
                          Select
                        </button>
                      </div>
                    ))}
                    )()
                    }
                  </div>
                </div>
              </section>

              {/* ── Work Visa Section ── */}
              <VisaWidget />



              {/* ── Blue Room Mirror Photo (Constrained size & rounded corners) ── */}
              <div className="w-full max-w-[960px] mx-auto px-6 py-8">
                <img
                  src="/home-banner-1.png"
                  alt="Tattooplatz Zurich Co-Working Space"
                  className="w-full h-[280px] sm:h-[360px] md:h-[420px] object-cover rounded-[24px] border border-zinc-200/60 shadow-md"
                />
              </div>

              {/* ── Custom Bottom Section: Opening Hours & Contact Details ── */}
              <section id="contact-footer" className="w-full bg-white text-black font-sans py-20 overflow-hidden">
                <div className="max-w-5xl mx-auto px-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24 items-start">

                    {/* Left Column (Opening Hours & Links) */}
                    <div className="flex flex-col pt-0 font-display">
                      <h2 className="text-[36px] sm:text-[48px] md:text-[60px] font-black text-[#FF66C4] tracking-tighter leading-[0.85] mb-10 uppercase">
                        THE FUTURE<br />OF<br />TATTOOING.
                      </h2>

                      <h3 className="text-lg sm:text-xl font-extrabold text-black tracking-tight mb-2 uppercase">OPENING HOURS</h3>
                      <p className="text-base sm:text-lg font-bold text-zinc-800 tracking-tight mb-1 uppercase">{formatDays(managerSettings?.openingDays)}</p>
                      <p className="text-base sm:text-lg font-bold text-zinc-800 tracking-tight mb-16 uppercase">{formatTime(managerSettings?.operatingHours?.open || '10:00')} TO {formatTime(managerSettings?.operatingHours?.close || '18:00')}</p>


                      <div className="flex flex-col gap-6">
                        <div className="flex items-center gap-4">
                          <Instagram size={28} className="text-black flex-shrink-0" strokeWidth={1.5} />
                          <a href="https://www.instagram.com/tattooplatz_zurich" target="_blank" rel="noreferrer" className="text-sm sm:text-base font-bold text-black underline hover:text-[#FF66C4] transition-colors tracking-tight uppercase">
                            TATTOOPLATZ_ZURICH
                          </a>
                        </div>
                        <div className="flex items-center gap-4">
                          <Mail size={28} className="text-black flex-shrink-0" strokeWidth={1.5} />
                          <a href="mailto:hello@tattooplatz.ch" className="text-sm sm:text-base font-bold text-black underline hover:text-[#FF66C4] transition-colors tracking-tight uppercase">
                            HELLO@TATTOOPLATZ.CH
                          </a>
                        </div>
                      </div>
                    </div>

                    {/* Right Column (Contact Details & Map Embed) */}
                    <div className="w-full max-w-[480px] mx-auto md:ml-auto flex flex-col gap-6 text-center font-display">
                      <div className="flex flex-col items-center">
                        <h3 className="text-lg sm:text-xl font-extrabold text-black tracking-tight mb-2 uppercase">TATTOOPLATZ GMBH</h3>
                        <p className="text-base sm:text-lg font-medium text-zinc-700 tracking-tight mb-1">Aargauerstrasse 180</p>
                        <p className="text-base sm:text-lg font-medium text-zinc-700 tracking-tight mb-6">8048 Zürich</p>
                      </div>

                      {/* Interactive Google Map */}
                      <div className="w-full h-[250px] relative rounded-[16px] overflow-hidden border border-zinc-200 shadow-sm">
                        <div className="absolute inset-0 pointer-events-none mix-blend-multiply z-10 bg-[#FF66C4]/10"></div>
                        <iframe
                          title="Tattooplatz Zürich Location Map"
                          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2702.9!2d8.4967!3d47.3909!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47900a3b5c00f4e7%3A0x0!2sAargauerstrasse%20180%2C%208048%20Z%C3%BCrich!5e0!3m2!1sen!2sch!4v1"
                          width="100%"
                          height="100%"
                          style={{ border: 0 }}
                          allowFullScreen=""
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                        />
                      </div>
                    </div>

                  </div>
                </div>
              </section>
            </>
          } />

          <Route path="/booking" element={
            <BookingTool managerSettings={managerSettings} bookings={bookings} registeredArtists={registeredArtists} onRegisterArtist={(newArtist) => setRegisteredArtists(prev => [...prev, newArtist])} onAddBookingToCart={handleAddBookingToCart} onBookingConfirm={handleBookingConfirm} onAddInquiry={handleAddInquiry} onLoginSuccess={(user) => setCurrentUser(user)} onStep5Complete={() => setCart([])} />
          } />

          <Route path="/studio" element={
            <About />
          } />

          <Route path="/pricing" element={
            <Pricing managerSettings={managerSettings} onBookClick={() => { navigate('/booking'); window.scrollTo(0, 0); }} />
          } />

          <Route path="/team" element={
            <Team />
          } />

          <Route path="/about" element={
            <AboutUs />
          } />

          <Route path="/privacy-policy" element={
            <LegalPage title="Privacy Policy" />
          } />

          <Route path="/impressum" element={
            <LegalPage title="Impressum" />
          } />

          <Route path="/cancellation-policy" element={
            <LegalPage title="Cancellation Policy" />
          } />

          <Route path="/contact" element={null} />

          <Route path="/merch" element={
            <Merch onAddToCart={handleAddToCart} />
          } />

          <Route path="/login" element={
            <LoginPage
              registeredArtists={registeredArtists}
              onLoginSuccess={(userProfile) => {
                setCurrentUser(userProfile);
                const params = new URLSearchParams(location.search);
                const returnUrl = params.get('redirect');
                if (returnUrl) {
                  navigate(returnUrl);
                } else {
                  navigate(userProfile.role === 'artist' ? '/dashboard/artist' : '/dashboard/admin');
                }
                window.scrollTo(0, 0);
              }}
              onBack={() => { navigate('/'); window.scrollTo(0, 0); }}
            />
          } />

          <Route path="/dashboard/artist" element={
            currentUser && currentUser.role === 'artist' ? (
              <ArtistDashboard
                user={currentUser}
                managerSettings={managerSettings}
                bookings={bookings}
                setBookings={setBookings}
                onUpdateUser={(updatedUser) => {
                  const oldEmail = currentUser?.email?.toLowerCase().trim();
                  const newEmail = updatedUser?.email?.toLowerCase().trim();

                  setCurrentUser(prev => ({ ...prev, ...updatedUser }));

                  setRegisteredArtists(prev => prev.map(a => {
                    const aEmail = a.email?.toLowerCase().trim();
                    if (aEmail === oldEmail || aEmail === newEmail) {
                      return { ...a, ...updatedUser };
                    }
                    return a;
                  }));

                  if (oldEmail && newEmail && oldEmail !== newEmail) {
                    setBookings(prev => prev.map(b => {
                      const bEmail = b.email?.toLowerCase().trim();
                      if (bEmail === oldEmail) {
                        return { ...b, email: newEmail, artist: updatedUser.name || b.artist };
                      }
                      return b;
                    }));
                  }
                }}
                onLogout={() => {
                  setCurrentUser(null);
                  navigate('/');
                  window.scrollTo(0, 0);
                }}
              />
            ) : (
              <Navigate to="/login" replace />
            )
          } />

          <Route path="/dashboard/admin" element={
            currentUser && currentUser.role === 'admin' ? (
              <AdminDashboard
                currentUser={currentUser}
                managerSettings={managerSettings}
                setManagerSettings={setManagerSettingsState}


                inquiries={inquiries}
                onDeleteInquiry={handleDeleteInquiry}
                bookings={bookings}
                setBookings={setBookings}
                registeredArtists={registeredArtists}
                setRegisteredArtists={setRegisteredArtists}
                // complianceRecords={complianceRecords}
                // setComplianceRecords={setComplianceRecords}
                onLogout={() => {
                  setCurrentUser(null);
                  navigate('/');
                  window.scrollTo(0, 0);
                }}
              />
            ) : (
              <Navigate to="/login" replace />
            )
          } />

          <Route path="/terms-and-conditions" element={<LegalPage title="Terms & Conditions" />} />
          <Route path="/privacy-policy" element={<LegalPage title="Privacy Policy" />} />
          <Route path="/cancellation-policy" element={<LegalPage title="Cancellation Policy" />} />
          <Route path="/impressum" element={<LegalPage title="Impressum (Legal Notice)" />} />

          {/* Wildcard redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      {showFullFooter ? (
        <Footer onAddInquiry={handleAddInquiry} managerSettings={managerSettings} onOpenCookieSettings={() => setIsCookieModalOpen(true)} />
      ) : (
        showNavAndFooter && (
          <footer className="border-t border-zinc-200 py-8 bg-white text-center flex flex-col sm:flex-row items-center justify-between gap-4 max-w-5xl mx-auto px-4 sm:px-6 mt-2 sm:mt-6">
            <div className="text-xs font-semibold tracking-wider text-zinc-500 uppercase">
              &copy; {new Date().getFullYear()} TATTOOPLATZ GMBH. ALL RIGHTS RESERVED.
            </div>
            <div className="flex flex-wrap justify-center space-x-4 sm:space-x-6 text-xxs font-black tracking-widest uppercase gap-y-2">
              <a href="/terms-and-conditions" className="text-zinc-500 hover:text-studio-pink transition-colors">Terms & Conditions</a>
              <a href="/privacy-policy" className="text-zinc-500 hover:text-studio-pink transition-colors">Privacy Policy</a>
              <a href="/cancellation-policy" className="text-zinc-500 hover:text-studio-pink transition-colors">Cancellation Policy</a>
              <a href="/impressum" className="text-zinc-500 hover:text-studio-pink transition-colors">Impressum</a>
            </div>
          </footer>
        )
      )}

      {/* Slide-out Shopping Cart Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden font-sans">
          {/* Backdrop */}
          <div
            onClick={() => setIsCartOpen(false)}
            className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
          />

          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-white border-l border-zinc-200 shadow-2xl flex flex-col justify-between">

              {/* Header */}
              <div className="p-6 border-b border-zinc-200 flex justify-between items-center bg-zinc-50">
                <h3 className="text-lg font-black uppercase text-black tracking-widest flex items-center gap-2">
                  <ShoppingBag size={20} className="text-studio-pink" />
                  Your Cart
                </h3>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="text-zinc-400 hover:text-black p-2"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Cart Items List */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {isCheckoutCompleted ? (
                  <div className="text-center py-12 space-y-4 animate-fade-in">
                    <span className="inline-flex items-center justify-center w-12 h-12 bg-studio-pink/10 border border-studio-pink text-studio-pink rounded-full">
                      ✓
                    </span>
                    <h4 className="text-base font-extrabold text-black uppercase tracking-wider">CHECKOUT COMPLETE!</h4>
                    <p className="text-xs text-zinc-500 max-w-xs mx-auto leading-relaxed">
                      Thank you for your order! Your booking details and shop invoice details have been emailed.
                    </p>
                  </div>
                ) : cart.length === 0 ? (
                  <div className="text-center py-16 text-zinc-400 space-y-3">
                    <ShoppingBag size={48} className="mx-auto text-zinc-300" />
                    <p className="text-sm italic">Your shopping cart is empty.</p>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div
                      key={`${item.id}-${item.type}`}
                      className="p-4 bg-zinc-50/50 border border-zinc-200 rounded-xl flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white border border-zinc-200 rounded flex items-center justify-center overflow-hidden">
                          {item.type === 'booking' ? (
                            <Calendar size={18} className="text-studio-pink" />
                          ) : (
                            <img src={item.front} alt={item.name} className="w-full h-full object-contain p-1" />
                          )}
                        </div>
                        <div>
                          <span className="text-xs font-black text-black uppercase tracking-wide block line-clamp-1">
                            {item.name}
                          </span>
                          <span className="text-xxs text-zinc-500 block uppercase font-sans mt-0.5">
                            {item.type === 'booking' ? item.timeStr : `Qty: ${item.quantity}`}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-studio-pink whitespace-nowrap">
                          {(item.price * item.quantity).toFixed(2)} CHF
                        </span>
                        <button
                          onClick={() => handleRemoveFromCart(item.id, item.type)}
                          className="text-zinc-400 hover:text-red-500 p-1"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Footer Checkout Summary */}
              {cart.length > 0 && !isCheckoutCompleted && (
                <div className="p-6 bg-zinc-50 border-t border-zinc-200 space-y-4">
                  <div className="flex justify-between items-center text-sm font-sans pb-4 border-b border-zinc-200">
                    <span className="text-zinc-500 uppercase font-semibold">Subtotal:</span>
                    <span className="text-black font-black">{cartSubtotal.toFixed(2)} CHF</span>
                  </div>

                  <div className="flex justify-between items-center text-lg font-black uppercase">
                    <span className="text-black">TOTAL:</span>
                    <span className="text-studio-pink shadow-text text-xl">{cartSubtotal.toFixed(2)} CHF</span>
                  </div>

                  <button
                    onClick={handleCheckout}
                    className="w-full py-4 bg-studio-pink text-black font-extrabold text-xs uppercase tracking-widest hover:bg-black hover:text-white transition-all shadow-[0_0_15px_#FF66C4] rounded-full flex items-center justify-center gap-2"
                  >
                    <Sparkles size={14} className="animate-spin" />
                    Place Checkout Order
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* Swiss nFADP & GDPR Compliant Cookie Banner */}
      <CookieBanner forceOpen={isCookieModalOpen} onClose={() => setIsCookieModalOpen(false)} />

    </div>
  );
}
