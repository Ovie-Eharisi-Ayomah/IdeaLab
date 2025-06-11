# SemitaAI - Detailed Function Call Map

## Complete Function Call Sequence

### Phase 1: Frontend User Interaction

#### File: `src/components/BusinessIdeaForm.tsx`

**User Input Flow:**
```
1. Component Render
   └── BusinessIdeaForm() component initialization
       ├── useState() hooks for form state management
       ├── useEffect() for validation and word count
       └── event handlers setup

2. User Types in Business Idea
   └── handleInputChange(e: ChangeEvent)
       ├── setBusinessIdea(value)
       ├── countWords(businessIdea) → setWordCount()
       └── Form validation triggers via useEffect()

3. Problem Statement Generation (Optional)
   └── handleGenerateProblem()
       ├── Validation: businessIdea.length >= MIN_IDEA_LENGTH
       ├── setIsGeneratingProblem(true)
       ├── fetch(`${API_BASE_URL}/generate-problem`)
       ├── response.json() → data.problemStatement
       ├── setProblemStatement(data.problemStatement)
       └── setIsGeneratingProblem(false)

4. Form Submission
   └── handleSubmit(e: FormEvent)
       ├── e.preventDefault()
       ├── validateForm() → boolean
       ├── setIsLoading(true)
       ├── fetch(`${API_BASE_URL}/analyze`, POST)
       ├── response.json() → { jobId }
       ├── setSubmitSuccess(true)
       ├── navigate(`/results/${jobId}`)
       └── setIsLoading(false)
```

### Phase 2: Results Page Polling

#### File: `src/pages/AnalysisResultsPage.tsx`

**Polling Flow:**
```
1. Component Mount
   └── AnalysisResultsPage() component initialization
       ├── useParams() → { jobId }
       ├── useState() hooks for job state
       └── useEffect() polling setup

2. Job Status Polling
   └── useEffect([jobId, job?.status])
       ├── fetchJob() - initial call
       ├── setInterval(fetchJob, 2000ms) - polling
       └── cleanup on unmount/completion

3. Job Status Fetch
   └── fetchJob()
       ├── fetch(`${API_BASE_URL}/jobs/${jobId}`)
       ├── response.json() → JobData
       ├── normalizeJobData() → setJob()
       ├── Status check: 'processing' | 'complete' | 'failed'
       └── Polling control (continue/stop)

4. Results Display
   └── Conditional rendering based on job.status
       ├── Loading: AnalysisProgress component
       ├── Complete: transformJobToAnalysisResult() → IdeaLabDashboard
       └── Error: Error message display
```

### Phase 3: Node.js Server Processing

#### File: `server/src/index.js`

**API Endpoint Handlers:**

#### Generate Problem Statement
```
POST /api/generate-problem
└── app.post('/api/generate-problem')
    ├── Request validation: { businessIdea }
    ├── generateProblemStatement(businessIdea)
    │   └── Call to server/src/services/businessAnalyser.js
    ├── Response: { problemStatement }
    └── Error handling
```

#### Create Analysis Job
```
POST /api/analyze
└── app.post('/api/analyze')
    ├── Request validation: { businessIdea, problemStatement }
    ├── uuidv4() → jobId
    ├── createJobObject() → job structure
    ├── jobs[jobId] = job (in-memory storage)
    ├── processEverything(jobId) - background processing
    ├── Response: { jobId }
    └── Error handling
```

#### Get Job Status
```
GET /api/jobs/:jobId
└── app.get('/api/jobs/:jobId')
    ├── jobs[jobId] lookup
    ├── Job existence validation
    ├── Response: JobData object
    └── Error handling (404 if not found)
```

**Main Processing Pipeline:**

#### Background Job Processing
```
processEverything(jobId)
├── jobs[jobId] retrieval
├── Sequential Phase:
│   ├── runClassification(job)
│   └── runSegmentation(job)
├── Parallel Phase:
│   ├── Promise.allSettled([
│   │   runProblemValidation(job),
│   │   runCompetitionAnalysis(job),
│   │   runMarketSizingAttempt(job)
│   └── ])
├── Finalization Phase:
│   ├── finalizeMarketSizing(job)
│   └── runRecommendationEngine(job)
├── job.status = 'complete'
└── updateJob(job)
```

#### Individual Processing Functions

**Classification Step:**
```
runClassification(job)
├── job.progress.classification = 'processing'
├── updateJob(job)
├── classifyBusinessIdea(job.input.businessIdea)
│   └── Call to server/src/services/classifiers/businessClassifier.js
│       ├── OpenAI API call (gpt-4o)
│       ├── Prompt: classification prompt
│       ├── Response parsing
│       └── Return: { primaryIndustry, secondaryIndustry, productType, ... }
├── job.results.classification = result
├── job.progress.classification = 'complete'
└── updateJob(job)
```

