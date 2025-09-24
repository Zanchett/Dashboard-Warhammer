import React, { useState, useEffect, useCallback } from 'react';

interface HackingMinigameProps {
  onSuccess: () => void;
  onFailure: () => void;
}

const HackingMinigame: React.FC<HackingMinigameProps> = ({ onSuccess, onFailure }) => {
  const [words, setWords] = useState<string[]>([]);
  const [password, setPassword] = useState<string>('');
  const [attempts, setAttempts] = useState<number>(4);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string>('');
  const [terminalContent, setTerminalContent] = useState<string[]>([]);

  const warhammer40kWords = [
    'PSYKER', 'OMNISSIAH', 'XENOS', 'ADEPTUS', 'EMPEROR',
    'MECHANICUS', 'TECHPRIEST', 'HERETIC', 'CERAMITE', 'FERROCRETE',
    'COGITATOR', 'WARP', 'GELLAR', 'LASGUN', 'THUNDERHAWK',
    'PLASTEEL', 'ADAMANTIUM', 'DREADNOUGHT', 'BOLTER', 'ASTARTES'
  ];

  const technicalTerms = [
    'BUFFER OVERFLOW', 'NULL POINTER', 'MEMORY LEAK', 'STACK TRACE',
    'SEGMENTATION FAULT', 'CORE DUMPED', 'CHAOS INCURSION'
  ];

  const generateRandomHex = (length: number = 8): string => {
    return Array.from({ length }, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('').toUpperCase();
  };

  const generateTerminalLine = (index: number): string[] => {
    const address = (index * 12).toString(16).padStart(4, '0').toUpperCase();
    const terms: string[] = [];
    
    for (let i = 0; i < 3; i++) {
      if (Math.random() > 0.5 && words.length > 0) {
        const wordIndex = Math.floor(Math.random() * words.length);
        terms.push(words[wordIndex]);
      } else {
        const term = technicalTerms[Math.floor(Math.random() * technicalTerms.length)];
        terms.push(`${term} ${generateRandomHex()}`);
      }
    }
    
    return [`0x${address}`, ...terms];
  };

  const initializeGame = useCallback(() => {
    const gameWords = [...warhammer40kWords]
      .sort(() => Math.random() - 0.5)
      .slice(0, 15);
    
    setWords(gameWords);
    setPassword(gameWords[Math.floor(Math.random() * gameWords.length)]);
    setAttempts(4);
    setSelectedWord(null);
    setFeedback('');

    const lines: string[][] = Array.from({ length: 15 }, (_, i) => 
      generateTerminalLine(i)
    );
    setTerminalContent(lines.flat());
  }, []);

  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  const handleWordSelect = (word: string) => {
    if (warhammer40kWords.includes(word)) {
      setSelectedWord(word);
    }
  };

  const handleGuess = () => {
    if (!selectedWord) return;

    if (selectedWord === password) {
      setFeedback('Access granted. System compromised.');
      setTimeout(() => {
        onSuccess();
        initializeGame();
      }, 2000);
    } else {
      const matchingChars = selectedWord
        .split('')
        .filter((char, i) => char === password[i])
        .length;
      
      setFeedback(`Access denied. ${matchingChars}/${password.length} correct.`);
      setAttempts(prev => prev - 1);

      if (attempts <= 1) {
        setFeedback('Maximum attempts reached. Lockout initiated.');
        setTimeout(() => {
          onFailure();
          initializeGame();
        }, 2000);
      }
    }
  };

  return (
    <div className="cogitator-interface">
      <h2 className="interface-title">Cogitator Interface Breach</h2>
      
      <div className="interface-header">
        <span>COGITATOR INTERFACE v2.781</span>
        <span>ATTEMPTS REMAINING: {attempts}</span>
      </div>

      <div className="terminal-display">
        {terminalContent.map((line, i) => (
          <div key={i} className="terminal-line">
            <span className="hex-address">{line}</span>
            {line.split(' ').map((word, j) => {
              const isSelectable = warhammer40kWords.includes(word);
              return (
                <span
                  key={`${i}-${j}`}
                  className={`terminal-word ${isSelectable ? 'selectable' : ''} ${
                    word === selectedWord ? 'selected' : ''
                  }`}
                  onClick={() => isSelectable && handleWordSelect(word)}
                >
                  {word}
                </span>
              );
            })}
          </div>
        ))}
      </div>

      <div className="interface-footer">
        <div className="word-selection">
          <span className="label">SELECT A WORD</span>
          <span className="selected-word">{selectedWord || '________'}</span>
        </div>
        <button
          className="execute-button"
          onClick={handleGuess}
          disabled={!selectedWord || attempts === 0}
        >
          EXECUTE OVERRIDE
        </button>
      </div>

      {feedback && (
        <div className="feedback-message">
          {feedback}
        </div>
      )}
    </div>
  );
};

export default HackingMinigame;

