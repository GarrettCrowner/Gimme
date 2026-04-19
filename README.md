# ⛳ Skins Tracker

Track sandies, poleys, barkies, greenies, splashies, birdies, eagles, and stroke play with your golf crew. Mobile-first PWA with live WebSocket sync, push notifications, and automatic settlement.

---

## File Structure

```
skins-tracker/
├── .env.example
├── .gitignore
├── package.json                        # root scripts: dev, setup, migrate
├── README.md
│
├── frontend/                           # Vanilla JS + Vite
│   ├── Dockerfile                      # multi-stage: Vite build → nginx
│   ├── .dockerignore
│   ├── nginx.conf                      # SPA routing + /api and /ws proxy
│   ├── index.html                      # PWA meta, manifest link, SW registration
│   ├── vite.config.js                  # dev proxy for /api and /ws
│   ├── package.json
│   ├── public/
│   │   ├── manifest.json               # PWA manifest
│   │   ├── offline.html                # shown when there's no signal on course
│   │   ├── sw.js                       # service worker: cache + push handler
│   │   └── icons/                      # ← add icon-192.png + icon-512.png here
│   └── src/
│       ├── main.js                     # entry: navbar, tab bar, router
│       ├── api/
│       │   └── client.js               # fetch wrapper (JWT headers, 401 redirect)
│       ├── components/
│       │   ├── navbar.js               # sticky top nav
│       │   ├── tabBar.js               # bottom tab bar for mobile
│       │   ├── leaderboard.js          # reusable leaderboard list
│       │   ├── settlementTable.js      # who-pays-who table
│       │   ├── playerCard.js           # player avatar + handicap display
│       │   ├── holeTracker.js          # 6-col hole grid with score/special indicators
│       │   └── gamesBadge.js           # emoji badge per game type
│       ├── pages/
│       │   ├── login.js                # sign in / register
│       │   ├── home.js                 # round list + new round CTA
│       │   ├── setup.js                # configure round, players, games, stroke indexes
│       │   ├── round.js                # live hole tracker (steppers, specials, WS sync)
│       │   ├── settlement.js           # final standings, payments, scorecard
│       │   ├── stats.js                # all-time earnings, specials, friends
│       │   └── artists.js              # placeholder (concert crew feature)
│       ├── styles/
│       │   ├── base.css                # mobile-first design system, typography, layout
│       │   └── components.css          # navbar, leaderboard, hole grid, chips, etc.
│       └── utils/
│           ├── router.js               # lightweight client-side router
│           ├── scoring.js              # all game logic — pure functions, fully testable
│           ├── helpers.js              # el(), formatCurrency(), formatDate()
│           ├── toast.js                # on-course toast notifications
│           ├── roundSocket.js          # WebSocket client with auto-reconnect + ping
│           └── pwa.js                  # SW registration, install prompt, push subscribe
│
├── backend/                            # Node.js + Express
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── index.js                        # creates HTTP server, attaches WebSocket
│   ├── app.js                          # Express setup — 2 route files mounted
│   ├── package.json
│   ├── config/
│   │   └── db.js                       # PostgreSQL connection pool
│   ├── middleware/
│   │   ├── auth.js                     # JWT verification
│   │   └── errorHandler.js             # global error handler
│   ├── routes/
│   │   ├── users.js                    # auth + friends + push notifications
│   │   └── rounds.js                   # rounds + players + holes + specials +
│   │                                   # reactions + stroke indexes + stats/settlement
│   └── ws/
│       └── roundSync.js                # WebSocket relay + push notification trigger
│
├── database/
│   └── 001_init.sql                    # full PostgreSQL schema (run once)
│
└── docker/
    ├── docker-compose.yml              # production: postgres + backend + frontend(nginx)
    └── docker-compose.dev.yml          # dev overrides: hot reload, ports exposed
```

---

## Quick Start (Local, No Docker)

### Prerequisites
- Node.js 20+
- PostgreSQL 14+

```bash
# 1. Clone
git clone <your-repo> && cd skins-tracker

# 2. Install all dependencies + run DB migration
npm run setup

# 3. Configure environment
cp .env.example backend/.env
# Edit backend/.env — set DB_PASSWORD and JWT_SECRET

# 4. Add PWA icons
# Place 192×192 and 512×512 PNGs at:
# frontend/public/icons/icon-192.png
# frontend/public/icons/icon-512.png

# 5. Run dev servers (hot reload on both)
npm run dev
```

- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:3000
- **WebSocket:** ws://localhost:3000/ws

---

## Docker (Production)

### 1. Create your `.env` file

```bash
cp .env.example .env
```

Edit `.env`:

