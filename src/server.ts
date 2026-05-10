// src/server.ts
//
// Main entry point. This ties together:
//   - Express (serves React frontend + REST endpoints)
//   - Broadcaster (WebSocket connections to engineer browsers)
//   - Fetcher (polls Telemetry Tool over WireGuard)
//   - Config (environment variables)
//
// The flow:
//   1. Express serves the React app and API endpoints
//   2. Polling loop fetches from the Telemetry Tool every 200ms
//   3. Broadcaster pushes new data to all connected browsers

import express from 'express';
import http from 'http';
import path from 'path';

import { loadConfig } from './config';
import { fetchTelemetry, fetchAiData, FetcherConfig } from './fetcher';
import { Broadcaster } from './broadcaster';
import { HealthResponse, TelemetryPacket, AiDriver } from './types';

// --- Load config ---
const config = loadConfig();

// --- Express app ---
const app = express();

// Serve React build output from the public folder.
// After building the React app, copy the output here.
app.use(express.static(path.join(__dirname, '..', 'public')));

// Health check — useful for monitoring
app.get('/api/health', (_req, res) => {
  const health: HealthResponse = {
    status: 'ok',
    driverConnected: broadcaster.hasData,
    engineersConnected: broadcaster.clientCount,
    uptime: process.uptime(),
  };
  res.json(health);
});

// Latest telemetry snapshot — HTTP fallback for polling
app.get('/api/telemetry', (_req, res) => {
  if (latestTelemetry) {
    res.json(latestTelemetry);
  } else {
    res.status(503).json({ error: 'No telemetry data available' });
  }
});

// Latest AI data snapshot — HTTP fallback
app.get('/api/aidata', (_req, res) => {
  if (latestAiData) {
    res.json(latestAiData);
  } else {
    res.status(503).json({ error: 'No AI data available' });
  }
});

// Catch-all: serve the React app for client-side routing
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// --- HTTP + WebSocket server ---
const server = http.createServer(app);
const broadcaster = new Broadcaster(server);

// --- State ---
let latestTelemetry: TelemetryPacket | null = null;
let latestAiData: AiDriver[] | null = null;

// --- Polling ---
const fetcherConfig: FetcherConfig = {
  host: config.telemetryHost,
  port: config.telemetryPort,
  timeout: config.fetchTimeout,
};

let isPolling = false;
let driverWasConnected = false;

async function poll(): Promise<void> {
  // Prevent overlapping polls if the previous one is still running
  if (isPolling) return;
  isPolling = true;

  try {
    // Fetch both endpoints in parallel
    const [telemetry, aidata] = await Promise.all([
      fetchTelemetry(fetcherConfig),
      fetchAiData(fetcherConfig),
    ]);

    const driverConnected = telemetry !== null || aidata !== null;

    // Log connection state changes (not every poll)
    if (driverConnected && !driverWasConnected) {
      console.log('[POLL] Driver connected — telemetry data flowing');
    } else if (!driverConnected && driverWasConnected) {
      console.log('[POLL] Driver disconnected — no telemetry data');
    }
    driverWasConnected = driverConnected;

    if (driverConnected) {
      // Update stored state
      if (telemetry) latestTelemetry = telemetry;
      if (aidata) latestAiData = aidata;

      // Broadcast to all connected engineers
      broadcaster.update(latestTelemetry, latestAiData);
    } else if (!driverConnected && !driverWasConnected) {
      // Only send offline status occasionally, not every cycle
      broadcaster.notifyDriverOffline();
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[POLL] Unexpected error:', message);
  } finally {
    isPolling = false;
  }
}

// Start polling
setInterval(poll, config.pollInterval);

// --- Start server ---
server.listen(config.serverPort, '0.0.0.0', () => {
  console.log(`[SERVER] Telemetry API running on port ${config.serverPort}`);
  console.log(`[SERVER] Polling ${config.telemetryHost}:${config.telemetryPort} every ${config.pollInterval}ms`);
  console.log(`[SERVER] WebSocket ready for engineer connections`);
});