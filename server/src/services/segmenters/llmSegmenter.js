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
      
      // First get a text response for better excluded segments extraction
      const textResult = await getOpenAITextResponse(businessDescription, classification, options);
      const textBasedSegments = parseSegmentationResponse(textResult);
      
      // Then get a more structured JSON response for primary segments
      let jsonResult = await identifySegmentsWithOpenAI(businessDescription, classification, options);
      
      // Post-process the result to filter out empty segments
      if (jsonResult.primarySegments) {
        jsonResult.primarySegments = jsonResult.primarySegments.filter(segment => {
          // Check if the segment has actual content
          return segment.description && 
                 segment.description.trim() !== '' && 
                 segment.percentage !== null;
        });
      }
      
      // If we found excluded segments in the text but not in the JSON, merge them
      if ((!jsonResult.excludedSegments || jsonResult.excludedSegments.length === 0) && 
          textBasedSegments.excludedSegments && 
          textBasedSegments.excludedSegments.length > 0) {
        console.log('Using excluded segments from text response');
        jsonResult.excludedSegments = textBasedSegments.excludedSegments;
      }
      
      console.log('Successfully segmented with OpenAI');
      return jsonResult;
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
 * Get a free-form text response from OpenAI
 * This is good for extracting excluded segments which sometimes get missed in JSON
 * 
 * @param {string} businessDescription - Business description
 * @param {Object} classification - Business classification
 * @param {Object} options - Segmentation options
 * @returns {Promise<string>} Raw text response
 */
async function getOpenAITextResponse(businessDescription, classification, options) {
  const { numberOfSegments, includeExcludedSegments } = options;
  
  // Create system prompt
  const systemPrompt = createSystemPrompt(numberOfSegments, includeExcludedSegments);
  
  // Create user prompt with examples
  const userPrompt = createUserPrompt(businessDescription, classification, getSegmentationExamples());

  // Set timeout to prevent hanging requests
  const timeoutMs = 30000; // 30 seconds
  const timeoutPromise = new Promise((_, reject) => 
    setTimeout(() => reject(new Error('OpenAI text request timed out')), timeoutMs)
  );
  
  // Make the OpenAI request with a timeout - using text format
  const textPromise = openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.4,
    max_tokens: 2500
  });
  
  // Race between the API call and the timeout
  const response = await Promise.race([textPromise, timeoutPromise]);
  
  // Return the raw text content
  return response.choices[0].message.content;
}

/**
 * Identify segments using OpenAI with JSON formatting
 * 
 * @param {string} businessDescription - Business description
 * @param {Object} classification - Business classification
 * @param {Object} options - Segmentation options
 * @returns {Promise<Object>} Segmentation results
 */
