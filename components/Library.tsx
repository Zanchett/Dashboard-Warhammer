"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/hooks/use-toast"
import { Icons } from "./icons"
import "../styles/library.css"
import { getLibraryEntries } from "@/app/actions/library"

interface LibraryEntry {
  id: string
  title: string
  author: string
  content: string
  category: string
}

export default function Library() {
  const [entries, setEntries] = useState<LibraryEntry[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const fetchEntries = async () => {
    setLoading(true)
    try {
      const result = await getLibraryEntries()
      if (result.success && result.entries) {
        setEntries(result.entries)
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to fetch library entries.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching library entries:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred while fetching library entries.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEntries()
  }, [])

  const filteredEntries = entries.filter(
    (entry) =>
      entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.category.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="library-container panel-cyberpunk">
      <h2 className="text-neon text-2xl mb-4 text-center">Imperial Library</h2>
      <div className="library-search-bar">
        <Input
          type="text"
          placeholder="Search Library..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-cyberpunk"
        />
        <Button className="btn-cyberpunk">
          <Icons.book className="h-5 w-5" /> Search
        </Button>
      </div>
      <ScrollArea className="library-content">
        <div className="p-4">
          {loading ? (
            <p className="text-center text-neon">Loading library...</p>
          ) : filteredEntries.length === 0 ? (
            <p className="text-center text-muted-foreground">No entries found matching your search.</p>
          ) : (
            filteredEntries.map((entry) => (
              <div key={entry.id} className="library-item">
                <h3 className="text-lg font-bold">{entry.title}</h3>
                <p className="text-sm text-muted-foreground">Author: {entry.author}</p>
                <p className="text-sm text-muted-foreground">Category: {entry.category}</p>
                <p className="mt-2">{entry.content}</p>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
