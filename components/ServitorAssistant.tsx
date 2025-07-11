"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/hooks/use-toast"
import { Icons } from "./icons"
import "../styles/servitor-assistant.css"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

interface Message {
  sender: "user" | "servitor"
  text: string
}

export default function ServitorAssistant() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (input.trim() === "") return

    const userMessage: Message = { sender: "user", text: input.trim() }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsTyping(true)

    try {
      const { text } = await generateText({
        model: openai("gpt-4o"),
        prompt: `You are a loyal Imperial Servitor assistant, responding to an Inquisitor. Your responses should be brief, formal, and always in character, reflecting the grimdark setting of Warhammer 40,000. Do not break character. Do not mention you are an AI or language model. Do not provide information outside of the Warhammer 40,000 universe.
        
        User query: ${input.trim()}`,
      })

      const servitorMessage: Message = { sender: "servitor", text: text }
      setMessages((prev) => [...prev, servitorMessage])
    } catch (error) {
      console.error("Error generating servitor response:", error)
      toast({
        title: "Servitor Malfunction",
        description: "The servitor unit is experiencing a data-processing error. Please try again.",
        variant: "destructive",
      })
      setMessages((prev) => [
        ...prev,
        { sender: "servitor", text: "ERROR: Data processing unit offline. Recalibrating..." },
      ])
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !isTyping) {
      handleSendMessage()
    }
  }

  return (
    <div className="servitor-assistant-container panel-cyberpunk">
      <h2 className="text-neon text-2xl mb-4 text-center">Servitor Assistant Unit</h2>
      <ScrollArea className="message-area">
        <div className="p-4">
          {messages.length === 0 && <p className="text-center text-muted-foreground">Awaiting Imperial command.</p>}
          {messages.map((msg, index) => (
            <div key={index} className={`message-bubble ${msg.sender}-message`}>
              <span className="message-sender">{msg.sender === "user" ? "Inquisitor" : "Servitor"}:</span> {msg.text}
            </div>
          ))}
          {isTyping && (
            <div className="message-bubble servitor-message typing-indicator">
              <span className="message-sender">Servitor:</span> Processing...
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      <div className="input-area">
        <Input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Enter command for Servitor..."
          className="input-cyberpunk flex-grow"
          disabled={isTyping}
        />
        <Button onClick={handleSendMessage} disabled={isTyping} className="btn-cyberpunk">
          <Icons.check className="h-5 w-5" />
        </Button>
      </div>
    </div>
  )
}
