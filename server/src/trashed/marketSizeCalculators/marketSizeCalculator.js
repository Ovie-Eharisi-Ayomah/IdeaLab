// src/services/marketSizeCalculator.js

const { marketDataService } = require('./marketDataService');

/**
 * Calculate Total Addressable Market (TAM) based on business classification
 * 
 * @param {Object} businessClassification - Business classification output
 * @returns {Promise<Object>} TAM calculation result
 */
const calculateTAM = async (businessClassification) => {
  const { primaryIndustry, secondaryIndustry } = businessClassification;
  
  try {
    // Get market data for primary industry
    const primaryIndustryData = await marketDataService.getIndustryData(primaryIndustry);
    
    if (!primaryIndustryData || !primaryIndustryData.globalMarketSize) {
      throw new Error(`Insufficient market data for ${primaryIndustry}`);
    }
    
    // Initialize TAM with primary industry
    let tamValue = primaryIndustryData.globalMarketSize;
    let tamFactors = {
      primaryIndustry,
      primaryIndustrySize: primaryIndustryData.globalMarketSize,
    };
    
    // Add contribution from secondary industry if applicable
    if (secondaryIndustry) {
      try {
        const secondaryIndustryData = await marketDataService.getIndustryData(secondaryIndustry);
        
        if (secondaryIndustryData && secondaryIndustryData.globalMarketSize) {
          // Determine relevance factor of secondary industry (default 20%)
          const relevanceFactor = businessClassification.secondaryIndustryRelevance || 0.2;
          
          // Add a portion of the secondary industry to TAM
          const secondaryContribution = secondaryIndustryData.globalMarketSize * relevanceFactor;
          tamValue += secondaryContribution;
          
          // Add secondary industry to factors
          tamFactors.secondaryIndustry = secondaryIndustry;
          tamFactors.secondaryIndustryContribution = secondaryContribution;
          tamFactors.secondaryRelevanceFactor = relevanceFactor;
        }
      } catch (secondaryError) {
        console.log(`Note: Could not get data for secondary industry: ${secondaryError.message}`);
        // Continue with just the primary industry
      }
    }
    
    // Apply growth projection (typically for 1-2 years out)
    const growthRate = primaryIndustryData.growthRate || 0.05; // Default to 5% if not available
    const growthAdjustedTAM = tamValue * (1 + growthRate);
    
    // Format display values
    const tamInBillions = (tamValue >= 1000) ? 
      (tamValue / 1000).toFixed(2) + ' trillion USD' : 
      tamValue.toFixed(2) + ' billion USD';
    
    // Calculate confidence score
    const confidenceScore = calculateConfidenceScore({
      dataSource: primaryIndustryData.dataSource,
      confidence: primaryIndustryData.confidence,
      hasSecondaryIndustry: !!secondaryIndustry,
      synthetic: primaryIndustryData.synthetic === true
    });
    
    // Return complete TAM result
    return {
      value: tamValue * 1e9, // Convert to absolute value in USD
      displayValue: tamInBillions,
      methodology: primaryIndustryData.synthetic ? "synthetic-estimate" : "industry-based",
      growthRate,
      growthAdjustedValue: growthAdjustedTAM * 1e9,
      factors: tamFactors,
      confidenceScore,
      dataSource: primaryIndustryData.dataSource,
      explanation: `TAM is calculated based on the global market size of ${primaryIndustry} (${primaryIndustryData.globalMarketSize} billion USD)` +
        (secondaryIndustry ? ` with additional contribution from ${secondaryIndustry} market` : '') +
        `. Growth rate of ${(growthRate * 100).toFixed(1)}% is applied.`,
      synthetic: primaryIndustryData.synthetic === true,
      disclaimer: primaryIndustryData.disclaimer
    };
  } catch (error) {
    console.error('Error calculating TAM:', error);
    
    // If industry data retrieval fails, fall back to population-based approach
    return fallbackTAMCalculation(businessClassification);
  }
};

