# Telemetry API Server

> ⚠️ **Work in Progress** — This project is under active development. Features may be incomplete, APIs may change, and things might break.

A real-time sim racing telemetry relay for Le Mans Ultimate (LMU). Streams live car data from the driver's PC to engineer browsers via WebSocket — no software install needed on the engineer's end, just a URL.

## How It Works

```
Driver's PC (LMU + Telemetry Tool)
      │
      │  HTTP feed polled over WireGuard VPN
      │
      ▼
VPS (Node.js API server)
      │
      │  WebSocket broadcast
      │
      ▼
Engineer's browser (React dashboard)
```

The [Telemetry Tool](https://www.overtake.gg/downloads/telemetry-tool-for-f1-25-and-many-other-games.77557/) exposes live telemetry via a built-in HTTP server. This API server polls that feed every 200ms over a WireGuard tunnel and broadcasts the data to all connected browsers via WebSocket.

## Data

**141 data channels** across two endpoints:

- **Telemetry Packet** (95 fields) — detailed driver car data: speed, RPM, tire temps/pressures/wear, brake temps, suspension, fuel, G-forces, car position, and more
- **AI Data** (46 fields per car) — full grid: positions, gaps, sector times, pit strategy, live inputs, track positions

## Stack

- **Backend:** Node.js, TypeScript, Express, WebSocket (ws)
- **Frontend:** React, TypeScript
- **Network:** WireGuard VPN
- **Deployment:** PM2, Nginx, Cloudflare, Hostinger VPS

## Status

- [x] WireGuard VPN tunnel between driver and VPS
- [x] HTTP fetcher polling Telemetry Tool endpoints
- [x] Express server with REST API
- [x] WebSocket broadcasting to connected clients
- [x] React frontend with live data display
- [x] Stint data calculations (server-side)
- [x] Deployed and running live
- [ ] Refactor server.ts into separate modules
- [ ] Config module with environment variables
- [ ] Dashboard — tire overview, fuel/energy panel, track map
- [ ] Multi-driver support
- [ ] Session recording and post-race analysis

## Setup

### Prerequisites

- Node.js 22+
- WireGuard installed on VPS and driver's PC
- Telemetry Tool with HTTP feed enabled

### Server

```bash
cd telemetry-api-server
npm install
npm run build
npm start
```

### Client

```bash
cd client
npm install
npm run build
npm run preview -- --host
```

## License

This project is not yet licensed.