import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { IdeaLabDashboard } from '../components/dashboard';
import AnalysisProgress from '../components/AnalysisProgress';
import './AnalysisResultsPage.css';
import { transformJobToAnalysisResult } from '../utils/dataTransformers';

// API URL with env variable support
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002/api';

// Keep JobData interface as it's specific to this page
interface JobData {
  id: string;
  status: 'processing' | 'complete' | 'failed';
  createdAt: string;
  input: { 
    businessIdea: string;
    problemStatement?: string;
  };
  progress: Record<string, string>;
  results: {
    classification?: {
      primaryIndustry?: string;
      secondaryIndustry?: string;
      productType?: string;
    };
    segmentation?: {
      primarySegments?: Array<{
        name: string;
        size: number;
        description: string;
      }>;
      summary?: string;
    };
    marketSize?: {
      totalAddressableMarket?: number;
      serviceableAvailableMarket?: number;
      serviceableObtainableMarket?: number;
      cagr?: number;
      summary?: string;
    };
    problemValidation?: {
      severity?: number;
      willingnessToPay?: string;
      summary?: string;
    };
    competition?: {
      competitors?: Array<{
        name: string;
        marketShare?: number;
        strengths?: string[];
        weaknesses?: string[];
      }>;
      marketGap?: string;
      summary?: string;
    };
    marketData?: any; // Added for market sizing data
    competitionData?: any; // Added for competition data
    problemData?: any; // Added for problem data
    segmentationData?: any; // Added for segmentation data
  };
  error: string | null;
}

// Remove the local AnalysisResult interface - it's now imported via the transformer
/*
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
*/

const AnalysisResultsPage: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const [job, setJob] = useState<JobData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!jobId) return;

    let isCancelled = false;
    let intervalId: number | undefined;

    const fetchJob = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/jobs/${jobId}`);
        
        if (isCancelled) return;
        
        if (!response.ok) {
          throw new Error(`Failed to fetch job status: ${response.statusText}`);
        }
        
        const data = await response.json();

        if (isCancelled) return;

        // Add this line to see what's coming back
        console.log('Raw job data:', JSON.stringify(data, null, 2));
        
        // Ensure the response data matches our JobData interface
        const normalizedJobData: JobData = {
          id: data.id || jobId,
          status: data.status || 'processing',
          createdAt: data.createdAt || new Date().toISOString(),
          input: data.input || { businessIdea: 'Loading business idea...' },
          progress: data.progress || {
            classification: 'pending',
            segmentation: 'pending',
            marketSizing: 'pending',
            problemValidation: 'pending',
            competition: 'pending'
          },
          results: data.results || {},
          error: data.error || null
        };
        
        setJob(normalizedJobData);
        
        if (normalizedJobData.status === 'failed') {
          setError(normalizedJobData.error || 'Analysis failed');
          clearInterval(intervalId);
        } else if (normalizedJobData.status === 'complete') {
          setError(null);
          clearInterval(intervalId);
        } else {
          setError(null);
        }
      } catch (err) {
        if (isCancelled) return;
        console.error('Error fetching job:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        clearInterval(intervalId);
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    // Initial fetch
    fetchJob();

    // Poll every 2 seconds if still processing
    intervalId = window.setInterval(() => {
      if (job?.status !== 'processing') {
        clearInterval(intervalId);
      } else {
        fetchJob();
      }
    }, 2000);

    return () => {
      isCancelled = true;
      clearInterval(intervalId);
    };
  }, [jobId, job?.status]);

  // Back button component
  const BackButton = () => (
    <Link to="/" className="back-button">
      <ArrowLeft size={20} />
      <span>Back to form</span>
    </Link>
  );

  if (loading && !job) {
    return (
      <div className="results-container">
        <BackButton />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading analysis...</p>
        </div>
      </div>
    );
  }

  if (error && (!job || job.status === 'failed')) {
    return (
      <div className="results-container">
        <BackButton />
        <div className="error-container">
          <h2>Analysis Error</h2>
          <p>{error}</p>
          <p>Please try again or contact support if this issue persists.</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="results-container">
        <BackButton />
        <div className="error-container">
          <h2>Job Not Found</h2>
          <p>The requested analysis job could not be found.</p>
        </div>
      </div>
    );
  }

  if (job.status === 'processing') {
    return <AnalysisProgress job={job} />;
  }

  if (job.status === 'complete') {
    // Transform job results using the imported transformer
    const transformedData = transformJobToAnalysisResult(job);
    return <IdeaLabDashboard analysisResult={transformedData} />;
  }

  return (
    <div className="results-container">
      <BackButton />
      <div className="error-container">
        <h2>Unknown Status</h2>
        <p>Job status: {job.status}</p>
        <p>Please try again later.</p>
      </div>
    </div>
  );
};

export default AnalysisResultsPage; 