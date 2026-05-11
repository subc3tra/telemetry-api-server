import type { StintData } from '../types';

interface Props {
  stintData: StintData;
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

export function StintPanel({ stintData }: Props) {
  const { current, completed, totalPitTimeMs } = stintData;

  const historyEntries = [
    ...completed.map((cs) => ({
      stintNumber:  cs.stintNumber,
      startLap:     cs.startLap,
      endLap:       cs.endLap,
      durationMs:   cs.durationMs,
      pitDurationMs: cs.pitDurationMs,
      isActive:     false,
      inPits:       false,
    })),
    ...(current ? [{
      stintNumber:  current.stintNumber,
      startLap:     current.startLap,
      endLap:       current.currentLap,
      durationMs:   current.durationMs,
      pitDurationMs: current.currentPitDurationMs,
      isActive:     true,
      inPits:       current.inPits,
    }] : []),
  ];

  return (
    <div className="stint-layout">

      {/* ── Left: current stint data ── */}
      <div className="stint-panel">
        {current ? (
          <>
            <div className="stint-header-row">
              <div className="stint-meta-item">
                <span className="stint-meta-label">STINT</span>
                <span className="stint-meta-value">{current.stintNumber}</span>
              </div>
              <div className="stint-meta-item">
                <span className="stint-meta-label">TYRESET</span>
                <span className="stint-meta-value">{current.tyreSet}</span>
              </div>
              {current.inPits && (
                <div className="stint-meta-item">
                  <span className="stint-meta-label" style={{ color: 'var(--yellow)' }}>IN PITS</span>
                  <span className="stint-meta-value" style={{ color: 'var(--yellow)', fontSize: 20 }}>
                    {formatDuration(current.currentPitDurationMs)}
                  </span>
                </div>
              )}
            </div>

            <div className="stint-stats-grid">
              <div className="info-card">
                <span className="info-label">AVG SPEED</span>
                <span className="info-value">{current.avgSpeed.toFixed(1)} <span className="info-unit">km/h</span></span>
              </div>
              <div className="info-card">
                <span className="info-label">MAX SPEED</span>
                <span className="info-value">{current.maxSpeed.toFixed(1)} <span className="info-unit">km/h</span></span>
              </div>
              <div className="info-card">
                <span className="info-label">DISTANCE</span>
                <span className="info-value">{formatDistance(current.distanceM)}</span>
              </div>
              <div className="info-card">
                <span className="info-label">DURATION</span>
                <span className="info-value mono">{formatDuration(current.durationMs)}</span>
              </div>
              <div className="info-card">
                <span className="info-label">FUEL USED</span>
                <span className="info-value">{current.fuelUsed.toFixed(2)} <span className="info-unit">L</span></span>
                <span className="info-sublabel">{current.fuelPerLap.toFixed(2)} L/lap</span>
              </div>
              <div className="info-card">
                <span className="info-label">NRG USED (EST)</span>
                <span className="info-value">{current.nrgUsed.toFixed(2)}<span className="info-unit">%</span></span>
                <span className="info-sublabel">{current.nrgPerLap.toFixed(2)} %/lap</span>
              </div>
              {totalPitTimeMs > 0 && (
                <div className="info-card">
                  <span className="info-label">TOTAL PIT TIME</span>
                  <span className="info-value mono">{formatDuration(totalPitTimeMs)}</span>
                </div>
              )}
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
                {(['fl', 'fr', 'rl', 'rr'] as const).map((c) => (
                  <tr key={c}>
                    <td className="pressure-corner">{c.toUpperCase()}</td>
                    <td className="pressure-val">{current.pressures.start[c].toFixed(2)} kPa</td>
                    <td className="pressure-arrow">→</td>
                    <td className="pressure-val">{current.pressures.now[c].toFixed(2)} kPa</td>
                    <td className="pressure-avg">({current.pressures.avg[c].toFixed(2)} kPa)</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="stint-section-title">TYRE WEAR</div>
            <div className="wear-grid">
              {(['fl', 'fr', 'rl', 'rr'] as const).map((c) => (
                <div key={c} className="wear-block">
                  <div className="wear-corner-label">{c.toUpperCase()}</div>
                  <div className="wear-values">
                    <span className="wear-pct">{current.wear.now[c].toFixed(3)}%</span>
                    <span className="wear-rate">— {current.wear.perLap[c].toFixed(3)}%/lap</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="no-data">Waiting for telemetry data...</div>
        )}
      </div>

      {/* ── Right: stint history ── */}
      {historyEntries.length > 0 && (
        <div className="stint-history">
          <div className="sh-title">STINTS</div>
          <div className="sh-divider" />
          {historyEntries.map((entry) => (
            <div
              key={entry.stintNumber}
              className={`sh-entry${entry.isActive ? ' sh-entry--active' : ''}`}
            >
              <span className="sh-marker">{entry.isActive ? '▶' : ' '}</span>
              <div className="sh-entry-body">
                <div className="sh-stint-top">
                  <span className="sh-stint-label">Stint {entry.stintNumber}</span>
                  <span className="sh-duration">{formatDuration(entry.durationMs)}</span>
                </div>
                <div className="sh-laps">L{entry.startLap} → L{entry.endLap}</div>
                {entry.pitDurationMs > 0 && (
                  <div className={`sh-pit-time${entry.isActive && entry.inPits ? ' sh-pit-time--active' : ''}`}>
                    pit: {formatDuration(entry.pitDurationMs)}
                    {entry.isActive && entry.inPits && ' ⏱'}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