/**
 * Calculate Serviceable Addressable Market (SAM) based on TAM and segments
 * 
 * @param {Object} tamResult - Result from TAM calculation
 * @param {Object} customerSegmentation - Customer segmentation output
 * @param {Object} businessClassification - Business classification output
 * @returns {Promise<Object>} SAM calculation result
 */
const calculateSAM = async (tamResult, customerSegmentation, businessClassification) => {
  try {
    // Extract primary segments from customer segmentation
    const { primarySegments } = customerSegmentation;
    
    if (!tamResult || !tamResult.value) {
      throw new Error('Valid TAM calculation is required for SAM calculation');
    }
    
    if (!primarySegments || !primarySegments.length) {
      throw new Error('At least one customer segment is required for SAM calculation');
    }
    
    // Calculate total addressable percentage from primary segments
    let totalAddressablePercentage = 0;
    const targetSegments = [];
    
    primarySegments.forEach(segment => {
      const segmentPercentage = segment.percentage || segment.marketPercentage || 5;
      totalAddressablePercentage += segmentPercentage;
      
      targetSegments.push({
        name: segment.name,
        percentage: segmentPercentage,
        characteristics: segment.characteristics || segment.demographics || {}
      });
    });
    
    // Cap the total percentage at 100% for logical consistency
    totalAddressablePercentage = Math.min(totalAddressablePercentage, 100);
    
    // Calculate geographic factor based on industry data
    let geographicFactor = 0.25; // Default to 25% global coverage
    
    if (businessClassification.primaryIndustry) {
      try {
        const industryData = await marketDataService.getIndustryData(businessClassification.primaryIndustry);
        
        if (industryData && industryData.geographicDistribution) {
          // Default to North America + Europe for most startups
          geographicFactor = (industryData.geographicDistribution.northAmerica || 0.3) + 
                            (industryData.geographicDistribution.europe || 0.2);
        }
      } catch (error) {
        console.log(`Note: Using default geographic factor: ${error.message}`);
      }
    }
    
    // Calculate technological/implementation constraints
    let technologicalFactor = 0.7; // Default to 70%
    
    if (businessClassification.productType) {
      const productType = businessClassification.productType.toLowerCase();
      
      if (productType.includes('mobile app') || productType.includes('mobile application')) {
        technologicalFactor = 0.65; // ~65% of people have smartphones
      } else if (productType.includes('web') || productType.includes('saas')) {
        technologicalFactor = 0.59; // ~59% have regular internet access
      } else if (productType.includes('high-end') || productType.includes('luxury')) {
        technologicalFactor = 0.15; // Only ~15% can afford luxury products
      }
    }
    
    // Calculate SAM value
    const addressableFraction = totalAddressablePercentage / 100;
    const samValue = tamResult.value * addressableFraction * geographicFactor * technologicalFactor;
    
    // Format display values
    const samInBillions = (samValue >= 1e12) ? 
      (samValue / 1e12).toFixed(2) + ' trillion USD' : 
      (samValue / 1e9).toFixed(2) + ' billion USD';
    
    // Calculate percentage of TAM
    const percentOfTAM = ((samValue / tamResult.value) * 100).toFixed(1);
    
    return {
      value: samValue,
      displayValue: samInBillions,
      percentOfTAM: `${percentOfTAM}%`,
      addressablePercentage: totalAddressablePercentage,
      geographicFactor,
      technologicalFactor,
      targetSegments,
      confidenceScore: Math.max(0.3, tamResult.confidenceScore - 0.1), // Slightly lower than TAM confidence
      explanation: `SAM is calculated as ${percentOfTAM}% of TAM, based on targeting ${primarySegments.length} customer segments ` +
        `with a geographic focus factor of ${(geographicFactor * 100).toFixed(0)}% and technological adoption factor of ${(technologicalFactor * 100).toFixed(0)}%.`,
      synthetic: tamResult.synthetic
    };
  } catch (error) {
    console.error('Error calculating SAM:', error);
    
    // Fallback calculation
    return fallbackSAMCalculation(tamResult);
  }
};

