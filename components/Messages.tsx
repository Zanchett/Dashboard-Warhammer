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

interface Conversation {
  id: string
  name: string
  lastMessage: string
  lastMessageTime: string
}

const initialConversations: Conversation[] = [
  { id: "conv1", name: "Tech-Priest Dominus", lastMessage: "Data transfer complete.", lastMessageTime: "14:30" },
  { id: "conv2", name: "Commissar Yarrick", lastMessage: "Enemy forces engaged.", lastMessageTime: "Yesterday" },
  { id: "conv3", name: "Lord Inquisitor", lastMessage: "Report on xenos activity.", lastMessageTime: "2 days ago" },
]

export default function Messages() {
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations)
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  const fetchMessages = async (convId: string) => {
    try {
      const response = await fetch(`/api/messages/${convId}`)
      if (response.ok) {
        const data: Message[] = await response.json()
        setMessages(data)
      } else {
        toast({
          title: "Error",
          description: "Failed to load messages for this conversation.",
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
    if (activeConversationId) {
      fetchMessages(activeConversationId)
      // Polling for new messages (for simplicity, replace with websockets in real app)
      const interval = setInterval(() => fetchMessages(activeConversationId), 5000)
      return () => clearInterval(interval)
    }
  }, [activeConversationId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSendMessage = async () => {
    if (input.trim() === "" || !activeConversationId) return

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
        body: JSON.stringify({ conversationId: activeConversationId, ...newMessage }),
      })

      if (response.ok) {
        setMessages((prev) => [...prev, newMessage])
        setInput("")
        // Update last message in conversations list
        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === activeConversationId
              ? { ...conv, lastMessage: newMessage.text, lastMessageTime: newMessage.timestamp }
              : conv,
          ),
        )
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
    <div className="messages-layout panel-cyberpunk">
      <div className="conversations-sidebar">
        <h3 className="text-neon text-xl mb-4">Conversations</h3>
        <ScrollArea className="h-[calc(100%-60px)]">
          {conversations.length === 0 ? (
            <p className="text-center text-muted-foreground">No conversations.</p>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.id}
                className={`conversation-item ${activeConversationId === conv.id ? "active" : ""}`}
                onClick={() => setActiveConversationId(conv.id)}
              >
                <div className="conversation-info">
                  <span className="conversation-name">{conv.name}</span>
                  <span className="conversation-time">{conv.lastMessageTime}</span>
                </div>
                <p className="conversation-last-message">{conv.lastMessage}</p>
              </div>
            ))
          )}
        </ScrollArea>
      </div>
      <div className="message-panel">
        {activeConversationId ? (
          <>
            <div className="message-panel-header">
              <h3 className="text-neon text-xl">
                {conversations.find((c) => c.id === activeConversationId)?.name || "Unknown"}
              </h3>
            </div>
            <ScrollArea className="message-area">
              <div className="p-4">
                {messages.length === 0 && (
                  <p className="text-center text-muted-foreground">No messages in this conversation.</p>
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
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Select a conversation to view messages.
          </div>
        )}
      </div>
    </div>
  )
}
