'use client'

import React, { useState } from 'react'
import { IconFeedAdd } from './icons'

interface AddUserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (userId: string) => void;
}

export function AddUserDialog({ isOpen, onClose, onSubmit }: AddUserDialogProps) {
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      setIsLoading(true);
      setError('');
      try {
        const response = await fetch('/api/users/check', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId: inputValue.trim() }),
        });

        if (response.ok) {
          onSubmit(inputValue.trim());
          setInputValue('');
          onClose();
        } else {
          const data = await response.json();
          setError(data.error || 'An error occurred while checking the user');
        }
      } catch (error) {
        console.error('Error checking user:', error);
        setError('An error occurred while checking the user');
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="dialog-overlay">
      <div className="dialog-content">
        <form onSubmit={handleSubmit} className="cyberpunk-input-container">
          <div className="cyberpunk-input">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Enter Empire ID"
              className="cyberpunk-input__field"
              autoFocus
              disabled={isLoading}
            />
            <button type="submit" className="cyberpunk-input__button" disabled={isLoading}>
              {isLoading ? '...' : <IconFeedAdd className="cyberpunk-input__icon" />}
            </button>
          </div>
        </form>
        {error && <div className="error-message">{error}</div>}
      </div>
    </div>
  );
}
