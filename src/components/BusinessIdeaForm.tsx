import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { 
  Lightbulb, 
  ArrowRight, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  AlertCircle, 
  Loader2,
  CheckCircle 
} from 'lucide-react';
import './BusinessIdeaForm.css';

// --- Constants ---
const MIN_IDEA_LENGTH = 20;
const MIN_WORD_COUNT = 30; // Target word count for better analysis

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
  const [apiError, setApiError] = useState<string | null>(null);
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
    setApiError(null); // Clear previous errors
    setSubmitSuccess(false);

    if (!validateForm()) {
      return; // Stop submission if validation fails
    }

    setIsLoading(true);

    const formData = {
      businessIdea,
      problemStatement,
      industry: industry || undefined, // Only send if selected
      geoFocus: geoFocus || 'global' // Default to global if not specified
    };

    try {
      // --- Simulate API Call ---
      // Replace with your actual fetch/axios call
      console.log("Submitting:", formData);
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate network delay
      // Simulate success or error response
      const simulateSuccess = true; // Change to false to test error handling
      const response: ApiResponse = simulateSuccess
        ? { ok: true, data: { jobId: '12345xyz' } }
        : { ok: false, error: "Failed to connect to the server." };

      if (!response.ok) {
        // Now response.error is accessible because TypeScript knows it's an ApiErrorResponse
        throw new Error(response.error || 'An unknown error occurred.');
      }

      // Handle Success (response is ApiSuccessResponse here)
      setSubmitSuccess(true);
      console.log("Submission successful, Job ID:", response.data.jobId);
      // --- Redirect ---
      // You would typically redirect here using react-router-dom's useNavigate
      // Example: navigate(`/results/${response.data.jobId}`);
      alert(`Analysis started! Redirecting to results for Job ID: ${response.data.jobId}`); // Placeholder

    } catch (err) {
      // Handle Error
      console.error("Submission failed:", err);
      setApiError(err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
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
                    <div className="form-input-container">
                      <textarea
                        id="problemStatement"
                        name="problemStatement"
                        rows={3}
                        value={problemStatement}
                        onChange={handleInputChange}
                        placeholder="Example: Pet owners struggle to find trustworthy, affordable pet sitters on short notice, especially for last-minute trips."
                        className="form-textarea"
                      />
                    </div>
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
