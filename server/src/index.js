console.log('Starting server initialization...');
require('dotenv').config();
console.log('Loaded dotenv');

const express = require('express');
console.log('Loaded express');

const cors = require('cors');
console.log('Loaded cors');

const { generateProblemStatement, analyzeBusinessIdea } = require('./services/businessAnalyser');
const { classifyBusinessIdea } = require('./services/classifiers/businessClassifier');
const { identifySegmentsWithLLM } = require('./services/segmenters/llmSegmenter');
const { generateRecommendation } = require('./services/recommendationEngine');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const { calculateMarketSizing } = require('./services/marketSizingCalculator');
const { OpenAI } = require('openai');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

console.log('Loaded analysis services');

const app = express();
console.log('Created express app');

const PORT = process.env.PORT || 5002;
console.log('Port configured:', PORT);

// Add this near the top of the file, after the other constants
const PYTHON_API_URL = process.env.PYTHON_API_URL || 'http://localhost:8000';

// In-memory job storage
const jobs = {};

// Middleware
app.use(cors());
console.log('Added cors middleware');

app.use(express.json());
console.log('Added json middleware');

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Semita AI API is running' });
});
console.log('Added health check endpoint');

// Problem statement generation endpoint
app.post('/api/generate-problem', async (req, res) => {
  try {
    const { businessIdea } = req.body;
    if (!businessIdea) {
      return res.status(400).json({ error: 'Business idea is required' });
    }
    
    const problemStatement = await generateProblemStatement(businessIdea);
    res.json({ problemStatement });
  } catch (error) {
    console.error('Error generating problem statement:', error);
    res.status(500).json({ error: 'Failed to generate problem statement' });
  }
});
console.log('Added problem generation endpoint');

// Create a new analysis job
app.post('/api/analyze', async (req, res) => {
  try {
    const { businessIdea, problemStatement } = req.body;
    
    if (!businessIdea) {
      return res.status(400).json({ error: 'Business idea is required' });
    }
    
    // Create a new job with a unique ID
    const jobId = uuidv4();
    const job = {
      id: jobId,
      status: 'processing',
      createdAt: new Date(),
      input: { businessIdea, problemStatement },
      progress: {
        classification: 'pending',
        segmentation: 'pending',
        marketSizing: 'pending',
        problemValidation: 'pending',
        competition: 'pending',
        recommendation: 'pending'
      },
      results: {
        classification: null,
        segmentation: null,
        marketSize: null,
        problemValidation: null,
        competition: null,
        recommendation: null
      },
      error: null
    };
    
    // Store the job
    jobs[jobId] = job;
    
    // Start processing in the background (don't await here)
    processEverything(jobId)
      .catch(error => {
        console.error(`Job ${jobId} failed:`, error);
        jobs[jobId].status = 'failed';
        jobs[jobId].error = error.message || 'An error occurred during analysis';
      });
    
    // Return the job ID immediately
    res.status(201).json({ jobId });
    
  } catch (error) {
    console.error('Error starting analysis job:', error);
    res.status(500).json({ error: 'Failed to start analysis job' });
  }
});
console.log('Added analysis endpoint');

// Get job status and results
app.get('/api/jobs/:jobId', (req, res) => {
  try {
    const { jobId } = req.params;
    const job = jobs[jobId];
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    // Add computed fields to help frontend decide what to show
    const enhancedJob = {
      ...job,
      canShowResults: job.progress.classification === 'complete' && job.progress.segmentation === 'complete',
      criticalStepsComplete: job.progress.classification === 'complete' && job.progress.segmentation === 'complete',
      analysisComplete: job.status === 'complete',
      hasPartialResults: job.progress.classification === 'complete' || job.progress.segmentation === 'complete'
    };
    
    res.json(enhancedJob);
    
  } catch (error) {
    console.error('Error retrieving job:', error);
    res.status(500).json({ error: 'Failed to retrieve job information' });
  }
});
console.log('Added job status endpoint');

