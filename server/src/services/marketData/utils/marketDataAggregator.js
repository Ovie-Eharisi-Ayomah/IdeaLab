// src/services/marketData/utils/aggregator.js

/**
 * Market Data Aggregator
 * 
 * This is where the magic happens: combining data from multiple sources.
 * 
 * Problem: Each source has different:
 * - Reliability levels
 * - Coverage of industries
 * - Types of data (some have market size, some just growth, etc.)
 * 
 * Solution: Weighted combination based on source quality and data completeness
 */

/**
 * Aggregate data from multiple sources into a coherent market picture
 * 
 * @param {Array<Object>} sourceResults - Results from all data sources
 * @param {string} industry - Original industry query
 * @returns {Object} Aggregated market data
 */
function aggregateMarketData(sourceResults, industry) {
  // Filter to just valid results with data
  const validResults = sourceResults.filter(
    result => result && result.hasData === true
  );
  
  // If we have no valid sources, return empty result
  if (validResults.length === 0) {
    return {
      industry,
      hasData: false,
      sources: sourceResults.map(r => r.source || 'unknown').filter(Boolean),
      errors: sourceResults
        .filter(r => r && r.error)
        .map(r => ({ source: r.source, error: r.error }))
    };
  }
  
  // Track sources used
  const sourcesUsed = validResults.map(r => r.source);
  
  // ===== MARKET SIZE CALCULATION =====
  // Not all sources provide market size, so we need to check which ones do
  const marketSizeSources = validResults.filter(r => 
    r.globalMarketSize !== null && r.globalMarketSize !== undefined
  );
  
  let marketSize = null;
  let marketSizeConfidence = 0;
  let marketSizeYear = null;
  
  if (marketSizeSources.length > 0) {
    // Calculate weighted average based on source quality
    let weightedSum = 0;
    let weightSum = 0;
    
    marketSizeSources.forEach(source => {
      const weight = source.sourceQuality || 3; // Default to medium quality
      weightedSum += source.globalMarketSize * weight;
      weightSum += weight;
    });
    
    marketSize = weightedSum / weightSum;
    marketSizeYear = Math.max(...marketSizeSources.map(
      s => s.year || new Date().getFullYear()
    ));
    
    // Calculate confidence based on number and quality of sources
    marketSizeConfidence = calculateConfidence(marketSizeSources);
  }
  
  // ===== GROWTH RATE CALCULATION =====
  // Similar approach for growth rate
  const growthRateSources = validResults.filter(r => 
    r.growthRate !== null && r.growthRate !== undefined
  );
  
  let growthRate = null;
  let growthRateConfidence = 0;
  
  if (growthRateSources.length > 0) {
    // Calculate weighted average
    let weightedSum = 0;
    let weightSum = 0;
    
    growthRateSources.forEach(source => {
      const weight = source.sourceQuality || 3;
      weightedSum += source.growthRate * weight;
      weightSum += weight;
    });
    
    growthRate = weightedSum / weightSum;
    
    // Calculate confidence
    growthRateConfidence = calculateConfidence(growthRateSources);
  }
  
  // ===== GEOGRAPHIC DISTRIBUTION =====
  // Combine geographic data if available
  let geographicDistribution = null;
  const geoSources = validResults.filter(r => r.geographicDistribution);
  
  if (geoSources.length > 0) {
    // Combine all region data
    geographicDistribution = {};
    
    // Process each source
    geoSources.forEach(source => {
      const weight = source.sourceQuality || 3;
      
      Object.entries(source.geographicDistribution).forEach(([region, value]) => {
        if (!geographicDistribution[region]) {
          geographicDistribution[region] = 0;
        }
        
        geographicDistribution[region] += value * weight;
      });
    });
    
    // Normalize to sum to 1.0
    const total = Object.values(geographicDistribution).reduce((sum, v) => sum + v, 0);
    if (total > 0) {
      Object.keys(geographicDistribution).forEach(region => {
        geographicDistribution[region] /= total;
      });
    }
  }
  
  // ===== OVERALL CONFIDENCE =====
  // Overall confidence is the min of market size and growth confidence
  // Can't be more confident than our weakest link
  const hasBothMetrics = marketSize !== null && growthRate !== null;
  let overallConfidence = 0;
  
  if (hasBothMetrics) {
    overallConfidence = Math.min(marketSizeConfidence, growthRateConfidence);
  } else if (marketSize !== null) {
    overallConfidence = marketSizeConfidence * 0.8; // Penalize for missing growth data
  } else if (growthRate !== null) {
    overallConfidence = growthRateConfidence * 0.6; // Penalize more for missing market size
  } else {
    overallConfidence = 0.1; // Minimal confidence if we have neither
  }
  
  // ===== BUILD FINAL RESULT =====
  return {
    industry,
    hasData: true,
    
    // Core market metrics
    globalMarketSize: marketSize,
    displayMarketSize: formatMarketSize(marketSize),
    growthRate,
    displayGrowthRate: growthRate !== null ? `${(growthRate * 100).toFixed(1)}%` : null,
    geographicDistribution,
    
    // Confidence metrics
    confidence: {
      overall: overallConfidence,
      marketSize: marketSizeConfidence,
      growthRate: growthRateConfidence
    },
    
    // Source information
    sources: sourcesUsed,
    sourceCount: validResults.length,
    
    // Additional metadata
    year: marketSizeYear || new Date().getFullYear(),
    retrievalDate: new Date().toISOString(),
    
    // Source details for transparency
    sourceDetails: validResults.map(source => ({
      name: source.source,
      quality: source.sourceQuality,
      providedMetrics: getProvidedMetrics(source),
      dataSource: source.dataSource || source.source
    }))
  };
}

