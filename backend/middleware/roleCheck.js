/**
 * Middleware to check if user has the required role
 * @param {Array} roles - Array of allowed roles
 * @returns {Function} - Express middleware function
 */
module.exports = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ msg: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        msg: 'Forbidden - You do not have the required role to access this resource',
        requiredRoles: roles,
        yourRole: req.user.role
      });
    }

    next();
  };
}; 