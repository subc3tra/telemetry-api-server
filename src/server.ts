import http from 'http';
import { TelemetryPacket, AiDriver } from './types';
import express from 'express';

const app = express();

app.use(express.json());
app.use(express.static('public'));

/** Routes */

app.get('/api/health', async (_req, res) => {
  /** Placeholder */
  console.log('Placeholder for health check');
  res.status(200).json('Placeholder for health check');
})

app.get('/api/telemetry', async (_req, res) => {
 const telemetryData = await fetchTelemetry<TelemetryPacket>('/JSON/telemetrypacket');
 res.status(200).json(telemetryData);
});

app.get('/api/aidata', async (_req, res) => {
  const aiData = await fetchTelemetry<AiDriver[]>('/JSON/aidata');
  res.status(200).json(aiData);
});

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
          console.log("Data parsed");
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

async function main() {
  const telemetryPacket = await fetchTelemetry<TelemetryPacket>('/JSON/telemetrypacket');
  const aiData = await fetchTelemetry<AiDriver[]>('/JSON/aidata');
  console.log(telemetryPacket);
  console.log(aiData);
}

app.listen(3000, () => {
  console.log('Server is running!')
});