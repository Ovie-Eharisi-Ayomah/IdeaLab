import React from 'react';
import { FileText, Users, Target, BarChart2, TrendingUp } from 'lucide-react';
import './Navigation.css';

interface DashboardNavigationProps {
  currentSection: string;
  onSectionChange: (section: string) => void;
  analysisDate: string;
}

const DashboardNavigation: React.FC<DashboardNavigationProps> = ({
  currentSection,
  onSectionChange,
  analysisDate
}) => {
  // Navigation items
  const navItems = [
    { id: 'summary', label: 'Summary', icon: <FileText className="sidebar-nav-icon" /> },
    { id: 'segmentation', label: 'Customer Segmentation', icon: <Users className="sidebar-nav-icon" /> },
    { id: 'problem', label: 'Problem Validation', icon: <Target className="sidebar-nav-icon" /> },
    { id: 'competition', label: 'Competitive Analysis', icon: <BarChart2 className="sidebar-nav-icon" /> },
    { id: 'market', label: 'Market Sizing', icon: <TrendingUp className="sidebar-nav-icon" /> }
  ];

  // Format date for display
  const formattedDate = new Date(analysisDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <>
      {/* Desktop Sidebar Navigation */}
      <div className="dashboard-sidebar">
        <div className="sidebar-container">
          <div className="sidebar-inner">
            <div className="sidebar-logo">
              <h1>Idea Lab</h1>
            </div>
            <div className="sidebar-nav">
              <p className="sidebar-nav-label">
                Analysis Results
              </p>
              
              <div className="sidebar-nav-items">
                {navItems.map(item => (
                  <button
                    key={item.id}
                    className={`sidebar-nav-button ${currentSection === item.id ? 'active' : ''}`}
                    onClick={() => onSectionChange(item.id)}
                  >
                    {item.icon}
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          <div className="sidebar-footer">
            <div>
              <p className="sidebar-footer-text">Analyzed on</p>
              <p className="sidebar-footer-date">{formattedDate}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      <div className="mobile-nav">
        <div className="mobile-nav-items">
          {navItems.map(item => (
            <button
              key={item.id}
              className={`mobile-nav-button ${currentSection === item.id ? 'active' : ''}`}
              onClick={() => onSectionChange(item.id)}
            >
              {React.cloneElement(item.icon, { className: '' })}
              <span className="mobile-nav-label">
                {item.id === 'segmentation' ? 'Segments' : 
                 item.id === 'competition' ? 'Competition' : 
                 item.id === 'problem' ? 'Problem' : 
                 item.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

export default DashboardNavigation; 