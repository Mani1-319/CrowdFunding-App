const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { Server } = require('socket.io');
const http = require('http');

dotenv.config();

const app = express();
const server = http.createServer(app);

const clientOrigin = process.env.CLIENT_ORIGIN;
const io = new Server(server, {
  cors: {
    origin: clientOrigin || true,
    methods: ['GET', 'POST'],
  },
});

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

// Middleware
app.use(
  cors(
    clientOrigin
      ? { origin: clientOrigin, credentials: true }
      : {}
  )
);
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/health', (req, res) => {
  res.json({ ok: true, env: process.env.NODE_ENV || 'development' });
});

app.use('/api', (req, res) => {
  res.status(404).json({ message: 'Not found' });
});

// ❌ REMOVED frontend serving block (THIS FIXES YOUR ERROR)

if (!isProd) {
  app.get('/', (req, res) => {
    res.send('Donation Platform API is running');
  });
}

// Socket.io for Real-time Updates
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Make io accessible to routers
app.set('socketio', io);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT} (${isProd ? 'production' : 'development'})`);
});