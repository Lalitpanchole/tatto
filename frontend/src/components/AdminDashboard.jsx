import React from 'react';
import { ShieldCheck, Calendar, Clock, DollarSign, Users, ShieldAlert, Sliders, Search, Trash2, X, Plus, LogOut, Menu, UserCheck, FileText, BarChart2, Mail, Eye, EyeOff, Phone, Instagram, MessageSquare, Lock, Sparkles, Key, CheckCircle } from 'lucide-react';

import { useNavigate } from 'react-router-dom';
import ArtistAnalytics from './ArtistAnalytics';
import { getPricingForDay, initializeDayBasedPricing, DAYS_OF_WEEK } from '../utils/pricing';

const initialAdminBookings = [
  { id: 201, artist: 'Joao Otereze', date: '2026-06-12', dateStr: 'June 12, 2026', timeStr: '11:00 - 15:00', start: 11, end: 15, station: 2, price: 120, status: 'Confirmed', location: 'Zurich' },
  { id: 202, artist: 'Marco V.', date: '2026-06-12', dateStr: 'June 12, 2026', timeStr: '12:00 - 18:00', start: 12, end: 18, station: 1, price: 180, status: 'Confirmed', location: 'Zurich' },
  { id: 203, artist: 'Alina R.', date: '2026-06-12', dateStr: 'June 12, 2026', timeStr: '15:00 - 18:00', start: 15, end: 18, station: 3, price: 120, status: 'Confirmed', location: 'Zurich' },
  { id: 204, artist: 'Jonas K.', date: '2026-06-13', dateStr: 'June 13, 2026', timeStr: '11:00 - 18:00', start: 11, end: 18, station: 4, price: 220, status: 'Confirmed', location: 'Zurich' },
  { id: 205, artist: 'Sofia M.', date: '2026-06-14', dateStr: 'June 14, 2026', timeStr: '13:00 - 17:00', start: 13, end: 17, station: 2, price: 120, status: 'Confirmed', location: 'Zurich' },
];

const initialArtists = [
  { id: 1, name: 'Joao Otereze', email: 'artist@tattooplatz.ch', phone: '+41 79 123 45 67', ig: '@artist_instagram', status: 'Active' },
  { id: 2, name: 'Marco V.', email: 'marco.v@gmail.com', phone: '+41 78 234 56 78', ig: '@marco_tats', status: 'Active' },
  { id: 3, name: 'Alina R.', email: 'alina.r@gmail.com', phone: '+41 77 345 67 89', ig: '@alina_ink', status: 'Active' },
  { id: 4, name: 'Jonas K.', email: 'jonas.k@tattooplatz.ch', phone: '+41 76 456 78 90', ig: '@jonas_tattoos', status: 'Active' },
  { id: 5, name: 'Sofia M.', email: 'sofia.m@gmail.com', phone: '+41 75 567 89 01', ig: '@sofia_tattoos', status: 'Blocked' },
];

