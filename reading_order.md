# Semita AI - Complete Codebase Reading Order

## Overview
This document provides the optimal reading order to understand every line of code in the Semita AI codebase. Follow this sequence to build understanding progressively, from user input to final results.

## Phase 1: Foundation Understanding (Start Here)

### 1. Configuration and Environment Files
**Read these first to understand the setup:**
```
1. package.json (root) - Dependencies and scripts
2. .env.example - Environment variables structure
3. tsconfig.json - TypeScript configuration
4. tailwind.config.js - Styling configuration
```

### 2. Core Data Structures and Types
**Understand the data models before diving into logic:**
```
5. src/types/ - All TypeScript interfaces and types
   - Start with business idea and job-related types
   - Then analysis result types
   - Finally UI component types
```

## Phase 2: Frontend Entry Points (User Journey Start)

### 3. Application Shell
**Follow the React app initialization:**
```
6. src/main.tsx - Application entry point
7. src/App.tsx - Main app component and routing
8. src/components/Layout.tsx (if exists) - App layout structure
```

### 4. Business Idea Form (User Input)
**Critical starting point - read every line carefully:**
```
9. src/components/BusinessIdeaForm.tsx
   - Read line by line understanding:
     * State management (useState hooks)
     * Form validation logic
     * handleSubmit function (API call initiation)
     * Problem statement generation
     * Error handling and loading states
```

### 5. Navigation and Routing
```
10. src/components/Navigation.tsx (if exists)
11. Router configuration files
```

## Phase 3: Results Display Layer

### 6. Analysis Results Page
**The polling and display logic:**
```
12. src/pages/AnalysisResultsPage.tsx
    - Read methodically:
      * useEffect hooks for polling
      * fetchJobStatus function
      * Job status state management
      * Conditional rendering logic
      * Data transformation functions
```

### 7. Progress Tracking Components
```
13. src/components/AnalysisProgress.tsx
    - Progress bar logic
    - Status indicators
    - Real-time updates
```

### 8. Results Dashboard Components
**Read in dependency order:**
```
14. src/components/dashboard/IdeaLabDashboard.tsx (main dashboard container)
15. src/components/dashboard/SummarySection.tsx
16. src/components/dashboard/ClassificationSection.tsx
17. src/components/dashboard/SegmentationSection.tsx
18. src/components/dashboard/MarketSizingSection.tsx
19. src/components/dashboard/CompetitionSection.tsx
20. src/components/dashboard/ProblemSection.tsx
21. src/components/dashboard/RecommendationSection.tsx
```

## Phase 4: Node.js Backend (Core Orchestration)

### 9. Main Server File
**This is the heart of your application - read very carefully:**
```
22. server/src/index.js
    - Start from the top:
      * Import statements and dependencies
      * Environment configuration
      * Express app setup and middleware
      * Health check endpoint
      * POST /api/generate-problem endpoint
      * POST /api/analyze endpoint (job creation)
      * GET /api/jobs/:jobId endpoint
      * processEverything function (main pipeline)
      * Individual processing functions:
        - runClassification
        - runSegmentation  
        - runProblemValidation
        - runCompetitionAnalysis
        - runMarketSizingAttempt
        - finalizeMarketSizing
        - runRecommendationEngine
      * updateJob helper function
      * Server startup code
```

### 10. Node.js Service Layer
**Read in execution order:**
```
23. server/src/services/businessAnalyser.js
    - generateProblemStatement function
    - analyzeBusinessIdea function

24. server/src/services/classifiers/businessClassifier.js
    - classifyBusinessIdea function
    - LLM prompt construction
    - Response parsing

25. server/src/services/segmenters/llmSegmenter.js
    - identifySegmentsWithLLM function
    - Segmentation logic and prompts

26. server/src/services/marketSizingCalculator.js
    - calculateMarketSizing function (local fallback)
    - TAM/SAM/SOM calculations
    - Data processing logic

27. server/src/services/recommendationEngine.js
    - generateRecommendation function
    - Analysis data aggregation
    - AI-powered recommendation generation
```

## Phase 5: Python API Layer (Research Engine)

### 11. Python API Entry Point
```
28. research_engine/api.py
    - FastAPI app initialization
    - Service dependencies setup
    - Endpoint definitions:
      * POST /market-size
      * POST /competition  
      * POST /problem-validation
    - Request/response models
    - Error handling
```

### 12. Python Service Classes
**Read in complexity order:**
```
29. research_engine/research_modules/problem_validation.py
    - ProblemValidationService class
    - validate_problem method
    - Task creation and browser setup
    - Result processing

30. research_engine/research_modules/competitive_analysis.py
    - CompetitiveAnalysisService class
    - analyze_competition method
    - Competitor research logic
    - Market gap analysis

31. research_engine/research_modules/market_sizing.py
    - MarketSizingService class
    - research_market_size method
    - Market data collection
    - TAM/SAM/SOM calculation
```