// Check if job is ready to show results (classification + segmentation complete)
app.get('/api/jobs/:jobId/ready', (req, res) => {
  try {
    const { jobId } = req.params;
    const job = jobs[jobId];
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    const isReady = job.progress.classification === 'complete' && job.progress.segmentation === 'complete';
    const hasCriticalFailure = job.status === 'failed' && 
      (job.progress.classification === 'failed' || job.progress.segmentation === 'failed');
    
    res.json({
      ready: isReady,
      criticalFailure: hasCriticalFailure,
      status: job.status,
      progress: job.progress,
      canProceedToResults: isReady && !hasCriticalFailure
    });
    
  } catch (error) {
    console.error('Error checking job readiness:', error);
    res.status(500).json({ error: 'Failed to check job readiness' });
  }
});
console.log('Added job readiness check endpoint');

async function runClassification(job) {
  job.progress.classification = 'processing';
  console.log(`[Job ${job.id}] Running classification...`);
  await updateJob(job); // Assuming updateJob is or can be async if it interacts with a real DB

  try {
    const classificationResult = await classifyBusinessIdea(job.input.businessIdea);
    job.results.classification = classificationResult;
    job.progress.classification = 'complete';
    console.log(`[Job ${job.id}] Classification complete: ${classificationResult.primaryIndustry} / ${classificationResult.productType}`);
  } catch (error) {
    console.error(`[Job ${job.id}] Classification failed:`, error);
    job.progress.classification = 'failed';
    job.results.classification = { error: error.message };
    throw new Error('Classification failed: ' + error.message); // Re-throw to stop dependent steps
  }
  await updateJob(job);
}

async function runSegmentation(job) {
  if (job.progress.classification !== 'complete' || !job.results.classification) {
    console.log(`[Job ${job.id}] Skipping segmentation due to classification failure or missing data.`);
    job.progress.segmentation = 'skipped';
    await updateJob(job);
    return; // Skip if classification didn't complete
  }
  job.progress.segmentation = 'processing';
  console.log(`[Job ${job.id}] Running segmentation...`);
  await updateJob(job);

  try {
    const segmentationResult = await identifySegmentsWithLLM(
      job.input.businessIdea,
      job.results.classification,
      { numberOfSegments: 3 }
    );
    job.results.segmentation = segmentationResult;
    job.progress.segmentation = 'complete';
    console.log(`[Job ${job.id}] Segmentation complete`);
  } catch (error) {
    console.error(`[Job ${job.id}] Segmentation failed:`, error);
    job.progress.segmentation = 'failed';
    job.results.segmentation = { error: error.message };
    // Decide if this error should halt everything or just be logged
    // For now, we'll let other independent tasks proceed.
  }
  await updateJob(job);
}

async function runProblemValidation(job) {
  if (!job.input.problemStatement) {
    job.progress.problemValidation = 'skipped';
    job.results.problemValidation = { 
      status: 'skipped', 
      message: 'No problem statement provided',
      display_message: 'Problem statement not provided'
    };
    console.log(`[Job ${job.id}] Problem validation skipped (no problem statement provided)`);
    await updateJob(job);
    return { status: 'skipped' };
  }
  if (job.progress.classification !== 'complete' || !job.results.classification?.primaryIndustry) {
    job.progress.problemValidation = 'skipped';
    job.results.problemValidation = { 
      status: 'skipped', 
      message: 'Classification data missing',
      display_message: 'Requires classification to complete first'
    };
    console.log(`[Job ${job.id}] Skipping problem validation due to classification failure or missing data.`);
    await updateJob(job);
    return { status: 'skipped', error: 'Classification data missing' };
  }

  job.progress.problemValidation = 'processing';
  console.log(`[Job ${job.id}] Running problem validation via Python API...`);
  await updateJob(job);
  
  try {
    const response = await axios.post(`${PYTHON_API_URL}/problem-validation`, {
      description: job.input.businessIdea,
      industry: job.results.classification.primaryIndustry,
      problem_statement: job.input.problemStatement
    }, { timeout: 180000 }); // Reduced timeout to 3 minutes
    
    job.results.problemValidation = response.data;
    job.progress.problemValidation = 'complete';
    console.log(`[Job ${job.id}] Problem validation complete`);
    return { status: 'complete', data: response.data };
  } catch (error) {
    console.error(`[Job ${job.id}] Problem validation API failed:`, error.message);
    job.progress.problemValidation = 'failed';
    
    // Provide helpful error message based on error type
    let displayMessage = 'Unable to validate problem';
    if (error.code === 'ECONNREFUSED') {
      displayMessage = 'Unable to validate problem - Analysis service unavailable';
    } else if (error.code === 'ENOTFOUND') {
      displayMessage = 'Unable to validate problem - Network error';
    } else if (error.response?.status === 404) {
      displayMessage = 'Unable to validate problem - Service endpoint not found';
    } else if (error.response?.status >= 500) {
      displayMessage = 'Unable to validate problem - Server error';
    } else if (error.code === 'ETIMEDOUT') {
      displayMessage = 'Unable to validate problem - Analysis took too long';
    }
    
    job.results.problemValidation = { 
      status: 'error',
      error: error.message,
      display_message: displayMessage,
      technical_error: `${error.code || 'UNKNOWN'}: ${error.message}`
    };
    return { status: 'failed', error: error.message };
  } finally {
    await updateJob(job);
  }
}