/**
 * Calculate Serviceable Obtainable Market (SOM) based on SAM
 * 
 * @param {Object} samResult - Result from SAM calculation
 * @param {Object} businessClassification - Business classification output
 * @param {Object} options - Additional options for calculation
 * @returns {Promise<Object>} SOM calculation result
 */
const calculateSOM = async (samResult, businessClassification, options = {}) => {
  try {
    if (!samResult || !samResult.value) {
      throw new Error('Valid SAM calculation is required for SOM calculation');
    }
    
    // Try to get competitive landscape data
    let competitiveLandscape = 'Emerging Category'; // Default
    let competitiveFactor = 0.05; // Default to 5% obtainable
    
    if (businessClassification.primaryIndustry) {
      try {
        const industryData = await marketDataService.getIndustryData(businessClassification.primaryIndustry);
        
        if (industryData && industryData.competitiveIntensity !== undefined) {
          // Map competitive intensity to landscape category
          if (industryData.competitiveIntensity > 0.85) {
            competitiveLandscape = 'Highly Fragmented';
            competitiveFactor = 0.03; // 3% for highly fragmented markets
          } else if (industryData.competitiveIntensity > 0.7) {
            competitiveLandscape = 'Oligopoly';
            competitiveFactor = 0.02; // 2% for oligopolies
          } else if (industryData.competitiveIntensity > 0.5) {
            competitiveLandscape = 'Emerging Category';
            competitiveFactor = 0.05; // 5% for emerging categories
          } else {
            competitiveLandscape = 'Monopolistic';
            competitiveFactor = 0.01; // 1% for monopolistic markets
          }
        }
      } catch (error) {
        console.log(`Note: Using default competitive landscape: ${error.message}`);
      }
    }
    
    // Override with custom values if provided
    if (options.competitiveFactor) {
      competitiveFactor = options.competitiveFactor;
    }
    
    if (options.competitiveLandscape) {
      competitiveLandscape = options.competitiveLandscape;
    }
    
    // Estimate marketing reach and conversion
    const marketingReach = options.marketingReach || 0.10; // Default 10%
    const conversionRate = options.conversionRate || 0.05; // Default 5%
    
    // Calculate SOM value
    const somValue = samResult.value * competitiveFactor * marketingReach * conversionRate;
    
    // Year-by-year projections
    const yearOneProjection = somValue * 0.3; // 30% of SOM in year 1
    const yearThreeProjection = somValue * 0.6; // 60% of SOM by year 3
    const yearFiveProjection = somValue; // 100% of SOM by year 5
    
    // Format display values - use millions for SOM as it's typically smaller
    const somInMillions = (somValue >= 1e9) ?
      (somValue / 1e9).toFixed(2) + ' billion USD' :
      (somValue / 1e6).toFixed(2) + ' million USD';
    
    // Calculate percentage of SAM
    const percentOfSAM = ((somValue / samResult.value) * 100).toFixed(2);
    
    return {
      value: somValue,
      displayValue: somInMillions,
      percentOfSAM: `${percentOfSAM}%`,
      competitiveLandscape,
      competitiveFactor,
      marketingReach,
      conversionRate,
      confidenceScore: Math.max(0.2, samResult.confidenceScore - 0.1), // Lower than SAM confidence
      yearOneProjection,
      yearThreeProjection,
      yearFiveProjection,
      yearOneDisplay: (yearOneProjection / 1e6).toFixed(2) + ' million USD',
      yearThreeDisplay: (yearThreeProjection / 1e6).toFixed(2) + ' million USD',
      yearFiveDisplay: (yearFiveProjection / 1e6).toFixed(2) + ' million USD',
      explanation: `SOM is calculated as ${percentOfSAM}% of SAM based on a ${competitiveLandscape} competitive landscape ` +
        `with ${(marketingReach * 100).toFixed(0)}% marketing reach and ${(conversionRate * 100).toFixed(0)}% conversion rate.`,
      synthetic: samResult.synthetic
    };
  } catch (error) {
    console.error('Error calculating SOM:', error);
    
    // Fallback calculation
    return fallbackSOMCalculation(samResult);
  }
};

