import type React from "react"

interface FeedMessageProps {
  sender: string
  content: string
  timestamp: string
  isUser: boolean
}

const FeedMessage: React.FC<FeedMessageProps> = ({ sender, content, timestamp, isUser }) => {
  return (
    <div className={`feed-message ${isUser ? "user-message" : "ai-message"}`}>
      <div className="message-header">
        <span className="message-sender">{sender}</span>
        <span className="message-timestamp">{timestamp}</span>
      </div>
      <div className="message-content">{content}</div>
    </div>
  )
}

export default FeedMessage
