import React from 'react';

interface FeedMessageProps {
  message: {
    content: string;
    author: string;
    timestamp: string;
  };
  currentUser: string;
}

export function FeedMessage({ message, currentUser }: FeedMessageProps) {
  const isSentByCurrentUser = message.author === currentUser;

  return (
    <div className={`message ${isSentByCurrentUser ? 'message--sent' : 'message--received'}`}>
      <div className="message__header">
        <span className="message__author">{message.author}</span>
      </div>
      <div className="message__body">
        <div>{message.content}</div>
      </div>
      <div className="message__footer">
        <span className="message__timestamp">
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
}

