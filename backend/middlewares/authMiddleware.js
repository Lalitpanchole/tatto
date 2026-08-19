import jwt from 'jsonwebtoken';
import UserModel from '../models/userModel.js';

// Protect routes - Verify JWT Token
export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tattooplatz_super_secret_jwt_key_2026');

      const user = await UserModel.findById(decoded.id);
      if (!user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      if (user.status === 'Blocked') {
        return res.status(403).json({ message: 'Account is blocked by studio administration' });
      }

      req.user = user;
      next();
    } catch (error) {
      console.error('JWT Token Verification Error:', error.message);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

// Admin only middleware
export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied: Studio Admin privileges required' });
  }
};
