const express = require('express');
const router = express.Router();
const { signup, login, logout } = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

router.get('/check', authMiddleware, (req, res) => {
  res.status(200).json({
    message: 'Authenticated',
    user: req.user, // contains decoded token data like userId, email
  });
});
router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);
// GET /api/auth/me


module.exports = router;
