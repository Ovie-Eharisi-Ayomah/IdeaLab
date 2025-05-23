import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, DollarSign, Globe, Info, ChevronDown, ChevronUp, Archive, ExternalLink } from 'lucide-react';
import EmptyState from '../shared/EmptyState'; // Assuming EmptyState is still relevant for consistency
import '../sections/MarketSizingSection.css'; // Re-use existing styles if applicable

// Interfaces for data structures (can be moved to a shared types file if used elsewhere)
interface MarketSizeItem {
  name: string;
  value: number; // In Billions for the chart
  displayValue: string; // Formatted string like $XB
  description: string;
}

interface GeoDataItem {
  name: string;
  value: number; // Percentage
  color: string;
}

const MarketSizingSectionMock: React.FC = () => {
  const [expandedSections, setExpandedSections] = useState({ sources: false });
  const toggleSection = (section: 'sources') => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const mockBusinessIdeaName = "AI Fitness Planner";
  const mockBusinessIdeaDescription = "A mobile app using AI for personalized meal plans and adaptive at-home workouts, simplifying users' health journeys.";

  // Hardcoded mock data for the AI Fitness Planner
  const sizingCalculation = {
    tam: {
      value: 150_000_000_000, // 150B
      low: 120_000_000_000,
      high: 180_000_000_000,
      formatted: "$150B",
      range: "$120B - $180B",
      growth_rate: { value: 12.5, formatted: "12.5%" },
      sources_count: 3,
      outliers_count: 0
    },
    sam: {
      value: 45_000_000_000, // 45B
      low: 35_000_000_000,
      high: 55_000_000_000,
      formatted: "$45B",
      range: "$35B - $55B",
      multipliers: { geographic: 0.6, segments: 0.5, techAdoption: 1.0 } // Assuming high tech adoption for app users
    },
    som: {
      value: 900_000_000, // 900M
      low: 500_000_000,
      high: 1_300_000_000,
      formatted: "$900M",
      range: "$500M - $1.3B",
      multipliers: { newEntrant: 0.05, marketingReach: 0.4, conversion: 0.1 } // 10% conversion
    },
    confidence_score: 7 // Example score
  };

  const marketSizeData: MarketSizeItem[] = [
    { name: 'TAM', value: sizingCalculation.tam.value / 1_000_000_000, displayValue: sizingCalculation.tam.formatted, description: 'Total Addressable Market for Health & Wellness Technology' },
    { name: 'SAM', value: sizingCalculation.sam.value / 1_000_000_000, displayValue: sizingCalculation.sam.formatted, description: 'Serviceable Addressable Market for Mobile Fitness & Diet Apps' },
    { name: 'SOM', value: sizingCalculation.som.value / 1_000_000_000, displayValue: sizingCalculation.som.formatted, description: 'Serviceable Obtainable Market (Year 1-3 Target)' }
  ];

  const averageGrowthRate = sizingCalculation.tam.growth_rate.value;
  const tamPotential = sizingCalculation.tam.value * Math.pow(1 + averageGrowthRate / 100, 5) / 1_000_000_000;

  const growthData = Array.from({ length: 7 }, (_, i) => {
    const year = new Date().getFullYear() + i;
    const market = (sizingCalculation.tam.value / 1_000_000_000) * Math.pow(1 + averageGrowthRate / 100, i);
    return { year, market: parseFloat(market.toFixed(1)) };
  });

  const geographicData: GeoDataItem[] = [
    { name: 'North America', value: 45, color: '#3b82f6' },
    { name: 'Europe', value: 30, color: '#10b981' },
    { name: 'Asia Pacific', value: 15, color: '#f59e0b' },
    { name: 'Rest of World', value: 10, color: '#6366f1' }
  ];

  const mockSources = [
    { publisher: "Statista Health & Fitness Apps Report", market_size: 140, market_size_unit: "billion", year: 2023, growth_rate: 12.0, source_quality: 8, projected_size: 245, projected_size_unit: "billion", projection_year: 2028, key_information: "Global revenue of health and fitness app market."}, 
    { publisher: "Grand View Research - Wellness Tech", market_size: 165, market_size_unit: "billion", year: 2024, growth_rate: 13.5, source_quality: 7, projected_size: 300, projected_size_unit: "billion", projection_year: 2028, key_information: "Market trends including AI personalization."}, 
    { publisher: "Insider Intelligence - Digital Health", market_size: 145, market_size_unit: "billion", year: 2023, growth_rate: 11.8, source_quality: 7, projected_size: 260, projected_size_unit: "billion", projection_year: 2028, key_information: "Focus on mobile health app user adoption."}, 
  ];

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

  const formatMarketSize = (size: number, unit: string) => {
    if (unit === 'billion') return `$${size}B`;
    if (unit === 'million') return `$${size}M`;
    return `$${size}`;
  };

  return (
    <div className="market-sizing-view">
      <div className="section-header">
        <h1 className="section-title">Market Sizing: {mockBusinessIdeaName}</h1>
        <p className="section-subtitle">Comprehensive analysis of the addressable market for: "{mockBusinessIdeaDescription}"</p>
      </div>

      <div className="section-card">
        <div className="card-header">
          <div className="icon-container blue"><TrendingUp className="icon" /></div>
          <div>
            <h3 className="card-title">Market Size Analysis</h3>
            <p className="card-subtitle">TAM, SAM, and SOM calculations</p>
          </div>
        </div>
        <div className="card-content">
          <div className="chart-container market-size-chart">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={marketSizeData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => `$${value}B`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="value" name="Market Size (Billions USD)" fill="#3b82f6">
                  {marketSizeData.map((_, index: number) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#3b82f6' : index === 1 ? '#60a5fa' : '#93c5fd'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="market-size-cards">
            <div className="market-size-card">
              <div className="market-size-card-header"><h4 className="market-size-card-title">TAM</h4><span className="market-size-value tam">{sizingCalculation.tam.formatted}</span></div>
              <p className="market-size-desc">Total Addressable Market</p>
              <div className="market-size-details"><span>Range: {sizingCalculation.tam.range}</span><span>Growth: {sizingCalculation.tam.growth_rate.formatted}</span></div>
              <p className="market-size-projection">The wellness tech market is projected to reach ${tamPotential.toFixed(1)}B by {new Date().getFullYear() + 5}.</p>
            </div>
            <div className="market-size-card">
              <div className="market-size-card-header"><h4 className="market-size-card-title">SAM</h4><span className="market-size-value sam">{sizingCalculation.sam.formatted}</span></div>
              <p className="market-size-desc">Serviceable Addressable Market</p>
              <div className="market-size-details"><span>Range: {sizingCalculation.sam.range}</span></div>
              <div className="market-multipliers">
                <div className="multiplier-row"><span>Geographic Focus:</span><span>{(sizingCalculation.sam.multipliers.geographic * 100).toFixed(0)}%</span></div>
                <div className="multiplier-row"><span>Target Segments:</span><span>{(sizingCalculation.sam.multipliers.segments * 100).toFixed(0)}%</span></div>
                <div className="multiplier-row"><span>Tech Adoption:</span><span>{(sizingCalculation.sam.multipliers.techAdoption * 100).toFixed(0)}%</span></div>
              </div>
            </div>
            <div className="market-size-card">
              <div className="market-size-card-header"><h4 className="market-size-card-title">SOM</h4><span className="market-size-value som">{sizingCalculation.som.formatted}</span></div>
              <p className="market-size-desc">Serviceable Obtainable Market</p>
              <div className="market-size-details"><span>Range: {sizingCalculation.som.range}</span></div>
              <div className="market-multipliers">
                <div className="multiplier-row"><span>New Entrant Share:</span><span>{(sizingCalculation.som.multipliers.newEntrant * 100).toFixed(0)}%</span></div>
                <div className="multiplier-row"><span>Marketing Reach:</span><span>{(sizingCalculation.som.multipliers.marketingReach * 100).toFixed(0)}%</span></div>
                <div className="multiplier-row"><span>Conversion Rate:</span><span>{(sizingCalculation.som.multipliers.conversion * 100).toFixed(0)}%</span></div>
              </div>
            </div>
          </div>
          <div className="confidence-info">
            <Info className="info-icon" />
            <p className="confidence-text">
              <span className="confidence-label">Confidence Score:</span> {sizingCalculation.confidence_score}/10 based on {mockSources.length} market research sources.
            </p>
          </div>
        </div>
      </div>

      <div className="section-card">
        <div className="card-header">
          <div className="icon-container green"><TrendingUp className="icon" /></div>
          <div><h3 className="card-title">Market Growth Projection</h3><p className="card-subtitle">Forecasted market growth with {averageGrowthRate.toFixed(1)}% annual growth rate</p></div>
        </div>
        <div className="card-content">
          <div className="chart-container growth-chart">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={growthData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis tickFormatter={(value) => `$${value}B`} />
                <Tooltip formatter={(value: number) => [`$${value.toFixed(1)}B`, 'Market Size']} />
                <Bar dataKey="market" fill="#10b981" name="Market Size (Billions USD)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="growth-drivers-container">
            <h4 className="growth-drivers-title">Key Growth Drivers:</h4>
            <ul className="growth-drivers-list">
              <li>Increasing health consciousness and adoption of mobile health apps.</li>
              <li>Advancements in AI for personalization and engagement.</li>
              <li>Growing demand for convenient at-home fitness solutions.</li>
              <li>Corporate wellness programs incorporating digital health tools.</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="section-card">
        <div className="card-header">
          <div className="icon-container indigo"><Globe className="icon" /></div>
          <div><h3 className="card-title">Geographic Distribution</h3><p className="card-subtitle">Regional breakdown of the mobile fitness & diet app market</p></div>
        </div>
        <div className="card-content">
          <div className="geo-distribution-grid">
            <div className="geo-chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={geographicData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {geographicData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [`${value.toFixed(0)}%`, 'Market Share']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="geo-insights-container">
              <h4 className="geo-insights-title">Regional Insights</h4>
              <div className="geo-insights">
                <div className="geo-insight-card blue"><div className="geo-color-indicator"><div className="color-dot" style={{ backgroundColor: '#3b82f6' }}></div><h5 className="geo-region-title">North America (45%)</h5></div><p className="geo-region-desc">Largest market due to high smartphone penetration, tech adoption, and focus on health.</p></div>
                <div className="geo-insight-card green"><div className="geo-color-indicator"><div className="color-dot" style={{ backgroundColor: '#10b981' }}></div><h5 className="geo-region-title">Europe (30%)</h5></div><p className="geo-region-desc">Strong growth driven by increasing wellness trends and digital literacy.</p></div>
                <div className="geo-insight-card yellow"><div className="geo-color-indicator"><div className="color-dot" style={{ backgroundColor: '#f59e0b' }}></div><h5 className="geo-region-title">Asia Pacific (15%)</h5></div><p className="geo-region-desc">Rapidly emerging market with a growing middle class and mobile-first population.</p></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="section-card">
        <div className="card-header clickable" onClick={() => toggleSection('sources')}>
          <div className="header-content">
            <div className="icon-container gray"><Archive className="icon" /></div>
            <div><h3 className="card-title">Market Research Sources</h3><p className="card-subtitle">{mockSources.length} sources used for market sizing</p></div>
          </div>
          <div className="toggle-icon">{expandedSections.sources ? <ChevronUp className="toggle-icon-item" /> : <ChevronDown className="toggle-icon-item" />}</div>
        </div>
        {expandedSections.sources && (
          <div className="card-content">
            <div className="sources-list">
              {mockSources.map((source, index) => (
                <div key={index} className="source-item">
                  <div className="source-header">
                    <h4 className="source-name">{source.publisher} <a href="#" className="external-link"><ExternalLink className="external-icon" /></a></h4>
                    <div className="source-quality"><span className="quality-badge">Quality: {source.source_quality}/10</span></div>
                  </div>
                  <div className="source-details-grid">
                    <div className="source-details-column">
                      <div className="source-detail-row"><DollarSign className="detail-icon" /><span className="detail-label">Market Size: </span><span className="detail-value">{formatMarketSize(source.market_size, source.market_size_unit)} ({source.year})</span></div>
                      <div className="source-detail-row"><TrendingUp className="detail-icon" /><span className="detail-label">Growth Rate: </span><span className="detail-value">{source.growth_rate}% CAGR</span></div>
                    </div>
                    <div className="source-details-column">
                      <div className="source-detail-row"><TrendingUp className="detail-icon" /><span className="detail-label">Projected: </span><span className="detail-value">{formatMarketSize(source.projected_size, source.projected_size_unit)} by {source.projection_year}</span></div>
                      <div className="source-detail-row"><Info className="detail-icon" /><span className="detail-info">{source.key_information}</span></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="section-card">
        <div className="card-header"><h3 className="card-title">Analysis Methodology</h3><p className="card-subtitle">How this market sizing was constructed</p></div>
        <div className="card-content">
          <div className="methodology-grid">
            <div className="methodology-column">
              <h4 className="methodology-title">TAM (Total Addressable Market)</h4>
              <p className="methodology-desc">TAM was estimated by aggregating data from mock industry reports on the global Health & Wellness Technology market, focusing on mobile applications.</p>
              <h4 className="methodology-title methodology-title-gap">SAM (Serviceable Addressable Market)</h4>
              <p className="methodology-desc">SAM was derived by applying filters to TAM based on: Geographic focus (e.g., regions with high smartphone/app usage), Target Segments (e.g., users interested in fitness and diet apps), and Technology Adoption rates.</p>
            </div>
            <div className="methodology-column">
              <h4 className="methodology-title">SOM (Serviceable Obtainable Market)</h4>
              <p className="methodology-desc">SOM was estimated based on a realistic early-stage market share for a new app, considering marketing reach and conversion rates for similar digital products.</p>
              <h4 className="methodology-title methodology-title-gap">Growth Projections</h4>
              <p className="methodology-desc">Growth projections are based on the mock average CAGR from the source reports, applied to the TAM estimate.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketSizingSectionMock; 