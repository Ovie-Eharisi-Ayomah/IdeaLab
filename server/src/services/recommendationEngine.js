// src/services/recommendationEngine.js - Enhanced with LLM-powered insights

const { ChatOpenAI } = require('@langchain/openai');
const { ChatAnthropic } = require('@langchain/anthropic');

/**
 * Enhanced recommendation engine that uses LLM insights first, then falls back to rule-based scoring
 * @param {Object} analysisData - Complete analysis data from all modules
 * @param {Object} options - Configuration options
 * @returns {Promise<Object>} Comprehensive recommendation with LLM insights and scores
 */
async function generateRecommendation(analysisData, options = {}) {
  const startTime = Date.now();
  
  try {
    // Step 1: Try LLM-powered insights first
    const llmInsights = await generateLLMInsights(analysisData, options);
    
    // Step 2: Calculate rule-based scores as backup/validation
    const ruleBasedScores = calculateRuleBasedScores(analysisData);
    
    // Step 3: Combine LLM insights with rule-based validation
    const finalRecommendation = combineInsights(llmInsights, ruleBasedScores, analysisData);
    
    // Step 4: Add enhanced metadata and quality checks
    const enhancedRecommendation = {
      ...finalRecommendation,
      // Enhanced market timing analysis
      market_timing: assessMarketTiming(analysisData),
      // Risk-adjusted confidence scoring
      risk_adjusted_score: calculateRiskAdjustedScore(finalRecommendation, analysisData),
      // Competitive positioning insights
      competitive_positioning: analyzeCompetitivePositioning(analysisData),
      metadata: {
        generatedAt: new Date().toISOString(),
        processingTimeMs: Date.now() - startTime,
        dataQuality: assessDataQuality(analysisData),
        llmInsights: llmInsights ? 'success' : 'failed',
        fallbackUsed: !llmInsights,
        // Dynamic confidence based on data quality
        confidence_factors: calculateConfidenceFactors(analysisData)
      }
    };
    
    return enhancedRecommendation;
    
  } catch (error) {
    console.error('Error generating recommendation:', error);
    
    // Fallback to rule-based only
    const ruleBasedScores = calculateRuleBasedScores(analysisData);
    return {
      ...ruleBasedScores,
      recommendation: ruleBasedScores.recommendation + ' (LLM analysis unavailable)',
      market_timing: assessMarketTiming(analysisData),
      risk_adjusted_score: calculateRiskAdjustedScore(ruleBasedScores, analysisData),
      competitive_positioning: analyzeCompetitivePositioning(analysisData),
      metadata: {
        generatedAt: new Date().toISOString(),
        processingTimeMs: Date.now() - startTime,
        dataQuality: assessDataQuality(analysisData),
        llmInsights: 'error',
        fallbackUsed: true,
        error: error.message,
        confidence_factors: calculateConfidenceFactors(analysisData)
      }
    };
  }
}

/**
 * Generate insights using LLM analysis
 * @param {Object} analysisData - Complete analysis data
 * @param {Object} options - Configuration options
 * @returns {Promise<Object>} LLM-generated insights
 */
async function generateLLMInsights(analysisData, options) {
  try {
    const prompt = buildInsightPrompt(analysisData);
    
    // Try OpenAI first, then Anthropic fallback
    let llm;
    try {
      llm = new ChatOpenAI({
        modelName: options.model || 'gpt-4o',
        temperature: 0.1,
        maxTokens: 2000
      });
    } catch (error) {
      console.log('OpenAI unavailable, trying Anthropic...');
      llm = new ChatAnthropic({
        modelName: 'claude-3-5-sonnet-20241022',
        temperature: 0.1,
        maxTokens: 2000
      });
    }
    
    const response = await llm.invoke([{ role: 'user', content: prompt }]);
    const insights = parseInsightsResponse(response.content);
    
    return insights;
    
  } catch (error) {
    console.error('LLM insights generation failed:', error);
    return null;
  }
}

/**
 * Build comprehensive prompt for LLM analysis
 * @param {Object} analysisData - All analysis results
 * @returns {string} Formatted prompt
 */
