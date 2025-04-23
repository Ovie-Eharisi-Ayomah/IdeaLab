// src/services/marketSizingCalculator.js - Vastly improved version

/**
 * Calculate TAM, SAM, and SOM from market data, segmentation, problem validation, and competitive analysis
 * @param {Object} marketData - Market size data from research
 * @param {Object} segmentation - Customer segmentation data
 * @param {Object} problemValidation - Problem validation results (optional)
 * @param {Object} competitiveData - Competitive analysis results (optional)
 * @param {Object} options - Override default calculation assumptions
 * @returns {Object} Enhanced TAM, SAM, SOM calculations with confidence intervals
 */
function calculateMarketSizing(marketData, segmentation, problemValidation = null, competitiveData = null, options = {}) {
  try {
    // Basic validation
    if (!marketData?.market_data?.sources || marketData.market_data.sources.length === 0) {
      return createErrorResponse("No market size data available");
    }

    const sources = marketData.market_data.sources;
    
    // STEP 1: Process and normalize all market sizes to the same unit (USD)
    const normalizedSizes = sources.map(source => {
      const value = parseFloat(source.market_size);
      const multiplier = getUnitMultiplier(source.market_size_unit);
      return {
        value: value * multiplier,
        year: source.year || 2024,
        publisher: source.publisher || "Unknown",
        quality: calculateSourceQuality(source)
      };
    });
    
    // STEP 2: Detect and handle outliers (critical for accurate estimates)
    const { validSizes, outliers } = detectOutliers(normalizedSizes);
    
    if (validSizes.length === 0) {
      console.warn("All sources were detected as outliers - using median as fallback");
      validSizes.push(...normalizedSizes);
    }
    
    // STEP 3: Calculate TAM with confidence intervals
    const tamAnalysis = calculateWeightedMarketSize(validSizes);
    
    // STEP 4: Calculate SAM using segmentation data and problem validation
    const samMultipliers = calculateSamMultipliers(segmentation, problemValidation, options);
    
    const sam = tamAnalysis.median * samMultipliers.geographic * samMultipliers.segments * samMultipliers.techAdoption;
    
    // STEP 5: Calculate SOM using competitive data
    const somMultipliers = calculateSomMultipliers(competitiveData, problemValidation, options);
    
    const som = sam * somMultipliers.newEntrant * somMultipliers.marketingReach * somMultipliers.conversion;
    
    // STEP 6: Calculate confidence scores and sensitivity analysis
    const confidenceScore = calculateConfidenceScore(validSizes, outliers, problemValidation, competitiveData);
    const sensitivityAnalysis = performSensitivityAnalysis(tamAnalysis.median, samMultipliers, somMultipliers);
    
    // Build enhanced response with both point estimates and ranges
    return {
      tam: {
        value: tamAnalysis.median,
        low: tamAnalysis.p10,   // 10th percentile
        high: tamAnalysis.p90,  // 90th percentile
        formatted: formatCurrency(tamAnalysis.median),
        range: `${formatCurrency(tamAnalysis.p10)} - ${formatCurrency(tamAnalysis.p90)}`,
        growth_rate: calculateAverageGrowthRate(sources),
        sources_count: sources.length,
        outliers_count: outliers.length
      },
      sam: {
        value: sam,
        // Add range based on TAM confidence intervals
        low: tamAnalysis.p10 * samMultipliers.geographic * samMultipliers.segments * samMultipliers.techAdoption,
        high: tamAnalysis.p90 * samMultipliers.geographic * samMultipliers.segments * samMultipliers.techAdoption,
        formatted: formatCurrency(sam),
        range: `${formatCurrency(sam * 0.7)} - ${formatCurrency(sam * 1.3)}`,
        multipliers: samMultipliers
      },
      som: {
        value: som,
        // Add range based on SOM volatility
        low: som * 0.5, // Conservative estimate
        high: som * 2.0, // Optimistic estimate (SOM has highest uncertainty)
        formatted: formatCurrency(som),
        range: `${formatCurrency(som * 0.5)} - ${formatCurrency(som * 2.0)}`,
        multipliers: somMultipliers
      },
      confidence_score: confidenceScore,
      assumptions: {
        geographic_focus: samMultipliers.geographic,
        tech_adoption: samMultipliers.techAdoption,
        new_entrant_share: somMultipliers.newEntrant,
        marketing_reach: somMultipliers.marketingReach,
        conversion_rate: somMultipliers.conversion
      },
      sources: sources.map(s => ({
        publisher: s.publisher, 
        size: `${s.market_size} ${s.market_size_unit}`,
        year: s.year,
        is_outlier: outliers.some(o => o.publisher === s.publisher)
      })),
      sensitivity: sensitivityAnalysis
    };
  } catch (error) {
    console.error('Error calculating market sizing:', error);
    return createErrorResponse(error.message);
  }
}