async function runCompetitionAnalysis(job) {
  if (job.progress.classification !== 'complete' || !job.results.classification?.primaryIndustry || !job.results.classification?.productType) {
    job.progress.competition = 'skipped';
    job.results.competition = { 
      status: 'skipped', 
      message: 'Classification data missing',
      display_message: 'Requires classification to complete first'
    };
    console.log(`[Job ${job.id}] Skipping competition analysis due to classification failure or missing data.`);
    await updateJob(job);
    return { status: 'skipped', error: 'Classification data missing' };
  }

  job.progress.competition = 'processing';
  console.log(`[Job ${job.id}] Running competition analysis via Python API...`);
  await updateJob(job);
  
  try {
    const requestBody = {
      description: job.input.businessIdea,
      industry: job.results.classification.primaryIndustry,
      product_type: job.results.classification.productType
    };
    
    // Include problem statement if available
    if (job.input.problemStatement) {
      requestBody.problem_statement = job.input.problemStatement;
    }
    
    const response = await axios.post(`${PYTHON_API_URL}/competition`, requestBody, { timeout: 180000 }); // Reduced timeout to 3 minutes
    job.results.competition = response.data;
    job.progress.competition = 'complete';
    console.log(`[Job ${job.id}] Competition analysis complete`);
    return { status: 'complete', data: response.data };
  } catch (error) {
    console.error(`[Job ${job.id}] Competition analysis API failed:`, error.message);
    job.progress.competition = 'failed';
    
    // Provide helpful error message based on error type
    let displayMessage = 'Unable to analyze competition';
    if (error.code === 'ECONNREFUSED') {
      displayMessage = 'Unable to analyze competition - Analysis service unavailable';
    } else if (error.code === 'ENOTFOUND') {
      displayMessage = 'Unable to analyze competition - Network error';
    } else if (error.response?.status === 404) {
      displayMessage = 'Unable to analyze competition - Service endpoint not found';
    } else if (error.response?.status >= 500) {
      displayMessage = 'Unable to analyze competition - Server error';
    } else if (error.code === 'ETIMEDOUT') {
      displayMessage = 'Unable to analyze competition - Analysis took too long';
    }
    
    job.results.competition = { 
      status: 'error',
      error: error.message,
      display_message: displayMessage,
      technical_error: `${error.code || 'UNKNOWN'}: ${error.message}`
    };
    return { status: 'failed', error: error.message };
  } finally {
    await updateJob(job);
  }
}

async function runMarketSizingAttempt(job) {
  if (job.progress.classification !== 'complete' || !job.results.classification?.primaryIndustry || !job.results.classification?.productType) {
    job.progress.marketSizing = 'skipped';
    job.results.marketSize = { 
      status: 'skipped', 
      message: 'Classification data missing',
      display_message: 'Requires classification to complete first'
    };
    console.log(`[Job ${job.id}] Skipping market sizing API attempt due to classification failure or missing data.`);
    await updateJob(job);
    return { status: 'skipped', error: 'Classification data missing for market sizing API call' };
  }

  job.progress.marketSizing = 'processing_api';
  console.log(`[Job ${job.id}] Running market sizing via Python API...`);
  await updateJob(job);
  
  try {
    const response = await axios.post(`${PYTHON_API_URL}/market-size`, {
      description: job.input.businessIdea,
      industry: job.results.classification.primaryIndustry,
      product_type: job.results.classification.productType
    }, { timeout: 180000 }); // Reduced timeout to 3 minutes
    
    job.results.marketSize = response.data;
    job.progress.marketSizing = 'api_complete';
    console.log(`[Job ${job.id}] Market sizing API call complete`);
    return { status: 'api_complete', data: response.data };
  } catch (error) {
    console.warn(`[Job ${job.id}] Market sizing API failed: ${error.message}. Will attempt local calculation.`);
    job.progress.marketSizing = 'api_failed';
    
    // Store API error but don't fail completely - local fallback will handle it
    let apiErrorMessage = 'Python API failed';
    if (error.code === 'ECONNREFUSED') {
      apiErrorMessage = 'Analysis service unavailable - using local calculation';
    } else if (error.code === 'ETIMEDOUT') {
      apiErrorMessage = 'Analysis took too long - using local calculation';
    }
    
    job.results.marketSize = { 
      error_api: error.message,
      api_failure_reason: apiErrorMessage
    };
    return { status: 'api_failed', error: error.message };
  } finally {
    await updateJob(job);
  }
}

