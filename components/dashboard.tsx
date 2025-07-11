'use client'

import React, { useState, useEffect } from 'react'
import '../styles/dashboard.css'
import '../styles/character-sheet.css'
import WarpFluctuationGraph from './WarpFluctuationGraph'
import CharacterSheet from './CharacterSheet'
import Wallet from './Wallet';
import HackingMinigame from './HackingMinigame';
import CogitatorCoreBreach from './CogitatorCoreBreach';
import ServitorAssistant from './ServitorAssistant';
import MechanicusUpgrades from './MechanicusUpgrades';
import Library from './Library';
import Messages from './Messages';
import Contacts from './Contacts';
import Missions from './Missions';
import { useTranslation } from 'react-i18next';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import CustomKnob from './CustomKnob';
import Notes from './Notes';
import ShipControl from './ShipControl';
import Market from './Market';

const useRandomValue = (min: number, max: number, interval: number) => {
  const [value, setValue] = useState(Math.random() * (max - min) + min);

  useEffect(() => {
    const timer = setInterval(() => {
      setValue(Math.random() * (max - min) + min);
    }, interval);

    return () => clearInterval(timer);
  }, [min, max, interval]);

  return value;
};

const HackingView = () => {
  const [gameState, setGameState] = useState<'password' | 'core-breach' | 'success' | 'failure'>('password');

  const handlePasswordSuccess = () => {
    setGameState('core-breach');
  };

  const handleCoreBreachSuccess = () => {
    setGameState('success');
  };

  const handleFailure = () => {
    setGameState('failure');
  };

  return (
    <div className="hacking-view">
      <h3 className="view-title">Cogitator Interface Breach</h3>
      <div className="hacking-content">
        {gameState === 'password' && (
          <HackingMinigame onSuccess={handlePasswordSuccess} onFailure={handleFailure} />
        )}
        {gameState === 'core-breach' && (
          <CogitatorCoreBreach onSuccess={handleCoreBreachSuccess} onFailure={handleFailure} />
        )}
        {gameState === 'success' && (
          <div className="hacking-result success">
            System fully compromised. Accessing restricted data...
          </div>
        )}
        {gameState === 'failure' && (
          <div className="hacking-result failure">
            Access denied. Cogitator lockdown initiated.
          </div>
        )}
      </div>
    </div>
  );
};

