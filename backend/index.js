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

const http   = require('http');
const fs     = require('fs');
const path   = require('path');
const app    = require('./app');
const { query } = require('./config/db');
const { attachWebSocketServer } = require('./ws/roundSync');

// ── Auto-migration on startup ──────────────────────────────────────────────
async function runMigration() {
  try {
    // Look for migration file relative to project root (works both locally and on Railway)
    const migrationPaths = [
      path.join(__dirname, '../database/001_init.sql'),
      path.join(__dirname, 'database/001_init.sql'),
      path.join(process.cwd(), 'database/001_init.sql'),
    ];

    let sql = null;
    for (const p of migrationPaths) {
      if (fs.existsSync(p)) {
        sql = fs.readFileSync(p, 'utf8');
        console.log(`📦 Running migration from: ${p}`);
        break;
      }
    }

    if (!sql) {
      console.warn('⚠️  Migration file not found — skipping. Tables must already exist.');
      return;
    }

    await query(sql);
    console.log('✅ Migration complete.');
  } catch (err) {
    // IF statements already exist, postgres throws an error we can safely ignore
    if (err.message.includes('already exists')) {
      console.log('✅ Tables already exist — skipping migration.');
    } else {
      console.error('❌ Migration error:', err.message);
      // Don't crash — tables may already exist from a previous deploy
    }
  }
}

// ── Start server ───────────────────────────────────────────────────────────
async function start() {
  await runMigration();

  const PORT       = process.env.PORT || 3000;
  const httpServer = http.createServer(app);

  attachWebSocketServer(httpServer);

  httpServer.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`🔌 WebSocket ready on ws://localhost:${PORT}/ws`);
    console.log(`🌍 NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
  });
}

start();
 