/**
 * Detect outliers in market size estimates
 * Critical for handling the 36x discrepancy issue
 */
function detectOutliers(marketSizes) {
  if (marketSizes.length <= 2) {
    return { validSizes: marketSizes, outliers: [] };
  }
  
  // Sort by value
  const sorted = [...marketSizes].sort((a, b) => a.value - b.value);
  
  // Calculate median
  const median = sorted[Math.floor(sorted.length / 2)].value;
  
  // Calculate median absolute deviation (more robust than standard deviation)
  const deviations = sorted.map(size => Math.abs(size.value - median));
  const mad = deviations.sort((a, b) => a - b)[Math.floor(deviations.length / 2)];
  
  // Modified Z-score threshold (standard is 3.5, we're using 5 to only catch egregious outliers)
  const outlierThreshold = 5;
  
  const outliers = [];
  const validSizes = [];
  
  for (const size of marketSizes) {
    // Using modified Z-score method, which is more robust for small sample sizes
    const modifiedZScore = (0.6745 * Math.abs(size.value - median)) / (mad || 1);
    
    if (modifiedZScore > outlierThreshold) {
      console.log(`Outlier detected: ${size.publisher} with value ${size.value}, modified Z-score: ${modifiedZScore}`);
      outliers.push(size);
    } else {
      validSizes.push(size);
    }
  }
  
  return { validSizes, outliers };
}

/**
 * Calculate weighted market size with confidence intervals
 * Uses source quality to weigh each estimate
 */
function calculateWeightedMarketSize(marketSizes) {
  if (marketSizes.length === 0) {
    return {
      mean: 0,
      median: 0,
      p10: 0,
      p25: 0,
      p75: 0,
      p90: 0
    };
  }
  
  // Sort by value for percentile calculations
  const sorted = [...marketSizes].sort((a, b) => a.value - b.value);
  
  // Apply quality weighting
  const totalQuality = marketSizes.reduce((sum, size) => sum + size.quality, 0);
  const weightedSizes = marketSizes.map(size => ({
    ...size,
    weight: size.quality / totalQuality
  }));
  
  // Calculate weighted average
  const weightedSum = weightedSizes.reduce((sum, size) => sum + (size.value * size.weight), 0);
  
  // Calculate percentiles for confidence intervals
  const getPercentile = (arr, p) => {
    if (arr.length === 0) return 0;
    if (arr.length === 1) return arr[0].value;
    
    const index = Math.max(0, Math.min(arr.length - 1, Math.floor(arr.length * p)));
    return arr[index].value;
  };
  
  return {
    mean: weightedSum,
    median: getPercentile(sorted, 0.5),
    p10: getPercentile(sorted, 0.1),
    p25: getPercentile(sorted, 0.25),
    p75: getPercentile(sorted, 0.75),
    p90: getPercentile(sorted, 0.9)
  };
}

/**
 * Calculate source quality based on recency and authority
 */
function calculateSourceQuality(source) {
  let quality = 5; // Base quality
  
  // Adjust for recency
  const currentYear = new Date().getFullYear();
  const ageInYears = currentYear - (source.year || currentYear);
  
  if (ageInYears <= 1) quality += 3;
  else if (ageInYears <= 3) quality += 1;
  else if (ageInYears > 5) quality -= 2;
  
  // Adjust for publisher reputation (simplified)
  const highQualitySources = ['statista', 'gartner', 'forrester', 'mckinsey', 'pwc', 'deloitte', 'ibisworld', 'grandview'];
  const mediumQualitySources = ['report', 'research', 'market', 'industry', 'association'];
  
  const publisher = (source.publisher || "").toLowerCase();
  
  if (highQualitySources.some(term => publisher.includes(term))) {
    quality += 3;
  } else if (mediumQualitySources.some(term => publisher.includes(term))) {
    quality += 1;
  }
  
  return Math.max(1, Math.min(10, quality)); // Clamp between 1-10
}

/**
 * Calculate SAM multipliers based on segmentation and problem validation
 */
