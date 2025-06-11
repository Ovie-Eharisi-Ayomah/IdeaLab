import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, LegendProps } from 'recharts';
import { Users, TrendingUp, ChevronDown, ChevronUp, UserPlus, UserMinus, Activity, Brain, ShoppingBag, Users2 } from 'lucide-react'; // Added more icons for characteristics
import EmptyState from '../../../../src/components/dashboard/shared/EmptyState';
import '../sections/SegmentationSection.css'; // Re-use existing styles if applicable

// Define interfaces for the mock data structure
interface CharacteristicItem {
  icon: React.ReactNode;
  label: string;
  items: string[];
}
interface Segment {
  name: string;
  description: string;
  percentage: number;
  characteristics: {
    demographics: CharacteristicItem;
    psychographics: CharacteristicItem;
    behaviors: CharacteristicItem;
    needs_pain_points: CharacteristicItem;
  };
  growthPotential: 'High' | 'Medium' | 'Low';
  motivation?: string;
  marketing_channels?: string[];
}

interface MockSegmentationData {
  primarySegments: Segment[];
  excludedSegments?: Array<{ name: string; reason: string }>;
  segment_analysis?: { confidence_score?: number; };
}

// Define a more specific type for the legend onClick event payload
// Recharts' Payload type can be complex and vary. We are interested in 'value' which holds the name.
interface CustomLegendPayload {
    value?: string; // The name of the segment, derived from nameKey of Pie
    // Recharts may pass other properties, but we only need value here.
    [key: string]: any; 
}

