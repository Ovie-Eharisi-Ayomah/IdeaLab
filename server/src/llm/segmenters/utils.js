/**
 * Utility functions for customer segmentation
 */

/**
 * Parse segmentation response from LLM
 * 
 * @param {string} responseText - Raw response from LLM
 * @returns {Object} Structured segmentation data
 */
function parseSegmentationResponse(responseText) {
  try {
    // This is a simplified parser - in production you would want more robust parsing
    // with error handling for various response formats
    
    // Try to extract JSON if the LLM happened to output valid JSON
    const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch && jsonMatch[1]) {
      try {
        const parsed = JSON.parse(jsonMatch[1]);
        if (isValidSegmentationObject(parsed)) {
          return parsed;
        }
      } catch (e) {
        console.log('Failed to parse JSON from response, falling back to text parsing');
      }
    }
    
    // Otherwise, parse the text response
    const segments = {
      primarySegments: [],
      secondarySegments: [],
      excludedSegments: [],
      marketInsights: {}
    };
    
    // Extract primary segments
    const primarySegmentsMatch = responseText.match(/PRIMARY SEGMENTS?:([\s\S]*?)(?:SECONDARY SEGMENTS?:|EXCLUDED SEGMENTS?:|MARKET INSIGHTS?:|$)/i);
    if (primarySegmentsMatch) {
      const primarySegmentsText = primarySegmentsMatch[1].trim();
      const segmentBlocks = primarySegmentsText.split(/\n\s*\d+\.\s+|\n\s*-\s+/).filter(s => s.trim());
      
      segmentBlocks.forEach(block => {
        if (!block.trim()) return;
        
        const nameMatch = block.match(/^([^:]+?)(?::|-)?\s+(.+?)(?:\n|$)/);
        const name = nameMatch ? nameMatch[1].trim() : 'Unnamed Segment';
        const description = extractDescriptionFromBlock(block);
        const percentageMatch = block.match(/(?:percentage|market share|share of market|proportion):\s*(\d+(?:\.\d+)?)\s*%?/i);
        
        const demographicsMatch = block.match(/demographics?:([^]*?)(?:psychographics?:|behaviors?:|needs?:|growth potential:|acquisition|$)/i);
        const psychographicsMatch = block.match(/psychographics?:([^]*?)(?:demographics?:|behaviors?:|needs?:|growth potential:|acquisition|$)/i);
        const behaviorsMatch = block.match(/behaviors?:([^]*?)(?:demographics?:|psychographics?:|needs?:|growth potential:|acquisition|$)/i);
        
        segments.primarySegments.push({
          name,
          description,
          percentage: percentageMatch ? parseFloat(percentageMatch[1]) : null,
          characteristics: {
            demographics: demographicsMatch ? extractKeyValuePairs(demographicsMatch[1]) : {},
            psychographics: psychographicsMatch ? extractKeyValuePairs(psychographicsMatch[1]) : {},
            behaviors: behaviorsMatch ? extractKeyValuePairs(behaviorsMatch[1]) : {}
          }
        });
      });
    }
    
    // Extract secondary segments
    const secondarySegmentsMatch = responseText.match(/SECONDARY SEGMENTS?:([\s\S]*?)(?:PRIMARY SEGMENTS?:|EXCLUDED SEGMENTS?:|MARKET INSIGHTS?:|$)/i);
    if (secondarySegmentsMatch) {
      const secondarySegmentsText = secondarySegmentsMatch[1].trim();
      const segmentBlocks = secondarySegmentsText.split(/\n\s*\d+\.\s+|\n\s*-\s+/).filter(s => s.trim());
      
      segmentBlocks.forEach(block => {
        if (!block.trim()) return;
        
        const nameMatch = block.match(/^([^:]+?)(?::|-)?\s*(.+?)(?:\n|$)/);
        const name = nameMatch ? nameMatch[1].trim() : 'Unnamed Segment';
        const description = extractDescriptionFromBlock(block);
        
        segments.secondarySegments.push({
          name,
          description
        });
      });
    }
    
    // Extract excluded segments
    const excludedSegmentsMatch = responseText.match(/EXCLUDED SEGMENTS?:([\s\S]*?)(?:PRIMARY SEGMENTS?:|SECONDARY SEGMENTS?:|MARKET INSIGHTS?:|$)/i);
    if (excludedSegmentsMatch) {
      const excludedSegmentsText = excludedSegmentsMatch[1].trim();
      const segmentBlocks = excludedSegmentsText.split(/\n\s*\d+\.\s+|\n\s*-\s+/).filter(s => s.trim());
      
      segmentBlocks.forEach(block => {
        if (!block.trim()) return;
        
        const nameMatch = block.match(/^([^:]+?)(?::|-)?\s*(.+?)(?:\n|$)/);
        const name = nameMatch ? nameMatch[1].trim() : 'Unnamed Segment';
        const description = extractDescriptionFromBlock(block);
        const reasonMatch = block.match(/reason:([^]*?)(?:$)/i);
        
        segments.excludedSegments.push({
          name,
          description,
          reason: reasonMatch ? reasonMatch[1].trim() : null
        });
      });
    }
    
    // Extract market insights
    const marketInsightsMatch = responseText.match(/MARKET INSIGHTS?:([\s\S]*?)(?:PRIMARY SEGMENTS?:|SECONDARY SEGMENTS?:|EXCLUDED SEGMENTS?:|$)/i);
    if (marketInsightsMatch) {
      segments.marketInsights = extractKeyValuePairs(marketInsightsMatch[1]);
    }
    
    return segments;
  } catch (error) {
    console.error('Error parsing segmentation response:', error);
    throw new Error(`Failed to parse segmentation response: ${error.message}`);
  }
}

/**
 * Extract description from a segment block
 * 
 * @param {string} block - Text block for a segment
 * @returns {string} Extracted description
 */
function extractDescriptionFromBlock(block) {
  const descriptionMatch = block.match(/description:([^]*?)(?:demographics?:|psychographics?:|behaviors?:|percentage:|market share:|reasons?:|$)/i);
  if (descriptionMatch) {
    return descriptionMatch[1].trim();
  }
  
  // If no labeled description, use the first paragraph that's not the name
  const paragraphs = block.split('\n').map(p => p.trim()).filter(p => p);
  if (paragraphs.length > 1) {
    return paragraphs[1];
  }
  
  return '';
}

/**
 * Extract key-value pairs from a text block
 * 
 * @param {string} text - Text containing key-value pairs
 * @returns {Object} Extracted key-value pairs
 */
function extractKeyValuePairs(text) {
  const result = {};
  const lines = text.split('\n').map(line => line.trim()).filter(line => line);
  
  lines.forEach(line => {
    // Look for key-value pattern with : or -
    const match = line.match(/^(?:[-•*]?\s*)?([^:]+):\s*(.+)$/);
    if (match) {
      const key = match[1].trim().toLowerCase().replace(/\s+/g, '_');
      let value = match[2].trim();
      
      // Check if value is a list
      if (value.includes(',')) {
        value = value.split(',').map(v => v.trim());
      }
      
      result[key] = value;
    }
  });
  
  return result;
}

/**
 * Check if an object has the required segmentation structure
 * 
 * @param {Object} obj - Object to validate
 * @returns {boolean} Whether the object is a valid segmentation result
 */
function isValidSegmentationObject(obj) {
  return (
    obj &&
    Array.isArray(obj.primarySegments) &&
    obj.primarySegments.length > 0 &&
    obj.primarySegments[0].name &&
    typeof obj.primarySegments[0].name === 'string'
  );
}

module.exports = {
  parseSegmentationResponse
};