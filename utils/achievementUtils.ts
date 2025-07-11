import { PuritySeal, UserAchievements } from '../types/achievements';

export function checkAchievement(userId: string, achievementId: string): boolean {
  // This function would check if the user has met the criteria for the achievement
  // For this example, we'll just return a random boolean
  return Math.random() < 0.5;
}

export function awardPuritySeal(userAchievements: UserAchievements, seal: PuritySeal): UserAchievements {
  if (!userAchievements.earnedSeals.some(s => s.id === seal.id)) {
    return {
      ...userAchievements,
      earnedSeals: [
        ...userAchievements.earnedSeals,
        {
          ...seal,
          isEarned: true,
          earnedDate: new Date()
        }
      ]
    };
  }
  return userAchievements;
}
