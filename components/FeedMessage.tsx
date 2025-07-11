import type React from "react"
import { cn } from "@/lib/utils"
import "../styles/messages.css"

interface FeedMessageProps {
  sender: string
  text: string
  timestamp: string
  isUser: boolean
}

const FeedMessage: React.FC<FeedMessageProps> = ({ sender, text, timestamp, isUser }) => {
  return (
    <div className={cn("message-bubble", isUser ? "user-message" : "other-message")}>
      <div className="message-header">
        <span className="message-sender">{sender}</span>
        <span className="message-timestamp">{timestamp}</span>
      </div>
      <div className="message-text">{text}</div>
    </div>
  )
}

export default FeedMessage
