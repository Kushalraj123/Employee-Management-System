import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import employeeRoutes from './routes/employeeRoutes.js';

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
    service: 'NEXUS HR REST API Engine',
    database: mongoose.connection.readyState === 1 ? 'MongoDB Connected' : 'Disconnected / Standby',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api', employeeRoutes);

// Root
app.get('/', (req, res) => {
  res.send({
    message: 'NEXUS HR Enterprise API Server is Online',
    docs: '/api/employees',
  });
});

// Connect to MongoDB & Start Server
const startServer = async () => {
  try {
    if (process.env.MONGODB_URI) {
      await mongoose.connect(MONGODB_URI);
      console.log('✅ Connected to MongoDB Atlas successfully!');
    } else {
      console.log('ℹ️ No MONGODB_URI provided in .env, running in API standby mode.');
    }
  } catch (error) {
    console.warn('⚠️ MongoDB connection failed:', error.message);
    console.log('NEXUS Frontend will automatically utilize its high-performance Local Hybrid Store.');
  }

  app.listen(PORT, () => {
    console.log(`🚀 NEXUS HR Backend Server running on port ${PORT}`);
    console.log(`📡 API Endpoints available at http://localhost:${PORT}/api/employees`);
  });
};

startServer();
