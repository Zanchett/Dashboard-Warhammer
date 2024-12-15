'use server'

import { Redis } from '@upstash/redis'
import { CharacterSheet } from '@/types/character-sheet'

const redis = new Redis({
  url: process.env.KV_REST_API_URL || '',
  token: process.env.KV_REST_API_TOKEN || '',
})

export async function getCharacterSheet(userId: string): Promise<CharacterSheet | null> {
  try {
    const sheet = await redis.get(`character-sheet:${userId}`)
    return sheet as CharacterSheet
  } catch (error) {
    console.error('Error fetching character sheet:', error)
    return null
  }
}

export async function saveCharacterSheet(userId: string, sheetData: Omit<CharacterSheet, 'userId' | 'lastUpdated'>): Promise<boolean> {
  try {
    const sheet: CharacterSheet = {
      userId,
      ...sheetData,
      lastUpdated: new Date().toISOString()
    }
    await redis.set(`character-sheet:${userId}`, sheet)
    return true
  } catch (error) {
    console.error('Error saving character sheet:', error)
    return false
  }
}

