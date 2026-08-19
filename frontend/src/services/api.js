const rawEnvUrl = import.meta.env.VITE_API_URL?.trim();
const normalizedUrl = rawEnvUrl ? rawEnvUrl.replace(/\/+$/, '') : 'http://localhost:5000/api';
const API_BASE_URL = normalizedUrl.endsWith('/api') ? normalizedUrl : `${normalizedUrl}/api`;


// Helper for fetch requests with JWT headers
const fetchWithAuth = async (endpoint, options = {}) => {
  const token = localStorage.getItem('tattooplatz_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const text = await response.text();
  let data = {};
  if (text) {
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.warn('API Response was not JSON:', text);
    }
  }

  if (!response.ok) {
    throw new Error(data.message || `API request failed with status ${response.status}`);
  }
  return data;
};


// 1. Authentication APIs
export const authAPI = {
  login: (credentials) => fetchWithAuth('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (userData) => fetchWithAuth('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
  getMe: () => fetchWithAuth('/auth/me', { method: 'GET' }),
  requestOTP: (email) => fetchWithAuth('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
  verifyOTP: (email, otp) => fetchWithAuth('/auth/verify-otp', { method: 'POST', body: JSON.stringify({ email, otp }) }),
  resetPasswordOTP: (email, otp, newPassword) => fetchWithAuth('/auth/reset-password', { method: 'POST', body: JSON.stringify({ email, otp, newPassword }) }),
  changePassword: (data) => fetchWithAuth('/auth/change-password', { method: 'POST', body: JSON.stringify(data) }),
  updateProfile: (profileData) => fetchWithAuth('/auth/profile', { method: 'PUT', body: JSON.stringify(profileData) }),
  getArtists: () => fetchWithAuth('/auth/artists', { method: 'GET' }),
};


// 2. Booking APIs
export const bookingAPI = {
  getAvailability: (date, duration = 3) => fetchWithAuth(`/bookings/availability?date=${date}&duration=${duration}`, { method: 'GET' }),
  createBooking: (bookingData) => fetchWithAuth('/bookings', { method: 'POST', body: JSON.stringify(bookingData) }),
  createPublicBooking: async (bookingData) => {
    const response = await fetch(`${API_BASE_URL}/bookings/public`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingData)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'API request failed');
    return data;
  },
  getMyBookings: () => fetchWithAuth('/bookings/my-bookings', { method: 'GET' }),
  getAdminBookings: (location = 'Zurich') => fetchWithAuth(`/bookings/admin/all?location=${location}`, { method: 'GET' }),
  cancelBooking: (id) => fetchWithAuth(`/bookings/${id}/cancel`, { method: 'PATCH' }),
  blockSlot: (blockData) => fetchWithAuth('/bookings/admin/block', { method: 'POST', body: JSON.stringify(blockData) }),
};

// 3. Inquiry APIs
export const inquiryAPI = {
  submitInquiry: (inquiryData) => fetchWithAuth('/inquiries', { method: 'POST', body: JSON.stringify(inquiryData) }),
  getInquiries: () => fetchWithAuth('/inquiries', { method: 'GET' }),
  deleteInquiry: (id) => fetchWithAuth(`/inquiries/${id}`, { method: 'DELETE' }),
  replyInquiry: (id, replyData) => fetchWithAuth(`/inquiries/${id}/reply`, { method: 'POST', body: JSON.stringify(replyData) }),
};

// 4. Manager Settings API
export const managerSettingsAPI = {
  getSettings: () => fetchWithAuth('/manager/settings', { method: 'GET' }),
  updateSettings: (settingsData) => fetchWithAuth('/manager/settings', { method: 'PUT', body: JSON.stringify(settingsData) }),
};

// 5. Printful API
export const printfulAPI = {
  createOrder: (orderData) => fetchWithAuth('/printful/order', { method: 'POST', body: JSON.stringify(orderData) }),
  getProducts: () => fetchWithAuth('/printful/products', { method: 'GET' }),
};

// 6. Admin Team Management API
export const adminAPI = {
  // Get all admin team members from DB
  getTeam: () => fetchWithAuth('/auth/admin-team', { method: 'GET' }),

  // Add a new admin (creates DB account with default password TattoPlatz@2026)
  addMember: (data) => fetchWithAuth('/auth/admin-team', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  // Remove an admin from DB (permanent delete)
  removeMember: (id) => fetchWithAuth(`/auth/admin-team/${id}`, { method: 'DELETE' }),

  // Reset admin password back to TattoPlatz@2026
  resetMemberPassword: (id) => fetchWithAuth(`/auth/admin-team/${id}/reset-password`, { method: 'POST' }),
};

export default { authAPI, bookingAPI, inquiryAPI, managerSettingsAPI, printfulAPI, adminAPI };
