import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  AlertTriangle, 
  Target, 
  Shield, 
  Clock, 
  Users, 
  Award, 
  ChevronDown, 
  ChevronRight,
  CheckCircle,
  XCircle,
  AlertCircle,
  BarChart3,
  Lightbulb,
  DollarSign
} from 'lucide-react';
import './RecommendationSection.css';

interface RecommendationData {
  recommendation: 'GO' | 'CONDITIONAL_GO' | 'NO_GO' | 'NEEDS_RESEARCH';
  score: number;
  confidence: number;
  reasoning: string[];
  market_timing: {
    assessment: 'OPTIMAL' | 'GOOD' | 'FAIR' | 'POOR';
    score: number;
    factors: {
      growth_momentum: string;
      competition_maturity: string;
      problem_urgency: string;
    };
    risks: string[];
    recommendation: string;
  };
  risk_adjusted_score: {
    base_score: number;
    adjustment: number;
    adjusted_score: number;
    risk_factors: string[];
    confidence_impact: 'HIGH' | 'MEDIUM' | 'LOW';
  };
  competitive_positioning: {
    opportunities: string[];
    advantages: string[];
    risks: string[];
    strategy_recommendation: string;
  };
  metadata: {
    confidence_factors: {
      data_completeness: number;
      data_consistency: number;
      source_credibility: number;
      analysis_depth: number;
      overall: 'HIGH' | 'MEDIUM' | 'LOW';
    };
    processing_time: number;
    llm_vs_rules_consistency: number;
    source: 'llm_primary' | 'rules_fallback' | 'error_fallback';
  };
}

interface RecommendationSectionProps {
  recommendationData?: RecommendationData | null;
}

interface SectionCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  collapsible?: boolean;
  defaultExpanded?: boolean;
  icon?: React.ReactNode;
}

const SectionCard: React.FC<SectionCardProps> = ({ 
  title, 
  subtitle, 
  children, 
  collapsible = false, 
  defaultExpanded = true,
  icon 
}) => {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <div className="section-card">
      <div 
        className={`section-header ${collapsible ? 'clickable' : ''}`}
        onClick={collapsible ? () => setExpanded(!expanded) : undefined}
      >
        <div className="section-header-content">
          {icon && <div className="section-icon">{icon}</div>}
          <div>
            <h3 className="section-title">{title}</h3>
            {subtitle && <p className="section-subtitle">{subtitle}</p>}
          </div>
        </div>
        {collapsible && (
          <div className="section-toggle">
            {expanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
          </div>
        )}
      </div>
      {expanded && <div className="section-content">{children}</div>}
    </div>
  );
};

