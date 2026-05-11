import type { StintInfo } from '../hooks/useStint';

interface Props {
  stintInfo: StintInfo | null;
}

function formatDuration(ms: number): string {
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  return `${m}:${String(sec).padStart(2, '0')}`;
}

function formatDistance(m: number): string {
  if (m >= 1000) return `${(m / 1000).toFixed(2)} km`;
  return `${Math.round(m)} m`;
}

export function StintPanel({ stintInfo }: Props) {
  if (!stintInfo) {
    return <div className="no-data">Waiting for telemetry data...</div>;
  }

  const { pressures, wear } = stintInfo;

  return (
    <div className="stint-panel">

      <div className="stint-header-row">
        <div className="stint-meta-item">
          <span className="stint-meta-label">STINT</span>
          <span className="stint-meta-value">{stintInfo.stintNumber}</span>
        </div>
        <div className="stint-meta-item">
          <span className="stint-meta-label">TYRESET</span>
          <span className="stint-meta-value">{stintInfo.tyreSet}</span>
        </div>
      </div>

      <div className="stint-stats-grid">
        <div className="info-card">
          <span className="info-label">AVG SPEED</span>
          <span className="info-value">{stintInfo.avgSpeed.toFixed(1)} <span className="info-unit">km/h</span></span>
        </div>
        <div className="info-card">
          <span className="info-label">MAX SPEED</span>
          <span className="info-value">{stintInfo.maxSpeed.toFixed(1)} <span className="info-unit">km/h</span></span>
        </div>
        <div className="info-card">
          <span className="info-label">DISTANCE</span>
          <span className="info-value">{formatDistance(stintInfo.distanceM)}</span>
        </div>
        <div className="info-card">
          <span className="info-label">DURATION</span>
          <span className="info-value mono">{formatDuration(stintInfo.durationMs)}</span>
        </div>
        <div className="info-card">
          <span className="info-label">FUEL USED</span>
          <span className="info-value">{stintInfo.fuelUsed.toFixed(2)} <span className="info-unit">L</span></span>
          <span className="info-sublabel">{stintInfo.fuelPerLap.toFixed(2)} L/lap</span>
        </div>
        <div className="info-card">
          <span className="info-label">NRG USED (EST)</span>
          <span className="info-value">{stintInfo.nrgUsed.toFixed(2)}<span className="info-unit">%</span></span>
          <span className="info-sublabel">{stintInfo.nrgPerLap.toFixed(2)} %/lap</span>
        </div>
      </div>

      <div className="stint-section-title">TYRE PRESSURES</div>
      <table className="pressure-table">
        <thead>
          <tr>
            <th></th>
            <th>START</th>
            <th></th>
            <th>NOW</th>
            <th>AVG</th>
          </tr>
        </thead>
        <tbody>
          {(['fl','fr','rl','rr'] as const).map((corner) => (
            <tr key={corner}>
              <td className="pressure-corner">{corner.toUpperCase()}</td>
              <td className="pressure-val">{pressures.start[corner].toFixed(2)} kPa</td>
              <td className="pressure-arrow">→</td>
              <td className="pressure-val">{pressures.now[corner].toFixed(2)} kPa</td>
              <td className="pressure-avg">({pressures.avg[corner].toFixed(2)} kPa)</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="stint-section-title">TYRE WEAR</div>
      <div className="wear-grid">
        {(['fl','fr','rl','rr'] as const).map((corner) => (
          <div key={corner} className="wear-block">
            <div className="wear-corner-label">{corner.toUpperCase()}</div>
            <div className="wear-values">
              <span className="wear-pct">{(wear.now[corner] * 100).toFixed(2)}%</span>
              <span className="wear-rate">— {(wear.perLap[corner] * 100).toFixed(2)}%/lap</span>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
