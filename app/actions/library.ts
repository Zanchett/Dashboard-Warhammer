"use server"

import { Redis } from "@upstash/redis"

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
})

export interface LibraryItem {
  id: string
  name: string
  type: "folder" | "file"
  content?: string
  path: string[]
}

const initialLibraryContent: LibraryItem[] = [
  {
    id: "1",
    name: "Characters",
    type: "folder",
    path: [],
    content: undefined,
  },
  {
    id: "2",
    name: "Locations",
    type: "folder",
    path: [],
    content: undefined,
  },
  {
    id: "3",
    name: "Space Marines",
    type: "file",
    path: ["Characters"],
    content:
      "The Space Marines are the Imperium's finest warriors, genetically enhanced super-soldiers who serve as the Emperor's angels of death.",
  },
  {
    id: "4",
    name: "Terra",
    type: "file",
    path: ["Locations"],
    content:
      "Terra, also known as Holy Terra or Old Earth, is the throne world of the Imperium of Man and the original homeworld of mankind.",
  },
]

export async function getLibraryContent(): Promise<LibraryItem[]> {
  try {
    console.log("Attempting to fetch library content from Redis")
    const content = await redis.get("library:content")
    console.log("Raw content from Redis:", content)

    if (!content) {
      console.log("Library content not found, initializing with default content")
      await redis.set("library:content", JSON.stringify(initialLibraryContent))
      return initialLibraryContent
    }

    if (typeof content === "string") {
      try {
        const parsedContent = JSON.parse(content)
        console.log("Parsed library content:", parsedContent)
        return parsedContent
      } catch (parseError) {
        console.error("Error parsing JSON:", parseError)
        return initialLibraryContent
      }
    } else if (Array.isArray(content)) {
      console.log("Content is already an array:", content)
      return content
    } else {
      console.log("Unexpected content type:", typeof content)
      return initialLibraryContent
    }
  } catch (error) {
    console.error("Error fetching library content:", error)
    if (error instanceof Error) {
      console.error("Error message:", error.message)
      console.error("Error stack:", error.stack)
    }
    return initialLibraryContent
  }
}

export async function addLibraryItem(item: LibraryItem): Promise<boolean> {
  try {
    const content = await getLibraryContent()
    content.push(item)
    await redis.set("library:content", JSON.stringify(content))
    return true
  } catch (error) {
    console.error("Error adding library item:", error)
    return false
  }
}

export async function updateLibraryItem(item: LibraryItem): Promise<boolean> {
  try {
    const content = await getLibraryContent()
    const index = content.findIndex((i) => i.id === item.id)
    if (index !== -1) {
      content[index] = item
      await redis.set("library:content", JSON.stringify(content))
      return true
    }
    return false
  } catch (error) {
    console.error("Error updating library item:", error)
    return false
  }
}

export async function deleteLibraryItem(id: string): Promise<boolean> {
  try {
    let content = (await redis.get("library:content")) as LibraryItem[]
    if (!content) {
      return false
    }

    const itemToDelete = content.find((item) => item.id === id)
    if (!itemToDelete) {
      return false
    }

    // If it's a folder, delete all items inside it
    if (itemToDelete.type === "folder") {
      content = content.filter((item) => !item.path.includes(itemToDelete.name))
    }

    // Delete the item itself
    content = content.filter((item) => item.id !== id)

    await redis.set("library:content", JSON.stringify(content))
    return true
  } catch (error) {
    console.error("Error deleting library item:", error)
    return false
  }
}
