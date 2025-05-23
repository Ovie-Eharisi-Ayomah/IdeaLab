import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Lightbulb, 
  ArrowRight, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  AlertCircle, 
  Loader2,
  CheckCircle,
  Sparkles
} from 'lucide-react';
import './BusinessIdeaForm.css';

// --- Constants ---
const MIN_IDEA_LENGTH = 20;
const MIN_WORD_COUNT = 20; // Target word count for better analysis

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

// --- Industry and Region Options ---
const industryOptions = [
  "Technology", "Healthcare", "Finance", "Education", "E-commerce",
  "Entertainment", "Food & Beverage", "Travel", "Real Estate", "Transportation",
  "Manufacturing", "Energy", "Agriculture", "Other"
];

const geoFocusOptions = [
  "Global", "North America", "Europe", "Asia-Pacific",
  "Latin America", "Middle East & Africa", "Specific Country/Region", "Local"
];

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
  const [industry, setIndustry] = useState<string>('');
  const [geoFocus, setGeoFocus] = useState<string>('');

  const [wordCount, setWordCount] = useState<number>(0);
  const [formErrors, setFormErrors] = useState<{ businessIdea?: string }>({});

  const [isTipsExpanded, setIsTipsExpanded] = useState<boolean>(false);
  const [isAdvancedExpanded, setIsAdvancedExpanded] = useState<boolean>(false);

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
      case 'industry':
        setIndustry(value);
        break;
      case 'geoFocus':
        setGeoFocus(value);
        break;
    }
  };

  const validateForm = (): boolean => {
    const errors: { businessIdea?: string } = {};
    if (businessIdea.trim().length < MIN_IDEA_LENGTH) {
      errors.businessIdea = `Please provide more details about your idea (minimum ${MIN_IDEA_LENGTH} characters).`;
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
      problemStatement: problemStatement || undefined,
      industry: industry || undefined, 
      geoFocus: geoFocus || 'global' 
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
    // --- END OF RESTORED REAL API CALL LOGIC ---

    /* PREVIOUS MOCK DEMO LOGIC - NOW COMMENTED OUT
    console.log("Mock Demo: Bypassing API call, navigating to mock results.");
    setSubmitSuccess(true); // Show success message
    
    setTimeout(() => {
      navigate(`/results/mock-demo-flow`); 
      setIsLoading(false); 
    }, 1000); 
    */
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
  const isSubmitDisabled = isLoading || businessIdea.length < MIN_IDEA_LENGTH;

  return (
    <div className="form-container">
      <div className="card">
        <div className="card-body">
          <h2 className="heading">
            Tell us about your business idea
          </h2>
          <p className="subheading">
            Describe your idea in detail. The more specific you are, the better our analysis will be.
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

              {/* Advanced Options Toggle */}
              <div className="advanced-toggle">
                <button
                  type="button"
                  className="toggle-button"
                  onClick={() => setIsAdvancedExpanded(!isAdvancedExpanded)}
                  aria-expanded={isAdvancedExpanded}
                >
                  Advanced options {isAdvancedExpanded 
                    ? <ChevronUp className="ml-1 h-4 w-4" /> 
                    : <ChevronDown className="ml-1 h-4 w-4" />}
                </button>
              </div>

              {/* Advanced Options Content */}
              {isAdvancedExpanded && (
                <div className="space-y">
                  {/* Problem Statement */}
                  <div className="form-section">
                    <label htmlFor="problemStatement" className="form-label">
                      Problem Statement (Optional)
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
                        value={problemStatement}
                        onChange={handleInputChange}
                        placeholder="Example: Pet owners struggle to find trustworthy, affordable pet sitters on short notice, especially for last-minute trips."
                        className="form-textarea"
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
                    {problemGenError && (
                      <p className="error-message">
                        <AlertCircle size={14} className="mr-1" /> {problemGenError}
                      </p>
                    )}
                  </div>

                  {/* Industry Selection */}
                  <div className="form-section">
                    <label htmlFor="industry" className="form-label">
                      Industry (Optional)
                    </label>
                    <div className="form-input-container">
                      <select
                        id="industry"
                        name="industry"
                        value={industry}
                        onChange={handleInputChange}
                        className="form-select"
                      >
                        <option value="">Select an industry (or let us detect it)</option>
                        {industryOptions.map(opt => 
                          <option key={opt} value={opt}>{opt}</option>
                        )}
                      </select>
                    </div>
                    <p className="helper-text">
                      Don't worry if you're not sure - our AI can detect the industry from your description.
                    </p>
                  </div>
                  
                  {/* Geographic Focus */}
                  <div className="form-section">
                    <label htmlFor="geoFocus" className="form-label">
                      Geographic Focus (Optional)
                      <button
                        type="button"
                        className="help-icon"
                        title="This dramatically improves market size accuracy and competition analysis"
                      >
                        <HelpCircle className="h-4 w-4" />
                      </button>
                    </label>
                    <div className="form-input-container">
                      <select
                        id="geoFocus"
                        name="geoFocus"
                        value={geoFocus}
                        onChange={handleInputChange}
                        className="form-select"
                      >
                        <option value="">Select focus (default: Global)</option>
                        {geoFocusOptions.map(opt => 
                          <option key={opt} value={opt.toLowerCase().replace(/\s+/g, '-')}>{opt}</option>
                        )}
                      </select>
                    </div>
                    <p className="helper-text">
                      Specifying your target region drastically improves TAM/SAM calculations and competitive analysis.
                    </p>
                  </div>
                </div>
              )}

              {/* Note about analysis time */}
              <div className="alert alert-warning">
                <AlertCircle className="h-5 w-5" />
                <div>
                  <p>The analysis typically takes 2-3 minutes to complete. We'll analyze market size, competitive landscape, customer segments, and problem validation.</p>
                </div>
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
