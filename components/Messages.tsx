import React, { useState, useEffect, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/components/ui/use-toast"

interface MessagesProps {
  username: string
  conversationId: string | null
  onStartConversation: (contactId: string) => void
}

interface Message {
  content: string
  author: string
  timestamp: string
}

interface Conversation {
  id: string
  name: string
  isOnline: boolean
  unread: number
}

let socket: Socket

const Messages: React.FC<MessagesProps> = ({ username, conversationId, onStartConversation }) => {
  const [messagesByConversation, setMessagesByConversation] = useState<{ [key: string]: Message[] }>({})
  const [inputMessage, setInputMessage] = useState('')
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [newContactName, setNewContactName] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    socketInitializer()
    fetchConversations()

    return () => {
      if (socket) socket.disconnect()
    }
  }, [])

  useEffect(() => {
    if (conversationId) {
      socket.emit('join', conversationId)
      // Clear input when switching conversations
      setInputMessage('')
    }
  }, [conversationId])

  const socketInitializer = async () => {
    await fetch('/api/socketio')
    socket = io(undefined, {
      path: '/api/socketio',
    })

    socket.on('connect', () => {
      console.log('Connected to Socket.IO server')
    })

    socket.on('message', (message: Message & { conversationId: string }) => {
      setMessagesByConversation(prev => ({
        ...prev,
        [message.conversationId]: [...(prev[message.conversationId] || []), message]
      }))
    })
  }

  const fetchConversations = async () => {
    try {
      const response = await fetch(`/api/conversations?username=${username}`)
      if (response.ok) {
        const data = await response.json()
        setConversations(data)
      }
    } catch (error) {
      console.error('Error fetching conversations:', error)
    }
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messagesByConversation])

  const sendMessage = (e: React.FormEvent | React.MouseEvent) => {
    e.preventDefault()
    if (inputMessage.trim() && conversationId) {
      const message: Message = {
        content: inputMessage,
        author: username,
        timestamp: new Date().toISOString(),
      }
      socket.emit('message', { ...message, conversationId })
      setMessagesByConversation(prev => ({
        ...prev,
        [conversationId]: [...(prev[conversationId] || []), message]
      }))
      setInputMessage('')
    }
  }

  const addContact = async () => {
    if (newContactName.trim()) {
      try {
        const response = await fetch('/api/conversations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId: newContactName, currentUser: username }),
        })

        if (response.ok) {
          const newConversation = await response.json()
          setConversations([...conversations, newConversation])
          setNewContactName('')
          toast({
            title: "Success",
            description: "Contact added successfully",
          })
        } else {
          throw new Error('Failed to add contact')
        }
      } catch (error) {
        console.error('Error adding contact:', error)
        toast({
          title: "Error",
          description: "Failed to add contact",
          variant: "destructive",
        })
      }
    }
  }

  const getHexTimestamp = () => {
    return `0x${Math.floor(Date.now() / 1000).toString(16).toUpperCase()}`;
  }

  return (
    <div className="cogitator-interface">
      <div className="interface-header">
        <div className="header-title">COGITATOR INTERFACE v2.781</div>
        <div className="header-status">ACTIVE CHANNELS: {conversations.length}</div>
      </div>
      
      <div className="interface-content">
        <div className="contacts-section">
          <div className="section-header">CONTACT DATABASE</div>
          <div className="input-section">
            <Input
              type="text"
              value={newContactName}
              onChange={(e) => setNewContactName(e.target.value)}
              placeholder="ENTER CONTACT ID"
              className="cogitator-input"
            />
            <div 
              className="execute-button"
              onClick={addContact}
              role="button"
              tabIndex={0}
            >
              EXECUTE ADD_CONTACT
            </div>
          </div>
          <div className="contact-list">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                className={`contact-entry ${conversationId === conv.id ? 'active' : ''}`}
                onClick={() => onStartConversation(conv.id)}
                role="button"
                tabIndex={0}
              >
                <span className="hex-prefix">0x{conv.id.slice(0, 6)}</span>
                <span className="contact-name">{conv.name}</span>
                {conv.unread > 0 && (
                  <span className="unread-marker">[{conv.unread}]</span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="communication-section">
          <div className="section-header">COMMUNICATION FEED</div>
          {!conversationId && (
            <div className="no-conversation-message">SELECT A CONTACT TO INITIATE TRANSMISSION</div>
          )}
          {conversationId && (
            <>
              <ScrollArea className="message-feed">
                {messagesByConversation[conversationId]?.map((message, index) => (
                  <div key={index} className={`message-entry ${message.author === username ? 'outgoing' : 'incoming'}`}>
                    <div className="message-header">
                      <span className="hex-timestamp">{getHexTimestamp()}</span>
                      <span className="message-author">{message.author.toUpperCase()}</span>
                    </div>
                    <div className="message-content">{message.content}</div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </ScrollArea>
              <form onSubmit={sendMessage} className="input-section">
                <Input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="ENTER MESSAGE"
                  className="cogitator-input"
                />
                <div 
                  className="execute-button"
                  onClick={sendMessage}
                  role="button"
                  tabIndex={0}
                >
                  EXECUTE TRANSMIT
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default Messages

