export interface Mission {
  id: string
  title: string
  description: string
  rewardCredits: number
  status: "active" | "completed"
}
