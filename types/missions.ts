export interface Mission {
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