function buildInsightPrompt(analysisData) {
  const { classification, segmentation, marketSize, competition, problemValidation } = analysisData;
  
  return `# Business Idea Analysis & Recommendation

You are an expert business analyst tasked with providing a comprehensive Go/No-Go recommendation based on detailed market research.

## Business Context
**Business Idea**: ${analysisData.businessIdea || 'Not provided'}
**Industry**: ${classification?.primaryIndustry || 'Unknown'} / ${classification?.secondaryIndustry || 'N/A'}
**Product Type**: ${classification?.productType || 'Unknown'}
**Target Audience**: ${classification?.targetAudience || 'Unknown'}

## Analysis Results

### Market Sizing Analysis
${formatMarketSizingData(marketSize)}

### Competitive Landscape
${formatCompetitionData(competition)}

### Problem Validation
${formatProblemValidationData(problemValidation)}

### Customer Segmentation
${formatSegmentationData(segmentation)}

## Your Task

Provide a comprehensive business recommendation in this EXACT JSON format:

{
  "recommendation": "GO" | "CONDITIONAL_GO" | "NO_GO",
  "confidence": 1-10,
  "score": 1-100,
  "key_insights": [
    "Insight 1",
    "Insight 2", 
    "Insight 3"
  ],
  "opportunities": [
    "Opportunity 1",
    "Opportunity 2"
  ],
  "risks": [
    "Risk 1",
    "Risk 2"
  ],
  "next_steps": [
    "Action 1",
    "Action 2",
    "Action 3"
  ],
  "reasoning": "2-3 sentence explanation of your recommendation",
  "market_readiness": "READY" | "EARLY" | "PREMATURE",
  "competitive_advantage": "Brief assessment of competitive positioning"
}

## Analysis Guidelines

1. **Market Size**: Consider TAM, SAM, SOM values and growth rates
2. **Competition**: Analyze number of competitors, market gaps, and barriers
3. **Problem Validation**: Evaluate problem severity, frequency, and willingness to pay
4. **Segmentation**: Consider target segment characteristics and market fit
5. **Integration**: Look for synergies and conflicts between different analyses

Provide actionable, specific insights based on the data provided. Be honest about limitations and data quality issues.`;
}

/**
 * Format market sizing data for LLM prompt
 */
function formatMarketSizingData(marketSize) {
  if (!marketSize || marketSize.status === 'error') {
    return "Market sizing data unavailable or error occurred.";
  }
  
  let formatted = "**Market Size Analysis:**\n";
  
  if (marketSize.tam) {
    formatted += `- TAM: ${marketSize.tam.formatted || marketSize.tam} (Total Addressable Market)\n`;
  }
  if (marketSize.sam) {
    formatted += `- SAM: ${marketSize.sam.formatted || marketSize.sam} (Serviceable Addressable Market)\n`;
  }
  if (marketSize.som) {
    formatted += `- SOM: ${marketSize.som.formatted || marketSize.som} (Serviceable Obtainable Market)\n`;
  }
  
  if (marketSize.market_data?.market_breakdown) {
    const breakdown = marketSize.market_data.market_breakdown;
    if (breakdown.growth_drivers) {
      formatted += `- Growth Drivers: ${breakdown.growth_drivers.join(', ')}\n`;
    }
    if (breakdown.market_challenges) {
      formatted += `- Market Challenges: ${breakdown.market_challenges.join(', ')}\n`;
    }
  }
  
  if (marketSize.confidence_score) {
    formatted += `- Confidence Score: ${marketSize.confidence_score}/10\n`;
  }
  
  return formatted;
}

/**
 * Format competition data for LLM prompt
 */
