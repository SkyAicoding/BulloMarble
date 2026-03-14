# 🐂 BulloMarble

> **Bull** (rising market) × **Marble** (the globe)
> Travel the world and build your economic empire.

A real-time multiplayer board game where 2–6 players race around a 40-space world landmark board, acquiring properties, collecting rent, and building skyscrapers to become the wealthiest investor.

---

## Play

🌐 **Live:** https://BulloMarble.up.railway.app

---

## Game Modes

| Mode | Description |
|------|-------------|
| **Local Play** | 2–6 players take turns on the same device (hot-seat) |
| **Online Play** | Each player connects from their own device via room code |

---

## Online Play — Room System

- **Create Room** — Open a public or private room, set max players (2–6)
- **Browse Rooms** — See all waiting rooms in real time
- **Join by Code** — Enter a 6-digit room code directly
- **Private Rooms** — Visible in the list but require the host's code to enter

---

## Tech Stack

- **Frontend:** Vanilla JS (ES modules), CSS3
- **Backend:** Node.js + Express + Socket.io
- **Deploy:** Railway.app

---

## Local Development

```bash
npm install
npm start
# → http://localhost:3000
```

---

## Deploy to Railway

1. Push this repo to GitHub
2. Create a new Railway project → **Deploy from GitHub repo**
3. Railway auto-detects `railway.toml` and runs `node server.js`
4. Go to **Settings → Networking → Generate Domain**
5. Set the service name to **BulloMarble** → URL becomes `https://BulloMarble.up.railway.app`

Environment variables: none required (PORT is set automatically by Railway).