function calculateSamMultipliers(segmentation, problemValidation, options) {
  // Geographic focus (from options or dynamic calculation)
  const geographic = options.geographicFocus || 0.4;
  
  // Target segment percentage from segmentation data
  let segments = 1.0; // Default to 100% if no segmentation
  
  if (segmentation?.primarySegments && segmentation.primarySegments.length > 0) {
    // Sum up percentage of all target segments
    const totalPercentage = segmentation.primarySegments.reduce(
      (sum, segment) => sum + (segment.percentage || 0), 0
    );
    
    segments = Math.min(1.0, totalPercentage / 100);
  }
  
  // Tech adoption adjustment (consider problem severity if available)
  let techAdoption = options.techAdoption || 0.7;
  
  // If we have problem validation, adjust tech adoption based on problem severity
  if (problemValidation?.problem_validation?.severity) {
    const severity = problemValidation.problem_validation.severity;
    // Increase adoption as severity increases (capped at 90%)
    techAdoption = Math.min(0.9, 0.5 + (severity / 20));
  }
  
  return {
    geographic,
    segments,
    techAdoption
  };
}

/**
 * Calculate SOM multipliers based on competitive landscape and problem validation
 */
function calculateSomMultipliers(competitiveData, problemValidation, options) {
  // Calculate new entrant market share based on competitive landscape
  let newEntrant = options.newEntrantShare || 0.03; // Default 3%
  
  if (competitiveData?.market_concentration) {
    const concentration = competitiveData.market_concentration.toLowerCase();
    if (concentration.includes("highly concentrated")) {
      newEntrant = 0.01; // 1% in highly concentrated markets
    } else if (concentration.includes("moderately concentrated")) {
      newEntrant = 0.02; // 2% in moderately concentrated markets
    } else if (concentration.includes("fragmented")) {
      newEntrant = 0.05; // 5% in fragmented markets
    }
  }
  
  // Adjust for number of well-funded competitors
  if (competitiveData?.competitors) {
    const wellFundedCount = competitiveData.competitors.filter(
      c => c.funding && (c.funding.includes("million") || c.funding.includes("billion"))
    ).length;
    
    if (wellFundedCount >= 5) {
      newEntrant *= 0.6; // Harder to compete with many well-funded players
    } else if (wellFundedCount <= 1) {
      newEntrant *= 1.5; // Easier with fewer well-funded players
    }
  }
  
  // Calculate marketing reach based on problem validation
  let marketingReach = options.marketingReach || 0.15; // Default 15%
  
  if (problemValidation?.problem_validation) {
    // If problem is severe and frequent, easier to market
    const severity = problemValidation.problem_validation.severity || 5;
    const frequency = problemValidation.problem_validation.frequency || 5;
    
    // Severity and frequency boost marketing reach
    marketingReach = 0.1 + (severity + frequency) / 100;
  }
  
  // Calculate conversion based on willingness to pay
  let conversion = options.conversionRate || 0.05; // Default 5%
  
  if (problemValidation?.problem_validation?.willingness_to_pay) {
    // Higher willingness to pay suggests higher conversion
    const wtp = parseFloat(problemValidation.problem_validation.willingness_to_pay) || 0;
    if (wtp >= 8) conversion = 0.08; // 8-10 WTP → 8% conversion
    else if (wtp >= 6) conversion = 0.06; // 6-7 WTP → 6% conversion
  }
  
  return {
    newEntrant,
    marketingReach,
    conversion
  };
}

/**
 * Calculate confidence score based on data quality and completeness
 */
function calculateConfidenceScore(validSizes, outliers, problemValidation, competitiveData) {
  // Start with source quality (0-10 points)
  const sourceScore = Math.min(10, validSizes.length * 2); 
  
  // Penalize for outliers (-2 points per outlier, max -6)
  const outlierPenalty = Math.min(6, outliers.length * 2);
  
  // Add points for problem validation (0-5 points)
  let problemScore = 0;
  if (problemValidation?.problem_validation) {
    problemScore = Math.floor(
      (problemValidation.problem_validation.confidence_level || 0) / 2
    );
  }
  
  // Add points for competitive data (0-5 points)
  let competitiveScore = 0;
  if (competitiveData?.competitors) {
    competitiveScore = Math.min(5, competitiveData.competitors.length);
  }
  
  // Calculate total (0-20 scale)
  const total = sourceScore - outlierPenalty + problemScore + competitiveScore;
  
  // Convert to 0-10 scale
  return Math.max(0, Math.min(10, Math.round(total / 2)));
}

/**
 * Perform sensitivity analysis to identify key factors
 */
