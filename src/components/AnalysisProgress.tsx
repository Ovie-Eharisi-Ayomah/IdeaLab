import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  Users, 
  Target, 
  BarChart2, 
  TrendingUp,
  CheckCircle,
  Clock,
  Loader2,
  ArrowLeft
} from 'lucide-react';
import './AnalysisProgress.css';

interface AnalysisProgressProps {
  job: {
    id: string;
    status: string;
    input: {
      businessIdea: string;
    };
    progress: Record<string, string>;
    results: Record<string, any>;
  };
}

const AnalysisProgress: React.FC<AnalysisProgressProps> = ({ job }) => {
  const steps = [
    { 
      key: 'classification', 
      label: 'Identifying Industry', 
      icon: FileText,
      description: 'Analyzing your business idea to determine industry and product type'
    },
    { 
      key: 'segmentation', 
      label: 'Finding Customer Segments', 
      icon: Users,
      description: 'Identifying target customer groups and their characteristics'
    },
    { 
      key: 'marketSizing', 
      label: 'Calculating Market Size', 
      icon: TrendingUp,
      description: 'Researching TAM, SAM, and SOM for your business'
    },
    { 
      key: 'problemValidation', 
      label: 'Validating Problem', 
      icon: Target,
      description: 'Confirming the problem exists and people will pay to solve it'
    },
    { 
      key: 'competition', 
      label: 'Analyzing Competition', 
      icon: BarChart2,
      description: 'Identifying competitors and market positioning opportunities'
    }
  ];

  const getStepStatus = (status: string) => {
    switch (status) {
      case 'complete':
        return { icon: CheckCircle, color: 'green', text: 'Complete' };
      case 'in_progress':
        return { icon: Loader2, color: 'blue', text: 'Processing...' };
      default:
        return { icon: Clock, color: 'gray', text: 'Pending' };
    }
  };

  const completedSteps = Object.values(job.progress).filter(status => status === 'complete').length;
  const progressPercentage = (completedSteps / steps.length) * 100;

  return (
    <div className="analysis-progress-container">
      <Link to="/" className="back-button">
        <ArrowLeft size={20} />
        <span>Back to form</span>
      </Link>

      <div className="progress-card">
        <div className="progress-header">
          <h2>Analyzing Your Business Idea</h2>
          <p className="idea-text">{job.input.businessIdea.substring(0, 100)}...</p>
          
          <div className="overall-progress">
            <div className="progress-stats">
              <span>{completedSteps} of {steps.length} analyses complete</span>
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

        <div className="progress-steps">
          {steps.map((step) => {
            const status = getStepStatus(job.progress[step.key]);
            const Icon = step.icon;
            const StatusIcon = status.icon;
            const hasResult = job.results && job.results[step.key];

            return (
              <div key={step.key} className={`progress-step ${status.text.toLowerCase().replace('...', '')}`}>
                <div className="step-icon-container">
                  <Icon className="step-icon" />
                </div>
                
                <div className="step-content">
                  <div className="step-header">
                    <h3>{step.label}</h3>
                    <div className={`step-status ${status.color}`}>
                      <StatusIcon 
                        className={status.text === 'Processing...' ? 'spinner' : ''} 
                        size={16}
                      />
                      <span>{status.text}</span>
                    </div>
                  </div>
                  
                  <p className="step-description">{step.description}</p>
                  
                  {hasResult && (
                    <div className="step-preview">
                      {renderPreview(step.key, job.results[step.key])}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="progress-info">
          <h3>Business Idea Analysis in Progress</h3>
          <p>
            Your comprehensive business analysis is being generated. This typically takes up to 10 minutes.
          </p>
        </div>
      </div>
    </div>
  );
};

// Helper function to show preview of completed analyses
function renderPreview(type: string, data: any) {
  switch (type) {
    case 'classification':
      return (
        <div className="preview-box">
          <p><strong>Industry:</strong> {data.primaryIndustry || 'Unknown'}</p>
          <p><strong>Product Type:</strong> {data.productType || 'Unknown'}</p>
        </div>
      );
    case 'segmentation':
      return (
        <div className="preview-box">
          <p><strong>Segments Found:</strong> {data.primarySegments?.length || 0}</p>
          <p><strong>Primary Segment:</strong> {data.primarySegments?.[0]?.name || 'General Market'}</p>
        </div>
      );
    case 'marketSizing':
      return (
        <div className="preview-box">
          <p><strong>Market Size:</strong> {data.totalAddressableMarket ? `$${(data.totalAddressableMarket / 1000000000).toFixed(1)}B` : 'Calculating...'}</p>
          <p><strong>Growth Rate:</strong> {data.cagr ? `${data.cagr}%` : 'Unknown'}</p>
        </div>
      );
    case 'problemValidation':
      return (
        <div className="preview-box">
          <p><strong>Problem Severity:</strong> {data.severity ? `${data.severity}/10` : 'Analyzing...'}</p>
          <p><strong>Willingness to Pay:</strong> {data.willingnessToPay || 'Unknown'}</p>
        </div>
      );
    case 'competition':
      return (
        <div className="preview-box">
          <p><strong>Competitors Found:</strong> {data.competitors?.length || 0}</p>
          <p><strong>Market Gap:</strong> {data.marketGap || 'Analyzing...'}</p>
        </div>
      );
    default:
      return null;
  }
}

export default AnalysisProgress; 