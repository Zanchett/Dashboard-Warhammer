import React, { useState, useEffect } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

interface Mission {
  id: string;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  reward: number;
  status: 'AVAILABLE' | 'ACTIVE' | 'COMPLETED' | 'ABORTED';
  briefing: string;
  assignedBy: string;
  hexCode: string;
}

interface MissionsProps {
  username: string;
}

const Missions: React.FC<MissionsProps> = ({ username }) => {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [activeCategory, setActiveCategory] = useState<Mission['status']>('AVAILABLE');
  const { toast } = useToast();

  useEffect(() => {
    const fetchMissions = async () => {
      try {
        const response = await fetch('/api/missions');
        if (response.ok) {
          const data = await response.json();
          setMissions(data);
        } else {
          throw new Error('Failed to fetch missions');
        }
      } catch (error) {
        console.error('Error fetching missions:', error);
        toast({
          title: "Error",
          description: "Failed to fetch missions",
          variant: "destructive",
        });
      }
    };

    fetchMissions();
  }, []);

  const handleSelectMission = (mission: Mission) => {
    setSelectedMission(mission);
  };

  const handleAcceptMission = (missionId: string) => {
    setMissions(prevMissions =>
      prevMissions.map(mission =>
        mission.id === missionId ? { ...mission, status: 'ACTIVE' } : mission
      )
    );
    setActiveCategory('ACTIVE');
    toast({
      title: "Mission Accepted",
      description: "The Emperor protects. Go forth and serve.",
    });
  };

  const filteredMissions = missions.filter(mission => mission.status === activeCategory);

  const categories: { [key: string]: string } = {
    'AVAILABLE': 'AVAILABLE ASSIGNMENTS',
    'ACTIVE': 'ACTIVE OPERATIONS',
    'COMPLETED': 'COMPLETED MISSIONS',
    'ABORTED': 'ABORTED OPERATIONS'
  };

  return (
    <div className="cogitator-missions">
      <div className="terminal-header">
        <div className="header-title">COGITATOR INTERFACE v2.781</div>
        <div className="header-status">MISSION DATABASE ACCESS: GRANTED</div>
      </div>

      <div className="missions-layout">
        <div className="mission-categories">
          {Object.entries(categories).map(([key, value]) => (
            <div 
              key={key}
              className={`category-tab ${activeCategory === key ? 'active' : ''}`}
              onClick={() => setActiveCategory(key as Mission['status'])}
            >
              {value}
            </div>
          ))}
        </div>

        <div className="mission-list">
          <ScrollArea className="h-[calc(100vh-250px)]">
            {missions.filter(mission => mission.status === 'AVAILABLE').map(mission => (
              <div 
                key={mission.id} 
                className={`mission-entry ${selectedMission?.id === mission.id ? 'selected' : ''}`}
                onClick={() => handleSelectMission(mission)}
              >
                <span className="hex-prefix">{mission.hexCode}</span>
                <span className="mission-title">{mission.title}</span>
              </div>
            ))}
          </ScrollArea>
        </div>

        <div className="mission-details" style={{display: 'flex', flexDirection: 'column', justifyContent: 'space-between'}}>
          {selectedMission ? (
            <>
              <div className="mission-header">
                <span className="hex-prefix">{selectedMission.hexCode}</span>
                <span className="mission-title">{selectedMission.title}</span>
              </div>
              <div className="mission-content" style={{flexGrow: 1, overflowY: 'auto'}}>
                <div className="mission-briefing">
                  {selectedMission.briefing}
                </div>
                <div className="mission-signature">
                  [TRANSMISSION_END]
                  <br />
                  ++{selectedMission.assignedBy}++
                </div>
                <div className="mission-metadata">
                  <div>DIFFICULTY: {selectedMission.difficulty}</div>
                  <div>REWARD: {selectedMission.reward} CREDITS</div>
                  <div>STATUS: {selectedMission.status}</div>
                </div>
              </div>
              <Button 
                onClick={() => handleAcceptMission(selectedMission.id)}
                className="execute-button"
                disabled={selectedMission.status !== 'AVAILABLE'}
              >
                {selectedMission.status === 'AVAILABLE' ? 'EXECUTE_ACCEPT_MISSION' : 'MISSION_LOCKED'}
              </Button>
            </>
          ) : (
            <div className="no-selection">SELECT MISSION FILE TO VIEW BRIEFING</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Missions;
