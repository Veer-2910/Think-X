import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import routes
import authRoutes from './routes/authRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import academicRoutes from './routes/academicRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js'; // Added
import feeRoutes from './routes/feeRoutes.js'; // Added
import riskRoutes from './routes/riskRoutes.js';
import interventionRoutes from './routes/interventionRoutes.js';
import counselingRoutes from './routes/counselingRoutes.js';
import mentorRoutes from './routes/mentorRoutes.js';
import reportingRoutes from './routes/reportingRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware - CORS configuration
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // Allow any localhost origin in development
    if (origin.startsWith('http://localhost:')) {
      return callback(null, true);
    }
    
    // In production, restrict to specific origin
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/academic', academicRoutes);
app.use('/api/attendance', attendanceRoutes); // Added
app.use('/api/fees', feeRoutes); // Added
app.use('/api/risk', riskRoutes);
app.use('/api/intervention', interventionRoutes);
app.use('/api/counseling', counselingRoutes);
app.use('/api/mentor', mentorRoutes);
app.use('/api/reports', reportingRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health Check API
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Student Dropout Prevention System API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
});

export default app;
