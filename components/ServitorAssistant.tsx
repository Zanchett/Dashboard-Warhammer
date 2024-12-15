import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Cog, Send } from 'lucide-react';

interface Message {
  content: string;
  sender: 'user' | 'servitor';
}

const ServitorAssistant: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { content: "Greetings, human. I am Servitor Unit XJ-2481. How may I assist you in service to the Omnissiah?", sender: 'servitor' }
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (input.trim()) {
      setMessages([...messages, { content: input, sender: 'user' }]);
      setInput('');
      setTimeout(() => {
        const servitorResponse = getServitorResponse(input);
        setMessages(prev => [...prev, { content: servitorResponse, sender: 'servitor' }]);
      }, 1000);
    }
  };

  const getServitorResponse = (userInput: string): string => {
    const lowerInput = userInput.toLowerCase();
    if (lowerInput.includes('emperor') || lowerInput.includes('imperium')) {
      return "The Emperor protects. His divine will guides the Imperium of Man across the stars.";
    } else if (lowerInput.includes('tech') || lowerInput.includes('support')) {
      return "I can assist with basic cogitator operations. What seems to be malfunctioning?";
    } else if (lowerInput.includes('mission') || lowerInput.includes('briefing')) {
      return "Accessing mission data... Error. Clearance level insufficient. Please consult your commanding officer for mission details.";
    } else {
      return "Apologies, my knowledge banks do not contain relevant information. Please rephrase your query or consult a Tech-Priest for further assistance.";
    }
  };

  return (
    <div className="servitor-assistant bg-black border border-primary p-4 rounded-lg h-[500px] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-primary text-xl font-bold">Servitor Assistant XJ-2481</h2>
        <Cog className="text-primary animate-spin" />
      </div>
      <ScrollArea className="flex-grow mb-4 pr-4">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[80%] p-2 rounded ${
                  message.sender === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground'
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      <div className="flex space-x-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Enter your query..."
          className="flex-grow"
        />
        <Button onClick={handleSend}>
          <Send className="w-4 h-4 mr-2" />
          Send
        </Button>
      </div>
    </div>
  );
};

export default ServitorAssistant;