async function processEverything(jobId) {
  const job = jobs[jobId];
  if (!job) {
    console.error(`Job ${jobId} not found in processEverything.`);
    return;
  }

  try {
    // Step 1: Classification (Sequential - must complete first)
    await runClassification(job);

    // Step 2: Segmentation (Sequential - depends on classification)
    await runSegmentation(job);

    // Step 3, 4, 5 (Python API calls) - Run in Parallel
    console.log(`[Job ${jobId}] Starting parallel Python API calls...`);
    const pythonApiTasks = [];

    if (job.input.problemStatement && job.results.classification?.primaryIndustry) {
      pythonApiTasks.push(runProblemValidation(job));
    } else {
      job.progress.problemValidation = 'skipped';
      console.log(`[Job ${jobId}] Pre-emptively skipping problem validation due to missing inputs.`);
      await updateJob(job);
    }

    if (job.results.classification?.primaryIndustry && job.results.classification?.productType) {
      pythonApiTasks.push(runCompetitionAnalysis(job));
    } else {
      job.progress.competition = 'skipped';
      console.log(`[Job ${jobId}] Pre-emptively skipping competition analysis due to missing classification details.`);
      await updateJob(job);
    }
    
    pythonApiTasks.push(runMarketSizingAttempt(job)); // Always attempt market sizing API call

    const results = await Promise.allSettled(pythonApiTasks);
    console.log(`[Job ${jobId}] Parallel Python API calls settled.`);
    
    // Process results of parallel tasks (already updated job object within each task)
    results.forEach(result => {
        if (result.status === 'rejected') {
            // This case should ideally be minimized if individual tasks handle their errors
            console.error(`[Job ${jobId}] A parallel task was rejected:`, result.reason);
        }
    });

    // Step 6: Local Market Sizing Fallback / Finalization
    // This runs after Python API calls, specifically after market sizing API attempt.
    console.log(`[Job ${jobId}] Finalizing market sizing (local calculation if needed)...`);
    try {
        // Check if API call for market size failed or returned an error structure from the API itself
        const marketApiResult = job.results.marketSize;
        if (job.progress.marketSizing === 'api_failed' || marketApiResult?.status === 'error' || !marketApiResult?.tam) {
            console.log(`[Job ${jobId}] Market sizing API failed or data incomplete, attempting local calculation.`);
            job.progress.marketSizing = 'processing_local';
            await updateJob(job);
            
            try {
                const marketDataSourceForLocalCalc = marketApiResult?.market_data || {
                     sources: [{
                        "publisher": "Default Fallback Source", "market_size": 500, "market_size_unit": "million",
                        "currency": "USD", "year": new Date().getFullYear(), "growth_rate": 5
                    }]
                }; // Use API provided market_data if available, else a very basic default

                const localMarketSizingResult = calculateMarketSizing(
                    marketDataSourceForLocalCalc, // This needs to be the raw market_data object
                    job.results.segmentation,     // Segmentation result from Step 2
                    job.results.problemValidation, // Problem validation result (might be from parallel step or null)
                    job.results.competition        // Competition result (might be from parallel step or null)
                );
                localMarketSizingResult.calculation_source = 'local_fallback';
                if (marketApiResult?.api_failure_reason) {
                    localMarketSizingResult.api_failure_reason = marketApiResult.api_failure_reason;
                }
                job.results.marketSize = localMarketSizingResult;
                job.progress.marketSizing = 'complete';
                console.log(`[Job ${jobId}] Market sizing completed locally.`);
            } catch (localCalcError) {
                console.error(`[Job ${jobId}] Local market sizing calculation failed:`, localCalcError);
                job.progress.marketSizing = 'failed';
                job.results.marketSize = { 
                    status: 'error',
                    error: 'Both API and local calculation failed',
                    display_message: 'Unable to calculate market size',
                    api_error: marketApiResult?.error_api || 'API failed',
                    local_error: localCalcError.message,
                    technical_error: `Local calculation failed: ${localCalcError.message}`
                };
            }
        } else if (job.progress.marketSizing === 'api_complete') {
            // API was successful and data seems okay
            job.results.marketSize.calculation_source = 'backend_api';
            job.progress.marketSizing = 'complete';
            console.log(`[Job ${jobId}] Market sizing confirmed complete from API.`);
        } else if (job.progress.marketSizing === 'skipped') {
            // Already handled in the individual function
            console.log(`[Job ${jobId}] Market sizing was skipped due to missing classification data.`);
        } else {
             console.warn(`[Job ${jobId}] Market sizing in unexpected state: ${job.progress.marketSizing}. Marking failed.`);
             job.progress.marketSizing = 'failed';
             job.results.marketSize = { 
                 status: 'error',
                 error: 'Market sizing finalization failed due to unexpected state.',
                 display_message: 'Unable to calculate market size - Unexpected error',
                 technical_error: `Unexpected state: ${job.progress.marketSizing}`
             };
        }
    } catch (error) {
        console.error(`[Job ${jobId}] Market sizing finalization failed:`, error);
        job.progress.marketSizing = 'failed';
        job.results.marketSize = { 
            status: 'error',
            error: 'Market sizing finalization failed: ' + error.message,
            display_message: 'Unable to finalize market size calculation',
            technical_error: `Finalization error: ${error.message}`
        };
    }
    await updateJob(job);

    // Step 7: Generate AI-powered recommendation
    console.log(`[Job ${jobId}] Generating AI-powered recommendation...`);
    await runRecommendationEngine(job);

    // Mark job as complete regardless of individual analysis failures
    // Users can still see partial results
    const completedAnalyses = [];
    const failedAnalyses = [];
    
    // Check which analyses completed successfully
    if (job.progress.classification === 'complete') completedAnalyses.push('Classification');
    if (job.progress.segmentation === 'complete') completedAnalyses.push('Segmentation');
    if (job.progress.problemValidation === 'complete') completedAnalyses.push('Problem Validation');
    else if (job.progress.problemValidation === 'failed') failedAnalyses.push('Problem Validation');
    if (job.progress.competition === 'complete') completedAnalyses.push('Competition Analysis');
    else if (job.progress.competition === 'failed') failedAnalyses.push('Competition Analysis');
    if (job.progress.marketSizing === 'complete') completedAnalyses.push('Market Sizing');
    else if (job.progress.marketSizing === 'failed') failedAnalyses.push('Market Sizing');
    if (job.progress.recommendation === 'complete') completedAnalyses.push('Recommendation');
    else if (job.progress.recommendation === 'failed') failedAnalyses.push('Recommendation');

    job.status = 'complete';
    job.summary = {
        completed_analyses: completedAnalyses,
        failed_analyses: failedAnalyses,
        total_analyses: completedAnalyses.length + failedAnalyses.length,
        success_rate: `${completedAnalyses.length}/${completedAnalyses.length + failedAnalyses.length}`
    };
    
    if (failedAnalyses.length > 0) {
        console.log(`[Job ${jobId}] Job completed with ${failedAnalyses.length} failed analyses: ${failedAnalyses.join(', ')}`);
    } else {
        console.log(`[Job ${jobId}] All analyses completed successfully.`);
    }

  } catch (error) {
    // This top-level catch handles critical failures (like initial classification or segmentation)
    console.error(`[Job ${jobId}] Critical failure in processEverything:`, error);
    
    // Only mark as failed if critical early steps failed
    if (job.progress.classification !== 'complete' || job.progress.segmentation !== 'complete') {
        job.status = 'failed';
        job.error = error.message || 'Critical analysis failed - Classification or Segmentation could not complete';
    } else {
        // If classification and segmentation worked, still mark as complete so user can see partial results
        job.status = 'complete';
        job.error = `Non-critical error occurred: ${error.message}`;
        job.summary = {
            completed_analyses: ['Classification', 'Segmentation'],
            failed_analyses: ['Remaining analyses failed due to system error'],
            total_analyses: 6,
            success_rate: '2/6',
            critical_error: error.message
        };
    }
  }
  await updateJob(job); // Final update
}

