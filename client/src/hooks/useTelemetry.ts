import { useEffect, useRef, useState } from 'react';
import type { AiDriver, StintData, TelemetryPacket, WsMessage } from '../types';

type ConnectionStatus = 'connecting' | 'connected' | 'disconnected';

const EMPTY_STINT_DATA: StintData = { current: null, completed: [], totalPitTimeMs: 0 };

export function useTelemetry() {
  const [telemetry, setTelemetry] = useState<TelemetryPacket | null>(null);
  const [aiData, setAiData] = useState<AiDriver[] | null>(null);
  const [stintData, setStintData] = useState<StintData>(EMPTY_STINT_DATA);
  const [status, setStatus] = useState<ConnectionStatus>('connecting');
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    function connect() {
      const wsUrl = import.meta.env.DEV
        ? 'ws://localhost:3000'
        : `ws://${window.location.host}`;

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => setStatus('connected');

      ws.onmessage = (event) => {
        const msg: WsMessage = JSON.parse(event.data);
        setTelemetry(msg.latestTelemetry);
        setAiData(msg.latestAiData);
        setStintData(msg.stintData ?? EMPTY_STINT_DATA);
      };

      ws.onclose = () => {
        setStatus('disconnected');
        setTimeout(connect, 3000);
      };

      ws.onerror = () => {
        ws.close();
      };
    }

    connect();

    return () => {
      wsRef.current?.close();
    };
  }, []);

  return { telemetry, aiData, stintData, status };
}
