"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/hooks/use-toast"
import { Icons } from "./icons"
import "../styles/contacts.css"

interface Contact {
  id: string
  name: string
  status: "online" | "offline" | "busy"
  lastSeen: string
}

const initialContacts: Contact[] = [
  { id: "1", name: "Tech-Priest Dominus", status: "online", lastSeen: "Now" },
  { id: "2", name: "Commissar Yarrick", status: "busy", lastSeen: "10 mins ago" },
  { id: "3", name: "Lord Inquisitor", status: "offline", lastSeen: "2 days ago" },
  { id: "4", name: "Captain Titus", status: "online", lastSeen: "Now" },
  { id: "5", name: "Sister of Battle", status: "busy", lastSeen: "30 mins ago" },
  { id: "6", name: "Astra Militarum Commander", status: "offline", lastSeen: "1 hour ago" },
]

export default function Contacts() {
  const [contacts, setContacts] = useState<Contact[]>(initialContacts)
  const [searchTerm, setSearchTerm] = useState("")
  const { toast } = useToast()

  const filteredContacts = contacts.filter((contact) => contact.name.toLowerCase().includes(searchTerm.toLowerCase()))

  const getStatusColor = (status: Contact["status"]) => {
    switch (status) {
      case "online":
        return "text-green-500"
      case "busy":
        return "text-yellow-500"
      case "offline":
        return "text-red-500"
      default:
        return "text-gray-500"
    }
  }

  const handleAddContact = () => {
    toast({
      title: "Feature Not Implemented",
      description: "Adding new contacts is not yet available.",
    })
  }

  return (
    <div className="contacts-container panel-cyberpunk">
      <h2 className="text-neon text-2xl mb-4 text-center">Imperial Contacts</h2>
      <div className="contacts-search-bar">
        <Input
          type="text"
          placeholder="Search contacts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-cyberpunk flex-grow"
        />
        <Button onClick={handleAddContact} className="btn-cyberpunk">
          <Icons.plus className="h-5 w-5" /> Add
        </Button>
      </div>
      <ScrollArea className="contacts-list">
        <div className="p-4">
          {filteredContacts.length === 0 ? (
            <p className="text-center text-muted-foreground">No contacts found.</p>
          ) : (
            filteredContacts.map((contact) => (
              <div key={contact.id} className="contact-item">
                <div className="contact-info">
                  <span className="contact-name">{contact.name}</span>
                  <span className={`contact-status ${getStatusColor(contact.status)}`}>
                    {contact.status.charAt(0).toUpperCase() + contact.status.slice(1)}
                  </span>
                </div>
                <span className="contact-last-seen">Last Seen: {contact.lastSeen}</span>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
