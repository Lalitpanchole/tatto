import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../config/db.js';
import UserModel from '../models/userModel.js';
import { sendOTPEmail } from '../services/email.service.js';

// In-memory OTP storage: email -> { otp, expiresAt }
const otpStore = new Map();

// Helper: Generate JWT Token
const generateToken = (id, role) => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET || 'tattooplatz_super_secret_jwt_key_2026',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};


// @desc    Register a new artist account
// @route   POST /api/auth/register
// @access  Public
export const registerArtist = async (req, res) => {
  try {
    const { name, email, password, phone, instagram, termsAccepted } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide all required fields (name, email, password)' });
    }

    if (!termsAccepted) {
      return res.status(400).json({ message: 'You must acknowledge and accept compliance terms to register' });
    }

    // Check if user exists
    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'An artist account with this email already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Insert user into MySQL database
    const userId = await UserModel.createArtist({
      name,
      email,
      passwordHash,
      phone,
      instagram
    });

    // Generate token and respond
    const token = generateToken(userId, 'artist');

    res.status(201).json({
      message: 'Artist registration successful',
      token,
      user: {
        id: userId,
        name,
        email,
        role: 'artist',
        phone,
        instagram,
        status: 'Active'
      }
    });

  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ message: 'Server error during registration', error: error.message });
  }
};

// @desc    Authenticate artist/admin & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const cleanPassword = String(password).trim();

    // Check for user in MySQL DB
    const user = await UserModel.findByEmail(cleanEmail);
    if (!user) {
      console.warn(`🔐 [LOGIN FAILED 401] Account not found for email: "${cleanEmail}"`);
      return res.status(401).json({ message: 'Invalid credentials: No registered account found with this email address.' });
    }

    if (user.status === 'Blocked') {
      console.warn(`🔐 [LOGIN BLOCKED 403] Account blocked for: "${cleanEmail}"`);
      return res.status(403).json({ message: 'Account is blocked by studio administration.' });
    }

    // Match password
    const isMatch = await bcrypt.compare(cleanPassword, user.password_hash);
    if (!isMatch) {
      console.warn(`🔐 [LOGIN FAILED 401] Incorrect password for email: "${cleanEmail}"`);
      return res.status(401).json({ message: 'Invalid credentials: Incorrect password entered.' });
    }

    // Generate token
    const token = generateToken(user.id, user.role);

    console.log(`✅ [LOGIN SUCCESS] ${user.role.toUpperCase()} logged in: ${cleanEmail}`);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        instagram: user.instagram,
        bio: user.bio || '',
        status: user.status
      }
    });

  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Server error during login', error: error.message });
  }
};

// @desc    Update current logged in user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const { name, email: requestedEmail, phone, instagram, bio } = req.body;
    const userEmail = req.user.email;

    let targetEmail = userEmail;
    if (requestedEmail && requestedEmail.toLowerCase().trim() !== userEmail.toLowerCase().trim()) {
      const cleanRequested = requestedEmail.toLowerCase().trim();
      const existing = await UserModel.findByEmail(cleanRequested);
      if (existing && existing.id !== req.user.id) {
        return res.status(400).json({ message: 'An account with this email address already exists.' });
      }
      targetEmail = cleanRequested;
    }

    await UserModel.updateProfileByIdOrEmail(req.user.id, userEmail, { name, newEmail: targetEmail, phone, instagram, bio });

    console.log(`👤 [PROFILE UPDATED] ${userEmail} -> Name: "${name}", Email: "${targetEmail}"`);

    res.json({
      message: 'Profile updated successfully',
      user: {
        ...req.user,
        name: name || req.user.name,
        email: targetEmail,
        phone: phone !== undefined ? phone : req.user.phone,
        instagram: instagram !== undefined ? instagram : req.user.instagram,
        bio: bio !== undefined ? bio : req.user.bio
      }
    });
  } catch (error) {
    console.error('Update Profile Error:', error);
    res.status(500).json({ message: 'Server error updating profile', error: error.message });
  }
};

// @desc    Get current logged in user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    res.json({ user: req.user });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching user profile' });
  }
};

