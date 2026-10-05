import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import registrationRoutes from './routes/registrationRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import emailRoutes from './routes/emailRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import authRoutes, { initAdminUser } from './routes/authRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from backend/.env
dotenv.config({ path: path.resolve(__dirname, '.env') });
dotenv.config();

const app = express();

// Middleware
// Enable CORS for all origins (Localhost, custom domains, live host)
app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to Database and verify admin user in MongoDB
connectDB()
  .then(() => initAdminUser())
  .catch((err) => {
    console.warn('MongoDB background connection note:', err.message);
  });

// API Routes
app.use('/api', authRoutes);
app.use('/api', registrationRoutes);
app.use('/api', contactRoutes);
app.use('/api', emailRoutes);
app.use('/api', dashboardRoutes);

// Root Welcome & Status Endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    service: 'Dr. Vishwajeet Portfolio & Admin Backend API',
    message: 'Server is running smoothly.',
    endpoints: {
      health: '/api/health',
      auth: '/api/admin/login',
      dashboard: '/api/dashboard/stats',
      registrations: '/api/registrations',
      contacts: '/api/contacts',
      birthdays: '/api/birthdays/today',
      email: '/api/email/send'
    },
    timestamp: new Date().toISOString(),
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'Dr. Vishwajeet Portfolio & Admin API',
  });
});

// Serve Frontend static build in production if present
const frontendDistPath = path.resolve(__dirname, '../frontend/dist');
const localDistPath = path.resolve(__dirname, 'dist');

if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api')) {
      return res.sendFile(path.join(frontendDistPath, 'index.html'));
    }
    next();
  });
} else if (fs.existsSync(localDistPath)) {
  app.use(express.static(localDistPath));
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api')) {
      return res.sendFile(path.join(localDistPath, 'index.html'));
    }
    next();
  });
}

// Global Error Handler Middleware
app.use((err, req, res, next) => {
  console.error('Unhandled API Error:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
});

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 API endpoints available at /api/`);
  });
}

export default app;