async function identifySegmentsWithOpenAI(businessDescription, classification, options) {
  const { numberOfSegments, includeExcludedSegments } = options;
  
  try {
    // Create system prompt with explicit JSON schema
    const jsonSystemPrompt = `You are an expert market research analyst specializing in customer segmentation.

Your task is to identify ${numberOfSegments} realistic and actionable customer segments for a business based on the provided business description and classification.

For each segment, ONLY analyze these FOUR specific factors (no others):
1. DEMOGRAPHICS: Who they are (age, income, education, occupation, etc.)
2. PSYCHOGRAPHICS: Values, attitudes, interests, and lifestyle characteristics
3. PROBLEMS & NEEDS: Specific pain points and needs this segment has
4. BEHAVIORS: How they would interact with the product/service

${includeExcludedSegments ? 'After describing the target segments, include 1-2 segments that should explicitly not be targeted, with clear reasons why.' : ''}

FORMAT YOUR RESPONSE AS A VALID JSON OBJECT WITH THIS EXACT STRUCTURE:
{
  "primarySegments": [
    {
      "name": "Segment Name",
      "description": "Brief overview description",
      "percentage": 40,
      "characteristics": {
        "demographics": ["point 1", "point 2", "point 3"],
        "psychographics": ["point 1", "point 2", "point 3"],
        "problemsNeeds": ["point 1", "point 2", "point 3"],
        "behaviors": ["point 1", "point 2", "point 3"]
      },
      "growthPotential": "High"
    }
  ],
  "excludedSegments": [
    {
      "name": "Excluded Segment Name",
      "reason": "Detailed reason why this segment should be avoided"
    }
  ]
}

The JSON must be valid and contain both arrays even if excludedSegments is empty. Do not include any text outside the JSON object.`;
    
    // Create user prompt for JSON
    const jsonUserPrompt = createUserPrompt(businessDescription, classification, []);
    
    // Set timeout to prevent hanging requests
    const timeoutMs = 30000; // 30 seconds
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('OpenAI JSON request timed out')), timeoutMs)
    );
    
    // Make the OpenAI request with a timeout - using JSON format
    const jsonPromise = openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: jsonSystemPrompt },
        { role: 'user', content: jsonUserPrompt }
      ],
      temperature: 0.4, // Lower for more consistent formatting
      response_format: { type: "json_object" }, // Request JSON output
      max_tokens: 2500
    });
    
    // Race between the API call and the timeout
    const response = await Promise.race([jsonPromise, timeoutPromise]);
    
    // Parse the JSON response
    try {
      return JSON.parse(response.choices[0].message.content);
    } catch (jsonError) {
      console.error('Error parsing JSON response:', jsonError);
      
      // Fall back to standard text parsing
      const content = response.choices[0].message.content;
      return parseSegmentationResponse(content);
    }
  } catch (error) {
    console.error('OpenAI JSON segmentation error:', error);
    throw new Error(`OpenAI JSON segmentation failed: ${error.message}`);
  }
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
  
  try {
    // First get a text-based response
    const systemPrompt = createSystemPrompt(numberOfSegments, includeExcludedSegments);
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
      temperature: 0.4
    });
    
    // Race between the API call and the timeout
    const response = await Promise.race([anthropicPromise, timeoutPromise]);
    
    // Parse the response content
    const content = response.content[0].text;
    const textResult = parseSegmentationResponse(content);
    
    // Now try to get a JSON response for better structure
    const jsonSystemPrompt = `${systemPrompt}

FORMAT YOUR RESPONSE AS A VALID JSON OBJECT WITH THIS EXACT STRUCTURE:
{
  "primarySegments": [
    {
      "name": "Segment Name",
      "description": "Brief overview description",
      "percentage": 40,
      "characteristics": {
        "demographics": ["point 1", "point 2", "point 3"],
        "psychographics": ["point 1", "point 2", "point 3"],
        "problemsNeeds": ["point 1", "point 2", "point 3"],
        "behaviors": ["point 1", "point 2", "point 3"]
      },
      "growthPotential": "High"
    }
  ],
  "excludedSegments": [
    {
      "name": "Excluded Segment Name",
      "reason": "Detailed reason why this segment should be avoided"
    }
  ]
}
The JSON must be valid.`;

    const jsonUserPrompt = `${userPrompt}\n\nPlease format your response as valid JSON matching the schema I've provided.`;
    
    // Get JSON from Anthropic (or try to)
    try {
      const jsonPromise = anthropic.messages.create({
        model: 'claude-3-5-sonnet-20240620',
        system: jsonSystemPrompt,
        messages: [
          { role: 'user', content: jsonUserPrompt }
        ],
        max_tokens: 3000,
        temperature: 0.5
      });
      
      const jsonResponse = await Promise.race([jsonPromise, timeoutPromise]);
      const jsonContent = jsonResponse.content[0].text;
      
      // Try to extract and parse JSON
      const jsonMatch = jsonContent.match(/```json\s*([\s\S]*?)\s*```/) || 
                      jsonContent.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        const jsonString = jsonMatch[0].startsWith('```') ? jsonMatch[1] : jsonMatch[0];
        try {
          const jsonResult = JSON.parse(jsonString);
          
          // If the JSON is missing excluded segments but the text had them, merge
          if ((!jsonResult.excludedSegments || jsonResult.excludedSegments.length === 0) && 
              textResult.excludedSegments && 
              textResult.excludedSegments.length > 0) {
            jsonResult.excludedSegments = textResult.excludedSegments;
          }
          
          return jsonResult;
        } catch (parseError) {
          // If JSON parsing fails, use the text result
          return textResult;
        }
      } else {
        // If no JSON found, use the text result
        return textResult;
      }
    } catch (jsonError) {
      // If JSON request fails, use the text result
      return textResult;
    }
  } catch (error) {
    console.error('Anthropic segmentation error:', error);
    throw new Error(`Anthropic segmentation failed: ${error.message}`);
  }
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

