import { Router } from 'express';
import { TelemetryPacket, AiDriver } from './types';
const router = Router();

// Just place holder until the fetcher is created
let latestTelemetry: TelemetryPacket | null = null;
let latestAiData: AiDriver[] | null = null;

router.get('/health', (_req, res) => {
  /** Placeholder */
  console.log('Placeholder for health check');
  res.status(200).json('Placeholder for health check');
})

router.get('/telemetry', (_req, res) => {
  res.status(200).json(latestTelemetry);
});

router.get('/aidata', (_req, res) => {
  res.status(200).json(latestAiData);
});

export default router;