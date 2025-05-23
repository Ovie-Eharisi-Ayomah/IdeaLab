import React from 'react';
import { AlertTriangle } from 'lucide-react';
import './EmptyState.css';

interface EmptyStateProps {
  title?: string;
  message?: string;
  icon?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title = "No Data Available",
  message = "The data for this section is not yet available.",
  icon = <AlertTriangle size={48} />
}) => {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        {icon}
      </div>
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-message">{message}</p>
    </div>
  );
};

export default EmptyState; 