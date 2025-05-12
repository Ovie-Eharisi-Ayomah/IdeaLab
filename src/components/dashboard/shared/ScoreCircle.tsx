import React from 'react';
import '../Components.css';

interface ScoreCircleProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  labelText?: string;
}

const ScoreCircle: React.FC<ScoreCircleProps> = ({ 
  score, 
  size = 'md', 
  showLabel = true,
  labelText = 'Score'
}) => {
  const getScoreColor = (value: number) => {
    if (value >= 70) return '#22c55e';  // Green
    if (value >= 50) return '#f59e0b';  // Amber
    return '#ef4444';  // Red
  };

  const scoreColor = getScoreColor(score);

  return (
    <div className="score-container">
      {showLabel && <span className="score-label">{labelText}:</span>}
      <div className={`score-circle ${size}`}>
        <svg viewBox="0 0 36 36">
          <path
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="3"
          />
          <path
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke={scoreColor}
            strokeWidth="3"
            strokeDasharray={`${score}, 100`}
          />
        </svg>
        <span className="score-value" style={{ color: scoreColor }}>{score}</span>
      </div>
    </div>
  );
};

export default ScoreCircle; 