// @desc    Seed all studio admin team accounts (run once / idempotent)
// @route   POST /api/auth/seed-admins
// @access  Private — Admin only (protected by middleware)
export const seedAdmins = async (req, res) => {
  // All studio team members who should have admin access
  const adminTeam = [
    { name: 'Chris (Co-Founder)', email: 'chris@tattooplatz.ch',   phone: null },
    { name: 'Bea',                email: 'bea@tattooplatz.ch',     phone: null },
    { name: 'Lucy',               email: 'lucy@tattooplatz.ch',    phone: null },
    { name: 'Tuli',               email: 'tuli@tattooplatz.ch',    phone: null },
    { name: 'Dani',               email: 'dani@tattooplatz.ch',    phone: null },
    { name: 'Leonie',             email: 'leonie@tattooplatz.ch',  phone: null },
  ];

  // Default initial password for all NEW admin accounts
  // Each admin should change their password after first login (Step 2)
  const DEFAULT_ADMIN_PASSWORD = 'TattoPlatz@2026';

  const results = [];

  for (const admin of adminTeam) {
    try {
      const existing = await UserModel.findByEmail(admin.email);
      if (existing) {
        // If already exists with artist role, update to admin
        if (existing.role !== 'admin') {
          await db.query("UPDATE users SET role = 'admin' WHERE LOWER(email) = LOWER(?)", [admin.email]);
          results.push({ email: admin.email, action: 'upgraded_to_admin' });
        } else {
          results.push({ email: admin.email, action: 'already_exists' });
        }
      } else {
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(DEFAULT_ADMIN_PASSWORD, salt);
        await UserModel.createAdmin({ name: admin.name, email: admin.email, passwordHash, phone: admin.phone });
        results.push({ email: admin.email, action: 'created' });
      }
    } catch (err) {
      results.push({ email: admin.email, action: 'error', error: err.message });
    }
  }

  res.json({
    message: 'Admin team seeding complete',
    defaultPassword: DEFAULT_ADMIN_PASSWORD,
    results
  });
};

// @desc    Get all studio admin team members
// @route   GET /api/auth/admin-team
// @access  Private — Admin only
export const getAdminTeam = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id, name, email, role AS title, phone, status, created_at FROM users WHERE role = 'admin' ORDER BY created_at ASC"
    );
    res.json({ team: rows });
  } catch (error) {
    console.error('Get Admin Team Error:', error);
    res.status(500).json({ message: 'Server error fetching admin team', error: error.message });
  }
};

// @desc    Add a new admin team member (creates DB account with default password)
// @route   POST /api/auth/admin-team
// @access  Private — Admin only
export const addAdminMember = async (req, res) => {
  try {
    const { name, title, email, phone } = req.body;
    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email are required' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if already exists
    const existing = await UserModel.findByEmail(normalizedEmail);
    if (existing) {
      if (existing.role !== 'admin') {
        // Upgrade to admin
        await db.query("UPDATE users SET role = 'admin', name = ? WHERE LOWER(email) = LOWER(?)", [name, normalizedEmail]);
        return res.json({ message: 'User upgraded to admin successfully', action: 'upgraded' });
      }
      return res.status(400).json({ message: 'An admin account with this email already exists' });
    }

    // Create with default password TattoPlatz@2026
    const DEFAULT_PASSWORD = 'TattoPlatz@2026';
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, salt);

    const [result] = await db.query(
      'INSERT INTO users (name, email, password_hash, role, phone, status) VALUES (?, ?, ?, ?, ?, ?)',
      [name.trim(), normalizedEmail, passwordHash, 'admin', phone || null, 'Active']
    );

    console.log(`✅ [ADMIN] New admin created: ${normalizedEmail}`);

    res.status(201).json({
      message: `Admin account created for ${name}`,
      defaultPassword: DEFAULT_PASSWORD,
      admin: {
        id: result.insertId,
        name: name.trim(),
        email: normalizedEmail,
        title: title || '',
        phone: phone || '',
        status: 'Active'
      }
    });
  } catch (error) {
    console.error('Add Admin Member Error:', error);
    res.status(500).json({ message: 'Server error creating admin', error: error.message });
  }
};

// @desc    Remove an admin team member (delete from DB)
// @route   DELETE /api/auth/admin-team/:id
// @access  Private — Admin only
export const removeAdminMember = async (req, res) => {
  try {
    const { id } = req.params;
    const requesterId = req.user.id;

    // Prevent self-deletion
    if (parseInt(id) === parseInt(requesterId)) {
      return res.status(400).json({ message: 'You cannot remove your own admin account' });
    }

    const [rows] = await db.query("SELECT id, name, email, role FROM users WHERE id = ?", [id]);
    if (!rows.length) return res.status(404).json({ message: 'Admin not found' });
    if (rows[0].role !== 'admin') return res.status(400).json({ message: 'User is not an admin' });

    await db.query('DELETE FROM users WHERE id = ?', [id]);
    console.log(`🗑️ [ADMIN] Admin removed: ${rows[0].email}`);

    res.json({ message: `Admin account for ${rows[0].name} removed successfully` });
  } catch (error) {
    console.error('Remove Admin Member Error:', error);
    res.status(500).json({ message: 'Server error removing admin', error: error.message });
  }
};

