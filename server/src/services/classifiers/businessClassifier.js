/**
 * Business Idea Classifier
 * 
 * A hybrid classification system that uses multiple approaches in sequence:
 * 1. OpenAI GPT-4o with few-shot learning
 * 2. Anthropic Claude as fallback
 * 3. Rule-based classification as final fallback
 */

const { classifyWithOpenAI } = require('./openAIClassifier');
const { classifyWithAnthropic } = require('./anthropicClassifier');
const { classifyWithRules } = require('./ruleBasedClassifier');
const { sanitizeInput } = require('./utils');

/**
 * Classify a business idea using a hybrid approach
 * 
 * @param {string} businessDescription - User's description of their business idea
 * @param {Object} options - Classification options
 * @param {boolean} options.includeReasoning - Whether to include reasoning in the response
 * @returns {Promise<Object>} Classification result with industry, audience, and product types
 */
async function classifyBusinessIdea(businessDescription, options = {}) {
  try {
    const { includeReasoning = true } = options;
    const sanitizedDescription = sanitizeInput(businessDescription);
    
    let rawResult = null;
    let error = null;
    let classificationMethod = 'unknown';

    // Step 1: Try OpenAI first
    try {
      console.log('Attempting classification with OpenAI');
      rawResult = await classifyWithOpenAI(sanitizedDescription, { includeReasoning });
      if (rawResult && rawResult.classification && rawResult.classification.primaryIndustry) { // More specific check
        console.log('Successfully classified with OpenAI');
        classificationMethod = rawResult.method || 'openai';
      } else {
        throw new Error("OpenAI returned unexpected structure or missing primaryIndustry.")
      }
    } catch (err) {
      console.error('OpenAI classification failed:', err.message);
      error = err;
      rawResult = null; 
    }
    
    // Step 2: If OpenAI fails or returns bad structure, try Anthropic
    if (!rawResult?.classification?.primaryIndustry && error) { // Check for primaryIndustry
      try {
        console.log('Falling back to Anthropic classification');
        rawResult = await classifyWithAnthropic(sanitizedDescription, { includeReasoning });
        if (rawResult && rawResult.classification && rawResult.classification.primaryIndustry) { 
            console.log('Successfully classified with Anthropic');
            classificationMethod = rawResult.method || 'anthropic';
            error = null; 
        } else {
            throw new Error("Anthropic returned unexpected structure or missing primaryIndustry.")
        }
      } catch (err) {
        console.error('Anthropic classification failed:', err.message);
        error = err; 
        rawResult = null; 
      }
    }
    
    // Step 3: Final fallback to rule-based approach
    if (!rawResult?.classification?.primaryIndustry && error) { 
      try {
        console.log('Falling back to rule-based classification');
        const ruleResult = await classifyWithRules(sanitizedDescription);
        if (ruleResult && ruleResult.primaryIndustry) { 
            rawResult = {
                classification: ruleResult, 
                method: 'rule-based',
                confidence: 'medium' 
            };
            console.log('Successfully classified with rule-based approach');
            classificationMethod = 'rule-based'; // Already set by rawResult.method
            error = null; // Clear error if rule-based succeeds
        } else {
            throw new Error("Rule-based classification returned unexpected structure or missing primaryIndustry.");
        }
      } catch (err) {
        console.error('Rule-based classification failed:', err.message);
        rawResult = null; 
        error = new Error('All classification methods failed. Last error: ' + err.message);
      }
    }

    if (!rawResult || !rawResult.classification || !rawResult.classification.primaryIndustry) {
      console.error("All classification attempts failed to produce a valid result. Final error:", error?.message, "Last rawResult:", rawResult);
      throw error || new Error('Classification failed: Unable to determine classification after all fallbacks.');
    }
    
    const finalResult = {
      ...rawResult.classification, 
      method: classificationMethod,      
      confidence: rawResult.confidence,  
      reasoning: rawResult.reasoning     
    };

    return finalResult;

  } catch (error) {
    console.error('Critical error in classifyBusinessIdea pipeline:', error.message);
    // Ensure a consistent error structure or rethrow the original error
    // For now, rethrowing to be caught by runFullTest
    throw error; 
  }
}

/**
 * Get available classification methods
 * @returns {Array<string>} List of available classification methods
 */
function getAvailableClassifiers() {
  return ['openai', 'anthropic', 'rule-based'];
}

module.exports = {
  classifyBusinessIdea,
  getAvailableClassifiers
};