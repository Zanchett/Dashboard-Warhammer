import React from 'react';
import { PuritySeal } from '../types/achievements';

interface PuritySealDisplayProps {
  seal: PuritySeal;
}

const PuritySealDisplay: React.FC<PuritySealDisplayProps> = ({ seal }) => {
  return (
    <div className="purity-seal">
      <img src={seal.iconUrl} alt={seal.name} className="seal-icon" />
      <div className="seal-info">
        <h3>{seal.name}</h3>
        <p>{seal.description}</p>
        <span className={`seal-level ${seal.level.toLowerCase()}`}>{seal.level}</span>
        <span className="seal-category">{seal.category}</span>
      </div>
      {seal.isEarned && (
        <div className="seal-earned">
          <span>Earned: {seal.earnedDate?.toLocaleDateString()}</span>
        </div>
      )}
      <div className="seal-lore">
        <q>{seal.loreText}</q>
      </div>
    </div>
  );
};

export default PuritySealDisplay;
