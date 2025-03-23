/**
 * Middleware to check if user has the required committee permissions
 * @param {String} permissionType - The permission type to check
 * @returns {Function} - Express middleware function
 */
module.exports = (permissionType) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ msg: 'Authentication required' });
      }

      // Admin always has access to everything
      if (req.user.role === 'admin') {
        return next();
      }

      // If user is not a committee member, they don't have any permissions
      if (req.user.role !== 'committee') {
        return res.status(403).json({ 
          msg: 'Forbidden - You do not have the required committee permissions',
          requiredPermission: permissionType,
          yourRole: req.user.role
        });
      }

      // Check if the user has the required committee permissions
      const hasPermission = req.user.committeePermissions && 
                            req.user.committeePermissions.includes(permissionType);

      if (!hasPermission) {
        return res.status(403).json({ 
          msg: 'Forbidden - You do not have the required committee permissions',
          requiredPermission: permissionType,
          yourPermissions: req.user.committeePermissions || []
        });
      }

      next();
    } catch (err) {
      console.error('Committee permission check error:', err);
      return res.status(500).json({ msg: 'Server error in permission check' });
    }
  };
}; 