function formatCompetitionData(competition) {
  if (!competition || competition.status === 'error') {
    return "Competitive analysis data unavailable or error occurred.";
  }
  
  let formatted = "**Competitive Analysis:**\n";
  
  if (competition.competitors) {
    formatted += `- Number of Competitors: ${competition.competitors.length}\n`;
    formatted += `- Top Competitors: ${competition.competitors.slice(0, 3).map(c => c.name).join(', ')}\n`;
  }
  
  if (competition.market_gaps) {
    formatted += `- Market Gaps Identified: ${competition.market_gaps.length}\n`;
    competition.market_gaps.slice(0, 2).forEach(gap => {
      formatted += `  • ${gap}\n`;
    });
  }
  
  if (competition.barriers_to_entry) {
    formatted += `- Barriers to Entry: ${competition.barriers_to_entry.length}\n`;
    competition.barriers_to_entry.slice(0, 2).forEach(barrier => {
      formatted += `  • ${barrier}\n`;
    });
  }
  
  if (competition.market_concentration) {
    formatted += `- Market Concentration: ${competition.market_concentration}\n`;
  }
  
  if (competition.confidence_score) {
    formatted += `- Confidence Score: ${competition.confidence_score}/10\n`;
  }
  
  return formatted;
}

/**
 * Format problem validation data for LLM prompt
 */
function formatProblemValidationData(problemValidation) {
  if (!problemValidation || problemValidation.status === 'error') {
    return "Problem validation data unavailable or error occurred.";
  }
  
  let formatted = "**Problem Validation:**\n";
  
  const pv = problemValidation.problem_validation;
  if (pv) {
    formatted += `- Problem Exists: ${pv.exists ? 'Yes' : 'No'}\n`;
    if (pv.severity) formatted += `- Problem Severity: ${pv.severity}/10\n`;
    if (pv.frequency) formatted += `- Problem Frequency: ${pv.frequency}/10\n`;
    if (pv.willingness_to_pay) formatted += `- Willingness to Pay: ${pv.willingness_to_pay}\n`;
  }
  
  if (problemValidation.evidence) {
    formatted += `- Evidence Sources: ${problemValidation.evidence.length}\n`;
  }
  
  if (problemValidation.alternative_solutions) {
    formatted += `- Alternative Solutions: ${problemValidation.alternative_solutions.length}\n`;
    problemValidation.alternative_solutions.slice(0, 2).forEach(solution => {
      if (solution.name) formatted += `  • ${solution.name}\n`;
    });
  }
  
  if (problemValidation.confidence_score) {
    formatted += `- Confidence Score: ${problemValidation.confidence_score}/10\n`;
  }
  
  return formatted;
}

/**
 * Format segmentation data for LLM prompt
 */
function formatSegmentationData(segmentation) {
  if (!segmentation || !segmentation.primarySegments) {
    return "Customer segmentation data unavailable.";
  }
  
  let formatted = "**Customer Segmentation:**\n";
  
  segmentation.primarySegments.slice(0, 3).forEach((segment, index) => {
    formatted += `- Segment ${index + 1}: ${segment.name} (${segment.percentage}%)\n`;
    if (segment.characteristics) {
      formatted += `  • ${segment.characteristics}\n`;
    }
    if (segment.growthPotential) {
      formatted += `  • Growth Potential: ${segment.growthPotential}\n`;
    }
  });
  
  return formatted;
}

/**
 * Parse LLM response into structured insights
 */
function parseInsightsResponse(response) {
  try {
    // Extract JSON from response (handle markdown code blocks)
    const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/) || response.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
      throw new Error('No JSON found in LLM response');
    }
    
    const insights = JSON.parse(jsonMatch[1] || jsonMatch[0]);
    
    // Validate required fields
    const required = ['recommendation', 'confidence', 'score', 'reasoning'];
    for (const field of required) {
      if (!insights[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }
    
    // Normalize recommendation values
    const normalizedRec = insights.recommendation.toUpperCase().replace(/[^A-Z_]/g, '');
    if (!['GO', 'CONDITIONAL_GO', 'NO_GO'].includes(normalizedRec)) {
      insights.recommendation = insights.score >= 70 ? 'GO' : insights.score >= 40 ? 'CONDITIONAL_GO' : 'NO_GO';
    } else {
      insights.recommendation = normalizedRec;
    }
    
    return insights;
    
  } catch (error) {
    console.error('Failed to parse LLM insights:', error);
    return null;
  }
}

/**
 * Calculate rule-based scores as fallback/validation
 */
