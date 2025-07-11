export interface AttributeStats {
  rating: number;
  bonus: number;
  total: number;
}

export interface CharacterAttributes {
  strength: AttributeStats;
  toughness: AttributeStats;
  agility: AttributeStats;
  initiative: AttributeStats;
  willpower: AttributeStats;
  intelligence: AttributeStats;
  fellowship: AttributeStats;
}

export interface CharacterInfo {
  playerName: string;
  characterName: string;
  tier: string;
  species: string;
  archetype: string;
  background: string;
  rank: string;
  faction: string;
  keywords: string;
}

export interface Skill {
  name: string;
  rating: number;
  bonus: number;
  total: number;
}

export interface WrathUses {
  rerollFailedDice: boolean;
  narrativeDeclaration: boolean;
  restoreDoubleRankShock: boolean;
}

export interface Survival {
  defence: number;
  resilience: {
    base: number;
    armour: number;
    total: number;
  };
  wounds: {
    current: number;
    max: number;
  };
  shock: {
    current: number;
    max: number;
    determination: string;
  };
}

export interface WrathStats {
  conviction: number;
  resolve: number;
  size: string;
  speed: number;
  objective: string;
  uses: WrathUses;
  survival: Survival;
}

export interface CharacterSheet {
  userId: string;
  info: CharacterInfo;
  attributes: CharacterAttributes;
  skills: Skill[];
  wrath: WrathStats;
  health: {
    current: number;
    max: number;
  };
  lastUpdated: string;
}
