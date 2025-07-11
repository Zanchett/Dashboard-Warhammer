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
  const [terminalContent, setTerminalContent] = useState<string>('');

  const warhammer40kWords = [
    'PSYKER', 'OMNISSIAH', 'XENOS', 'HERETIC', 'EMPEROR',
    'ADEPTUS', 'MECHANICUS', 'GELLAR', 'CERAMITE', 'FERROCRETE',
    'PLASTEEL', 'ADAMANTIUM', 'LASGUN', 'THUNDERHAWK', 'TECHPRIEST'
  ];

  const technicalTerms = [
    'BUFFER OVERFLOW', 'NULL POINTER', 'SEGMENTATION FAULT',
    'CORE DUMPED', 'MEMORY LEAK', 'STACK TRACE', 'WARP BREACH'
  ];

  const generateRandomWords = useCallback(() => {
    return getRandomWords(warhammer40kWords, 15);
  }, []);

  useEffect(() => {
    const gameWords = generateRandomWords();
    setWords(gameWords);
    setPassword(gameWords[Math.floor(Math.random() * gameWords.length)]);
    setAttempts(4);
    setSelectedWord(null);
    setFeedback('');
    generateTerminalContent(gameWords);
  }, [generateRandomWords]);

  const getRandomWords = (wordList: string[], count: number): string[] => {
    const shuffled = [...wordList].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  const generateTerminalContent = (gameWords: string[]) => {
    let content = '';
    const availableWords = [...gameWords];
    for (let i = 0; i < 12; i++) {
      const lineAddress = (i * 12).toString(16).padStart(4, '0').toUpperCase();
      content += `0x${lineAddress} `;

      const terms = [];
      for (let j = 0; j < 4; j++) {
        if (availableWords.length > 0 && Math.random() < 0.3) {
          const index = Math.floor(Math.random() * availableWords.length);
          terms.push(availableWords.splice(index, 1)[0]);
        } else {
          terms.push(
            Math.random() > 0.5
              ? warhammer40kWords[Math.floor(Math.random() * warhammer40kWords.length)]
              : technicalTerms[Math.floor(Math.random() * technicalTerms.length)]
          );
        }
      }

      content += terms.join(' ') + '\n';
    }
    setTerminalContent(content);
  };

  const handleWordSelect = (word: string) => {
    setSelectedWord(word);
  };

  const handleGuess = () => {
    if (!selectedWord) return;

    if (selectedWord === password) {
      setFeedback('Access granted. System compromised.');
      setTimeout(() => {
        onSuccess();
        // Reset the game with new words
        const newWords = generateRandomWords();
        setWords(newWords);
        setPassword(newWords[Math.floor(Math.random() * newWords.length)]);
        setAttempts(4);
        setSelectedWord(null);
        setFeedback('');
        generateTerminalContent(newWords);
      }, 2000);
    } else {
      const matchingChars = getMatchingCharacters(selectedWord, password);
      setFeedback(`Access denied. ${matchingChars}/${password.length} correct.`);
      setAttempts(attempts - 1);

      if (attempts - 1 === 0) {
        setFeedback('Maximum attempts reached. Lockout initiated.');
        setTimeout(() => {
          onFailure();
          // Reset the game with new words
          const newWords = generateRandomWords();
          setWords(newWords);
          setPassword(newWords[Math.floor(Math.random() * newWords.length)]);
          setAttempts(4);
          setSelectedWord(null);
          setFeedback('');
          generateTerminalContent(newWords);
        }, 2000);
      }
    }
  };

  const getMatchingCharacters = (word1: string, word2: string): number => {
    return word1.split('').filter((char, index) => char === word2[index]).length;
  };

  const renderTerminalContent = () => {
    return terminalContent.split('\n').map((line, index) => (
      <div key={index}>
        {line.split(' ').map((word, wordIndex) => {
          if (words.includes(word)) {
            return (
              <span
                key={wordIndex}
                className="selectable-word"
                onClick={() => handleWordSelect(word)}
              >
                {word}{' '}
              </span>
            );
          }
          return <span key={wordIndex} className="hex-code">{word} </span>;
        })}
      </div>
    ));
  };

  return (
    <div className="hacking-minigame">
      <div className="terminal-header">
        <span>COGITATOR INTERFACE v2.781</span>
        <span>ATTEMPTS REMAINING: {attempts}</span>
      </div>
      <div className="terminal-content" style={{ height: '300px', overflowY: 'auto' }}>
        {renderTerminalContent()}
      </div>
      <div className="terminal-footer">
        <div className="footer-content">
          <div className="terminal-prompt">
            SELECTED: {selectedWord || 'NONE'}
            {feedback && <span className="feedback-display">{feedback}</span>}
          </div>
          <button
            className="execute-button"
            onClick={handleGuess}
            disabled={!selectedWord}
          >
            EXECUTE OVERRIDE
          </button>
        </div>
      </div>
    </div>
  );
};

export default HackingMinigame;
