import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Authentication token missing. Please log in to proceed.',
    });
  }

  try {
    const JWT_SECRET = process.env.JWT_SECRET || 'nexus_hr_enterprise_super_secret_jwt_key_2026_x99!';
    const decoded = jwt.verify(token, JWT_SECRET);

    // If database is connected, fetch fresh user, otherwise use decoded token data
    let user = null;
    try {
      user = await User.findById(decoded.id).select('-password');
    } catch (dbErr) {
      // Database might be in standby
    }

    if (!user) {
      // Fallback from decoded payload
      user = {
        _id: decoded.id,
        id: decoded.id,
        name: decoded.name || 'Enterprise User',
        email: decoded.email,
        role: decoded.role,
        employeeId: decoded.employeeId || null,
      };
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired authorization token.',
    });
  }
};