/**
 * Complete market size calculation pipeline
 * 
 * @param {Object} businessClassification - Business classification output
 * @param {Object} customerSegmentation - Customer segmentation output
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} Complete market sizing analysis
 */
const calculateMarketSize = async (businessClassification, customerSegmentation, options = {}) => {
  try {
    console.log('Starting market size calculation...');
    
    // Calculate each market size component
    console.log('Calculating TAM...');
    const tam = await calculateTAM(businessClassification);
    
    console.log('Calculating SAM...');
    const sam = await calculateSAM(tam, customerSegmentation, businessClassification);
    
    console.log('Calculating SOM...');
    const som = await calculateSOM(sam, businessClassification, options);
    
    // Determine go/no-go decision
    console.log('Determining GO/NO-GO recommendation...');
    const goNoGoDecision = determineGoNoGoDecision({ tam, sam, som });
    
    // Return final market sizing result
    return {
      businessClassification,
      customerSegmentation,
      marketSizing: {
        tam,
        sam,
        som,
        goNoGoDecision
      },
      metadata: {
        generatedAt: new Date().toISOString(),
        version: '1.0.0',
        dataReliability: tam.synthetic ? 'low' : 'medium-high'
      }
    };
  } catch (error) {
    console.error('Error in market size calculation:', error);
    throw new Error(`Market size calculation failed: ${error.message}`);
  }
};

/**
 * Fallback TAM calculation when industry data fails
 * Uses a population-based approach
 * 
 * @param {Object} businessClassification - Business classification
 * @returns {Object} Fallback TAM calculation
 */
const fallbackTAMCalculation = (businessClassification) => {
  // Global population estimate
  const globalPopulation = 7.9e9; // 7.9 billion
  
  // Estimate relevant percentage of population based on product type
  let relevantPercentage = 0.05; // Default 5%
  
  if (businessClassification.productType) {
    const productType = businessClassification.productType.toLowerCase();
    
    if (productType.includes('niche') || productType.includes('specialized')) {
      relevantPercentage = 0.01; // 1% for niche products
    } else if (productType.includes('mass market') || productType.includes('consumer')) {
      relevantPercentage = 0.1; // 10% for mass market products
    }
  }
  
  // Estimate average revenue per user
  let averageRevenue = 100; // Default $100 per year
  
  if (businessClassification.targetAudience) {
    const audience = businessClassification.targetAudience.toLowerCase();
    
    if (audience.includes('business') || audience.includes('enterprise')) {
      averageRevenue = 5000; // $5,000 for B2B
    } else if (audience.includes('premium') || audience.includes('luxury')) {
      averageRevenue = 500; // $500 for premium products
    }
  }
  
  const tamValue = globalPopulation * relevantPercentage * averageRevenue;
  
  return {
    value: tamValue,
    displayValue: (tamValue / 1e9).toFixed(2) + ' billion USD',
    methodology: "population-based (fallback)",
    growthRate: 0.025, // Conservative 2.5% growth
    growthAdjustedValue: tamValue * 1.025,
    factors: {
      globalPopulation,
      relevantPercentage,
      averageRevenue
    },
    confidenceScore: 0.3, // Low confidence due to fallback method
    dataSource: "population-based-estimate",
    explanation: "This is a fallback calculation using population estimates due to unavailable industry data.",
    synthetic: true,
    disclaimer: "This is a synthetic estimate based on population data. Consider it a rough approximation."
  };
};

/**
 * Fallback SAM calculation when segment data is unreliable
 * 
 * @param {Object} tamResult - TAM calculation result
 * @returns {Object} Fallback SAM calculation
 */
