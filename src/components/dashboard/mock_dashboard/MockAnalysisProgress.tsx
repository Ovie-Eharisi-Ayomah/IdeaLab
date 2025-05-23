import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, Users, Target, BarChart2, TrendingUp, CheckCircle, Clock, Loader2, ArrowLeft, Zap
} from 'lucide-react';
import '../../../pages/AnalysisResultsPage.css'; // For general page layout, if any
import '../../AnalysisProgress.css'; // Main styles for progress page

interface MockAnalysisProgressProps {
  job: {
    id: string;
    status: string;
    input: {
      businessIdea: string;
    };
    progress: Record<string, string>; 
  };
}

// Use the same step configuration as Mock, but keys should match job.progress keys
const progressStepConfig = [
  { key: 'classification', label: 'Classification', icon: FileText, description: 'Categorizing your business idea.' },
  { key: 'segmentation', label: 'Segmentation', icon: Users, description: 'Identifying target customer groups.' },
  { key: 'problemValidation', label: 'Problem Validation', icon: Target, description: 'Assessing the problem significance.' },
  { key: 'competition', label: 'Competition Analysis', icon: BarChart2, description: 'Evaluating the competitive landscape.' },
  { key: 'marketSizing', label: 'Market Sizing', icon: TrendingUp, description: 'Estimating market potential.' },
  { key: 'finalizing', label: 'Finalizing Report', icon: Zap, description: 'Compiling your analysis results.' }, // Kept 'finalizing' from mock for 10s demo
];

const MockAnalysisProgress: React.FC<MockAnalysisProgressProps> = ({ job }) => {

  const getStepStatusInfo = (statusKey: string) => {
    const status = job.progress[statusKey];
    if (status === 'complete') return { text: 'Complete', icon: CheckCircle, color: 'green' }; // Use color names as in original
    if (status === 'processing') return { text: 'Processing...', icon: Loader2, color: 'blue' };
    if (status === 'pending') return { text: 'Pending', icon: Clock, color: 'gray' };
    return { text: 'Skipped', icon: Clock, color: 'gray' }; // Default for skipped or unknown
  };

  const completedSteps = Object.values(job.progress).filter(status => status === 'complete').length;
  // Ensure progressStepsConfig is used for denominator if it dictates UI steps
  const progressPercentage = (completedSteps / progressStepConfig.length) * 100;

  return (
    <div className="analysis-progress-container"> {/* Matches original */} 
      <Link to="/" className="back-button" /* Style from original or AnalysisResultsPage.css */ >
        <ArrowLeft size={20} />
        <span>Back to Form</span> 
      </Link>

      {/* Mimic structure of original AnalysisProgress.tsx */}
      <div className="progress-card"> 
        <div className="progress-header">
          <h2>Analyzing Your Business Idea</h2>
          <p className="idea-text">{job.input.businessIdea.substring(0, 150)}...</p>
          
          <div className="overall-progress">
            <div className="progress-stats">
              {/* Adjust text to match original if needed, or keep simpler mock version */}
              <span>{completedSteps} of {progressStepConfig.length} analyses complete</span>
              <span>{Math.round(progressPercentage)}%</span>
            </div>
            <div className="progress-bar-container">
              <div 
                className="progress-bar" 
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Use .progress-steps class for the grid/list of steps */}
        <div className="progress-steps"> 
          {progressStepConfig.map((step) => {
            const statusInfo = getStepStatusInfo(step.key);
            const Icon = step.icon;
            const StatusIcon = statusInfo.icon;

            // Use .progress-step class for individual step cards
            return (
              <div key={step.key} className={`progress-step ${statusInfo.text.toLowerCase().replace('...', '')}`}>
                <div className="step-icon-container">
                  <Icon className="step-icon" />
                </div>
                <div className="step-content">
                  <div className="step-header">
                    <h3>{step.label}</h3>
                    <div className={`step-status ${statusInfo.color}`}>
                      <StatusIcon 
                        size={16} 
                        className={statusInfo.text === 'Processing...' ? 'spinner' : ''} // Original uses 'spinner' class
                      />
                      <span>{statusInfo.text}</span>
                    </div>
                  </div>
                  <p className="step-description">{step.description}</p>
                  {/* Mock version doesn't show previews, so no renderPreview call needed */}
                </div>
              </div>
            );
          })}
        </div>

        <p className="progress-note">
          Our AI is hard at work. Please wait a few moments.
        </p>
      </div>
    </div>
  );
};

export default MockAnalysisProgress; 