import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, DollarSign, Globe, Info, ChevronDown, ChevronUp, Archive, ExternalLink } from 'lucide-react';
import EmptyState from '../shared/EmptyState';
import './MarketSizingSection.css';

interface MarketSizingSectionProps {
  // Add props received from the transformer
  marketData?: any;
  hasError?: boolean;
  errorMessage?: string;
  calculationSource?: string;
  [key: string]: any; // To allow for all other properties from the transformer
}

// Add interfaces for the data structures
interface MarketSizeItem {
  name: string;
  value: number;
  displayValue: string;
  description: string;
}

interface GeoDataItem {
  name: string;
  value: number;
  color: string;
}

const MarketSizingSection: React.FC<MarketSizingSectionProps> = (props) => {
  const { marketData } = props;
  
  // Return empty state if no data is available
  if (!marketData) {
    return (
      <EmptyState 
        title="Market Sizing Not Available" 
        message="Market sizing data has not been calculated yet." 
        icon={<TrendingUp size={48} />}
      />
    );
  }
  
  // Get market sizing data and calculations from props
  const marketSizingData = marketData;
  const sizingCalculation = props.sizingCalculation || marketData.sizingCalculation;
  const marketSizeData = props.marketSizeData || marketData.marketSizeData;
  const growthData = props.growthData || marketData.growthData;
  const geographicData = props.geographicData || marketData.geographicData;
  const averageGrowthRate = props.averageGrowthRate || marketData.averageGrowthRate;
  const tamPotential = props.tamPotential || marketData.tamPotential;
  
  // State for expanded sections
  const [expandedSections, setExpandedSections] = useState({
    sources: false
  });
  
  // Toggle section expansion
  const toggleSection = (section: 'sources') => {
    setExpandedSections({
      ...expandedSections,
      [section]: !expandedSections[section]
    });
  };
  
  // Custom tooltip for the market size chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-title">{payload[0].payload.name}: {payload[0].payload.displayValue}</p>
          <p className="tooltip-desc">{payload[0].payload.description}</p>
        </div>
      );
    }
  
    return null;
  };
  
  // Format market size with unit for display
  const formatMarketSize = (size: number, unit: string) => {
    if (unit === 'billion') {
      return `$${size}B`;
    } else if (unit === 'million') {
      return `$${size}M`;
    } else {
      return `$${size}`;
    }
  };
  
  return (
    <div className="market-sizing-view">
      {/* Header */}
      <div className="section-header">
        <h1 className="section-title">Market Sizing</h1>
        <p className="section-subtitle">
          Comprehensive analysis of your addressable market
        </p>
      </div>
      
      {/* Error notification when backend calculation fails */}
      {props.hasError && (
        <div className="error-notification">
          <div className="error-icon">!</div>
          <div className="error-content">
            <h4 className="error-title">Market Sizing Calculation Issue</h4>
            <p className="error-message">{props.errorMessage || "There was an issue calculating the market size. Using estimates instead."}</p>
          </div>
        </div>
      )}
      
      {/* TAM/SAM/SOM Card */}
      <div className="section-card">
        <div className="card-header">
          <div className="icon-container blue">
            <TrendingUp className="icon" />
          </div>
          <div>
            <h3 className="card-title">
              Market Size Analysis
            </h3>
            <p className="card-subtitle">
              TAM, SAM, and SOM calculations
            </p>
          </div>
        </div>
        
        <div className="card-content">
          <div className="chart-container market-size-chart">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={marketSizeData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => `$${value}B`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="value" name="Market Size (Billions USD)" fill="#3b82f6">
                  {marketSizeData.map((_: MarketSizeItem, index: number) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={index === 0 ? '#3b82f6' : index === 1 ? '#60a5fa' : '#93c5fd'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="market-size-cards">
            {/* TAM */}
            <div className="market-size-card">
              <div className="market-size-card-header">
                <h4 className="market-size-card-title">TAM</h4>
                <span className="market-size-value tam">{sizingCalculation.tam.formatted}</span>
              </div>
              <p className="market-size-desc">Total Addressable Market</p>
              <div className="market-size-details">
                <span>Range: {sizingCalculation.tam.range}</span>
                <span>Growth: {sizingCalculation.tam.growth_rate.formatted}</span>
              </div>
              <p className="market-size-projection">
                The dog walking services market is projected to reach ${tamPotential.toFixed(1)}B by 2029.
              </p>
            </div>
            
            {/* SAM */}
            <div className="market-size-card">
              <div className="market-size-card-header">
                <h4 className="market-size-card-title">SAM</h4>
                <span className="market-size-value sam">{sizingCalculation.sam.formatted}</span>
              </div>
              <p className="market-size-desc">Serviceable Addressable Market</p>
              <div className="market-size-details">
                <span>Range: {sizingCalculation.sam.range}</span>
              </div>
              <div className="market-multipliers">
                <div className="multiplier-row">
                  <span>Geographic Focus:</span>
                  <span>{sizingCalculation.sam.multipliers.geographic * 100}%</span>
                </div>
                <div className="multiplier-row">
                  <span>Target Segments:</span>
                  <span>{sizingCalculation.sam.multipliers.segments * 100}%</span>
                </div>
                <div className="multiplier-row">
                  <span>Tech Adoption:</span>
                  <span>{sizingCalculation.sam.multipliers.techAdoption * 100}%</span>
                </div>
              </div>
            </div>
            
            {/* SOM */}
            <div className="market-size-card">
              <div className="market-size-card-header">
                <h4 className="market-size-card-title">SOM</h4>
                <span className="market-size-value som">{sizingCalculation.som.formatted}</span>
              </div>
              <p className="market-size-desc">Serviceable Obtainable Market</p>
              <div className="market-size-details">
                <span>Range: {sizingCalculation.som.range}</span>
              </div>
              <div className="market-multipliers">
                <div className="multiplier-row">
                  <span>New Entrant Share:</span>
                  <span>{sizingCalculation.som.multipliers.newEntrant * 100}%</span>
                </div>
                <div className="multiplier-row">
                  <span>Marketing Reach:</span>
                  <span>{sizingCalculation.som.multipliers.marketingReach * 100}%</span>
                </div>
                <div className="multiplier-row">
                  <span>Conversion Rate:</span>
                  <span>{sizingCalculation.som.multipliers.conversion * 100}%</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="confidence-info">
            <Info className="info-icon" />
            <p className="confidence-text">
              <span className="confidence-label">Confidence Score:</span> {sizingCalculation.confidence_score}/10 based on {marketSizingData.market_data?.sources?.length || 0} market research sources.
              {props.calculationSource && <span className="calculation-source"> {props.calculationSource}</span>}
            </p>
          </div>
        </div>
      </div>
      
      {/* Growth Trend Card */}
      <div className="section-card">
        <div className="card-header">
          <div className="icon-container green">
            <TrendingUp className="icon" />
          </div>
          <div>
            <h3 className="card-title">
              Market Growth Projection
            </h3>
            <p className="card-subtitle">
              Forecasted market growth with {averageGrowthRate.toFixed(1)}% annual growth rate
            </p>
          </div>
        </div>
        
        <div className="card-content">
          <div className="chart-container growth-chart">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={growthData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis tickFormatter={(value) => `$${value}B`} />
                <Tooltip formatter={(value) => [`$${value}B`, 'Market Size']} />
                <Bar dataKey="market" fill="#10b981" name="Market Size (Billions USD)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="growth-drivers-container">
            <h4 className="growth-drivers-title">Key Growth Drivers:</h4>
            <ul className="growth-drivers-list">
              {marketSizingData.market_data?.market_breakdown?.growth_drivers?.map((driver: string, index: number) => (
                <li key={index}>{driver}</li>
              )) || (
                <li>Market growth data not available</li>
              )}
            </ul>
          </div>
        </div>
      </div>
      
      {/* Geographic Distribution Card */}
      <div className="section-card">
        <div className="card-header">
          <div className="icon-container indigo">
            <Globe className="icon" />
          </div>
          <div>
            <h3 className="card-title">
              Geographic Distribution
            </h3>
            <p className="card-subtitle">
              Regional breakdown of market
            </p>
          </div>
        </div>
        
        <div className="card-content">
          <div className="geo-distribution-grid">
            <div className="geo-chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={geographicData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {geographicData.map((entry: GeoDataItem, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}%`, 'Market Share']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="geo-insights-container">
              <h4 className="geo-insights-title">Regional Insights</h4>
              
              <div className="geo-insights">
                <div className="geo-insight-card blue">
                  <div className="geo-color-indicator">
                    <div className="color-dot" style={{ backgroundColor: '#3b82f6' }}></div>
                    <h5 className="geo-region-title">North America (40%)</h5>
                  </div>
                  <p className="geo-region-desc">
                    Largest market with high smartphone penetration and pet ownership rates.
                  </p>
                </div>
                
                <div className="geo-insight-card green">
                  <div className="geo-color-indicator">
                    <div className="color-dot" style={{ backgroundColor: '#10b981' }}></div>
                    <h5 className="geo-region-title">Europe (30%)</h5>
                  </div>
                  <p className="geo-region-desc">
                    Strong growth in urban centers with increasing pet adoption rates.
                  </p>
                </div>
                
                <div className="geo-insight-card yellow">
                  <div className="geo-color-indicator">
                    <div className="color-dot" style={{ backgroundColor: '#f59e0b' }}></div>
                    <h5 className="geo-region-title">Asia (20%)</h5>
                  </div>
                  <p className="geo-region-desc">
                    Emerging market with rapid urbanization and growing middle class.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Market Research Sources Card */}
      <div className="section-card">
        <div 
          className="card-header clickable"
          onClick={() => toggleSection('sources')}
        >
          <div className="header-content">
            <div className="icon-container gray">
              <Archive className="icon" />
            </div>
            <div>
              <h3 className="card-title">
                Market Research Sources
              </h3>
              <p className="card-subtitle">
                {marketSizingData.market_data?.sources?.length || 0} sources used for market sizing
              </p>
            </div>
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
            <div className="sources-list">
              {marketSizingData.market_data?.sources?.map((source: any, index: number) => (
                <div key={index} className="source-item">
                  <div className="source-header">
                    <h4 className="source-name">
                      {source.publisher}
                      <a href="#" className="external-link">
                        <ExternalLink className="external-icon" />
                      </a>
                    </h4>
                    <div className="source-quality">
                      <span className="quality-badge">
                        Quality: {source.source_quality}/10
                      </span>
                    </div>
                  </div>
                  
                  <div className="source-details-grid">
                    <div className="source-details-column">
                      <div className="source-detail-row">
                        <DollarSign className="detail-icon" />
                        <span className="detail-label">Market Size: </span>
                        <span className="detail-value">
                          {formatMarketSize(source.market_size, source.market_size_unit)} ({source.year})
                        </span>
                      </div>
                      
                      <div className="source-detail-row">
                        <TrendingUp className="detail-icon" />
                        <span className="detail-label">Growth Rate: </span>
                        <span className="detail-value">
                          {source.growth_rate}% CAGR
                        </span>
                      </div>
                    </div>
                    
                    <div className="source-details-column">
                      <div className="source-detail-row">
                        <TrendingUp className="detail-icon" />
                        <span className="detail-label">Projected: </span>
                        <span className="detail-value">
                          {formatMarketSize(source.projected_size, source.projected_size_unit)} by {source.projection_year}
                        </span>
                      </div>
                      
                      <div className="source-detail-row">
                        <Info className="detail-icon" />
                        <span className="detail-info">
                          {source.key_information}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )) || (
                <p>No source data available</p>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Analysis Methodology Card */}
      <div className="section-card">
        <div className="card-header">
          <h3 className="card-title">
            Analysis Methodology
          </h3>
          <p className="card-subtitle">
            How this market sizing was performed
          </p>
        </div>
        <div className="card-content">
          <div className="methodology-grid">
            <div className="methodology-column">
              <h4 className="methodology-title">
                TAM (Total Addressable Market)
              </h4>
              <p className="methodology-desc">
                TAM was calculated by analyzing multiple market research reports focused on the pet services and dog walking industry. We triangulated data from {marketSizingData.market_data?.sources?.length || 0} primary sources to establish a reliable market size estimate.
              </p>
              
              <h4 className="methodology-title methodology-title-gap">
                SAM (Serviceable Addressable Market)
              </h4>
              <p className="methodology-desc">
                SAM was calculated by applying the following filters to the TAM:
              </p>
              <ul className="methodology-list">
                <li>Geographic focus ({sizingCalculation.sam.multipliers.geographic * 100}%): Targeting specific regions based on your business scope</li>
                <li>Target segments ({sizingCalculation.sam.multipliers.segments * 100}%): Focus on the identified customer segments</li>
                <li>Technology adoption ({sizingCalculation.sam.multipliers.techAdoption * 100}%): Considering adoption rates for mobile app services</li>
              </ul>
            </div>
            
            <div className="methodology-column">
              <h4 className="methodology-title">
                SOM (Serviceable Obtainable Market)
              </h4>
              <p className="methodology-desc">
                SOM was calculated by applying realistic business constraints to the SAM:
              </p>
              <ul className="methodology-list">
                <li>New entrant market share ({sizingCalculation.som.multipliers.newEntrant * 100}%): Typical market penetration for new entrants</li>
                <li>Marketing reach ({sizingCalculation.som.multipliers.marketingReach * 100}%): Percentage of market you can effectively reach</li>
                <li>Conversion rate ({sizingCalculation.som.multipliers.conversion * 100}%): Expected conversion from awareness to paying customers</li>
              </ul>
              
              <h4 className="methodology-title methodology-title-gap">
                Growth Projections
              </h4>
              <p className="methodology-desc">
                Growth projections were derived from the weighted average of growth rates from the source reports, applying a compounded annual growth rate of {averageGrowthRate.toFixed(1)}% to estimate future market sizes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketSizingSection; 