function calculateRuleBasedScores(analysisData) {
  let score = 0;
  let maxScore = 0;
  let reasons = [];
  let risks = [];
  
  const { marketSize, competition, problemValidation, segmentation } = analysisData;
  
  // Market size factors (35 points)
  if (marketSize && marketSize.status !== 'error') {
    maxScore += 35;
    
    // Extract TAM value (try different formats)
    let tamValue = 0;
    if (marketSize.tam?.value) {
      tamValue = marketSize.tam.value;
    } else if (marketSize.market_data?.market_breakdown?.tam) {
      tamValue = marketSize.market_data.market_breakdown.tam * 1e9; // Convert billions to dollars
    }
    
    // TAM scoring (20 points)
    if (tamValue >= 1e12) { // $1T+
      score += 20;
      reasons.push('Massive market opportunity (>$1T TAM)');
    } else if (tamValue >= 1e11) { // $100B+
      score += 18;
      reasons.push('Large market opportunity ($100B+ TAM)');
    } else if (tamValue >= 1e10) { // $10B+
      score += 15;
      reasons.push('Significant market opportunity ($10B+ TAM)');
    } else if (tamValue >= 1e9) { // $1B+
      score += 10;
      reasons.push('Decent market size ($1B+ TAM)');
    } else if (tamValue > 0) {
      score += 5;
      reasons.push('Small market size');
      risks.push('Limited market size may constrain growth');
    }
    
    // Growth rate scoring (15 points)
    let growthRate = 0;
    if (marketSize.market_data?.market_breakdown?.growth_rate) {
      growthRate = parseFloat(marketSize.market_data.market_breakdown.growth_rate) / 100;
    } else if (marketSize.tam?.growth_rate?.value) {
      growthRate = marketSize.tam.growth_rate.value / 100;
    }
    
    if (growthRate >= 0.2) { // 20%+
      score += 15;
      reasons.push(`Excellent market growth (${(growthRate*100).toFixed(1)}%)`);
    } else if (growthRate >= 0.1) { // 10%+
      score += 12;
      reasons.push(`Strong market growth (${(growthRate*100).toFixed(1)}%)`);
    } else if (growthRate >= 0.05) { // 5%+
      score += 8;
      reasons.push(`Moderate market growth (${(growthRate*100).toFixed(1)}%)`);
    } else if (growthRate > 0) {
      score += 4;
      reasons.push(`Slow market growth (${(growthRate*100).toFixed(1)}%)`);
    } else {
      risks.push('Stagnant or declining market growth');
    }
  } else {
    risks.push('Market sizing data unavailable');
  }
  
  // Competition factors (30 points)
  if (competition && competition.status !== 'error') {
    maxScore += 30;
    
    // Number of competitors (15 points)
    const competitorCount = competition.competitors?.length || 0;
    if (competitorCount === 0) {
      score += 15;
      reasons.push('No direct competitors identified');
    } else if (competitorCount <= 3) {
      score += 12;
      reasons.push(`Low competition (${competitorCount} major competitors)`);
    } else if (competitorCount <= 7) {
      score += 8;
      reasons.push(`Moderate competition (${competitorCount} competitors)`);
    } else {
      score += 4;
      reasons.push(`High competition (${competitorCount} competitors)`);
      risks.push('Crowded market with many competitors');
    }
    
    // Market gaps (15 points)
    const gapCount = competition.market_gaps?.length || 0;
    if (gapCount >= 3) {
      score += 15;
      reasons.push(`Multiple market gaps identified (${gapCount})`);
    } else if (gapCount >= 1) {
      score += 10;
      reasons.push(`Market gaps identified (${gapCount})`);
    } else {
      risks.push('No clear market gaps identified');
    }
  } else {
    risks.push('Competitive analysis data unavailable');
  }
  
  // Problem validation factors (35 points)
  if (problemValidation && problemValidation.status !== 'error') {
    maxScore += 35;
    
    const pv = problemValidation.problem_validation;
    if (pv) {
      // Problem existence (10 points)
      if (pv.exists) {
        score += 10;
        reasons.push('Problem confirmed to exist');
      } else {
        risks.push('Problem existence not validated');
      }
      
      // Problem severity (12 points)
      const severity = parseFloat(pv.severity) || 0;
      if (severity >= 8) {
        score += 12;
        reasons.push(`High problem severity (${severity}/10)`);
      } else if (severity >= 6) {
        score += 9;
        reasons.push(`Moderate problem severity (${severity}/10)`);
      } else if (severity >= 4) {
        score += 6;
        reasons.push(`Low problem severity (${severity}/10)`);
      } else {
        risks.push('Very low problem severity may limit adoption');
      }
      
      // Frequency (8 points)
      const frequency = parseFloat(pv.frequency) || 0;
      if (frequency >= 7) {
        score += 8;
        reasons.push(`High problem frequency (${frequency}/10)`);
      } else if (frequency >= 5) {
        score += 6;
        reasons.push(`Moderate problem frequency (${frequency}/10)`);
      } else if (frequency >= 3) {
        score += 3;
        reasons.push(`Low problem frequency (${frequency}/10)`);
      }
      
      // Willingness to pay (5 points)
      const wtpText = pv.willingness_to_pay || '';
      if (wtpText.includes('thousand') || wtpText.includes('$')) {
        score += 5;
        reasons.push('Strong willingness to pay indicated');
      } else if (wtpText.length > 10) {
        score += 3;
        reasons.push('Some willingness to pay indicated');
      }
    }
  } else {
    risks.push('Problem validation data unavailable');
  }
  
  // Normalize score
  const normalizedScore = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
  
  // Determine recommendation
  let recommendation;
  if (normalizedScore >= 75) {
    recommendation = 'GO';
  } else if (normalizedScore >= 50) {
    recommendation = 'CONDITIONAL_GO';
  } else {
    recommendation = 'NO_GO';
  }
  
  return {
    recommendation,
    score: normalizedScore,
    confidence: Math.min(10, Math.round(normalizedScore / 10)),
    key_insights: reasons.slice(0, 5),
    risks: risks.slice(0, 5),
    reasoning: `Based on ${reasons.length} positive factors and ${risks.length} risk factors identified.`,
    market_readiness: normalizedScore >= 70 ? 'READY' : normalizedScore >= 40 ? 'EARLY' : 'PREMATURE'
  };
}

