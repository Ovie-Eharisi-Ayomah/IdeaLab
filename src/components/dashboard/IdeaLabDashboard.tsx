import React, { useState } from 'react';
import DashboardNavigation from './DashboardNavigation';
import ProblemValidationSection from './sections/ProblemValidationSection';
import MarketSizingSection from './sections/MarketSizingSection';
import CompetitionSection from './sections/CompetitionSection';
import SegmentationSection from './sections/SegmentationSection';
import RecommendationSection from './sections/RecommendationSection';
import SummarySection from './sections/SummarySection';
import { AnalysisResult } from '../../utils/dataTransformers';
import './IdeaLabDashboard.css';

interface IdeaLabDashboardProps {
  analysisResult: AnalysisResult;
}

const IdeaLabDashboard: React.FC<IdeaLabDashboardProps> = ({ analysisResult }) => {
  const [currentSection, setCurrentSection] = useState('summary');

  const handleSectionChange = (section: string) => {
    setCurrentSection(section);
  };

  return (
    <div className="dashboard">
      <DashboardNavigation 
        currentSection={currentSection}
        onSectionChange={handleSectionChange}
        analysisDate={analysisResult.analysisDate}
      />
      <div className="dashboard-content">
        <div className="dashboard-topbar">
          <div className="dashboard-topbar-content">
            <div>
              <h2 className="dashboard-title">{analysisResult.businessIdea}</h2>
              <p className="dashboard-date">
                Analysis completed on {new Date(analysisResult.analysisDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
            <div className="score-circle">
              <span className="score-value">{analysisResult.score}</span>
              <span className="score-label">Validation Score</span>
            </div>
          </div>
        </div>

        <div className="dashboard-sections">
          {currentSection === 'summary' && (
            <SummarySection
              businessIdea={analysisResult.businessIdea}
              analysisDate={analysisResult.analysisDate}
              score={analysisResult.score}
              primaryIndustry={analysisResult.primaryIndustry}
              secondaryIndustry={analysisResult.secondaryIndustry}
              productType={analysisResult.productType}
              targetAudience={analysisResult.targetAudience}
              insights={analysisResult.insights}
              recommendations={analysisResult.recommendations}
              recommendationData={analysisResult.recommendationData}
              onNavigate={handleSectionChange}
            />
          )}
          {currentSection === 'recommendation' && (
            <RecommendationSection 
              recommendationData={analysisResult.recommendationData}
            />
          )}
          {currentSection === 'problem' && (
            <ProblemValidationSection
              businessIdea={analysisResult.businessIdea}
              problemStatement={analysisResult.problemData?.problem_statement || ''}
              industry={analysisResult.primaryIndustry}
              problemData={analysisResult.problemData}
            />
          )}
          {currentSection === 'market' && (
            <MarketSizingSection
              businessIdea={analysisResult.businessIdea}
              industry={analysisResult.primaryIndustry}
              productType={analysisResult.productType}
              marketData={analysisResult.marketData}
              hasError={analysisResult.marketData?.hasError}
              errorMessage={analysisResult.marketData?.errorMessage}
              calculationSource={analysisResult.marketData?.calculationSource}
            />
          )}
          {currentSection === 'competition' && (
            <CompetitionSection
              businessIdea={analysisResult.businessIdea}
              industry={analysisResult.primaryIndustry}
              productType={analysisResult.productType}
              competitionData={analysisResult.competitionData}
            />
          )}
          {currentSection === 'segmentation' && (
            <SegmentationSection
              businessIdea={analysisResult.businessIdea}
              industry={analysisResult.primaryIndustry}
              segmentationData={analysisResult.segmentationData}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default IdeaLabDashboard; 