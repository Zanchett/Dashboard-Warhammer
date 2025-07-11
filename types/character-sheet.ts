export interface Skill {
  name: string
  value: number
}

export interface Talent {
  name: string
  description: string
}

export interface Item {
  name: string
  quantity: number
  description: string
}

export interface Character {
  id: string
  name: string
  class: string
  rank: string
  faction: string
  attributes: {
    strength: number
    agility: number
    toughness: number
    intelligence: number
    willpower: number
    fellowship: number
  }
  skills: Skill[]
  talents: Talent[]
  inventory: Item[]
  notes: string
  xp: number
  xpNeeded: number
  health: number
  maxHealth: number
}
