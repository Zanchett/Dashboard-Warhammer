import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Note {
  id: string;
  title: string;
  content: string;
  timestamp: number;
}

const Notes: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    const savedNotes = localStorage.getItem('playerNotes');
    if (savedNotes) {
      setNotes(JSON.parse(savedNotes));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('playerNotes', JSON.stringify(notes));
  }, [notes]);

  const saveNote = () => {
    if (title.trim() === '' || content.trim() === '') return;

    const newNote: Note = {
      id: currentNote ? currentNote.id : Date.now().toString(),
      title: title.trim(),
      content: content.trim(),
      timestamp: Date.now(),
    };

    setNotes(prevNotes => {
      if (currentNote) {
        return prevNotes.map(note => note.id === currentNote.id ? newNote : note);
      } else {
        return [...prevNotes, newNote];
      }
    });

    setCurrentNote(null);
    setTitle('');
    setContent('');
  };

  const editNote = (note: Note) => {
    setCurrentNote(note);
    setTitle(note.title);
    setContent(note.content);
  };

  const deleteNote = (id: string) => {
    setNotes(prevNotes => prevNotes.filter(note => note.id !== id));
    if (currentNote && currentNote.id === id) {
      setCurrentNote(null);
      setTitle('');
      setContent('');
    }
  };

  return (
    <div className="notes-container">
      <div className="notes-header">
        <h2>COGITATOR DATABANKS</h2>
        <p>Record your findings, Tech-Priest</p>
      </div>
      <div className="notes-content">
        <div className="notes-list">
          <ScrollArea className="h-[calc(100vh-200px)]">
            {notes.map(note => (
              <div key={note.id} className="note-item">
                <span className="note-title">{note.title}</span>
                <div className="note-actions">
                  <Button onClick={() => editNote(note)} className="execute-button edit-button">Edit</Button>
                  <Button onClick={() => deleteNote(note.id)} className="execute-button delete-button">Delete</Button>
                </div>
              </div>
            ))}
          </ScrollArea>
        </div>
        <div className="note-editor">
          <Input
            type="text"
            placeholder="Note Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="cogitator-input note-title-input"
          />
          <Textarea
            placeholder="Record your findings here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="cogitator-input note-content-input"
          />
          <Button onClick={saveNote} className="execute-button save-button">
            {currentNote ? 'Update Note' : 'Save Note'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Notes;
