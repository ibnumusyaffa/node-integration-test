const User = require('../db/user');
const jwt = require('jsonwebtoken');

// Middleware to check if user is authenticated
const checkAuth = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    jwt.verify(token, process.env.JWT_SECRET, async (err, auth) => {
      if (err) {
        return res.status(401).json({ error: 'Authentication failed' });
      }
      const user = await User.query().where({ email: auth.email }).first();
      req.user = user;
      next();
    });
  } catch (error) {
    return res.status(401).json({ error: 'Authentication failed' });
  }
};

module.exports = { checkAuth };
