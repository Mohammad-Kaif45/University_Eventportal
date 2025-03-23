const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Authentication middleware
 * Verifies the JWT token and attaches the user to the request
 */
const auth = async (req, res, next) => {
  // Get token from header
  const token = req.header('x-auth-token');

  // Check if no token
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database (excluding password)
    const user = await User.findById(decoded.user.id).select('-password');
    
    // Check if user exists
    if (!user) {
      return res.status(401).json({ msg: 'Token is valid but user no longer exists' });
    }
    
    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({ msg: 'Your account has been deactivated' });
    }
    
    // Attach user to request
    req.user = user;
    
    // Update last activity timestamp
    await User.findByIdAndUpdate(user.id, { 
      lastActive: new Date() 
    }, { new: true });
    
    next();
  } catch (err) {
    console.error('Auth middleware error:', err.message);
    
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ msg: 'Token has expired' });
    }
    
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

const checkRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied.' });
    }
    next();
  };
};

module.exports = { auth, checkRole }; 