/**
 * Combine LLM insights with rule-based validation
 */
function combineInsights(llmInsights, ruleBasedScores, analysisData) {
  if (!llmInsights) {
    return {
      ...ruleBasedScores,
      source: 'rule_based_only'
    };
  }
  
  // Use LLM insights as primary, but validate with rule-based scores
  const scoreDiff = Math.abs(llmInsights.score - ruleBasedScores.score);
  const scoreValidation = scoreDiff <= 30 ? 'consistent' : 'divergent';
  
  return {
    recommendation: llmInsights.recommendation,
    score: llmInsights.score,
    confidence: llmInsights.confidence,
    key_insights: llmInsights.key_insights || [],
    opportunities: llmInsights.opportunities || [],
    risks: llmInsights.risks || [],
    next_steps: llmInsights.next_steps || [],
    reasoning: llmInsights.reasoning,
    market_readiness: llmInsights.market_readiness || 'UNKNOWN',
    competitive_advantage: llmInsights.competitive_advantage || 'Not assessed',
    source: 'llm_enhanced',
    validation: {
      rule_based_score: ruleBasedScores.score,
      score_validation: scoreValidation,
      score_difference: scoreDiff
    }
  };
}

/**
 * Assess data quality for metadata
 */
function assessDataQuality(analysisData) {
  const modules = ['marketSize', 'competition', 'problemValidation', 'segmentation'];
  const available = modules.filter(module => 
    analysisData[module] && analysisData[module].status !== 'error'
  );
  
  return {
    modules_available: available.length,
    total_modules: modules.length,
    completeness: available.length / modules.length,
    missing_modules: modules.filter(module => !available.includes(module))
  };
}

/**
 * Assess market timing for the business idea
 */
