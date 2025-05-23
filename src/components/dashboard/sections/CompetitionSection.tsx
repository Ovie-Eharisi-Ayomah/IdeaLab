import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Cell, PieChart, Pie } from 'recharts';
import { BarChart2, Shield, Zap, Target, ExternalLink, Check, X, ChevronDown, ChevronUp, Award, TrendingUp, Info } from 'lucide-react';
import EmptyState from '../shared/EmptyState';
import './CompetitionSection.css';

interface CompetitionSectionProps {
  competitionData?: any;
  [key: string]: any; // For other props
}

const CompetitionSection: React.FC<CompetitionSectionProps> = ({ competitionData }) => {
  // Return empty state if no data is available
  if (!competitionData) {
    return (
      <EmptyState 
        title="Competition Analysis Not Available" 
        message="Competition analysis data has not been calculated yet." 
        icon={<BarChart2 size={48} />}
      />
    );
  }

  // Use the competition data from props
  const {
    competitors,
    enhancedCompetitors,
    marketShareData,
    radarData,
    market_gaps,
    barriers_to_entry,
    market_concentration,
    emerging_trends,
    sources,
    confidence_score
  } = competitionData;
  
  // State for expanded sections
  const [expandedSections, setExpandedSections] = useState({
    barriers: false,
    sources: false
  });
  
  // Toggle section expansion
  const toggleSection = (section: 'barriers' | 'sources') => {
    setExpandedSections({
      ...expandedSections,
      [section]: !expandedSections[section]
    });
  };
  
  // Helper function to get strengths/weaknesses count
  const getCount = (arr: any[] | undefined) => Array.isArray(arr) ? arr.length : 0;
  
  return (
    <div className="competition-view">
      {/* Header */}
      <div className="section-header">
        <h1 className="section-title">Competitive Analysis</h1>
        <p className="section-subtitle">
          Analysis of the competitive landscape for your business idea
        </p>
      </div>
      
      {/* Market Concentration Card */}
      <div className="section-card">
        <div className="card-header">
          <div className="icon-container purple">
            <BarChart2 className="icon" />
          </div>
          <div>
            <h3 className="card-title">
              Competitive Landscape Overview
            </h3>
            <p className="card-subtitle">
              {enhancedCompetitors?.length || 0} major competitors identified
            </p>
          </div>
        </div>
        
        <div className="card-content">
          <div className="market-concentration">
            <h4 className="concentration-title">Market Concentration:</h4>
            <p className="concentration-text">{market_concentration || 'Market concentration data not available'}</p>
          </div>
          
          <div className="chart-grid">
            {/* Market Share Chart */}
            <div className="chart-container">
              <h4 className="chart-title">Market Share Distribution</h4>
              <div className="chart">
                {marketShareData && marketShareData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={marketShareData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        dataKey="value"
                        label={({name, percent}) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      >
                        {marketShareData.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value}%`, 'Market Share']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="chart-placeholder">No market share data available</div>
                )}
              </div>
            </div>
            
            {/* Feature Comparison Radar */}
            <div className="chart-container">
              <h4 className="chart-title">Competitive Positioning</h4>
              <div className="chart">
                {radarData && radarData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart outerRadius={90} data={radarData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="subject" />
                      <PolarRadiusAxis angle={30} domain={[0, 10]} />
                      <Radar name="Your Idea" dataKey="Your Idea" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                      <Radar name="Competitor Avg" dataKey="Competitor Avg" stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.6} />
                      <Legend />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="chart-placeholder">No competitive positioning data available</div>
                )}
              </div>
            </div>
          </div>
          
          <div className="insight-cards">
            {enhancedCompetitors && enhancedCompetitors.length > 0 && (
              <div className="insight-card blue">
                <div className="insight-header">
                  <h4 className="insight-title">Market Leader</h4>
                  <span className="insight-badge">
                    {marketShareData && marketShareData[0] ? `${marketShareData[0].value}% Share` : 'Leader'}
                  </span>
                </div>
                <p className="insight-text">{enhancedCompetitors[0]?.name || 'Unknown'} dominates with strong brand recognition and large user base.</p>
              </div>
            )}
            
            <div className="insight-card green">
              <div className="insight-header">
                <h4 className="insight-title">Your Advantage</h4>
                <Award className="award-icon" />
              </div>
              <p className="insight-text">Reliability and affordability are your key differentiators compared to existing solutions.</p>
            </div>
            
            {market_gaps && market_gaps.length > 0 && (
              <div className="insight-card yellow">
                <div className="insight-header">
                  <h4 className="insight-title">Market Gaps</h4>
                  <span className="insight-badge yellow-badge">
                    {market_gaps.length} Identified
                  </span>
                </div>
                <p className="insight-text">Clear opportunities exist in {market_gaps[0]}.</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Competitor Profiles Card */}
      <div className="section-card">
        <div className="card-header">
          <h3 className="card-title">
            Competitor Profiles
          </h3>
          <p className="card-subtitle">
            Detailed analysis of key competitors
          </p>
        </div>
        
        <div className="competitors-list">
          {enhancedCompetitors && enhancedCompetitors.length > 0 ? (
            enhancedCompetitors.map((competitor: any, index: number) => (
              <div key={index} className="competitor-item">
                <div className="competitor-header">
                  <div className="competitor-info">
                    <div className="competitor-name-container">
                      <h4 className="competitor-name">{competitor.name}</h4>
                      {competitor.website && competitor.website !== "N/A" && (
                        <a 
                          href="#" 
                          className="external-link"
                        >
                          <ExternalLink className="external-icon" />
                        </a>
                      )}
                    </div>
                    <p className="competitor-position">{competitor.market_position}</p>
                  </div>
                  
                  <div className="competitor-badges">
                    <span className="market-share-badge">
                      {competitor.marketShare}% Market Share
                    </span>
                    {competitor.founded && (
                      <span className="founded-badge">
                        Founded: {competitor.founded}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="competitor-details">
                  <div className="business-model">
                    <h5 className="details-title">Business Model</h5>
                    <div className="business-model-details">
                      <div className="model-item">
                        <span className="model-label">Target Audience:</span>
                        <p className="model-value">{competitor.target_audience}</p>
                      </div>
                      
                      <div className="model-item">
                        <span className="model-label">Pricing Model:</span>
                        <p className="model-value">{competitor.pricing_model}</p>
                      </div>
                      
                      <div className="model-item">
                        <span className="model-label">Products/Services:</span>
                        <ul className="products-list">
                          {competitor.products && competitor.products.map((product: string, i: number) => (
                            <li key={i}>{product}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  <div className="strengths-weaknesses">
                    <h5 className="details-title">Strengths & Weaknesses</h5>
                    <div className="sw-container">
                      <div className="sw-section">
                        <div className="sw-header">
                          <Check className="strengths-icon" />
                          <span className="sw-title">Strengths ({getCount(competitor.strengths)})</span>
                        </div>
                        <ul className="sw-list">
                          {competitor.strengths && competitor.strengths.map((strength: string, i: number) => (
                            <li key={i}>{strength}</li>
                          ))}
                          {competitor.unique_selling_points && competitor.unique_selling_points.map((usp: string, i: number) => (
                            <li key={`usp-${i}`}>{usp}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="sw-section">
                        <div className="sw-header">
                          <X className="weaknesses-icon" />
                          <span className="sw-title">Weaknesses ({getCount(competitor.weaknesses)})</span>
                        </div>
                        <ul className="sw-list">
                          {competitor.weaknesses && competitor.weaknesses.map((weakness: string, i: number) => (
                            <li key={i}>{weakness}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-competitors-message">No competitor profiles available</div>
          )}
        </div>
      </div>
      
      {/* Market Gaps Card */}
      <div className="section-card">
        <div className="card-header">
          <div className="icon-container green">
            <Target className="icon" />
          </div>
          <div>
            <h3 className="card-title">
              Market Gaps & Opportunities
            </h3>
            <p className="card-subtitle">
              Unmet needs and potential differentiation points
            </p>
          </div>
        </div>
        
        <div className="card-content">
          <div className="gaps-grid">
            <div className="gaps-column">
              <h4 className="gaps-title">Key Market Gaps</h4>
              
              <div className="gaps-list">
                {market_gaps && market_gaps.length > 0 ? (
                  market_gaps.map((gap: string, index: number) => (
                    <div key={index} className="gap-item">
                      <div className="gap-content">
                        <Zap className="gap-icon" />
                        <div className="gap-text-container">
                          <p className="gap-text">{gap}</p>
                          <p className="gap-label">Potential competitive advantage</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="gap-item">
                    <div className="gap-content">
                      <p className="gap-text">No market gaps identified</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="gaps-column">
              <h4 className="gaps-title">Emerging Trends</h4>
              
              <div className="gaps-list">
                {emerging_trends && emerging_trends.length > 0 ? (
                  emerging_trends.map((trend: string, index: number) => (
                    <div key={index} className="trend-item">
                      <div className="trend-content">
                        <TrendingUp className="trend-icon" />
                        <div className="trend-text-container">
                          <p className="trend-text">{trend}</p>
                          <p className="trend-label">Market direction to capitalize on</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="trend-item">
                    <div className="trend-content">
                      <p className="trend-text">No emerging trends identified</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Barriers to Entry Card */}
      <div className="section-card">
        <div 
          className="card-header clickable"
          onClick={() => toggleSection('barriers')}
        >
          <div className="header-content">
            <div className="icon-container red">
              <Shield className="icon" />
            </div>
            <div>
              <h3 className="card-title">
                Barriers to Entry
              </h3>
              <p className="card-subtitle">
                Challenges to overcome when entering this market
              </p>
            </div>
          </div>
          <div className="toggle-icon">
            {expandedSections.barriers ? (
              <ChevronUp className="toggle-icon-item" />
            ) : (
              <ChevronDown className="toggle-icon-item" />
            )}
          </div>
        </div>
        
        {expandedSections.barriers && (
          <div className="card-content">
            <div className="barriers-list">
              {barriers_to_entry && barriers_to_entry.length > 0 ? (
                barriers_to_entry.map((barrier: string, index: number) => (
                  <div key={index} className="barrier-item">
                    <h4 className="barrier-title">{barrier}</h4>
                    <p className="barrier-description">
                      {index === 0 && "Established players have strong brand recognition and loyal user bases, making user acquisition costly."}
                      {index === 1 && "Pet care services may require certifications, background checks, and insurance in many regions."}
                      {index === 2 && "Pet owners are cautious about who they entrust with their pets, requiring significant trust-building efforts."}
                    </p>
                    <div className="mitigation-strategy">
                      <span className="mitigation-label">Mitigation strategy:</span>
                      <p className="mitigation-text">
                        {index === 0 && "Start in underserved geographic areas and focus on superior reliability for faster word-of-mouth growth."}
                        {index === 1 && "Partner with an existing insurance provider to offer comprehensive coverage for all service providers."}
                        {index === 2 && "Implement rigorous vetting, reviews, and real-time tracking for complete transparency."}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="barrier-item">
                  <h4 className="barrier-title">No barriers to entry identified</h4>
                  <p className="barrier-description">
                    Information about barriers to entry is not available.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Sources Card */}
      <div className="section-card">
        <div 
          className="card-header clickable"
          onClick={() => toggleSection('sources')}
        >
          <div>
            <h3 className="card-title">
              Research Sources
            </h3>
            <p className="card-subtitle">
              Sources used for competitive analysis
            </p>
          </div>
          <div className="toggle-icon">
            {expandedSections.sources ? (
              <ChevronUp className="toggle-icon-item" />
            ) : (
              <ChevronDown className="toggle-icon-item" />
            )}
          </div>
        </div>
        
        {expandedSections.sources && (
          <div className="card-content">
            <p className="sources-description">
              This competitive analysis was conducted using data from the following sources, combined with our proprietary market intelligence:
            </p>
            
            <div className="sources-list">
              {sources && sources.length > 0 ? (
                sources.map((source: any, index: number) => (
                  <div key={index} className="source-item">
                    <ExternalLink className="source-icon" />
                    <a href="#" className="source-link">{source.name}</a>
                    <span className="source-date">({source.date})</span>
                  </div>
                ))
              ) : (
                <div className="source-item">
                  <p>No source information available</p>
                </div>
              )}
            </div>
            
            <div className="confidence-score-container">
              <div className="confidence-score">
                <Info className="info-icon" />
                <p className="confidence-text">
                  <span className="confidence-label">Confidence Score:</span> {confidence_score}/10 based on data quality and source reliability.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompetitionSection; 