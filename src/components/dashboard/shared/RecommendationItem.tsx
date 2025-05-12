import React, { ReactNode } from 'react';
import '../Components.css';

interface RecommendationItemProps {
  icon: ReactNode;
  title: string;
  description: string;
}

const RecommendationItem: React.FC<RecommendationItemProps> = ({
  icon,
  title,
  description
}) => {
  return (
    <div className="recommendation-item">
      <div className="recommendation-item-icon">
        {icon}
      </div>
      <div className="recommendation-item-content">
        <p className="recommendation-item-title">{title}</p>
        <p className="recommendation-item-description">{description}</p>
      </div>
    </div>
  );
};

export default RecommendationItem; 