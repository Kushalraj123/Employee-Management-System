import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/authRoutes.js';
import employeeRoutes from './routes/employeeRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import leaveRoutes from './routes/leaveRoutes.js';
import payrollRoutes from './routes/payrollRoutes.js';
import announcementRoutes from './routes/announcementRoutes.js';
import performanceRoutes from './routes/performanceRoutes.js';
import userRoutes from './routes/userRoutes.js';
import departmentRoutes from './routes/departmentRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/nexus_hr';

// Middleware
app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json());

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'NEXUS HR Enterprise REST Engine',
    database: mongoose.connection.readyState === 1 ? 'MongoDB Atlas Connected' : 'High-Performance In-Memory Standby Engine',
    timestamp: new Date().toISOString(),
  });
});

// Mount Module Routes
app.use('/api/auth', authRoutes);
app.use('/api', employeeRoutes); // mounts /api/employees and /api/stats
app.use('/api/attendance', attendanceRoutes);
app.use('/api/leave', leaveRoutes);
app.use('/api/payroll', payrollRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/performance', performanceRoutes);
app.use('/api/users', userRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/notifications', notificationRoutes);

// Root Welcome Endpoint
app.get('/', (req, res) => {
  res.send({
    service: 'NEXUS HR — People. Performance. Connected.',
    version: '2.0 Enterprise',
    status: 'Online',
    modules: [
      '/api/auth',
      '/api/employees',
      '/api/attendance',
      '/api/leave',
      '/api/payroll',
      '/api/announcements',
      '/api/performance',
      '/api/users',
      '/api/departments',
      '/api/reports',
      '/api/settings',
      '/api/notifications',
    ],
  });
});

// Centralized Error Handling Middleware
app.use(errorHandler);

// Connect to MongoDB Atlas & Launch Server
const startServer = async () => {
  if (process.env.MONGODB_URI) {
    try {
      await mongoose.connect(MONGODB_URI, {
        serverSelectionTimeoutMS: 4000, // Quick fallback if IP is not whitelisted
      });
      console.log('✅ Connected to MongoDB Atlas successfully!');
    } catch (error) {
      console.warn('ℹ️ MongoDB Atlas connection standby (IP whitelist / offline mode):', error.message);
      console.log('⚡ Active in high-performance Enterprise In-Memory & Local Hybrid Engine mode.');
    }
  } else {
    console.log('ℹ️ Running in Enterprise Standby Engine mode.');
  }

  app.listen(PORT, () => {
    console.log(`🚀 NEXUS HR Backend Server running on port ${PORT}`);
    console.log(`📡 Full REST API available at http://localhost:${PORT}/api`);
  });
};

startServer();
