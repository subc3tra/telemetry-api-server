import http from 'http';
import { TelemetryPacket, AiDriver } from './types';
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
let latestAiData: AiDriver[] | null = null

setInterval(async () => {
  const telemetryData = await fetchTelemetry<TelemetryPacket>('/JSON/telemetrypacket');
  const aiData = await fetchTelemetry<AiDriver[]>('/JSON/aidata');
  latestTelemetry = telemetryData;
  latestAiData = aiData;

  enginners.forEach(ws => {
    ws.send(JSON.stringify({
      latestTelemetry,
      latestAiData
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