async function runRecommendationEngine(job) {
  job.progress.recommendation = 'processing';
  console.log(`[Job ${job.id}] Running AI-powered recommendation engine...`);
  await updateJob(job);

  try {
    // Prepare analysis data for recommendation engine
    const analysisData = {
      businessIdea: job.input.businessIdea,
      problemStatement: job.input.problemStatement,
      classification: job.results.classification,
      segmentation: job.results.segmentation,
      marketSize: job.results.marketSize,
      competition: job.results.competition,
      problemValidation: job.results.problemValidation
    };

    const response = await openai.chat.completions.create({
      model: 'gpt-4o', // Updated model
      messages: [
        {
          role: 'system',
          content: `You are an expert business analyst. Analyze the following business idea and provide constructive feedback in JSON format.

The response should include:
{
  "viability_score": 1-10,
  "strengths": ["strength1", "strength2"],
  "weaknesses": ["weakness1", "weakness2"], 
  "opportunities": ["opportunity1", "opportunity2"],
  "threats": ["threat1", "threat2"],
  "recommendations": ["recommendation1", "recommendation2"],
  "market_potential": "High/Medium/Low with explanation",
  "implementation_difficulty": "Easy/Medium/Hard with explanation"
}`
        },
        {
          role: 'user',
          content: `Please analyze this business idea: ${job.input.businessIdea}`
        }
      ],
      temperature: 0.3,
      max_tokens: 1500
    });

    job.results.recommendation = response.choices[0].message.content;
    job.progress.recommendation = 'complete';
    console.log(`[Job ${job.id}] Recommendation complete`);

  } catch (error) {
    console.error(`[Job ${job.id}] Recommendation engine failed:`, error);
    job.progress.recommendation = 'failed';
    
    // Provide helpful error message based on error type
    let displayMessage = 'Unable to generate recommendation';
    if (error.code === 'insufficient_quota') {
      displayMessage = 'Unable to generate recommendation - API quota exceeded';
    } else if (error.code === 'rate_limit_exceeded') {
      displayMessage = 'Unable to generate recommendation - Too many requests';
    } else if (error.response?.status === 401) {
      displayMessage = 'Unable to generate recommendation - Authentication error';
    } else if (error.response?.status >= 500) {
      displayMessage = 'Unable to generate recommendation - OpenAI service error';
    } else if (error.code === 'ETIMEDOUT') {
      displayMessage = 'Unable to generate recommendation - Request timed out';
    }
    
    job.results.recommendation = { 
      status: 'error',
      error: error.message,
      display_message: displayMessage,
      fallback_recommendation: {
        viability_score: 'Unable to assess',
        strengths: ['Analysis incomplete due to system error'],
        weaknesses: ['Comprehensive analysis unavailable'],
        opportunities: ['Manual analysis recommended'],
        threats: ['System limitations may affect completeness'],
        recommendations: ['Consider running analysis again', 'Seek alternative business analysis tools'],
        market_potential: 'Unable to determine due to system error',
        implementation_difficulty: 'Unable to assess'
      },
      technical_error: `${error.code || 'UNKNOWN'}: ${error.message}`
    };
  }
  await updateJob(job);
}

// Helper function to update job state
async function updateJob(job) {
  if (!job || !job.id) {
    console.warn("Attempted to update invalid job object.");
    return;
  }
  jobs[job.id] = { ...jobs[job.id], ...job }; // Merge updates into the stored job
  // console.log(`[Job ${job.id}] Updated. Status: ${jobs[job.id].status}, Progress: ${JSON.stringify(jobs[job.id].progress)}`);
}

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`What's popping homie`);
});
console.log('Called listen()');

// Clean up old jobs periodically (every hour)
setInterval(() => {
  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  
  Object.keys(jobs).forEach(jobId => {
    if (jobs[jobId].createdAt < oneDayAgo) {
      console.log(`Cleaning up old job ${jobId}`);
      delete jobs[jobId];
    }
  });
}, 60 * 60 * 1000);