function assessMarketTiming(analysisData) {
  const { marketSize, competition, problemValidation } = analysisData;
  
  let timing_score = 0;
  let timing_factors = [];
  let timing_risks = [];
  
  // Market growth momentum (40% weight)
  if (marketSize?.market_data?.market_breakdown?.growth_rate) {
    const growthRate = parseFloat(marketSize.market_data.market_breakdown.growth_rate);
    if (growthRate >= 20) {
      timing_score += 40;
      timing_factors.push(`Explosive market growth (${growthRate}%)`);
    } else if (growthRate >= 10) {
      timing_score += 30;
      timing_factors.push(`Strong market growth (${growthRate}%)`);
    } else if (growthRate >= 5) {
      timing_score += 20;
      timing_factors.push(`Moderate market growth (${growthRate}%)`);
    } else {
      timing_risks.push('Slow market growth may indicate poor timing');
    }
  }
  
  // Competition maturity (30% weight)
  if (competition?.competitors) {
    const competitorCount = competition.competitors.length;
    if (competitorCount === 0) {
      timing_score += 30;
      timing_factors.push('First-mover advantage opportunity');
    } else if (competitorCount <= 3) {
      timing_score += 25;
      timing_factors.push('Early market with limited competition');
    } else if (competitorCount <= 7) {
      timing_score += 15;
      timing_factors.push('Maturing market with moderate competition');
    } else {
      timing_risks.push('Saturated market may indicate late entry');
    }
  }
  
  // Problem urgency (30% weight)
  if (problemValidation?.problem_validation) {
    const severity = parseFloat(problemValidation.problem_validation.severity) || 0;
    const frequency = parseFloat(problemValidation.problem_validation.frequency) || 0;
    const urgency = (severity + frequency) / 2;
    
    if (urgency >= 8) {
      timing_score += 30;
      timing_factors.push('High problem urgency creates immediate demand');
    } else if (urgency >= 6) {
      timing_score += 20;
      timing_factors.push('Moderate problem urgency supports market entry');
    } else {
      timing_risks.push('Low problem urgency may delay market adoption');
    }
  }
  
  // Determine timing assessment
  let timing_assessment;
  if (timing_score >= 80) {
    timing_assessment = 'OPTIMAL';
  } else if (timing_score >= 60) {
    timing_assessment = 'GOOD';
  } else if (timing_score >= 40) {
    timing_assessment = 'FAIR';
  } else {
    timing_assessment = 'POOR';
  }
  
  return {
    assessment: timing_assessment,
    score: timing_score,
    factors: timing_factors,
    risks: timing_risks,
    recommendation: timing_score >= 60 ? 'Market timing is favorable' : 'Consider waiting for better market conditions'
  };
}

/**
 * Calculate risk-adjusted score based on identified risks
 */
function calculateRiskAdjustedScore(recommendation, analysisData) {
  let base_score = recommendation.score || 0;
  let risk_adjustment = 0;
  let risk_factors = [];
  
  const { marketSize, competition, problemValidation } = analysisData;
  
  // Market size risks
  if (marketSize?.market_data?.market_breakdown?.market_challenges) {
    const challenges = marketSize.market_data.market_breakdown.market_challenges;
    risk_adjustment -= challenges.length * 3;
    risk_factors.push(`Market challenges identified: ${challenges.length}`);
  }
  
  // Competition risks
  if (competition?.barriers_to_entry) {
    const barriers = competition.barriers_to_entry;
    risk_adjustment -= barriers.length * 4;
    risk_factors.push(`Barriers to entry: ${barriers.length}`);
  }
  
  // Problem validation risks
  if (problemValidation?.alternative_solutions) {
    const alternatives = problemValidation.alternative_solutions;
    if (alternatives.length >= 3) {
      risk_adjustment -= 8;
      risk_factors.push('Multiple alternative solutions exist');
    } else if (alternatives.length >= 1) {
      risk_adjustment -= 4;
      risk_factors.push('Some alternative solutions exist');
    }
  }
  
  // Data quality risk
  const dataQuality = assessDataQuality(analysisData);
  if (dataQuality.completeness < 0.75) {
    risk_adjustment -= 10;
    risk_factors.push('Incomplete data reduces confidence');
  }
  
  const adjusted_score = Math.max(0, Math.min(100, base_score + risk_adjustment));
  
  return {
    base_score,
    risk_adjustment,
    adjusted_score,
    risk_factors,
    confidence_impact: risk_adjustment < -15 ? 'HIGH' : risk_adjustment < -5 ? 'MEDIUM' : 'LOW'
  };
}

/**
 * Analyze competitive positioning opportunities
 */