**Segmentation Step:**
```
runSegmentation(job)
├── Dependency check: classification complete
├── job.progress.segmentation = 'processing'
├── updateJob(job)
├── identifySegmentsWithLLM(businessIdea, classification, options)
│   └── Call to server/src/services/segmenters/llmSegmenter.js
│       ├── OpenAI API call (gpt-4o)
│       ├── Prompt: segmentation prompt with classification context
│       ├── Response parsing
│       └── Return: { primarySegments[], summary }
├── job.results.segmentation = result
├── job.progress.segmentation = 'complete'
└── updateJob(job)
```

**Python API Integration Steps:**
```
runProblemValidation(job)
├── Dependency check: classification complete + problemStatement exists
├── job.progress.problemValidation = 'processing'
├── updateJob(job)
├── axios.post(`${PYTHON_API_URL}/problem-validation`, {
│   description, industry, problem_statement
│   })
│   └── Call to Python API (see Phase 4)
├── job.results.problemValidation = response.data
├── job.progress.problemValidation = 'complete'
└── updateJob(job)

runCompetitionAnalysis(job)
├── Dependency check: classification complete
├── job.progress.competition = 'processing'
├── updateJob(job)
├── axios.post(`${PYTHON_API_URL}/competition`, {
│   description, industry, product_type, problem_statement?
│   })
│   └── Call to Python API (see Phase 4)
├── job.results.competition = response.data
├── job.progress.competition = 'complete'
└── updateJob(job)

runMarketSizingAttempt(job)
├── Dependency check: classification complete
├── job.progress.marketSizing = 'processing_api'
├── updateJob(job)
├── axios.post(`${PYTHON_API_URL}/market-size`, {
│   description, industry, product_type
│   })
│   └── Call to Python API (see Phase 4)
├── job.results.marketSize = response.data
├── job.progress.marketSizing = 'api_complete'
└── updateJob(job)
```

**Market Sizing Finalization:**
```
finalizeMarketSizing(job)
├── Check API result status
├── If API failed or incomplete:
│   ├── job.progress.marketSizing = 'processing_local'
│   ├── calculateMarketSizing(marketData, segmentation, problemValidation, competition)
│   │   └── Call to server/src/services/marketSizingCalculator.js
│   │       ├── Data validation and processing
│   │       ├── TAM/SAM/SOM calculations
│   │       ├── Growth projections
│   │       └── Return: market sizing object
│   ├── result.calculation_source = 'local_fallback'
│   └── job.progress.marketSizing = 'complete'
├── If API succeeded:
│   ├── result.calculation_source = 'backend_api'
│   └── job.progress.marketSizing = 'complete'
└── updateJob(job)
```

**Recommendation Generation:**
```
runRecommendationEngine(job)
├── job.progress.recommendation = 'processing'
├── updateJob(job)
├── generateRecommendation(analysisData, options)
│   └── Call to server/src/services/recommendationEngine.js
│       ├── Data aggregation from all analysis results
│       ├── OpenAI API call (gpt-4o)
│       ├── Prompt: comprehensive analysis prompt
│       ├── Response parsing and scoring
│       └── Return: { recommendation, score, reasoning, source }
├── job.results.recommendation = result
├── job.progress.recommendation = 'complete'
└── updateJob(job)
```

### Phase 4: Python API Processing

#### File: `research_engine/api.py`

**FastAPI Endpoint Handlers:**

#### Problem Validation
```
POST /problem-validation
└── validate_problem(request: ProblemRequest)
    ├── Request validation: { description, industry, problem_statement }
    ├── problem.validate_problem(description, problem_statement, industry)
    │   └── Call to ProblemValidationService
    ├── Response: problem validation data
    └── Error handling with HTTPException
```

#### Competition Analysis
```
POST /competition
└── analyze_competition(request: BusinessRequest)
    ├── Request validation: { description, industry, product_type, problem_statement? }
    ├── competition.analyze_competition(description, industry, product_type, problem_statement)
    │   └── Call to CompetitiveAnalysisService
    ├── Response: competition analysis data
    └── Error handling with HTTPException
```

#### Market Sizing
```
POST /market-size
└── get_market_size(request: BusinessRequest)
    ├── Request validation: { description, industry, product_type }
    ├── market_sizing.research_market_size(description, industry, product_type)
    │   └── Call to MarketSizingService
    ├── Response: market sizing data
    └── Error handling with HTTPException
```

### Phase 5: Browser Automation Research

