'use client'

import React, { useState, useEffect } from 'react'
import { Input } from "@/components/ui/input"
import { User, UserPlus } from 'lucide-react'
import { useToast } from "@/components/ui/use-toast"

interface ContactsProps {
  username: string;
  onStartConversation: (contactId: string) => void;
}

interface Contact {
  id: string
  name: string
}

const Contacts: React.FC<ContactsProps> = ({ username, onStartConversation }) => {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [newContactName, setNewContactName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchContacts()
  }, [])

  const fetchContacts = async () => {
    try {
      const response = await fetch(`/api/conversations?username=${username}`)
      if (response.ok) {
        const data = await response.json()
        setContacts(data)
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch contacts')
      }
    } catch (error) {
      console.error('Error fetching contacts:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch contacts",
        variant: "destructive",
      })
    }
  }

  const addContact = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newContactName.trim()) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: newContactName.trim(),
          currentUser: username
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add contact')
      }

      setContacts(prev => [...prev, data])
      setNewContactName('')
      toast({
        title: "Success",
        description: "Contact added successfully",
      })
    } catch (error) {
      console.error('Error adding contact:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add contact",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getHexId = (id: string) => {
    return `0x${id.slice(0, 6).toUpperCase()}`;
  }

  return (
    <div className="cogitator-interface">
      <div className="interface-header">
        <div className="header-title">COGITATOR INTERFACE v2.781</div>
        <div className="header-status">CONTACT DATABASE</div>
      </div>
      
      <div className="interface-content">
        <div className="content-grid">
          <div className="contacts-section">
            <div className="section-header">REGISTERED CONTACTS</div>
            <div className="contact-list">
              {contacts.map((contact) => (
                <div key={contact.id} className="contact-entry">
                  <User className="w-4 h-4 mr-2" />
                  <span className="hex-prefix">{getHexId(contact.id)}</span>
                  <span className="contact-name">{contact.name}</span>
                  <div 
                    className="execute-button ml-auto"
                    onClick={() => onStartConversation(contact.id)}
                    role="button"
                    tabIndex={0}
                  >
                    INITIATE TRANSMISSION
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="add-contact-section">
            <div className="section-header">ADD NEW CONTACT</div>
            <form onSubmit={addContact} className="add-contact-form">
              <div className="input-section">
                <Input
                  type="text"
                  value={newContactName}
                  onChange={(e) => setNewContactName(e.target.value)}
                  placeholder="ENTER CONTACT ID"
                  className="cogitator-input"
                  disabled={isLoading}
                />
              </div>
              <div 
                className="execute-button"
                onClick={addContact}
                role="button"
                tabIndex={0}
              >
                {isLoading ? (
                  "PROCESSING..."
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    EXECUTE ADD_CONTACT
                  </>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Contacts

