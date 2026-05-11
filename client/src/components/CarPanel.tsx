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

function tempColor(temp: number): string {
  if (temp < 60) return '#4fc3f7';
  if (temp < 80) return '#00ff88';
  if (temp < 100) return '#ffcc00';
  return '#ff3333';
}

function wearColor(wear: number): string {
  if (wear < 20) return '#00ff88';
  if (wear < 50) return '#ffcc00';
  return '#ff3333';
}

function brakeColor(temp: number): string {
  if (temp < 200) return '#4fc3f7';
  if (temp < 400) return '#00ff88';
  if (temp < 600) return '#ffcc00';
  if (temp < 800) return '#ff8800';
  return '#ff3333';
}

interface TyreCornerProps {
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

function TyreCorner({ label, surface, carcass, inside, middle, outside, pressure, wear, damage }: TyreCornerProps) {
  return (
    <div className="corner-block">
      <div className="corner-block-label">{label}</div>
      <div className="corner-block-rows">
        <div className="corner-row">
          <span className="corner-key">SURFACE</span>
          <span className="corner-val" style={{ color: tempColor(surface) }}>{surface.toFixed(1)}°</span>
        </div>
        <div className="corner-row">
          <span className="corner-key">CARCASS</span>
          <span className="corner-val" style={{ color: tempColor(carcass) }}>{carcass.toFixed(1)}°</span>
        </div>
        <div className="corner-divider" />
        <div className="corner-row">
          <span className="corner-key">INNER</span>
          <span className="corner-val" style={{ color: tempColor(inside) }}>{inside.toFixed(1)}°</span>
        </div>
        <div className="corner-row">
          <span className="corner-key">MID</span>
          <span className="corner-val" style={{ color: tempColor(middle) }}>{middle.toFixed(1)}°</span>
        </div>
        <div className="corner-row">
          <span className="corner-key">OUTER</span>
          <span className="corner-val" style={{ color: tempColor(outside) }}>{outside.toFixed(1)}°</span>
        </div>
        <div className="corner-divider" />
        <div className="corner-row">
          <span className="corner-key">PRESSURE</span>
          <span className="corner-val">{pressure.toFixed(1)} psi</span>
        </div>
        <div className="corner-row">
          <span className="corner-key">WEAR</span>
          <span className="corner-val" style={{ color: wearColor(wear) }}>{wear.toFixed(3)}%</span>
        </div>
        <div className="corner-row">
          <span className="corner-key">DAMAGE</span>
          <span className="corner-val" style={{ color: damage > 0 ? '#ff3333' : '#555' }}>{(damage * 100).toFixed(1)}%</span>
        </div>
      </div>
    </div>
  );
}

interface BrakeCornerProps {
  label: string;
  brakeTemp: number;
  suspPos: number;
  suspVel: number;
  load: number;
}

function BrakeCorner({ label, brakeTemp, suspPos, suspVel, load }: BrakeCornerProps) {
  return (
    <div className="corner-block">
      <div className="corner-block-label">{label}</div>
      <div className="corner-block-rows">
        <div className="corner-row">
          <span className="corner-key">BRAKE TEMP</span>
          <span className="corner-val" style={{ color: brakeColor(brakeTemp) }}>{brakeTemp.toFixed(0)}°C</span>
        </div>
        <div className="corner-row">
          <span className="corner-key">SUSP POS</span>
          <span className="corner-val">{suspPos.toFixed(1)} mm</span>
        </div>
        <div className="corner-row">
          <span className="corner-key">SUSP VEL</span>
          <span className="corner-val">{suspVel.toFixed(1)} mm/s</span>
        </div>
        <div className="corner-row">
          <span className="corner-key">LOAD</span>
          <span className="corner-val">{load.toFixed(0)} N</span>
        </div>
      </div>
    </div>
  );
}

export function CarPanel({ telemetry }: Props) {
  if (!telemetry) {
    return <div className="no-data">Waiting for telemetry data...</div>;
  }

  const rpmPct = telemetry.MaxRevs > 0 ? (telemetry.EngineRevs / telemetry.MaxRevs) * 100 : 0;
  const rpmColor = rpmPct > 90 ? '#ff3333' : rpmPct > 75 ? '#ffcc00' : '#00ff88';
  const fuelPct = telemetry.FuelAtStart > 0 ? (telemetry.FuelRemaining / telemetry.FuelAtStart) * 100 : 100;
  const fuelColor = fuelPct < 15 ? '#ff3333' : fuelPct < 30 ? '#ffcc00' : '#00ff88';

  return (
    <div className="car-panel">

      {/* ── Top: driving state ── */}
      <div className="car-top">

        <div className="driver-top-row">
          <div className="big-stat">
            <span className="big-value">{Math.round(telemetry.Speed)}</span>
            <span className="big-unit">km/h</span>
          </div>
          <div className="big-stat gear-box">
            <span className="big-value gear-value">
              {telemetry.Gear === 0 ? 'N' : telemetry.Gear === -1 ? 'R' : telemetry.Gear}
            </span>
          </div>
          <div className="big-stat">
            <span className="big-value" style={{ color: rpmColor }}>
              {Math.round(telemetry.EngineRevs).toLocaleString()}
            </span>
            <span className="big-unit">RPM</span>
          </div>
          <div className="rpm-bar-wrap" style={{ flex: 1 }}>
            <div className="rpm-bar-bg">
              <div className="rpm-bar-fill" style={{ width: `${rpmPct}%`, background: rpmColor }} />
            </div>
            <span className="rpm-bar-label">{rpmPct.toFixed(0)}%</span>
          </div>
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
              <div className="steer-indicator" style={{ left: `${50 + telemetry.Steer * 50}%` }} />
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
            <span className="info-value" style={{ color: fuelColor }}>{telemetry.FuelRemaining.toFixed(2)} L</span>
          </div>
          <div className="info-card">
            <span className="info-label">FUEL MIX</span>
            <span className="info-value">{telemetry.FuelMixMode}</span>
          </div>
          <div className="info-card">
            <span className="info-label">DRS</span>
            <span className="info-value" style={{ color: telemetry.DRS ? '#00ff88' : telemetry.CanUseDRS ? '#ffcc00' : '#555' }}>
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

        <div className="car-bottom-strip">
          <div className="gforce-row">
            <div className="gforce-item">
              <span className="gforce-label">G LAT</span>
              <span className="gforce-value">{telemetry.GForceLatitudinal.toFixed(2)}g</span>
            </div>
            <div className="gforce-item">
              <span className="gforce-label">G LONG</span>
              <span className="gforce-value">{telemetry.GForceLongitudinal.toFixed(2)}g</span>
            </div>
            <div className="gforce-item">
              <span className="gforce-label">G VERT</span>
              <span className="gforce-value">{telemetry.GForceVertical.toFixed(2)}g</span>
            </div>
          </div>
          <div className="gforce-row">
            <div className="gforce-item">
              <span className="gforce-label">COMPOUND</span>
              <span className="gforce-value">{telemetry.TyreCompound}</span>
            </div>
            <div className="gforce-item">
              <span className="gforce-label">SET</span>
              <span className="gforce-value">{telemetry.Tyreset}</span>
            </div>
            <div className="gforce-item">
              <span className="gforce-label">FRONT RH</span>
              <span className="gforce-value">{telemetry.FrontRideHeight.toFixed(1)} mm</span>
            </div>
            <div className="gforce-item">
              <span className="gforce-label">REAR RH</span>
              <span className="gforce-value">{telemetry.RearRideHeight.toFixed(1)} mm</span>
            </div>
            <div className="gforce-item">
              <span className="gforce-label">TORQUE</span>
              <span className="gforce-value">{telemetry.Torque.toFixed(0)} Nm</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom: tyres left, brakes right ── */}
      <div className="car-bottom-columns">

        <div className="car-column">
          <div className="car-section-title">TYRES</div>
          <div className="four-corner-grid">
            <TyreCorner
              label="FL"
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
              label="FR"
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
              label="RL"
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
              label="RR"
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

        <div className="car-column">
          <div className="car-section-title">BRAKES & SUSPENSION</div>
          <div className="four-corner-grid">
            <BrakeCorner
              label="FL"
              brakeTemp={telemetry.BrakeTemperatureFrontLeft}
              suspPos={telemetry.SuspensionPositionFrontLeft}
              suspVel={telemetry.SuspensionVelocityFrontLeft}
              load={telemetry.LoadFrontLeft}
            />
            <BrakeCorner
              label="FR"
              brakeTemp={telemetry.BrakeTemperatureFrontRight}
              suspPos={telemetry.SuspensionPositionFrontRight}
              suspVel={telemetry.SuspensionVelocityFrontRight}
              load={telemetry.LoadFrontRight}
            />
            <BrakeCorner
              label="RL"
              brakeTemp={telemetry.BrakeTemperatureRearLeft}
              suspPos={telemetry.SuspensionPositionRearLeft}
              suspVel={telemetry.SuspensionVelocityRearLeft}
              load={telemetry.LoadRearLeft}
            />
            <BrakeCorner
              label="RR"
              brakeTemp={telemetry.BrakeTemperatureRearRight}
              suspPos={telemetry.SuspensionPositionRearRight}
              suspVel={telemetry.SuspensionVelocityRearRight}
              load={telemetry.LoadRearRight}
            />
          </div>
        </div>

      </div>
    </div>
  );
}