const fallbackSAMCalculation = (tamResult) => {
  // Conservative estimate: SAM is ~15% of TAM
  const samValue = tamResult.value * 0.15;
  
  return {
    value: samValue,
    displayValue: (samValue / 1e9).toFixed(2) + ' billion USD',
    percentOfTAM: '15.0%',
    addressablePercentage: 30, // Assume targeting 30% of the market
    geographicFactor: 0.5, // Assume 50% geographic coverage
    technologicalFactor: 0.7, // Assume 70% can access the technology
    targetSegments: [{ name: 'General market', percentage: 30 }],
    confidenceScore: 0.3, // Low confidence due to fallback method
    explanation: "This is a fallback calculation estimating SAM as 15% of TAM due to limited segmentation data.",
    synthetic: true
  };
};

/**
 * Fallback SOM calculation when competitive data is unreliable
 * 
 * @param {Object} samResult - SAM calculation result
 * @returns {Object} Fallback SOM calculation
 */
const fallbackSOMCalculation = (samResult) => {
  // Conservative estimate: SOM is ~1% of SAM for a new entrant
  const somValue = samResult.value * 0.01;
  
  return {
    value: somValue,
    displayValue: (somValue / 1e6).toFixed(2) + ' million USD',
    percentOfSAM: '1.00%',
    competitiveLandscape: 'Unknown',
    competitiveFactor: 0.05,
    marketingReach: 0.1,
    conversionRate: 0.02,
    confidenceScore: 0.2, // Low confidence due to fallback method
    yearOneProjection: somValue * 0.3,
    yearThreeProjection: somValue * 0.6,
    yearFiveProjection: somValue,
    yearOneDisplay: (somValue * 0.3 / 1e6).toFixed(2) + ' million USD',
    yearThreeDisplay: (somValue * 0.6 / 1e6).toFixed(2) + ' million USD',
    yearFiveDisplay: (somValue / 1e6).toFixed(2) + ' million USD',
    explanation: "This is a fallback calculation estimating SOM as 1% of SAM due to limited competitive data.",
    synthetic: true
  };
};

/**
 * Calculate confidence score based on data quality
 * 
 * @param {Object} factors - Factors affecting confidence
 * @returns {number} Confidence score between 0-1
 */
const calculateConfidenceScore = (factors) => {
  // Start with neutral confidence
  let score = 0.5;
  
  // Data source quality
  if (factors.dataSource === 'public-enhanced') {
    score += 0.2;
  } else if (factors.dataSource === 'fallback-exact-match') {
    score += 0.1;
  } else if (factors.dataSource === 'fallback-similarity-adjusted') {
    score -= 0.1;
  } else if (factors.dataSource === 'synthetic-estimate') {
    score -= 0.3;
  }
  
  // Add other factors
  if (factors.hasSecondaryIndustry) score += 0.05;
  if (factors.synthetic) score -= 0.2;
  
  // Explicit confidence override
  if (factors.confidence === 'high') {
    score += 0.2;
  } else if (factors.confidence === 'medium') {
    score += 0.1;
  } else if (factors.confidence === 'low') {
    score -= 0.1;
  } else if (factors.confidence === 'very-low') {
    score -= 0.2;
  }
  
  // Ensure score is between 0.1 and 0.9
  return Math.max(0.1, Math.min(0.9, score));
};

/**
 * Determine GO/NO-GO decision based on market sizing
 * 
 * @param {Object} marketSizing - Market sizing data (tam, sam, som)
 * @returns {Object} Decision with recommendation and factors
 */