const SegmentationSectionMock: React.FC = () => {
  const mockBusinessIdeaName = "AI Fitness Planner";
  const mockBusinessIdeaDescription = "A mobile app using AI for personalized meal plans and adaptive at-home workouts, simplifying users' health journeys.";

  const [selectedSegmentIdx, setSelectedSegmentIdx] = useState(0);
  const [expandedSections, setExpandedSections] = useState({ excluded: false });

  const toggleSection = (section: 'excluded') => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Hardcoded mock data
  const mockSegmentationData: MockSegmentationData = {
    primarySegments: [
      {
        name: "Busy Professionals (28-45)",
        description: "Time-poor professionals seeking efficient and effective ways to manage their diet and fitness integrated into their hectic schedules via an AI Fitness Planner.",
        percentage: 40,
        characteristics: {
          demographics: { icon: <Users2 />, label: "Demographics", items: ["Age: 28-45", "Occupation: Corporate, Tech, Entrepreneur", "Income: Middle to High", "Education: College Graduate+", "Location: Urban/Suburban"] },
          psychographics: { icon: <Brain />, label: "Psychographics", items: ["Value convenience & efficiency", "Goal-oriented & ambitious", "Health-conscious but time-constrained", "Tech-savvy, early adopters of fitness apps"] },
          behaviors: { icon: <ShoppingBag />, label: "Behaviors", items: ["Use productivity & health apps regularly", "Willing to pay for premium services that save time", "Seek structured, actionable plans from their fitness planner"] },
          needs_pain_points: { icon: <Activity />, label: "Needs & Pain Points", items: ["Need: Quick, effective workouts & simple meal plans from an AI planner", "Pain: Lack of time for planning, decision fatigue regarding health choices, inconsistent results from generic fitness apps"] }
        },
        growthPotential: "High",
        motivation: "Achieve fitness goals despite busy lifestyle, improve energy, reduce stress with help from their AI Fitness Planner.",
        marketing_channels: ["LinkedIn targeted ads", "Productivity app integrations", "Wellness blogs for professionals", "Corporate wellness programs"]
      },
      {
        name: "Fitness Enthusiasts (22-35)",
        description: "Dedicated individuals actively engaging in fitness, looking for advanced tools like an AI Fitness Planner to optimize performance and track progress meticulously.",
        percentage: 30,
        characteristics: {
          demographics: { icon: <Users2 />, label: "Demographics", items: ["Age: 22-35", "Interest: Bodybuilding, endurance sports, specific fitness disciplines pursued with their AI planner", "High engagement with online fitness communities"] },
          psychographics: { icon: <Brain />, label: "Psychographics", items: ["Data-driven & analytical regarding fitness metrics", "Committed & disciplined to their AI-guided plans", "Seek performance optimization and new challenges"] },
          behaviors: { icon: <ShoppingBag />, label: "Behaviors", items: ["Use multiple fitness apps/wearables to supplement AI Fitness Planner", "Follow fitness influencers for inspiration", "Invest in supplements & specialized gear"] },
          needs_pain_points: { icon: <Activity />, label: "Needs & Pain Points", items: ["Need: Advanced analytics, highly customizable AI plans, integration with all their devices", "Pain: Hitting plateaus, information overload from too many sources, finding truly elite-level AI guidance"] }
        },
        growthPotential: "Medium",
        motivation: "Peak physical performance, achieving specific milestones set with their AI Fitness Planner, community recognition for their dedication.",
        marketing_channels: ["Instagram/YouTube fitness influencers showcasing AI planner benefits", "Specialized fitness forums", "Partnerships with high-end supplement/gear companies"]
      },
      {
        name: "Health-Conscious Beginners (30-55)",
        description: "Individuals new to structured fitness and nutrition, seeking guidance from an AI Fitness Planner for motivation and an easy entry point.",
        percentage: 20,
        characteristics: {
          demographics: { icon: <Users2 />, label: "Demographics", items: ["Age: 30-55", "May have sedentary jobs, seeking change", "Varied tech comfort levels, need user-friendly AI planner"] },
          psychographics: { icon: <Brain />, label: "Psychographics", items: ["Motivated by recent health scares or general well-being desire", "May feel intimidated by complex routines, appreciate simple AI guidance", "Value simplicity and clear, step-by-step instructions from the planner"] },
          behaviors: { icon: <ShoppingBag />, label: "Behaviors", items: ["Searching for beginner-friendly AI fitness programs", "Responsive to supportive & non-judgmental app communities", "Prefer at-home options for their AI workouts initially"] },
          needs_pain_points: { icon: <Activity />, label: "Needs & Pain Points", items: ["Need: Simple instructions from AI, foundational knowledge, positive reinforcement and progress tracking", "Pain: Feeling overwhelmed, fear of injury or doing exercises incorrectly, past failures with diet/exercise apps"] }
        },
        growthPotential: "High",
        motivation: "Improve overall health, gain confidence, establish sustainable healthy habits with their AI Fitness Planner.",
        marketing_channels: ["Facebook groups for healthy living (ads for AI planner)", "Primary care physician referrals (partnerships)", "Beginner-friendly wellness content featuring the app"]
      },
       {
        name: "Weight Management Seekers (All Ages)",
        description: "Users primarily focused on losing or managing weight with the help of an AI Fitness Planner, often having tried various diets and exercise programs.",
        percentage: 10,
        characteristics: {
          demographics: { icon: <Users2 />, label: "Demographics", items: ["Broad age range", "Varying income levels for app subscriptions", "Often have specific health concerns related to weight management"] },
          psychographics: { icon: <Brain />, label: "Psychographics", items: ["Highly motivated by visible results from AI planner", "May be susceptible to fad diets if AI guidance isn\'t clear", "Seek solutions that are easy to follow and show quick, sustainable wins"] },
          behaviors: { icon: <ShoppingBag />, label: "Behaviors", items: ["Actively research AI weight loss solutions", "Track weight and measurements frequently with app integration", "May have history of yo-yo dieting, looking for a sustainable AI partner"] },
          needs_pain_points: { icon: <Activity />, label: "Needs & Pain Points", items: ["Need: Clear path to weight loss via AI, support for emotional eating, strategies for long-term maintenance", "Pain: Frustration from past failures, slow progress, restrictive diets difficult to maintain without adaptive AI"] }
        },
        growthPotential: "Medium",
        motivation: "Achieve a target weight, improve health markers, boost self-esteem with their AI Fitness Planner.",
        marketing_channels: ["Weight loss support forums mentioning AI tools", "Health & wellness magazines (digital) featuring app reviews", "Partnerships with weight loss clinics or nutritionists recommending the AI planner"]
      }
    ],
    excludedSegments: [
      { name: "Extreme Athletes/Pro Bodybuilders", reason: "Require highly specialized, often medically supervised, plans beyond typical AI app capabilities." },
      { name: "Individuals with Severe Eating Disorders", reason: "Require professional medical and psychological intervention, not an AI app-based solution primarily." }
    ],
    segment_analysis: { confidence_score: 7 }
  };

  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#6366f1'];
  const pieData = mockSegmentationData.primarySegments.map((segment, index) => ({
    name: segment.name,
    value: segment.percentage,
    color: colors[index % colors.length]
  }));

  const selectedSegmentData = mockSegmentationData.primarySegments[selectedSegmentIdx];

  const growthPotentialColor = (potential: string | undefined) => {
    switch (potential) {
      case 'High': return 'growth-high';
      case 'Medium': return 'growth-medium';
      case 'Low': return 'growth-low';
      default: return 'growth-unknown';
    }
  };

  const handleLegendClick = (data: CustomLegendPayload | undefined) => {
    if (data && typeof data.value === 'string') {
      const index = mockSegmentationData.primarySegments.findIndex(seg => seg.name === data.value);
      if (index !== -1) {
        setSelectedSegmentIdx(index);
      }
    }
  };

  return (
    <div className="segmentation-view">
      <div className="section-header">
        <h1 className="section-title">Customer Segmentation: {mockBusinessIdeaName}</h1>
        <p className="section-subtitle">Analysis of key customer segments for "{mockBusinessIdeaDescription}"</p>
      </div>

      <div className="section-card">
        <div className="card-header">
          <div className="header-content">
            <div className="icon-container purple"><Users className="icon" /></div>
            <div><h3 className="card-title">Segment Distribution</h3><p className="card-subtitle">{mockSegmentationData.primarySegments.length} primary segments identified</p></div>
          </div>
        </div>
        <div className="card-divider">
          <div className="segment-grid">
            <div className="pie-chart-container">
              <div className="pie-chart">
                {pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart margin={{ top: 20, right: 20, bottom: 40, left: 20 }}>
                      <Pie 
                        data={pieData} 
                        cx="50%" 
                        cy="45%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={2} 
                        dataKey="value" 
                        nameKey="name" 
                        stroke="var(--card-bg)" 
                        strokeWidth={2}
                      >
                        {pieData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} onClick={() => setSelectedSegmentIdx(index)} style={{ cursor: 'pointer'}} className={selectedSegmentIdx === index ? 'pie-cell-selected' : ''} />))}
                      </Pie>
                      <Tooltip formatter={(value: number, name: string) => [`${value}%`, name]} contentStyle={{ borderRadius: '6px' }} />
                      <Legend 
                        onClick={handleLegendClick as any} 
                        wrapperStyle={{ cursor: 'pointer', paddingTop: '10px', paddingBottom: '10px', width: '100%' }} 
                        verticalAlign="bottom" 
                        align="center" 
                        layout="horizontal"
                        iconSize={10}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : <EmptyState title="No Segments" message="Segmentation data not available."/>}
              </div>
            </div>
            <div className="segments-list">
              <div className="segments-list-inner">
                {mockSegmentationData.primarySegments.map((segment, index) => (
                  <div key={index} className={`segment-item ${selectedSegmentIdx === index ? 'segment-selected' : ''}`} onClick={() => setSelectedSegmentIdx(index)}>
                    <div className="segment-header">
                      <div className="segment-title">
                        <div className="segment-color-dot" style={{ backgroundColor: colors[index % colors.length] }}></div>
                        <h4 className="segment-name">{segment.name}</h4>
                      </div>
                      <div className="segment-stats">
                        <span className={`growth-indicator ${growthPotentialColor(segment.growthPotential)}`}>{segment.growthPotential} Growth</span>
                        <span className="percentage-badge">{segment.percentage}%</span>
                      </div>
                    </div>
                    <p className="segment-description-brief">{segment.description.substring(0,100)}...</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {selectedSegmentData && (
        <div className="section-card segment-detail-card">
          <div className="card-header">
            <div className="header-content">
              <div className="segment-color-dot large" style={{ backgroundColor: colors[selectedSegmentIdx % colors.length] }}></div>
              <h3 className="card-title">{selectedSegmentData.name}</h3>
            </div>
            <div className="segment-badges">
              <span className="percentage-badge">{selectedSegmentData.percentage}% of Market</span>
              <span className={`growth-indicator ${growthPotentialColor(selectedSegmentData.growthPotential)}`}>{selectedSegmentData.growthPotential} Growth</span>
            </div>
          </div>
          <div className="card-content">
            <p className="segment-full-description">{selectedSegmentData.description}</p>
            <div className="characteristics-grid">
              {Object.values(selectedSegmentData.characteristics).map(charItem => (
                <div key={charItem.label} className="characteristic-box">
                  <h4 className="characteristic-title">{charItem.icon} {charItem.label}</h4>
                  <ul className="characteristic-list">
                    {charItem.items.map((item, i) => (<li key={i} className="characteristic-item"><span className="bullet purple"></span>{item}</li>))}
                  </ul>
                </div>
              ))}
            </div>
            {selectedSegmentData.motivation && <div className="segment-extra-info"><h4>Key Motivations:</h4><p>{selectedSegmentData.motivation}</p></div>}
            {selectedSegmentData.marketing_channels && <div className="segment-extra-info"><h4>Effective Marketing Channels:</h4><ul>{selectedSegmentData.marketing_channels.map((ch,i)=><li key={i}>{ch}</li>)}</ul></div>}
          </div>
        </div>
      )}

      {mockSegmentationData.excludedSegments && mockSegmentationData.excludedSegments.length > 0 && (
        <div className="section-card">
          <div className="card-header clickable" onClick={() => toggleSection('excluded')}>
            <div className="header-content">
              <div className="icon-container red"><UserMinus className="icon" /></div>
              <div><h3 className="card-title">Excluded Segments</h3><p className="card-subtitle">Market segments identified as not a primary focus</p></div>
            </div>
            <div className="toggle-icon">{expandedSections.excluded ? <ChevronUp className="icon" /> : <ChevronDown className="icon" />}</div>
          </div>
          {expandedSections.excluded && (
            <div className="card-content">
              <div className="excluded-segments">
                {mockSegmentationData.excludedSegments.map((segment, index) => (
                  <div key={index} className="excluded-segment">
                    <h4 className="excluded-segment-title">{segment.name}</h4>
                    <p className="excluded-segment-reason">Reason: {segment.reason}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      {/* ... (Targeting Recommendations and Methodology cards can be added similarly if needed) ... */}
    </div>
  );
};

export default SegmentationSectionMock; 