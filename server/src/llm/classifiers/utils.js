/**
 * Utility functions for business idea classification
 */

/**
 * Sanitizes the input business description
 * 
 * @param {string} text - Raw business description
 * @returns {string} Sanitized description
 */
function sanitizeInput(text) {
  if (!text || typeof text !== 'string') {
    throw new Error('Business description must be a non-empty string');
  }
  
  // Trim whitespace and limit length
  let sanitized = text.trim();
  
  if (sanitized.length === 0) {
    throw new Error('Business description cannot be empty');
  }
  
  if (sanitized.length > 2000) {
    sanitized = sanitized.substring(0, 2000) + '...';
  }
  
  // Remove any potential prompt injection attempts
  sanitized = sanitized
    .replace(/you are a/gi, 'the business is a')
    .replace(/ignore previous/gi, '')
    .replace(/ignore above/gi, '')
    .replace(/system prompt/gi, 'business description')
    .replace(/ignore instructions/gi, '');
  
  return sanitized;
}

/**
 * Parses classification response from LLM output
 * 
 * @param {string} responseText - Raw response from the LLM
 * @param {boolean} includeReasoning - Whether to extract reasoning from response
 * @returns {Object} Structured classification data
 */
function parseClassificationResponse(responseText, includeReasoning = true) {
  if (!responseText) {
    throw new Error('Empty response from classifier');
  }
  
  try {
    let classification = {};
    let reasoning = '';
    let method = 'llm';
    
    // Extract the reasoning section if present - enhanced for structured CoT format
    if (includeReasoning) {
      // Try to extract each analysis section individually
      const industryAnalysis = responseText.match(/INDUSTRY ANALYSIS:[\s\S]*?(?=TARGET AUDIENCE ANALYSIS:|$)/i);
      const audienceAnalysis = responseText.match(/TARGET AUDIENCE ANALYSIS:[\s\S]*?(?=PRODUCT TYPE ANALYSIS:|$)/i);
      const productAnalysis = responseText.match(/PRODUCT TYPE ANALYSIS:[\s\S]*?(?=REVIEW AND FINAL DECISION:|CLASSIFICATION:|$)/i);
      const finalReview = responseText.match(/REVIEW AND FINAL DECISION:[\s\S]*?(?=CLASSIFICATION:|$)/i);
      
      // Combine all available reasoning sections
      let reasoningParts = [];
      
      if (industryAnalysis) {
        reasoningParts.push(industryAnalysis[0].trim());
      }
      
      if (audienceAnalysis) {
        reasoningParts.push(audienceAnalysis[0].trim());
      }
      
      if (productAnalysis) {
        reasoningParts.push(productAnalysis[0].trim());
      }
      
      if (finalReview) {
        reasoningParts.push(finalReview[0].trim());
      }
      
      if (reasoningParts.length > 0) {
        reasoning = reasoningParts.join('\n\n');
      } else {
        // Fall back to the legacy extraction method if structured format not found
        const thinkingMatch = responseText.match(/Thinking Process:[\s\S]*?(?=Classification:|$)/i) || 
                              responseText.match(/Step-by-step reasoning:[\s\S]*?(?=Classification:|$)/i) ||
                              responseText.match(/(?:First,[\s\S]*?)(?=Classification:|Industry:|$)/i);
        
        if (thinkingMatch) {
          reasoning = thinkingMatch[0].replace(/Thinking Process:|Step-by-step reasoning:/i, '').trim();
        }
      }
    }
    
    // Extract primary industry
    const primaryIndustryMatch = responseText.match(/Primary Industry:[\s\n]*([^\n]+)/i) || 
                                responseText.match(/Industry:[\s\n]*([^\n]+)/i); // Fallback for compatibility
    const primaryIndustry = primaryIndustryMatch ? primaryIndustryMatch[1].trim() : null;
    
    // Extract secondary industry
    const secondaryIndustryMatch = responseText.match(/Secondary Industry:[\s\n]*([^\n]+)/i);
    let secondaryIndustry = null;
    if (secondaryIndustryMatch) {
      const value = secondaryIndustryMatch[1].trim();
      // Only set secondary industry if it's not "None" or "N/A"
      if (value && !['none', 'n/a', 'not applicable'].includes(value.toLowerCase())) {
        secondaryIndustry = value;
      }
    }
    
    // Extract target audience
    const audienceMatch = responseText.match(/Target Audience:[\s\n]*([^\n]+)/i);
    const targetAudience = audienceMatch ? audienceMatch[1].trim() : null;
    
    // Extract product type
    const productMatch = responseText.match(/Product Type:[\s\n]*([^\n]+)/i);
    const productType = productMatch ? productMatch[1].trim() : null;
    
    // Check if we extracted all required fields
    if (!primaryIndustry || !targetAudience || !productType) {
      throw new Error('Failed to parse complete classification from response');
    }
    
    // Construct the result object
    classification = {
      primaryIndustry,
      secondaryIndustry,
      targetAudience,
      productType
    };
    
    const result = {
      classification,
      method,
      confidence: 'high' // LLMs generally have high confidence
    };
    
    // Add reasoning if requested
    if (includeReasoning && reasoning) {
      result.reasoning = reasoning;
    }
    
    return result;
    
  } catch (error) {
    console.error('Error parsing classification response:', error, 'Response:', responseText);
    throw new Error(`Failed to parse classification response: ${error.message}`);
  }
}

module.exports = {
  sanitizeInput,
  parseClassificationResponse
};