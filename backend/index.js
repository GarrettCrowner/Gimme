// backend/index.js
require('dotenv').config();

// ── Startup safety checks ──────────────────────────────────────────────────
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('FATAL: JWT_SECRET environment variable is not set.');
  process.exit(1);
}
if (JWT_SECRET.length < 32) {
  console.error('FATAL: JWT_SECRET must be at least 32 characters long.');
  console.error('Generate one with: openssl rand -base64 32');
  process.exit(1);
}

const http = require('http');
const app  = require('./app');
const { attachWebSocketServer } = require('./ws/roundSync');

const PORT       = process.env.PORT || 3000;
const httpServer = http.createServer(app);

attachWebSocketServer(httpServer);

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🔌 WebSocket ready on ws://localhost:${PORT}/ws`);
  console.log(`🌍 NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
});
