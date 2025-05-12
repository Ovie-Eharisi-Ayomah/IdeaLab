import React, { ReactNode } from 'react';
import '../Components.css';

interface SectionCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  icon?: ReactNode;
  className?: string;
}

const SectionCard: React.FC<SectionCardProps> = ({ 
  title, 
  subtitle, 
  children, 
  icon,
  className = ''
}) => {
  return (
    <div className={`section-card ${className}`}>
      <div className="section-card-header">
        {icon && <div className="section-card-icon">{icon}</div>}
        <div className="section-card-titles">
          <h3 className="section-card-title">
            {title}
          </h3>
          {subtitle && (
            <p className="section-card-subtitle">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      <div className="section-card-body">
        {children}
      </div>
    </div>
  );
};

export default SectionCard; 