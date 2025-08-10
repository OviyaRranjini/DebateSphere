const db = require('../config/db');
const crypto = require('crypto');
const sendMail = require('../utils/mailer'); // ✅ Import mail utility
const { sendOtp, verifyOtp } = require('../utils/otpService');

// Generate a random alphanumeric key
const generateDebateKey = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const length = Math.floor(Math.random() * 5) + 8; // 8–12 characters
  return Array.from({ length }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
};

// ✅ Add Debate
exports.addDebate = async (req, res) => {
  const { title, description, creator, date, time, minutes } = req.body;

  const event_date = date;
  const event_time = time;
  const duration_minutes = minutes;

  const userId = req.session?.userId || req.user?.id;
  const userEmail = req.session.userEmail || req.user?.email;
  console.log('User ID:', userId, 'Email:', userEmail);
  // console.log("📩 Sending email to:", userEmail);
  const debateKey = generateDebateKey();

  if (!title || !description || !creator || !event_date || !event_time || !duration_minutes) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
    // Insert into DB
    await db.query(
      `INSERT INTO debates 
       (debate_key, title, description, creator, user_id, event_date, event_time, duration_minutes) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [debateKey, title, description, creator, userId, event_date, event_time, duration_minutes]
    );

    // Send confirmation email
    await sendMail({
      to: userEmail,
      subject: 'Debate Created Successfully!',
      text: `
Hello,

Your debate "${title}" has been successfully created.

Details:
Debate ID: ${debateKey}
Date: ${event_date}
Time: ${event_time}
Duration: ${duration_minutes} minutes

Thank you for using our Debate Platform!
`
    });

    res.status(201).json({ message: 'Debate added and confirmation email sent!' });

  } catch (error) {
    console.error('❌ Add debate error:', error);
    res.status(500).json({ message: 'Server error. Failed to add debate.' });
  }
};

// ✅ List debates the user has NOT registered for
exports.listAll = async (req, res) => {
  const userId = req.user?.id || req.session?.userId;

  if (!userId) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const [rows] = await db.query(`
      SELECT * FROM debates
      WHERE id NOT IN (
        SELECT debate_id FROM registrations WHERE user_id = ?
      )`, [userId]);

    res.json(rows);
  } catch (err) {
    console.error('❌ Error listing unregistered debates:', err);
    res.status(500).json({ message: 'Server error retrieving debates.' });
  }
};

// ✅ List debates the user has registered for
exports.listMine = async (req, res) => {
  const userId = req.user?.id || req.session?.userId;
  const [rows] = await db.query(`
    SELECT d.* FROM debates d 
    JOIN registrations r ON r.debate_id = d.id 
    WHERE r.user_id = ?`, [userId]);
  res.json(rows);
};

// ✅ Register for a debate
exports.register = async (req, res) => {
  const { debateId } = req.body;
  const userId = req.user?.id || req.session?.userId;
  const userEmail = req.user?.email || req.session?.userEmail;

  if (!debateId || !userId) {
    return res.status(400).json({ message: 'Debate ID and user ID are required.' });
  }

  try {
    // Prevent duplicate registration
    const [existing] = await db.query(
      'SELECT * FROM registrations WHERE user_id = ? AND debate_id = ?',
      [userId, debateId]
    );
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Already registered for this debate.' });
    }

    // Register
    await db.query(
      'INSERT INTO registrations (user_id, debate_id) VALUES (?, ?)',
      [userId, debateId]
    );

    // Get debate info
    const [debateRows] = await db.query(
      'SELECT title, debate_key, event_date, event_time, duration_minutes FROM debates WHERE id = ?',
      [debateId]
    );
    const debate = debateRows[0];

    // Send confirmation email
    await sendMail({
      to: userEmail,
      subject: 'Debate Registration Confirmation',
      text: `
Hello,

You have successfully registered for the debate "${debate.title}".

Details:
Debate ID: ${debate.debate_key}
Date: ${debate.event_date}
Time: ${debate.event_time}
Duration: ${debate.duration_minutes} minutes

Please arrive at least 10 minutes early.

Thank you for joining!
`
    });

    res.json({ message: 'Registered successfully and confirmation email sent.' });

  } catch (err) {
    console.error('❌ Registration error:', err);
    res.status(500).json({ message: 'Server error during registration.' });
  }
};

// ✅ Get debate by ID
exports.getById = async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await db.query('SELECT * FROM debates WHERE id = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Debate not found' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('❌ Error fetching debate by ID:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ✅ Delete debate by creator (and notify registered users)
exports.deleteDebate = async (req, res) => {
  const debateId = req.params.id;
  const userId = req.user?.id || req.session?.userId;
  const userEmail = req.user?.email || req.session?.userEmail;

  try {
    // Fetch debate
    const [debateRows] = await db.query('SELECT * FROM debates WHERE id = ?', [debateId]);
    const debate = debateRows[0];

    if (!debate) {
      return res.status(404).json({ message: 'Debate not found' });
    }

    if (debate.user_id !== userId) {
      return res.status(403).json({ message: 'You are not allowed to delete this debate.' });
    }

    // Get registered user emails
    const [registrations] = await db.query(
      'SELECT u.email FROM registrations r JOIN users u ON r.user_id = u.id WHERE r.debate_id = ?',
      [debateId]
    );

    // Notify registered users
    for (const reg of registrations) {
      await sendMail({
        to: reg.email,
        subject: `Debate "${debate.title}" Cancelled`,
        text: `The debate "${debate.title}" has been cancelled.`
      });
    }

    // Notify creator
    await sendMail({
      to: userEmail,
      subject: `Your debate "${debate.title}" was deleted`,
      text: `Your debate "${debate.title}" was deleted along with all its registrations.`
    });

    // Delete registrations
    await db.query('DELETE FROM registrations WHERE debate_id = ?', [debateId]);

    // Delete debate
    await db.query('DELETE FROM debates WHERE id = ?', [debateId]);

    res.json({ message: 'Debate and registrations deleted. Emails sent.' });

  } catch (err) {
    console.error('❌ Delete debate error:', err);
    res.status(500).json({ message: 'Internal server error.' });
  }
};



// POST /sendotp
exports.sendOtpHandler = async (req, res) => {
  const userId = req.session?.userId || req.user?.id;
  const userEmail = req.session?.userEmail || req.user?.email;
  const { debateKey } = req.body;

  if (!debateKey || !userId || !userEmail) {
    return res.status(400).json({ message: 'Missing debateKey or user session.' });
  }

  try {
    const [debateRows] = await db.query('SELECT title FROM debates WHERE debate_key = ?', [debateKey]);
    if (debateRows.length === 0) {
      return res.status(404).json({ message: 'Debate not found.' });
    }

    const debateTitle = debateRows[0].title;

    await sendOtp(debateKey, userId, userEmail, debateTitle);

    res.json({ success: true, message: 'OTP sent to your email.' });
  } catch (err) {
    console.error('❌ Send OTP error:', err.stack || err);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// POST /verifyotp
exports.verifyOtpHandler = (req, res) => {
  const userId = req.session?.userId || req.user?.id;
  const { debateKey, otp } = req.body;

  if (!debateKey || !otp || !userId) {
    return res.status(400).json({ message: 'Missing debateKey, OTP, or user session.' });
  }

  const result = verifyOtp(debateKey, userId, otp);

  if (!result.success) {
    return res.status(403).json({ success: false, message: result.message });
  }

  return res.json({ success: true, message: result.message });
};


// const db = require('../config/db'); // adjust path based on your setup

// GET /api/debates/:debateKey
exports.getDebateByKey = async (req, res) => {
  const { debateKey } = req.params;

  if (!debateKey) {
    return res.status(400).json({ success: false, message: 'Debate key is required.' });
  }

  try {
    const [results] = await db.execute(
      `SELECT 
         *
       FROM debates
       WHERE debate_key = ?`,
      [debateKey]
    );

    if (results.length === 0) {
      return res.status(404).json({ success: false, message: 'Debate not found.' });
    }

    return res.status(200).json({ success: true, data: results[0] });
  } catch (err) {
    console.error('Error fetching debate by key:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};
