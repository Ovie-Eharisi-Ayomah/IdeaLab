# Semita AI - Visual Flow Diagram

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND (React/TypeScript)                     │
├─────────────────────────────────────────────────────────────────────────────┤
│  BusinessIdeaForm.tsx                    AnalysisResultsPage.tsx             │
│  ┌─────────────────────────┐              ┌─────────────────────────────────┐ │
│  │ 1. User Input           │              │ 4. Results Display              │ │
│  │    - Business Idea      │              │    - Job Status Polling         │ │
│  │    - Problem Statement  │              │    - Progress Tracking          │ │
│  │ 2. Form Validation      │              │    - Dashboard Rendering        │ │
│  │ 3. API Submission       │              │    - Error Handling             │ │
│  └─────────────────────────┘              └─────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ HTTP Requests
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           NODE.JS SERVER (Express)                          │
├─────────────────────────────────────────────────────────────────────────────┤
│  server/src/index.js                                                        │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │                           API ENDPOINTS                                 │ │
│  │  POST /api/analyze          GET /api/jobs/:id    POST /api/generate-problem │ │
│  │       │                           │                       │             │ │
│  │       ▼                           ▼                       ▼             │ │
│  │  Create Job                 Return Job Status       Generate Problem     │ │
│  │  Return jobId               Return Results          Return Statement     │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │                         PROCESSING PIPELINE                             │ │
│  │                                                                         │ │
│  │  processEverything(jobId)                                               │ │
│  │  │                                                                      │ │
│  │  ├── Sequential Phase:                                                  │ │
│  │  │   ├── runClassification()    [LLM: OpenAI GPT-4o]                   │ │
│  │  │   └── runSegmentation()      [LLM: OpenAI GPT-4o]                   │ │
│  │  │                                                                      │ │
│  │  ├── Parallel Phase:                                                    │ │
│  │  │   ├── runProblemValidation()     [Python API Call]                  │ │
│  │  │   ├── runCompetitionAnalysis()   [Python API Call]                  │ │
│  │  │   └── runMarketSizingAttempt()   [Python API Call]                  │ │
│  │  │                                                                      │ │
│  │  └── Finalization Phase:                                                │ │
│  │      ├── finalizeMarketSizing()     [Local Calculation Fallback]       │ │
│  │      └── runRecommendationEngine()  [LLM: OpenAI GPT-4o]               │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ HTTP Requests
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          PYTHON API SERVER (FastAPI)                       │
├─────────────────────────────────────────────────────────────────────────────┤
│  research_engine/api.py                                                     │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │                           API ENDPOINTS                                 │ │
│  │  POST /problem-validation   POST /competition   POST /market-size       │ │
│  │       │                           │                    │                │ │
│  │       ▼                           ▼                    ▼                │ │
│  │  ProblemValidation         CompetitiveAnalysis   MarketSizing           │ │
│  │  Service                   Service               Service                 │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ Browser Automation
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         BROWSER AUTOMATION LAYER                           │
├─────────────────────────────────────────────────────────────────────────────┤
│  Browser-Use Framework + LLMs                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │                         RESEARCH EXECUTION                              │ │
│  │                                                                         │ │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐         │ │
│  │  │ Problem         │  │ Competition     │  │ Market Sizing   │         │ │
│  │  │ Validation      │  │ Analysis        │  │ Research        │         │ │
│  │  │                 │  │                 │  │                 │         │ │
│  │  │ • Evidence      │  │ • Competitor    │  │ • TAM/SAM/SOM   │         │ │
│  │  │   Research      │  │   Discovery     │  │   Data          │         │ │
│  │  │ • Pain Point    │  │ • Market Gap    │  │ • Growth Rates  │         │ │
│  │  │   Analysis      │  │   Analysis      │  │ • Market Size   │         │ │
│  │  │ • Alternative   │  │ • Barrier       │  │   Validation    │         │ │
│  │  │   Solutions     │  │   Assessment    │  │ • Geographic    │         │ │
│  │  │ • Willingness   │  │ • Trend         │  │   Breakdown     │         │ │
│  │  │   to Pay        │  │   Analysis      │  │                 │         │ │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘         │ │
│  │           │                     │                     │                │ │
│  │           ▼                     ▼                     ▼                │ │
│  │      Agent.run()           Agent.run()           Agent.run()            │ │
│  │           │                     │                     │                │ │
│  │           ▼                     ▼                     ▼                │ │
│  │   Web Navigation        Web Navigation        Web Navigation            │ │
│  │   Content Extraction    Content Extraction    Content Extraction       │ │
│  │   Data Processing       Data Processing       Data Processing          │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Detailed Data Flow Sequence

