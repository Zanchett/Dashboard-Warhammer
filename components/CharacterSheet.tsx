"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Slider } from "@/components/ui/slider"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import type { Character, Skill, Talent, Item } from "@/types/character-sheet"
import "../styles/character-sheet.css"
import { updateCharacterSheet } from "@/app/actions/character-sheet"

export default function CharacterSheet() {
  const [character, setCharacter] = useState<Character>({
    id: "1", // Placeholder ID
    name: "Inquisitor Kaelen",
    class: "Inquisitor",
    rank: "Acolyte",
    faction: "Ordo Hereticus",
    attributes: {
      strength: 30,
      agility: 35,
      toughness: 40,
      intelligence: 50,
      willpower: 45,
      fellowship: 30,
    },
    skills: [
      { name: "Investigation", value: 45 },
      { name: "Lore (Imperium)", value: 50 },
      { name: "Intimidation", value: 35 },
    ],
    talents: [
      { name: "Quick Draw", description: "Can draw a weapon as a free action." },
      { name: "Iron Will", description: "Gain +10 to Willpower tests against fear." },
    ],
    inventory: [
      { name: "Bolt Pistol", quantity: 1, description: "Standard issue sidearm." },
      { name: "Chainsword", quantity: 1, description: "Close combat weapon." },
      { name: "Data-slate", quantity: 1, description: "For recording information." },
    ],
    notes: "Currently investigating xenos cult activity on Hive World Tertium.",
    xp: 1500,
    xpNeeded: 2000,
    health: 80,
    maxHealth: 100,
  })
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    // In a real application, fetch character data from a database
    // For now, using initial state as placeholder
  }, [])

  const handleAttributeChange = (attr: keyof typeof character.attributes, value: number[]) => {
    setCharacter((prev) => ({
      ...prev,
      attributes: {
        ...prev.attributes,
        [attr]: value[0],
      },
    }))
  }

  const handleSkillChange = (index: number, field: keyof Skill, value: string | number) => {
    const newSkills = [...character.skills]
    ;(newSkills[index] as any)[field] = value
    setCharacter((prev) => ({ ...prev, skills: newSkills }))
  }

  const handleTalentChange = (index: number, field: keyof Talent, value: string) => {
    const newTalents = [...character.talents]
    ;(newTalents[index] as any)[field] = value
    setCharacter((prev) => ({ ...prev, talents: newTalents }))
  }

  const handleInventoryChange = (index: number, field: keyof Item, value: string | number) => {
    const newInventory = [...character.inventory]
    ;(newInventory[index] as any)[field] = value
    setCharacter((prev) => ({ ...prev, inventory: newInventory }))
  }

  const addSkill = () => {
    setCharacter((prev) => ({
      ...prev,
      skills: [...prev.skills, { name: "", value: 0 }],
    }))
  }

  const removeSkill = (index: number) => {
    setCharacter((prev) => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index),
    }))
  }

  const addTalent = () => {
    setCharacter((prev) => ({
      ...prev,
      talents: [...prev.talents, { name: "", description: "" }],
    }))
  }

  const removeTalent = (index: number) => {
    setCharacter((prev) => ({
      ...prev,
      talents: prev.talents.filter((_, i) => i !== index),
    }))
  }

  const addItem = () => {
    setCharacter((prev) => ({
      ...prev,
      inventory: [...prev.inventory, { name: "", quantity: 1, description: "" }],
    }))
  }

  const removeItem = (index: number) => {
    setCharacter((prev) => ({
      ...prev,
      inventory: prev.inventory.filter((_, i) => i !== index),
    }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // Call the server action
      const result = await updateCharacterSheet(character)
      if (result.success) {
        toast({
          title: "Character Sheet Saved",
          description: "Your character data has been updated.",
        })
      } else {
        toast({
          title: "Save Error",
          description: result.message || "Failed to save character data.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error saving character sheet:", error)
      toast({
        title: "Save Error",
        description: "An unexpected error occurred while saving.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const xpProgress = (character.xp / character.xpNeeded) * 100

  return (
    <ScrollArea className="h-[calc(100vh-180px)] w-full pr-4">
      <div className="character-sheet-container panel-cyberpunk">
        <h2 className="text-neon text-2xl mb-6 text-center">Character Sheet: {character.name}</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Basic Info */}
          <div className="info-section">
            <h3 className="text-neon text-xl mb-4">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name" className="text-neon">
                  Name
                </Label>
                <Input
                  id="name"
                  value={character.name}
                  onChange={(e) => setCharacter({ ...character, name: e.target.value })}
                  className="input-cyberpunk"
                />
              </div>
              <div>
                <Label htmlFor="class" className="text-neon">
                  Class
                </Label>
                <Input
                  id="class"
                  value={character.class}
                  onChange={(e) => setCharacter({ ...character, class: e.target.value })}
                  className="input-cyberpunk"
                />
              </div>
              <div>
                <Label htmlFor="rank" className="text-neon">
                  Rank
                </Label>
                <Input
                  id="rank"
                  value={character.rank}
                  onChange={(e) => setCharacter({ ...character, rank: e.target.value })}
                  className="input-cyberpunk"
                />
              </div>
              <div>
                <Label htmlFor="faction" className="text-neon">
                  Faction
                </Label>
                <Input
                  id="faction"
                  value={character.faction}
                  onChange={(e) => setCharacter({ ...character, faction: e.target.value })}
                  className="input-cyberpunk"
                />
              </div>
            </div>
          </div>

          {/* Health & XP */}
          <div className="info-section">
            <h3 className="text-neon text-xl mb-4">Status</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="health" className="text-neon">
                  Health ({character.health}/{character.maxHealth})
                </Label>
                <Progress value={character.health} max={character.maxHealth} className="w-full mt-2" />
                <Slider
                  value={[character.health]}
                  max={character.maxHealth}
                  step={1}
                  onValueChange={(val) => setCharacter({ ...character, health: val[0] })}
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="xp" className="text-neon">
                  Experience ({character.xp}/{character.xpNeeded})
                </Label>
                <Progress value={xpProgress} className="w-full mt-2" />
                <Slider
                  value={[character.xp]}
                  max={character.xpNeeded}
                  step={10}
                  onValueChange={(val) => setCharacter({ ...character, xp: val[0] })}
                  className="mt-2"
                />
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-8 bg-neon" />

        {/* Attributes */}
        <div className="info-section mb-8">
          <h3 className="text-neon text-xl mb-4">Attributes</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(character.attributes).map(([key, value]) => (
              <div key={key}>
                <Label htmlFor={key} className="text-neon capitalize">
                  {key}: {value}
                </Label>
                <Slider
                  id={key}
                  value={[value]}
                  max={100}
                  step={1}
                  onValueChange={(val) => handleAttributeChange(key as keyof typeof character.attributes, val)}
                  className="mt-2"
                />
              </div>
            ))}
          </div>
        </div>

        <Separator className="my-8 bg-neon" />

        {/* Skills */}
        <div className="info-section mb-8">
          <h3 className="text-neon text-xl mb-4 flex justify-between items-center">
            Skills
            <Button onClick={addSkill} className="btn-cyberpunk btn-sm">
              Add Skill
            </Button>
          </h3>
          <div className="space-y-4">
            {character.skills.map((skill, index) => (
              <div key={index} className="flex items-center gap-4">
                <Input
                  placeholder="Skill Name"
                  value={skill.name}
                  onChange={(e) => handleSkillChange(index, "name", e.target.value)}
                  className="input-cyberpunk flex-grow"
                />
                <Input
                  type="number"
                  placeholder="Value"
                  value={skill.value}
                  onChange={(e) => handleSkillChange(index, "value", Number.parseInt(e.target.value) || 0)}
                  className="input-cyberpunk w-24"
                />
                <Button
                  variant="destructive"
                  onClick={() => removeSkill(index)}
                  className="btn-cyberpunk btn-sm bg-accent-red hover:bg-red-700"
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        </div>

        <Separator className="my-8 bg-neon" />

        {/* Talents */}
        <div className="info-section mb-8">
          <h3 className="text-neon text-xl mb-4 flex justify-between items-center">
            Talents
            <Button onClick={addTalent} className="btn-cyberpunk btn-sm">
              Add Talent
            </Button>
          </h3>
          <div className="space-y-4">
            {character.talents.map((talent, index) => (
              <div key={index} className="flex flex-col gap-2 border border-neon p-3 rounded-md">
                <Input
                  placeholder="Talent Name"
                  value={talent.name}
                  onChange={(e) => handleTalentChange(index, "name", e.target.value)}
                  className="input-cyberpunk"
                />
                <Textarea
                  placeholder="Talent Description"
                  value={talent.description}
                  onChange={(e) => handleTalentChange(index, "description", e.target.value)}
                  className="input-cyberpunk"
                />
                <Button
                  variant="destructive"
                  onClick={() => removeTalent(index)}
                  className="btn-cyberpunk btn-sm bg-accent-red hover:bg-red-700 self-end"
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        </div>

        <Separator className="my-8 bg-neon" />

        {/* Inventory */}
        <div className="info-section mb-8">
          <h3 className="text-neon text-xl mb-4 flex justify-between items-center">
            Inventory
            <Button onClick={addItem} className="btn-cyberpunk btn-sm">
              Add Item
            </Button>
          </h3>
          <div className="space-y-4">
            {character.inventory.map((item, index) => (
              <div key={index} className="flex flex-col gap-2 border border-neon p-3 rounded-md">
                <div className="flex items-center gap-4">
                  <Input
                    placeholder="Item Name"
                    value={item.name}
                    onChange={(e) => handleInventoryChange(index, "name", e.target.value)}
                    className="input-cyberpunk flex-grow"
                  />
                  <Input
                    type="number"
                    placeholder="Qty"
                    value={item.quantity}
                    onChange={(e) => handleInventoryChange(index, "quantity", Number.parseInt(e.target.value) || 0)}
                    className="input-cyberpunk w-20"
                  />
                </div>
                <Textarea
                  placeholder="Item Description"
                  value={item.description}
                  onChange={(e) => handleInventoryChange(index, "description", e.target.value)}
                  className="input-cyberpunk"
                />
                <Button
                  variant="destructive"
                  onClick={() => removeItem(index)}
                  className="btn-cyberpunk btn-sm bg-accent-red hover:bg-red-700 self-end"
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        </div>

        <Separator className="my-8 bg-neon" />

        {/* Notes */}
        <div className="info-section mb-8">
          <h3 className="text-neon text-xl mb-4">Notes</h3>
          <Textarea
            placeholder="Add any relevant notes here..."
            value={character.notes}
            onChange={(e) => setCharacter({ ...character, notes: e.target.value })}
            className="input-cyberpunk min-h-[150px]"
          />
        </div>

        <div className="text-center">
          <Button onClick={handleSave} disabled={isSaving} className="btn-cyberpunk text-lg px-8 py-3">
            {isSaving ? "Saving..." : "Save Character Sheet"}
          </Button>
        </div>
      </div>
    </ScrollArea>
  )
}
