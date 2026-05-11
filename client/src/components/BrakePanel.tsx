import type { TelemetryPacket } from '../types';

interface Props {
  telemetry: TelemetryPacket | null;
}

function brakeColor(temp: number): string {
  if (temp < 200) return '#4fc3f7';
  if (temp < 400) return '#00ff88';
  if (temp < 600) return '#ffcc00';
  if (temp < 800) return '#ff8800';
  return '#ff3333';
}

interface CornerStatProps {
  label: string;
  value: number;
  unit: string;
  color?: string;
}

function CornerStat({ label, value, unit, color }: CornerStatProps) {
  return (
    <div className="corner-stat">
      <span className="corner-stat-label">{label}</span>
      <span className="corner-stat-value" style={{ color: color ?? '#ccc' }}>
        {value.toFixed(1)}<span className="corner-stat-unit">{unit}</span>
      </span>
    </div>
  );
}

interface CornerCardProps {
  label: string;
  brakeTemp: number;
  suspPos: number;
  suspVel: number;
  load: number;
}

function CornerCard({ label, brakeTemp, suspPos, suspVel, load }: CornerCardProps) {
  return (
    <div className="corner-card">
      <div className="corner-card-label">{label}</div>
      <CornerStat label="BRAKE TEMP" value={brakeTemp} unit="°C" color={brakeColor(brakeTemp)} />
      <CornerStat label="SUSP POS" value={suspPos} unit="mm" />
      <CornerStat label="SUSP VEL" value={suspVel} unit="mm/s" />
      <CornerStat label="LOAD" value={load} unit="N" />
    </div>
  );
}

export function BrakePanel({ telemetry }: Props) {
  if (!telemetry) {
    return <div className="no-data">Waiting for brake data...</div>;
  }

  return (
    <div className="brake-panel">
      <div className="corner-grid">
        <CornerCard
          label="FRONT LEFT"
          brakeTemp={telemetry.BrakeTemperatureFrontLeft}
          suspPos={telemetry.SuspensionPositionFrontLeft}
          suspVel={telemetry.SuspensionVelocityFrontLeft}
          load={telemetry.LoadFrontLeft}
        />
        <CornerCard
          label="FRONT RIGHT"
          brakeTemp={telemetry.BrakeTemperatureFrontRight}
          suspPos={telemetry.SuspensionPositionFrontRight}
          suspVel={telemetry.SuspensionVelocityFrontRight}
          load={telemetry.LoadFrontRight}
        />
        <CornerCard
          label="REAR LEFT"
          brakeTemp={telemetry.BrakeTemperatureRearLeft}
          suspPos={telemetry.SuspensionPositionRearLeft}
          suspVel={telemetry.SuspensionVelocityRearLeft}
          load={telemetry.LoadRearLeft}
        />
        <CornerCard
          label="REAR RIGHT"
          brakeTemp={telemetry.BrakeTemperatureRearRight}
          suspPos={telemetry.SuspensionPositionRearRight}
          suspVel={telemetry.SuspensionVelocityRearRight}
          load={telemetry.LoadRearRight}
        />
      </div>

      <div className="ride-height-row">
        <div className="info-card">
          <span className="info-label">FRONT RIDE HEIGHT</span>
          <span className="info-value">{telemetry.FrontRideHeight.toFixed(1)} mm</span>
        </div>
        <div className="info-card">
          <span className="info-label">REAR RIDE HEIGHT</span>
          <span className="info-value">{telemetry.RearRideHeight.toFixed(1)} mm</span>
        </div>
        <div className="info-card">
          <span className="info-label">TORQUE</span>
          <span className="info-value">{telemetry.Torque.toFixed(0)} Nm</span>
        </div>
      </div>
    </div>
  );
}
