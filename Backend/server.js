const express = require('express');
const cors = require('cors');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');
const cron = require('node-cron');
const bodyParser = require('body-parser');

// ROUTES & CONTROLLERS
const authRoutes = require('./routers/authRoutes.js');
const debateRoutes = require('./routers/debateRoutes.js');
const { cleanupOldDebates } = require('./controllers/cleanup');

// (Optional) DB import to get full user details
// const db = require('./db'); // uncomment this and update path if needed

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    credentials: true,
  },
});

// === SESSION SETUP ===
const sessionStore = new MySQLStore({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

const sessionMiddleware = session({
  key: 'session_cookie_name',
  secret: process.env.SESSION_SECRET,
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    maxAge: 1000 * 60 * 60, // 1 hour
  },
});

// === MIDDLEWARE ===
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(sessionMiddleware);

// === Share session with Socket.IO ===
io.engine.use(sessionMiddleware);

// === ROUTES ===
app.use('/api/auth', authRoutes);
app.use('/api/debates', debateRoutes);

// === CRON JOBS ===
cron.schedule('0 0 * * *', () => {
  console.log('🧹 Running daily cleanup job...');
  cleanupOldDebates();
});

// === SOCKET.IO LOGIC ===
io.on('connection', (socket) => {
  console.log('🔌 New client connected');

  socket.on('join_debate_room', ({ debateId }) => {
    socket.join(debateId);
    console.log(`📢 User joined room: ${debateId}`);
  });

  socket.on('send_message', ({ room, message }) => {
    const session = socket.request.session;
    console.log('session:', session,' message:', message, ' room:', room);
    if (!session?.userId || !session?.userEmail) {
      console.log('❌ No user found in session');
      return;
    }

    const messageObj = {
      userId: session.userId,
      user: session.userEmail,
      text: message.text,
      timestamp: new Date().toISOString(),
    };

    io.to(room).emit('receive_message', { message: messageObj });
  });

  socket.on('leave_room', ({ room }) => {
    socket.leave(room);
    console.log(`🚪 User left room: ${room}`);
  });

  socket.on('disconnect', () => {
    console.log('❌ Client disconnected');
  });
});

// === START SERVER ===
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
