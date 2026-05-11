import http from 'http';
import { TelemetryPacket, AiDriver, CompletedStint, CurrentStint, StintData, StintCorners } from './types';
import express from 'express';
import path from 'path';
import { WebSocketServer, WebSocket } from 'ws';

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

app.use(express.json());
app.use(express.static('public'));

/** Websocket */
let enginners: WebSocket[] = [];

wss.on('connection', (ws) => {
  console.log('Enginner connected');
  enginners.push(ws);

  ws.on('close', () => {
    const index = enginners.indexOf(ws);
    if (index !== -1) {
      enginners.splice(index, 1);
    }
  });
});

/** Routes */

app.get('/api/health', async (_req, res) => {
  /** Placeholder */
  console.log('Placeholder for health check');
  res.status(200).json('Placeholder for health check');
})

app.get('/api/telemetry', async (_req, res) => {
  res.status(200).json(latestTelemetry);
});

app.get('/api/aidata', async (_req, res) => {
  
  res.status(200).json(latestAiData);
});

app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

/** Function will be separetade later */

let latestTelemetry: TelemetryPacket | null = null;
let latestAiData: AiDriver[] | null = null;

// ── Stint tracker ──────────────────────────────────────────────

interface StintState {
  startTimeMs: number;
  startLap: number;
  startFuel: number;
  startVE: number;
  startDistance: number;
  startPressures: StintCorners;
  startWear: StintCorners;
  maxSpeed: number;
  speedSum: number;
  speedCount: number;
  pressureSums: StintCorners;
  pressureCount: number;
}

let prevInPits: number | null = null;
let stintState: StintState | null = null;
let completedStints: CompletedStint[] = [];
let pitEntryTimeMs: number | null = null;
let totalPitTimeMs = 0;

function cornersFromTelemetry(t: TelemetryPacket, key: 'Pressure' | 'Wear'): StintCorners {
  if (key === 'Pressure') {
    return { fl: t.TyrePressureFrontLeft, fr: t.TyrePressureFrontRight, rl: t.TyrePressureRearLeft, rr: t.TyrePressureRearRight };
  }
  return { fl: t.TyreWearFrontLeft, fr: t.TyreWearFrontRight, rl: t.TyreWearRearLeft, rr: t.TyreWearRearRight };
}

