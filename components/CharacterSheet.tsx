'use client'

import React, { useState, useEffect } from 'react'
import { CharacterAttributes, AttributeStats, CharacterInfo, CharacterSheet as CharacterSheetType, Skill } from '@/types/character-sheet'
import { getCharacterSheet, saveCharacterSheet } from '@/app/actions/character-sheet'
import { Input } from "@/components/ui/input"
import HealthIndicator from './HealthIndicator'
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/components/ui/use-toast"

const defaultAttributeStats: AttributeStats = {
  rating: 0,
  bonus: 0,
  total: 0
}

const defaultAttributes: CharacterAttributes = {
  strength: { ...defaultAttributeStats },
  toughness: { ...defaultAttributeStats },
  agility: { ...defaultAttributeStats },
  initiative: { ...defaultAttributeStats },
  willpower: { ...defaultAttributeStats },
  intelligence: { ...defaultAttributeStats },
  fellowship: { ...defaultAttributeStats }
}

const defaultInfo: CharacterInfo = {
  playerName: '',
  characterName: '',
  tier: '',
  species: '',
  archetype: '',
  background: '',
  rank: '',
  faction: '',
  keywords: ''
}

const attributeLabels = {
  strength: 'S',
  toughness: 'T',
  agility: 'A',
  initiative: 'I',
  willpower: 'WIL',
  intelligence: 'INT',
  fellowship: 'FEL'
}

const defaultSkills: Skill[] = [
  { name: 'Athletics', rating: 0, bonus: 0, total: 0 },
  { name: 'Awareness', rating: 0, bonus: 0, total: 0 },
  { name: 'Ballistic Skill', rating: 0, bonus: 0, total: 0 },
  { name: 'Cunning', rating: 0, bonus: 0, total: 0 },
  { name: 'Deception', rating: 0, bonus: 0, total: 0 },
  { name: 'Insight', rating: 0, bonus: 0, total: 0 },
  { name: 'Intimidation', rating: 0, bonus: 0, total: 0 },
  { name: 'Investigation', rating: 0, bonus: 0, total: 0 },
  { name: 'Leadership', rating: 0, bonus: 0, total: 0 },
  { name: 'Medicae', rating: 0, bonus: 0, total: 0 },
  { name: 'Persuasion', rating: 0, bonus: 0, total: 0 },
  { name: 'Pilot', rating: 0, bonus: 0, total: 0 },
  { name: 'Psychic Mastery', rating: 0, bonus: 0, total: 0 },
  { name: 'Scholar', rating: 0, bonus: 0, total: 0 },
  { name: 'Stealth', rating: 0, bonus: 0, total: 0 },
  { name: 'Survival', rating: 0, bonus: 0, total: 0 },
  { name: 'Tech', rating: 0, bonus: 0, total: 0 },
  { name: 'Weapon Skill', rating: 0, bonus: 0, total: 0 },
]

interface WrathStats {
  conviction: number;
  resolve: number;
  size: string;
  speed: number;
  objective: string;
  uses: {
    rerollFailedDice: boolean;
    narrativeDeclaration: boolean;
    restoreDoubleRankShock: boolean;
  };
  survival: {
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
  };
}

const defaultWrathStats: WrathStats = {
  conviction: 2,
  resolve: 1,
  size: 'Average',
  speed: 8,
  objective: '',
  uses: {
    rerollFailedDice: false,
    narrativeDeclaration: false,
    restoreDoubleRankShock: false
  },
  survival: {
    defence: 0,
    resilience: {
      base: 6,
      armour: 4,
      total: 10
    },
    wounds: {
      current: 9,
      max: 9
    },
    shock: {
      current: 6,
      max: 6,
      determination: '5+2'
    }
  }
}

interface Equipment {
  id: string;
  name: string;
  type: 'weapon' | 'armor' | 'equipment';
  description: string;
  damage?: string;
  armorClass?: number;
  quantity?: number;
}

interface CharacterSheetProps {
  username: string;
}

