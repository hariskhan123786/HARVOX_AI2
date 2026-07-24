import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { connectDB, getDBHealth } from './config/db.js';
import { isAIConfigured } from './services/groqService.js';
import { supabase } from './config/supabase.js';
import path from 'path';

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
import memoryRoutes from './routes/memoryRoutes.js';
import automationRoutes from './routes/automationRoutes.js';
import voiceRoutes from './routes/voiceRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ── Startup ────────────────────────────────────────────────────────────────────
const startServer = async () => {
  try {
    await connectDB();
  } catch (err) {
    console.error('[Startup] Supabase connection check failed, continuing anyway:', err.message);
  }

  // Non-blocking seeding via Supabase
  (async () => {
    try {
      const { data: settings } = await supabase
        .from('system_settings')
        .select('id')
        .limit(1)
        .maybeSingle();

      if (!settings) {
        await supabase.from('system_settings').insert({
          jazz_cash_number: '03001234567',
          jazz_cash_name: 'HARVOX AI SAAS',
          easy_paisa_number: '03451234567',
          easy_paisa_name: 'HARVOX AI SAAS',
          announcement: 'Welcome to HARVOX AI - Premium AI SaaS Platform! Update settings in admin panel.',
        });
        console.log('[Seed] Default SystemSettings seeded.');
      }
    } catch (err) {
      console.warn('[Seed] SystemSettings skipped:', err.message);
    }

    // Seed admin user via Supabase Auth + public tables
    try {
      const adminEmail = 'admin@harvox.ai';
      const adminPassword = process.env.ADMIN_PASSWORD || 'HarvoxAdmin2025!';

      const { data: adminUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', adminEmail)
        .maybeSingle();

      if (!adminUser) {
        const { data: authData, error: signUpErr } = await supabase.auth.signUp({
          email: adminEmail,
          password: adminPassword,
          options: { data: { name: 'Harvox Admin' } },
        });

        if (signUpErr) {
          console.warn('[Seed] Admin auth sign-up skipped:', signUpErr.message);
        } else {
          const uid = authData.user.id;
          await supabase.from('users').insert({ id: uid, email: adminEmail, role: 'admin', subscription: 'pro' });
          await supabase.from('profiles').insert({ id: uid, name: 'Harvox Admin' });
          await supabase.from('settings').insert({ user_id: uid });
          await supabase.from('subscriptions').insert({ user_id: uid, plan: 'pro', status: 'active' });
          await supabase.from('user_preferences').insert({ user_id: uid });
          console.log(`[Seed] Admin user seeded: ${adminEmail} / ${adminPassword}`);
        }
      }
    } catch (err) {
      console.warn('[Seed] Admin user skipped:', err.message);
    }
  })();
};

// ── Security Middleware ────────────────────────────────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "blob:", "https:"],
        connectSrc: ["'self'", "ws:", "wss:", "http:", "https:"],
        frameSrc: ["'self'"],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  process.env.CLIENT_URL,
].filter(Boolean);

const corsWildcard = process.env.CLIENT_URL === '*';

app.use(
  cors({
    origin(origin, callback) {
      if (corsWildcard || !origin) return callback(null, true);
      if (
        origin.endsWith('.railway.app') ||
        origin.endsWith('.up.railway.app') ||
        origin.endsWith('.vercel.app')
      ) {
        return callback(null, true);
      }
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));

// ── Rate Limiting ──────────────────────────────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { message: 'Too many auth attempts, please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// ── Health Check ───────────────────────────────────────────────────────────────
app.get('/api/health', (_, res) => {
  const dbHealth = getDBHealth();
  res.json({
    status: dbHealth.status === 'ok' ? 'ok' : 'degraded',
    database: dbHealth,
    ai: isAIConfigured(),
    timestamp: new Date().toISOString(),
  });
});

// ── Routes ─────────────────────────────────────────────────────────────────────
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
app.use('/api/memory', memoryRoutes);
app.use('/api/automation', automationRoutes);
app.use('/api/voice', voiceRoutes);

// ── Static Client (Production) ─────────────────────────────────────────────────
if (process.env.NODE_ENV === 'production' && !process.env.VERCEL) {
  const distPath = path.join(path.resolve(), 'client/dist');
  app.use(express.static(distPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.use((err, _req, res, _next) => {
  res.status(err.status || 500).json({ message: err.message || 'Server error' });
});

// ── WebSocket / Socket.IO & Listen (Only outside Vercel Serverless) ─────────────
const httpServer = http.createServer(app);

if (!process.env.VERCEL) {
  // node-pty and Socket.IO terminal sessions require a persistent process.
  // Do not import them in Vercel's serverless runtime.
  const { initializeTerminalSocket } = await import('./socket/terminalSocket.js');
  const io = new Server(httpServer, {
    cors: {
      origin(origin, callback) {
        if (corsWildcard || !origin) return callback(null, true);
        if (
          origin.endsWith('.railway.app') ||
          origin.endsWith('.up.railway.app') ||
          origin.endsWith('.vercel.app')
        ) {
          return callback(null, true);
        }
        if (allowedOrigins.includes(origin)) return callback(null, true);
        callback(new Error('Not allowed by CORS'));
      },
      credentials: true,
    },
  });

  initializeTerminalSocket(io);

  startServer().then(() => {
    httpServer.listen(PORT, () => {
      console.log(`🚀 HARVOX AI server running on port ${PORT}`);
      if (!isAIConfigured()) {
        console.warn('⚠️  Warning: GROQ_API_KEY not set — AI features will fail');
      }
    });

    httpServer.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use.`);
        process.exit(1);
      } else {
        throw err;
      }
    });
  });

  process.on('uncaughtException', (err) => {
    if (
      err.message &&
      (err.message.includes('AttachConsole') ||
        err.message.includes('conpty') ||
        err.message.includes('forEach'))
    ) {
      console.warn('[PTY] Caught node-pty Windows error (non-fatal):', err.message);
    } else {
      console.error('[FATAL] Uncaught exception:', err);
      process.exit(1);
    }
  });
} else {
  // In Vercel serverless functions, only connect DB and trigger seed
  startServer();
}

export default app;