```
USER INPUT FLOW:
┌─────────────┐    ┌──────────────┐    ┌─────────────┐    ┌──────────────┐
│ 1. User     │───▶│ 2. Form      │───▶│ 3. API      │───▶│ 4. Job       │
│    Types    │    │    Validates │    │    Creates  │    │    Created   │
│    Idea     │    │    Input     │    │    Job      │    │    & Queued  │
└─────────────┘    └──────────────┘    └─────────────┘    └──────────────┘

BACKEND PROCESSING FLOW:
┌─────────────┐    ┌──────────────┐    ┌─────────────┐    ┌──────────────┐
│ 5. Node.js  │───▶│ 6. Python    │───▶│ 7. Browser  │───▶│ 8. Results   │
│    Analysis │    │    API       │    │    Research │    │    Compiled  │
│    Pipeline │    │    Services  │    │    & Data   │    │    & Scored  │
└─────────────┘    └──────────────┘    └─────────────┘    └──────────────┘

FRONTEND RESULT FLOW:
┌─────────────┐    ┌──────────────┐    ┌─────────────┐    ┌──────────────┐
│ 9. Frontend │───▶│ 10. Job      │───▶│ 11. Data    │───▶│ 12. User     │
│    Polls    │    │     Status   │    │     Transform│    │     Views    │
│    Status   │    │     Updates  │    │     & Display│    │     Results  │
└─────────────┘    └──────────────┘    └─────────────┘    └──────────────┘
```

## Component Interaction Matrix

```
                    │ Form │ Results │ Node.js │ Python │ Browser │
────────────────────┼──────┼─────────┼─────────┼────────┼─────────┤
BusinessIdeaForm    │  ●   │    ○    │    ●    │   ○    │    ○    │
AnalysisResultsPage │  ○   │    ●    │    ●    │   ○    │    ○    │
Node.js Server      │  ●   │    ●    │    ●    │   ●    │    ○    │
Python API          │  ○   │    ○    │    ●    │   ●    │    ●    │
Browser Automation  │  ○   │    ○    │    ○    │   ●    │    ●    │

Legend: ● = Direct Interaction, ○ = No Direct Interaction
```

## Processing Time Flow

```
Timeline (Typical 8-12 minute analysis):

0:00 ├─ User Submits Form
     │
0:01 ├─ Job Created & Classification Starts
     │
0:15 ├─ Classification Complete → Segmentation Starts
     │
0:45 ├─ Segmentation Complete → Python APIs Start (Parallel)
     │   ├─ Problem Validation (2-4 min)
     │   ├─ Competition Analysis (3-5 min)
     │   └─ Market Sizing (4-6 min)
     │
5:30 ├─ First Python API Completes
     │
7:45 ├─ All Python APIs Complete → Market Sizing Finalization
     │
8:15 ├─ Recommendation Engine Starts
     │
8:45 ├─ Analysis Complete → Results Available
     │
     └─ User Views Final Dashboard
```

## Error Handling Flow

```
ERROR RECOVERY MECHANISM:

Frontend Errors:
┌─────────────┐    ┌──────────────┐    ┌─────────────┐
│ Network     │───▶│ Retry with   │───▶│ Show User   │
│ Failure     │    │ Backoff      │    │ Message     │
└─────────────┘    └──────────────┘    └─────────────┘

Backend Errors:
┌─────────────┐    ┌──────────────┐    ┌─────────────┐
│ Step        │───▶│ Log Error &  │───▶│ Continue    │
│ Failure     │    │ Use Fallback │    │ Processing  │
└─────────────┘    └──────────────┘    └─────────────┘

Python API Errors:
┌─────────────┐    ┌──────────────┐    ┌─────────────┐
│ Browser     │───▶│ Retry with   │───▶│ Fallback to │
│ Failure     │    │ Different    │    │ Cached Data │
│             │    │ Strategy     │    │ or Skip     │
└─────────────┘    └──────────────┘    └─────────────┘
```

## File Organization Map

```
Idea-Lab/
├── Frontend (React/TypeScript)
│   ├── src/components/
│   │   ├── BusinessIdeaForm.tsx          [Entry Point]
│   │   └── dashboard/                    [Results Display]
│   │   └── AnalysisResultsPage.tsx       [Main Results Page]
│   └── src/utils/
│       └── dataTransformers.ts           [Data Processing]
│
├── Backend (Node.js/Express)
│   ├── server/src/index.js               [Main Server]
│   └── server/src/services/
│       ├── businessAnalyser.js           [Core Analysis]
│       ├── classifiers/                  [LLM Classification]
│       ├── segmenters/                   [Customer Segmentation]
│       ├── marketSizingCalculator.js     [Local Calculations]
│       └── recommendationEngine.js       [Final Recommendations]
│
└── Research Engine (Python/FastAPI)
    ├── research_engine/api.py            [API Endpoints]
    ├── research_engine/research_modules/
    │   ├── market_sizing.py              [Market Research]
    │   ├── competitive_analysis.py       [Competition Research]
    │   └── problem_validation.py         [Problem Research]
    └── research_engine/browser_config_fix.py [Browser Setup]
```

This visual diagram provides a complete overview of how every component interacts, the timing of operations, error handling flows, and the file organization structure. 