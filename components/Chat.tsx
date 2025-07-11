import React, { useState, useEffect, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { FeedMessage } from './FeedMessage'

interface ChatProps {
  username: string
  conversationId: string
}

interface Message {
  content: string
  author: string
  timestamp: string
}

let socket: Socket

const Chat: React.FC<ChatProps> = ({ username, conversationId }) => {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    socketInitializer()

    return () => {
      if (socket) socket.disconnect()
    }
  }, [])

  const socketInitializer = async () => {
    await fetch('/api/socketio')
    socket = io(undefined, {
      path: '/api/socketio',
    })

    socket.on('connect', () => {
      console.log('Connected to Socket.IO server')
      socket.emit('join', conversationId)
    })

    socket.on('message', (message: Message) => {
      setMessages((prevMessages) => [...prevMessages, message])
    })
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputMessage.trim()) {
      const message: Message = {
        content: inputMessage,
        author: username,
        timestamp: new Date().toISOString(),
      }
      socket.emit('message', { ...message, conversationId })
      setInputMessage('')
    }
  }

  return (
    <div className="chat-container">
      <div className="messages-container">
        {messages.map((message, index) => (
          <FeedMessage key={index} message={message} currentUser={username} />
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={sendMessage} className="message-input">
        <Input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Type your message..."
        />
        <Button type="submit">Send</Button>
      </form>
    </div>
  )
}

export default Chat
