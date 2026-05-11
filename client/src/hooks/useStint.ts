import { useEffect, useRef, useState } from 'react';
import type { TelemetryPacket } from '../types';

interface Pressures { fl: number; fr: number; rl: number; rr: number }
interface Wear      { fl: number; fr: number; rl: number; rr: number }

interface StintState {
  stintNumber: number;
  startTime: number;
  startLap: number;
  startFuel: number;
  startVE: number;
  startDistance: number;
  startPressures: Pressures;
  startWear: Wear;
  maxSpeed: number;
  speedSum: number;
  speedCount: number;
  pressureSums: Pressures;
  pressureCount: number;
}

export interface StintInfo {
  stintNumber: number;
  tyreSet: number;
  avgSpeed: number;
  maxSpeed: number;
  distanceM: number;
  durationMs: number;
  fuelUsed: number;
  fuelPerLap: number;
  nrgUsed: number;
  nrgPerLap: number;
  pressures: { start: Pressures; now: Pressures; avg: Pressures };
  wear: { now: Wear; perLap: Wear };
}

function pressuresFrom(t: TelemetryPacket): Pressures {
  return {
    fl: t.TyrePressureFrontLeft,
    fr: t.TyrePressureFrontRight,
    rl: t.TyrePressureRearLeft,
    rr: t.TyrePressureRearRight,
  };
}

function wearFrom(t: TelemetryPacket): Wear {
  return {
    fl: t.TyreWearFrontLeft,
    fr: t.TyreWearFrontRight,
    rl: t.TyreWearRearLeft,
    rr: t.TyreWearRearRight,
  };
}

export function useStint(telemetry: TelemetryPacket | null): StintInfo | null {
  const stateRef     = useRef<StintState | null>(null);
  const prevInPits   = useRef<number>(0);
  const [info, setInfo] = useState<StintInfo | null>(null);

  useEffect(() => {
    if (!telemetry) return;

    const now = Date.now();
    const exitedPits = prevInPits.current === 1 && telemetry.InPits === 0;
    const isFirst    = stateRef.current === null;

    if (isFirst || exitedPits) {
      stateRef.current = {
        stintNumber:    isFirst ? 1 : stateRef.current!.stintNumber + 1,
        startTime:      now,
        startLap:       telemetry.Lap,
        startFuel:      telemetry.FuelRemaining,
        startVE:        telemetry.Extra2,
        startDistance:  telemetry.TotalDistance,
        startPressures: pressuresFrom(telemetry),
        startWear:      wearFrom(telemetry),
        maxSpeed:       telemetry.Speed,
        speedSum:       telemetry.Speed,
        speedCount:     1,
        pressureSums:   pressuresFrom(telemetry),
        pressureCount:  1,
      };
    } else {
      const s = stateRef.current!;
      s.maxSpeed = Math.max(s.maxSpeed, telemetry.Speed);
      s.speedSum    += telemetry.Speed;
      s.speedCount  += 1;
      s.pressureSums.fl += telemetry.TyrePressureFrontLeft;
      s.pressureSums.fr += telemetry.TyrePressureFrontRight;
      s.pressureSums.rl += telemetry.TyrePressureRearLeft;
      s.pressureSums.rr += telemetry.TyrePressureRearRight;
      s.pressureCount += 1;
    }

    prevInPits.current = telemetry.InPits;

    const s = stateRef.current!;
    const laps     = Math.max(1, telemetry.Lap - s.startLap);
    const fuelUsed = Math.max(0, s.startFuel - telemetry.FuelRemaining);
    const nrgUsed  = Math.max(0, s.startVE - telemetry.Extra2);
    const pc       = s.pressureCount;
    const sw       = s.startWear;

    setInfo({
      stintNumber: s.stintNumber,
      tyreSet:     telemetry.Tyreset,
      avgSpeed:    s.speedSum / s.speedCount,
      maxSpeed:    s.maxSpeed,
      distanceM:   telemetry.TotalDistance - s.startDistance,
      durationMs:  now - s.startTime,
      fuelUsed,
      fuelPerLap:  fuelUsed / laps,
      nrgUsed,
      nrgPerLap:   nrgUsed / laps,
      pressures: {
        start: s.startPressures,
        now:   pressuresFrom(telemetry),
        avg: {
          fl: s.pressureSums.fl / pc,
          fr: s.pressureSums.fr / pc,
          rl: s.pressureSums.rl / pc,
          rr: s.pressureSums.rr / pc,
        },
      },
      wear: {
        now: wearFrom(telemetry),
        perLap: {
          fl: (telemetry.TyreWearFrontLeft  - sw.fl) / laps,
          fr: (telemetry.TyreWearFrontRight - sw.fr) / laps,
          rl: (telemetry.TyreWearRearLeft   - sw.rl) / laps,
          rr: (telemetry.TyreWearRearRight  - sw.rr) / laps,
        },
      },
    });
  }, [telemetry]);

  return info;
}
