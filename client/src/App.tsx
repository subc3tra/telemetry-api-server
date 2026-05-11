import { useState } from 'react';
import { useTelemetry } from './hooks/useTelemetry';
import { LiveTiming } from './components/LiveTiming';
import { CarPanel } from './components/CarPanel';
import { StintPanel } from './components/StintPanel';
import './App.css';

type Tab = 'timing' | 'car' | 'stint';

const TABS: { id: Tab; label: string }[] = [
  { id: 'timing', label: 'LIVE TIMING' },
  { id: 'car',    label: 'CAR' },
  { id: 'stint',  label: 'STINT DATA' },
];

function StatusDot({ status }: { status: string }) {
  const color = status === 'connected' ? '#00ff88' : status === 'connecting' ? '#ffcc00' : '#ff3333';
  return (
    <div className="status-dot-wrap">
      <div className="status-dot" style={{ background: color }} />
      <span className="status-text">{status.toUpperCase()}</span>
    </div>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('timing');
  const { telemetry, aiData, stintData, status } = useTelemetry();

  return (
    <div className="app">
      <header className="header">
        <span className="header-title">TELEMETRY</span>
        <nav className="tab-nav">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              className={`tab-btn ${activeTab === tab.id ? 'tab-btn--active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>
        <StatusDot status={status} />
      </header>

      <main className="main">
        {activeTab === 'timing' && <LiveTiming aiData={aiData} />}
        {activeTab === 'car'    && <CarPanel telemetry={telemetry} />}
        {activeTab === 'stint'  && <StintPanel stintData={stintData} />}
      </main>
    </div>
  );
}
