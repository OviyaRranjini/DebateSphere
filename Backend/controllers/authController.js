const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.signup = async (req, res) => {
  const { email, password } = req.body;

  try {
    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await db.query('INSERT INTO users (email, password) VALUES (?, ?)', [email, hashedPassword]);

    res.status(201).json({ message: 'Signup successful' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const [userRows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    const user = userRows[0];
    if (!user) return res.status(401).json({ message: 'Invalid email or password' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Invalid email or password' });

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

   req.session.userId = user.id;
   req.session.userEmail = user.email; // ✅ Add this line

    res.json({ message: 'Login successful', token }); // ✅ must return JSON here
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' }); // ✅ ensure JSON error response
  }
};

exports.logout = (req, res) => {
  console.log('User logging out:', req.session.userId);
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ message: 'Logout failed' });
    res.clearCookie('session_cookie_name');
    res.json({ message: 'Logged out successfully' });
  });
};