const CharacterSheet: React.FC<CharacterSheetProps> = ({ username }) => {
  const [attributes, setAttributes] = useState<CharacterAttributes>(defaultAttributes)
  const [info, setInfo] = useState<CharacterInfo>(defaultInfo)
  const [skills, setSkills] = useState<Skill[]>(defaultSkills)
  const [isSaving, setIsSaving] = useState(false)
  const [wrathStats, setWrathStats] = useState<WrathStats>(defaultWrathStats);
  const [health, setHealth] = useState({ current: 100, max: 100 });
  const [equipment, setEquipment] = useState<Equipment[]>([]);


  useEffect(() => {
    const loadCharacterSheet = async () => {
      const sheet = await getCharacterSheet(username)
      if (sheet) {
        setAttributes(sheet.attributes)
        setInfo(sheet.info || defaultInfo)
        setSkills(sheet.skills || defaultSkills)
        setWrathStats(sheet.wrathStats || defaultWrathStats)
        setHealth(sheet.health || { current: 100, max: 100 })
      }
    }
    loadCharacterSheet()
    fetchEquipment();
  }, [username])

  useEffect(() => {
    const saveTimeout = setTimeout(async () => {
      setIsSaving(true)
      await saveCharacterSheet(username, { attributes, info, skills, wrathStats, health })
      setIsSaving(false)
    }, 1000)

    return () => clearTimeout(saveTimeout)
  }, [attributes, info, skills, wrathStats, health, username])

  const handleAttributeChange = (
    attribute: keyof CharacterAttributes,
    field: keyof AttributeStats,
    value: string
  ) => {
    const numValue = parseInt(value) || 0
    setAttributes(prev => {
      const newAttributes = { ...prev }
      newAttributes[attribute] = {
        ...newAttributes[attribute],
        [field]: numValue
      }
      newAttributes[attribute].total = 
        (newAttributes[attribute].rating || 0) + 
        (newAttributes[attribute].bonus || 0)
      return newAttributes
    })
  }

  const handleInfoChange = (field: keyof CharacterInfo, value: string) => {
    setInfo(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSkillChange = (index: number, field: keyof Skill, value: string) => {
    const numValue = parseInt(value) || 0;
    setSkills(prev => {
      const newSkills = [...prev];
      newSkills[index] = {
        ...newSkills[index],
        [field]: numValue
      };
    
      // Calculate total based on both rating and bonus
      const rating = field === 'rating' ? numValue : newSkills[index].rating || 0;
      const bonus = field === 'bonus' ? numValue : newSkills[index].bonus || 0;
      newSkills[index].total = rating + bonus;
    
      return newSkills;
    });
  };

  const handleWrathChange = (field: keyof WrathStats, value: any) => {
    setWrathStats(prev => ({ ...prev, [field]: value }));
  };

  const handleHealthChange = (current: number, max: number) => {
    setWrathStats(prev => ({
      ...prev,
      survival: {
        ...prev.survival,
        wounds: { current, max }
      }
    }));
  };

  const fetchEquipment = async () => {
    try {
      const response = await fetch(`/api/character/${username}/equipment`);
      if (response.ok) {
        const data = await response.json();
        setEquipment(data);
      } else {
        throw new Error('Failed to fetch equipment');
      }
    } catch (error) {
      console.error('Error fetching equipment:', error);
      toast({
        title: "Error",
        description: "Failed to load character equipment",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="character-sheet">
      <div className="terminal-header">
        <span>ADEPTUS MECHANICUS PERSONNEL FILE</span>
        <span>ACCESS LEVEL: MAGOS</span>
      </div>
      <ScrollArea className="character-sheet-content">
        <div className="content-wrapper">
          <div className="sheet-layout">
            <div className="basic-info-section">
              <h2 className="section-title">BASIC INFORMATION</h2>
              <div className="info-grid">
                <div className="field-group">
                  <label>Player Name</label>
                  <Input
                    value={info.playerName}
                    onChange={(e) => handleInfoChange('playerName', e.target.value)}
                    className="cogitator-input"
                  />
                </div>
                <div className="field-group">
                  <label>Character Name</label>
                  <Input
                    value={info.characterName}
                    onChange={(e) => handleInfoChange('characterName', e.target.value)}
                    className="cogitator-input"
                  />
                </div>
                <div className="field-group">
                  <label>Tier</label>
                  <Input
                    value={info.tier}
                    onChange={(e) => handleInfoChange('tier', e.target.value)}
                    className="cogitator-input"
                  />
                </div>
                <div className="field-group">
                  <label>Species</label>
                  <Input
                    value={info.species}
                    onChange={(e) => handleInfoChange('species', e.target.value)}
                    className="cogitator-input"
                  />
                </div>
                <div className="field-group">
                  <label>Archetype</label>
                  <Input
                    value={info.archetype}
                    onChange={(e) => handleInfoChange('archetype', e.target.value)}
                    className="cogitator-input"
                  />
                </div>
                <div className="field-group">
                  <label>Faction</label>
                  <Input
                    value={info.faction}
                    onChange={(e) => handleInfoChange('faction', e.target.value)}
                    className="cogitator-input"
                  />
                </div>
              </div>
            </div>

            <div className="columns-container">
              <div className="left-column">
                <div className="sheet-section">
                  <h2 className="section-title">ATTRIBUTES</h2>
                  <div className="attributes-grid">
                    <div className="grid-header"></div>
                    {Object.entries(attributeLabels).map(([key, label]) => (
                      <div key={key} className="grid-header">{label}</div>
                    ))}

                    <div className="grid-label">Rating</div>
                    {Object.keys(attributeLabels).map((attr) => (
                      <div key={`${attr}-rating`} className="grid-cell">
                        <input
                          type="number"
                          min="0"
                          max="99"
                          value={attributes[attr as keyof CharacterAttributes].rating || ''}
                          onChange={(e) => handleAttributeChange(attr as keyof CharacterAttributes, 'rating', e.target.value)}
                          className="attribute-input"
                        />
                      </div>
                    ))}

                    <div className="grid-label">Bonus</div>
                    {Object.keys(attributeLabels).map((attr) => (
                      <div key={`${attr}-bonus`} className="grid-cell">
                        <input
                          type="number"
                          min="0"
                          max="99"
                          value={attributes[attr as keyof CharacterAttributes].bonus || ''}
                          onChange={(e) => handleAttributeChange(attr as keyof CharacterAttributes, 'bonus', e.target.value)}
                          className="attribute-input"
                        />
                      </div>
                    ))}

                    <div className="grid-label">Total</div>
                    {Object.keys(attributeLabels).map((attr) => (
                      <div key={`${attr}-total`} className="total-value">
                        {attributes[attr as keyof CharacterAttributes].total}
                      </div>
                    ))}
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="sheet-section">
                  <h2 className="section-title">SKILLS</h2>
                  <div className="skills-grid">
                    <div className="grid-header">Skill</div>
                    <div className="grid-header">Rating</div>
                    <div className="grid-header">Bonus</div>
                    <div className="grid-header">Total</div>

                    {skills.map((skill, index) => (
                      <React.Fragment key={skill.name}>
                        <div className="grid-label">{skill.name}</div>
                        <div className="grid-cell">
                          <input
                            type="number"
                            min="0"
                            max="99"
                            value={skill.rating || ''}
                            onChange={(e) => handleSkillChange(index, 'rating', e.target.value)}
                            className="skill-input"
                          />
                        </div>
                        <div className="grid-cell">
                          <input
                            type="number"
                            min="0"
                            max="99"
                            value={skill.bonus || ''}
                            onChange={(e) => handleSkillChange(index, 'bonus', e.target.value)}
                            className="skill-input"
                          />
                        </div>
                        <div className="total-value">{skill.total}</div>
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>

              <div className="right-column">
                <div className="sheet-section">
                  <h2 className="section-title">WRATH & GLORY</h2>
                  <div className="wrath-container">
                    <div className="wrath-stats">
                      <div className="wrath-stat">
                        <label>Conviction</label>
                        <input
                          type="number"
                          value={wrathStats.conviction}
                          onChange={(e) => handleWrathChange('conviction', parseInt(e.target.value) || 0)}
                          className="wrath-input"
                        />
                      </div>
                      <div className="wrath-stat">
                        <label>Resolve</label>
                        <input
                          type="number"
                          value={wrathStats.resolve}
                          onChange={(e) => handleWrathChange('resolve', parseInt(e.target.value) || 0)}
                          className="wrath-input"
                        />
                      </div>
                      <div className="wrath-stat">
                        <label>Size</label>
                        <input
                          type="text"
                          value={wrathStats.size}
                          onChange={(e) => handleWrathChange('size', e.target.value)}
                          className="wrath-input"
                        />
                      </div>
                      <div className="wrath-stat">
                        <label>Speed</label>
                        <input
                          type="number"
                          value={wrathStats.speed}
                          onChange={(e) => handleWrathChange('speed', parseInt(e.target.value) || 0)}
                          className="wrath-input"
                        />
                      </div>
                    </div>

                    <div className="survival-section">
                      <h3 className="subsection-title">Survival</h3>
                      <div className="survival-grid">
                        <div className="survival-box defence-box">
                          <label>Defence</label>
                          <input
                            type="number"
                            value={wrathStats.survival.defence}
                            onChange={(e) => handleWrathChange('survival', {...wrathStats.survival, defence: parseInt(e.target.value) || 0})}
                            className="survival-input"
                          />
                        </div>
                        <div className="survival-box resilience-box">
                          <h4 className="box-title">Resilience</h4>
                          <div className="resilience-grid">
                            <label>Base</label>
                            <input
                              type="number"
                              value={wrathStats.survival.resilience.base}
                              onChange={(e) => handleWrathChange('survival', {...wrathStats.survival, resilience: {...wrathStats.survival.resilience, base: parseInt(e.target.value) || 0}})}
                              className="survival-input"
                            />
                            <label>Armour</label>
                            <input
                              type="number"
                              value={wrathStats.survival.resilience.armour}
                              onChange={(e) => handleWrathChange('survival', {...wrathStats.survival, resilience: {...wrathStats.survival.resilience, armour: parseInt(e.target.value) || 0}})}
                              className="survival-input"
                            />
                            <label>Total</label>
                            <input
                              type="number"
                              value={wrathStats.survival.resilience.total}
                              onChange={(e) => handleWrathChange('survival', {...wrathStats.survival, resilience: {...wrathStats.survival.resilience, total: parseInt(e.target.value) || 0}})}
                              className="survival-input"
                            />
                          </div>
                        </div>
                        <div className="survival-box wounds-box">
                          <h4 className="box-title">Wounds</h4>
                          <div className="wounds-grid">
                            <label>Current</label>
                            <input
                              type="number"
                              value={wrathStats.survival.wounds.current}
                              onChange={(e) => handleWrathChange('survival', {...wrathStats.survival, wounds: {...wrathStats.survival.wounds, current: parseInt(e.target.value) || 0}})}
                              className="survival-input"
                            />
                            <label>Max</label>
                            <input
                              type="number"
                              value={wrathStats.survival.wounds.max}
                              onChange={(e) => handleWrathChange('survival', {...wrathStats.survival, wounds: {...wrathStats.survival.wounds, max: parseInt(e.target.value) || 0}})}
                              className="survival-input"
                            />
                          </div>
                        </div>
                        <div className="survival-box shock-box">
                          <h4 className="box-title">Shock</h4>
                          <div className="shock-grid">
                            <label>Current</label>
                            <input
                              type="number"
                              value={wrathStats.survival.shock.current}
                              onChange={(e) => handleWrathChange('survival', {...wrathStats.survival, shock: {...wrathStats.survival.shock, current: parseInt(e.target.value) || 0}})}
                              className="survival-input"
                            />
                            <label>Max</label>
                            <input
                              type="number"
                              value={wrathStats.survival.shock.max}
                              onChange={(e) => handleWrathChange('survival', {...wrathStats.survival, shock: {...wrathStats.survival.shock, max: parseInt(e.target.value) || 0}})}
                              className="survival-input"
                            />
                            <label>Determination</label>
                            <input
                              type="text"
                              value={wrathStats.survival.shock.determination}
                              onChange={(e) => handleWrathChange('survival', {...wrathStats.survival, shock: {...wrathStats.survival.shock, determination: e.target.value}})}
                              className="survival-input"
                            />
                          </div>
                        </div>
                      </div>
                      <HealthIndicator
                        currentHealth={wrathStats.survival.wounds.current}
                        maxHealth={wrathStats.survival.wounds.max}
                        onHealthChange={handleHealthChange}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="sheet-section">
              <h2 className="section-title">EQUIPMENT</h2>
              <div className="equipment-list">
                {equipment.map((item) => (
                  <div key={item.id} className="equipment-item">
                    <h3>{item.name}</h3>
                    <p>{item.description}</p>
                    {item.type === 'weapon' && item.damage && <p>Damage: {item.damage}</p>}
                    {item.type === 'armor' && item.armorClass && <p>Armor Class: {item.armorClass}</p>}
                    {item.type === 'equipment' && item.quantity && <p>Quantity: {item.quantity}</p>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
      <div className="save-status">
        {isSaving ? 'Saving changes...' : 'All changes saved'}
      </div>
    </div>
  )
}

export default CharacterSheet
