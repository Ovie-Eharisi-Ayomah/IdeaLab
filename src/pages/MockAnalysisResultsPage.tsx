import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // useParams might not be needed if we ignore jobId for mock
import { ArrowLeft } from 'lucide-react';
import MockIdeaLabDashboard from '../components/dashboard/mock_dashboard/MockIdeaLabDashboard';
import MockAnalysisProgress from '../components/dashboard/mock_dashboard/MockAnalysisProgress';
import './AnalysisResultsPage.css'; // Can reuse styles if applicable

const MockAnalysisResultsPage: React.FC = () => {
  const [status, setStatus] = useState<'processing' | 'complete'>('processing');
  const [progress, setProgress] = useState<Record<string, string>>({
    classification: 'pending',
    segmentation: 'pending',
    problemValidation: 'pending',
    competition: 'pending',
    marketSizing: 'pending',
    finalizing: 'pending',
  });
  const [currentProgressStep, setCurrentProgressStep] = useState(0);

  // Updated mock business idea description for progress display
  const mockBusinessIdeaForProgress = "AI Fitness Planner: A mobile app using AI for personalized meal plans and adaptive at-home workouts, simplifying users' health journeys.";

  const progressSteps = [
    'classification',
    'segmentation',
    'problemValidation',
    'competition',
    'marketSizing',
    'finalizing'
  ];

  useEffect(() => {
    if (status === 'processing') {
      const totalDuration = 10000; // 10 seconds
      const stepDuration = totalDuration / progressSteps.length;

      const interval = setInterval(() => {
        setCurrentProgressStep(prevStep => {
          const nextStepIndex = prevStep + 1;
          if (nextStepIndex <= progressSteps.length) {
            setProgress(prevProgress => {
              const newProgress = { ...prevProgress };
              for (let i = 0; i < nextStepIndex; i++) {
                newProgress[progressSteps[i]] = 'complete';
              }
              if (nextStepIndex < progressSteps.length) {
                 newProgress[progressSteps[nextStepIndex]] = 'processing';
              }
              return newProgress;
            });
            return nextStepIndex;
          } else {
            clearInterval(interval);
            setStatus('complete');
            return prevStep;
          }
        });
      }, stepDuration);

      return () => clearInterval(interval);
    }
  }, [status]);

  const BackButton = () => (
    <Link to="/" className="back-button">
      <ArrowLeft size={20} />
      <span>Back to form</span>
    </Link>
  );

  const mockJobData = {
    id: "mock-job-123",
    status: status,
    input: { businessIdea: mockBusinessIdeaForProgress },
    progress: progress,
    results: {},
  };

  if (status === 'processing') {
    // We need a MockAnalysisProgress component or adapt the existing AnalysisProgress
    return <MockAnalysisProgress job={mockJobData} />;
  }

  if (status === 'complete') {
    // This will render the dashboard with all mock sections
    return <MockIdeaLabDashboard />;
  }

  return (
    <div className="results-container">
      <BackButton />
      <p>Loading mock results...</p> {/* Fallback, should not be seen if logic is correct */}
    </div>
  );
};

export default MockAnalysisResultsPage; 