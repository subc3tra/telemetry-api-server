import type { TelemetryPacket } from '../types';

interface Props {
  telemetry: TelemetryPacket | null;
}

function tempColor(temp: number): string {
  if (temp < 60) return '#4fc3f7';
  if (temp < 80) return '#00ff88';
  if (temp < 100) return '#ffcc00';
  return '#ff3333';
}

function wearColor(wear: number): string {
  if (wear < 0.2) return '#00ff88';
  if (wear < 0.5) return '#ffcc00';
  return '#ff3333';
}

interface CornerProps {
  label: string;
  surface: number;
  carcass: number;
  inside: number;
  middle: number;
  outside: number;
  pressure: number;
  wear: number;
  damage: number;
}

function TyreCorner({ label, surface, carcass, inside, middle, outside, pressure, wear, damage }: CornerProps) {
  return (
    <div className="tyre-corner">
      <div className="tyre-corner-label">{label}</div>
      <div className="tyre-temps">
        <div className="tyre-temp-row">
          <span className="tyre-temp-key">SURFACE</span>
          <span className="tyre-temp-val" style={{ color: tempColor(surface) }}>{surface.toFixed(1)}°</span>
        </div>
        <div className="tyre-temp-row">
          <span className="tyre-temp-key">CARCASS</span>
          <span className="tyre-temp-val" style={{ color: tempColor(carcass) }}>{carcass.toFixed(1)}°</span>
        </div>
        <div className="tyre-temp-divider" />
        <div className="tyre-temp-row">
          <span className="tyre-temp-key">INNER</span>
          <span className="tyre-temp-val" style={{ color: tempColor(inside) }}>{inside.toFixed(1)}°</span>
        </div>
        <div className="tyre-temp-row">
          <span className="tyre-temp-key">MID</span>
          <span className="tyre-temp-val" style={{ color: tempColor(middle) }}>{middle.toFixed(1)}°</span>
        </div>
        <div className="tyre-temp-row">
          <span className="tyre-temp-key">OUTER</span>
          <span className="tyre-temp-val" style={{ color: tempColor(outside) }}>{outside.toFixed(1)}°</span>
        </div>
        <div className="tyre-temp-divider" />
        <div className="tyre-temp-row">
          <span className="tyre-temp-key">PRESSURE</span>
          <span className="tyre-temp-val">{pressure.toFixed(1)} psi</span>
        </div>
        <div className="tyre-temp-row">
          <span className="tyre-temp-key">WEAR</span>
          <span className="tyre-temp-val" style={{ color: wearColor(wear) }}>{(wear * 100).toFixed(1)}%</span>
        </div>
        <div className="tyre-temp-row">
          <span className="tyre-temp-key">DAMAGE</span>
          <span className="tyre-temp-val" style={{ color: damage > 0 ? '#ff3333' : '#555' }}>{(damage * 100).toFixed(1)}%</span>
        </div>
      </div>
    </div>
  );
}

export function TyrePanel({ telemetry }: Props) {
  if (!telemetry) {
    return <div className="no-data">Waiting for tyre data...</div>;
  }

  return (
    <div className="tyre-panel">
      <div className="tyre-compound-row">
        <span className="info-label">COMPOUND</span>
        <span className="info-value">{telemetry.TyreCompound}</span>
        <span className="info-label" style={{ marginLeft: '2rem' }}>SET</span>
        <span className="info-value">{telemetry.Tyreset}</span>
      </div>
      <div className="tyre-grid">
        <TyreCorner
          label="FRONT LEFT"
          surface={telemetry.TyreTemperatureFrontLeft}
          carcass={telemetry.TyreCarcassTemperatureFrontLeft}
          inside={telemetry.FrontLeftInside}
          middle={telemetry.FrontLeftMiddle}
          outside={telemetry.FrontLeftOutside}
          pressure={telemetry.TyrePressureFrontLeft}
          wear={telemetry.TyreWearFrontLeft}
          damage={telemetry.TyreDamageFrontLeft}
        />
        <TyreCorner
          label="FRONT RIGHT"
          surface={telemetry.TyreTemperatureFrontRight}
          carcass={telemetry.TyreCarcassTemperatureFrontRight}
          inside={telemetry.FrontRightInside}
          middle={telemetry.FrontRightMiddle}
          outside={telemetry.FrontRightOutside}
          pressure={telemetry.TyrePressureFrontRight}
          wear={telemetry.TyreWearFrontRight}
          damage={telemetry.TyreDamageFrontRight}
        />
        <TyreCorner
          label="REAR LEFT"
          surface={telemetry.TyreTemperatureRearLeft}
          carcass={telemetry.TyreCarcassTemperatureRearLeft}
          inside={telemetry.RearLeftInside}
          middle={telemetry.RearLeftMiddle}
          outside={telemetry.RearLeftOutside}
          pressure={telemetry.TyrePressureRearLeft}
          wear={telemetry.TyreWearRearLeft}
          damage={telemetry.TyreDamageRearLeft}
        />
        <TyreCorner
          label="REAR RIGHT"
          surface={telemetry.TyreTemperatureRearRight}
          carcass={telemetry.TyreCarcassTemperatureRearRight}
          inside={telemetry.RearRightInside}
          middle={telemetry.RearRightMiddle}
          outside={telemetry.RearRightOutside}
          pressure={telemetry.TyrePressureRearRight}
          wear={telemetry.TyreWearRearRight}
          damage={telemetry.TyreDamageRearRight}
        />
      </div>
    </div>
  );
}
