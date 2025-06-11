import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Cell, PieChart, Pie } from 'recharts';
import { BarChart2, Shield, Zap, Target, ExternalLink, Check, X, ChevronDown, ChevronUp, Award, TrendingUp, Info, Archive } from 'lucide-react';
import EmptyState from '../../../../src/components/dashboard/shared/EmptyState';
import '../sections/CompetitionSection.css'; // Re-use existing styles if applicable

const CompetitionSectionMock: React.FC = () => {
  const [expandedSections, setExpandedSections] = useState({ barriers: false, sources: false });
  const toggleSection = (section: 'barriers' | 'sources') => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const mockBusinessIdeaName = "AI Fitness Planner";
  const mockBusinessIdeaDescription = "A mobile app using AI for personalized meal plans and adaptive at-home workouts, simplifying users' health journeys.";

  // Hardcoded mock data
  const mockCompetitionData = {
    competitors: [
      {
        name: "MyFitnessPal",
        website: "https://www.myfitnesspal.com",
        products: ["Calorie tracking", "Exercise logging", "Community forums", "Recipe database"],
        target_audience: "Individuals seeking weight loss or to track dietary intake.",
        pricing_model: "Freemium with optional Premium subscription ($19.99/month or $79.99/year)",
        unique_selling_points: ["Massive food database", "Large active community"],
        market_position: "Market Leader in calorie tracking",
        founded: 2005,
        funding: "Acquired by Under Armour, then by Francisco Partners",
        marketShare: 35,
        strengths: ["Brand recognition", "Extensive food database", "Large user base"],
        weaknesses: ["Workout planning is basic", "AI personalization is limited for workouts", "User interface can feel cluttered"]
      },
      {
        name: "Fitbit Premium",
        website: "https://www.fitbit.com/global/us/products/services/premium",
        products: ["Guided workouts", "Mindfulness sessions", "Advanced health insights", "Sleep tracking tools"],
        target_audience: "Fitbit device users looking for enhanced health tracking and guidance.",
        pricing_model: "Subscription-based ($9.99/month or $79.99/year)",
        unique_selling_points: ["Integration with Fitbit hardware", "Comprehensive health metrics"],
        market_position: "Major Player in wearable-integrated fitness services",
        founded: 2007,
        funding: "Acquired by Google",
        marketShare: 25,
        strengths: ["Seamless hardware integration", "Strong sleep analysis", "Motivating challenges"],
        weaknesses: ["Meal planning is not a primary focus", "Workout variety can be limited without external apps", "Dependent on Fitbit ecosystem"]
      },
      {
        name: "Peloton Digital",
        website: "https://www.onepeloton.com/app",
        products: ["Live and on-demand fitness classes (cycling, running, strength, yoga)", "Guided programs"],
        target_audience: "Individuals seeking high-quality, motivating fitness classes at home.",
        pricing_model: "Subscription-based ($12.99/month for app access)",
        unique_selling_points: ["High production value classes", "Charismatic instructors", "Strong community feel"],
        market_position: "Leader in connected fitness classes",
        founded: 2012,
        funding: "Publicly traded (NASDAQ: PTON)",
        marketShare: 20,
        strengths: ["Engaging content", "Strong brand loyalty", "Effective workout programs"],
        weaknesses: ["No nutritional planning/meal tracking", "Primarily focused on instructor-led classes rather than adaptive AI plans", "Can be perceived as expensive"]
      },
      {
        name: "Noom",
        website: "https.www.noom.com",
        products: ["Psychology-based weight loss courses", "Personal coaching (text-based)", "Food logging", "Exercise tracking"],
        target_audience: "Individuals looking for a behavior change approach to weight loss and healthy habits.",
        pricing_model: "Subscription-based (prices vary, often around $59/month or $199/year after trial)",
        unique_selling_points: ["Focus on psychology and habit formation", "Dedicated personal coaches"],
        market_position: "Significant Player in behavior-change weight loss programs",
        founded: 2008,
        funding: "Significant venture capital funding",
        marketShare: 15,
        strengths: ["Effective for long-term habit change", "Personalized coaching support", "Educational content"],
        weaknesses: ["Workout routines are not a primary feature", "AI for plan adaptation is less dynamic than specialized fitness AI", "Can be expensive for some users"]
      }
    ],
    market_gaps: [
      "Truly adaptive AI that dynamically adjusts both meal and workout plans based on real-time progress and feedback.",
      "Seamless integration of comprehensive meal planning (with recipes, grocery lists) and personalized, progressive workout routines in one app.",
      "Affordable AI-driven personalization for users not wanting expensive human coaches.",
      "Lack of hyper-personalization considering dietary restrictions, available equipment, and time constraints simultaneously."
    ],
    barriers_to_entry: [
      "High cost of developing sophisticated AI and robust content (recipes, workout videos).",
      "Building a sufficiently large and accurate food and exercise database.",
      "User acquisition costs in a crowded market dominated by established players.",
      "Achieving brand trust and credibility in the health and wellness space."
    ],
    market_concentration: "Moderately concentrated, with several large players (MyFitnessPal, Fitbit/Google, Peloton, Noom) but still room for innovative solutions, especially in AI personalization.",
    emerging_trends: [
      "Hyper-personalization using AI and machine learning.",
      "Increased focus on holistic wellness, integrating mental health and sleep.",
      "Gamification and social features to improve user engagement and retention.",
      "Integration with a wider range of wearables and smart home devices."
    ],
    sources: [
      { url: "https://www.examplehealthreports.com/fitnessapps2024", name: "Example Health Reports", date: "2024-03-15" },
      { url: "https://www.techcrunch.com/category/health", name: "TechCrunch Health Section", date: "Ongoing" },
      { url: "https://www.statista.com/topics/1705/health-and-fitness-apps/", name: "Statista - Health & Fitness Apps", date: "2024-Q1" }
    ],
    confidence_score: 8
  };

  // Destructure directly from mockCompetitionData for clarity
  const competitors = mockCompetitionData.competitors;
  const market_gaps = mockCompetitionData.market_gaps;
  const barriers_to_entry = mockCompetitionData.barriers_to_entry;
  const market_concentration = mockCompetitionData.market_concentration;
  const emerging_trends = mockCompetitionData.emerging_trends;
  const sources = mockCompetitionData.sources;
  const confidence_score = mockCompetitionData.confidence_score;
  
  // enhancedCompetitors is the same as competitors in this mock setup
  const enhancedCompetitors = competitors;

  const marketShareData = competitors.filter(c => c.marketShare != null).map((c, i) => ({
     name: c.name, 
     value: c.marketShare as number, // Assert as number after filter, assuming marketShare is indeed number
     color: ['#3b82f6', '#10b981', '#f59e0b', '#8884d8', '#ff8042'][i % 5] 
    }));

  const radarData = [
    { subject: 'Personalization', "AI Fitness Planner": 9, "Competitor Avg.": 6, fullMark: 10 },
    { subject: 'Meal Planning', "AI Fitness Planner": 8, "Competitor Avg.": 5, fullMark: 10 },
    { subject: 'Workout Variety', "AI Fitness Planner": 7, "Competitor Avg.": 7, fullMark: 10 },
    { subject: 'Ease of Use', "AI Fitness Planner": 8, "Competitor Avg.": 7, fullMark: 10 },
    { subject: 'Community', "AI Fitness Planner": 6, "Competitor Avg.": 8, fullMark: 10 },
    { subject: 'Price Value', "AI Fitness Planner": 7, "Competitor Avg.": 6, fullMark: 10 },
  ];
  
  const getCount = (arr: any[] | undefined) => Array.isArray(arr) ? arr.length : 0;

  return (
    <div className="competition-view">
      <div className="section-header">
        <h1 className="section-title">Competitive Analysis: {mockBusinessIdeaName}</h1>
        <p className="section-subtitle">Analysis of the competitive landscape for "{mockBusinessIdeaDescription}"</p>
      </div>
      
      <div className="section-card">
        <div className="card-header">
          <div className="icon-container purple"><BarChart2 className="icon" /></div>
          <div>
            <h3 className="card-title">Competitive Landscape Overview</h3>
            <p className="card-subtitle">{enhancedCompetitors?.length || 0} major competitors identified</p>
          </div>
        </div>
        <div className="card-content">
          <div className="market-concentration">
            <h4 className="concentration-title">Market Concentration:</h4>
            <p className="concentration-text">{market_concentration || 'Data not available'}</p>
          </div>
          <div className="chart-grid">
            <div className="chart-container">
              <h4 className="chart-title">Market Share Distribution</h4>
              <div className="chart">
                {marketShareData && marketShareData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={marketShareData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                        {marketShareData.map((entry: any, index: number) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
                      </Pie>
                      <Tooltip formatter={(value: number) => [`${value}%`, 'Market Share']} /> <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : <div className="chart-placeholder">No market share data</div>}
              </div>
            </div>
            <div className="chart-container">
              <h4 className="chart-title">Competitive Positioning (Radar)</h4>
              <div className="chart">
                {radarData && radarData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart outerRadius={90} data={radarData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="subject" />
                      <PolarRadiusAxis angle={30} domain={[0, 10]} />
                      <Radar name="AI Fitness Planner" dataKey="AI Fitness Planner" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.7} />
                      <Radar name="Competitor Avg." dataKey="Competitor Avg." stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.5} />
                      <Legend /> <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                ) : <div className="chart-placeholder">No radar data</div>}
              </div>
            </div>
          </div>
          {/* ... (Insight cards can be added here if desired) ... */}
        </div>
      </div>

      <div className="section-card">
        <div className="card-header"><h3 className="card-title">Competitor Profiles</h3><p className="card-subtitle">Detailed analysis of key competitors</p></div>
        <div className="competitors-list">
          {enhancedCompetitors && enhancedCompetitors.length > 0 ? (
            enhancedCompetitors.map((competitor: any, index: number) => (
              <div key={index} className="competitor-item">
                <div className="competitor-header">
                  <div className="competitor-info">
                    <div className="competitor-name-container"><h4 className="competitor-name">{competitor.name}</h4>{competitor.website && competitor.website !== "N/A" && (<a href={competitor.website} target="_blank" rel="noopener noreferrer" className="external-link"><ExternalLink className="external-icon" /></a>)}</div>
                    <p className="competitor-position">{competitor.market_position}</p>
                  </div>
                  <div className="competitor-badges">
                    {competitor.marketShare && <span className="market-share-badge">{competitor.marketShare}% Market Share</span>}
                    {competitor.founded && <span className="founded-badge">Founded: {competitor.founded}</span>}
                  </div>
                </div>
                <div className="competitor-details">
                  <div className="business-model">
                    <h5 className="details-title">Business Model & Offerings</h5>
                    <div className="business-model-details">
                      <div className="model-item"><span className="model-label">Target Audience:</span><p className="model-value">{competitor.target_audience}</p></div>
                      <div className="model-item"><span className="model-label">Pricing Model:</span><p className="model-value">{competitor.pricing_model}</p></div>
                      <div className="model-item"><span className="model-label">Products/Services:</span><ul className="products-list">{competitor.products?.map((product: string, i: number) => (<li key={i}>{product}</li>))}</ul></div>
                      <div className="model-item"><span className="model-label">Unique Selling Points:</span><ul className="products-list">{competitor.unique_selling_points?.map((usp: string, i: number) => (<li key={i}>{usp}</li>))}</ul></div>
                    </div>
                  </div>
                  <div className="strengths-weaknesses">
                    <h5 className="details-title">Strengths & Weaknesses</h5>
                    <div className="sw-container">
                      <div className="sw-section"><div className="sw-header"><Check className="strengths-icon" /><span className="sw-title">Strengths ({getCount(competitor.strengths)})</span></div><ul className="sw-list">{competitor.strengths?.map((s: string, i: number) => (<li key={i}>{s}</li>))}</ul></div>
                      <div className="sw-section"><div className="sw-header"><X className="weaknesses-icon" /><span className="sw-title">Weaknesses ({getCount(competitor.weaknesses)})</span></div><ul className="sw-list">{competitor.weaknesses?.map((w: string, i: number) => (<li key={i}>{w}</li>))}</ul></div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : <div className="empty-competitors-message">No competitor profiles available.</div>}
        </div>
      </div>

      <div className="section-card">
        <div className="card-header">
          <div className="icon-container green"><Target className="icon" /></div>
          <div><h3 className="card-title">Market Gaps & Opportunities</h3><p className="card-subtitle">Unmet needs and potential differentiation points</p></div>
        </div>
        <div className="card-content">
          <div className="gaps-grid">
            <div className="gaps-column">
              <h4 className="gaps-title">Key Market Gaps</h4>
              <div className="gaps-list">
                {market_gaps && market_gaps.length > 0 ? market_gaps.map((gap: string, index: number) => (<div key={index} className="gap-item"><div className="gap-content"><Zap className="gap-icon" /><div className="gap-text-container"><p className="gap-text">{gap}</p><p className="gap-label">Potential competitive advantage</p></div></div></div>)) : <p>No specific market gaps identified.</p>}
              </div>
            </div>
            <div className="gaps-column">
              <h4 className="gaps-title">Emerging Trends</h4>
              <div className="gaps-list">
                {emerging_trends && emerging_trends.length > 0 ? emerging_trends.map((trend: string, index: number) => (<div key={index} className="trend-item"><div className="trend-content"><TrendingUp className="trend-icon" /><div className="trend-text-container"><p className="trend-text">{trend}</p><p className="trend-label">Market direction to capitalize on</p></div></div></div>)) : <p>No specific emerging trends identified.</p>}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="section-card">
        <div className="card-header clickable" onClick={() => toggleSection('barriers')}>
          <div className="header-content">
            <div className="icon-container red"><Shield className="icon" /></div>
            <div><h3 className="card-title">Barriers to Entry</h3><p className="card-subtitle">Challenges to overcome when entering this market</p></div>
          </div>
          <div className="toggle-icon">{expandedSections.barriers ? <ChevronUp className="toggle-icon-item" /> : <ChevronDown className="toggle-icon-item" />}</div>
        </div>
        {expandedSections.barriers && (
          <div className="card-content">
            <div className="barriers-list">
              {barriers_to_entry && barriers_to_entry.length > 0 ? barriers_to_entry.map((barrier: string, index: number) => (
                <div key={index} className="barrier-item">
                  <h4 className="barrier-title">{barrier}</h4>
                  {/* Mock mitigation strategies */}
                  <div className="mitigation-strategy"><span className="mitigation-label">Mitigation:</span><p className="mitigation-text">{index === 0 ? "Focus on a niche or underserved segment initially." : index === 1 ? "Develop a strong IP portfolio around unique AI algorithms." : "Build a strong community and brand evangelists early on."}</p></div>
                </div>
              )) : <p>No specific barriers to entry identified.</p>}
            </div>
          </div>
        )}
      </div>

      <div className="section-card">
        <div className="card-header clickable" onClick={() => toggleSection('sources')}>
          <div className="header-content">
             <div className="icon-container gray"><Archive className="icon" /></div>
             <div><h3 className="card-title">Research Sources</h3><p className="card-subtitle">{sources?.length || 0} sources cited</p></div>
          </div>
          <div className="toggle-icon">{expandedSections.sources ? <ChevronUp className="toggle-icon-item" /> : <ChevronDown className="toggle-icon-item" />}</div>
        </div>
        {expandedSections.sources && (
          <div className="card-content">
            <p className="sources-description">Competitive analysis based on publicly available information and industry knowledge.</p>
            <div className="sources-list">
              {sources && sources.length > 0 ? sources.map((source: any, index: number) => (
                <div key={index} className="source-item">
                  <ExternalLink className="source-icon" />
                  <a href={source.url || "#"} target="_blank" rel="noopener noreferrer" className="source-link">{source.name}</a>
                  {source.date && <span className="source-date">({source.date})</span>}
                </div>
              )) : <p>No source information available.</p>}
            </div>
            <div className="confidence-score-container">
              <div className="confidence-score"><Info className="info-icon" /><p className="confidence-text"><span className="confidence-label">Confidence Score:</span> {confidence_score}/10 based on data quality.</p></div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default CompetitionSectionMock; 