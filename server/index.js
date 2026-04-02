const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { Server } = require('socket.io');
const http = require('http');
const { parseAllowedOrigins, corsOriginCallback } = require('./utils/corsConfig');

dotenv.config();

const app = express();
const server = http.createServer(app);

// 🔹 CORS setup
const allowedOrigins = parseAllowedOrigins();
const corsOrigin = corsOriginCallback(allowedOrigins);

// 🔹 Socket.io
const io = new Server(server, {
  cors: {
    origin: corsOrigin,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// 🔹 Routes
const authRoutes = require('./routes/authRoutes');
const campaignRoutes = require('./routes/campaignRoutes');
const donationRoutes = require('./routes/donationRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const adminRoutes = require('./routes/adminRoutes');
const path = require('path');

const isProd = process.env.NODE_ENV === 'production';

if (isProd) {
  app.set('trust proxy', 1);
}

// 🔹 Middlewares
app.use(
  cors({
    origin: corsOrigin,
    credentials: true,
  })
);

app.use(express.json());

// 🔥 DEBUG middleware
app.use((req, res, next) => {
  console.log(`➡️ ${req.method} ${req.url}`);
  console.log('BODY:', req.body);
  next();
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 🔹 API Routes
app.use('/api/auth', authRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);

// 🔹 Health
app.get('/api/health', (req, res) => {
  res.json({ ok: true, env: process.env.NODE_ENV || 'development' });
});

// 🔹 Root
app.get('/', (req, res) => {
  res.send('API is running ✅');
});

// 🔹 404
app.use('/api', (req, res) => {
  res.status(404).json({ message: 'Not found' });
});

// 🔥 GLOBAL ERROR HANDLER (CRITICAL)
app.use((err, req, res, next) => {
  console.error('🔥 GLOBAL ERROR:', err);
  res.status(500).json({
    message: err.message,
    stack: err.stack,
  });
});

// 🔹 Socket.io
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

app.set('socketio', io);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT} (${isProd ? 'production' : 'development'})`);
});