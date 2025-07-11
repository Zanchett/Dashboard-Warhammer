"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/hooks/use-toast"
import { Icons } from "./icons"
import "../styles/missions.css"
import type { Mission } from "@/types/missions"
import { getMissions, createMission, toggleMissionStatus } from "@/app/actions/missions"

export default function Missions() {
  const [missions, setMissions] = useState<Mission[]>([])
  const [newMissionTitle, setNewMissionTitle] = useState("")
  const [newMissionDescription, setNewMissionDescription] = useState("")
  const [newMissionReward, setNewMissionReward] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const fetchMissions = async () => {
    setLoading(true)
    try {
      const result = await getMissions()
      if (result.success && result.missions) {
        setMissions(result.missions)
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to fetch missions.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching missions:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred while fetching missions.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMissions()
  }, [])

  const handleCreateMission = async () => {
    if (!newMissionTitle || !newMissionDescription || newMissionReward <= 0) {
      toast({
        title: "Missing Information",
        description: "Please fill in all mission details and ensure reward is positive.",
        variant: "destructive",
      })
      return
    }

    const missionData: Omit<Mission, "id" | "status"> = {
      title: newMissionTitle,
      description: newMissionDescription,
      rewardCredits: newMissionReward,
    }

    try {
      const result = await createMission(missionData)
      if (result.success && result.mission) {
        setMissions((prev) => [...prev, result.mission!])
        setNewMissionTitle("")
        setNewMissionDescription("")
        setNewMissionReward(0)
        toast({
          title: "Mission Created",
          description: `Mission "${result.mission.title}" has been successfully created.`,
        })
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to create mission.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error creating mission:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred while creating mission.",
        variant: "destructive",
      })
    }
  }

  const handleToggleStatus = async (missionId: string, currentStatus: Mission["status"]) => {
    const newStatus = currentStatus === "active" ? "completed" : "active"
    try {
      const result = await toggleMissionStatus(missionId, newStatus)
      if (result.success && result.mission) {
        setMissions((prev) => prev.map((m) => (m.id === missionId ? { ...m, status: newStatus } : m)))
        toast({
          title: "Mission Updated",
          description: `Mission "${result.mission.title}" status updated to ${newStatus}.`,
        })
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to update mission status.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error toggling mission status:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred while updating mission status.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="missions-container panel-cyberpunk">
      <h2 className="text-neon text-2xl mb-6 text-center">Mission Control</h2>

      <div className="create-mission-section">
        <h3 className="text-neon text-xl mb-4">Create New Mission</h3>
        <div className="grid grid-cols-1 gap-4">
          <Input
            placeholder="Mission Title"
            value={newMissionTitle}
            onChange={(e) => setNewMissionTitle(e.target.value)}
            className="input-cyberpunk"
          />
          <Textarea
            placeholder="Mission Description"
            value={newMissionDescription}
            onChange={(e) => setNewMissionDescription(e.target.value)}
            className="input-cyberpunk min-h-[80px]"
          />
          <Input
            type="number"
            placeholder="Reward Credits"
            value={newMissionReward === 0 ? "" : newMissionReward}
            onChange={(e) => setNewMissionReward(Number.parseInt(e.target.value) || 0)}
            className="input-cyberpunk"
          />
          <Button onClick={handleCreateMission} className="btn-cyberpunk">
            <Icons.plus className="mr-2 h-5 w-5" /> Create Mission
          </Button>
        </div>
      </div>

      <div className="mission-list-section">
        <h3 className="text-neon text-xl mb-4">Mission List</h3>
        {loading ? (
          <p className="text-center text-neon">Loading missions...</p>
        ) : missions.length === 0 ? (
          <p className="text-center text-muted-foreground">No missions found.</p>
        ) : (
          <ScrollArea className="h-[300px] pr-4">
            {missions.map((mission) => (
              <div key={mission.id} className="mission-item">
                <div className="mission-details">
                  <h4 className="mission-title">{mission.title}</h4>
                  <p className="mission-description">{mission.description}</p>
                  <p className="mission-reward">
                    Reward: <span className="text-neon">{mission.rewardCredits} ℣</span>
                  </p>
                  <p className="mission-status">
                    Status:{" "}
                    <span className={mission.status === "active" ? "text-yellow-500" : "text-green-500"}>
                      {mission.status.toUpperCase()}
                    </span>
                  </p>
                </div>
                <Button
                  onClick={() => handleToggleStatus(mission.id, mission.status)}
                  className={`btn-cyberpunk ${mission.status === "active" ? "bg-yellow-600 hover:bg-yellow-700" : "bg-green-600 hover:bg-green-700"}`}
                >
                  <Icons.check className="mr-2 h-5 w-5" />{" "}
                  {mission.status === "active" ? "Mark Completed" : "Mark Active"}
                </Button>
              </div>
            ))}
          </ScrollArea>
        )}
      </div>
    </div>
  )
}
