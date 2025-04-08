// src/services/businessAnalyzer.js
const { classifyBusinessIdea } = require('./classifiers/businessClassifier');
const { identifySegmentsWithLLM } = require('./segmenters/llmSegmenter');
const { researchMarketSize, analyzeCompetition, validateProblem } = require('./marketResearch');
const { calculateMarketSizing } = require('./marketSizingCalculator');
const { generateRecommendation } = require('./recommendationEngine');

/**
 * Analyze a business idea comprehensively
 * @param {string} description - The business idea description
 * @param {Object} options - Analysis options
 * @returns {Promise<Object>} Complete business analysis
 */
async function analyzeBusinessIdea(description, options = {}) {
  try {
    // Default options
    const {
      segmentCount = 3,
      problemStatement = null,
      includeMarketSize = true,
      includeCompetition = true,
      includeProblemValidation = true
    } = options;
    
    // Step 1: Classify the business
    console.log("Classifying business idea...");
    const classification = await classifyBusinessIdea(description);
    console.log("Classification complete:", classification);
    
    // Step 2: Identify customer segments
    console.log("Identifying customer segments...");
    const segmentation = await identifySegmentsWithLLM(
      description, 
      classification,
      { numberOfSegments: segmentCount }
    );
    console.log(`Identified ${segmentation.primarySegments.length} customer segments`);
    
    // Step 3: Initialize results object
    const result = {
      classification,
      segmentation,
      marketSize: null,
      competition: null,
      problemValidation: null,
      recommendation: null
    };
    
    // Step 4: Run selected analyses in parallel
    const analysisTasks = [];
    
    if (includeMarketSize) {
      analysisTasks.push(
        researchMarketSize(
          description, 
          classification.primaryIndustry, 
          classification.productType
        ).then(data => {
          result.marketSize = calculateMarketSizing(data, segmentation);
          console.log("Market sizing complete");
        }).catch(err => {
          console.error("Market sizing failed:", err.message);
          result.marketSize = { error: err.message };
        })
      );
    }
    
    if (includeCompetition) {
      analysisTasks.push(
        analyzeCompetition(
          description,
          classification.primaryIndustry,
          classification.productType
        ).then(data => {
          result.competition = data;
          console.log(`Identified ${data.competitors?.length || 0} competitors`);
        }).catch(err => {
          console.error("Competition analysis failed:", err.message);
          result.competition = { error: err.message };
        })
      );
    }
    
    if (includeProblemValidation && problemStatement) {
      analysisTasks.push(
        validateProblem(
          description,
          classification.primaryIndustry,
          problemStatement
        ).then(data => {
          result.problemValidation = data;
          const severity = data.problem_validation?.severity || 0;
          console.log(`Problem validation complete (severity: ${severity}/10)`);
        }).catch(err => {
          console.error("Problem validation failed:", err.message);
          result.problemValidation = { error: err.message };
        })
      );
    }
    
    // Wait for all tasks to complete
    await Promise.all(analysisTasks);
    
    // Step 5: Generate recommendation
    result.recommendation = generateRecommendation(result);
    
    return result;
  } catch (error) {
    console.error('Business analysis failed:', error);
    throw error;
  }
}

/**
 * Generates a problem statement based on business description
 * @param {string} description - Business idea description
 * @returns {Promise<string>} Problem statement
 */
async function generateProblemStatement(description) {
  // This is a placeholder - in a real implementation,
  // you'd use an LLM to extract a problem statement
  
  // For now, we'll extract a simple problem statement from the description
  const problemPatterns = [
    /solve(?:s|d)?\s+(.+?)\s+(?:for|when|by)/i,
    /address(?:es|ed)?\s+(.+?)\s+(?:for|when|by)/i,
    /problem(?:s)?\s+(?:of|with)\s+(.+?)(?:\.|\s+by)/i
  ];
  
  for (const pattern of problemPatterns) {
    const match = description.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  
  // Default generic problem statement
  return `Users struggle with inefficiencies related to ${description.split(' ').slice(0, 5).join(' ')}...`;
}

module.exports = {
  analyzeBusinessIdea,
  generateProblemStatement
};