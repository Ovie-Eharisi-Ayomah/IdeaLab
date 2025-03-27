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
    const { 
      includeReasoning = true
    } = options;
    
    // Sanitize input
    const sanitizedDescription = sanitizeInput(businessDescription);
    
    // Start the classification cascade
    let result = null;
    let error = null;
    
    // Step 1: Try OpenAI first
    try {
      console.log('Attempting classification with OpenAI');
      result = await classifyWithOpenAI(sanitizedDescription, { includeReasoning });
      console.log('Successfully classified with OpenAI');
    } catch (err) {
      console.error('OpenAI classification failed:', err.message);
      error = err;
    }
    
    // Step 2: If OpenAI fails, try Anthropic
    if (!result && error) {
      try {
        console.log('Falling back to Anthropic classification');
        result = await classifyWithAnthropic(sanitizedDescription, { includeReasoning });
        console.log('Successfully classified with Anthropic');
        error = null;
      } catch (err) {
        console.error('Anthropic classification failed:', err.message);
        error = err;
      }
    }
    
    // Step 3: Final fallback to rule-based approach
    if (!result && error) {
      try {
        console.log('Falling back to rule-based classification');
        result = await classifyWithRules(sanitizedDescription);
        console.log('Successfully classified with rule-based approach');
      } catch (err) {
        console.error('All classification methods failed:', err.message);
        throw new Error('Classification failed with all methods');
      }
    }
    
    return result;
  } catch (error) {
    console.error('Classification error:', error);
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