```env
DB_PASSWORD=supersecretdbpassword
JWT_SECRET=a-long-random-string-at-least-32-chars

# Optional: push notifications
VAPID_EMAIL=you@yourdomain.com
VAPID_PUBLIC_KEY=        # npx web-push generate-vapid-keys
VAPID_PRIVATE_KEY=

CLIENT_URL=https://yourdomain.com
PORT=80
```

### 2. Generate VAPID keys (optional)

```bash
npx web-push generate-vapid-keys
# Paste output into .env
```

### 3. Start

```bash
# Production
docker compose -f docker/docker-compose.yml up -d --build

# Development (hot reload)
docker compose -f docker/docker-compose.yml -f docker/docker-compose.dev.yml up

# Logs
docker compose -f docker/docker-compose.yml logs -f

# Stop
docker compose -f docker/docker-compose.yml down

# Stop + wipe database (destructive)
docker compose -f docker/docker-compose.yml down -v
```

Available at **http://localhost** (or your configured `PORT`).
The DB migration runs automatically on first boot via `initdb.d`.

### Deploying to a VPS

```bash
git clone <your-repo> && cd skins-tracker
cp .env.example .env   # fill in production values
docker compose -f docker/docker-compose.yml up -d --build

# HTTPS with Caddy (easiest):
# Add a Caddyfile: yourdomain.com { reverse_proxy localhost:80 }
```

---

## Games

| Game            | Default | Trigger                                |
|-----------------|---------|----------------------------------------|
| 🏖️ Sandy        | $1      | Up & down from a bunker                |
| 🚩 Poley        | $1      | Putt from outside flagstick length     |
| 🌲 Barkie       | $1      | Par or better after hitting a tree     |
| 🟢 Greenie      | $1      | Closest to pin on a par 3              |
| 💧 Splashy      | $1      | Par or better after water              |
| 🐦 Birdie       | $2      | Auto-detected from scores              |
| 🦅 Eagle        | $5      | Auto-detected from scores              |
| 💰 Stroke Play  | $1/hole | Low net score wins each hole (optional)|

All values configurable per round. All specials stack.

---

## Payout Rules

- **Per special:** every other player pays the achiever
- **Stroke play:** low handicap-adjusted net score wins each hole
  - **Push for one is push for all** — any tie carries the full pot
  - Carry accumulates until one player wins the hole outright
- **Handicaps:** full USGA Course Handicap formula + proper stroke index distribution per hole
- **Settlement:** greedy algorithm minimises the number of payments

---

## API Reference

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Sign in → JWT |
| GET  | `/api/auth/me` | Current user |
| GET  | `/api/friends` | List friends |
| POST | `/api/friends` | Add friend by email |
| DELETE | `/api/friends/:id` | Remove friend |
| POST | `/api/push/subscribe` | Register push subscription |
| GET  | `/api/push/vapid-public-key` | VAPID public key |
| GET  | `/api/rounds` | List rounds |
| POST | `/api/rounds` | Create round |
| GET  | `/api/rounds/:id` | Get round + players + games |
| PATCH | `/api/rounds/:id` | Update round |
| DELETE | `/api/rounds/:id` | Delete round |
| PUT  | `/api/rounds/:id/games` | Set games for round |
| POST | `/api/rounds/:id/players` | Add player |
| PATCH | `/api/rounds/players/:id` | Update player |
| DELETE | `/api/rounds/players/:id` | Remove player |
| GET  | `/api/rounds/:id/holes` | Get hole scores |
| POST | `/api/rounds/:id/holes` | Upsert hole score |
| GET  | `/api/rounds/:id/specials` | Get specials |
| POST | `/api/rounds/:id/specials` | Log special |
| DELETE | `/api/rounds/specials/:id` | Remove special |
| GET  | `/api/rounds/:id/reactions` | Get hole reactions |
| POST | `/api/rounds/:id/reactions` | Log reaction |
| DELETE | `/api/rounds/:id/reactions` | Remove reaction |
| GET  | `/api/rounds/:id/stroke-indexes` | Get stroke indexes |
| PUT  | `/api/rounds/:id/stroke-indexes` | Set stroke indexes |
| GET  | `/api/rounds/stats/me` | Personal all-time stats |
| GET  | `/api/rounds/:id/settlement` | Round settlement |
| POST | `/api/rounds/:id/settlement` | Save settlement |

**WebSocket:** `ws://host/ws?roundId=X&token=JWT`

Events: `SPECIAL_LOGGED` · `SPECIAL_REMOVED` · `SCORE_SAVED` · `ROUND_FINISHED` · `USER_JOINED` · `USER_LEFT` · `PING/PONG`