/**
 * Calculate confidence score based on source count and quality
 * 
 * @param {Array<Object>} sources - Data sources
 * @returns {number} Confidence score (0-1)
 */
function calculateConfidence(sources) {
  if (!sources || sources.length === 0) return 0;
  
  // More sources = higher baseline confidence
  const baseConfidence = Math.min(0.5, sources.length * 0.15);
  
  // Higher quality sources = higher confidence
  const totalQuality = sources.reduce((sum, source) => sum + (source.sourceQuality || 3), 0);
  const maxPossibleQuality = sources.length * 5; // 5 is max quality score
  const qualityFactor = totalQuality / maxPossibleQuality;
  
  // Synthetic data penalty
  const syntheticCount = sources.filter(s => s.synthetic === true).length;
  const syntheticPenalty = syntheticCount > 0 ? (syntheticCount / sources.length) * 0.5 : 0;
  
  return Math.min(0.9, Math.max(0.1, baseConfidence + (qualityFactor * 0.4) - syntheticPenalty));
}

/**
 * Format market size for display
 * 
 * @param {number} marketSize - Market size in billions USD
 * @returns {string} Formatted market size
 */
function formatMarketSize(marketSize) {
  if (marketSize === null || marketSize === undefined) return null;
  
  if (marketSize >= 1000) {
    return `$${(marketSize / 1000).toFixed(2)} trillion`;
  } else {
    return `$${marketSize.toFixed(2)} billion`;
  }
}

/**
 * Get a list of metrics that a source provides
 * 
 * @param {Object} source - Data source result
 * @returns {Array<string>} List of provided metrics
 */
function getProvidedMetrics(source) {
  const metrics = [];
  
  if (source.globalMarketSize !== null && source.globalMarketSize !== undefined) {
    metrics.push('market_size');
  }
  
  if (source.growthRate !== null && source.growthRate !== undefined) {
    metrics.push('growth_rate');
  }
  
  if (source.geographicDistribution) {
    metrics.push('geographic_distribution');
  }
  
  if (source.competitiveIntensity !== null && source.competitiveIntensity !== undefined) {
    metrics.push('competitive_intensity');
  }
  
  return metrics;
}

/**
 * Generate an explanation for the aggregated data
 * 
 * @param {Object} aggregatedData - Aggregated market data
 * @returns {string} Human-readable explanation
 */
function generateExplanation(aggregatedData) {
  if (!aggregatedData.hasData) {
    return "No reliable market data found for this industry.";
  }
  
  const { globalMarketSize, growthRate, sources } = aggregatedData;
  
  let explanation = `Market data for ${aggregatedData.industry} industry based on ${sources.length} source${sources.length !== 1 ? 's' : ''}`;
  
  if (globalMarketSize !== null) {
    explanation += `, indicating a global market size of approximately ${formatMarketSize(globalMarketSize)}`;
    
    if (growthRate !== null) {
      explanation += ` with an annual growth rate of ${(growthRate * 100).toFixed(1)}%`;
    }
  } else if (growthRate !== null) {
    explanation += `, indicating an annual growth rate of ${(growthRate * 100).toFixed(1)}%`;
  }
  
  explanation += '.';
  
  // Add confidence assessment
  const { confidence } = aggregatedData;
  if (confidence.overall < 0.3) {
    explanation += " This data has low confidence due to limited sources or data quality.";
  } else if (confidence.overall < 0.6) {
    explanation += " This data has moderate confidence based on available sources.";
  } else {
    explanation += " This data has relatively high confidence based on multiple quality sources.";
  }
  
  return explanation;
}

// Export functions
module.exports = {
  aggregateMarketData,
  calculateConfidence,
  formatMarketSize,
  generateExplanation
};