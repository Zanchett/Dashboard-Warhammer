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
import Messages from './Messages'; // Import the Messages component
import Contacts from './Contacts'; // Added import for Contacts component
import Missions from './Missions'; // Added import for Missions component

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
  const [time, setTime] = useState(new Date())
  const [activeTab, setActiveTab] = useState('MAIN')
  const [currentView, setCurrentView] = useState<string>('main')
  const [conversations, setConversations] = useState<any[]>([])
  const [activeConversation, setActiveConversation] = useState<string | null>(null); // Added activeConversation state

  const cpuUsage = useRandomValue(30, 60, 5000);
  const memoryUsage = useRandomValue(40, 70, 7000);

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

  const handleStartConversation = (contactId: string) => { // Added handleStartConversation function
    setActiveConversation(contactId);
    setCurrentView('messages');
  };

  const renderContent = () => {
    switch (currentView) {
      case 'character-sheet':
        return <CharacterSheet username={username} />;
      case 'wallet':
        return <Wallet username={username} />;
      case 'hacking':
        return <HackingView />;
      case 'messages': // Updated case for messages
        return (
          <Messages 
            username={username} 
            conversationId={activeConversation} 
            onStartConversation={handleStartConversation} // Pass the function to Messages
          />
        );
      case 'contacts': // Added case for contacts
        return (
          <Contacts username={username} onStartConversation={handleStartConversation} /> // Pass the function to Contacts
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
                  <div>Processes: 712 total, 6 running, 706 sleeping, 2607 threads</div>
                  <div>Load Avg: 4.85, 2.84, 2.10 CPU usage: {cpuUsage.toFixed(2)}% user, 29.70% sys, 31.68% idle</div>
                  <div>SharedLibs: 215M resident, 57M data, 23M linkedit.</div>
                  <div>MemRegions: 318147 total, 5823M resident, 190M private, 2646M shared.</div>
                  <div>PhysMem: 16G used (3558M wired), 103M unused.</div>
                  <div>VM: 13T vsize, 1299M framework vsize, 4728010(0) swapins, 4922315(0) swapouts.</div>
                  <span className="stats-label">Missions Completed</span>
                  <span className="stats-value">35</span>
                </div>
              ) : (
                <table className="process-list">
                  <thead>
                    <tr>
                      <th>PID</th>
                      <th>COMMAND</th>
                      <th>%CPU</th>
                      <th>TIME</th>
                      <th>MEM</th>
                    </tr>
                  </thead>
                  <tbody>
                    {PROCESSES.map(process=> (
                      <tr key={process.pid}>
                        <td>{process.pid}</td>
                        <td>{process.command}</td>
                        <td>{process.cpu}</td>
                        <td>{process.time}</td>
                        <td>{process.mem}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
            </div>
          </div>
          <div className="dropdown">
            <span className="dropdown-trigger">SYSTEM</span>
            <div className="dropdown-content">
              <span onClick={() => setCurrentView('mechanicus-upgrades')}>Mechanicus Upgrades</span>
              <span onClick={() => setCurrentView('missions')}>Missions</span>
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
  { pid: 95089, command: 'Auspex Scanner', cpu: '96.2', time: '01:15.98', mem: '227M+' },
  { pid: 170, command: 'Vox Caster', cpu: '53.9', time: '08:13.47', mem: '599M' },
  { pid: 95087, command: 'Servitor Control', cpu: '49.8', time: '00:46.92', mem: '527M-' },
  { pid: 96592, command: 'Warp Drive Monitor', cpu: '1.6', time: '00:02.52', mem: '2776K' },
  { pid: 95077, command: 'Gellar Field', cpu: '16.4', time: '00:17.24', mem: '46M+' },
]

