import React, { useState } from 'react';
import DashboardNavigation from '../DashboardNavigation'; // Re-use the existing navigation
import MarketSizingSectionMock from '../mock_sections/MarketSizingSectionMock';
import CompetitionSectionMock from '../mock_sections/CompetitionSectionMock';
import ProblemSectionMock from '../mock_sections/ProblemSectionMock';
import SegmentationSectionMock from '../mock_sections/SegmentationSectionMock';
import MockSummarySection from './MockSummarySection'; // Import the new MockSummarySection
import ScoreCircle from '../shared/ScoreCircle'; // Re-use score circle
import '../Dashboard.css'; // Re-use existing dashboard styles

// Updated mock summary data to use the concise AI Fitness Planner description
const mockSummary = {
  businessIdea: "AI Fitness Planner: A mobile app using AI for personalized meal plans and adaptive at-home workouts, simplifying users' health journeys.",
  analysisDate: new Date().toISOString(),
  score: 78, // Example score
  primaryIndustry: "Health & Wellness Technology",
  secondaryIndustry: "Mobile Applications",
  productType: "AI-Powered SaaS Platform",
  targetAudience: "Health-conscious Individuals & Fitness Enthusiasts",
  insights: {
    segmentation: "Identified 4 key segments with high engagement potential for an AI Fitness Planner.",
    problem: "Strong validation for user struggles with consistent diet & fitness, solvable by an AI Fitness Planner.",
    competition: "Moderately competitive market, AI Fitness Planner has opportunities for AI differentiation.",
    market: "Large TAM for Health & Wellness Tech, AI Fitness Planners show significant growth potential."
  },
  recommendations: [
    { type: 'positive' as const, title: 'Focus on AI Personalization for AI Fitness Planner', description: 'Leverage AI to create truly adaptive meal and workout plans as a key differentiator.' },
    { type: 'positive' as const, title: 'Develop Strong Community Features in AI Fitness Planner', description: 'Build in-app communities to enhance user engagement and retention.' },
    { type: 'warning' as const, title: 'Monitor Data Privacy Regulations for AI Fitness Planner', description: 'Ensure compliance with health data privacy laws as you handle sensitive user information.' },
  ]
};

const MockIdeaLabDashboard: React.FC = () => {
  const [currentSection, setCurrentSection] = useState('summary');

  const handleSectionChange = (section: string) => {
    setCurrentSection(section);
  };

  return (
    <div className="dashboard">
      <DashboardNavigation 
        currentSection={currentSection}
        onSectionChange={handleSectionChange}
        analysisDate={mockSummary.analysisDate}
      />
      <div className="dashboard-content">
        <div className="dashboard-topbar">
          <div className="dashboard-topbar-content">
            <div>
              <h2 className="dashboard-title">{mockSummary.businessIdea}</h2>
              <p className="dashboard-date">
                Analysis completed on {new Date(mockSummary.analysisDate).toLocaleDateString('en-US', {
                  year: 'numeric', month: 'long', day: 'numeric'
                })}
              </p>
            </div>
            <ScoreCircle score={mockSummary.score} labelText="Validation Score" />
          </div>
        </div>
        <div className="dashboard-main">
          <div className="dashboard-main-content">
            <div className="dashboard-section-container">
              {currentSection === 'summary' && (
                <MockSummarySection {...mockSummary} onNavigate={handleSectionChange} />
              )}
              {currentSection === 'segmentation' && <SegmentationSectionMock />}
              {currentSection === 'problem' && <ProblemSectionMock />}
              {currentSection === 'competition' && <CompetitionSectionMock />}
              {currentSection === 'market' && <MarketSizingSectionMock />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MockIdeaLabDashboard; 