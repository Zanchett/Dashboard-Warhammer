"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/hooks/use-toast"
import { Icons } from "./icons"
import { getNotes, saveNote, deleteNote } from "@/app/actions/notes" // Assuming you'll create these actions

interface Note {
  id: string
  title: string
  content: string
  createdAt: string
  updatedAt: string
}

const Notes: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([])
  const [activeNote, setActiveNote] = useState<Note | null>(null)
  const [newNoteTitle, setNewNoteTitle] = useState("")
  const [newNoteContent, setNewNoteContent] = useState("")
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const fetchNotes = async () => {
    setLoading(true)
    try {
      const result = await getNotes()
      if (result.success && result.notes) {
        setNotes(result.notes)
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to fetch notes.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching notes:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred while fetching notes.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotes()
  }, [])

  const handleSelectNote = (note: Note) => {
    setActiveNote(note)
    setNewNoteTitle(note.title)
    setNewNoteContent(note.content)
  }

  const handleNewNote = () => {
    setActiveNote(null)
    setNewNoteTitle("")
    setNewNoteContent("")
  }

  const handleSaveNote = async () => {
    if (!newNoteTitle.trim() || !newNoteContent.trim()) {
      toast({
        title: "Missing Information",
        description: "Note title and content cannot be empty.",
        variant: "destructive",
      })
      return
    }

    const noteData = {
      id: activeNote?.id || `note-${Date.now()}`, // Generate ID for new notes
      title: newNoteTitle.trim(),
      content: newNoteContent.trim(),
      createdAt: activeNote?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    try {
      const result = await saveNote(noteData)
      if (result.success && result.note) {
        if (activeNote) {
          // Update existing note
          setNotes((prev) => prev.map((n) => (n.id === result.note!.id ? result.note! : n)))
        } else {
          // Add new note
          setNotes((prev) => [...prev, result.note!])
        }
        setActiveNote(result.note)
        toast({
          title: "Note Saved",
          description: "Your note has been saved.",
        })
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to save note.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error saving note:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred while saving note.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteNote = async () => {
    if (!activeNote) return

    if (window.confirm(`Are you sure you want to delete "${activeNote.title}"?`)) {
      try {
        const result = await deleteNote(activeNote.id)
        if (result.success) {
          setNotes((prev) => prev.filter((n) => n.id !== activeNote.id))
          handleNewNote() // Clear active note and form
          toast({
            title: "Note Deleted",
            description: "Your note has been deleted.",
          })
        } else {
          toast({
            title: "Error",
            description: result.message || "Failed to delete note.",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Error deleting note:", error)
        toast({
          title: "Error",
          description: "An unexpected error occurred while deleting note.",
          variant: "destructive",
        })
      }
    }
  }

  return (
    <div className="notes-layout panel-cyberpunk">
      <div className="notes-sidebar">
        <h3 className="text-neon text-xl mb-4">Personal Notes</h3>
        <Button onClick={handleNewNote} className="btn-cyberpunk w-full mb-4">
          <Icons.plus className="mr-2 h-5 w-5" /> Add New Note
        </Button>
        <ScrollArea className="h-[calc(100%-120px)] pr-4">
          {loading ? (
            <p className="text-center text-neon">Loading notes...</p>
          ) : notes.length === 0 ? (
            <p className="text-center text-muted-foreground">No notes found.</p>
          ) : (
            notes.map((note) => (
              <div
                key={note.id}
                className={`note-item ${activeNote?.id === note.id ? "active" : ""}`}
                onClick={() => handleSelectNote(note)}
              >
                <h4 className="note-item-title">{note.title}</h4>
                <p className="note-item-date">{new Date(note.updatedAt).toLocaleDateString()}</p>
              </div>
            ))
          )}
        </ScrollArea>
      </div>
      <div className="note-editor-panel">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-neon text-xl">{activeNote ? "Edit Note" : "New Note"}</h3>
          {activeNote && (
            <Button onClick={handleDeleteNote} className="btn-cyberpunk bg-accent-red hover:bg-red-700">
              <Icons.x className="mr-2 h-5 w-5" /> Delete Note
            </Button>
          )}
        </div>
        <div className="grid gap-4">
          <div>
            <label htmlFor="note-title" className="text-neon">
              Note Title
            </label>
            <Input
              id="note-title"
              value={newNoteTitle}
              onChange={(e) => setNewNoteTitle(e.target.value)}
              className="input-cyberpunk mt-2"
            />
          </div>
          <div>
            <label htmlFor="note-content" className="text-neon">
              Note Content
            </label>
            <Textarea
              id="note-content"
              value={newNoteContent}
              onChange={(e) => setNewNoteContent(e.target.value)}
              className="input-cyberpunk mt-2 min-h-[200px]"
            />
          </div>
          <Button onClick={handleSaveNote} className="btn-cyberpunk">
            <Icons.check className="mr-2 h-5 w-5" /> Save Note
          </Button>
        </div>
      </div>
    </div>
  )
}

export default Notes
