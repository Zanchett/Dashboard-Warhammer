"use server"

import { Redis } from "@upstash/redis"
import type { Character } from "@/types/character-sheet"

const redis = Redis.fromEnv()

export async function getCharacterSheet(
  characterId: string,
): Promise<{ success: boolean; character?: Character; message?: string }> {
  try {
    const characterData = await redis.get<Character>(`character:${characterId}`)
    if (characterData) {
      return { success: true, character: characterData }
    } else {
      return { success: false, message: "Character not found." }
    }
  } catch (error) {
    console.error("Error fetching character sheet:", error)
    return { success: false, message: "Failed to fetch character sheet." }
  }
}

export async function updateCharacterSheet(
  character: Character,
): Promise<{ success: boolean; character?: Character; message?: string }> {
  try {
    await redis.set(`character:${character.id}`, character)
    return { success: true, character: character }
  } catch (error) {
    console.error("Error updating character sheet:", error)
    return { success: false, message: "Failed to update character sheet." }
  }
}
