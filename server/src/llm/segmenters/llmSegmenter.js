/**
 * LLM-based Customer Segmentation
 * 
 * This module uses LLMs to identify customer segments based on
 * business description and classification data.
 */

const { OpenAI } = require('openai');
const Anthropic = require('@anthropic-ai/sdk');
const { getSegmentationExamples } = require('./examples');
const { parseSegmentationResponse } = require('./utils');

// Initialize API clients
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * Identify customer segments using LLM analysis
 * 
 * @param {string} businessDescription - Description of the business
 * @param {Object} classification - Business classification data
 * @param {Object} options - Segmentation options
 * @returns {Promise<Object>} Identified customer segments
 */
async function identifySegmentsWithLLM(businessDescription, classification, options) {
  try {
    // Try OpenAI first
    try {
      console.log('Attempting segmentation with OpenAI...');
      const result = await identifySegmentsWithOpenAI(businessDescription, classification, options);
      console.log('Successfully segmented with OpenAI');
      return result;
    } catch (err) {
      console.error('OpenAI segmentation failed:', err.message);
      
      // Fall back to Anthropic
      console.log('Falling back to Anthropic for segmentation...');
      const result = await identifySegmentsWithAnthropic(businessDescription, classification, options);
      console.log('Successfully segmented with Anthropic');
      return result;
    }
  } catch (error) {
    console.error('All LLM segmentation methods failed:', error.message);
    throw new Error(`Customer segmentation failed: ${error.message}`);
  }
}

/**
 * Identify segments using OpenAI
 * 
 * @param {string} businessDescription - Business description
 * @param {Object} classification - Business classification
 * @param {Object} options - Segmentation options
 * @returns {Promise<Object>} Segmentation results
 */
async function identifySegmentsWithOpenAI(businessDescription, classification, options) {
  const { numberOfSegments, includeExcludedSegments } = options;
  
  // Create system prompt
  const systemPrompt = createSystemPrompt(numberOfSegments, includeExcludedSegments);
  
  // Create user prompt with examples
  const userPrompt = createUserPrompt(businessDescription, classification, getSegmentationExamples());

  // Set timeout to prevent hanging requests
  const timeoutMs = 30000; // 30 seconds
  const timeoutPromise = new Promise((_, reject) => 
    setTimeout(() => reject(new Error('OpenAI request timed out')), timeoutMs)
  );
  
  // Make the OpenAI request with a timeout
  const openAIPromise = openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.7, // Slightly higher to encourage creative segment identification
    max_tokens: 2500
  });
  
  // Race between the API call and the timeout
  const response = await Promise.race([openAIPromise, timeoutPromise]);
  
  // Parse the response content
  const content = response.choices[0].message.content;
  
  // Parse the segmentation from the response
  return parseSegmentationResponse(content);
}

/**
 * Identify segments using Anthropic
 * 
 * @param {string} businessDescription - Business description
 * @param {Object} classification - Business classification
 * @param {Object} options - Segmentation options
 * @returns {Promise<Object>} Segmentation results
 */
async function identifySegmentsWithAnthropic(businessDescription, classification, options) {
  const { numberOfSegments, includeExcludedSegments } = options;
  
  // Create system prompt
  const systemPrompt = createSystemPrompt(numberOfSegments, includeExcludedSegments);
  
  // Create user prompt with examples
  const userPrompt = createUserPrompt(businessDescription, classification, getSegmentationExamples());

  // Set timeout to prevent hanging requests
  const timeoutMs = 40000; // 40 seconds
  const timeoutPromise = new Promise((_, reject) => 
    setTimeout(() => reject(new Error('Anthropic request timed out')), timeoutMs)
  );
  
  // Make the Anthropic request with a timeout
  const anthropicPromise = anthropic.messages.create({
    model: 'claude-3-5-sonnet-20240620',
    system: systemPrompt,
    messages: [
      { role: 'user', content: userPrompt }
    ],
    max_tokens: 3000,
    temperature: 0.7
  });
  
  // Race between the API call and the timeout
  const response = await Promise.race([anthropicPromise, timeoutPromise]);
  
  // Parse the response content
  const content = response.content[0].text;
  
  // Parse the segmentation from the response
  return parseSegmentationResponse(content);
}

