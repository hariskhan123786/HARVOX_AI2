import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import { initializeTerminalSocket } from './socket/terminalSocket.js';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { connectDB } from './config/db.js';
import { isAIConfigured } from './services/groqService.js';
import User from './models/User.js';

import authRoutes from './routes/authRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import noteRoutes from './routes/noteRoutes.js';
import userRoutes from './routes/userRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import fsRoutes from './routes/fs.js';
import SystemSettings from './models/SystemSettings.js';
import UserSettings from './models/UserSettings.js';
import UserAnalytics from './models/UserAnalytics.js';
import Achievements from './models/Achievements.js';
import Subscription from './models/Subscription.js';
import path from 'path';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize app
const startServer = async () => {
  try {
    await connectDB();
    console.log('Database connected successfully');
    
    // Auto-seed demo user for in-memory DB
    // Auto-seed default settings
    let settings = await SystemSettings.findOne();
    if (!settings) {
      await SystemSettings.create({
        jazzCashNumber: '03001234567',
        jazzCashName: 'HARVOX AI SAAS',
        easyPaisaNumber: '03451234567',
        easyPaisaName: 'HARVOX AI SAAS',
        announcement: 'Welcome to HARVOX AI - Premium AI SaaS Platform! Update settings in admin panel.',
      });
      console.log('Default SystemSettings seeded.');
    }

    // Auto-seed admin user
    const adminExists = await User.findOne({ email: 'admin@harvox.ai' });
    if (!adminExists) {
      const admin = await User.create({
        name: 'Harvox Admin',
        email: 'admin@harvox.ai',
        password: 'admin123',
        role: 'admin',
        subscription: 'pro',
      });
      await UserSettings.create({ userId: admin._id });
      await UserAnalytics.create({ userId: admin._id });
      await Achievements.create({ userId: admin._id });
      await Subscription.create({ userId: admin._id, plan: 'pro', status: 'active' });
      console.log('Admin user seeded: admin@harvox.ai / admin123');
    }

    // Auto-seed demo user (Free tier for payment testing)
    const demoExists = await User.findOne({ email: 'demo@harvox.ai' });
    if (!demoExists) {
      const demo = await User.create({
        name: 'Demo User',
        email: 'demo@harvox.ai',
        password: 'demo123',
        role: 'free',
        subscription: 'free',
      });
      await UserSettings.create({ userId: demo._id });
      await UserAnalytics.create({ userId: demo._id });
      await Achievements.create({ userId: demo._id });
      await Subscription.create({ userId: demo._id, plan: 'free', status: 'active' });
      console.log('Demo user seeded: demo@harvox.ai / demo123');
    } else if (process.env.USE_IN_MEMORY_DB === 'true' && demoExists.subscription === 'pro') {
      // Reset if it was pro from previous default seeding so billing flow can be tested
      demoExists.role = 'free';
      demoExists.subscription = 'free';
      await demoExists.save();
    }
  } catch (err) {
    console.error('Failed to connect to MongoDB:', err.message);
    process.exit(1);
  }
};

app.use(helmet());
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { message: 'Too many requests, please try again later.' },
});
app.use('/api', limiter);

app.get('/api/health', (_, res) => {
  res.json({
    status: 'ok',
    ai: isAIConfigured(),
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/user', userRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/fs', fsRoutes);
app.use('/uploads', express.static(path.join(path.resolve(), 'uploads')));

app.use((err, _req, res, _next) => {
  res.status(err.status || 500).json({ message: err.message || 'Server error' });
});

const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

initializeTerminalSocket(io);


startServer().then(() => {
  httpServer.listen(PORT, () => {
    console.log(`HARVOX AI server running on port ${PORT}`);
    if (!isAIConfigured()) {
      console.warn('Warning: GROQ_API_KEY not set — AI features will fail');
    }
  });

  httpServer.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} is already in use. Please close the other process and restart.`);
      process.exit(1);
    } else {
      throw err;
    }
  });
});

// Global guard — prevent node-pty or any module crash from taking down the server
process.on('uncaughtException', (err) => {
  if (err.message && (err.message.includes('AttachConsole') || err.message.includes('conpty') || err.message.includes('forEach'))) {
    console.warn('[PTY] Caught node-pty Windows error (non-fatal):', err.message);
  } else {
    console.error('[FATAL] Uncaught exception:', err);
    process.exit(1);
  }
});
