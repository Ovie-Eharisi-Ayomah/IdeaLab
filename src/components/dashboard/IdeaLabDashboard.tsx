import React, { useState } from 'react';
import DashboardNavigation from './DashboardNavigation';
import SummarySection from './sections/SummarySection';
import SegmentationSection from './sections/SegmentationSection';
import ProblemSection from './sections/ProblemSection';
import CompetitionSection from './sections/CompetitionSection';
import MarketSection from './sections/MarketSection';
import ScoreCircle from './shared/ScoreCircle';
import './Dashboard.css';

// Type definitions for the analysis result data
interface AnalysisResult {
  businessIdea: string;
  analysisDate: string;
  score: number;
  primaryIndustry: string;
  secondaryIndustry: string;
  productType: string;
  targetAudience: string;
  insights: {
    segmentation: string;
    problem: string;
    competition: string;
    market: string;
  };
  recommendations: Array<{
    type: 'positive' | 'warning' | 'negative';
    title: string;
    description: string;
  }>;
}

interface IdeaLabDashboardProps {
  // You can pass real data here later, for now using mock data inside
  analysisResult?: AnalysisResult;
}

const IdeaLabDashboard: React.FC<IdeaLabDashboardProps> = ({ analysisResult }) => {
  // Current section/tab state
  const [currentSection, setCurrentSection] = useState('summary');

  // Mock data for development and demo purposes
  const mockData: AnalysisResult = {
    businessIdea: "Fitness Tracker App with AI Coach",
    analysisDate: "2025-04-24T12:00:00Z",
    score: 73,
    primaryIndustry: "Health & Fitness Technology",
    secondaryIndustry: "Wearable Technology",
    productType: "Mobile Application with Hardware",
    targetAudience: "Health-conscious adults",
    insights: {
      segmentation: "4 primary segments identified, with Fitness Enthusiasts (40%) being the largest",
      problem: "Problem validated with 8.5/10 severity score and high willingness to pay",
      competition: "5 major competitors with Fitbit (35% share) leading; key gap in AI coaching",
      market: "$160B TAM with 12.5% CAGR; $12.8B SAM and $64M addressable SOM"
    },
    recommendations: [
      {
        type: "positive",
        title: "Focus on Fitness Enthusiasts segment first",
        description: "This segment represents 40% of your market and has the highest growth potential"
      },
      {
        type: "positive",
        title: "Develop AI coaching as key differentiator",
        description: "This is an identified market gap with high willingness to pay"
      },
      {
        type: "positive",
        title: "Establish partnerships with fitness centers",
        description: "Leverage existing infrastructure for faster market penetration"
      },
      {
        type: "warning",
        title: "Watch for Apple's expansion in this space",
        description: "Their ecosystem advantage could threaten your position"
      },
      {
        type: "negative",
        title: "Avoid hardware development initially",
        description: "Focus on software and integrate with existing hardware platforms"
      }
    ]
  };

  // Use passed data or mock data
  const data = analysisResult || mockData;

  // Handle section navigation
  const handleSectionChange = (section: string) => {
    setCurrentSection(section);
  };

  return (
    <div className="dashboard">
      {/* Navigation */}
      <DashboardNavigation 
        currentSection={currentSection}
        onSectionChange={handleSectionChange}
        analysisDate={data.analysisDate}
      />
      
      {/* Main Content */}
      <div className="dashboard-content">
        {/* Top Bar */}
        <div className="dashboard-topbar">
          <div className="dashboard-topbar-content">
            <div>
              <h2 className="dashboard-title">{data.businessIdea}</h2>
              <p className="dashboard-date">
                Analysis completed on {new Date(data.analysisDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
            <ScoreCircle score={data.score} labelText="Validation Score" />
          </div>
        </div>
        
        {/* Content Area - Show the appropriate section based on currentSection */}
        <div className="dashboard-main">
          <div className="dashboard-main-content">
            <div className="dashboard-section-container">
              {currentSection === 'summary' && (
                <SummarySection 
                  businessIdea={data.businessIdea}
                  analysisDate={data.analysisDate}
                  score={data.score}
                  primaryIndustry={data.primaryIndustry}
                  secondaryIndustry={data.secondaryIndustry}
                  productType={data.productType}
                  targetAudience={data.targetAudience}
                  insights={data.insights}
                  recommendations={data.recommendations}
                  onNavigate={handleSectionChange}
                />
              )}
              
              {currentSection === 'segmentation' && (
                <SegmentationSection />
              )}
              
              {currentSection === 'problem' && (
                <ProblemSection />
              )}
              
              {currentSection === 'competition' && (
                <CompetitionSection />
              )}
              
              {currentSection === 'market' && (
                <MarketSection />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IdeaLabDashboard; 