import type { AiDriver } from '../types';

interface Props {
  aiData: AiDriver[] | null;
}

function statusLabel(driver: AiDriver): string {
  if (driver.dnf) return 'DNF';
  if (driver.dq) return 'DQ';
  if (driver.finished) return 'FIN';
  if (driver.inPitBox) return 'PIT BOX';
  if (driver.inPitLane) return 'PIT LANE';
  if (driver.inGarage) return 'GARAGE';
  return 'RACING';
}

function statusClass(driver: AiDriver): string {
  if (driver.dnf || driver.dq) return 'status-out';
  if (driver.inPitBox || driver.inPitLane || driver.inGarage) return 'status-pit';
  return 'status-racing';
}

export function LiveTiming({ aiData }: Props) {
  if (!aiData) {
    return <div className="no-data">Waiting for timing data...</div>;
  }

  const sorted = [...aiData].sort((a, b) => a.position - b.position);

  return (
    <div className="timing-table-wrap">
      <table className="timing-table">
        <thead>
          <tr>
            <th>POS</th>
            <th>#</th>
            <th>DRIVER</th>
            <th>CLASS</th>
            <th>LAP</th>
            <th>GAP</th>
            <th>LAST LAP</th>
            <th>BEST LAP</th>
            <th>TYRE</th>
            <th>PITS</th>
            <th>STATUS</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((driver) => (
            <tr key={driver.driverId} className={driver.dnf || driver.dq ? 'row-out' : ''}>
              <td className="col-pos">{driver.position}</td>
              <td className="col-number" style={{ color: `#${driver.color}` }}>
                {driver.carRaceNumber}
              </td>
              <td className="col-driver">
                <span className="tla">{driver.driverTLA}</span>
                <span className="full-name">{driver.driver}</span>
              </td>
              <td className="col-class">{driver.carClass}</td>
              <td>{driver.lap}</td>
              <td className="col-gap">{driver.position === 1 ? '—' : driver.diffToLeader}</td>
              <td className="col-laptime">{driver.last || '—'}</td>
              <td className="col-laptime">{driver.best || '—'}</td>
              <td className="col-tyre">{driver.tyre || '—'}</td>
              <td>{driver.pitstops}</td>
              <td className={`col-status ${statusClass(driver)}`}>{statusLabel(driver)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
