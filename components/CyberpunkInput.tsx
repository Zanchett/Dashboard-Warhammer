import React, { useState } from 'react';
import { IconFeedAdd } from './icons';

interface CyberpunkInputProps {
  onSubmit: (value: string) => void;
  placeholder?: string;
}

export const CyberpunkInput: React.FC<CyberpunkInputProps> = ({ onSubmit, placeholder = "Enter Empire ID" }) => {
  const [inputValue, setInputValue] = useState('');
  const [isActive, setIsActive] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSubmit(inputValue.trim());
      setInputValue('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="cyberpunk-input-container">
      <div className={`cyberpunk-input ${isActive ? 'active' : ''}`}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onFocus={() => setIsActive(true)}
          onBlur={() => setIsActive(false)}
          placeholder={placeholder}
          className="cyberpunk-input__field"
        />
        <button type="submit" className="cyberpunk-input__button">
          <IconFeedAdd className="cyberpunk-input__icon" />
        </button>
      </div>
    </form>
  );
};
