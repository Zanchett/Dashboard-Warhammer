export interface Achievement {
  id: string
  name: string
  description: string
  unlocked: boolean
  unlockedDate?: string
  icon: string // Lucide icon name or path to an image
}