// @desc    Reset an admin's password back to default (TattoPlatz@2026)
// @route   POST /api/auth/admin-team/:id/reset-password
// @access  Private — Admin only
export const resetAdminPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const DEFAULT_PASSWORD = 'TattoPlatz@2026';

    const [rows] = await db.query("SELECT id, name, email, role FROM users WHERE id = ?", [id]);
    if (!rows.length) return res.status(404).json({ message: 'Admin not found' });
    if (rows[0].role !== 'admin') return res.status(400).json({ message: 'User is not an admin' });

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, salt);
    await db.query('UPDATE users SET password_hash = ? WHERE id = ?', [passwordHash, id]);

    console.log(`🔄 [ADMIN] Password reset to default for: ${rows[0].email}`);

    res.json({
      message: `Password reset to default (TattoPlatz@2026) for ${rows[0].name}`,
      defaultPassword: DEFAULT_PASSWORD
    });
  } catch (error) {
    console.error('Reset Admin Password Error:', error);
    res.status(500).json({ message: 'Server error resetting password', error: error.message });
  }
};

// @desc    Request 6-digit OTP for Forgot Password
// @route   POST /api/auth/forgot-password
// @access  Public
export const requestOTP = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email address is required' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await UserModel.findByEmail(normalizedEmail);
    if (!user) {
      return res.status(404).json({ message: 'No registered account found with this email address' });
    }

    // Generate 6-digit OTP code
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes validity

    otpStore.set(normalizedEmail, { otp, expiresAt });

    // Send email
    await sendOTPEmail(normalizedEmail, otp);

    console.log(`🔑 [SECURITY] Generated OTP for ${normalizedEmail}: ${otp}`);

    res.json({
      message: `OTP verification code sent to ${normalizedEmail}`,
      email: normalizedEmail,
      // Pass code in response for smooth dev testing
      devOtp: process.env.NODE_ENV === 'development' ? otp : undefined
    });
  } catch (error) {
    console.error('Request OTP Error:', error);
    res.status(500).json({ message: 'Server error generating OTP', error: error.message });
  }
};

// @desc    Verify 6-digit OTP code
// @route   POST /api/auth/verify-otp
// @access  Public
export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP code are required' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const stored = otpStore.get(normalizedEmail);

    if (!stored) {
      return res.status(400).json({ message: 'No OTP requested for this email or OTP has expired' });
    }

    if (Date.now() > stored.expiresAt) {
      otpStore.delete(normalizedEmail);
      return res.status(400).json({ message: 'OTP code has expired. Please request a new code.' });
    }

    if (stored.otp !== otp.trim()) {
      return res.status(400).json({ message: 'Invalid OTP code. Please check and try again.' });
    }

    res.json({ message: 'OTP verified successfully', valid: true });
  } catch (error) {
    res.status(500).json({ message: 'Server error verifying OTP' });
  }
};

// @desc    Reset password using verified OTP
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPasswordOTP = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: 'Email, OTP, and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters long' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const stored = otpStore.get(normalizedEmail);

    if (!stored || stored.otp !== otp.trim() || Date.now() > stored.expiresAt) {
      return res.status(400).json({ message: 'Invalid or expired OTP session' });
    }

    // Hash new password & update MySQL DB
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword.trim(), salt);

    await UserModel.updatePasswordByEmail(normalizedEmail, passwordHash);
    otpStore.delete(normalizedEmail);

    console.log(`✅ [SECURITY] Password reset successfully for ${normalizedEmail}`);

    res.json({ message: 'Password reset successfully! You can now log in with your new password.' });
  } catch (error) {
    console.error('Reset Password OTP Error:', error);
    res.status(500).json({ message: 'Server error resetting password', error: error.message });
  }
};

// @desc    Change password from Settings / Dashboard
// @route   POST /api/auth/change-password
// @access  Private (Logged-in user)
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userEmail = req.user.email;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters long' });
    }

    const user = await UserModel.findByEmail(userEmail);
    if (!user) {
      return res.status(404).json({ message: 'User account not found' });
    }

    // If currentPassword provided, verify it
    if (currentPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
      if (!isMatch) {
        return res.status(401).json({ message: 'Current password is incorrect' });
      }
    }

    // Hash new password and update in MySQL
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword.trim(), salt);

    await UserModel.updatePasswordByEmail(userEmail, passwordHash);

    console.log(`✅ [SECURITY] Password updated via Settings for ${userEmail}`);

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Change Password Error:', error);
    res.status(500).json({ message: 'Server error changing password', error: error.message });
  }
};

// @desc    Get all registered artists
// @route   GET /api/auth/artists
// @access  Public
export const getAllArtists = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, name, email, role, phone, instagram, bio, status, created_at FROM users WHERE role = "artist" ORDER BY id DESC');
    res.json(rows);
  } catch (error) {
    console.error('Get All Artists Error:', error);
    res.status(500).json({ message: 'Server error fetching artists', error: error.message });
  }
};

