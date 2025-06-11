import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  AlertCircle, 
  Loader2,
  CheckCircle,
  Sparkles,
  Clock
} from 'lucide-react';
import './BusinessIdeaForm.css';

// --- Constants ---
const MIN_IDEA_LENGTH = 20;
const MIN_WORD_COUNT = 20; // Target word count for better analysis
const MIN_PROBLEM_LENGTH = 10; // Minimum length for problem statement

// API URL with env variable support
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002/api';

// --- Component Type Definitions ---
type ApiSuccessResponse = {
  ok: true;
  data: { jobId: string };
};

type ApiErrorResponse = {
  ok: false;
  error: string;
};

type ApiResponse = ApiSuccessResponse | ApiErrorResponse;

// --- Helper function for word count ---
const countWords = (text: string): number => {
  return text.trim().split(/\s+/).filter(Boolean).length;
};

// --- Component ---
const BusinessIdeaForm: React.FC = () => {
  const navigate = useNavigate();
  
  // --- State ---
  const [businessIdea, setBusinessIdea] = useState<string>('');
  const [problemStatement, setProblemStatement] = useState<string>('');

  const [wordCount, setWordCount] = useState<number>(0);
  const [formErrors, setFormErrors] = useState<{ businessIdea?: string; problemStatement?: string }>({});

  const [isTipsExpanded, setIsTipsExpanded] = useState<boolean>(false);
  const [isDeliverablesExpanded, setIsDeliverablesExpanded] = useState<boolean>(false);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isGeneratingProblem, setIsGeneratingProblem] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [problemGenError, setProblemGenError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);

  // --- Effects ---
  // Calculate word count on businessIdea change
  useEffect(() => {
    setWordCount(countWords(businessIdea));
    
    // Validate minimum length on change
    if (businessIdea.length > 0 && businessIdea.length < MIN_IDEA_LENGTH) {
      setFormErrors(prev => ({ ...prev, businessIdea: `Please provide more details (minimum ${MIN_IDEA_LENGTH} characters).` }));
    } else {
      setFormErrors(prev => {
        const { businessIdea: _, ...rest } = prev; // Remove businessIdea error
        return rest;
      });
    }
  }, [businessIdea]);

  // Validate problem statement on change
  useEffect(() => {
    if (problemStatement.length > 0 && problemStatement.length < MIN_PROBLEM_LENGTH) {
      setFormErrors(prev => ({ ...prev, problemStatement: `Please provide more details (minimum ${MIN_PROBLEM_LENGTH} characters).` }));
    } else {
      setFormErrors(prev => {
        const { problemStatement: _, ...rest } = prev; // Remove problemStatement error
        return rest;
      });
    }
  }, [problemStatement]);

  // --- Handlers ---
  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    switch (name) {
      case 'businessIdea':
        setBusinessIdea(value);
        break;
      case 'problemStatement':
        setProblemStatement(value);
        break;
    }
  };

  const validateForm = (): boolean => {
    const errors: { businessIdea?: string; problemStatement?: string } = {};
    
    if (businessIdea.trim().length < MIN_IDEA_LENGTH) {
      errors.businessIdea = `Please provide more details about your idea (minimum ${MIN_IDEA_LENGTH} characters).`;
    }
    
    if (problemStatement.trim().length < MIN_PROBLEM_LENGTH) {
      errors.problemStatement = `Please describe the problem your idea solves (minimum ${MIN_PROBLEM_LENGTH} characters).`;
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setApiError(null); 
    setSubmitSuccess(false);

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    // --- RESTORING REAL API CALL LOGIC ---
    const formData = {
      businessIdea,
      problemStatement
    };

    try {
      console.log("Submitting to:", `${API_BASE_URL}/analyze`);
      const response = await fetch(`${API_BASE_URL}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `HTTP error ${response.status}` })); // Try to parse error, fallback
        throw new Error(errorData.error || `Failed to submit: ${response.statusText}`);
      }

      const { jobId } = await response.json();
      setSubmitSuccess(true);
      console.log("Submission successful, Job ID:", jobId);
      
      // Navigate to results page after short delay
      setTimeout(() => {
        navigate(`/results/${jobId}`);
      }, 500);

    } catch (err) {
      console.error("Submission failed:", err);
      setApiError(err instanceof Error ? err.message : 'Failed to submit analysis');
    } finally {
      setIsLoading(false);
    }
  };

  // Generate Problem Statement from Business Idea
  const handleGenerateProblem = async () => {
    // Validate business idea
    if (businessIdea.trim().length < MIN_IDEA_LENGTH) {
      setFormErrors(prev => ({ 
        ...prev, 
        businessIdea: `Please provide more details about your idea (minimum ${MIN_IDEA_LENGTH} characters).` 
      }));
      return;
    }

    try {
      setProblemGenError(null);
      setIsGeneratingProblem(true);

      const response = await fetch(`${API_BASE_URL}/generate-problem`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ businessIdea }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate problem statement');
      }

      const data = await response.json();
      setProblemStatement(data.problemStatement);
    } catch (error) {
      console.error('Error generating problem statement:', error);
      setProblemGenError(error instanceof Error ? error.message : 'Failed to generate problem statement');
    } finally {
      setIsGeneratingProblem(false);
    }
  };

  // --- Render ---
  const isSubmitDisabled = isLoading || businessIdea.length < MIN_IDEA_LENGTH || problemStatement.length < MIN_PROBLEM_LENGTH;

  return (
    <div className="form-container">
      <div className="card">
        <div className="card-body">
          <h2 className="heading">
            Tell us about your business idea
          </h2>
          <p className="subheading">
            Describe your idea and the problem it solves. The more specific you are, the better our analysis will be.
          </p>

          <form onSubmit={handleSubmit} noValidate>
            <div className="space-y">
              {/* Business Idea Input */}
              <div className="form-section">
                <label htmlFor="businessIdea" className="form-label">
                  Business Idea <span className="form-label-required">*</span>
                </label>
                <div className="form-input-container">
                  <textarea
                    id="businessIdea"
                    name="businessIdea"
                    rows={6}
                    required
                    minLength={MIN_IDEA_LENGTH}
                    value={businessIdea}
                    onChange={handleInputChange}
                    placeholder="Example: A mobile app that connects dog owners with trusted pet sitters in their neighborhood. Users can browse sitters by availability, price, and reviews, and book/pay through the app..."
                    className={formErrors.businessIdea ? "form-textarea form-textarea-error" : "form-textarea"}
                    aria-required="true"
                    aria-describedby="idea-word-count idea-error"
                    aria-invalid={!!formErrors.businessIdea}
                  />
                </div>

                {/* Word Count and Tips Toggle */}
                <div className="input-meta">
                  <span>
                    {wordCount} words {wordCount < MIN_WORD_COUNT 
                      ? `(aim for at least ${MIN_WORD_COUNT})` 
                      : wordCount > 100 
                        ? "(excellent detail!)" 
                        : "(good)"}
                  </span>
                  <button
                    type="button"
                    className="toggle-button"
                    onClick={() => setIsTipsExpanded(!isTipsExpanded)}
                  >
                    {isTipsExpanded ? (
                      <>
                        Show fewer tips <ChevronUp className="h-3 w-3 ml-1" />
                      </>
                    ) : (
                      <>
                        Show writing tips <ChevronDown className="h-3 w-3 ml-1" />
                      </>
                    )}
                  </button>
                </div>

                {/* Form Validation Error */}
                {formErrors.businessIdea && (
                  <p className="error-message">
                    <AlertCircle size={14} className="mr-1" /> {formErrors.businessIdea}
                  </p>
                )}
                
                {/* Expanded Tips */}
                {isTipsExpanded && (
                  <div className="tips-container">
                    <h4 className="tips-heading">Tips for a better analysis:</h4>
                    <ul className="tips-list">
                      <li>Describe what problem your idea solves</li>
                      <li>Mention your target customers/users</li>
                      <li>Explain how your solution works</li>
                      <li>Include any revenue or business model details</li>
                      <li>Note any competitive advantages you think you have</li>
                    </ul>
                  </div>
                )}
              </div>

              {/* Problem Statement - Now Required */}
              <div className="form-section">
                <label htmlFor="problemStatement" className="form-label">
                  Problem Statement <span className="form-label-required">*</span>
                  <button
                    type="button"
                    className="help-icon"
                    title="What specific problem are you trying to solve?"
                  >
                    <HelpCircle className="h-4 w-4" />
                  </button>
                </label>
                <div className="form-input-container problem-statement-container">
                  <textarea
                    id="problemStatement"
                    name="problemStatement"
                    rows={3}
                    required
                    minLength={MIN_PROBLEM_LENGTH}
                    value={problemStatement}
                    onChange={handleInputChange}
                    placeholder="Example: Pet owners struggle to find trustworthy, affordable pet sitters on short notice, especially for last-minute trips."
                    className={formErrors.problemStatement ? "form-textarea form-textarea-error" : "form-textarea"}
                    aria-required="true"
                    aria-describedby="problem-error"
                    aria-invalid={!!formErrors.problemStatement}
                  />
                  <button
                    type="button"
                    onClick={handleGenerateProblem}
                    className="generate-problem-btn"
                    disabled={isGeneratingProblem || businessIdea.length < MIN_IDEA_LENGTH}
                    title="Generate a problem statement from your business idea"
                  >
                    {isGeneratingProblem ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4" />
                    )}
                    {isGeneratingProblem ? 'Generating...' : 'Generate'}
                  </button>
                </div>
                {formErrors.problemStatement && (
                  <p className="error-message">
                    <AlertCircle size={14} className="mr-1" /> {formErrors.problemStatement}
                  </p>
                )}
                {problemGenError && (
                  <p className="error-message">
                    <AlertCircle size={14} className="mr-1" /> {problemGenError}
                  </p>
                )}
              </div>

              {/* Deliverables and Timeline Dropdown */}
              <div className="form-section">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-lg font-medium text-gray-900">Analysis Overview</h4>
                  <button
                    type="button"
                    className="toggle-button"
                    onClick={() => setIsDeliverablesExpanded(!isDeliverablesExpanded)}
                  >
                    {isDeliverablesExpanded ? (
                      <>
                        Hide details <ChevronUp className="h-4 w-4 ml-1" />
                      </>
                    ) : (
                      <>
                        What you'll receive <ChevronDown className="h-4 w-4 ml-1" />
                      </>
                    )}
                  </button>
                </div>
                
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-2">
                  <div className="flex items-center text-amber-800">
                    {/* <Clock className="h-4 w-4 mr-2" /> */}
                    <span className="font-medium">Timeline: 20-30 minutes</span>
                  </div>
                  <p className="text-sm text-amber-700 mt-1">
                    Analysis runs in the background - check your dashboard for progress.
                  </p>
                </div>

                {isDeliverablesExpanded && (
                  <div className="tips-container">
                    <h5 className="tips-heading">Comprehensive Analysis Deliverables</h5>
                    
                    <ul className="tips-list">
                      <li>
                        📊 <strong>Market Size Analysis:</strong> TAM, SAM, SOM calculations with growth projections and geographic breakdown
                      </li>
                      <li>
                        🏆 <strong>Competitive Landscape:</strong> Competitor analysis, market gaps, barriers to entry, and positioning opportunities
                      </li>
                      <li>
                        🎯 <strong>Customer Segmentation:</strong> Primary target segments with characteristics, market fit, and growth potential
                      </li>
                      <li>
                        ❗ <strong>Problem Validation:</strong> Problem severity scoring, evidence analysis, and alternative solutions assessment
                      </li>
                      <li>
                        🤖 <strong>AI-Powered Recommendation:</strong> Go/No-Go decision with confidence scoring, risk assessment, and strategic next steps
                      </li>
                    </ul>
                    
                    <div className="mt-3 text-sm text-blue-600 bg-blue-50 p-2 rounded border border-blue-200">
                      <strong>💎 Professional Analysis:</strong> Each analysis is powered by AI and validated against real market data to provide actionable business insights.
                    </div>
                  </div>
                )}
              </div>

              {/* API Error Display */}
              {apiError && (
                <div className="alert alert-error" role="alert">
                  <AlertCircle size={16} />
                  <span>{apiError}</span>
                </div>
              )}

              {/* Success Message */}
              {submitSuccess && !isLoading && (
                <div className="alert alert-success" role="alert">
                  <CheckCircle size={16} />
                  <span>Analysis started successfully! Redirecting...</span>
                </div>
              )}

              {/* Submit Button */}
              <div className="button-container">
                <button
                  type="submit"
                  disabled={isSubmitDisabled}
                  className="submit-button"
                  aria-busy={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={20} className="loading-spinner" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      Analyze My Idea
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BusinessIdeaForm;
