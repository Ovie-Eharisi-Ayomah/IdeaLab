import React from 'react';
import { Target, Check, AlertTriangle, BookOpen, Link, FileText, UserCheck, DollarSign, Clock, ExternalLink } from 'lucide-react';
import './ProblemSection.css';
import EmptyState from '../shared/EmptyState';

interface ProblemSectionProps {
  problemData?: any;
  [key: string]: any; // For other props
}

const ProblemSection: React.FC<ProblemSectionProps> = ({ problemData }) => {
  // Return empty state if no data is available
  if (!problemData) {
    return (
      <EmptyState 
        title="Problem Validation Not Available" 
        message="Problem validation data has not been calculated yet." 
        icon={<Target size={48} />}
      />
    );
  }
  
  // Helper function to get score color
  const getScoreColor = (score: number) => {
    if (score >= 8) return '#22c55e';  // Green
    if (score >= 5) return '#f59e0b';  // Amber
    return '#ef4444';  // Red
  };
  
  // Helper function for width percentage
  const widthPercentage = (score: number) => {
    return `${Math.max(Math.min(score * 10, 100), 0)}%`;
  };
  
  // Icon mapping for evidence types
  const getEvidenceIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'forum':
        return <BookOpen className="evidence-icon forum" />;
      case 'news':
        return <FileText className="evidence-icon news" />;
      case 'research_study':
        return <FileText className="evidence-icon research" />;
      case 'review':
        return <UserCheck className="evidence-icon review" />;
      default:
        return <Link className="evidence-icon default" />;
    }
  };
  
  // Format willingness to pay
  const formatWTP = (wtp: string | number) => {
    if (!wtp) return "Unknown";
    
    // If it's already a formatted string, return it
    if (typeof wtp === 'string') {
      return wtp.startsWith('$') ? wtp : `$${wtp}`;
    }
    
    // If it's a number, format it with dollar sign
    if (typeof wtp === 'number') {
      return `$${wtp.toFixed(2)}`;
    }
    
    return "Unknown";
  };
  
  // Extract the problem validation data from props
  const { problem_statement, problem_validation, evidence, alternative_solutions, problem_statement_feedback } = problemData;

  return (
    <div className="problem-view">
      {/* Header */}
      <div className="section-header">
        <h1 className="section-title">Problem Validation</h1>
        <p className="section-subtitle">
          Analysis of the problem your business idea aims to solve
        </p>
      </div>
      
      {/* Problem Statement Card */}
      <div className="section-card">
        <div className="card-header">
          <div className="icon-container yellow">
            <Target className="icon" />
          </div>
          <div>
            <h3 className="card-title">
              Problem Statement
            </h3>
            <p className="card-subtitle">
              Summary of the core problem your business addresses
            </p>
          </div>
        </div>
        
        <div className="card-content">
          <div className="problem-statement">
            <p className="problem-statement-text">
              {problem_statement || "Difficulty finding reliable dog walkers on short notice."}
            </p>
          </div>
          
          <div className="feedback-container">
            <h4 className="feedback-title">Feedback on Problem Statement:</h4>
            <p className="feedback-text">
              {problem_statement_feedback || "No feedback available on the problem statement."}
            </p>
          </div>
        </div>
      </div>
      
      {/* Validation Metrics Card */}
      <div className="section-card">
        <div className="card-header">
          <h3 className="card-title">
            Problem Validation Metrics
          </h3>
          <p className="card-subtitle">
            Quantitative assessment of the problem
          </p>
        </div>
        
        <div className="card-content">
          <div className="metrics-grid">
            <div className="metrics-column">
              {/* Problem Existence */}
              <div className="metric-item">
                <div className="metric-header">
                  <span className="metric-label">Problem Confirmed:</span>
                  <div className="metric-value">
                    {problem_validation?.exists ? (
                      <div className="confirmed-yes">
                        <Check className="check-icon" />
                        <span>Yes</span>
                      </div>
                    ) : (
                      <div className="confirmed-no">
                        <AlertTriangle className="alert-icon" />
                        <span>No</span>
                      </div>
                    )}
                  </div>
                </div>
                <p className="metric-description">
                  Our analysis confirms this problem exists in the market.
                </p>
              </div>
              
              {/* Problem Severity */}
              <div className="metric-item">
                <div className="metric-header">
                  <span className="metric-label">Problem Severity:</span>
                  <span className="metric-score" style={{ color: getScoreColor(problem_validation?.severity || 0) }}>
                    {problem_validation?.severity || 0}/10
                  </span>
                </div>
                <div className="progress-bar-container">
                  <div 
                    className="progress-bar" 
                    style={{ 
                      width: widthPercentage(problem_validation?.severity || 0), 
                      backgroundColor: getScoreColor(problem_validation?.severity || 0) 
                    }}
                  ></div>
                </div>
                <p className="metric-description">
                  How painful this problem is for users.
                </p>
              </div>
              
              {/* Problem Frequency */}
              <div className="metric-item">
                <div className="metric-header">
                  <span className="metric-label">Problem Frequency:</span>
                  <span className="metric-score" style={{ color: getScoreColor(problem_validation?.frequency || 0) }}>
                    {problem_validation?.frequency || 0}/10
                  </span>
                </div>
                <div className="progress-bar-container">
                  <div 
                    className="progress-bar" 
                    style={{ 
                      width: widthPercentage(problem_validation?.frequency || 0), 
                      backgroundColor: getScoreColor(problem_validation?.frequency || 0) 
                    }}
                  ></div>
                </div>
                <p className="metric-description">
                  How often users encounter this problem.
                </p>
              </div>
            </div>
            
            <div className="metrics-column">
              {/* Willingness to Pay */}
              <div className="metric-item">
                <div className="metric-header">
                  <span className="metric-label">Willingness to Pay:</span>
                  <span className="wtp-value">
                    {formatWTP(problem_validation?.willingness_to_pay || "Unknown")}
                  </span>
                </div>
                <div className="wtp-container">
                  <DollarSign className="wtp-icon" />
                  <p>Users currently pay between {formatWTP(problem_validation?.willingness_to_pay || "Unknown")} for dog walking services, indicating strong monetization potential.</p>
                </div>
              </div>
              
              {/* Confidence Level */}
              <div className="metric-item">
                <div className="metric-header">
                  <span className="metric-label">Confidence Level:</span>
                  <span className="confidence-value">
                    {problem_validation?.confidence_level || 0}/10
                  </span>
                </div>
                <div className="progress-bar-container">
                  <div 
                    className="progress-bar confidence" 
                    style={{ width: widthPercentage(problem_validation?.confidence_level || 0) }}
                  ></div>
                </div>
                <p className="metric-description">
                  Based on quantity and quality of evidence found.
                </p>
              </div>
              
              {/* Opportunity Size */}
              <div className="opportunity-container">
                <Clock className="opportunity-icon" />
                <p>This problem represents a <span className="opportunity-highlight">significant opportunity</span> based on severity, frequency, and willingness to pay.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Evidence Card */}
      <div className="section-card">
        <div className="card-header">
          <h3 className="card-title">
            Supporting Evidence
          </h3>
          <p className="card-subtitle">
            Research findings that validate the problem
          </p>
        </div>
        
        <div className="evidence-list">
          {evidence && evidence.length > 0 ? (
            evidence.map((evidenceItem: any, index: number) => (
              <div key={index} className="evidence-item">
                <div className="evidence-content">
                  <div className="evidence-icon-container">
                    {getEvidenceIcon(evidenceItem.type)}
                  </div>
                  <div className="evidence-details">
                    <div className="evidence-header">
                      <h4 className="evidence-source">
                        {evidenceItem.source}
                        {evidenceItem.source && evidenceItem.source.includes('[') && (
                          <a href="#" className="external-link">
                            <ExternalLink className="external-icon" />
                          </a>
                        )}
                      </h4>
                      <div className="evidence-meta">
                        <span className="evidence-date">{evidenceItem.date || "Unknown date"}</span>
                        <span className="evidence-type">
                          {evidenceItem.type}
                        </span>
                      </div>
                    </div>
                    <div className="evidence-quotes">
                      {evidenceItem.quotes && evidenceItem.quotes.map((quote: string, qIndex: number) => (
                        <div key={qIndex} className="evidence-quote">
                          <p className="quote-text">
                            {quote}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="no-data-message">No evidence available</div>
          )}
        </div>
      </div>
      
      {/* Alternative Solutions Card */}
      <div className="section-card">
        <div className="card-header">
          <h3 className="card-title">
            Alternative Solutions
          </h3>
          <p className="card-subtitle">
            How people currently solve this problem
          </p>
        </div>
        
        <div className="card-content">
          <div className="solutions-grid">
            {alternative_solutions && alternative_solutions.length > 0 ? (
              alternative_solutions.map((solution: any, index: number) => (
                <div key={index} className="solution-item">
                  <div className="solution-header">
                    <h4 className="solution-name">
                      {solution.name}
                      {solution.name && solution.name.includes('[') && (
                        <a href="#" className="external-link">
                          <ExternalLink className="external-icon" />
                        </a>
                      )}
                    </h4>
                  </div>
                  <div className="solution-details">
                    <h5 className="solution-section-title">Approach:</h5>
                    <p className="solution-approach">{solution.approach}</p>
                    
                    <h5 className="solution-section-title">Limitations:</h5>
                    <div className="solution-limitations">
                      <AlertTriangle className="limitations-icon" />
                      <p className="limitations-text">{solution.limitations}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-data-message">No alternative solutions identified</div>
            )}
          </div>
        </div>
      </div>
      
      {/* Analysis Methodology Card */}
      <div className="section-card">
        <div className="card-header">
          <h3 className="card-title">
            Analysis Methodology
          </h3>
          <p className="card-subtitle">
            How this problem validation was performed
          </p>
        </div>
        <div className="card-content">
          <p className="methodology-text">
            This problem validation analysis was performed using our AI-powered research methodology, which includes:
          </p>
          <ul className="methodology-list">
            <li>Analysis of online forums and discussions</li>
            <li>Review of industry reports and studies</li>
            <li>Examination of competitor solutions and limitations</li>
            <li>Assessment of willingness to pay based on market data</li>
            <li>Severity and frequency scoring based on evidence volume and sentiment</li>
          </ul>
          <p className="methodology-text">
            Evidence was collected through targeted searches using multiple queries to ensure comprehensive coverage of the problem space.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProblemSection; 