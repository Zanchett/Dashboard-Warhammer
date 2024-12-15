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
    'ADEPTUS', 'ASTARTES', 'IMPERIUM', 'MECHANICUS', 'INQUISITOR',
    'XENOS', 'HERETIC', 'WARPSTORM', 'BOLTER', 'EMPEROR',
    'COGITATOR', 'SERVITOR', 'TECHPRIEST', 'OMNISSIAH', 'VOIDSHIP',
    'CHAINSWORD', 'LASGUN', 'EXTERMINATUS', 'GELLARFIELD', 'WARP',
    'PSYKER', 'LIBRARIAN', 'TERMINATOR', 'DREADNOUGHT', 'THUNDERHAWK',
    'CERAMITE', 'ADAMANTIUM', 'PROMETHIUM', 'PLASTEEL', 'FERROCRETE'
  ];

  const randomBlurbs = [
    '0xDEADBEEF', '0xC0FFEE', 'SEGMENTATION FAULT', 'CORE DUMPED',
    'BUFFER OVERFLOW', 'STACK TRACE', 'MEMORY LEAK', 'NULL POINTER',
    'WARP BREACH', 'GELLAR FIELD FLUCTUATION', 'CHAOS INCURSION'
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
    const hexChars = '0123456789ABCDEF';
    const totalLines = 16;
    const wordsPerLine = 2;
    const words = [...gameWords]; // Create a copy of gameWords to work with

    // Create an array of all possible word positions
    const totalPositions = totalLines * wordsPerLine;
    const wordPositions = Array.from({ length: totalPositions }, (_, i) => i);
    // Shuffle the positions
    wordPositions.sort(() => Math.random() - 0.5);
    // Take only as many positions as we have words
    const selectedPositions = new Set(wordPositions.slice(0, words.length));

    for (let i = 0; i < totalLines; i++) {
      const lineAddress = (i * 12).toString(16).padStart(4, '0').toUpperCase();
      content += `0x${lineAddress} `;

      for (let j = 0; j < wordsPerLine; j++) {
        const currentPosition = i * wordsPerLine + j;

        if (selectedPositions.has(currentPosition) && words.length > 0) {
          // Insert a selectable word
          const wordIndex = Math.floor(Math.random() * words.length);
          const word = words.splice(wordIndex, 1)[0];
          content += `<span class="selectable-word">${word}</span> `;
        } else {
          // Insert a random blurb
          const randomBlurb = randomBlurbs[Math.floor(Math.random() * randomBlurbs.length)];
          content += `${randomBlurb} `;
        }

        // Add some random hex characters
        for (let k = 0; k < 8; k++) {
          content += hexChars[Math.floor(Math.random() * 16)];
        }
        content += ' ';
      }

      content += '\n';
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

  return (
    <div className="hacking-minigame">
      <div className="terminal-header">
        COGITATOR INTERFACE v2.781
        <div className="attempts-display">ATTEMPTS REMAINING: {attempts}</div>
      </div>
      <div className="terminal-content" dangerouslySetInnerHTML={{ __html: terminalContent }} onClick={(e) => {
        const target = e.target as HTMLElement;
        if (target.classList.contains('selectable-word')) {
          handleWordSelect(target.textContent || '');
        }
      }} />
      <div className="terminal-footer">
        <div className="selected-word">{selectedWord || 'SELECT A WORD'}</div>
        <button className="hack-button" onClick={handleGuess} disabled={!selectedWord || attempts === 0}>
          EXECUTE OVERRIDE
        </button>
        <div className="feedback-display">{feedback}</div>
      </div>
    </div>
  );
};

export default HackingMinigame;

