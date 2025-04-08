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
    
    // Parse the text response using the new format
    const segments = {
      primarySegments: [],
      excludedSegments: [],
      marketInsights: {}
    };
    
    // Find all segment blocks
    const segmentBlocks = responseText.split(/SEGMENT:/).slice(1); // Skip the first empty element
    
    // Process each segment block
    segmentBlocks.forEach(block => {
      if (!block.trim()) return;
      
      // Check if this is an excluded segment - much more specific now
      // Only mark as excluded if EXPLICITLY labeled as excluded or has a clear "should be avoided" statement
      const isExcluded = 
        block.toLowerCase().includes('excluded segment:') || 
        block.toLowerCase().includes('segment to avoid:') ||
        block.toLowerCase().includes('avoid this segment:') ||
        block.toLowerCase().includes('do not target:') ||
        (block.toLowerCase().includes('reason:') && 
         (block.toLowerCase().includes('should be avoided') || 
          block.toLowerCase().includes('should not be targeted')));
      
      // Extract segment information
      const nameMatch = block.match(/^([^\n]+)/);
      const name = nameMatch ? nameMatch[1].trim() : 'Unnamed Segment';
      
      const overviewMatch = block.match(/OVERVIEW:\s*([^\n]+(?:\n[^\n]+)*?)(?:\n\s*MARKET|$)/i);
      const overview = overviewMatch ? overviewMatch[1].trim() : '';
      
      const percentageMatch = block.match(/MARKET PERCENTAGE:\s*(\d+(?:\.\d+)?)\s*%?/i);
      const percentage = percentageMatch ? parseFloat(percentageMatch[1]) : null;
      
      // Extract the four factors
      const demographicsMatch = block.match(/DEMOGRAPHICS:([\s\S]*?)(?:PSYCHOGRAPHICS:|$)/i);
      const psychographicsMatch = block.match(/PSYCHOGRAPHICS:([\s\S]*?)(?:PROBLEMS & NEEDS:|PROBLEMS:|NEEDS:|$)/i);
      const problemsNeedsMatch = block.match(/(?:PROBLEMS & NEEDS:|PROBLEMS:|NEEDS:)([\s\S]*?)(?:BEHAVIORS:|$)/i);
      const behaviorsMatch = block.match(/BEHAVIORS:([\s\S]*?)(?:GROWTH POTENTIAL:|$)/i);
      
      // Extract growth potential
      const growthMatch = block.match(/GROWTH POTENTIAL:\s*([^\n]+)/i);
      const growthPotential = growthMatch ? growthMatch[1].trim() : null;
      
      // Extract reason for excluded segments
      const reasonMatch = block.match(/REASON(?:S)?:\s*([^\n]+(?:\n[^\n]+)*?)(?:\n\s*\n|$)/i);
      const reason = reasonMatch ? reasonMatch[1].trim() : null;
      
      // Create segment object
      const segment = {
        name,
        description: overview,
        percentage,
        characteristics: {
          demographics: extractBulletPoints(demographicsMatch ? demographicsMatch[1] : ''),
          psychographics: extractBulletPoints(psychographicsMatch ? psychographicsMatch[1] : ''),
          problemsNeeds: extractBulletPoints(problemsNeedsMatch ? problemsNeedsMatch[1] : ''),
          behaviors: extractBulletPoints(behaviorsMatch ? behaviorsMatch[1] : '')
        },
        growthPotential: growthPotential
      };
      
      // Add to appropriate segment list
      if (isExcluded) {
        segments.excludedSegments.push({
          ...segment,
          reason: reason || overview // Use reason if available, otherwise use overview
        });
      } else {
        segments.primarySegments.push(segment);
      }
    });
    
    // Find excluded segments section if it exists separately
    const excludedSegmentsMatch = responseText.match(/EXCLUDED SEGMENTS?:([\s\S]*?)(?:\n\s*\n|$)/i);
    if (excludedSegmentsMatch) {
      const excludedText = excludedSegmentsMatch[1].trim();
      
      // Split by numbered or bullet points
      const excludedBlocks = excludedText.split(/\n\s*\d+\.|\n\s*-/).slice(1); // Skip first empty element
      
      excludedBlocks.forEach(block => {
        if (!block.trim()) return;
        
        const nameDescMatch = block.match(/^([^:]*?):\s*([^\n]+)/);
        if (nameDescMatch) {
          const name = nameDescMatch[1].trim();
          const description = nameDescMatch[2].trim();
          
          const reasonMatch = block.match(/reason(?:s)?:\s*([^\n]+)/i) || 
                             block.match(/because:\s*([^\n]+)/i) ||
                             block.match(/why:\s*([^\n]+)/i);
          const reason = reasonMatch ? reasonMatch[1].trim() : description;
          
          segments.excludedSegments.push({
            name,
            description,
            reason
          });
        }
      });
    }
    
    return segments;
  } catch (error) {
    console.error('Error parsing segmentation response:', error);
    console.error('Response text:', responseText);
    throw new Error(`Failed to parse segmentation response: ${error.message}`);
  }
}

/**
 * Extract bullet points from a text block
 * 
 * @param {string} text - Text block with bullet points
 * @returns {Array<string>} Array of bullet points
 */
function extractBulletPoints(text) {
  if (!text) return [];
  
  // Split by bullet points or numbered items
  const bullets = text.split(/\n\s*-|\n\s*•|\n\s*\*|\n\s*\d+\./).map(b => b.trim()).filter(Boolean);
  
  // If no bullet points found, try splitting by new lines
  if (bullets.length === 0) {
    return text.split('\n').map(line => line.trim()).filter(Boolean);
  }
  
  return bullets;
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