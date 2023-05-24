// Middleware function to check if the user's role is allowed
const checkRole = (allowedRole) => (req, res, next) => {
  // Assuming the user object is available in req.user
  const userRole = req.user.role.name;

  if (userRole === allowedRole) {
    // User's role is allowed, continue to the next middleware
    next();
  } else {
    // User's role is not allowed, send a 403 Forbidden response
    res.status(403).json({ message: 'Access denied' });
  }
};

module.exports = checkRole;