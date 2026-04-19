// backend/app.js
const express      = require('express');
const cors         = require('cors');
const helmet       = require('helmet');
const rateLimit    = require('express-rate-limit');
const usersRoutes  = require('./routes/users');
const roundsRoutes = require('./routes/rounds');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// ── Security headers ───────────────────────────────────────────────────────
app.use(helmet({
  // Allow inline scripts needed for the PWA service worker registration
  contentSecurityPolicy: false,
}));

// ── CORS ───────────────────────────────────────────────────────────────────
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map(o => o.trim());

// Allow localhost and local network IPs for dev (192.168.x.x, 10.x.x.x, 172.x.x.x)
const isLocalOrigin = (origin) => {
  if (!origin) return true;
  if (origin.startsWith('http://localhost')) return true;
  if (origin.startsWith('http://127.0.0.1')) return true;
  // Local network ranges — covers phone on same WiFi
  if (/^http:\/\/(192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[01])\.)/.test(origin)) return true;
  return false;
};

app.use(cors({
  origin: (origin, callback) => {
    if (isLocalOrigin(origin)) return callback(null, true);
    if (allowedOrigins.some(o => origin === o)) return callback(null, true);
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));

app.use(express.json({ limit: '10kb' })); // reject suspiciously large payloads

// ── Rate limiting ──────────────────────────────────────────────────────────

// Strict limit on auth endpoints — prevents brute force and account spam
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,                   // 20 attempts per IP per window
  message: { message: 'Too many attempts, please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// General API limit — generous enough for normal use, blocks abuse
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 120,            // 120 requests per IP per minute
  message: { message: 'Too many requests, please slow down.' },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting for health checks
  skip: (req) => req.path === '/api/health',
});

app.use('/api/auth/register', authLimiter);
app.use('/api/auth/login',    authLimiter);
app.use('/api',               apiLimiter);

// ── Routes ─────────────────────────────────────────────────────────────────
app.use('/api', usersRoutes);
app.use('/api/rounds', roundsRoutes);

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.use(errorHandler);

module.exports = app;