export default function AdminDashboard({ currentUser, managerSettings, setManagerSettings, inquiries = [], onDeleteInquiry, onLogout, bookings, setBookings, registeredArtists = [], setRegisteredArtists }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = React.useState('overview'); // 'overview' | 'calendar' | 'bookings' | 'artists' | 'compliance' | 'reports' | 'settings'

  // Resolve active logged in user profile dynamically
  const activeUser = React.useMemo(() => {
    let userObj = null;
    if (currentUser && currentUser.email) userObj = currentUser;
    else {
      try {
        const stored = localStorage.getItem('tattooplatz_current_user');
        if (stored) userObj = JSON.parse(stored);
      } catch (e) { /* ignore */ }
    }

    if (userObj) {
      if (userObj.email?.toLowerCase() === 'chris@tattooplatz.ch' || userObj.name === 'DEV' || userObj.name === 'Admin') {
        return { ...userObj, name: 'Chris' };
      }
      return userObj;
    }
    return { name: 'Chris', email: 'chris@tattooplatz.ch', role: 'admin' };
  }, [currentUser]);

  // Password Change Form State (Settings tab)
  const [changePwdForm, setChangePwdForm] = React.useState(() => ({
    currentPassword: currentUser?.password || 'admin123',
    newPassword: '',
    confirmPassword: ''
  }));
  const [showCurrentPassword, setShowCurrentPassword] = React.useState(false);
  const [showNewPassword, setShowNewPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [pwdLoading, setPwdLoading] = React.useState(false);
  const [pwdError, setPwdError] = React.useState('');
  const [pwdSuccess, setPwdSuccess] = React.useState('');

  React.useEffect(() => {
    if (!changePwdForm.currentPassword) {
      setChangePwdForm(prev => ({
        ...prev,
        currentPassword: activeUser?.password || 'admin123'
      }));
    }
  }, [activeUser]);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwdError('');
    setPwdSuccess('');

    if (!changePwdForm.newPassword || changePwdForm.newPassword.length < 6) {
      setPwdError('New password must be at least 6 characters long');
      return;
    }
    if (changePwdForm.newPassword !== changePwdForm.confirmPassword) {
      setPwdError('New passwords do not match');
      return;
    }

    setPwdLoading(true);
    try {
      const { authAPI } = await import('../services/api.js');
      await authAPI.changePassword({
        currentPassword: changePwdForm.currentPassword,
        newPassword: changePwdForm.newPassword
      });
      setPwdLoading(false);
      setPwdSuccess('Password updated successfully in database! Future logins will require your new password.');
      setChangePwdForm({ currentPassword: changePwdForm.newPassword, newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPwdLoading(false);
      setPwdError(err.message || 'Failed to update password. Please verify current password.');
    }
  };

  const [selectedBookingForView, setSelectedBookingForView] = React.useState(null);
  const [showContactChannels, setShowContactChannels] = React.useState(false);

  const handleCloseViewModal = () => {
    setSelectedBookingForView(null);
    setShowContactChannels(false);
  };
  const [stationsCount, setStationsCount] = React.useState(4);
  const [searchQuery, setSearchQuery] = React.useState('');
  const todayStr = React.useMemo(() => {
    const t = new Date();
    const yyyy = t.getFullYear();
    const mm = String(t.getMonth() + 1).padStart(2, '0');
    const dd = String(t.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }, []);
  const [selectedDateFilter, setSelectedDateFilter] = React.useState(() => {
    const t = new Date();
    const yyyy = t.getFullYear();
    const mm = String(t.getMonth() + 1).padStart(2, '0');
    const dd = String(t.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  });
  const [selectedLocationFilter, setSelectedLocationFilter] = React.useState('Zurich'); // Focus location
  const [selectedReportLocation, setSelectedReportLocation] = React.useState('Zurich'); // Focus report location
  const [isProfileOpen, setIsProfileOpen] = React.useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = React.useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = React.useState(false);

  const operatingHours = managerSettings?.operatingHours || { open: '10:00', close: '18:00' };
  const openingDays = managerSettings?.openingDays || { Monday: false, Tuesday: false, Wednesday: true, Thursday: true, Friday: true, Saturday: true, Sunday: false };
  const rawPricing = managerSettings?.pricing;
  
  const [localOperatingHours, setLocalOperatingHours] = React.useState(operatingHours);
  const [localOpeningDays, setLocalOpeningDays] = React.useState(openingDays);
  
  // Ensure we are working with day-based pricing locally
  const [localPricing, setLocalPricing] = React.useState(() => initializeDayBasedPricing(rawPricing));
  
  // Day selection state for the UI, defaulting to today
  const [selectedPricingDay, setSelectedPricingDay] = React.useState(() => {
    return new Date().toLocaleDateString('en-US', { weekday: 'long' });
  });

  React.useEffect(() => {
    if (managerSettings) {
      setLocalOperatingHours(operatingHours);
      setLocalOpeningDays(openingDays);
      setLocalPricing(initializeDayBasedPricing(managerSettings.pricing));
    }
  }, [operatingHours, openingDays, managerSettings]);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4500);
  };

  const saveOperatingHours = () => {
    setManagerSettings?.({ ...(managerSettings || {}), operatingHours: localOperatingHours });
    triggerToast('Operating hours saved.');
  };

  const saveOpeningDays = () => {
    setManagerSettings?.({ ...(managerSettings || {}), openingDays: localOpeningDays });
    triggerToast('Opening days saved.');
  };

  const savePricing = () => {
    setManagerSettings?.({ ...(managerSettings || {}), pricing: localPricing });
    triggerToast('Pricing configuration saved.');
  };


  // Modal States
  const [blockingModal, setBlockingModal] = React.useState(false);
  const [blockForm, setBlockForm] = React.useState({ date: '2026-06-12', selectedStations: [1, 2, 3, 4], start: 10, end: 14, location: 'Zurich' });
  const [unblockingModal, setUnblockingModal] = React.useState(null); // stores clicked blocked slot object
  const [showCancelledBlocks, setShowCancelledBlocks] = React.useState(false);
  const [deleteConfirmModal, setDeleteConfirmModal] = React.useState(null); // stores { message, onConfirm }
  const [addArtistModal, setAddArtistModal] = React.useState(false);
  const [newArtistForm, setNewArtistForm] = React.useState({ name: '', email: '', phone: '', ig: '' });

  // Onboard Modal State — convert booking client to studio artist
  const [onboardModal, setOnboardModal] = React.useState(false);
  const [onboardTarget, setOnboardTarget] = React.useState(null); // booking object to onboard
  const [onboardPassword, setOnboardPassword] = React.useState('');

  // Team Tab State — loaded from DB
  const [teamMembers, setTeamMembers] = React.useState([]);
  const [teamLoading, setTeamLoading] = React.useState(false);
  const [addTeamModal, setAddTeamModal] = React.useState(false);
  const [addTeamLoading, setAddTeamLoading] = React.useState(false);
  const [addTeamError, setAddTeamError] = React.useState('');
  const [addTeamSuccess, setAddTeamSuccess] = React.useState('');
  const [newTeamForm, setNewTeamForm] = React.useState({ name: '', title: '', email: '', phone: '' });
  const [viewAdminModal, setViewAdminModal] = React.useState(null); // { id, name, email, title, phone, status }
  const [resetPwdLoading, setResetPwdLoading] = React.useState(false);
  const [resetPwdMsg, setResetPwdMsg] = React.useState('');

  // File Preview Modal State
  const [filePreviewModal, setFilePreviewModal] = React.useState(null); // { fileName, fileBase64, fileType, docType, artist }

  // Email Reply Modal State
  const [replyModal, setReplyModal] = React.useState(null); // { id, name, email, originalMsg }
  const [replySubject, setReplySubject] = React.useState('Response from Tattooplatz Zurich');
  const [replyBody, setReplyBody] = React.useState('');
  const [sendingEmail, setSendingEmail] = React.useState(false);
  const [emailPreviewUrl, setEmailPreviewUrl] = React.useState(null);

  // Notification Toast
  const [toastMessage, setToastMessage] = React.useState('');

  // Load admin team from DB on mount (and whenever team tab becomes active)
  const loadAdminTeam = React.useCallback(async () => {
    setTeamLoading(true);
    try {
      const { adminAPI } = await import('../services/api.js');
      const data = await adminAPI.getTeam();
      if (data && Array.isArray(data.team) && data.team.length > 0) {
        setTeamMembers(data.team);
      } else {
        setTeamMembers([{ id: 1, name: activeUser.name || 'Chris (Co-Founder)', email: activeUser.email || 'chris@tattooplatz.ch', title: 'Studio Manager', phone: '+41 44 123 45 67', status: 'Active' }]);
      }
    } catch (e) {
      console.warn('Could not load admin team from DB:', e.message);
      setTeamMembers([{ id: 1, name: activeUser.name || 'Chris (Co-Founder)', email: activeUser.email || 'chris@tattooplatz.ch', title: 'Studio Manager', phone: '+41 44 123 45 67', status: 'Active' }]);
    } finally {
      setTeamLoading(false);
    }
  }, [activeUser]);


  React.useEffect(() => {
    if (activeTab === 'team') {
      loadAdminTeam();
    }
  }, [activeTab, loadAdminTeam]);






  const getWhatsAppUrl = (phone, artistName) => {
    if (!phone) return '#';
    const cleaned = phone.replace(/[^0-9]/g, '');
    const message = encodeURIComponent(`Hi ${artistName}, this is Tattooplatz regarding your studio workspace booking:`);
    return `https://wa.me/${cleaned}?text=${message}`;
  };

  // Block out workstation
  const handleBlockSubmit = async (e) => {
    e.preventDefault();
    if (!blockForm.selectedStations || blockForm.selectedStations.length === 0) {
      triggerToast('⚠️ Please select at least one station to block!');
      return;
    }

    const dateStr = new Date(blockForm.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    const startH = parseInt(blockForm.start);
    const endH = parseInt(blockForm.end);

    const newBlocks = [];
    for (const stationNum of blockForm.selectedStations) {
      // Call MySQL Backend API for instant server synchronization
      try {
        const { bookingAPI } = await import('../services/api.js');
        await bookingAPI.blockSlot({
          stationId: stationNum,
          bookingDate: blockForm.date,
          startHour: startH,
          endHour: endH,
          location: blockForm.location
        });
      } catch (err) {
        console.log(`Backend block sync offline for Station ${stationNum}:`, err.message);
      }

      newBlocks.push({
        id: Date.now() + stationNum,
        artist: '🚨 STUDIO BLOCKED',
        date: blockForm.date,
        dateStr,
        timeStr: `${startH}:00 - ${endH}:00`,
        start: startH,
        end: endH,
        station: stationNum,
        price: 0,
        status: 'Blocked',
        location: blockForm.location
      });
    }

    setBookings(prev => [...prev, ...newBlocks]);
    
    const isAll = blockForm.selectedStations.length === stationsCount;
    const blockedLabel = isAll
      ? 'All stations'
      : `Stations ${blockForm.selectedStations.sort().join(', ')}`;

    triggerToast(`${blockedLabel} at ${blockForm.location} blocked out on ${dateStr}.`);
    setBlockingModal(false);
  };

  const handleCancelBooking = (id, name) => {
    setDeleteConfirmModal({
      message: `Are you sure you want to cancel the reservation for ${name}? This action cannot be undone.`,
      onConfirm: async () => {
        try {
          const { bookingAPI } = await import('../services/api.js');
          await bookingAPI.cancelBooking(id);
        } catch (err) {
          console.log(`Backend cancel offline for booking ${id}:`, err.message);
        }
        setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'Cancelled' } : b));
        triggerToast(`Reservation for ${name} has been cancelled.`);
      }
    });
  };

  // Direct Unblock Handlers for Timeline Cells
  const handleUnblockSlot = async (targetSlot) => {
    // Find all blocked slots for this date, station, and time slot (handles duplicates & overlapping blocks)
    const matches = bookings.filter(b =>
      b.date === targetSlot.date &&
      Number(b.station) === Number(targetSlot.station) &&
      b.status === 'Blocked' &&
      (b.location || 'Zurich') === (targetSlot.location || 'Zurich') &&
      !(Number(b.end) <= Number(targetSlot.start) || Number(b.start) >= Number(targetSlot.end))
    );

    for (const slot of matches) {
      try {
        const { bookingAPI } = await import('../services/api.js');
        await bookingAPI.cancelBooking(slot.id);
      } catch (err) {
        console.log(`Backend unblock offline for slot ${slot.id}:`, err.message);
      }
    }

    const matchIds = matches.map(m => m.id);
    setBookings(prev => prev.map(b => matchIds.includes(b.id) ? { ...b, status: 'Cancelled' } : b));
    triggerToast(`Station ${targetSlot.station} unblocked successfully!`);
    setUnblockingModal(null);
  };

  const handleUnblockAllStations = async (targetSlot) => {
    // Find all blocked slots for this date and time range across all stations
    const matches = bookings.filter(b =>
      b.date === targetSlot.date &&
      b.status === 'Blocked' &&
      (b.location || 'Zurich') === (targetSlot.location || 'Zurich') &&
      !(Number(b.end) <= Number(targetSlot.start) || Number(b.start) >= Number(targetSlot.end))
    );

    for (const slot of matches) {
      try {
        const { bookingAPI } = await import('../services/api.js');
        await bookingAPI.cancelBooking(slot.id);
      } catch (err) {
        console.log(`Backend unblock offline for slot ${slot.id}:`, err.message);
      }
    }

    const matchIds = matches.map(m => m.id);
    setBookings(prev => prev.map(b => matchIds.includes(b.id) ? { ...b, status: 'Cancelled' } : b));
    triggerToast(`All stations unblocked successfully for the ${targetSlot.timeStr} time slot!`);
    setUnblockingModal(null);
  };


  // Toggle Artist Status (Active / Blocked)
  const toggleArtistStatus = (id, currentStatus) => {
    const nextStatus = currentStatus === 'Active' ? 'Blocked' : 'Active';
    setRegisteredArtists(prev => prev.map(a => a.id === id ? { ...a, status: nextStatus } : a));
    triggerToast(`Artist status updated to ${nextStatus}.`);
  };

  // Add Guest Artist Submit Handler (legacy, still used for fallback)
  const handleAddArtistSubmit = (e) => {
    e.preventDefault();
    if (!newArtistForm.name || !newArtistForm.email) return;

    const newArtist = {
      id: Date.now(),
      name: newArtistForm.name,
      email: newArtistForm.email,
      password: 'guest' + Math.floor(100 + Math.random() * 900),
      ig: newArtistForm.ig ? (newArtistForm.ig.startsWith('@') ? newArtistForm.ig : `@${newArtistForm.ig}`) : 'Not provided',
      status: 'Active'
    };

    setRegisteredArtists((prev) => [...prev, newArtist]);
    setNewArtistForm({ name: '', email: '', phone: '', ig: '' });
    setAddArtistModal(false);
    triggerToast(`Artist "${newArtist.name}" successfully registered!`);
  };

  // Onboard Artist: convert booking client into a registered studio artist
  const handleOnboardSubmit = (e) => {
    e.preventDefault();
    if (!onboardTarget || !onboardPassword) return;

    const emailToUse = (onboardTarget.email || `${onboardTarget.artist.toLowerCase().replace(/[^a-z0-9]/g, '') || 'artist'}@tattooplatz.ch`).trim();

    const existingArtistIndex = registeredArtists.findIndex(a => a && a.email && a.email.toLowerCase() === emailToUse.toLowerCase());

    if (existingArtistIndex !== -1) {
      // Update existing artist password
      setRegisteredArtists(prev => {
        const updated = [...prev];
        updated[existingArtistIndex] = {
          ...updated[existingArtistIndex],
          password: onboardPassword
        };
        return updated;
      });
      triggerToast(`Password updated for ${emailToUse}.`);
      setOnboardModal(false);
      setOnboardTarget(null);
      setOnboardPassword('');
      return;
    }

    const newArtist = {
      id: Date.now(),
      name: onboardTarget.artist,
      email: emailToUse,
      password: onboardPassword,
      phone: onboardTarget.phone || '',
      ig: onboardTarget.instagram || '',
      status: 'Active'
    };
    setRegisteredArtists(prev => [...prev, newArtist]);

    // Update ALL bookings from this artist (match by name or email) → link them to this email
    // This ensures artist sees all their bookings after login
    setBookings(prev => prev.map(bk => {
      const nameMatch = bk.artist && bk.artist.toLowerCase() === onboardTarget.artist.toLowerCase();
      const emailMatch = bk.email && bk.email.toLowerCase() === emailToUse.toLowerCase();
      if (nameMatch || emailMatch) {
        return { ...bk, email: emailToUse, artist: newArtist.name };
      }
      return bk;
    }));

    triggerToast(`✅ ${newArtist.name} onboarded! Login: ${newArtist.email} / ${onboardPassword}`);
    setOnboardModal(false);
    setOnboardTarget(null);
    setOnboardPassword('');
  };


  // Add Team Member Submit Handler — creates real DB account
  const handleAddTeamSubmit = async (e) => {
    e.preventDefault();
    setAddTeamError('');
    setAddTeamSuccess('');
    if (!newTeamForm.name || !newTeamForm.email) return;
    setAddTeamLoading(true);
    try {
      const { adminAPI } = await import('../services/api.js');
      const res = await adminAPI.addMember({
        name: newTeamForm.name,
        title: newTeamForm.title,
        email: newTeamForm.email,
        phone: newTeamForm.phone
      });
      const createdMember = res.admin || {
        id: Date.now(),
        name: newTeamForm.name.trim(),
        email: newTeamForm.email.toLowerCase().trim(),
        title: newTeamForm.title || 'Admin',
        phone: newTeamForm.phone || '',
        status: 'Active'
      };
      setTeamMembers(prev => [createdMember, ...prev.filter(m => m.email !== createdMember.email)]);
      setAddTeamSuccess(`✅ ${createdMember.name} added! Default password: TattoPlatz@2026`);
      setNewTeamForm({ name: '', title: '', email: '', phone: '' });
      triggerToast(`Admin account created for ${createdMember.name}!`);
      loadAdminTeam(); // Async background refresh
    } catch (err) {
      setAddTeamError(err.message || 'Failed to add team member. Please verify login status.');
    } finally {
      setAddTeamLoading(false);
    }
  };


  // Remove admin team member from DB
  const handleRemoveAdmin = (member) => {
    setDeleteConfirmModal({
      message: `Are you sure you want to remove ${member.name || 'this member'} (${member.email}) from the studio admin team? This will permanently revoke their administrative access and delete their login account.`,
      onConfirm: async () => {
        try {
          const { adminAPI } = await import('../services/api.js');
          await adminAPI.removeMember(member.id);
          await loadAdminTeam();
          triggerToast(`${member.name || member.email} removed from admin team.`);
        } catch (err) {
          triggerToast(`Error: ${err.message}`);
        }
      }
    });
  };

  // Reset admin password to default TattoPlatz@2026
  const handleResetAdminPassword = async (member) => {
    setResetPwdLoading(true);
    setResetPwdMsg('');
    try {
      const { adminAPI } = await import('../services/api.js');
      await adminAPI.resetMemberPassword(member.id);
      setResetPwdMsg(`✅ Password reset to TattoPlatz@2026 for ${member.name}`);
    } catch (err) {
      setResetPwdMsg(`❌ ${err.message}`);
    } finally {
      setResetPwdLoading(false);
    }
  };

  // Approve Compliance Document [COMMENTED OUT]
  // const approveCompliance = (id, artistName) => {
  //   setComplianceRecords(prev => prev.map(c => c.id === id ? { ...c, status: 'Approved' } : c));
  //   triggerToast(`EasyGov registration approved for ${artistName}.`);
  // };


  // Real CSV export function for bookings logs
  const downloadBookingsCSV = () => {
    // CSV headers
    const headers = ['ID', 'Artist', 'Date', 'Time', 'Station', 'Location', 'Amount (CHF)', 'Status'];

    // CSV rows
    const rows = bookings.map(b => [
      b.id || '-',
      b.artist || '-',
      b.dateStr || b.date || '-',
      b.timeStr || `${b.start}:00 - ${b.end}:00`,
      b.station ? `Station ${b.station}` : '-',
      b.location || 'Zurich',
      b.price || '0',
      b.status || 'Upcoming'
    ]);

    // Calculate max widths for each column to align text in Notepad
    const colWidths = headers.map((h, i) => {
      let max = h.length;
      rows.forEach(r => {
        let val = String(r[i]);
        if (val.includes(',')) val = `"${val.replace(/"/g, '""')}"`;
        if (val.length > max) max = val.length;
      });
      return max;
    });

    // Combine headers and rows with visual padding spaces
    const csvContent = [
      headers.map((h, i) => h.padEnd(colWidths[i], ' ')).join(' , '),
      ...rows.map(row => row.map((val, i) => {
        let cell = String(val);
        if (cell.includes(',')) cell = `"${cell.replace(/"/g, '""')}"`;
        return cell.padEnd(colWidths[i], ' ');
      }).join(' , '))
    ].join('\n');

    // Create download link (added BOM for Excel compatibility)
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `tattooplatz_bookings_report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    triggerToast('Report exported successfully! CSV download started.');
  };

  // Current calendar month bookings (excluding cancelled ones)
  const currentMonthBookings = React.useMemo(() => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonthStr = String(today.getMonth() + 1).padStart(2, '0');
    const prefix = `${currentYear}-${currentMonthStr}`;
    return bookings.filter(b => b.date && b.date.startsWith(prefix) && b.status !== 'Cancelled' && b.status !== 'Blocked' && b.artist !== '🚨 STUDIO BLOCKED');
  }, [bookings]);

  // Filter Bookings by query (EXCLUDE BLOCKS from the main logs)
  const filteredBookings = bookings.filter(b =>
    b.artist !== '🚨 STUDIO BLOCKED' &&
    b.status !== 'Blocked' &&
    b.status !== 'Cancelled' &&
    ((b.artist || '').toLowerCase().includes((searchQuery || '').toLowerCase()) ||
      String(b.station).includes(searchQuery))
  );

  // Group blocks by date and time range for clean UI rendering (removes repetitive rows)
  const groupedBlockedBookings = React.useMemo(() => {
    const blocksOnly = bookings.filter(b => b.artist === '🚨 STUDIO BLOCKED' || b.status === 'Blocked');
    const groups = {};

    blocksOnly.forEach(b => {
      const key = `${b.date}_${b.start}_${b.end}_${b.location || 'Zurich'}`;
      if (!groups[key]) {
        groups[key] = {
          date: b.date,
          dateStr: b.dateStr,
          start: b.start,
          end: b.end,
          timeStr: b.timeStr,
          location: b.location || 'Zurich',
          stations: [],
        };
      }
      groups[key].stations.push({
        id: b.id,
        stationNum: b.station,
        status: b.status
      });
    });

    const groupedList = Object.values(groups);

    // Apply filters and searches
    return groupedList.filter(g => {
      const isFullyCancelled = g.stations.every(s => s.status === 'Cancelled');
      if (isFullyCancelled && !showCancelledBlocks) return false;

      const matchesSearch =
        (g.dateStr || '').toLowerCase().includes((searchQuery || '').toLowerCase()) ||
        (g.date || '').toLowerCase().includes((searchQuery || '').toLowerCase()) ||
        g.stations.some(s => String(s.stationNum).includes(searchQuery));

      return matchesSearch;
    });
  }, [bookings, searchQuery, showCancelledBlocks]);

  // Active (non-cancelled) bookings for selected date & location
  const activeBookingsForDate = bookings.filter(b =>
    b.date === selectedDateFilter &&
    b.status !== 'Cancelled' &&
    (b.location || 'Zurich') === selectedLocationFilter
  );

  // Get what's active on a station at a given hour
  const getSlotDetails = (stationNum, hour) => {
    return activeBookingsForDate.find(b =>
      Number(b.station) === Number(stationNum) &&
      Number(hour) >= Number(b.start) &&
      Number(hour) < Number(b.end)
    );
  };

  // Hours grid dynamically built from operatingHours
  const hoursGrid = React.useMemo(() => {
    const open = parseInt((managerSettings?.operatingHours?.open || '10:00').split(':')[0]);
    const close = parseInt((managerSettings?.operatingHours?.close || '18:00').split(':')[0]);
    return Array.from({ length: close - open }).map((_, i) => open + i);
  }, [managerSettings]);

  // All unique dates that have bookings — for quick navigation chips
  const datesWithBookings = React.useMemo(() => {
    const dateSet = new Set(
      bookings
        .filter(b => b.status !== 'Cancelled' && (b.location || 'Zurich') === selectedLocationFilter)
        .map(b => b.date)
    );
    return Array.from(dateSet).sort();
  }, [bookings, selectedLocationFilter]);

  return (
    <div className="min-h-screen bg-zinc-50 text-black font-sans flex flex-col lg:flex-row relative">

      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-black border border-studio-pink/30 text-white px-5 py-3 shadow-[0_4px_20px_rgba(255,102,196,0.35)] flex items-center gap-3 animate-slide-up rounded-xl max-w-sm">
          <ShieldCheck size={16} className="text-studio-pink animate-pulse" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Backdrop overlay for mobile drawer */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Navigation Sidebar: Full-height on desktop, Drawer menu on mobile */}
      <aside className={`fixed inset-y-0 left-0 w-64 bg-white border-r border-zinc-200/80 flex flex-col justify-between flex-shrink-0 z-50 transition-transform duration-300 lg:translate-x-0 lg:static lg:h-screen lg:sticky lg:top-0 ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}>
        <div className="flex-1 overflow-y-auto">

          {/* Brand Header & Mobile Close Button */}
          <div className="px-6 py-6 border-b border-zinc-100 flex items-center justify-between">
            <img 
              src="/logo-1.png" 
              alt="Tattooplatz Logo" 
              className="h-5.5 w-auto object-contain cursor-pointer transition-transform hover:scale-105" 
              onClick={() => navigate('/')}
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
              { id: 'overview', label: 'Overview', icon: <Sliders size={18} /> },
              { id: 'calendar', label: 'Timeline', icon: <Calendar size={18} /> },
              { id: 'bookings', label: 'Bookings Log', icon: <Search size={18} /> },
              { id: 'blocked-slots', label: 'Blocked Slots', icon: <ShieldAlert size={18} /> },
              { id: 'artists', label: 'Artist Directory', icon: <Users size={18} /> },
              { id: 'team', label: 'Team', icon: <UserCheck size={18} /> },
              // { id: 'compliance', label: 'Compliance Verify', icon: <ShieldCheck size={18} /> },
              { id: 'reports', label: 'Revenue Reports', icon: <BarChart2 size={18} /> },
              { id: 'inquiries', label: 'Inquiries', icon: <Mail size={18} /> },
              { id: 'settings', label: 'Settings', icon: <Clock size={18} /> }
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

        {/* Sidebar Footer: Reset Cache and Logout Buttons */}
        <div className="p-4 border-t border-zinc-100 flex flex-col gap-2">
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to reset all local storage cache? This will clear all local bookings, inquiries, and registered artists, and log you out.')) {
                localStorage.removeItem('tattooplatz_bookings');
                localStorage.removeItem('tattooplatz_inquiries');
                localStorage.removeItem('tattooplatz_registered_artists');
                localStorage.removeItem('tattooplatz_current_user');
                window.location.reload();
              }
            }}
            className="w-full py-3 px-4 border border-zinc-200 hover:border-amber-300 text-zinc-500 hover:text-amber-600 text-xs font-black tracking-wider uppercase rounded-xl flex items-center justify-center gap-2 bg-white hover:bg-amber-50/50 transition-all shadow-2xs cursor-pointer"
          >
            <Trash2 size={13} /> Reset Local Cache
          </button>

          <button
            onClick={onLogout}
            className="w-full py-3 px-4 border border-zinc-200 hover:border-studio-pink/50 text-zinc-500 hover:text-studio-pink text-xs font-black tracking-wider uppercase rounded-xl flex items-center justify-center gap-2 bg-white hover:bg-studio-pink/5 transition-all shadow-2xs cursor-pointer"
          >
            <LogOut size={14} /> Logout Portal
          </button>
        </div>
      </aside>

      {/* Right side container */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top Header navbar with Hamburger button for mobile drawer */}
        <header className="sticky top-0 z-30 bg-white border-b border-zinc-200/80 px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex items-center justify-between shadow-[0_2px_12px_rgba(0,0,0,0.015)]">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden p-2 -ml-1 text-zinc-500 hover:text-black hover:bg-zinc-50 rounded-xl cursor-pointer transition-colors flex-shrink-0"
              aria-label="Toggle Navigation Menu"
            >
              <Menu size={20} />
            </button>
            <h1 className="text-xs sm:text-sm font-black tracking-wider text-black uppercase truncate">
              {activeTab === 'overview' && 'Dashboard'}
              {activeTab === 'calendar' && 'Timeline'}
              {activeTab === 'bookings' && 'Booking Logs'}
              {activeTab === 'blocked-slots' && 'Blocked Slots Log'}
              {activeTab === 'artists' && 'Artists'}
              {activeTab === 'team' && 'Studio Team'}
              {/* {activeTab === 'compliance' && 'Compliance'} */}
              {activeTab === 'reports' && 'Reports'}
              {activeTab === 'inquiries' && 'Customer Inquiries'}
              {activeTab === 'settings' && 'Settings'}
            </h1>
          </div>

          {/* Clickable user profile dropdown menu */}
          <div className="relative flex-shrink-0">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 bg-zinc-50 hover:bg-zinc-100/80 border border-zinc-200/80 p-1 sm:pl-1.5 sm:pr-4 sm:py-1.5 rounded-full transition-all duration-200 shadow-2xs cursor-pointer group"
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-studio-pink to-studio-lightpink text-black font-black text-xs flex items-center justify-center shadow-2xs uppercase shrink-0">
                👑
              </div>
              <div className="hidden sm:block text-left leading-tight">
                <span className="text-[10px] font-black text-black uppercase block">{activeUser.name || 'Chris'}</span>
                <span className="text-[9px] text-zinc-400 font-sans block">{activeUser.email || 'chris@tattooplatz.ch'}</span>
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
                    <span className="text-sm font-black text-black uppercase block">{activeUser.name || 'Chris'}</span>
                    <span className="text-xs text-zinc-500 font-sans block truncate mt-0.5">{activeUser.email || 'chris@tattooplatz.ch'}</span>
                  </div>


                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      setIsProfileModalOpen(true);
                    }}
                    className="w-full mb-2.5 py-3 px-4 bg-zinc-55 hover:bg-black hover:text-white text-black font-extrabold text-[10px] tracking-wider uppercase rounded-xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Users size={13} className="text-zinc-550" /> View Full Profile
                  </button>

                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      onLogout?.();
                    }}
                    className="w-full py-3 px-4 bg-black hover:bg-red-655 text-white hover:text-white font-extrabold text-[10px] tracking-wider uppercase rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                  >
                    <LogOut size={13} /> Logout Portal
                  </button>
                </div>
              </>
            )}
          </div>
        </header>

        {/* Content View Area */}
        <main className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 max-w-7xl w-full mx-auto flex-1 pb-24 lg:pb-8">

          {/* TAB 1: OVERVIEW PANEL */}
          {activeTab === 'overview' && (
            <div className="space-y-8 animate-fade-in font-sans">

              {/* Top Banner */}
              <div className="p-6 bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 border border-zinc-800 rounded-2xl shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-studio-pink/10 rounded-full blur-[60px] pointer-events-none" />
                <div className="relative z-10">
                  <h2 className="text-xl font-black text-white uppercase tracking-wider flex items-center gap-2">
                    STUDIO MANAGER PANEL
                  </h2>
                  <p className="text-[11px] text-zinc-400 max-w-md mt-1.5 leading-relaxed font-sans font-medium">
                    Monitor station occupancy rates, coordinate active workstations, and configure administrative compliance rules in real-time.
                  </p>
                </div>
                <div className="relative z-10 px-3.5 py-1.5 text-[9px] font-black tracking-widest bg-studio-pink text-black uppercase rounded-full shadow-[0_2px_10px_rgba(255,102,196,0.3)] shrink-0">
                  Live Operations
                </div>
              </div>

              {/* Stats Counters */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { title: 'Bookings (Month)', val: currentMonthBookings.length, icon: <Calendar size={18} />, color: 'text-studio-pink', border: 'border-t-4 border-t-studio-pink' },
                  { title: 'Revenue (Month)', val: `${currentMonthBookings.reduce((a, b) => a + Number(b.price || 0), 0)} CHF`, icon: <DollarSign size={18} />, color: 'text-emerald-500', border: 'border-t-4 border-t-emerald-500' },
                  { title: 'Active Stations', val: `${stationsCount} Units`, icon: <Sliders size={18} />, color: 'text-blue-500', border: 'border-t-4 border-t-blue-500' },
                  { title: 'Guest Artists', val: registeredArtists.filter(a => a.status === 'Active').length, icon: <Users size={18} />, color: 'text-purple-500', border: 'border-t-4 border-t-purple-500' }
                ].map((stat, idx) => (
                  <div key={idx} className={`p-6 bg-white border border-zinc-200/80 rounded-2xl shadow-xs transition-all duration-300 hover:shadow-md hover:scale-[1.01] ${stat.border}`}>
                    <div className="flex justify-between items-center text-zinc-400">
                      <span className="text-[8px] font-black uppercase tracking-wider">{stat.title}</span>
                      <span className={`${stat.color} p-2 bg-zinc-50 border border-zinc-100 rounded-xl shadow-2xs`}>{stat.icon}</span>
                    </div>
                    <p className="text-2xl font-black text-black mt-3 leading-none">{stat.val}</p>
                  </div>
                ))}
              </div>

              {/* Quick Actions Panel */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Station booking status */}
                <div className="p-6 bg-white border border-zinc-200/80 rounded-2xl shadow-xs space-y-5">
                  <h4 className="text-[10px] font-black tracking-widest text-zinc-400 uppercase border-b border-zinc-100 pb-3 flex items-center justify-between">
                    <span>ACTIVE OPERATIONS STATUS</span>
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  </h4>
                  <ul className="space-y-4 text-xs">
                    <li className="flex justify-between items-center py-1.5 border-b border-zinc-100">
                      <span className="text-zinc-555 font-sans font-medium">Studio Working Days</span>
                      <span className="text-black font-black uppercase text-[10px] tracking-wider bg-zinc-100 px-2.5 py-0.5 rounded-full">Operating Days</span>
                    </li>
                    <li className="flex justify-between items-center py-1.5 border-b border-zinc-100">
                      <span className="text-zinc-555 font-sans font-medium">Rental Rate Standard</span>
                      <span className="text-black font-semibold font-mono bg-zinc-100 px-2.5 py-0.5 rounded-full">30.00 CHF / hour</span>
                    </li>
                    <li className="flex justify-between items-center py-1.5 border-b border-zinc-100">
                      <span className="text-zinc-555 font-sans font-medium">Manual Blockouts</span>
                      <span className="text-studio-pink font-black uppercase text-[10px] tracking-wider bg-studio-pink/10 border border-studio-pink/20 px-2.5 py-0.5 rounded-full">
                        {bookings.filter(b => b.status === 'Blocked').length} Active
                      </span>
                    </li>
                  </ul>
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => setActiveTab('calendar')}
                      className="flex-1 py-3.5 bg-black hover:bg-studio-pink hover:text-black border border-black hover:border-studio-pink text-white font-extrabold text-[9px] uppercase tracking-wider rounded-xl transition-all duration-300 shadow-sm cursor-pointer"
                    >
                      View Live Timeline
                    </button>
                    <button
                      onClick={() => setBlockingModal(true)}
                      className="flex-1 py-3.5 bg-white border border-zinc-250 hover:border-black hover:bg-zinc-50 text-black font-extrabold text-[9px] uppercase tracking-wider rounded-xl transition-all duration-300 shadow-xs cursor-pointer"
                    >
                      Block Station
                    </button>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: MASTER CALENDAR TIMELINE */}
          {activeTab === 'calendar' && (
            <div className="space-y-6 animate-fade-in font-sans">

              {/* Header row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-black text-black uppercase tracking-wider">MASTER TIMELINE MATRIX</h3>
                  <p className="text-xs text-zinc-450 mt-1 font-sans font-medium">Select a date to view parallel station occupancy logs.</p>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-auto">
                  <input
                    type="date"
                    value={selectedDateFilter}
                    onChange={e => setSelectedDateFilter(e.target.value)}
                    className="w-full sm:w-auto px-4 py-2.5 bg-white border border-zinc-200/80 text-black text-xs font-bold rounded-xl focus:border-studio-pink focus:outline-none"
                  />
                  {/* Today shortcut */}
                  <button
                    onClick={() => setSelectedDateFilter(todayStr)}
                    className={`px-3.5 py-2.5 text-[9px] font-black uppercase tracking-widest rounded-xl border transition-all cursor-pointer ${selectedDateFilter === todayStr
                        ? 'bg-studio-pink border-studio-pink text-black'
                        : 'bg-white border-zinc-200 text-zinc-500 hover:border-studio-pink hover:text-black'
                      }`}
                  >
                    Today
                  </button>
                  <button
                    onClick={() => setBlockingModal(true)}
                    className="w-full sm:w-auto justify-center px-5 py-2.5 bg-studio-pink hover:bg-black hover:text-white text-black font-extrabold text-[10px] tracking-wider uppercase transition-all duration-300 rounded-xl flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <Plus size={13} /> BLOCK SLOT
                  </button>
                </div>
              </div>

              {/* Quick Date Navigation — dates that actually have bookings */}
              {datesWithBookings.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Dates with active bookings:</p>
                  <div className="flex flex-wrap gap-2">
                    {datesWithBookings.map(d => {
                      const count = bookings.filter(b => b.date === d && b.status !== 'Cancelled' && (b.location || 'Zurich') === selectedLocationFilter).length;
                      const isSelected = d === selectedDateFilter;
                      const isToday = d === todayStr;
                      return (
                        <button
                          key={d}
                          onClick={() => setSelectedDateFilter(d)}
                          className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wide border transition-all cursor-pointer flex items-center gap-1.5 ${isSelected
                              ? 'bg-black text-white border-black'
                              : 'bg-white text-zinc-600 border-zinc-200 hover:border-studio-pink hover:text-black'
                            }`}
                        >
                          {isToday ? '🟢 Today' : d}
                          <span className={`px-1.5 py-0.5 rounded-full text-[8px] font-black ${isSelected ? 'bg-studio-pink text-black' : 'bg-zinc-100 text-zinc-500'
                            }`}>{count}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Summary bar for selected date */}
              <div className="flex items-center gap-4 px-4 py-3 bg-zinc-50 border border-zinc-200/60 rounded-xl text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-studio-pink inline-block"></span>
                  <span className="font-bold text-black">{activeBookingsForDate.filter(b => b.status !== 'Blocked').length} Booking{activeBookingsForDate.filter(b => b.status !== 'Blocked').length !== 1 ? 's' : ''}</span>
                  <span className="text-zinc-400 font-medium">on {new Date(selectedDateFilter + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span>
                </div>
                {activeBookingsForDate.filter(b => b.status === 'Blocked').length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-zinc-800 inline-block"></span>
                    <span className="font-bold text-black">{activeBookingsForDate.filter(b => b.status === 'Blocked').length} Blocked slot{activeBookingsForDate.filter(b => b.status === 'Blocked').length !== 1 ? 's' : ''}</span>
                  </div>
                )}
                <div className="ml-auto flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-zinc-200 border border-zinc-300 inline-block"></span>
                  <span className="text-zinc-400 font-medium">{stationsCount * hoursGrid.length - activeBookingsForDate.reduce((acc, b) => acc + (Number(b.end) - Number(b.start)), 0)} slots free</span>
                </div>
              </div>

              {/* Grid timeline matrix */}
              <div className="border border-zinc-200/80 rounded-2xl overflow-x-auto bg-zinc-50/50 shadow-sm p-5">
                <div className="min-w-[640px] space-y-3">

                  {/* Grid Headers */}
                  <div className="grid gap-3 text-center text-[10px] font-black text-zinc-455 uppercase tracking-wider pb-3 border-b border-zinc-200/60"
                    style={{ gridTemplateColumns: `minmax(100px,1fr) repeat(${stationsCount}, minmax(80px,1fr)) ${stationsCount < 6 ? 'minmax(60px,0.8fr)' : ''}` }}
                  >
                    <div className="text-left pl-2 flex items-center gap-1.5">
                      <Clock size={12} className="text-zinc-400" /> TIME BLOCK
                    </div>
                    {Array.from({ length: stationsCount }).map((_, idx) => (
                      <div key={idx} className="bg-white border border-zinc-150 py-2 rounded-xl text-black font-black text-[9px] shadow-2xs tracking-widest uppercase">
                        STATION {idx + 1}
                      </div>
                    ))}
                    {stationsCount < 6 && (
                      <div className="text-zinc-405 italic flex items-center justify-center text-[8px] bg-zinc-100/50 border border-dashed border-zinc-200 rounded-xl py-2">
                        Closed
                      </div>
                    )}
                  </div>

                  {/* Empty state — no bookings for this date */}
                  {activeBookingsForDate.length === 0 && (
                    <div className="py-12 text-center">
                      <Calendar size={36} className="text-zinc-200 mx-auto mb-3" />
                      <p className="text-sm font-black text-zinc-300 uppercase tracking-wider">No bookings for this date</p>
                      <p className="text-[10px] text-zinc-400 mt-1 font-medium">
                        {datesWithBookings.length > 0
                          ? `Try selecting a date with bookings above, or choose a different location.`
                          : `No bookings exist yet. They will appear here once artists book stations.`}
                      </p>
                    </div>
                  )}

                  {/* Hour rows — only shown when there are bookings or always for context */}
                  {activeBookingsForDate.length > 0 && (
                    <div className="space-y-2 pt-2">
                      {hoursGrid.map((hour) => (
                        <div
                          key={hour}
                          className="grid gap-3 text-center items-stretch font-sans text-xs min-h-[3.75rem]"
                          style={{ gridTemplateColumns: `minmax(100px,1fr) repeat(${stationsCount}, minmax(80px,1fr)) ${stationsCount < 6 ? 'minmax(60px,0.8fr)' : ''}` }}
                        >
                          {/* Hour label */}
                          <div className="text-left font-mono font-bold text-zinc-500 pl-2 flex items-center">
                            {String(hour).padStart(2, '0')}:00 – {String(hour + 1).padStart(2, '0')}:00
                          </div>

                          {/* Station cells */}
                          {Array.from({ length: stationsCount }).map((_, stationIdx) => {
                            const sNum = stationIdx + 1;
                            const activeSlot = getSlotDetails(sNum, hour);

                            if (activeSlot) {
                              const isBlocked = activeSlot.status === 'Blocked';
                              return (
                                <div
                                  key={stationIdx}
                                  onClick={isBlocked ? () => setUnblockingModal(activeSlot) : undefined}
                                  title={isBlocked ? "Click to Unblock" : undefined}
                                  className={`h-full min-h-[3.5rem] flex flex-col justify-center items-center px-2 rounded-xl border transition-all duration-200 hover:scale-[1.02] ${isBlocked
                                      ? 'bg-zinc-950 border-zinc-800 text-zinc-400 shadow-inner cursor-pointer hover:border-studio-pink/60 hover:bg-zinc-900'
                                      : 'bg-studio-pink/10 border-studio-pink/30 text-black shadow-sm'
                                    }`}
                                >
                                  <span className={`block w-full text-center truncate font-black text-[9px] uppercase ${isBlocked ? 'text-zinc-300' : 'text-black'
                                    }`}>
                                    {isBlocked ? '🚫 BLOCKED' : activeSlot.artist}
                                  </span>
                                  <span className="block text-[8px] font-mono opacity-60 mt-0.5">
                                    {activeSlot.timeStr || `${activeSlot.start}:00–${activeSlot.end}:00`}
                                  </span>
                                  {!isBlocked && (
                                    <span className="block text-[7px] font-bold uppercase tracking-wide text-studio-pink mt-0.5">
                                      {activeSlot.status}
                                    </span>
                                  )}
                                </div>
                              );
                            }

                            return (
                              <div
                                key={stationIdx}
                                className="h-full min-h-[3.5rem] border border-dashed border-zinc-200/80 bg-white hover:border-studio-pink/55 hover:bg-studio-pink/5 rounded-xl flex items-center justify-center text-[10px] text-zinc-450 font-black tracking-widest transition-all duration-200 cursor-default"
                              >
                                Free
                              </div>
                            );
                          })}

                          {/* Closed station placeholder */}
                          {stationsCount < 6 && (
                            <div className="h-full min-h-[3.5rem] rounded-xl bg-zinc-50 border border-zinc-100" />
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                </div>
              </div>

            </div>
          )}

          {/* TAB 3: ALL BOOKINGS LIST & SEARCH */}
          {activeTab === 'bookings' && (
            <div className="space-y-6 animate-fade-in font-sans">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-black text-black uppercase tracking-wider">STUDIO BOOKING LOGS</h3>
                  <p className="text-xs text-zinc-450 mt-1 font-sans font-medium">Manage and audit all reservations across the studio.</p>
                </div>

                {/* Search Bar */}
                <div className="relative max-w-xs w-full">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-400">
                    <Search size={14} />
                  </span>
                  <input
                    type="text"
                    placeholder="Search artist name or station..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-zinc-200/80 text-black text-xs font-semibold rounded-xl focus:border-studio-pink focus:outline-none focus:ring-4 focus:ring-studio-pink/5 transition-all"
                  />
                </div>
              </div>

              {/* Table */}
              <div className="border border-zinc-200/80 rounded-2xl overflow-hidden bg-white shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-sans" style={{ minWidth: '920px' }}>
                    <thead className="bg-zinc-50 text-[9px] font-black uppercase text-zinc-400 tracking-wider border-b border-zinc-200/80">
                      <tr>
                        <th className="px-6 py-4 whitespace-nowrap">ID</th>
                        <th className="px-6 py-4 whitespace-nowrap">Artist Name</th>
                        <th className="px-6 py-4 text-center whitespace-nowrap">Station</th>
                        <th className="px-6 py-4 text-center whitespace-nowrap">Location</th>
                        <th className="px-6 py-4 whitespace-nowrap">Date</th>
                        <th className="px-6 py-4 whitespace-nowrap">Time Block</th>
                        <th className="px-6 py-4 text-center whitespace-nowrap font-black">Source</th>
                        <th className="px-6 py-4 text-right font-black whitespace-nowrap">Rent Cost</th>
                        <th className="px-6 py-4 text-center whitespace-nowrap">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {filteredBookings.length === 0 ? (
                        <tr>
                          <td colSpan="9" className="px-6 py-12 text-center text-zinc-400 italic font-medium font-sans">
                            No matching records found.
                          </td>
                        </tr>
                      ) : (
                        filteredBookings.map((b) => (
                          <tr key={b.id} className={`transition-colors duration-150 ${b.status === 'Cancelled' ? 'opacity-50 bg-zinc-50/80' : 'hover:bg-zinc-50/50'}`}>
                            <td className="px-6 py-4 font-mono font-bold text-zinc-400 whitespace-nowrap">#{b.id}</td>
                            <td className="px-6 py-4 font-black uppercase text-black whitespace-nowrap">
                              {b.artist === '🚨 STUDIO BLOCKED' ? (
                                <span className="text-studio-pink font-bold">{b.artist}</span>
                              ) : (
                                <span>{b.artist}</span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-center whitespace-nowrap">
                              <span className="px-2.5 py-1 bg-zinc-50 border border-zinc-200/60 rounded-lg text-black font-semibold text-[9px] tracking-wide uppercase">
                                Station {b.station}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center font-bold text-zinc-550 uppercase tracking-wider text-[9px] whitespace-nowrap">
                              {b.location || 'Zurich'}
                            </td>
                            <td className="px-6 py-4 font-semibold text-zinc-650 whitespace-nowrap">
                              {b.dateStr}
                              {b.status === 'Cancelled' && (
                                <span className="ml-2 text-[8px] font-black uppercase tracking-wider text-studio-pink bg-studio-pink/10 border border-studio-pink/20 px-1.5 py-0.5 rounded-full">Cancelled</span>
                              )}
                            </td>
                            <td className="px-6 py-4 font-mono text-zinc-500 whitespace-nowrap">{b.timeStr}</td>
                            <td className="px-6 py-4 text-center whitespace-nowrap">
                              <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border ${b.source === 'Artist Portal'
                                  ? 'bg-black text-white border-black'
                                  : b.source?.includes('Rescheduled')
                                    ? 'bg-studio-pink/15 text-studio-pink border-studio-pink/20 shadow-2xs'
                                    : 'bg-zinc-100 text-zinc-650 border-zinc-200'
                                }`}>
                                {b.source || 'Public Website'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right whitespace-nowrap">
                              {b.status === 'Cancelled' ? (
                                <span className="text-zinc-300 line-through text-[10px]">{b.price > 0 ? `${b.price}.00 CHF` : 'Blocked'}</span>
                              ) : b.price > 0 ? (
                                <span className="text-studio-pink font-bold bg-studio-pink/5 px-2 py-1 rounded-lg border border-studio-pink/10">{b.price}.00 CHF</span>
                              ) : (
                                <span className="text-zinc-400 italic">Blocked</span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-center whitespace-nowrap flex items-center justify-center gap-1.5 animate-fade-in">
                              {b.artist !== '🚨 STUDIO BLOCKED' && (
                                <button
                                  onClick={() => setSelectedBookingForView(b)}
                                  className="text-zinc-450 hover:text-studio-pink p-2 hover:bg-studio-pink/5 rounded-lg transition-all cursor-pointer"
                                  title="View Client Details"
                                >
                                  <Eye size={13} />
                                </button>
                              )}
                              <button
                                onClick={() => handleCancelBooking(b.id, b.artist)}
                                className="text-zinc-450 hover:text-studio-pink p-2 hover:bg-studio-pink/10 rounded-lg transition-all cursor-pointer"
                                title="Delete Booking"
                              >

                                <Trash2 size={13} />
                              </button>
                            </td>
                          </tr>

                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* TAB 3b: BLOCKED SLOTS LOG [NEW] */}
          {activeTab === 'blocked-slots' && (
            <div className="space-y-6 animate-fade-in font-sans">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-black text-black uppercase tracking-wider">Blocked Slots Directory</h3>
                  <p className="text-xs text-zinc-455 mt-1 font-sans font-medium">
                    Manage all internal workstation blocks and closures.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="showCancelledBlocks"
                    checked={showCancelledBlocks}
                    onChange={(e) => setShowCancelledBlocks(e.target.checked)}
                    className="w-4 h-4 text-studio-pink border-zinc-300 rounded focus:ring-studio-pink cursor-pointer"
                  />
                  <label htmlFor="showCancelledBlocks" className="text-xs font-bold text-zinc-650 cursor-pointer select-none">
                    Show Cancelled Blocks
                  </label>
                </div>
              </div>

              {/* Table wrapper */}
              <div className="border border-zinc-200/80 rounded-2xl overflow-hidden bg-white shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-sans" style={{ minWidth: '850px' }}>
                    <thead className="bg-zinc-50 text-[9px] font-black uppercase text-zinc-400 tracking-wider border-b border-zinc-200/80">
                      <tr>
                        <th className="px-6 py-4 whitespace-nowrap">Status</th>
                        <th className="px-6 py-4 whitespace-nowrap">Location</th>
                        <th className="px-6 py-4 whitespace-nowrap">Date</th>
                        <th className="px-6 py-4 whitespace-nowrap">Time Block</th>
                        <th className="px-6 py-4 whitespace-nowrap">Blocked Stations</th>
                        <th className="px-6 py-4 text-center whitespace-nowrap">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {groupedBlockedBookings.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="px-6 py-12 text-center text-zinc-400 italic font-medium font-sans">
                            No block records found.
                          </td>
                        </tr>
                      ) : (
                        groupedBlockedBookings.map((g) => {
                          const isFullyCancelled = g.stations.every(s => s.status === 'Cancelled');

                          // Deduplicate stations to prevent duplicate badges from multiple blocks
                          const uniqueStationsMap = {};
                          g.stations.forEach(s => {
                            const num = s.stationNum;
                            // Prefer keeping active 'Blocked' status if duplicates exist
                            if (!uniqueStationsMap[num] || s.status === 'Blocked') {
                              uniqueStationsMap[num] = s;
                            }
                          });
                          const uniqueStations = Object.values(uniqueStationsMap).sort((a, b) => a.stationNum - b.stationNum);

                          return (
                            <tr key={`${g.date}_${g.start}_${g.end}`} className={`transition-colors duration-150 ${isFullyCancelled ? 'opacity-50 bg-zinc-50/80' : 'hover:bg-zinc-50/50'}`}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                 <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider border ${isFullyCancelled
                                    ? 'bg-studio-pink/10 text-studio-pink border-studio-pink/30'
                                    : 'bg-studio-pink/15 text-studio-pink border-studio-pink/20 shadow-2xs'
                                  }`}>
                                  {isFullyCancelled ? 'Cancelled' : 'Blocked'}
                                </span>
                              </td>
                              <td className="px-6 py-4 font-bold text-zinc-550 uppercase tracking-wider text-[9px] whitespace-nowrap">
                                {g.location}
                              </td>
                              <td className="px-6 py-4 font-semibold text-zinc-650 whitespace-nowrap">
                                {g.dateStr}
                              </td>
                              <td className="px-6 py-4 font-mono text-zinc-500 whitespace-nowrap">{g.timeStr}</td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex flex-wrap gap-1.5 max-w-xs">
                                  {uniqueStations.map((s) => (
                                    <span
                                      key={s.id}
                                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[9px] font-black uppercase tracking-wide transition-all ${s.status === 'Cancelled'
                                          ? 'bg-zinc-50 text-zinc-300 border-zinc-200 line-through'
                                          : 'bg-studio-pink/10 text-studio-pink border-studio-pink/20 shadow-2xs hover:bg-studio-pink/20'
                                        }`}
                                    >
                                      Station {s.stationNum}
                                      {s.status !== 'Cancelled' && (
                                        <button
                                          onClick={() => {
                                            setDeleteConfirmModal({
                                              message: `Are you sure you want to unblock Station ${s.stationNum} for this slot on ${g.dateStr}?`,
                                              onConfirm: () => handleUnblockSlot({ id: s.id, station: s.stationNum, date: g.date, dateStr: g.dateStr, start: g.start, end: g.end, timeStr: g.timeStr, location: g.location })
                                            });
                                          }}
                                          className="ml-1 text-studio-pink/70 hover:text-black font-extrabold focus:outline-none cursor-pointer text-xs"
                                          title={`Unblock Station ${s.stationNum}`}
                                        >
                                          ×
                                        </button>
                                      )}
                                    </span>
                                  ))}
                                </div>
                              </td>
                              <td className="px-6 py-4 text-center whitespace-nowrap flex items-center justify-center">
                                {!isFullyCancelled && (
                                  <button
                                    onClick={() => {
                                      setDeleteConfirmModal({
                                        message: `Are you sure you want to unblock ALL stations for this slot on ${g.dateStr}?`,
                                        onConfirm: () => handleUnblockAllStations(g)
                                      });
                                    }}
                                    className="px-3.5 py-1.5 border border-studio-pink/40 hover:border-studio-pink text-studio-pink hover:text-black hover:bg-studio-pink font-extrabold text-[9px] uppercase tracking-wider rounded-xl transition-all shadow-2xs cursor-pointer flex items-center gap-1.5"
                                    title="Unblock all stations for this slot"
                                  >
                                    <Trash2 size={11} />
                                    Unblock Day
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ARTIST DIRECTORY */}
          {activeTab === 'artists' && (
            <div className="space-y-6 animate-fade-in font-sans">
              <div>
                <h3 className="text-base font-black text-black uppercase tracking-wider">GUEST ARTISTS DIRECTORY</h3>
                <p className="text-xs text-zinc-455 mt-1 font-sans font-medium">Artists who have been onboarded from Bookings Log. They can login with their email and password.</p>
              </div>

              <div className="border border-zinc-200/80 rounded-2xl overflow-hidden bg-white shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-sans" style={{ minWidth: '750px' }}>
                    <thead className="bg-zinc-50 text-[9px] font-black uppercase text-zinc-400 tracking-wider border-b border-zinc-200/80">
                      <tr>
                        <th className="px-6 py-2.5 whitespace-nowrap">Artist Name</th>
                        <th className="px-6 py-2.5 whitespace-nowrap">Email Address</th>
                        <th className="px-6 py-2.5 whitespace-nowrap">Instagram</th>
                        <th className="px-6 py-2.5 whitespace-nowrap">PASS</th>
                        <th className="px-6 py-2.5 text-center whitespace-nowrap">Status</th>
                        <th className="px-6 py-2.5 text-center whitespace-nowrap">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {registeredArtists.map((a) => (
                        <tr key={a.id} className="hover:bg-zinc-50/50 transition-colors duration-150">
                          <td className="px-6 py-2.5 font-black uppercase text-black whitespace-nowrap">{a.name}</td>
                          <td className="px-6 py-2.5 font-semibold text-zinc-650 whitespace-nowrap">{a.email}</td>
                          <td className="px-6 py-2.5 text-studio-pink font-semibold whitespace-nowrap">
                            {a.ig && a.ig !== 'Not provided' ? (
                              <a
                                href={`https://www.instagram.com/${a.ig.replace('@', '')}/`}
                                target="_blank"
                                rel="noreferrer"
                                className="hover:underline"
                              >
                                {a.ig}
                              </a>
                            ) : (
                              <span className="text-zinc-400 italic">Not provided</span>
                            )}
                          </td>
                          <td className="px-6 py-2.5 whitespace-nowrap">
                            <span className="font-mono text-xs bg-zinc-50 border border-zinc-200 px-2.5 py-1 rounded-lg text-zinc-600 font-semibold">
                              {a.password || <span className="text-zinc-300 italic">—</span>}
                            </span>
                          </td>
                          <td className="px-6 py-2.5 text-center whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-black text-[9px] uppercase tracking-wide border ${a.status === 'Active'
                                ? 'bg-emerald-50 text-emerald-600 border-emerald-250'
                                : 'bg-red-50 text-red-600 border-red-200'
                              }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${a.status === 'Active' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                              {a.status}
                            </span>
                          </td>
                          <td className="px-6 py-2.5 text-center whitespace-nowrap">
                            <button
                              onClick={() => toggleArtistStatus(a.id, a.status)}
                              className={`px-3.5 py-1.5 border font-extrabold text-[9px] uppercase tracking-wider rounded-xl transition-all shadow-2xs cursor-pointer ${a.status === 'Active'
                                  ? 'border-zinc-200 hover:border-red-500 hover:text-red-500 hover:bg-red-50 text-black bg-white'
                                  : 'border-zinc-200 hover:border-emerald-500 hover:text-emerald-500 hover:bg-emerald-50 text-black bg-white'
                                }`}
                            >
                              {a.status === 'Active' ? 'Block Artist' : 'Activate'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {registeredArtists.length === 0 && (
                <div className="p-10 text-center text-zinc-400 italic font-medium text-sm">
                  No artists onboarded yet. Use the <strong>Onboard</strong> (✔) button in Bookings Log to convert a booking client into a studio artist.
                </div>
              )}
            </div>
          )}

          {/* TAB 4b: STUDIO TEAM */}
          {activeTab === 'team' && (
            <div className="space-y-6 animate-fade-in font-sans">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-black text-black uppercase tracking-wider">STUDIO TEAM</h3>
                  <p className="text-xs text-zinc-455 mt-1 font-sans font-medium">Manage admin portal access for all in-house studio team members.</p>
                </div>
                <button
                  onClick={() => { setNewTeamForm({ name: '', title: '', email: '', phone: '' }); setAddTeamError(''); setAddTeamSuccess(''); setAddTeamModal(true); }}
                  className="w-full sm:w-auto justify-center px-5 py-2.5 bg-black hover:bg-studio-pink hover:text-black border border-black hover:border-studio-pink text-white font-extrabold text-[10px] tracking-wider uppercase transition-all duration-300 rounded-xl flex items-center gap-1.5 shadow-sm hover:scale-[1.01] cursor-pointer"
                >
                  <Plus size={13} />
                  ADD TEAM MEMBER
                </button>
              </div>

              {/* Info banner */}
              <div className="bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 flex items-start gap-3">
                <Key size={14} className="text-studio-pink mt-0.5 shrink-0" />
                <div>
                  <p className="text-[10px] font-black text-black uppercase tracking-wider">Default Login Password</p>
                  <p className="text-[10px] text-zinc-500 font-sans mt-0.5">All new team members are created with default password: <span className="font-black text-black font-mono">TattoPlatz@2026</span>. Each member must change it after first login from Settings → Change Password.</p>
                </div>
              </div>

              <div className="border border-zinc-200/80 rounded-2xl overflow-hidden bg-white shadow-xs">
                <div className="overflow-x-auto">
                  {teamLoading ? (
                    <div className="py-16 text-center text-zinc-400 text-xs font-black uppercase tracking-wider">Loading team...</div>
                  ) : (
                    <table className="w-full text-left text-xs font-sans" style={{ minWidth: '650px' }}>
                    <thead className="bg-zinc-50 text-[9px] font-black uppercase text-zinc-400 tracking-wider border-b border-zinc-200/80">
                      <tr>
                        <th className="px-6 py-3 whitespace-nowrap">Name</th>
                        <th className="px-6 py-3 whitespace-nowrap">Email</th>
                        <th className="px-6 py-3 text-center whitespace-nowrap">Status</th>
                        <th className="px-6 py-3 text-center whitespace-nowrap">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {teamMembers.length === 0 && (
                        <tr><td colSpan={4} className="px-6 py-10 text-center text-zinc-400 text-[10px] font-black uppercase tracking-wider">No admin team members found. Add the first one above.</td></tr>
                      )}
                      {teamMembers.map((m) => (
                        <tr key={m.id} className="hover:bg-zinc-50/50 transition-colors duration-150">
                          <td className="px-6 py-3 whitespace-nowrap">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-studio-pink/30 to-studio-lightpink/30 text-black font-black text-[10px] flex items-center justify-center uppercase shrink-0">👑</div>
                              <div>
                                <div className="font-black uppercase text-black text-[11px]">{m.name}</div>
                                <div className="text-[9px] text-zinc-400 font-sans">{m.title || 'Admin'}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-3 font-semibold text-zinc-650 whitespace-nowrap">
                            <a href={`mailto:${m.email}`} className="hover:text-studio-pink transition-colors">{m.email}</a>
                          </td>
                          <td className="px-6 py-3 text-center whitespace-nowrap">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-black text-[9px] uppercase tracking-wide border bg-emerald-50 text-emerald-600 border-emerald-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              Active
                            </span>
                          </td>
                          <td className="px-6 py-3 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => { setResetPwdMsg(''); setViewAdminModal(m); }}
                                className="text-zinc-400 hover:text-black p-2 hover:bg-zinc-100 rounded-lg transition-all cursor-pointer"
                                title="View member details"
                              >
                                <Eye size={13} />
                              </button>
                              <button
                                onClick={() => handleRemoveAdmin(m)}
                                className="text-zinc-400 hover:text-studio-pink p-2 hover:bg-studio-pink/10 rounded-lg transition-all cursor-pointer"
                                title="Remove from admin team"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  )}
                </div>
              </div>
            </div>
          )}


          {/* 
          {activeTab === 'compliance' && (
            <div className="space-y-6 animate-fade-in font-sans">
              <div>
                <h3 className="text-base font-black text-black uppercase tracking-wider">COMPLIANCE & REGISTRATIONS</h3>
                <p className="text-xs text-zinc-455 mt-1 font-sans font-medium">Verify that guest artists have submitted correct papers before working slots.</p>
              </div>

              <div className="border border-zinc-200/80 rounded-2xl overflow-hidden bg-white shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-sans" style={{ minWidth: '780px' }}>
                    <thead className="bg-zinc-50 text-[9px] font-black uppercase text-zinc-400 tracking-wider border-b border-zinc-200/80">
                      <tr>
                        <th className="px-6 py-4 whitespace-nowrap">Artist Name</th>
                        <th className="px-6 py-4 whitespace-nowrap">Document Type</th>
                        <th className="px-6 py-4 whitespace-nowrap">File Name</th>
                        <th className="px-6 py-4 whitespace-nowrap">Submission Date</th>
                        <th className="px-6 py-4 text-center whitespace-nowrap">Status</th>
                        <th className="px-6 py-4 text-center whitespace-nowrap">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {complianceRecords.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-12 text-center text-zinc-400 italic font-medium">
                            No compliance documents submitted yet.
                          </td>
                        </tr>
                      ) : (
                        complianceRecords.map((c) => (
                          <tr key={c.id} className="hover:bg-zinc-50/50 transition-colors duration-150">
                            <td className="px-6 py-4 font-black uppercase text-black whitespace-nowrap">{c.artist}</td>
                            <td className="px-6 py-4 font-semibold text-zinc-655 whitespace-nowrap">
                              <div className="flex items-center gap-1.5">
                                <FileText size={13} className="text-zinc-400 flex-shrink-0" />
                                {c.docType}
                              </div>
                            </td>
                            <td className="px-6 py-4 font-mono text-zinc-500 whitespace-nowrap text-[10px]">
                              {c.fileName || <span className="text-zinc-300 italic">—</span>}
                            </td>
                            <td className="px-6 py-4 font-mono text-zinc-500 whitespace-nowrap">{c.date}</td>
                            <td className="px-6 py-4 text-center whitespace-nowrap">
                              <span className={`px-2.5 py-0.5 rounded-full font-black text-[9px] uppercase tracking-wide border ${
                                c.status === 'Approved'
                                  ? 'bg-emerald-50 text-emerald-600 border-emerald-250'
                                  : 'bg-amber-50 text-amber-600 border-amber-250 animate-pulse'
                              }`}>
                                {c.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center whitespace-nowrap">
                              <div className="flex items-center justify-center gap-2">
                                {c.fileBase64 ? (
                                  <button
                                    onClick={() => setFilePreviewModal({ fileName: c.fileName, fileBase64: c.fileBase64, fileType: c.fileType, docType: c.docType, artist: c.artist, recordId: c.id, status: c.status })}
                                    className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-black border border-zinc-200 font-extrabold text-[9px] uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center gap-1"
                                  >
                                    <Eye size={11} /> View File
                                  </button>
                                ) : (
                                  <span className="text-zinc-300 italic text-[9px]">No file</span>
                                )}
                                {c.status === 'Pending' ? (
                                  <button
                                    onClick={() => approveCompliance(c.id, c.artist)}
                                    className="px-3.5 py-1.5 bg-black hover:bg-studio-pink hover:text-black border border-black hover:border-studio-pink text-white font-extrabold text-[9px] uppercase tracking-wider rounded-xl transition-all shadow-xs cursor-pointer"
                                  >
                                    Approve
                                  </button>
                                ) : (
                                  <span className="text-zinc-400 font-bold italic text-[9px]">Verified ✓</span>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
          */}

          {/* 
          {filePreviewModal && (
            <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setFilePreviewModal(null)}>
              <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
                onClick={e => e.stopPropagation()}
              >
                <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200/80 bg-zinc-50 flex-shrink-0">
                  <div>
                    <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-0.5">Document Preview</p>
                    <h4 className="text-sm font-black text-black uppercase tracking-wider">{filePreviewModal.docType}</h4>
                    <p className="text-[10px] text-zinc-550 font-medium mt-0.5">
                      Artist: <strong className="text-black">{filePreviewModal.artist}</strong>
                      &nbsp;|&nbsp; File: <span className="font-mono">{filePreviewModal.fileName}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={filePreviewModal.fileBase64}
                      download={filePreviewModal.fileName}
                      className="px-3.5 py-2 bg-zinc-900 hover:bg-zinc-700 text-white font-extrabold text-[9px] uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <FileText size={11} /> Download
                    </a>
                    {filePreviewModal.status === 'Pending' && (
                      <button
                        onClick={() => {
                          approveCompliance(filePreviewModal.recordId, filePreviewModal.artist);
                          setFilePreviewModal(prev => prev ? { ...prev, status: 'Approved' } : null);
                        }}
                        className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[9px] uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <ShieldCheck size={11} /> Approve File
                      </button>
                    )}
                    <button
                      onClick={() => setFilePreviewModal(null)}
                      className="p-2 hover:bg-zinc-100 rounded-xl transition-all cursor-pointer"
                    >
                      <X size={18} className="text-zinc-550" />
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-auto bg-zinc-100 flex items-center justify-center p-4 min-h-[400px]">
                  {filePreviewModal.fileType && filePreviewModal.fileType.startsWith('image/') ? (
                    <img
                      src={filePreviewModal.fileBase64}
                      alt={filePreviewModal.fileName}
                      className="max-w-full max-h-full object-contain rounded-xl shadow-lg"
                    />
                  ) : filePreviewModal.fileType === 'application/pdf' ? (
                    <iframe
                      src={filePreviewModal.fileBase64}
                      title={filePreviewModal.fileName}
                      className="w-full h-full min-h-[500px] rounded-xl shadow-lg border-0 bg-white"
                      style={{ minHeight: '500px' }}
                    />
                  ) : (
                    <div className="text-center space-y-4">
                      <FileText size={56} className="text-zinc-300 mx-auto" />
                      <p className="text-zinc-500 font-semibold">{filePreviewModal.fileName}</p>
                      <p className="text-xs text-zinc-400">Preview not available for this file type.</p>
                      <a
                        href={filePreviewModal.fileBase64}
                        download={filePreviewModal.fileName}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-black text-white font-extrabold text-[10px] uppercase tracking-wider rounded-xl hover:bg-studio-pink hover:text-black transition-all"
                      >
                        <FileText size={13} /> Download to View
                      </a>
                    </div>
                  )}
                </div>

                <div className="px-6 py-3 border-t border-zinc-100 bg-zinc-50 flex-shrink-0 flex items-center justify-between">
                  <span className={`px-2.5 py-1 rounded-full font-black text-[9px] uppercase tracking-wide border ${
                    filePreviewModal.status === 'Approved'
                      ? 'bg-emerald-50 text-emerald-600 border-emerald-250'
                      : 'bg-amber-50 text-amber-600 border-amber-250'
                  }`}>
                    {filePreviewModal.status}
                  </span>
                  <span className="text-[10px] text-zinc-400 font-mono">Click outside or ✕ to close</span>
                </div>
              </div>
            </div>
          )}
          */}



          {/* TAB 6: ARTIST ANALYTICS [NEW] */}
          {activeTab === 'reports' && (
            <ArtistAnalytics 
              bookings={bookings} 
              artists={registeredArtists} 
              onExport={downloadBookingsCSV} 
            />
          )}

          {/* TAB 7: STUDIO SETTINGS */}
          {activeTab === 'settings' && (
            <div className="bg-white border border-zinc-200/80 p-6 sm:p-8 rounded-2xl shadow-xs animate-fade-in font-sans space-y-8">

              {/* Station Count Stepper */}
              <div className="space-y-4 pb-8 border-b border-zinc-100">
                <h4 className="text-xs font-black text-black uppercase tracking-wider flex items-center gap-2">
                  <Sliders size={16} className="text-studio-pink" />
                  WORKSTATION CAPACITY MANAGER
                </h4>
                <p className="text-xs text-zinc-455 leading-relaxed font-sans font-medium">
                  Dynamically adjust the number of active tattoo stations available in the customer booking engine calendar.
                </p>
                <div className="flex items-center gap-4 pt-2">
                  <span className="text-2xl font-black text-black px-4">4 Stations</span>
                </div>
              </div>

              {/* Operating Hours Manager */}
              <div className="space-y-4 pb-8 border-b border-zinc-100">
                <h4 className="text-xs font-black text-black uppercase tracking-wider flex items-center gap-2">
                  <Clock size={16} className="text-studio-pink" />
                  STUDIO OPERATING HOURS
                </h4>
                <p className="text-xs text-zinc-455 leading-relaxed font-sans font-medium">
                  Change the opening and closing hours for the workstation co-working studio block rules.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md">
                  <div>
                    <label className="block text-[9px] font-black tracking-widest text-zinc-400 uppercase mb-2">Open Time</label>
                    <select
                      value={localOperatingHours.open}
                      onChange={e => {
                        setLocalOperatingHours({ ...localOperatingHours, open: e.target.value });
                      }}
                      className="w-full px-4 py-3 bg-zinc-50/50 border border-zinc-200 text-black text-xs font-semibold rounded-xl focus:border-studio-pink focus:outline-none"
                    >
                      <option value="09:00">09:00 AM</option>
                      <option value="10:00">10:00 AM</option>
                      <option value="11:00">11:00 AM (Default)</option>
                      <option value="12:00">12:00 PM</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[9px] font-black tracking-widest text-zinc-400 uppercase mb-2">Close Time</label>
                    <select
                      value={localOperatingHours.close}
                      onChange={e => {
                        setLocalOperatingHours({ ...localOperatingHours, close: e.target.value });
                      }}
                      className="w-full px-4 py-3 bg-zinc-50/50 border border-zinc-200 text-black text-xs font-semibold rounded-xl focus:border-studio-pink focus:outline-none"
                    >
                      <option value="17:00">05:00 PM</option>
                      <option value="18:00">06:00 PM (Default)</option>
                      <option value="19:00">07:00 PM</option>
                      <option value="20:00">08:00 PM</option>
                      <option value="21:00">09:00 PM</option>
                    </select>
                  </div>
                </div>
                <div className="pt-2">
                  <button
                    onClick={saveOperatingHours}
                    className="px-6 py-3 bg-black hover:bg-studio-pink hover:text-black border border-black hover:border-studio-pink text-white font-extrabold text-[10px] tracking-widest uppercase transition-all duration-300 rounded-xl shadow-md cursor-pointer"
                  >
                    Save Operating Hours
                  </button>
                </div>
              </div>

              {/* Block Dates Info */}
              <div className="space-y-4 pb-8 border-b border-zinc-100">
                <h4 className="text-xs font-black text-black uppercase tracking-wider flex items-center gap-2">
                  <ShieldAlert size={16} className="text-studio-pink" />
                  BLOCK OUT DATES CALENDAR
                </h4>
                <p className="text-xs text-zinc-455 leading-relaxed font-sans font-medium">
                  Block specific stations or the entire studio for guest bookings due to maintenance or special events. Use the "Master Timeline" panel to block slots.
                </p>
                <button
                  onClick={() => setBlockingModal(true)}
                  className="px-6 py-3.5 bg-black hover:bg-studio-pink hover:text-black border border-black hover:border-studio-pink text-white font-extrabold text-[10px] tracking-widest uppercase transition-all duration-300 rounded-xl shadow-md cursor-pointer"
                >
                  Configure New Block
                </button>
              </div>

              {/* Opening Days Manager */}
              <div className="space-y-4 pb-8 border-b border-zinc-100">
                <h4 className="text-xs font-black text-black uppercase tracking-wider flex items-center gap-2">
                  <Calendar size={16} className="text-studio-pink" />
                  OPENING DAYS
                </h4>
                <p className="text-xs text-zinc-455 leading-relaxed font-sans font-medium">
                  Enable or disable specific days of the week for workstation bookings.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl">
                  {Object.keys(localOpeningDays).map(day => (
                    <label key={day} className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative flex items-center justify-center">
                        <input
                          type="checkbox"
                          checked={localOpeningDays[day]}
                          onChange={(e) => {
                            setLocalOpeningDays({ ...localOpeningDays, [day]: e.target.checked });
                          }}
                          className="peer appearance-none w-5 h-5 border-2 border-zinc-300 rounded-md checked:bg-black checked:border-black transition-colors cursor-pointer"
                        />
                        <svg className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M1 5L4.5 8.5L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <span className="text-[10px] font-black tracking-widest uppercase text-zinc-600 group-hover:text-black transition-colors">
                        {day}
                      </span>
                    </label>
                  ))}
                </div>
                <div className="pt-2">
                  <button
                    onClick={saveOpeningDays}
                    className="px-6 py-3 bg-black hover:bg-studio-pink hover:text-black border border-black hover:border-studio-pink text-white font-extrabold text-[10px] tracking-widest uppercase transition-all duration-300 rounded-xl shadow-md cursor-pointer"
                  >
                    Save Opening Days
                  </button>
                </div>
              </div>

              {/* Pricing Manager */}
              <div className="space-y-4">
                <h4 className="text-xs font-black text-black uppercase tracking-wider flex items-center gap-2">
                  <DollarSign size={16} className="text-studio-pink" />
                  PRICING CONFIGURATION
                </h4>
                <p className="text-xs text-zinc-455 leading-relaxed font-sans font-medium mb-4">
                  Edit the workstation rental prices. Select a day to adjust pricing for that specific day of the week.
                </p>

                {/* Day Selector Tabs */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {DAYS_OF_WEEK.map(day => (
                    <button
                      key={day}
                      onClick={() => setSelectedPricingDay(day)}
                      className={`px-4 py-2 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all duration-300 border ${
                        selectedPricingDay === day 
                          ? 'bg-studio-pink text-black border-studio-pink' 
                          : 'bg-white text-zinc-500 border-zinc-200 hover:border-zinc-300'
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl">
                  {!localOpeningDays[selectedPricingDay] ? (
                    <div className="col-span-2 sm:col-span-4 bg-studio-pink/10 border border-studio-pink/20 text-studio-pink px-6 py-4 rounded-xl text-xs font-bold flex items-center gap-2">
                      <ShieldAlert size={16} className="flex-shrink-0" /> 
                      Notice: The studio is closed on {selectedPricingDay}s. You cannot configure prices for a closed day.
                    </div>
                  ) : (
                    localPricing && localPricing[selectedPricingDay] && Object.entries(localPricing[selectedPricingDay])
                      .filter(([pkg]) => pkg !== '1H')
                      .map(([pkg, price]) => (
                      <div key={pkg}>
                        <label className="block text-[9px] font-black tracking-widest text-zinc-400 uppercase mb-2">{pkg} Session (CHF)</label>
                        <input
                          type="number"
                          value={price}
                          onChange={e => {
                            setLocalPricing({ 
                              ...localPricing, 
                              [selectedPricingDay]: {
                                ...localPricing[selectedPricingDay],
                                [pkg]: Number(e.target.value)
                              } 
                            });
                          }}
                          className="w-full px-4 py-3 bg-zinc-50/50 border border-zinc-200 text-black text-xs font-semibold rounded-xl focus:border-studio-pink focus:outline-none"
                        />
                      </div>
                    ))
                  )}
                </div>
                <div className="pt-2">
                  <button
                    onClick={savePricing}
                    className="px-6 py-3 bg-black hover:bg-studio-pink hover:text-black border border-black hover:border-studio-pink text-white font-extrabold text-[10px] tracking-widest uppercase transition-all duration-300 rounded-xl shadow-md cursor-pointer"
                  >
                    Save Pricing Configuration
                  </button>
                </div>
              </div>

              {/* Security & Password Change Section */}
              <div className="bg-white border border-zinc-200/80 p-6 sm:p-8 rounded-2xl shadow-xs space-y-6">
                <div>
                  <h4 className="text-sm font-black uppercase text-black flex items-center gap-2">
                    <Lock size={16} className="text-studio-pink" /> Change Admin Password
                  </h4>
                  <p className="text-xs text-zinc-455 mt-1 font-medium leading-relaxed">
                    Update your admin account password. The new password will be hashed and stored securely in the database for <strong className="text-black">{activeUser.email}</strong>.
                  </p>
                </div>

                {pwdError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-semibold flex items-center gap-2">
                    <ShieldAlert size={14} className="flex-shrink-0" />
                    <span>{pwdError}</span>
                  </div>
                )}

                {pwdSuccess && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold">
                    {pwdSuccess}
                  </div>
                )}

                <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-[9px] font-black tracking-widest text-zinc-400 uppercase mb-1.5">
                      Current Password (Optional if initial login)
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        value={changePwdForm.currentPassword}
                        onChange={(e) => setChangePwdForm({ ...changePwdForm, currentPassword: e.target.value })}
                        placeholder="••••••••"
                        className="w-full pl-4 pr-11 py-3 bg-zinc-50 border border-zinc-200 text-black text-xs font-semibold rounded-xl focus:border-studio-pink focus:outline-none font-sans"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-studio-pink transition-colors p-1 cursor-pointer"
                        title={showCurrentPassword ? "Hide password" : "Show password"}
                      >
                        {showCurrentPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[9px] font-black tracking-widest text-zinc-400 uppercase mb-1.5">
                      New Password *
                    </label>
                    <div className="relative">
                      <input
                        required
                        type={showNewPassword ? "text" : "password"}
                        value={changePwdForm.newPassword}
                        onChange={(e) => setChangePwdForm({ ...changePwdForm, newPassword: e.target.value })}
                        placeholder="Minimum 6 characters"
                        className="w-full pl-4 pr-11 py-3 bg-zinc-50 border border-zinc-200 text-black text-xs font-semibold rounded-xl focus:border-studio-pink focus:outline-none font-sans"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-studio-pink transition-colors p-1 cursor-pointer"
                        title={showNewPassword ? "Hide password" : "Show password"}
                      >
                        {showNewPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[9px] font-black tracking-widest text-zinc-400 uppercase mb-1.5">
                      Confirm New Password *
                    </label>
                    <div className="relative">
                      <input
                        required
                        type={showConfirmPassword ? "text" : "password"}
                        value={changePwdForm.confirmPassword}
                        onChange={(e) => setChangePwdForm({ ...changePwdForm, confirmPassword: e.target.value })}
                        placeholder="Repeat new password"
                        className="w-full pl-4 pr-11 py-3 bg-zinc-50 border border-zinc-200 text-black text-xs font-semibold rounded-xl focus:border-studio-pink focus:outline-none font-sans"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-studio-pink transition-colors p-1 cursor-pointer"
                        title={showConfirmPassword ? "Hide password" : "Show password"}
                      >
                        {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={pwdLoading || !changePwdForm.newPassword}
                    className="px-6 py-3 bg-black hover:bg-studio-pink hover:text-black text-white font-extrabold text-[10px] tracking-widest uppercase transition-all duration-300 rounded-xl shadow-md cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {pwdLoading ? <Sparkles size={14} className="animate-spin" /> : null}
                    UPDATE PASSWORD NOW
                  </button>
                </form>
              </div>

            </div>
          )}


          {activeTab === 'inquiries' && (
            <div className="space-y-6 animate-fade-in font-sans">
              <div>
                <h3 className="text-base font-black text-black uppercase tracking-wider">Customer Inquiries</h3>
                <p className="text-xs text-zinc-455 mt-1 font-sans font-medium">View and manage message submissions sent from the website footer.</p>
              </div>

              {inquiries.length === 0 ? (
                <div className="bg-white border border-zinc-200/80 p-12 text-center rounded-2xl shadow-xs">
                  <Mail size={40} className="mx-auto text-zinc-350 mb-3" />
                  <h4 className="text-sm font-black text-black uppercase tracking-wider">No Inquiries Found</h4>
                  <p className="text-xs text-zinc-450 mt-1 max-w-xs mx-auto leading-relaxed">
                    When visitors submit the contact form in the website footer, their messages will appear here.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6 pb-8">
                  {inquiries.map((inq) => (
                    <div
                      key={inq.id}
                      className="bg-white border border-zinc-200/80 p-6 rounded-2xl shadow-xs flex flex-col justify-between gap-4 hover:border-zinc-300 transition-all duration-200"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <h4 className="text-sm font-black uppercase text-black">{inq.name}</h4>
                          <a
                            href={`mailto:${inq.email}`}
                            className="text-xs font-semibold text-studio-pink hover:underline font-mono"
                          >
                            {inq.email}
                          </a>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-mono text-zinc-400 bg-zinc-50 border border-zinc-150 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                            {inq.date}
                          </span>
                          <button
                            onClick={() => {
                              onDeleteInquiry?.(inq.id);
                              triggerToast('Inquiry removed');
                            }}
                            className="text-zinc-400 hover:text-red-500 p-1 rounded-lg hover:bg-zinc-50 transition-colors cursor-pointer"
                            title="Delete Inquiry"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      <div className="bg-zinc-50 border border-zinc-200/60 p-4 rounded-xl text-xs text-zinc-650 leading-relaxed font-sans whitespace-pre-line">
                        {inq.message}
                      </div>

                      <div className="flex justify-end">
                        <button
                          onClick={() => {
                            setReplyModal(inq);
                            setReplySubject(`Regarding your inquiry at Tattooplatz Zurich`);
                            setReplyBody(`Hi ${inq.name},\n\nThank you for reaching out to Tattooplatz Zurich!\n\nBest regards,\nTattooplatz Team`);
                            setEmailPreviewUrl(null);
                          }}
                          className="px-4 py-2 bg-black hover:bg-studio-pink hover:text-black border border-black hover:border-studio-pink text-white font-extrabold text-[10px] tracking-widest uppercase transition-all duration-300 rounded-xl shadow-xs text-center cursor-pointer"
                        >
                          Reply by Email
                        </button>
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </main>
      </div>

      {/* ── MOBILE BOTTOM NAVIGATION BAR ── */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-zinc-200/80 z-40 lg:hidden shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
        <div className="flex items-stretch overflow-x-auto scrollbar-none">
          {[
            { id: 'overview', label: 'Overview', icon: <Sliders size={18} /> },
            { id: 'calendar', label: 'Timeline', icon: <Calendar size={18} /> },
            { id: 'bookings', label: 'Bookings', icon: <Search size={18} /> },
            { id: 'artists', label: 'Artists', icon: <Users size={18} /> },
            // { id: 'compliance',  label: 'Comply',    icon: <ShieldCheck size={18} /> },
            { id: 'reports', label: 'Reports', icon: <BarChart2 size={18} /> },
            { id: 'inquiries', label: 'Inquiries', icon: <Mail size={18} /> },
            { id: 'settings', label: 'Settings', icon: <Clock size={18} /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center py-2 px-3 gap-0.5 flex-1 min-w-[52px] transition-all duration-200 cursor-pointer relative ${activeTab === tab.id
                  ? 'text-studio-pink'
                  : 'text-zinc-400 hover:text-zinc-700'
                }`}
            >
              {activeTab === tab.id && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-[2px] bg-studio-pink rounded-b-full" />
              )}
              <span className={`transition-transform duration-200 ${activeTab === tab.id ? 'scale-110' : ''}`}>
                {tab.icon}
              </span>
              <span className={`text-[8px] font-black uppercase tracking-wide whitespace-nowrap ${activeTab === tab.id ? 'text-studio-pink' : 'text-zinc-400'
                }`}>{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* ── INTERACTIVE MODAL: BLOCK SLOT ── */}
      {blockingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white border border-zinc-200/80 rounded-2xl max-w-sm w-full p-6 sm:p-8 text-black relative shadow-2xl animate-scale-in">

            <button
              onClick={() => setBlockingModal(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-black p-1.5 hover:bg-zinc-55 rounded-lg transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>

            <h4 className="text-base font-black uppercase text-red-650 mb-4 pb-2 border-b border-zinc-100 flex items-center gap-2">
              <ShieldAlert className="text-red-500" size={18} />
              Block Workstation
            </h4>

            <form onSubmit={handleBlockSubmit} className="space-y-4 font-sans text-xs">
              <p className="text-zinc-455 font-medium leading-relaxed mb-4">
                Manually block bookings for a specific station on a selected date. This is immediate.
              </p>

              <div>
                <label className="block text-[9px] font-black tracking-widest text-zinc-400 uppercase mb-2">Date *</label>
                <input
                  required
                  type="date"
                  value={blockForm.date}
                  onChange={e => setBlockForm({ ...blockForm, date: e.target.value })}
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 text-black text-xs font-semibold rounded-xl focus:border-studio-pink focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[9px] font-black tracking-widest text-zinc-400 uppercase mb-2.5">Station Selection *</label>
                <div className="p-4 bg-zinc-50/50 border border-zinc-200 rounded-xl space-y-3">
                  <label className="flex items-center gap-3 font-semibold text-black cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={blockForm.selectedStations.length === stationsCount}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setBlockForm({
                          ...blockForm,
                          selectedStations: checked ? Array.from({ length: stationsCount }, (_, i) => i + 1) : []
                        });
                      }}
                      className="w-4 h-4 text-studio-pink border-zinc-300 rounded focus:ring-studio-pink focus:border-studio-pink accent-studio-pink"
                    />
                    <span className="text-xs uppercase tracking-wide">All Stations</span>
                  </label>
                  <div className="h-px bg-zinc-200/60 w-full" />
                  <div className="grid grid-cols-2 gap-3.5">
                    {Array.from({ length: stationsCount }).map((_, idx) => {
                      const stationNum = idx + 1;
                      const isChecked = blockForm.selectedStations.includes(stationNum);
                      return (
                        <label key={idx} className="flex items-center gap-2.5 font-medium text-zinc-650 hover:text-black cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              const updated = checked
                                ? [...blockForm.selectedStations, stationNum]
                                : blockForm.selectedStations.filter(s => s !== stationNum);
                              setBlockForm({ ...blockForm, selectedStations: updated });
                            }}
                            className="w-4 h-4 text-studio-pink border-zinc-300 rounded focus:ring-studio-pink focus:border-studio-pink accent-studio-pink"
                          />
                          <span className="text-xs uppercase">Station {stationNum}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] font-black tracking-widest text-zinc-400 uppercase mb-2">Start Hour</label>
                  <select
                    value={blockForm.start}
                    onChange={e => setBlockForm({ ...blockForm, start: e.target.value })}
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 text-black text-xs font-semibold rounded-xl focus:border-studio-pink focus:outline-none"
                  >
                    {hoursGrid.map(h => (
                      <option key={h} value={h}>{h}:00</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[9px] font-black tracking-widest text-zinc-400 uppercase mb-2">End Hour</label>
                  <select
                    value={blockForm.end}
                    onChange={e => setBlockForm({ ...blockForm, end: e.target.value })}
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 text-black text-xs font-semibold rounded-xl focus:border-studio-pink focus:outline-none"
                  >
                    {hoursGrid.map(h => (
                      <option key={h} value={h + 1}>{h + 1}:00</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4 mt-4 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setBlockingModal(false)}
                  className="px-5 py-2.5 border border-zinc-250 hover:bg-zinc-50 font-bold uppercase tracking-wider rounded-xl transition-colors text-[9px] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-black text-white hover:bg-studio-pink hover:text-black font-extrabold uppercase tracking-wider rounded-xl transition-colors shadow-md text-[9px] cursor-pointer"
                >
                  Apply Block
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
              className="absolute top-4 right-4 text-zinc-400 hover:text-black p-1.5 hover:bg-zinc-55 rounded-lg transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>

            <div className="flex flex-col items-center text-center pb-4 border-b border-zinc-100 mb-5">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-studio-pink to-studio-lightpink text-black font-black text-2xl flex items-center justify-center shadow-md uppercase mb-3">
                👑
              </div>
              <h4 className="text-lg font-black uppercase text-black">Chris</h4>
              <span className="px-2.5 py-0.5 text-[9px] font-black tracking-wider bg-black text-white uppercase rounded-full mt-1.5">
                Co-Founder & Admin
              </span>
            </div>

            <div className="space-y-4 font-sans text-xs mb-6">
              <div className="flex justify-between items-center py-1.5 border-b border-zinc-50">
                <span className="text-zinc-400 font-bold uppercase tracking-wider text-[9px]">Role</span>
                <span className="text-black font-extrabold">Studio Administrator</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-zinc-50">
                <span className="text-zinc-400 font-bold uppercase tracking-wider text-[9px]">Email</span>
                <span className="text-black font-semibold font-mono">chris@tattooplatz.ch</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-zinc-50">
                <span className="text-zinc-400 font-bold uppercase tracking-wider text-[9px]">Permissions</span>
                <span className="text-studio-pink font-black bg-studio-pink/10 px-2 py-0.5 rounded text-[9px] tracking-wide uppercase">
                  Full Root Access
                </span>
              </div>
              <div className="flex justify-between items-center py-1.5">
                <span className="text-zinc-455 font-bold uppercase tracking-wider text-[9px]">Location</span>
                <span className="text-black font-semibold">Zurich Studio HQ</span>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  setIsProfileModalOpen(false);
                  setActiveTab('settings');
                }}
                className="flex-1 py-3 bg-zinc-100 hover:bg-black hover:text-white text-black font-extrabold text-[9px] uppercase tracking-wider rounded-xl transition-all duration-300 cursor-pointer text-center"
              >
                Go to Settings
              </button>
              <button
                onClick={() => {
                  setIsProfileModalOpen(false);
                  onLogout?.();
                }}
                className="flex-1 py-3 bg-black hover:bg-red-655 text-white font-extrabold text-[9px] uppercase tracking-wider rounded-xl transition-all duration-300 shadow-md cursor-pointer text-center"
              >
                Logout Portal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── CLIENT DETAILS VIEW MODAL ── */}
      {selectedBookingForView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-zinc-200/80 rounded-2xl max-w-md w-full p-6 sm:p-8 text-black relative shadow-2xl animate-scale-in">

            <button
              onClick={handleCloseViewModal}
              className="absolute top-4 right-4 text-zinc-400 hover:text-black p-1.5 hover:bg-zinc-50 rounded-lg transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>

            <div className="flex flex-col items-center text-center pb-4 border-b border-zinc-100 mb-5">
              <div className="w-14 h-14 rounded-full bg-studio-pink/10 text-studio-pink border border-studio-pink/20 flex items-center justify-center shadow-2xs uppercase mb-3 text-xl font-bold">
                {selectedBookingForView.artist ? selectedBookingForView.artist[0] : 'A'}
              </div>
              <h4 className="text-lg font-black uppercase text-black">{selectedBookingForView.artist}</h4>
              <span className="px-2.5 py-0.5 text-[9px] font-black tracking-wider bg-black text-white uppercase rounded-full mt-1.5">
                Client Profile
              </span>
            </div>

            {showContactChannels ? (
              <div className="space-y-4 font-sans text-xs mb-6">
                <h5 className="text-[9px] font-black tracking-widest text-zinc-400 uppercase border-b border-zinc-50 pb-1">
                  Choose Contact Method
                </h5>
                <div className="grid grid-cols-1 gap-2.5 pt-1">
                  {/* Email */}
                  <a
                    href={`mailto:${selectedBookingForView.email || 'guest@example.com'}?subject=Regarding your station booking ${selectedBookingForView.id}&body=Hi ${selectedBookingForView.artist},%0D%0A%0D%0A`}
                    className="flex items-center gap-3 p-3 bg-zinc-50/50 hover:bg-studio-pink/5 border border-zinc-200 hover:border-studio-pink rounded-xl text-black transition-all group cursor-pointer"
                  >
                    <div className="p-2 bg-black text-white rounded-lg group-hover:bg-studio-pink group-hover:text-black transition-colors">
                      <Mail size={14} />
                    </div>
                    <div className="text-left">
                      <div className="font-extrabold text-[10px] uppercase tracking-wider">Send Email</div>
                      <div className="text-[10px] text-zinc-500 font-mono mt-0.5">{selectedBookingForView.email || 'guest@example.com'}</div>
                    </div>
                  </a>
                  {/* Instagram */}
                  {selectedBookingForView.instagram && selectedBookingForView.instagram !== 'Not provided' && (
                    <a
                      href={`https://www.instagram.com/${selectedBookingForView.instagram.replace('@', '')}/`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-3 p-3 bg-zinc-50/50 hover:bg-studio-pink/5 border border-zinc-200 hover:border-studio-pink rounded-xl text-black transition-all group cursor-pointer"
                    >
                      <div className="p-2 bg-black text-white rounded-lg group-hover:bg-studio-pink group-hover:text-black transition-colors">
                        <Instagram size={14} />
                      </div>
                      <div className="text-left">
                        <div className="font-extrabold text-[10px] uppercase tracking-wider">Instagram DM</div>
                        <div className="text-[10px] text-zinc-500 font-mono mt-0.5">{selectedBookingForView.instagram}</div>
                      </div>
                    </a>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4 font-sans text-xs mb-6">
                <h5 className="text-[9px] font-black tracking-widest text-zinc-400 uppercase border-b border-zinc-50 pb-1">
                  Contact Details
                </h5>

                <div className="flex justify-between items-center py-1 border-b border-zinc-50">
                  <span className="text-zinc-500 font-semibold uppercase tracking-wider text-[9px]">Email Address</span>
                  <a
                    href={`mailto:${selectedBookingForView.email || 'guest@example.com'}`}
                    className="text-studio-pink font-extrabold hover:underline font-mono"
                  >
                    {selectedBookingForView.email || 'guest@example.com'}
                  </a>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-zinc-50">
                  <span className="text-zinc-500 font-semibold uppercase tracking-wider text-[9px]">Instagram ID</span>
                  {selectedBookingForView.instagram && selectedBookingForView.instagram !== 'Not provided' ? (
                    <a
                      href={`https://www.instagram.com/${selectedBookingForView.instagram.replace('@', '')}/`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-studio-pink font-extrabold hover:underline"
                    >
                      {selectedBookingForView.instagram}
                    </a>
                  ) : (
                    <span className="text-zinc-400 italic">Not provided</span>
                  )}
                </div>

                <h5 className="text-[9px] font-black tracking-widest text-zinc-400 uppercase border-b border-zinc-50 pb-1 pt-2">
                  Booking Information
                </h5>

                <div className="flex justify-between items-center py-1 border-b border-zinc-50">
                  <span className="text-zinc-500 font-semibold uppercase tracking-wider text-[9px]">Reserved Slot</span>
                  <span className="text-black font-extrabold uppercase">
                    Station {selectedBookingForView.station} ({selectedBookingForView.location || 'Zurich'})
                  </span>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-zinc-50">
                  <span className="text-zinc-500 font-semibold uppercase tracking-wider text-[9px]">Date & Time</span>
                  <span className="text-black font-semibold">
                    {selectedBookingForView.dateStr} | {selectedBookingForView.timeStr}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-zinc-50">
                  <span className="text-zinc-500 font-semibold uppercase tracking-wider text-[9px]">Rent Fee Paid</span>
                  <span className="text-studio-pink font-black text-sm">{selectedBookingForView.price}.00 CHF</span>
                </div>

                <div className="flex justify-between items-center py-1">
                  <span className="text-zinc-500 font-semibold uppercase tracking-wider text-[9px]">Status</span>
                  <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-250 text-emerald-600 rounded-full font-black text-[9px] uppercase tracking-wide">
                    {selectedBookingForView.status || 'Confirmed'}
                  </span>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              {showContactChannels ? (
                <button
                  onClick={() => setShowContactChannels(false)}
                  className="flex-1 py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-extrabold text-[9px] uppercase tracking-wider rounded-xl transition-all duration-300 cursor-pointer"
                >
                  Back to Details
                </button>
              ) : (
                <button
                  onClick={() => setShowContactChannels(true)}
                  className="flex-1 py-3 bg-black hover:bg-studio-pink hover:text-black border border-black hover:border-studio-pink text-white font-extrabold text-[9px] uppercase tracking-wider rounded-xl transition-all duration-300 text-center flex items-center justify-center cursor-pointer"
                >
                  Contact Client
                </button>
              )}
              <button
                onClick={handleCloseViewModal}
                className="flex-1 py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-extrabold text-[9px] uppercase tracking-wider rounded-xl transition-all duration-300 cursor-pointer"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── ADD GUEST ARTIST MODAL ── */}
      {addArtistModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-zinc-200/80 rounded-2xl max-w-md w-full p-6 sm:p-8 text-black relative shadow-2xl animate-scale-in">

            <button
              onClick={() => setAddArtistModal(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-black p-1.5 hover:bg-zinc-50 rounded-lg transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>

            <div className="text-center pb-4 border-b border-zinc-100 mb-5">
              <h4 className="text-lg font-black uppercase text-black">Register Guest Artist</h4>
              <p className="text-xxs font-black tracking-widest text-zinc-450 uppercase mt-1">
                Add a new artist profile to the studio registry
              </p>
            </div>

            <form onSubmit={handleAddArtistSubmit} className="space-y-4 font-sans text-xs">
              <div>
                <label className="block text-[9px] font-black tracking-widest text-zinc-500 uppercase mb-1.5">
                  Artist Full Name *
                </label>
                <input
                  required
                  type="text"
                  value={newArtistForm.name}
                  onChange={e => setNewArtistForm({ ...newArtistForm, name: e.target.value })}
                  placeholder="e.g. John Doe"
                  className="w-full px-4 py-3 bg-zinc-50/50 border border-zinc-200 text-black text-xs font-semibold rounded-xl focus:border-studio-pink focus:bg-white focus:outline-none focus:ring-4 focus:ring-studio-pink/5 font-sans"
                />
              </div>

              <div>
                <label className="block text-[9px] font-black tracking-widest text-zinc-500 uppercase mb-1.5">
                  Email Address *
                </label>
                <input
                  required
                  type="email"
                  value={newArtistForm.email}
                  onChange={e => setNewArtistForm({ ...newArtistForm, email: e.target.value })}
                  placeholder="e.g. john@tattooplatz.ch"
                  className="w-full px-4 py-3 bg-zinc-50/50 border border-zinc-200 text-black text-xs font-semibold rounded-xl focus:border-studio-pink focus:bg-white focus:outline-none focus:ring-4 focus:ring-studio-pink/5 font-sans"
                />
              </div>

              <div>
                <label className="block text-[9px] font-black tracking-widest text-zinc-500 uppercase mb-1.5">
                  Instagram Username (Optional)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-zinc-400 text-xs font-bold pointer-events-none">@</span>
                  <input
                    type="text"
                    value={newArtistForm.ig.replace('@', '')}
                    onChange={e => setNewArtistForm({ ...newArtistForm, ig: e.target.value })}
                    placeholder="john_tats"
                    className="w-full pl-8 pr-4 py-3 bg-zinc-50/50 border border-zinc-200 text-black text-xs font-semibold rounded-xl focus:border-studio-pink focus:bg-white focus:outline-none focus:ring-4 focus:ring-studio-pink/5 font-sans"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setAddArtistModal(false)}
                  className="flex-1 py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-extrabold text-[9px] uppercase tracking-wider rounded-xl transition-all duration-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-black hover:bg-studio-pink hover:text-black border border-black hover:border-studio-pink text-white font-extrabold text-[9px] uppercase tracking-wider rounded-xl transition-all duration-300 cursor-pointer text-center"
                >
                  Register Artist
                </button>
              </div>
            </form>
          </div>
        </div>
      )}



      {/* ADD TEAM MEMBER MODAL */}
      {addTeamModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-zinc-200/80 rounded-2xl max-w-md w-full p-6 sm:p-8 text-black relative shadow-2xl animate-scale-in">
            <button onClick={() => { setAddTeamModal(false); setAddTeamError(''); setAddTeamSuccess(''); }} className="absolute top-4 right-4 text-zinc-400 hover:text-black p-1.5 hover:bg-zinc-50 rounded-lg transition-colors cursor-pointer"><X size={16} /></button>
            <div className="text-center pb-4 border-b border-zinc-100 mb-5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-studio-pink/20 to-studio-lightpink/20 flex items-center justify-center mx-auto mb-3"><ShieldCheck size={18} className="text-studio-pink" /></div>
              <h4 className="text-lg font-black uppercase text-black">Add Team Member</h4>
              <p className="text-[9px] font-black tracking-widest text-zinc-450 uppercase mt-1">Creates a new admin portal account</p>
            </div>

            {/* Success Message */}
            {addTeamSuccess && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-[10px] font-black text-emerald-700 text-center">{addTeamSuccess}</div>
            )}
            {/* Error Message */}
            {addTeamError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-[10px] font-black text-red-600 text-center">{addTeamError}</div>
            )}

            {!addTeamSuccess ? (
            <form onSubmit={handleAddTeamSubmit} className="space-y-4 font-sans text-xs">
              <div>
                <label className="block text-[9px] font-black tracking-widest text-zinc-500 uppercase mb-1.5">Full Name *</label>
                <input required type="text" value={newTeamForm.name} onChange={e => setNewTeamForm({ ...newTeamForm, name: e.target.value })} placeholder="e.g. Maria" className="w-full px-4 py-3 bg-zinc-50/50 border border-zinc-200 text-black text-xs font-semibold rounded-xl focus:border-studio-pink focus:outline-none focus:ring-4 focus:ring-studio-pink/5 font-sans" />
              </div>
              <div>
                <label className="block text-[9px] font-black tracking-widest text-zinc-500 uppercase mb-1.5">Role / Title</label>
                <input type="text" value={newTeamForm.title} onChange={e => setNewTeamForm({ ...newTeamForm, title: e.target.value })} placeholder="e.g. Studio Manager" className="w-full px-4 py-3 bg-zinc-50/50 border border-zinc-200 text-black text-xs font-semibold rounded-xl focus:border-studio-pink focus:outline-none focus:ring-4 focus:ring-studio-pink/5 font-sans" />
              </div>
              <div>
                <label className="block text-[9px] font-black tracking-widest text-zinc-500 uppercase mb-1.5">Email Address *</label>
                <input required type="email" value={newTeamForm.email} onChange={e => setNewTeamForm({ ...newTeamForm, email: e.target.value })} placeholder="e.g. maria@tattooplatz.ch" className="w-full px-4 py-3 bg-zinc-50/50 border border-zinc-200 text-black text-xs font-semibold rounded-xl focus:border-studio-pink focus:outline-none focus:ring-4 focus:ring-studio-pink/5 font-sans" />
              </div>
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <p className="text-[9px] font-black text-amber-700 uppercase tracking-wider">🔑 Default Password</p>
                <p className="text-[9px] text-amber-600 font-sans mt-0.5">Account will be created with password: <strong>TattoPlatz@2026</strong>. Member must change it after first login.</p>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setAddTeamModal(false); setAddTeamError(''); setAddTeamSuccess(''); }} className="flex-1 py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-extrabold text-[9px] uppercase tracking-wider rounded-xl transition-all cursor-pointer">Cancel</button>
                <button type="submit" disabled={addTeamLoading} className="flex-1 py-3 bg-black hover:bg-studio-pink hover:text-black border border-black hover:border-studio-pink text-white font-extrabold text-[9px] uppercase tracking-wider rounded-xl transition-all cursor-pointer disabled:opacity-50">{addTeamLoading ? 'Creating...' : 'Add Member'}</button>
              </div>
            </form>
            ) : (
              <button onClick={() => { setAddTeamModal(false); setAddTeamError(''); setAddTeamSuccess(''); }} className="w-full py-3 bg-black hover:bg-studio-pink hover:text-black border border-black hover:border-studio-pink text-white font-extrabold text-[9px] uppercase tracking-wider rounded-xl transition-all cursor-pointer">Done</button>
            )}
          </div>
        </div>
      )}

      {/* VIEW ADMIN MEMBER DETAILS MODAL */}
      {viewAdminModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-zinc-200/80 rounded-2xl max-w-sm w-full p-6 sm:p-8 text-black relative shadow-2xl animate-scale-in">
            <button onClick={() => { setViewAdminModal(null); setResetPwdMsg(''); }} className="absolute top-4 right-4 text-zinc-400 hover:text-black p-1.5 hover:bg-zinc-50 rounded-lg transition-colors cursor-pointer"><X size={16} /></button>
            <div className="text-center pb-4 border-b border-zinc-100 mb-5">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-studio-pink/20 to-studio-lightpink/20 flex items-center justify-center mx-auto mb-3 text-2xl">👑</div>
              <h4 className="text-lg font-black uppercase text-black">{viewAdminModal.name}</h4>
              <p className="text-[9px] font-black tracking-widest text-zinc-400 uppercase mt-1">{viewAdminModal.title || 'Admin'}</p>
            </div>
            <div className="space-y-3 text-xs font-sans mb-5">
              <div className="flex items-center gap-3 p-3 bg-zinc-50 rounded-xl">
                <Mail size={13} className="text-studio-pink shrink-0" />
                <div>
                  <div className="text-[9px] font-black text-zinc-400 uppercase tracking-wider">Email</div>
                  <div className="font-semibold text-black">{viewAdminModal.email}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-zinc-50 rounded-xl">
                <Key size={13} className="text-studio-pink shrink-0" />
                <div>
                  <div className="text-[9px] font-black text-zinc-400 uppercase tracking-wider">Login Password</div>
                  <div className="font-semibold text-black font-mono text-[10px]">••••••••• (hidden for security)</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-zinc-50 rounded-xl">
                <CheckCircle size={13} className="text-emerald-500 shrink-0" />
                <div>
                  <div className="text-[9px] font-black text-zinc-400 uppercase tracking-wider">Account Status</div>
                  <div className="font-black text-emerald-600 uppercase text-[10px]">Active</div>
                </div>
              </div>
            </div>

            {resetPwdMsg && (
              <div className={`mb-3 p-2.5 rounded-xl text-[10px] font-black text-center ${resetPwdMsg.startsWith('✅') ? 'bg-emerald-50 border border-emerald-200 text-emerald-700' : 'bg-red-50 border border-red-200 text-red-600'}`}>{resetPwdMsg}</div>
            )}

            <div className="space-y-2">
              <button
                onClick={() => handleResetAdminPassword(viewAdminModal)}
                disabled={resetPwdLoading}
                className="w-full py-2.5 px-4 bg-amber-50 hover:bg-amber-100 border border-amber-200 hover:border-amber-300 text-amber-700 font-extrabold text-[9px] uppercase tracking-wider rounded-xl transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Key size={11} />{resetPwdLoading ? 'Resetting...' : 'Reset Password to Default (TattoPlatz@2026)'}
              </button>
              <button
                onClick={() => { handleRemoveAdmin(viewAdminModal); setViewAdminModal(null); }}
                className="w-full py-2.5 px-4 bg-red-50 hover:bg-red-100 border border-red-200 hover:border-red-300 text-red-600 font-extrabold text-[9px] uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Trash2 size={11} /> Remove from Admin Team
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REPLY EMAIL MODAL */}
      {replyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-zinc-200/80 rounded-2xl max-w-lg w-full p-6 sm:p-8 text-black relative shadow-2xl animate-scale-in">
            <button onClick={() => setReplyModal(null)} className="absolute top-4 right-4 text-zinc-400 hover:text-black p-1.5 hover:bg-zinc-50 rounded-lg transition-colors cursor-pointer"><X size={16} /></button>
            <div className="text-center pb-4 border-b border-zinc-100 mb-5">
              <h4 className="text-lg font-black uppercase text-black">Reply by Email</h4>
              <p className="text-xxs font-black tracking-widest text-zinc-450 uppercase mt-1">Send direct response to {replyModal.email}</p>
            </div>

            <form onSubmit={async (e) => {
              e.preventDefault();
              setSendingEmail(true);
              try {
                const { inquiryAPI } = await import('../services/api.js');
                const res = await inquiryAPI.replyInquiry(replyModal.id, {
                  email: replyModal.email,
                  subject: replySubject,
                  message: replyBody
                });
                setSendingEmail(false);
                if (res.previewUrl) {
                  setEmailPreviewUrl(res.previewUrl);
                  triggerToast('Email delivered via Nodemailer!');
                } else {
                  setReplyModal(null);
                  triggerToast('Email sent directly to customer inbox!');
                }
              } catch (err) {
                setSendingEmail(false);
                triggerToast('Failed to send email: ' + err.message);
              }
            }} className="space-y-4 font-sans text-xs">
              <div>
                <label className="block text-[9px] font-black tracking-widest text-zinc-500 uppercase mb-1.5">Recipient Email</label>
                <input disabled type="email" value={replyModal.email} className="w-full px-4 py-3 bg-zinc-100 border border-zinc-200 text-zinc-600 text-xs font-semibold rounded-xl font-sans cursor-not-allowed" />
              </div>

              <div>
                <label className="block text-[9px] font-black tracking-widest text-zinc-500 uppercase mb-1.5">Email Subject *</label>
                <input required type="text" value={replySubject} onChange={e => setReplySubject(e.target.value)} className="w-full px-4 py-3 bg-zinc-50/50 border border-zinc-200 text-black text-xs font-semibold rounded-xl focus:border-studio-pink focus:outline-none font-sans" />
              </div>

              <div>
                <label className="block text-[9px] font-black tracking-widest text-zinc-500 uppercase mb-1.5">Message / Reply Body *</label>
                <textarea required rows={5} value={replyBody} onChange={e => setReplyBody(e.target.value)} className="w-full px-4 py-3 bg-zinc-50/50 border border-zinc-200 text-black text-xs font-medium rounded-xl focus:border-studio-pink focus:outline-none font-sans leading-relaxed resize-none" />
              </div>

              {emailPreviewUrl && (
                <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-xs text-emerald-800 space-y-2">
                  <p className="font-bold">✅ Ethereal Test Email Generated!</p>
                  <a href={emailPreviewUrl} target="_blank" rel="noreferrer" className="inline-block px-3 py-1.5 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 underline text-xxs">
                    Click here to view delivered email preview ↗
                  </a>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setReplyModal(null)} className="flex-1 py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-extrabold text-[9px] uppercase tracking-wider rounded-xl transition-all cursor-pointer">Close</button>
                <button type="submit" disabled={sendingEmail} className="flex-1 py-3 bg-black hover:bg-studio-pink hover:text-black border border-black hover:border-studio-pink text-white font-extrabold text-[9px] uppercase tracking-wider rounded-xl transition-all cursor-pointer disabled:opacity-50">
                  {sendingEmail ? 'Sending Email...' : 'Send Email Now'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── UNBLOCK CONFIRMATION MODAL ── */}
      {unblockingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-zinc-200/80 rounded-2xl max-w-md w-full p-6 sm:p-8 text-black relative shadow-2xl animate-scale-in animate-duration-200">

            <button
              onClick={() => setUnblockingModal(null)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-black p-1.5 hover:bg-zinc-50 rounded-lg transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>

            <div className="text-center pb-4 border-b border-zinc-100 mb-5">
              <h4 className="text-lg font-black uppercase text-black">Unblock Workstation</h4>
              <p className="text-xxs font-black tracking-widest text-zinc-450 uppercase mt-1">
                Release blocked workstation schedule
              </p>
            </div>

            <div className="space-y-4 font-sans text-xs mb-6">
              <div className="p-4 bg-zinc-50 border border-zinc-150 rounded-xl space-y-2">
                <div className="flex justify-between items-center py-1 border-b border-zinc-100/50">
                  <span className="text-zinc-500 font-semibold uppercase tracking-wider text-[9px]">Station to Release</span>
                  <span className="text-black font-black uppercase">Station {unblockingModal.station}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-zinc-100/50">
                  <span className="text-zinc-500 font-semibold uppercase tracking-wider text-[9px]">Date</span>
                  <span className="text-black font-semibold">{unblockingModal.dateStr}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-zinc-500 font-semibold uppercase tracking-wider text-[9px]">Time Slot</span>
                  <span className="text-black font-mono font-semibold">{unblockingModal.timeStr}</span>
                </div>
              </div>

              <p className="text-zinc-550 leading-relaxed text-center text-xs">
                Select how you would like to unblock this slot. You can either release only this specific station or release all blocked stations for this date and time block.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => handleUnblockSlot(unblockingModal)}
                className="w-full py-3 bg-black hover:bg-studio-pink hover:text-black border border-black hover:border-studio-pink text-white font-extrabold text-[10px] tracking-wider uppercase rounded-xl transition-all duration-300 cursor-pointer text-center"
              >
                Release Station {unblockingModal.station} Only
              </button>

              {bookings.filter(b =>
                b.date === unblockingModal.date &&
                Number(b.start) === Number(unblockingModal.start) &&
                Number(b.end) === Number(unblockingModal.end) &&
                b.status === 'Blocked' &&
                (b.location || 'Zurich') === (unblockingModal.location || 'Zurich')
              ).length > 1 && (
                  <button
                    onClick={() => handleUnblockAllStations(unblockingModal)}
                    className="w-full py-3 bg-white hover:bg-zinc-50 text-studio-pink border border-studio-pink/30 hover:border-studio-pink text-[10px] font-extrabold tracking-wider uppercase rounded-xl transition-all duration-300 cursor-pointer text-center"
                  >
                    Release All Stations (Same Time)
                  </button>
                )}

              <button
                onClick={() => setUnblockingModal(null)}
                className="w-full py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-extrabold text-[10px] tracking-wider uppercase rounded-xl transition-all duration-300 cursor-pointer text-center"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Universal Action Confirmation Modal */}
      {deleteConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in font-sans">
          <div className="bg-white border border-zinc-200/80 rounded-2xl max-w-sm w-full p-6 sm:p-8 text-black relative shadow-2xl animate-scale-in animate-duration-200 text-center">
            <div className="mx-auto w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
              <ShieldAlert size={22} className="animate-pulse" />
            </div>

            <h4 className="text-sm font-black uppercase text-black mb-2">Confirm Action</h4>
            <p className="text-xs text-zinc-550 leading-relaxed mb-6 font-medium">
              {deleteConfirmModal.message}
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirmModal(null)}
                className="flex-1 py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-extrabold text-[10px] tracking-wider uppercase rounded-xl transition-all duration-300 cursor-pointer"
              >
                No, Keep It
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteConfirmModal.onConfirm();
                  setDeleteConfirmModal(null);
                }}
                className="flex-1 py-3 bg-black hover:bg-red-550 hover:border-red-550 hover:text-white border border-black text-white font-extrabold text-[10px] tracking-wider uppercase rounded-xl transition-all duration-300 cursor-pointer text-center"
              >
                Yes, Confirm
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

