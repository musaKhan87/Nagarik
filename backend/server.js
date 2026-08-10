const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const { startSLAMonitor } = require('./services/slaMonitor');

// Import Routes
const authRoutes = require('./routes/auth');
const complaintRoutes = require('./routes/complaints');
const adminRoutes = require('./routes/admin');
const workerRoutes = require('./routes/workers');
const uploadRoutes = require('./routes/upload');
const classifyRoutes = require('./routes/classify');
const analyticsRoutes = require('./routes/analytics');
const notificationRoutes = require('./routes/notifications');

const app = express();

// ─── Middleware ───────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── API Routes ───────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/worker', workerRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/classify', classifyRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', notificationRoutes);

// ─── Health Check ────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', env: process.env.NODE_ENV, time: new Date() });
});

// ─── Global Error Handler (must be last) ─────────
app.use(errorHandler);

// ─── Database Seed ────────────────────────────────
const User = require('./models/User');
const bcrypt = require('bcryptjs');

const seedDB = async () => {
  const adminExists = await User.findOne({ role: 'super_admin' });
  if (!adminExists) {
    const salt = await bcrypt.genSalt(12);
    const hashed = await bcrypt.hash('password', salt);
    await User.insertMany([
      { name: 'Citizen Joe',    phone: '9876543210', email: 'citizen@smartcity.gov', password: hashed, role: 'citizen' },
      { name: 'Supervisor Alice', phone: '9876543211', email: 'admin@smartcity.gov',   password: hashed, role: 'dept_admin',   department: 'Roads & Infrastructure Dept' },
      { name: 'Worker Bob',     phone: '9876543212', email: 'worker@smartcity.gov',  password: hashed, role: 'worker',       department: 'Roads & Infrastructure Dept' },
      { name: 'Super Admin',    phone: '9876543213', email: 'super@smartcity.gov',   password: hashed, role: 'super_admin' },
    ]);
    console.log('Database seeded with default users.');
  }
};

// ─── Start ───────────────────────────────────────
const PORT = process.env.PORT || 5000;

connectDB()
  .then(async () => {
    await seedDB();
    startSLAMonitor();
    app.listen(PORT, () => {
      console.log(`✅ CivicLink server running on http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('DB connection failed. Starting without DB for health-check only:', err.message);
    app.listen(PORT, () => {
      console.log(`⚠️  Mock server (no DB) running on http://localhost:${PORT}`);
    });
  });

module.exports = app; // exported for testing
