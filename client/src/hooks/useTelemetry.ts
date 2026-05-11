import { useEffect, useRef, useState } from 'react';
import type { AiDriver, TelemetryPacket, WsMessage } from '../types';

type ConnectionStatus = 'connecting' | 'connected' | 'disconnected';

export function useTelemetry() {
  const [telemetry, setTelemetry] = useState<TelemetryPacket | null>(null);
  const [aiData, setAiData] = useState<AiDriver[] | null>(null);
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

  return { telemetry, aiData, status };
}