Your task is to identify ${numberOfSegments} realistic and actionable customer segments for a business based on the provided business description and classification.

For each segment, ONLY analyze these FOUR specific factors (no others):
1. DEMOGRAPHICS: Who they are (age, income, education, occupation, etc.)
2. PSYCHOGRAPHICS: Values, attitudes, interests, and lifestyle characteristics
3. PROBLEMS & NEEDS: Specific pain points and needs this segment has
4. BEHAVIORS: How they would interact with the product/service

${includeExcludedSegments ? 'After describing the target segments, include a separate section called "SEGMENTS TO AVOID:" that lists 1-2 segments that should explicitly not be targeted, with clear reasons why.' : ''}

Let's think step by step about each segment. For each segment:
1. First, give the segment a descriptive name and brief 1-2 sentence overview
2. Estimate what percentage of the target market they represent
3. Analyze the four factors (demographics, psychographics, problems/needs, behaviors)
4. Note their growth potential (high, medium, or low)

Keep your analysis concise, specific, and structured exactly as outlined above. Avoid extraneous information.

Your segments should be:
- Distinct from each other with minimal overlap
- Specific enough to be actionable
- Realistic for the business context
- Commercially viable (not too narrow)

${includeExcludedSegments ? 'IMPORTANT: For excluded segments, use the exact heading "SEGMENTS TO AVOID:" and clearly label each excluded segment with "Segment:" followed by the name, and "Reason:" followed by the explanation.' : ''}`;
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

  let prompt = `Let's analyze customer segments for the following business:

Business Description: ${businessDescription}

Classification: 
- Primary Industry: ${primaryIndustry}
- Secondary Industry: ${secondaryIndustry || 'None'}
- Target Audience: ${targetAudience}
- Product Type: ${productType}

Let's think step by step to identify distinct customer segments. For each segment, ONLY analyze these four factors:

1. DEMOGRAPHICS: Who they are (age, income, education, occupation, etc.)
2. PSYCHOGRAPHICS: Values, attitudes, interests, and lifestyle characteristics  
3. PROBLEMS & NEEDS: Specific pain points and needs this segment has
4. BEHAVIORS: How they would interact with the product/service

Use exactly this format for each segment:

SEGMENT: [Descriptive Name]
OVERVIEW: [1-2 sentence description]
MARKET PERCENTAGE: [Estimated % of target market]

DEMOGRAPHICS:
- [Key demographic point 1]
- [Key demographic point 2]
- [Key demographic point 3]

PSYCHOGRAPHICS:
- [Key psychographic point 1]
- [Key psychographic point 2]
- [Key psychographic point 3]

PROBLEMS & NEEDS:
- [Key problem/need 1]
- [Key problem/need 2]
- [Key problem/need 3]

BEHAVIORS:
- [Key behavior 1]
- [Key behavior 2]
- [Key behavior 3]

GROWTH POTENTIAL: [High/Medium/Low]

Please identify distinct segments and be specific about their characteristics. Make sure they represent realistic and viable market segments.`;

  return prompt;
}


module.exports = {
  identifySegmentsWithLLM,
  identifySegmentsWithOpenAI,
  identifySegmentsWithAnthropic,
  getOpenAITextResponse // Export this function for testing
};