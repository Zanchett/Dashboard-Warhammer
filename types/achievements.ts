export interface PuritySeal {
  id: string;
  name: string;
  description: string;
  category: 'Devotion' | 'Knowledge' | 'Combat' | 'Tech-Adept';
  level: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  iconUrl: string;
  loreText: string;
  isEarned: boolean;
  earnedDate?: Date;
}

export interface UserAchievements {
  userId: string;
  earnedSeals: PuritySeal[];
}