function updateStint(t: TelemetryPacket): StintData {
  const now = Date.now();
  const isFirst = prevInPits === null;

  const exitedPits  = !isFirst && prevInPits === 1 && t.InPits === 0;
  const enteredPits = !isFirst && prevInPits === 0 && t.InPits === 1;

  if (enteredPits && stintState !== null) {
    // Snapshot the just-finished stint; pitDurationMs filled when car exits next
    completedStints.push({
      stintNumber: completedStints.length + 1,
      startLap:    stintState.startLap,
      endLap:      t.Lap,
      durationMs:  now - stintState.startTimeMs,
      pitDurationMs: 0,
      tyreSet:     t.Tyreset,
    });
    pitEntryTimeMs = now;
  }

  if (isFirst || exitedPits) {
    // Fill pit duration of the previous completed stint
    if (exitedPits && pitEntryTimeMs !== null && completedStints.length > 0) {
      const pitDuration = now - pitEntryTimeMs;
      completedStints[completedStints.length - 1].pitDurationMs = pitDuration;
      totalPitTimeMs += pitDuration;
      pitEntryTimeMs = null;
    }

    stintState = {
      startTimeMs:    now,
      startLap:       t.Lap,
      startFuel:      t.FuelRemaining,
      startVE:        t.Extra2,
      startDistance:  t.TotalDistance,
      startPressures: cornersFromTelemetry(t, 'Pressure'),
      startWear:      cornersFromTelemetry(t, 'Wear'),
      maxSpeed:       t.Speed,
      speedSum:       t.Speed,
      speedCount:     1,
      pressureSums:   cornersFromTelemetry(t, 'Pressure'),
      pressureCount:  1,
    };
  } else if (!enteredPits && stintState !== null) {
    stintState.maxSpeed   = Math.max(stintState.maxSpeed, t.Speed);
    stintState.speedSum  += t.Speed;
    stintState.speedCount += 1;
    stintState.pressureSums.fl += t.TyrePressureFrontLeft;
    stintState.pressureSums.fr += t.TyrePressureFrontRight;
    stintState.pressureSums.rl += t.TyrePressureRearLeft;
    stintState.pressureSums.rr += t.TyrePressureRearRight;
    stintState.pressureCount += 1;
  }

  prevInPits = t.InPits;

  // Build current stint snapshot for broadcast
  let current: CurrentStint | null = null;
  if (stintState !== null) {
    const s      = stintState;
    const distM  = t.TotalDistance - s.startDistance;
    // Use distance-based fractional laps — avoids the "divided by 1 lap" inflation
    // when only a fraction of the first lap has been driven since pit exit.
    // Fall back to integer laps if TrackLength is unavailable.
    const laps   = t.TrackLength > 0
      ? Math.max(0.05, distM / t.TrackLength)
      : Math.max(1, t.Lap - s.startLap);
    const fuel   = Math.max(0, s.startFuel - t.FuelRemaining);
    const nrg    = Math.max(0, s.startVE - t.Extra2);
    const pc     = s.pressureCount;
    const sw     = s.startWear;
    const inPits = t.InPits === 1;
    const pitMs  = inPits && pitEntryTimeMs !== null ? now - pitEntryTimeMs : 0;

    current = {
      stintNumber:          completedStints.length + 1,
      tyreSet:              t.Tyreset,
      startLap:             s.startLap,
      currentLap:           t.Lap,
      durationMs:           now - s.startTimeMs,
      inPits,
      currentPitDurationMs: pitMs,
      avgSpeed:             s.speedSum / s.speedCount,
      maxSpeed:             s.maxSpeed,
      distanceM:            distM,
      fuelUsed:             fuel,
      fuelPerLap:           fuel / laps,
      nrgUsed:              nrg,
      nrgPerLap:            nrg / laps,
      pressures: {
        start: s.startPressures,
        now:   cornersFromTelemetry(t, 'Pressure'),
        avg:   { fl: s.pressureSums.fl / pc, fr: s.pressureSums.fr / pc, rl: s.pressureSums.rl / pc, rr: s.pressureSums.rr / pc },
      },
      wear: {
        now:    cornersFromTelemetry(t, 'Wear'),
        perLap: {
          fl: (t.TyreWearFrontLeft  - sw.fl) / laps,
          fr: (t.TyreWearFrontRight - sw.fr) / laps,
          rl: (t.TyreWearRearLeft   - sw.rl) / laps,
          rr: (t.TyreWearRearRight  - sw.rr) / laps,
        },
      },
    };
  }

  return { current, completed: completedStints, totalPitTimeMs };
}

// ──────────────────────────────────────────────────────────────

setInterval(async () => {
  const telemetryData = await fetchTelemetry<TelemetryPacket>('/JSON/telemetrypacket');
  const aiData = await fetchTelemetry<AiDriver[]>('/JSON/aidata');
  latestTelemetry = telemetryData;
  latestAiData = aiData;

  const stintData = latestTelemetry ? updateStint(latestTelemetry) : { current: null, completed: [], totalPitTimeMs: 0 };

  enginners.forEach(ws => {
    ws.send(JSON.stringify({
      latestTelemetry,
      latestAiData,
      stintData,
    }));
  });
}, 200);


function fetchTelemetry<T>(path: string): Promise<T | null> {

  const options = {
    hostname: 'localhost',
    port: 8002,
    path: path,
    method: 'GET'
  }

  return new Promise((resolve) => {
    const req = http.request(options, (res) => {
      let data ='';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if(res.statusCode !== 200) {
          console.log('Bad response:', res.statusCode);
          resolve(null);
          return;
        }

        try {
          const parsed = JSON.parse(data) as T;
          resolve(parsed);
        } catch {
          console.log('Response was not valid JSON');
          resolve(null)
        }
        
      })
    });

    req.on('error', (err) => {
      console.log('Connection failed', err.message)
      resolve(null)
    })

    req.end();
  })
}


server.listen(3000, () => {
  console.log('Server is running!')
});