function analyzeCompetitivePositioning(analysisData) {
  const { competition, marketSize, problemValidation, segmentation } = analysisData;
  
  let positioning_opportunities = [];
  let competitive_advantages = [];
  let positioning_risks = [];
  
  // Market gap analysis
  if (competition?.market_gaps) {
    competition.market_gaps.forEach(gap => {
      positioning_opportunities.push(`Address market gap: ${gap}`);
    });
  }
  
  // Competitor pricing analysis
  if (competition?.competitors) {
    const freeCompetitors = competition.competitors.filter(c => 
      c.pricing_model?.toLowerCase().includes('free')
    ).length;
    
    if (freeCompetitors > 0) {
      positioning_risks.push(`${freeCompetitors} competitors offer free options`);
    } else {
      competitive_advantages.push('No major free competitors identified');
    }
  }
  
  // Segmentation advantages
  if (segmentation?.primarySegments) {
    const highGrowthSegments = segmentation.primarySegments.filter(s => 
      s.growthPotential?.toLowerCase().includes('high')
    );
    
    if (highGrowthSegments.length > 0) {
      competitive_advantages.push(`${highGrowthSegments.length} high-growth segments identified`);
    }
  }
  
  // Problem validation advantages
  if (problemValidation?.problem_validation) {
    const severity = parseFloat(problemValidation.problem_validation.severity) || 0;
    if (severity >= 8) {
      competitive_advantages.push('High problem severity creates strong value proposition');
    }
  }
  
  return {
    opportunities: positioning_opportunities,
    advantages: competitive_advantages,
    risks: positioning_risks,
    strategy_recommendation: positioning_opportunities.length > 0 ? 
      'Focus on identified market gaps for differentiation' : 
      'Develop unique value proposition to stand out'
  };
}

/**
 * Calculate confidence factors based on data quality and consistency
 */
function calculateConfidenceFactors(analysisData) {
  const factors = {
    data_completeness: 0,
    data_consistency: 0,
    source_credibility: 0,
    analysis_depth: 0
  };
  
  // Data completeness (25%)
  const dataQuality = assessDataQuality(analysisData);
  factors.data_completeness = Math.round(dataQuality.completeness * 100);
  
  // Data consistency (25%) - Check for conflicting signals
  let consistency_score = 100;
  
  // Check market size vs competition consistency
  if (analysisData.marketSize?.market_data?.market_breakdown?.growth_rate && 
      analysisData.competition?.competitors) {
    const growthRate = parseFloat(analysisData.marketSize.market_data.market_breakdown.growth_rate);
    const competitorCount = analysisData.competition.competitors.length;
    
    // High growth with many competitors might be inconsistent
    if (growthRate > 20 && competitorCount > 10) {
      consistency_score -= 20;
    }
  }
  
  factors.data_consistency = Math.max(0, consistency_score);
  
  // Source credibility (25%)
  let credibility_score = 0;
  if (analysisData.problemValidation?.evidence) {
    const highCredSources = analysisData.problemValidation.evidence.filter(e => 
      e.credibility === 'High'
    ).length;
    credibility_score = Math.min(100, highCredSources * 50);
  }
  factors.source_credibility = credibility_score;
  
  // Analysis depth (25%)
  let depth_score = 0;
  if (analysisData.competition?.competitors?.length >= 3) depth_score += 25;
  if (analysisData.segmentation?.primarySegments?.length >= 2) depth_score += 25;
  if (analysisData.problemValidation?.evidence?.length >= 2) depth_score += 25;
  if (analysisData.marketSize?.market_data?.market_breakdown) depth_score += 25;
  
  factors.analysis_depth = depth_score;
  
  // Overall confidence
  const overall_confidence = Math.round(
    (factors.data_completeness + factors.data_consistency + 
     factors.source_credibility + factors.analysis_depth) / 4
  );
  
  return {
    ...factors,
    overall_confidence,
    confidence_level: overall_confidence >= 80 ? 'HIGH' : 
                     overall_confidence >= 60 ? 'MEDIUM' : 'LOW'
  };
}

module.exports = {
  generateRecommendation,
  calculateRuleBasedScores,
  assessDataQuality
};