#### File: `research_engine/research_modules/market_sizing.py`

**Market Sizing Service:**
```
MarketSizingService.research_market_size(description, industry, product_type)
├── LLM setup (OpenAI primary, Claude fallback)
├── get_enhanced_browser_config() → browser configuration
├── Browser(config=browser_config) → browser instance
├── create_research_task() → task prompt generation
├── Agent(task=task, llm=primary_llm, browser=browser) → agent creation
├── agent.run() → browser automation execution
│   ├── Web search and navigation
│   ├── Data extraction from market research sites
│   ├── Content parsing and analysis
│   └── Structured data compilation
├── process_market_sizing_results() → data processing
│   ├── JSON parsing and validation
│   ├── Source credibility assessment
│   ├── TAM/SAM/SOM calculation
│   └── Confidence scoring
├── browser.close() → cleanup
└── Return: market sizing data structure
```

#### File: `research_engine/research_modules/competitive_analysis.py`

**Competitive Analysis Service:**
```
CompetitiveAnalysisService.analyze_competition(description, industry, product_type, problem_statement)
├── LLM setup (OpenAI primary, Claude fallback)
├── get_enhanced_browser_config() → browser configuration
├── Browser(config=browser_config) → browser instance
├── create_competition_task() → task prompt generation
├── Agent(task=task, llm=primary_llm, browser=browser) → agent creation
├── agent.run() → browser automation execution
│   ├── Competitor research and identification
│   ├── Website analysis and data extraction
│   ├── Market positioning analysis
│   └── Competitive landscape mapping
├── process_competition_results() → data processing
│   ├── JSON parsing and validation
│   ├── Competitor data structuring
│   ├── Market gap analysis
│   └── Barrier identification
├── browser.close() → cleanup
└── Return: competition analysis data structure
```

#### File: `research_engine/research_modules/problem_validation.py`

**Problem Validation Service:**
```
ProblemValidationService.validate_problem(description, problem_statement, industry)
├── LLM setup (OpenAI primary, Claude fallback)
├── get_enhanced_browser_config() → browser configuration
├── Browser(config=browser_config) → browser instance
├── create_validation_task() → task prompt generation
├── Agent(task=task, llm=primary_llm, browser=browser) → agent creation
├── agent.run() → browser automation execution
│   ├── Problem evidence research
│   ├── Market validation studies
│   ├── User feedback and pain point analysis
│   └── Alternative solution research
├── process_validation_results() → data processing
│   ├── JSON parsing and validation
│   ├── Evidence categorization
│   ├── Severity and frequency scoring
│   └── Willingness to pay assessment
├── browser.close() → cleanup
└── Return: problem validation data structure
```

### Phase 6: Browser-Use Integration

#### File: `research_engine/browser_config_fix.py`

**Browser Configuration:**
```
get_enhanced_browser_config()
├── BrowserConfig() initialization
├── Security and performance settings
├── BrowserContextConfig() setup
│   ├── Window size and viewport configuration
│   ├── Network timeout settings
│   ├── Element highlighting options
│   └── Recording and debugging options
└── Return: configured browser instance
```

**Agent Execution Flow:**
```
Agent.run()
├── Browser session initialization
├── Task interpretation and planning
├── Web navigation and search
│   ├── Search query generation
│   ├── Results page analysis
│   ├── Link following and content extraction
│   └── Multi-source data gathering
├── Content processing and validation
├── Structured data compilation
├── Browser session cleanup
└── Return: research results
```

## Data Flow Validation Points

### Frontend Validation
- Form input validation (character limits, required fields)
- API response validation (jobId format, error handling)
- Job status validation (enum checking, progress tracking)

### Backend Validation
- Request payload validation (businessIdea, problemStatement)
- Job existence validation (jobId lookup)
- Progress state validation (step dependencies)
- Result data validation (structure, completeness)

### Python API Validation
- Request parameter validation (description, industry, product_type)
- Browser automation result validation (JSON structure, data quality)
- Confidence scoring validation (0-10 scale)
- Source credibility validation (URL accessibility, content quality)

## Error Recovery Mechanisms

### Frontend Error Recovery
- Network error retry with exponential backoff
- Graceful degradation for missing data
- User notification with actionable messages
- Navigation fallback options

### Backend Error Recovery
- Individual step error isolation
- Local calculation fallbacks
- Partial result preservation
- Job status rollback capabilities

### Python API Error Recovery
- LLM fallback mechanisms (OpenAI → Claude)
- Browser automation retry logic
- Cached result utilization
- Graceful timeout handling

This function call map provides the exact sequence of every function call from user input to final results, enabling you to understand the codebase execution order line by line. 