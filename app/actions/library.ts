"use server"

import { Redis } from "@upstash/redis"

const redis = Redis.fromEnv()

interface LibraryEntry {
  id: string
  title: string
  author: string
  content: string
  category: string
}

// Seed initial data if not present
async function seedLibraryData() {
  const entryCount = await redis.llen("library:all_ids")
  if (entryCount === 0) {
    const initialEntries: LibraryEntry[] = [
      {
        id: "lib1",
        title: "The Imperial Creed",
        author: "Ecclesiarchy",
        content: "The foundational tenets of faith in the God-Emperor of Mankind.",
        category: "Theology",
      },
      {
        id: "lib2",
        title: "Xenos Threat Assessment: Tyranids",
        author: "Ordo Xenos",
        content: "Detailed analysis of the Tyranid hive fleets, their biology, and tactics.",
        category: "Xenology",
      },
      {
        id: "lib3",
        title: "A Brief History of the Horus Heresy",
        author: "Inquisitor Czevak",
        content: "An overview of the galaxy-spanning civil war that nearly destroyed the Imperium.",
        category: "History",
      },
      {
        id: "lib4",
        title: "Mechanicus Rites of Maintenance",
        author: "Adeptus Mechanicus",
        content: "Sacred rituals and procedures for the upkeep of Imperial machinery.",
        category: "Tech-Lore",
      },
      {
        id: "lib5",
        title: "Tactical Doctrine: Urban Warfare",
        author: "Astra Militarum",
        content: "Strategies and considerations for combat operations in dense urban environments.",
        category: "Military",
      },
    ]

    const pipeline = redis.pipeline()
    for (const entry of initialEntries) {
      pipeline.hset(`library:entry:${entry.id}`, entry)
      pipeline.rpush("library:all_ids", entry.id)
    }
    await pipeline.exec()
    console.log("Library data seeded.")
  }
}

// Call seed function on server startup (or first access)
seedLibraryData()

export async function getLibraryEntries(): Promise<{ success: boolean; entries?: LibraryEntry[]; message?: string }> {
  try {
    const ids = await redis.lrange("library:all_ids", 0, -1)
    const pipeline = redis.pipeline()
    for (const id of ids) {
      pipeline.hgetall(`library:entry:${id}`)
    }
    const results = await pipeline.exec()
    const entries: LibraryEntry[] = results.map((res) => res.result as LibraryEntry)
    return { success: true, entries }
  } catch (error) {
    console.error("Error fetching library entries:", error)
    return { success: false, message: "Failed to fetch library entries." }
  }
}

export async function getLibraryEntry(
  id: string,
): Promise<{ success: boolean; entry?: LibraryEntry; message?: string }> {
  try {
    const entry = await redis.hgetall(`library:entry:${id}`)
    if (entry) {
      return { success: true, entry: entry as LibraryEntry }
    } else {
      return { success: false, message: "Entry not found." }
    }
  } catch (error) {
    console.error("Error fetching library entry:", error)
    return { success: false, message: "Failed to fetch library entry." }
  }
}
