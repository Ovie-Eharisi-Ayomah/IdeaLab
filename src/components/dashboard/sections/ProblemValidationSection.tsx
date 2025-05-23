import React, { useState, useEffect } from 'react';
import { Info, Archive, ChevronUp, ChevronDown } from 'lucide-react';
import './ProblemValidationSection.css';

interface ProblemValidationSectionProps {
  businessIdea: string;
  problemStatement: string;
  industry: string;
}

interface ProblemValidationData {
  problem_validation: {
    exists: boolean;
    severity: number;
    evidence: string[];
    market_need: string;
    user_pain_points: string[];
    validation_score: number;
  };
  confidence_score: number;
  sources: Array<{
    title: string;
    url: string;
    relevance: string;
  }>;
}

const ProblemValidationSection: React.FC<ProblemValidationSectionProps> = ({
  businessIdea,
  problemStatement,
  industry
}) => {
  const [data, setData] = useState<ProblemValidationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState({
    evidence: false,
    painPoints: false,
    sources: false
  });

  useEffect(() => {
    const fetchProblemValidation = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:8000/problem-validation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            description: businessIdea,
            problem_statement: problemStatement,
            industry: industry
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch problem validation data');
        }

        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (businessIdea && problemStatement && industry) {
      fetchProblemValidation();
    }
  }, [businessIdea, problemStatement, industry]);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  if (loading) {
    return <div className="loading">Loading problem validation data...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  if (!data) {
    return <div className="error">No data available</div>;
  }

  const { problem_validation, confidence_score, sources } = data;

  return (
    <div className="problem-validation-view">
      <div className="section-header">
        <h1 className="section-title">Problem Validation: {businessIdea}</h1>
        <p className="section-subtitle">Analysis of the problem for "{problemStatement}"</p>
      </div>

      {/* Card 1: Problem Validation Overview */}
      <div className="section-card">
        <div className="card-header">
          <div className="header-content">
            <div className={`icon-container ${problem_validation.exists ? 'green' : 'red'}`}>
              <Info className="icon" />
            </div>
            <div>
              <h3 className="card-title">Problem Validation Overview</h3>
              <p className="card-subtitle">
                {problem_validation.exists 
                  ? 'Problem validated with high confidence'
                  : 'Problem validation inconclusive'}
              </p>
            </div>
          </div>
        </div>
        <div className="card-content">
          <div className="validation-score">
            <div className="score-circle">
              <span className="score-value">{problem_validation.validation_score}</span>
              <span className="score-label">Validation Score</span>
            </div>
            <div className="score-details">
              <p className="score-description">
                {problem_validation.exists
                  ? 'Strong evidence supports the existence of this problem'
                  : 'Limited evidence available to validate this problem'}
              </p>
              <div className="confidence-info">
                <Info className="info-icon" />
                <p className="confidence-text">
                  <span className="confidence-label">Confidence Score:</span> {confidence_score}/10
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Card 2: Market Need */}
      <div className="section-card">
        <div className="card-header">
          <div className="header-content">
            <div className="icon-container blue">
              <Info className="icon" />
            </div>
            <div>
              <h3 className="card-title">Market Need</h3>
              <p className="card-subtitle">Analysis of market demand</p>
            </div>
          </div>
        </div>
        <div className="card-content">
          <p className="market-need-text">{problem_validation.market_need}</p>
        </div>
      </div>

      {/* Card 3: Evidence */}
      <div className="section-card">
        <div className="card-header clickable" onClick={() => toggleSection('evidence')}>
          <div className="header-content">
            <div className="icon-container blue">
              <Info className="icon" />
            </div>
            <div>
              <h3 className="card-title">Supporting Evidence</h3>
              <p className="card-subtitle">{problem_validation.evidence.length} pieces of evidence</p>
            </div>
          </div>
          <div className="toggle-icon">
            {expandedSections.evidence ? <ChevronUp className="toggle-icon-item" /> : <ChevronDown className="toggle-icon-item" />}
          </div>
        </div>
        {expandedSections.evidence && (
          <div className="card-content">
            <ul className="evidence-list">
              {problem_validation.evidence.map((item, index) => (
                <li key={index} className="evidence-item">
                  <div className="evidence-content">{item}</div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Card 4: User Pain Points */}
      <div className="section-card">
        <div className="card-header clickable" onClick={() => toggleSection('painPoints')}>
          <div className="header-content">
            <div className="icon-container blue">
              <Info className="icon" />
            </div>
            <div>
              <h3 className="card-title">User Pain Points</h3>
              <p className="card-subtitle">{problem_validation.user_pain_points.length} identified pain points</p>
            </div>
          </div>
          <div className="toggle-icon">
            {expandedSections.painPoints ? <ChevronUp className="toggle-icon-item" /> : <ChevronDown className="toggle-icon-item" />}
          </div>
        </div>
        {expandedSections.painPoints && (
          <div className="card-content">
            <ul className="pain-points-list">
              {problem_validation.user_pain_points.map((point, index) => (
                <li key={index} className="pain-point-item">
                  <div className="pain-point-content">{point}</div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Card 5: Research Sources */}
      <div className="section-card">
        <div className="card-header clickable" onClick={() => toggleSection('sources')}>
          <div className="header-content">
            <div className="icon-container gray">
              <Archive className="icon" />
            </div>
            <div>
              <h3 className="card-title">Research Sources</h3>
              <p className="card-subtitle">{sources.length} sources cited</p>
            </div>
          </div>
          <div className="toggle-icon">
            {expandedSections.sources ? <ChevronUp className="toggle-icon-item" /> : <ChevronDown className="toggle-icon-item" />}
          </div>
        </div>
        {expandedSections.sources && (
          <div className="card-content">
            <p className="sources-description">Problem validation based on market research and user feedback.</p>
            <ul className="sources-list">
              {sources.map((source, index) => (
                <li key={index} className="source-item">
                  <div className="source-content">
                    <div className="source-title">{source.title}</div>
                    <div className="source-url">{source.url}</div>
                    <div className="source-relevance">Relevance: {source.relevance}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProblemValidationSection; 