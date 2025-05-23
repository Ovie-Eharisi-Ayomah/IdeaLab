import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import DashboardNavigation from './DashboardNavigation';
import ProblemValidationSection from './sections/ProblemValidationSection';
import MarketSizingSection from './sections/MarketSizingSection';
import CompetitionSection from './sections/CompetitionSection';
import SegmentationSection from './sections/SegmentationSection';
import './IdeaLabDashboard.css';

interface AnalysisData {
  businessIdea: string;
  problemStatement: string;
  industry: string;
  productType: string;
  analysisDate: string;
  score: number;
}

const IdeaLabDashboard: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const [currentSection, setCurrentSection] = useState('summary');
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalysisData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:5003/api/jobs/${jobId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch analysis data');
        }

        const data = await response.json();
        
        // Transform the data to match our AnalysisData interface
        setAnalysisData({
          businessIdea: data.input.businessIdea,
          problemStatement: data.input.problemStatement,
          industry: data.results.classification?.primaryIndustry || '',
          productType: data.results.classification?.productType || '',
          analysisDate: new Date(data.createdAt).toISOString(),
          score: data.results.problemValidation?.problem_validation?.validation_score || 0
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (jobId) {
      fetchAnalysisData();
    }
  }, [jobId]);

  const handleSectionChange = (section: string) => {
    setCurrentSection(section);
  };

  if (loading) {
    return <div className="loading">Loading analysis data...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  if (!analysisData) {
    return <div className="error">No analysis data available</div>;
  }

  return (
    <div className="dashboard">
      <DashboardNavigation 
        currentSection={currentSection}
        onSectionChange={handleSectionChange}
        analysisDate={analysisData.analysisDate}
      />
      <div className="dashboard-content">
        <div className="dashboard-topbar">
          <div className="dashboard-topbar-content">
            <div>
              <h2 className="dashboard-title">{analysisData.businessIdea}</h2>
              <p className="dashboard-date">
                Analysis completed on {new Date(analysisData.analysisDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
            <div className="score-circle">
              <span className="score-value">{analysisData.score}</span>
              <span className="score-label">Validation Score</span>
            </div>
          </div>
        </div>

        <div className="dashboard-sections">
          {currentSection === 'problem' && (
            <ProblemValidationSection
              businessIdea={analysisData.businessIdea}
              problemStatement={analysisData.problemStatement}
              industry={analysisData.industry}
            />
          )}
          {currentSection === 'market' && (
            <MarketSizingSection
              businessIdea={analysisData.businessIdea}
              industry={analysisData.industry}
              productType={analysisData.productType}
            />
          )}
          {currentSection === 'competition' && (
            <CompetitionSection
              businessIdea={analysisData.businessIdea}
              industry={analysisData.industry}
              productType={analysisData.productType}
            />
          )}
          {currentSection === 'segmentation' && (
            <SegmentationSection
              businessIdea={analysisData.businessIdea}
              industry={analysisData.industry}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default IdeaLabDashboard; 