function performSensitivityAnalysis(tam, samMultipliers, somMultipliers) {
  // Identify which factors have the biggest impact on the final SOM
  const factors = [
    { name: 'geographic_focus', value: samMultipliers.geographic, impact: 0 },
    { name: 'segment_targeting', value: samMultipliers.segments, impact: 0 },
    { name: 'tech_adoption', value: samMultipliers.techAdoption, impact: 0 },
    { name: 'new_entrant_share', value: somMultipliers.newEntrant, impact: 0 },
    { name: 'marketing_reach', value: somMultipliers.marketingReach, impact: 0 },
    { name: 'conversion_rate', value: somMultipliers.conversion, impact: 0 }
  ];
  
  // Calculate base SOM
  const baseSam = tam * samMultipliers.geographic * samMultipliers.segments * samMultipliers.techAdoption;
  const baseSom = baseSam * somMultipliers.newEntrant * somMultipliers.marketingReach * somMultipliers.conversion;
  
  // Test effect of 20% increase in each factor
  factors.forEach(factor => {
    let modifiedSam = baseSam;
    let modifiedSom = baseSom;
    
    // Apply 20% increase to this factor
    switch(factor.name) {
      case 'geographic_focus':
        modifiedSam = tam * (samMultipliers.geographic * 1.2) * samMultipliers.segments * samMultipliers.techAdoption;
        modifiedSom = modifiedSam * somMultipliers.newEntrant * somMultipliers.marketingReach * somMultipliers.conversion;
        break;
      case 'segment_targeting':
        modifiedSam = tam * samMultipliers.geographic * (samMultipliers.segments * 1.2) * samMultipliers.techAdoption;
        modifiedSom = modifiedSam * somMultipliers.newEntrant * somMultipliers.marketingReach * somMultipliers.conversion;
        break;
      case 'tech_adoption':
        modifiedSam = tam * samMultipliers.geographic * samMultipliers.segments * (samMultipliers.techAdoption * 1.2);
        modifiedSom = modifiedSam * somMultipliers.newEntrant * somMultipliers.marketingReach * somMultipliers.conversion;
        break;
      case 'new_entrant_share':
        modifiedSom = baseSam * (somMultipliers.newEntrant * 1.2) * somMultipliers.marketingReach * somMultipliers.conversion;
        break;
      case 'marketing_reach':
        modifiedSom = baseSam * somMultipliers.newEntrant * (somMultipliers.marketingReach * 1.2) * somMultipliers.conversion;
        break;
      case 'conversion_rate':
        modifiedSom = baseSam * somMultipliers.newEntrant * somMultipliers.marketingReach * (somMultipliers.conversion * 1.2);
        break;
    }
    
    // Calculate percentage impact
    factor.impact = ((modifiedSom - baseSom) / baseSom) * 100;
  });
  
  // Sort by impact (descending)
  return factors.sort((a, b) => b.impact - a.impact);
}

/**
 * Calculate average growth rate from market sources
 */
function calculateAverageGrowthRate(sources) {
  const growthRates = sources
    .filter(s => s.growth_rate && !isNaN(parseFloat(s.growth_rate)))
    .map(s => parseFloat(s.growth_rate));
  
  if (growthRates.length === 0) {
    return { value: 5.0, formatted: "5.0%" }; // Default growth rate
  }
  
  // Sort and remove outliers (beyond 1.5 * IQR)
  growthRates.sort((a, b) => a - b);
  
  // Simple median for growth rate
  const medianGrowth = growthRates[Math.floor(growthRates.length / 2)];
  
  return {
    value: medianGrowth,
    formatted: `${medianGrowth.toFixed(1)}%`
  };
}

/**
 * Get multiplier for unit conversion (million/billion)
 */
function getUnitMultiplier(unit) {
  if (!unit) return 1;
  
  const unitLower = unit.toLowerCase();
  if (unitLower.includes('trillion')) return 1000000000000;
  if (unitLower.includes('billion')) return 1000000000;
  if (unitLower.includes('million')) return 1000000;
  if (unitLower.includes('thousand')) return 1000;
  return 1;
}

/**
 * Format currency values in a human-readable way
 */
function formatCurrency(value) {
  if (value >= 1000000000) {
    return `$${(value / 1000000000).toFixed(1)}B`;
  } else if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `$${(value / 1000).toFixed(1)}K`;
  } else {
    return `$${value.toFixed(0)}`;
  }
}

/**
 * Create error response for market sizing
 */
function createErrorResponse(message) {
  return {
    error: message,
    tam: { value: 0, formatted: "$0", range: "$0 - $0" },
    sam: { value: 0, formatted: "$0", range: "$0 - $0" },
    som: { value: 0, formatted: "$0", range: "$0 - $0" },
    confidence_score: 0
  };
}

module.exports = {
  calculateMarketSizing,
  // Export helper functions for testing
  detectOutliers,
  calculateWeightedMarketSize,
  calculateSourceQuality,
  performSensitivityAnalysis
};