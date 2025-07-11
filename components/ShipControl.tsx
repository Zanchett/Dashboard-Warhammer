"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import CustomKnob from "./CustomKnob"
import { Icons } from "./icons"

export default function ShipControl() {
  const [enginePower, setEnginePower] = useState(50)
  const [shieldStrength, setShieldStrength] = useState(75)
  const [weaponPower, setWeaponPower] = useState(60)
  const [lifeSupport, setLifeSupport] = useState(90)
  const [currentCoords, setCurrentCoords] = useState("0.0.0.0")
  const [destinationCoords, setDestinationCoords] = useState("")
  const [warpStatus, setWarpStatus] = useState<"idle" | "engaging" | "engaged" | "disengaging">("idle")
  const { toast } = useToast()

  const handleEngageWarp = () => {
    if (warpStatus === "idle") {
      setWarpStatus("engaging")
      toast({
        title: "Warp Drive Engaging",
        description: "Entering the Immaterium. Hold fast, Inquisitor!",
      })
      setTimeout(() => {
        setWarpStatus("engaged")
        setCurrentCoords("WARP SPACE")
        toast({
          title: "Warp Drive Engaged",
          description: "You are now traversing the Warp.",
        })
      }, 3000) // Simulate warp jump time
    } else if (warpStatus === "engaged") {
      setWarpStatus("disengaging")
      toast({
        title: "Warp Drive Disengaging",
        description: "Exiting the Immaterium. Prepare for re-entry.",
      })
      setTimeout(() => {
        setWarpStatus("idle")
        setCurrentCoords("1.2.3.4") // Simulate new coordinates
        toast({
          title: "Warp Drive Disengaged",
          description: "You have arrived at your destination.",
        })
      }, 3000) // Simulate re-entry time
    }
  }

  const handleSetCourse = () => {
    if (destinationCoords.trim() === "") {
      toast({
        title: "Navigation Error",
        description: "Please enter destination coordinates.",
        variant: "destructive",
      })
      return
    }
    setCurrentCoords(destinationCoords.trim())
    toast({
      title: "Course Set",
      description: `Navigation set to ${destinationCoords.trim()}.`,
    })
  }

  return (
    <div className="ship-control-container panel-cyberpunk">
      <h2 className="text-neon text-2xl mb-6 text-center">Ship Control Panel</h2>

      {/* Power Distribution */}
      <div className="power-distribution-section mb-8">
        <h3 className="text-neon text-xl mb-4">Power Distribution</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 justify-items-center">
          <CustomKnob value={enginePower} onChange={setEnginePower} label="Engines" />
          <CustomKnob value={shieldStrength} onChange={setShieldStrength} label="Shields" />
          <CustomKnob value={weaponPower} onChange={setWeaponPower} label="Weapons" />
          <CustomKnob value={lifeSupport} onChange={setLifeSupport} label="Life Support" />
        </div>
      </div>

      {/* Navigation */}
      <div className="navigation-section mb-8">
        <h3 className="text-neon text-xl mb-4">Navigation</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <Label htmlFor="current-coords" className="text-neon">
              Current Coordinates:
            </Label>
            <Input id="current-coords" value={currentCoords} readOnly className="input-cyberpunk mt-2" />
          </div>
          <div>
            <Label htmlFor="destination-coords" className="text-neon">
              Destination Coordinates:
            </Label>
            <Input
              id="destination-coords"
              value={destinationCoords}
              onChange={(e) => setDestinationCoords(e.target.value)}
              placeholder="e.g., 123.45.67.89"
              className="input-cyberpunk mt-2"
            />
          </div>
        </div>
        <div className="flex gap-4">
          <Button onClick={handleSetCourse} className="btn-cyberpunk flex-1">
            <Icons.target className="mr-2 h-5 w-5" /> Set Course
          </Button>
          <Button
            onClick={handleEngageWarp}
            disabled={warpStatus === "engaging" || warpStatus === "disengaging"}
            className={`btn-cyberpunk flex-1 ${warpStatus === "engaged" ? "bg-accent-red hover:bg-red-700" : ""}`}
          >
            {warpStatus === "engaging" && <Icons.refreshCw className="mr-2 h-5 w-5 animate-spin" />}
            {warpStatus === "disengaging" && <Icons.refreshCw className="mr-2 h-5 w-5 animate-spin" />}
            {warpStatus === "idle" && <Icons.globe className="mr-2 h-5 w-5" />}
            {warpStatus === "engaged" && <Icons.globe className="mr-2 h-5 w-5" />}
            {warpStatus === "idle"
              ? "Engage Warp Drive"
              : warpStatus === "engaged"
                ? "Disengage Warp Drive"
                : "Processing..."}
          </Button>
        </div>
      </div>

      {/* Ship Status (Placeholder) */}
      <div className="ship-status-section">
        <h3 className="text-neon text-xl mb-4">Ship Status</h3>
        <div className="bg-darker-bg border border-neon p-4 rounded-md text-sm">
          <p>
            Hull Integrity: <span className="text-neon">98%</span>
          </p>
          <p>
            Crew Morale: <span className="text-neon">Adequate</span>
          </p>
          <p>
            Ammunition: <span className="text-neon">75%</span>
          </p>
          <p>
            Current Warp Anomaly Level: <span className="text-neon">Low</span>
          </p>
        </div>
      </div>
    </div>
  )
}
