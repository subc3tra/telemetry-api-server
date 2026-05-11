import type { TelemetryPacket } from '../types';

interface Props {
  telemetry: TelemetryPacket | null;
}

function formatTime(seconds: number): string {
  if (!seconds || seconds <= 0) return '—';
  const m = Math.floor(seconds / 60);
  const s = (seconds % 60).toFixed(3).padStart(6, '0');
  return `${m}:${s}`;
}

function InputBar({ value, color }: { value: number; color: string }) {
  const pct = Math.min(100, Math.max(0, value * 100));
  return (
    <div className="input-bar-bg">
      <div className="input-bar-fill" style={{ width: `${pct}%`, background: color }} />
      <span className="input-bar-label">{pct.toFixed(0)}%</span>
    </div>
  );
}

function GForce({ label, value }: { label: string; value: number }) {
  const abs = Math.abs(value);
  const color = abs > 3 ? '#ff3333' : abs > 2 ? '#ffcc00' : '#00ff88';
  return (
    <div className="gforce-item">
      <span className="gforce-label">{label}</span>
      <span className="gforce-value" style={{ color }}>{value.toFixed(2)}g</span>
    </div>
  );
}

export function DriverPanel({ telemetry }: Props) {
  if (!telemetry) {
    return <div className="no-data">Waiting for driver data...</div>;
  }

  const rpmPct = telemetry.MaxRevs > 0
    ? (telemetry.EngineRevs / telemetry.MaxRevs) * 100
    : 0;

  const fuelPct = telemetry.FuelAtStart > 0
    ? (telemetry.FuelRemaining / telemetry.FuelAtStart) * 100
    : 0;

  const fuelColor = fuelPct < 15 ? '#ff3333' : fuelPct < 30 ? '#ffcc00' : '#00ff88';
  const rpmColor = rpmPct > 90 ? '#ff3333' : rpmPct > 75 ? '#ffcc00' : '#00ff88';

  return (
    <div className="driver-panel">

      <div className="driver-top-row">
        <div className="big-stat">
          <span className="big-value">{Math.round(telemetry.Speed)}</span>
          <span className="big-unit">km/h</span>
        </div>
        <div className="big-stat gear-box">
          <span className="big-value gear-value">{telemetry.Gear === 0 ? 'N' : telemetry.Gear === -1 ? 'R' : telemetry.Gear}</span>
        </div>
        <div className="big-stat">
          <span className="big-value" style={{ color: rpmColor }}>{Math.round(telemetry.EngineRevs).toLocaleString()}</span>
          <span className="big-unit">RPM</span>
        </div>
      </div>

      <div className="rpm-bar-wrap">
        <div className="rpm-bar-bg">
          <div className="rpm-bar-fill" style={{ width: `${rpmPct}%`, background: rpmColor }} />
        </div>
        <span className="rpm-bar-label">{rpmPct.toFixed(0)}% of {Math.round(telemetry.MaxRevs / 1000)}k</span>
      </div>

      <div className="inputs-section">
        <div className="input-row">
          <span className="input-label">THROTTLE</span>
          <InputBar value={telemetry.ThrottlePercentage} color="#00ff88" />
        </div>
        <div className="input-row">
          <span className="input-label">BRAKE</span>
          <InputBar value={telemetry.BrakePercentage} color="#ff3333" />
        </div>
        <div className="input-row">
          <span className="input-label">CLUTCH</span>
          <InputBar value={telemetry.Clutch} color="#888" />
        </div>
        <div className="input-row">
          <span className="input-label">STEER</span>
          <div className="steer-bar">
            <div
              className="steer-indicator"
              style={{ left: `${50 + telemetry.Steer * 50}%` }}
            />
          </div>
        </div>
      </div>

      <div className="info-grid">
        <div className="info-card">
          <span className="info-label">LAP</span>
          <span className="info-value">{telemetry.Lap}</span>
        </div>
        <div className="info-card">
          <span className="info-label">POSITION</span>
          <span className="info-value">P{telemetry.RacePosition}</span>
        </div>
        <div className="info-card">
          <span className="info-label">LAP TIME</span>
          <span className="info-value mono">{formatTime(telemetry.LapTime)}</span>
        </div>
        <div className="info-card">
          <span className="info-label">LAST LAP</span>
          <span className="info-value mono">{formatTime(telemetry.LastLapTime)}</span>
        </div>
        <div className="info-card">
          <span className="info-label">FUEL</span>
          <span className="info-value" style={{ color: fuelColor }}>
            {telemetry.FuelRemaining.toFixed(2)}L
          </span>
        </div>
        <div className="info-card">
          <span className="info-label">FUEL MIX</span>
          <span className="info-value">{telemetry.FuelMixMode}</span>
        </div>
        <div className="info-card">
          <span className="info-label">DRS</span>
          <span className="info-value" style={{ color: telemetry.DRS ? '#00ff88' : '#555' }}>
            {telemetry.DRS ? 'OPEN' : telemetry.CanUseDRS ? 'AVAIL' : 'OFF'}
          </span>
        </div>
        <div className="info-card">
          <span className="info-label">ENGINE TEMP</span>
          <span className="info-value" style={{ color: telemetry.EngineTemperature > 120 ? '#ff3333' : '#ccc' }}>
            {telemetry.EngineTemperature.toFixed(0)}°C
          </span>
        </div>
        <div className="info-card">
          <span className="info-label">VE % (EST)</span>
          <span className="info-value">{telemetry.Extra2.toFixed(1)}%</span>
        </div>
        <div className="info-card">
          <span className="info-label">IN PITS</span>
          <span className="info-value" style={{ color: telemetry.InPits ? '#ffcc00' : '#555' }}>
            {telemetry.InPits ? 'YES' : 'NO'}
          </span>
        </div>
      </div>

      <div className="gforce-row">
        <GForce label="LAT" value={telemetry.GForceLatitudinal} />
        <GForce label="LONG" value={telemetry.GForceLongitudinal} />
        <GForce label="VERT" value={telemetry.GForceVertical} />
      </div>

    </div>
  );
}
