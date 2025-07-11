import React, { useState, useEffect } from 'react';
import styles from '../styles/HealthIndicator.module.css';

interface HealthIndicatorProps {
  currentHealth: number;
  maxHealth: number;
  onHealthChange: (current: number, max: number) => void;
}

const HealthIndicator: React.FC<HealthIndicatorProps> = ({ currentHealth, maxHealth, onHealthChange }) => {
  const [animationDuration, setAnimationDuration] = useState('1s');

  useEffect(() => {
    const healthPercentage = (currentHealth / maxHealth) * 100;
    const newDuration = `${4 - (healthPercentage / 100) * 3}s`;
    setAnimationDuration(newDuration);
  }, [currentHealth, maxHealth]);

  return (
    <div className={styles.healthIndicator}>
      <div className={styles.monitorTitle}>HEALTH MONITOR</div>
      <div className={styles.monitorContainer}>
        <div 
          className={styles.ecgLineContainer}
          style={{ animationDuration }}
        >
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className={styles.ecgSvg}>
            <path 
              d="M 0,50 L 40,50 L 45,20 L 50,80 L 55,50 L 100,50" 
              className={styles.ecgLine}
            />
          </svg>
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className={styles.ecgSvg}>
            <path 
              d="M 0,50 L 40,50 L 45,20 L 50,80 L 55,50 L 100,50" 
              className={styles.ecgLine}
            />
          </svg>
        </div>
      </div>
      <div className={styles.healthInputs}>
        <input 
          type="number" 
          value={currentHealth} 
          onChange={(e) => onHealthChange(Number(e.target.value), maxHealth)}
          className={styles.healthInput}
        />
        <span>/</span>
        <input 
          type="number" 
          value={maxHealth} 
          onChange={(e) => onHealthChange(currentHealth, Number(e.target.value))}
          className={styles.healthInput}
        />
      </div>
    </div>
  );
};

export default HealthIndicator;