export default function Dashboard({ username }: { username: string }) {
  const { t } = useTranslation();
  const [time, setTime] = useState(new Date())
  const [activeTab, setActiveTab] = useState('MAIN')
  const [currentView, setCurrentView] = useState<string>('main')
  const [conversations, setConversations] = useState<any[]>([])
  const [activeConversation, setActiveConversation] = useState<string | null>(null);

  const cpuUsage = useRandomValue(30, 60, 5000);
  const memoryUsage = useRandomValue(40, 70, 7000);
  const warpStability = useRandomValue(70, 95, 10000);
  const gellarFieldStrength = useRandomValue(80, 100, 8000);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await fetch(`/api/conversations?username=${username}`);
        if (response.ok) {
          const data = await response.json();
          setConversations(data);
        } else {
          console.error('Failed to fetch conversations');
        }
      } catch (error) {
        console.error('Error fetching conversations:', error);
      }
    };

    fetchConversations();
  }, [username]);

  const handleStartConversation = (contactId: string) => {
    setActiveConversation(contactId);
    setCurrentView('messages');
  };

  const generateRandomData = (count: number) => {
    return Array.from({ length: count }, (_, i) => ({
      name: `Data ${i + 1}`,
      value: Math.floor(Math.random() * 100)
    }));
  };

  const renderContent = () => {
    switch (currentView) {
      case 'character-sheet':
        return <CharacterSheet username={username} />;
      case 'wallet':
        return <Wallet username={username} />;
      case 'hacking':
        return <HackingView />;
      case 'messages':
        return (
          <Messages 
            username={username} 
            conversationId={activeConversation} 
            onStartConversation={handleStartConversation} 
          />
        );
      case 'contacts':
        return (
          <Contacts username={username} onStartConversation={handleStartConversation} />
        );
      case 'missions':
        return <Missions username={username} />;
      case 'main':
      default:
        return (
          <>
            <div className="terminal-header">
              <div className="terminal-tabs">
                <div 
                  className={`terminal-tab ${activeTab === 'MAIN' ? 'active' : ''}`}
                  onClick={() => setActiveTab('MAIN')}
                >
                  MAIN
                </div>
                <div 
                  className={`terminal-tab ${activeTab === 'PROCESSES' ? 'active' : ''}`}
                  onClick={() => setActiveTab('PROCESSES')}
                >
                  PROCESSES
                </div>
              </div>
            </div>

            <div className="terminal-content">
              {activeTab === 'MAIN' ? (
                <div className="main-content">
                  <div className="cogitator-status">
                    <h3>Cogitator Status</h3>
                    <div className="status-grid">
                      <div className="status-item">
                        <span>Machine Spirit:</span>
                        <span className="status-value">Appeased</span>
                      </div>
                      <div className="status-item">
                        <span>Warp Interference:</span>
                        <span className="status-value">Minimal</span>
                      </div>
                      <div className="status-item">
                        <span>Noosphere Connectivity:</span>
                        <span className="status-value">Optimal</span>
                      </div>
                      <div className="status-item">
                        <span>Sanctified Rites:</span>
                        <span className="status-value">Performed</span>
                      </div>
                    </div>
                  </div>
                  <div className="system-metrics">
                    <h3>Cogitator Performance Metrics</h3>
                    <div className="metrics-grid grid-cols-4 gap-4">
                      <div className="metric-item">
                        <CustomKnob
                          value={cpuUsage}
                          min={0}
                          max={100}
                          size={80}
                          color="#1aff8c"
                          backgroundColor="#0a3d29"
                          label="Computational Efficiency"
                          labelFontSize={10}
                        />
                      </div>
                      <div className="metric-item">
                        <CustomKnob
                          value={memoryUsage}
                          min={0}
                          max={100}
                          size={80}
                          color="#1aff8c"
                          backgroundColor="#0a3d29"
                          label="Cogitation Capacity"
                          labelFontSize={10}
                        />
                      </div>
                      <div className="metric-item">
                        <CustomKnob
                          value={warpStability}
                          min={0}
                          max={100}
                          size={80}
                          color="#1aff8c"
                          backgroundColor="#0a3d29"
                          label="Warp Stability"
                          labelFontSize={10}
                        />
                      </div>
                      <div className="metric-item">
                        <CustomKnob
                          value={gellarFieldStrength}
                          min={0}
                          max={100}
                          size={80}
                          color="#1aff8c"
                          backgroundColor="#0a3d29"
                          label="Gellar Field Integrity"
                          labelFontSize={10}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="data-analysis">
                    <h3>Warp Anomaly Patterns</h3>
                    <div className="analysis-container">
                      <LineChart width={800} height={300} data={generateRandomData(10)}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1aff8c" />
                        <XAxis dataKey="name" stroke="#1aff8c" />
                        <YAxis stroke="#1aff8c" />
                        <Tooltip contentStyle={{ backgroundColor: '#0a3d29', border: '1px solid #1aff8c' }} />
                        <Legend />
                        <Line type="monotone" dataKey="value" stroke="#1aff8c" name="Warp Disturbance Level" />
                      </LineChart>
                    </div>
                  </div>
                  <div className="system-log">
                    <h3>Noosphere Activity Log</h3>
                    <div className="log-entries">
                      <div className="log-entry">
                        <span className="log-timestamp">[3021.998.M41]</span>
                        <span className="log-message">Gellar Field harmonics optimized. Warp protection increased by 3.4%</span>
                      </div>
                      <div className="log-entry">
                        <span className="log-timestamp">[3021.999.M41]</span>
                        <span className="log-message">WARNING: Chaotic data patterns detected in sector 9K. Purification protocols engaged.</span>
                      </div>
                      <div className="log-entry">
                        <span className="log-timestamp">[3022.001.M41]</span>
                        <span className="log-message">Machine Spirit communion successful. Blessed algorithms efficiency +7.8%</span>
                      </div>
                      <div className="log-entry">
                        <span className="log-timestamp">[3022.002.M41]</span>
                        <span className="log-message">ALERT: Unauthorized psychic signature detected. Implementing hexagrammic wards.</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="processes-content">
                  <h3>Active Processes</h3>
                  <table className="process-list">
                    <thead>
                      <tr>
                        <th>PID</th>
                        <th>COMMAND</th>
                        <th>CPU</th>
                        <th>MEM</th>
                        <th>STATUS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {PROCESSES.map(process=> (
                        <tr key={process.pid}>
                          <td>{process.pid}</td>
                          <td>{process.command}</td>
                          <td>{process.cpu}</td>
                          <td>{process.mem}</td>
                          <td className={`process-status ${process.status.toLowerCase()}`}>{process.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="process-controls">
                    <h3>Process Control</h3>
                    <div className="control-buttons">
                      <button className="control-button">Purge Heretical Data</button>
                      <button className="control-button">Invoke Machine Spirit</button>
                      <button className="control-button">Recite Litany of Activation</button>
                    </div>
                  </div>
                  <div className="resource-allocation">
                    <h3>Resource Allocation</h3>
                    <div className="allocation-chart">
                      <LineChart width={600} height={300} data={generateRandomData(20)}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1aff8c" />
                        <XAxis dataKey="name" stroke="#1aff8c" />
                        <YAxis stroke="#1aff8c" />
                        <Tooltip contentStyle={{ backgroundColor: '#0a3d29', border: '1px solid #1aff8c' }} />
                        <Legend />
                        <Line type="monotone" dataKey="value" stroke="#1aff8c" name="Resource Usage" />
                      </LineChart>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        );
      case 'servitor-assistant':
        return <ServitorAssistant />;
      case 'mechanicus-upgrades':
        return <MechanicusUpgrades username={username} />;
      case 'library':
        return <Library />;
      case 'notes':
        return <Notes />;
      case 'ship-control':
        return <ShipControl />;
      case 'market':
        return <Market username={username} />;
    }
  };

  return (
    <div className="app-skeleton">
      <div className="top-bar">
        <div className="top-bar__section">
          <div className="dropdown">
            <span className="dropdown-trigger">PANEL</span>
            <div className="dropdown-content">
              <span onClick={() => setCurrentView('main')}>Main</span>
              <span onClick={() => setCurrentView('character-sheet')}>Character Sheet</span>
              <span onClick={() => setCurrentView('wallet')}>Wallet</span>
              <span onClick={() => setCurrentView('hacking')}>Hacking</span>
              <span onClick={() => setCurrentView('servitor-assistant')}>Servitor Assistant</span>
              <span onClick={() => setCurrentView('library')}>Library</span>
              <span onClick={() => setCurrentView('notes')}>Notes</span>
              <span onClick={() => setCurrentView('market')}>Market</span>
            </div>
          </div>
          <div className="dropdown">
            <span className="dropdown-trigger">SYSTEM</span>
            <div className="dropdown-content">
              <span onClick={() => setCurrentView('mechanicus-upgrades')}>Mechanicus Upgrades</span>
              <span onClick={() => setCurrentView('missions')}>Missions</span>
              <span onClick={() => setCurrentView('ship-control')}>Ship Control</span>
            </div>
          </div>
          <div className="dropdown">
            <span className="dropdown-trigger">SOCIAL</span>
            <div className="dropdown-content">
              <span onClick={() => setCurrentView('messages')}>Messages</span>
              <span onClick={() => setCurrentView('contacts')}>Contacts</span>
            </div>
          </div>
        </div>
        <div className="top-bar__section">
          <span>MAIN SHELL</span>
        </div>
      </div>

      <div className="stats-panel">
        <div className="time-display">
          {time.toLocaleTimeString('en-US', { 
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          })}
        </div>

        <div className="stats-grid">
          <span className="stats-label">UPTIME</span>
          <span className="stats-value">35:10:34</span>
          
          <span className="stats-label">TYPE</span>
          <span className="stats-value">Cogitator</span>
          
          <span className="stats-label">POWER</span>
          <span className="stats-value">71%</span>
        </div>

        <div>
          <div className="stats-label">CPU USAGE</div>
          <div className="stats-value">{cpuUsage.toFixed(2)}%</div>
          <div className="usage-bar">
            <div 
              className="usage-bar__fill" 
              style={{ width: `${cpuUsage}%` }}
            />
          </div>
        </div>

        <div>
          <div className="stats-label">MEMORY</div>
          <div className="stats-value">{memoryUsage.toFixed(2)}%</div>
          <div className="usage-bar">
            <div 
              className="usage-bar__fill" 
              style={{ width: `${memoryUsage}%` }}
            />
          </div>
        </div>

        <div className="wh40k-info">
          <h3>Imperium Status</h3>
          <p>Threat Level: Extreme</p>
          <p>Warp Storms: Active in Segmentum Obscurus</p>
          <p>Tyranid Hive Fleets: 3 Detected</p>
          <p>Necron Tomb Worlds: 17 Awakened</p>
        </div>

        <div className="wh40k-info">
          <h3>Adeptus Mechanicus</h3>
          <p>Forge World: Mars</p>
          <p>Tech-Priest Rank: Magos</p>
          <p>Servo-skulls: 5 Active</p>
          <p>STC Fragments: 3 Recovered</p>
        </div>

        <div className="wh40k-info">
          <h3>Astra Militarum</h3>
          <p>Regiment: Cadian 8th</p>
          <p>Lasgun Power Packs: 10,000</p>
          <p>Chimera Transports: 50</p>
          <p>Leman Russ Tanks: 20</p>
        </div>
      </div>

      <div className="main-terminal">
        {renderContent()}
      </div>

      <div className="network-panel">
        <div className="network-status">
          <span className="stats-label">STATE</span>
          <span className="stats-value">ONLINE</span>
          
          <span className="stats-label">WARP</span>
          <span className="stats-value">STABLE</span>
          
          <span className="stats-label">ASTROPATH</span>
          <span className="stats-value">CONNECTED</span>
        </div>

        <div className="network-graph">
          <h3 className="graph-title">Warp Fluctuation Graph</h3>
          <WarpFluctuationGraph />
        </div>

      </div>
    </div>
  )
}

const PROCESSES = [
  { pid: 95089, command: 'Auspex Scanner', cpu: '96.2%', mem: '227M', status: 'RUNNING' },
  { pid: 170, command: 'Vox Caster', cpu: '53.9%', mem: '599M', status: 'RUNNING' },
  { pid: 95087, command: 'Servitor Control', cpu: '49.8%', mem: '527M', status: 'RUNNING' },
  { pid: 96592, command: 'Warp Drive Monitor', cpu: '1.6%', mem: '2776K', status: 'IDLE' },
  { pid: 95077, command: 'Gellar Field', cpu: '16.4%', mem: '46M', status: 'RUNNING' },
  { pid: 98234, command: 'Cogitator Core', cpu: '78.3%', mem: '1.2G', status: 'RUNNING' },
  { pid: 99102, command: 'Noosphere Interface', cpu: '22.7%', mem: '345M', status: 'RUNNING' },
  { pid: 97856, command: 'Heretic Detection', cpu: '35.1%', mem: '678M', status: 'RUNNING' },
  { pid: 96123, command: 'Machine Spirit Appeasement', cpu: '5.4%', mem: '89M', status: 'IDLE' },
  { pid: 98765, command: 'Warp Navigation', cpu: '62.8%', mem: '890M', status: 'RUNNING' },
]
