import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Users, TrendingUp, ChevronDown, ChevronUp, UserPlus, UserMinus } from 'lucide-react';
import './SegmentationSection.css';
import EmptyState from '../shared/EmptyState';

interface Segment {
  name: string;
  description: string;
  percentage: number;
  characteristics: {
    demographics: string[];
    psychographics: string[];
    problemsNeeds: string[];
    behaviors: string[];
  };
  growthPotential: string;
  reason?: string;
}

interface SegmentationData {
  primarySegments: Segment[];
  excludedSegments: Segment[];
}

interface SegmentationSectionProps {
  segmentationData?: SegmentationData;
  [key: string]: any; // For other props
}

const SegmentationSection: React.FC<SegmentationSectionProps> = ({ segmentationData }) => {
  // Return empty state if no data is available
  if (!segmentationData) {
    return (
      <EmptyState 
        title="Customer Segmentation Not Available" 
        message="Customer segmentation data has not been calculated yet." 
        icon={<Users size={48} />}
      />
    );
  }
  
  // State for selected segment
  const [selectedSegment, setSelectedSegment] = useState(0);
  
  // State for expanded sections
  const [expandedSections, setExpandedSections] = useState({
    excluded: false
  });
  
  // Toggle section expansion
  const toggleSection = (section: 'excluded') => {
    setExpandedSections({
      ...expandedSections,
      [section]: !expandedSections[section]
    });
  };
  
  // Assign colors to segments
  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#a4de6c'];
  
  // Format data for pie chart
  const pieData = segmentationData.primarySegments.map((segment, index) => ({
    name: segment.name,
    value: segment.percentage,
    color: colors[index % colors.length]
  }));
  
  // Growth potential to color class
  const growthPotentialColor = (potential: string) => {
    switch (potential) {
      case 'High': return 'growth-high';
      case 'Medium': return 'growth-medium';
      case 'Low': return 'growth-low';
      default: return 'growth-unknown';
    }
  };
  
  return (
    <div className="segmentation-view">
      {/* Header */}
      <div className="section-header">
        <h1 className="section-title">Customer Segmentation</h1>
        <p className="section-subtitle">
          Analysis of key customer segments for your business idea
        </p>
      </div>
      
      {/* Segments Overview Card */}
      <div className="section-card">
        <div className="card-header">
          <div className="header-content">
            <div className="icon-container purple">
              <Users className="icon" />
            </div>
            <div>
              <h3 className="card-title">
                Segment Distribution
              </h3>
              <p className="card-subtitle">
                {segmentationData.primarySegments.length} primary segments identified
              </p>
            </div>
          </div>
        </div>
        
        <div className="card-divider">
          <div className="segment-grid">
            {/* Pie Chart */}
            <div className="pie-chart-container">
              <div className="pie-chart">
                {pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.color} 
                            stroke={selectedSegment === index ? '#666' : 'none'} 
                            strokeWidth={selectedSegment === index ? 2 : 0}
                            style={{ cursor: 'pointer' }} 
                          />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => [`${value}%`, 'Market Share']}
                        contentStyle={{ borderRadius: '6px' }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="no-data-message">No segment data available</div>
                )}
              </div>
            </div>
            
            {/* Segments List */}
            <div className="segments-list">
              <div className="segments-list-inner">
                {segmentationData.primarySegments.length > 0 ? (
                  segmentationData.primarySegments.map((segment, index) => (
                    <div 
                      key={index} 
                      className={`segment-item ${selectedSegment === index ? 'segment-selected' : ''}`}
                      onClick={() => setSelectedSegment(index)}
                    >
                      <div className="segment-header">
                        <div className="segment-title">
                          <div 
                            className="segment-color-dot" 
                            style={{ backgroundColor: colors[index % colors.length] }}
                          ></div>
                          <h4 className="segment-name">{segment.name}</h4>
                        </div>
                        <div className="segment-stats">
                          <span className={`growth-indicator ${growthPotentialColor(segment.growthPotential)}`}>
                            {segment.growthPotential} Growth
                          </span>
                          <span className="percentage-badge">
                            {segment.percentage}%
                          </span>
                        </div>
                      </div>
                      <p className="segment-description">{segment.description}</p>
                    </div>
                  ))
                ) : (
                  <div className="no-data-message">No segments identified</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Selected Segment Detail Card */}
      {segmentationData.primarySegments.length > 0 && segmentationData.primarySegments[selectedSegment] && (
        <div className="section-card">
          <div className="card-header">
            <div className="header-content">
              <div 
                className="segment-color-dot"
                style={{ backgroundColor: colors[selectedSegment % colors.length] }}
              ></div>
              <h3 className="card-title">
                {segmentationData.primarySegments[selectedSegment].name}
              </h3>
            </div>
            <div className="segment-badges">
              <span className="percentage-badge">
                {segmentationData.primarySegments[selectedSegment].percentage}% of Market
              </span>
              <span className={`growth-indicator ${growthPotentialColor(segmentationData.primarySegments[selectedSegment].growthPotential)}`}>
                {segmentationData.primarySegments[selectedSegment].growthPotential} Growth Potential
              </span>
            </div>
          </div>
          
          <div className="card-content">
            <p className="segment-full-description">
              {segmentationData.primarySegments[selectedSegment].description}
            </p>
            
            <div className="characteristics-grid">
              {/* Demographics */}
              <div className="characteristic-box">
                <h4 className="characteristic-title">
                  <Users className="characteristic-icon" /> 
                  Demographics
                </h4>
                <ul className="characteristic-list">
                  {segmentationData.primarySegments[selectedSegment].characteristics.demographics.map((item, i) => (
                    <li key={i} className="characteristic-item">
                      <span className="bullet purple"></span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Psychographics */}
              <div className="characteristic-box">
                <h4 className="characteristic-title">
                  Psychographics
                </h4>
                <ul className="characteristic-list">
                  {segmentationData.primarySegments[selectedSegment].characteristics.psychographics.map((item, i) => (
                    <li key={i} className="characteristic-item">
                      <span className="bullet blue"></span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Problems & Needs */}
              <div className="characteristic-box">
                <h4 className="characteristic-title">
                  Problems & Needs
                </h4>
                <ul className="characteristic-list">
                  {segmentationData.primarySegments[selectedSegment].characteristics.problemsNeeds.map((item, i) => (
                    <li key={i} className="characteristic-item">
                      <span className="bullet red"></span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Behaviors */}
              <div className="characteristic-box">
                <h4 className="characteristic-title">
                  Behaviors
                </h4>
                <ul className="characteristic-list">
                  {segmentationData.primarySegments[selectedSegment].characteristics.behaviors.map((item, i) => (
                    <li key={i} className="characteristic-item">
                      <span className="bullet green"></span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Excluded Segments Card */}
      {segmentationData.excludedSegments && segmentationData.excludedSegments.length > 0 && (
        <div className="section-card">
          <div 
            className="card-header clickable"
            onClick={() => toggleSection('excluded')}
          >
            <div className="header-content">
              <div className="icon-container red">
                <UserMinus className="icon" />
              </div>
              <div>
                <h3 className="card-title">
                  Excluded Segments
                </h3>
                <p className="card-subtitle">
                  Market segments identified as poor fit for your business idea
                </p>
              </div>
            </div>
            <div className="toggle-icon">
              {expandedSections.excluded ? (
                <ChevronUp className="icon" />
              ) : (
                <ChevronDown className="icon" />
              )}
            </div>
          </div>
          
          {expandedSections.excluded && (
            <div className="card-content">
              <div className="excluded-segments">
                {segmentationData.excludedSegments.map((segment, index) => (
                  <div key={index} className="excluded-segment">
                    <h4 className="excluded-segment-title">{segment.name}</h4>
                    <p className="excluded-segment-reason">{segment.reason || segment.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Targeting Recommendations Card */}
      <div className="section-card">
        <div className="card-header">
          <div className="header-content">
            <div className="icon-container green">
              <TrendingUp className="icon" />
            </div>
            <div>
              <h3 className="card-title">
                Segment Targeting Recommendations
              </h3>
              <p className="card-subtitle">
                Strategic insights for effective market targeting
              </p>
            </div>
          </div>
        </div>
        
        <div className="card-content">
          <div className="recommendations">
            {segmentationData.primarySegments.length > 0 ? (
              <>
                <div className="recommendation">
                  <div className="recommendation-icon-container">
                    <UserPlus className="recommendation-icon" />
                  </div>
                  <div className="recommendation-content">
                    <h4 className="recommendation-title">Focus on {segmentationData.primarySegments[0].name} First</h4>
                    <p className="recommendation-text">This segment represents {segmentationData.primarySegments[0].percentage}% of your market and shows {segmentationData.primarySegments[0].growthPotential.toLowerCase()} growth potential. Their needs align well with your value proposition.</p>
                  </div>
                </div>
                
                {segmentationData.primarySegments.length > 1 && (
                  <div className="recommendation">
                    <div className="recommendation-icon-container">
                      <UserPlus className="recommendation-icon" />
                    </div>
                    <div className="recommendation-content">
                      <h4 className="recommendation-title">Consider {segmentationData.primarySegments[1].name} Next</h4>
                      <p className="recommendation-text">This segment represents {segmentationData.primarySegments[1].percentage}% of your market. Consider how your solution can address their specific needs.</p>
                    </div>
                  </div>
                )}
                
                {segmentationData.primarySegments.length > 2 && (
                  <div className="recommendation">
                    <div className="recommendation-icon-container">
                      <UserPlus className="recommendation-icon" />
                    </div>
                    <div className="recommendation-content">
                      <h4 className="recommendation-title">Develop Features for {segmentationData.primarySegments[2].name}</h4>
                      <p className="recommendation-text">This segment represents a smaller portion of your market but could provide additional growth opportunities as your business matures.</p>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="no-data-message">No segmentation data available for recommendations</div>
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
            How this segmentation analysis was performed
          </p>
        </div>
        <div className="card-content">
          <p className="methodology-text">
            This segmentation analysis was performed using our proprietary AI-driven methodology, which combines:
          </p>
          <ul className="methodology-list">
            <li>Demographic analysis of target market</li>
            <li>Behavioral pattern identification</li>
            <li>Psychographic profiling</li>
            <li>Needs-based segmentation</li>
            <li>Growth potential assessment</li>
          </ul>
          <p className="methodology-text">
            The AI model analyzed your business description and market context to identify distinct customer segments, their relative sizes, and their specific characteristics.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SegmentationSection; 