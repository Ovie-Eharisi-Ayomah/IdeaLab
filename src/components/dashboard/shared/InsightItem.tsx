import React, { ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';
import '../Components.css';

interface InsightItemProps {
  icon: ReactNode;
  title: string;
  value: string;
  onViewDetails?: () => void;
  alternateBackground?: boolean;
}

const InsightItem: React.FC<InsightItemProps> = ({ 
  icon, 
  title, 
  value, 
  onViewDetails,
  alternateBackground = false
}) => {
  return (
    <div className={`insight-item ${alternateBackground ? 'alternate' : ''}`}>
      <dt className="insight-item-label">
        <div className="insight-item-icon">
          {icon}
        </div>
        {title}
      </dt>
      <dd className="insight-item-value">
        {value}
        {onViewDetails && (
          <button 
            className="insight-item-button"
            onClick={onViewDetails}
          >
            View details <ChevronRight className="insight-item-button-icon" />
          </button>
        )}
      </dd>
    </div>
  );
};

export default InsightItem; 