const RecommendationSection: React.FC<RecommendationSectionProps> = ({ recommendationData }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If no recommendation data is provided, show appropriate state
  if (!recommendationData) {
    return (
      <div className="recommendation-error">
        <AlertTriangle size={48} />
        <h3>No Recommendation Available</h3>
        <p>Recommendation analysis has not been completed yet.</p>
      </div>
    );
  }

  const { 
    recommendation, 
    score, 
    confidence, 
    reasoning, 
    market_timing, 
    risk_adjusted_score, 
    competitive_positioning, 
    metadata 
  } = recommendationData;

  const getRecommendationIcon = (recommendation: string) => {
    switch (recommendation) {
      case 'GO':
        return <CheckCircle className="recommendation-icon go" />;
      case 'CONDITIONAL_GO':
        return <AlertCircle className="recommendation-icon conditional" />;
      case 'NO_GO':
        return <XCircle className="recommendation-icon no-go" />;
      default:
        return <AlertTriangle className="recommendation-icon research" />;
    }
  };

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'GO': return '#10b981';
      case 'CONDITIONAL_GO': return '#f59e0b';
      case 'NO_GO': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getTimingColor = (assessment: string) => {
    switch (assessment) {
      case 'OPTIMAL': return '#10b981';
      case 'GOOD': return '#3b82f6';
      case 'FAIR': return '#f59e0b';
      case 'POOR': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getConfidenceColor = (level: string) => {
    switch (level) {
      case 'HIGH': return '#10b981';
      case 'MEDIUM': return '#f59e0b';
      case 'LOW': return '#ef4444';
      default: return '#6b7280';
    }
  };

  return (
    <div className="recommendation-section">
      {/* Main Recommendation Card */}
      <SectionCard 
        title="AI-Powered Business Recommendation" 
        subtitle="Comprehensive analysis using LLM insights and rule-based validation"
        icon={<Award size={24} />}
      >
        <div className="main-recommendation">
          <div className="recommendation-header">
            <div className="recommendation-badge">
              {getRecommendationIcon(recommendation)}
              <span className="recommendation-text" style={{ color: getRecommendationColor(recommendation) }}>
                {recommendation.replace('_', ' ')}
              </span>
            </div>
            <div className="recommendation-scores">
              <div className="score-item">
                <span className="score-value">{score}</span>
                <span className="score-label">Overall Score</span>
              </div>
              <div className="score-item">
                <span className="score-value">{confidence}</span>
                <span className="score-label">Confidence</span>
              </div>
            </div>
          </div>
          
          <div className="score-breakdown">
            <div className="score-bar">
              <div 
                className="score-fill" 
                style={{ 
                  width: `${score}%`, 
                  backgroundColor: getRecommendationColor(recommendation) 
                }}
              ></div>
            </div>
            <div className="score-labels">
              <span>0</span>
              <span>50</span>
              <span>100</span>
            </div>
          </div>

          <div className="reasoning-list">
            <h4>Key Insights</h4>
            {reasoning.map((reason, index) => (
              <div key={index} className="reasoning-item">
                <Lightbulb size={16} />
                <span>{reason}</span>
              </div>
            ))}
          </div>
        </div>
      </SectionCard>

      {/* Market Timing Analysis */}
      <SectionCard 
        title="Market Timing Analysis" 
        subtitle="Optimal entry timing assessment"
        icon={<Clock size={24} />}
        collapsible
      >
        <div className="market-timing">
          <div className="timing-header">
            <div className="timing-assessment">
              <span 
                className="timing-badge" 
                style={{ backgroundColor: getTimingColor(market_timing.assessment) }}
              >
                {market_timing.assessment}
              </span>
              <span className="timing-score">{market_timing.score}/100</span>
            </div>
          </div>

          <div className="timing-factors">
            <h4>Market Factors</h4>
            <div className="factors-grid">
              <div className="factor-item">
                <TrendingUp size={16} />
                <div>
                  <span className="factor-label">Growth Momentum</span>
                  <span className="factor-value">{market_timing.factors.growth_momentum}</span>
                </div>
              </div>
              <div className="factor-item">
                <Users size={16} />
                <div>
                  <span className="factor-label">Competition Maturity</span>
                  <span className="factor-value">{market_timing.factors.competition_maturity}</span>
                </div>
              </div>
              <div className="factor-item">
                <AlertTriangle size={16} />
                <div>
                  <span className="factor-label">Problem Urgency</span>
                  <span className="factor-value">{market_timing.factors.problem_urgency}</span>
                </div>
              </div>
            </div>
          </div>

          {market_timing.risks.length > 0 && (
            <div className="timing-risks">
              <h4>Timing Risks</h4>
              <ul>
                {market_timing.risks.map((risk, index) => (
                  <li key={index}>{risk}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="timing-recommendation">
            <h4>Timing Recommendation</h4>
            <p>{market_timing.recommendation}</p>
          </div>
        </div>
      </SectionCard>

      {/* Risk-Adjusted Scoring */}
      <SectionCard 
        title="Risk-Adjusted Analysis" 
        subtitle="Score adjustment based on identified risks"
        icon={<Shield size={24} />}
        collapsible
      >
        <div className="risk-adjustment">
          <div className="score-adjustment">
            <div className="adjustment-flow">
              <div className="adjustment-item">
                <span className="adjustment-label">Base Score</span>
                <span className="adjustment-value">{risk_adjusted_score.base_score}</span>
              </div>
              <div className="adjustment-arrow">→</div>
              <div className="adjustment-item">
                <span className="adjustment-label">Risk Adjustment</span>
                <span className={`adjustment-value ${risk_adjusted_score.adjustment < 0 ? 'negative' : 'positive'}`}>
                  {risk_adjusted_score.adjustment > 0 ? '+' : ''}{risk_adjusted_score.adjustment}
                </span>
              </div>
              <div className="adjustment-arrow">→</div>
              <div className="adjustment-item">
                <span className="adjustment-label">Final Score</span>
                <span className="adjustment-value final">{risk_adjusted_score.adjusted_score}</span>
              </div>
            </div>
          </div>

          {risk_adjusted_score.risk_factors.length > 0 && (
            <div className="risk-factors">
              <h4>Risk Factors</h4>
              <ul>
                {risk_adjusted_score.risk_factors.map((factor, index) => (
                  <li key={index} className="risk-factor-item">
                    <AlertTriangle size={16} />
                    {factor}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="confidence-impact">
            <span className="confidence-label">Confidence Impact:</span>
            <span 
              className="confidence-badge" 
              style={{ color: getConfidenceColor(risk_adjusted_score.confidence_impact) }}
            >
              {risk_adjusted_score.confidence_impact}
            </span>
          </div>
        </div>
      </SectionCard>

      {/* Competitive Positioning */}
      <SectionCard 
        title="Competitive Positioning" 
        subtitle="Strategic market position analysis"
        icon={<Target size={24} />}
        collapsible
      >
        <div className="competitive-positioning">
          {competitive_positioning.opportunities.length > 0 && (
            <div className="positioning-section">
              <h4 className="positioning-title">
                <CheckCircle size={16} className="success-icon" />
                Market Opportunities
              </h4>
              <ul className="positioning-list">
                {competitive_positioning.opportunities.map((opportunity, index) => (
                  <li key={index}>{opportunity}</li>
                ))}
              </ul>
            </div>
          )}

          {competitive_positioning.advantages.length > 0 && (
            <div className="positioning-section">
              <h4 className="positioning-title">
                <Award size={16} className="advantage-icon" />
                Competitive Advantages
              </h4>
              <ul className="positioning-list">
                {competitive_positioning.advantages.map((advantage, index) => (
                  <li key={index}>{advantage}</li>
                ))}
              </ul>
            </div>
          )}

          {competitive_positioning.risks.length > 0 && (
            <div className="positioning-section">
              <h4 className="positioning-title">
                <AlertTriangle size={16} className="risk-icon" />
                Positioning Risks
              </h4>
              <ul className="positioning-list">
                {competitive_positioning.risks.map((risk, index) => (
                  <li key={index}>{risk}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="strategy-recommendation">
            <h4>Strategic Recommendation</h4>
            <p>{competitive_positioning.strategy_recommendation}</p>
          </div>
        </div>
      </SectionCard>

      {/* Analysis Metadata */}
      <SectionCard 
        title="Analysis Quality & Metadata" 
        subtitle="Confidence factors and processing details"
        icon={<BarChart3 size={24} />}
        collapsible
        defaultExpanded={false}
      >
        <div className="analysis-metadata">
          <div className="confidence-factors">
            <h4>Confidence Factors</h4>
            <div className="confidence-grid">
              <div className="confidence-item">
                <span className="confidence-label">Data Completeness</span>
                <div className="confidence-bar">
                  <div 
                    className="confidence-fill" 
                    style={{ width: `${metadata.confidence_factors.data_completeness}%` }}
                  ></div>
                </div>
                <span className="confidence-percentage">{metadata.confidence_factors.data_completeness}%</span>
              </div>
              <div className="confidence-item">
                <span className="confidence-label">Data Consistency</span>
                <div className="confidence-bar">
                  <div 
                    className="confidence-fill" 
                    style={{ width: `${metadata.confidence_factors.data_consistency}%` }}
                  ></div>
                </div>
                <span className="confidence-percentage">{metadata.confidence_factors.data_consistency}%</span>
              </div>
              <div className="confidence-item">
                <span className="confidence-label">Source Credibility</span>
                <div className="confidence-bar">
                  <div 
                    className="confidence-fill" 
                    style={{ width: `${metadata.confidence_factors.source_credibility}%` }}
                  ></div>
                </div>
                <span className="confidence-percentage">{metadata.confidence_factors.source_credibility}%</span>
              </div>
              <div className="confidence-item">
                <span className="confidence-label">Analysis Depth</span>
                <div className="confidence-bar">
                  <div 
                    className="confidence-fill" 
                    style={{ width: `${metadata.confidence_factors.analysis_depth}%` }}
                  ></div>
                </div>
                <span className="confidence-percentage">{metadata.confidence_factors.analysis_depth}%</span>
              </div>
            </div>
            <div className="overall-confidence">
              <span>Overall Confidence: </span>
              <span 
                className="confidence-badge" 
                style={{ color: getConfidenceColor(metadata.confidence_factors.overall) }}
              >
                {metadata.confidence_factors.overall}
              </span>
            </div>
          </div>

          <div className="processing-details">
            <h4>Processing Details</h4>
            <div className="details-grid">
              <div className="detail-item">
                <Clock size={16} />
                <span>Processing Time: {metadata.processing_time.toFixed(1)}s</span>
              </div>
              <div className="detail-item">
                <BarChart3 size={16} />
                <span>LLM vs Rules Consistency: {metadata.llm_vs_rules_consistency.toFixed(1)}%</span>
              </div>
              <div className="detail-item">
                <Award size={16} />
                <span>Analysis Source: {metadata.source.replace('_', ' ').toUpperCase()}</span>
              </div>
            </div>
          </div>
        </div>
      </SectionCard>
    </div>
  );
};

export default RecommendationSection; 