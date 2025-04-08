// src/services/marketSizingCalculator.js

/**
 * Calculate TAM, SAM, and SOM from market data and segmentation
 * @param {Object} marketData - Market size data from research
 * @param {Object} segmentation - Customer segmentation data
 * @param {Object} options - Calculation options
 * @returns {Object} TAM, SAM, SOM calculations
 */
function calculateMarketSizing(marketData, segmentation, options = {}) {
  try {
    const {
      geographicFocus = 0.4, // Default to 40% geographic focus
      techAdoption = 0.7,    // Default to 70% tech adoption
      newEntrantShare = 0.03, // Default to 3% for new entrant
      marketingReach = 0.15,  // Default to 15% marketing reach
      conversionRate = 0.05   // Default to 5% conversion
    } = options;
    
    // Safeguard against missing or malformed data
    if (!marketData || !marketData.market_size || !marketData.market_size.value) {
      return {
        error: "Invalid market data",
        tam: 0,
        sam: 0,
        som: 0,
        tamFormatted: "$0",
        samFormatted: "$0",
        somFormatted: "$0"
      };
    }

    // Extract market size from marketData
    const marketSizeValue = parseFloat(marketData.market_size.value);
    const multiplier = marketData.market_size.unit === 'billion' ? 1000000000 : 1000000;
    const tam = marketSizeValue * multiplier;
    
    // Calculate SAM based on target segments
    let targetSegmentPercentage = 1.0; // Default to 100% if no segmentation
    
    if (segmentation && segmentation.primarySegments && segmentation.primarySegments.length > 0) {
      targetSegmentPercentage = segmentation.primarySegments.reduce(
        (sum, segment) => sum + (segment.percentage || 0), 0
      ) / 100;
    }
    
    const sam = tam * targetSegmentPercentage * geographicFocus * techAdoption;
    
    // Calculate SOM based on competitive landscape
    const som = sam * newEntrantShare * marketingReach * conversionRate;
    
    return {
      tam: tam,
      sam: sam,
      som: som,
      tamFormatted: formatCurrency(tam),
      samFormatted: formatCurrency(sam),
      somFormatted: formatCurrency(som),
      confidence: marketData.confidence_score || 0,
      sources: marketData.market_size.sources || [],
      growth_rate: marketData.growth_rate || { value: 0 },
      geographic_breakdown: marketData.geographic_breakdown || {}
    };
  } catch (error) {
    console.error('Error calculating market sizing:', error);
    return {
      error: error.message,
      tam: 0,
      sam: 0,
      som: 0,
      tamFormatted: "$0",
      samFormatted: "$0",
      somFormatted: "$0"
    };
  }
}

/**
 * Format currency values in a human-readable way
 * @param {number} value - The currency value to format
 * @returns {string} Formatted currency string
 */
function formatCurrency(value) {
  if (value >= 1000000000) {
    return `$${(value / 1000000000).toFixed(2)}B`;
  } else if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(2)}M`;
  } else if (value >= 1000) {
    return `$${(value / 1000).toFixed(2)}K`;
  } else {
    return `$${value.toFixed(2)}`;
  }
}

module.exports = {
  calculateMarketSizing
};