### 13. Browser Configuration
```
32. research_engine/browser_config_fix.py
    - get_enhanced_browser_config function
    - Browser settings and optimization
    - Context configuration
```

## Phase 6: Utility and Helper Functions

### 14. Frontend Utilities
```
33. src/utils/ (all utility files)
    - API client functions
    - Data transformation helpers
    - Validation utilities
    - Formatting functions
```

### 15. Shared Components
```
34. src/components/common/ (reusable components)
    - Button components
    - Form components
    - Loading indicators
    - Error displays
```

## Phase 7: Styling and Assets

### 16. Styling Files
```
35. src/styles/ - CSS/SCSS files
36. src/assets/ - Images and static assets
```

## Reading Strategy for Each File

### For Every File, Follow This Pattern:

1. **Header Comments** - Understand the file's purpose
2. **Imports** - See dependencies and relationships
3. **Constants/Configuration** - Global values and settings
4. **Type Definitions** - Data structures (TypeScript files)
5. **Main Functions/Classes** - Core logic
6. **Helper Functions** - Supporting utilities
7. **Exports** - What this file provides to others

### Detailed Line-by-Line Approach:

**For Complex Files (like server/src/index.js):**
1. Read each import statement - understand what each dependency does
2. Trace variable declarations and their usage
3. Follow function call sequences step by step
4. Understand error handling and edge cases
5. Pay attention to async/await patterns
6. Note data transformations and validations

**For React Components:**
1. Understand prop interfaces
2. Trace state variables and their updates  
3. Follow useEffect dependencies and cleanup
4. Understand event handlers and their triggers
5. Trace conditional rendering logic
6. Note API calls and data flow

**For Python Services:**
1. Understand class initialization and dependencies
2. Follow method call sequences
3. Trace browser automation steps
4. Understand LLM integration points
5. Note error handling and fallbacks
6. Follow data processing and validation

## Key Focus Points While Reading:

### 1. Data Flow Tracing
- How data moves from user input to final results
- Transformations at each layer
- Validation points and error handling

### 2. Async Operation Patterns
- Promise chains and async/await usage
- Parallel vs sequential processing
- Error propagation and recovery

### 3. State Management
- React state updates and effects
- Job status tracking
- Progress updates and polling

### 4. API Integration Points
- HTTP request/response handling
- Payload structures and validation
- Timeout and retry mechanisms

### 5. Browser Automation Logic
- Agent task creation
- Search and navigation patterns
- Data extraction and processing

## Debugging and Testing Code

After reading the main codebase, examine:
```
37. Test files (*.test.js, *.spec.ts)
38. research_engine/test_*.py files
39. Error handling and logging code
```

## Execution Flow Cross-References

### Critical Function Call Chains to Trace:

**Frontend to Backend:**
```
BusinessIdeaForm.handleSubmit() 
→ POST /api/analyze 
→ processEverything(jobId)
→ runClassification()
→ runSegmentation()
→ [Parallel] runProblemValidation(), runCompetitionAnalysis(), runMarketSizingAttempt()
→ finalizeMarketSizing()
→ runRecommendationEngine()
```

**Backend to Python API:**
```
runProblemValidation() 
→ axios.post('/problem-validation')
→ ProblemValidationService.validate_problem()
→ Browser automation with Agent
→ Web research and data extraction
→ Structured result processing
```

**Results Display:**
```
AnalysisResultsPage.fetchJobStatus()
→ GET /api/jobs/:jobId
→ Job status polling
→ transformJobToAnalysisResult()
→ IdeaLabDashboard component rendering
→ Individual section components display
```

## Common Patterns to Understand:

### 1. Error Handling Patterns
- Try/catch blocks in async functions
- Graceful degradation strategies
- Fallback mechanisms
- User-friendly error messages

### 2. Data Validation Patterns
- Frontend form validation
- Backend request validation
- Python API response validation
- Type checking and sanitization

### 3. State Management Patterns
- React useState and useEffect hooks
- Job progress tracking
- Real-time updates via polling
- Component re-rendering optimization

### 4. Browser Automation Patterns
- Agent task construction
- LLM prompt engineering
- Web navigation and data extraction
- Result parsing and validation

This reading order ensures you build understanding progressively, following the natural execution flow while gradually increasing complexity. Start with the frontend entry point and follow the user journey through to the final results display, then dive into the backend orchestration and finally the research automation layer.

Each file should be read with attention to its role in the overall system, understanding both the specific implementation details and how it fits into the broader architecture. 