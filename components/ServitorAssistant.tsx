import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { getLibraryContent, LibraryItem } from '@/app/actions/library';

interface Message {
  content: string;
  sender: 'user' | 'servitor';
  delay?: number;
}

const ServitorAssistant: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [libraryContent, setLibraryContent] = useState<LibraryItem[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    setMessages([{ content: "Saudações, humano. Eu sou a Unidade Servitora XJ-2481. Como posso ajudá-lo a serviço do Onissiah?", sender: 'servitor' }]);
    fetchLibraryContent();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchLibraryContent = async () => {
    try {
      const content = await getLibraryContent();
      setLibraryContent(content);
    } catch (error) {
      console.error('Error fetching library content:', error);
      toast({
        title: "Error",
        description: "Failed to fetch library content",
        variant: "destructive",
      });
    }
  };

  const searchLibrary = (query: string): string | null => {
    const lowerQuery = query.toLowerCase();
    for (const item of libraryContent) {
      if (item.type === 'file' && item.content && item.content.toLowerCase().includes(lowerQuery)) {
        return item.content;
      }
    }
    return null;
  };

  const getServitorResponse = (userInput: string): Message[] => {
    const lowerInput = userInput.toLowerCase();
    if (lowerInput.includes('imperador') || lowerInput.includes('imperium')) {
      return [{ content: "O Imperador protege. Sua vontade divina guia o Imperium da Humanidade através das estrelas.", sender: 'servitor' }];
    } else if (lowerInput.includes('tech') || lowerInput.includes('suporte')) {
      return [{ content: "Posso ajudar com operações básicas do cogitador. O que parece estar com mau funcionamento?", sender: 'servitor' }];
    } else if (lowerInput.includes('missão') || lowerInput.includes('briefing')) {
      return [{ content: "Acessando dados da missão... Erro. Nível de autorização insuficiente. Por favor, consulte seu oficial comandante para detalhes da missão.", sender: 'servitor' }];
    } else {
      const libraryResult = searchLibrary(lowerInput);
      if (libraryResult) {
        return [
          { content: "Encontrei esta informação nos registros:", sender: 'servitor', delay: 1000 },
          { content: libraryResult, sender: 'servitor', delay: 2000 }
        ];
      }
      return [{ content: "Desculpe, meus bancos de conhecimento não contêm informações relevantes. Por favor, reformule sua consulta ou consulte um Tecno-Sacerdote para mais assistência.", sender: 'servitor' }];
    }
  };

  const handleSend = () => {
    if (input.trim()) {
      setMessages(prev => [...prev, { content: input, sender: 'user' }]);
      setInput('');
      const servitorResponses = getServitorResponse(input);
      servitorResponses.forEach((response, index) => {
        setTimeout(() => {
          setMessages(prev => [...prev, response]);
        }, (response.delay || 1000) * (index + 1));
      });
    }
  };

  return (
    <div className="servitor-assistant">
      <div className="terminal-outer-frame">
        <div className="terminal-inner-frame">
          <div className="terminal-header">
            <span>SERVITOR ASSISTANT XJ-2481</span>
            <span>STATUS: ONLINE</span>
          </div>

          <div className="terminal-content">
            {messages.map((message, index) => (
              <div key={index} className={`message ${message.sender}`}>
                <span className="message-prefix">{message.sender === 'user' ? 'USER>' : 'XJ-2481>'}</span>
                <span className="message-content">{message.content}</span>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="terminal-input-area">
            <div className="input-line">
              <span className="input-prefix">&gt;</span>
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Digite sua pergunta..."
                className="terminal-input"
              />
            </div>
            <Button onClick={handleSend} className="execute-button">
              EXECUTE
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServitorAssistant;
