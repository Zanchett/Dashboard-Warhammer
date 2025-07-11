"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/hooks/use-toast"
import { Icons } from "./icons"
import FeedMessage from "./FeedMessage"
import "../styles/messages.css"

interface Message {
  sender: string
  text: string
  timestamp: string
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  const conversationId = "general-chat" // Hardcoded for a general chat

  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/messages?conversationId=${conversationId}`)
      if (response.ok) {
        const data: Message[] = await response.json()
        setMessages(data)
      } else {
        toast({
          title: "Error",
          description: "Failed to load messages.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching messages:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred while loading messages.",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    fetchMessages()
    // Polling for new messages (for simplicity, replace with websockets in real app)
    const interval = setInterval(fetchMessages, 5000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSendMessage = async () => {
    if (input.trim() === "") return

    const newMessage: Message = {
      sender: "Inquisitor", // Replace with actual user's name
      text: input.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }

    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ conversationId, ...newMessage }),
      })

      if (response.ok) {
        setMessages((prev) => [...prev, newMessage])
        setInput("")
      } else {
        toast({
          title: "Error",
          description: "Failed to send message.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error sending message:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred while sending message.",
        variant: "destructive",
      })
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSendMessage()
    }
  }

  return (
    <div className="chat-container panel-cyberpunk">
      <ScrollArea className="message-area">
        <div className="p-4">
          {messages.length === 0 && (
            <p className="text-center text-muted-foreground">No messages yet. Start a conversation!</p>
          )}
          {messages.map((msg, index) => (
            <FeedMessage
              key={index}
              sender={msg.sender}
              text={msg.text}
              timestamp={msg.timestamp}
              isUser={msg.sender === "Inquisitor"} // Adjust based on actual user
            />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      <div className="input-area">
        <Input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message..."
          className="input-cyberpunk flex-grow"
        />
        <Button onClick={handleSendMessage} className="btn-cyberpunk">
          <Icons.messageSquare className="h-5 w-5" />
        </Button>
      </div>
    </div>
  )
}