/**
 * Create the system prompt for segmentation
 * 
 * @param {number} numberOfSegments - Target number of segments
 * @param {boolean} includeExcludedSegments - Whether to include excluded segments
 * @returns {string} System prompt
 */
function createSystemPrompt(numberOfSegments, includeExcludedSegments) {
  return `You are an expert market research analyst specializing in customer segmentation.

Your task is to identify realistic and actionable customer segments for a business based on the provided business description and classification.

For each segmentation analysis, provide:

1. ${numberOfSegments} primary customer segments that would be the core target markets
2. ${numberOfSegments > 1 ? '1-2' : '1'} secondary/niche segments that might be worth exploring
${includeExcludedSegments ? '3. 1-2 segments that should be explicitly excluded and why' : ''}
4. Overall market insights regarding the segments

Follow this systematic analysis process:

STEP 1: DEMOGRAPHIC ANALYSIS
- Identify realistic age ranges, income levels, education levels, geographic locations, etc.
- Ensure demographics align with the business's industry and product type
- Consider which demographic factors are most relevant to this specific business

STEP 2: PSYCHOGRAPHIC ANALYSIS
- Identify relevant values, beliefs, lifestyle elements, personality traits, etc.
- Connect psychographics to the business's value proposition
- Consider which psychographic factors would drive adoption and loyalty

STEP 3: BEHAVIORAL ANALYSIS
- Determine how each segment would interact with the product/service
- Identify purchase patterns, usage habits, decision factors, and price sensitivity
- Consider how early adopters might differ from mainstream customers

STEP 4: NEEDS-BASED ANALYSIS
- Identify specific problems and pain points for each segment
- Connect customer needs to the business's solutions
- Consider unstated needs that might impact adoption

STEP 5: SEGMENT PRIORITIZATION
- Evaluate segment size, growth potential, and fit with the business model
- Consider acquisition challenges and costs for each segment
- Rank segments by potential value and strategic importance

Your analysis should be data-driven, realistic, and actionable. Avoid overly general segments like "everyone who needs X" or segments that are too narrow to be commercially viable.`;
}

/**
 * Create the user prompt for segmentation
 * 
 * @param {string} businessDescription - Description of the business
 * @param {Object} classification - Business classification
 * @param {Array} examples - Few-shot examples
 * @returns {string} User prompt
 */
function createUserPrompt(businessDescription, classification, examples) {
  const { primaryIndustry, secondaryIndustry, targetAudience, productType } = classification;

  let prompt = `Here are some examples of good customer segmentation analyses for different businesses:\n\n`;

  // Add few-shot examples
  examples.forEach((example, index) => {
    prompt += `Example ${index + 1}:\n`;
    prompt += `Business Description: ${example.businessDescription}\n`;
    prompt += `Classification: Primary Industry: ${example.classification.primaryIndustry}, `;
    prompt += `Secondary Industry: ${example.classification.secondaryIndustry || 'None'}, `;
    prompt += `Target Audience: ${example.classification.targetAudience}, `;
    prompt += `Product Type: ${example.classification.productType}\n\n`;
    prompt += `Segmentation Analysis:\n${example.segmentationAnalysis}\n\n`;
  });

  // Add the current business
  prompt += `Now, please perform a customer segmentation analysis for the following business:\n\n`;
  prompt += `Business Description: ${businessDescription}\n\n`;
  prompt += `Classification: Primary Industry: ${primaryIndustry}, `;
  prompt += `Secondary Industry: ${secondaryIndustry || 'None'}, `;
  prompt += `Target Audience: ${targetAudience}, `;
  prompt += `Product Type: ${productType}\n\n`;

  prompt += `Please provide a detailed segmentation analysis following the format shown in the examples. Ensure your customer segments are realistic, specific, and actionable. Include rich details about demographics, psychographics, behaviors, and needs for each segment.`;

  return prompt;
}

module.exports = {
  identifySegmentsWithLLM,
  identifySegmentsWithOpenAI,
  identifySegmentsWithAnthropic
};