const determineGoNoGoDecision = (marketSizing) => {
  const { tam, sam, som } = marketSizing;
  
  // Calculate scores for different factors (0-25 points each)
  
  // Market size scoring (0-25 points)
  let marketSizeScore = 0;
  if (som.value >= 1e9) { // Over $1B
    marketSizeScore = 25;
  } else if (som.value >= 1e8) { // Over $100M
    marketSizeScore = 20;
  } else if (som.value >= 5e7) { // Over $50M
    marketSizeScore = 15;
  } else if (som.value >= 1e7) { // Over $10M
    marketSizeScore = 10;
  } else if (som.value >= 1e6) { // Over $1M
    marketSizeScore = 5;
  }
  
  // Growth potential scoring (0-25 points)
  let growthScore = 0;
  if (tam.growthRate >= 0.2) { // Over 20% growth
    growthScore = 25;
  } else if (tam.growthRate >= 0.1) { // Over 10% growth
    growthScore = 20;
  } else if (tam.growthRate >= 0.05) { // Over 5% growth
    growthScore = 15;
  } else if (tam.growthRate >= 0.02) { // Over 2% growth
    growthScore = 10;
  } else if (tam.growthRate >= 0) { // Any positive growth
    growthScore = 5;
  }
  
  // Market accessibility scoring (0-25 points)
  let accessibilityScore = 0;
  const marketReachConversion = (som.marketingReach || 0.1) * (som.conversionRate || 0.05);
  if (marketReachConversion >= 0.01) { // 1% of market reachable and convertible
    accessibilityScore = 25;
  } else if (marketReachConversion >= 0.005) { // 0.5%
    accessibilityScore = 20;
  } else if (marketReachConversion >= 0.001) { // 0.1%
    accessibilityScore = 15;
  } else if (marketReachConversion >= 0.0005) { // 0.05%
    accessibilityScore = 10;
  } else {
    accessibilityScore = 5;
  }
  
  // Competitive landscape scoring (0-25 points)
  let competitiveScore = 0;
  if (som.competitiveFactor >= 0.1) { // Can capture 10%+
    competitiveScore = 25;
  } else if (som.competitiveFactor >= 0.05) { // Can capture 5%+
    competitiveScore = 20;
  } else if (som.competitiveFactor >= 0.02) { // Can capture 2%+
    competitiveScore = 15;
  } else if (som.competitiveFactor >= 0.01) { // Can capture 1%+
    competitiveScore = 10;
  } else {
    competitiveScore = 5;
  }
  
  // Calculate total score (0-100)
  const totalScore = marketSizeScore + growthScore + accessibilityScore + competitiveScore;
  
  // Determine key factors and risks
  const keyFactors = [];
  const riskFactors = [];
  
  // Add key positive factors
  if (marketSizeScore >= 15) keyFactors.push('Large market opportunity');
  if (growthScore >= 15) keyFactors.push('Strong market growth');
  if (accessibilityScore >= 15) keyFactors.push('Good market accessibility');
  if (competitiveScore >= 15) keyFactors.push('Favorable competitive landscape');
  
  // Add risk factors
  if (marketSizeScore < 10) riskFactors.push('Limited market size');
  if (growthScore < 10) riskFactors.push('Slow or negative market growth');
  if (accessibilityScore < 10) riskFactors.push('Difficult market to reach/convert');
  if (competitiveScore < 10) riskFactors.push('Challenging competitive landscape');
  
  // Add data quality risk if synthetic
  if (tam.synthetic) {
    riskFactors.push('Limited market data available - validation recommended');
  }
  
  // Make GO/NO-GO decision
  let recommendation;
  if (totalScore >= 75) {
    recommendation = 'STRONG GO';
  } else if (totalScore >= 60) {
    recommendation = 'GO';
  } else if (totalScore >= 40) {
    recommendation = 'CONDITIONAL GO';
  } else {
    recommendation = 'NO-GO';
  }
  
  return {
    recommendation,
    score: totalScore,
    keyFactors,
    riskFactors,
    factors: {
      marketSizeScore,
      growthScore,
      accessibilityScore,
      competitiveScore
    }
  };
};

module.exports = {
  calculateTAM,
  calculateSAM,
  calculateSOM,
  calculateMarketSize,
  determineGoNoGoDecision
};