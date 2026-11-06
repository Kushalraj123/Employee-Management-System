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
import recruitmentRoutes from './routes/recruitmentRoutes.js';
import userRoutes from './routes/userRoutes.js';
import departmentRoutes from './routes/departmentRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/nexus_hr';

// Security Headers & Rate Limiting Middleware
const rateLimitStore = new Map();
const apiRateLimiter = (req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');

  const ip = req.ip || req.connection?.remoteAddress || 'local';
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute window
  const maxRequests = 300; // 300 req/min per IP

  const entry = rateLimitStore.get(ip) || { count: 0, resetAt: now + windowMs };
  if (now > entry.resetAt) {
    entry.count = 1;
    entry.resetAt = now + windowMs;
  } else {
    entry.count += 1;
  }
  rateLimitStore.set(ip, entry);

  res.setHeader('X-RateLimit-Limit', String(maxRequests));
  res.setHeader('X-RateLimit-Remaining', String(Math.max(0, maxRequests - entry.count)));

  if (entry.count > maxRequests) {
    return res.status(429).json({
      success: false,
      message: 'Too many requests from this IP. Please retry in a minute.',
    });
  }
  next();
};

// Middleware
app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json({ limit: '5mb' }));
app.use(apiRateLimiter);

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'NEXUS 3D Digital Workplace & Enterprise HRMS Engine',
    version: '3.0.0-Enterprise',
    database: mongoose.connection.readyState === 1 ? 'MongoDB Atlas Connected' : 'High-Performance Hybrid In-Memory Engine',
    timestamp: new Date().toISOString(),
  });
});

// Interactive API Documentation Endpoint
app.get('/api/docs', (req, res) => {
  res.status(200).json({
    openapi: '3.0.0',
    info: {
      title: 'NEXUS Enterprise HRMS & 3D Digital Workplace REST API',
      version: '3.0.0',
      description: 'Role-Based Enterprise HR Management, 3D Org Network, Recruitment ATS, Configurable Payroll, and Autonomous AI Studio API.',
    },
    roles: ['admin (Super Admin)', 'hr (HR Administrator)', 'manager (Department Manager)', 'employee (Employee)'],
    endpoints: {
      auth: ['POST /api/auth/login', 'POST /api/auth/demo-login', 'POST /api/auth/forgot-password', 'POST /api/auth/reset-password', 'GET /api/auth/me'],
      employees: ['GET /api/employees', 'GET /api/employees/:id', 'POST /api/employees', 'PUT /api/employees/:id', 'DELETE /api/employees/:id', 'POST /api/employees/:id/documents', 'DELETE /api/employees/:id/documents/:docId'],
      orgNetwork3D: ['GET /api/org-network'],
      attendance: ['POST /api/attendance/check-in', 'POST /api/attendance/check-out', 'POST /api/attendance/regularize', 'PUT /api/attendance/approve/:id', 'GET /api/attendance/holidays', 'POST /api/attendance/holidays', 'GET /api/attendance/all', 'PUT /api/attendance/policy'],
      leave: ['POST /api/leave/apply', 'GET /api/leave/my-leaves', 'GET /api/leave/my-balance', 'GET /api/leave/calendar', 'GET /api/leave/all', 'PUT /api/leave/review/:id'],
      payroll: ['GET /api/payroll/list', 'POST /api/payroll/generate', 'PUT /api/payroll/status/:id', 'GET /api/payroll/rules', 'PUT /api/payroll/rules', 'GET /api/payroll/my-slips'],
      recruitment: ['GET /api/recruitment/jobs', 'POST /api/recruitment/jobs', 'GET /api/recruitment/candidates', 'POST /api/recruitment/candidates', 'PUT /api/recruitment/candidates/:id/stage', 'POST /api/recruitment/candidates/:id/interview', 'POST /api/recruitment/candidates/:id/feedback', 'POST /api/recruitment/ai-screen', 'GET /api/recruitment/analytics'],
      performance: ['GET /api/performance/reviews', 'POST /api/performance/reviews', 'POST /api/performance/self-assessment', 'PUT /api/performance/skills/:employeeId', 'GET /api/performance/analytics', 'GET /api/performance/goals', 'POST /api/performance/goals', 'PUT /api/performance/goals/:id'],
      ai: ['POST /api/ai/chat', 'POST /api/ai/action', 'GET /api/ai/workforce-analytics', 'POST /api/ai/generate-report', 'GET /api/ai/insights'],
      announcementsAndKudos: ['GET /api/announcements', 'POST /api/announcements', 'GET /api/announcements/kudos', 'POST /api/announcements/kudos', 'PUT /api/announcements/kudos/:id/like'],
      securityAndUsers: ['GET /api/users', 'PUT /api/users/:id/role', 'PUT /api/users/permissions/:role', 'GET /api/users/audit-logs'],
    },
  });
});

// Mount Module Routes
app.use('/api/auth', authRoutes);
app.use('/api', employeeRoutes); // mounts /api/employees, /api/stats, /api/org-network
app.use('/api/attendance', attendanceRoutes);
app.use('/api/leave', leaveRoutes);
app.use('/api/payroll', payrollRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/performance', performanceRoutes);
app.use('/api/recruitment', recruitmentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/ai', aiRoutes);

// Root Welcome Endpoint
app.get('/', (req, res) => {
  res.send({
    service: 'NEXUS — Next-Gen 3D Digital Workplace & Enterprise Employee Management System',
    version: '3.0 Enterprise with 3D Org Network, ATS & AI Studio',
    status: 'Online',
    documentation: '/api/docs',
    modules: [
      '/api/auth',
      '/api/ai',
      '/api/employees',
      '/api/org-network',
      '/api/attendance',
      '/api/leave',
      '/api/payroll',
      '/api/recruitment',
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
        serverSelectionTimeoutMS: 4000,
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
