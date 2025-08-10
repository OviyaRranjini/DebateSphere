const jwt = require('jsonwebtoken');

// Middleware to check if the user is authenticated
module.exports = (req, res, next) => {
  console.log('🔐 Auth middleware triggered');
  console.log('Session:', req.session);
  console.log('User:', req.user);
  // Try to get token from Authorization header or session
 if (req.session?.userId) {
  req.user = {
    id: req.session.userId,
    email: req.session.userEmail,
  };
  return next();
}

  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1] || req.cookies?.token || null;

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }
try {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  req.user = {
    id: decoded.id,
    email: decoded.email, // ✅ ensure this is included
  };
  next();
} catch (err) {
  console.error('JWT Error:', err);
  return res.status(403).json({ message: 'Forbidden: Invalid token' });
}

};
