// src/services/recommendationEngine.js

/**
 * Generate a go/no-go recommendation based on business analysis
 * @param {Object} data - The complete business analysis data
 * @returns {Object} Recommendation, score, and reasoning
 */
function generateRecommendation(data) {
  let score = 0;
  let maxScore = 0;
  let reasons = [];
  
  // Market size factors
  if (data.marketSize && !data.marketSize.error) {
    maxScore += 30;
    
    // Market size score (up to 15 points)
    if (data.marketSize.tam >= 1000000000) {
      score += 15;
      reasons.push(`Large total market size (${data.marketSize.tamFormatted})`);
    } else if (data.marketSize.tam >= 100000000) {
      score += 10;
      reasons.push(`Decent market size (${data.marketSize.tamFormatted})`);
    } else {
      score += 5;
      reasons.push(`Small market size (${data.marketSize.tamFormatted})`);
    }
    
    // Growth rate (up to 15 points)
    const growthRate = data.marketSize.growth_rate?.value || 0;
    if (growthRate >= 15) {
      score += 15;
      reasons.push(`Excellent growth rate (${growthRate}%)`);
    } else if (growthRate >= 7) {
      score += 10;
      reasons.push(`Good growth rate (${growthRate}%)`);
    } else {
      score += 5;
      reasons.push(`Modest growth rate (${growthRate}%)`);
    }
  }
  
  // Competition factors
  if (data.competition && data.competition.competitors) {
    maxScore += 30;
    
    // Number of competitors (up to 10 points)
    const competitorCount = data.competition.competitors.length;
    if (competitorCount <= 3) {
      score += 10;
      reasons.push(`Low competition (${competitorCount} major competitors)`);
    } else if (competitorCount <= 7) {
      score += 7;
      reasons.push(`Moderate competition (${competitorCount} competitors)`);
    } else {
      score += 3;
      reasons.push(`Highly competitive market (${competitorCount} competitors)`);
    }
    
    // Market gaps (up to 20 points)
    if (data.competition.market_gaps && data.competition.market_gaps.length > 0) {
      const gapPoints = Math.min(data.competition.market_gaps.length * 5, 20);
      score += gapPoints;
      reasons.push(`Identified ${data.competition.market_gaps.length} market gaps to exploit`);
    }
  }
  
  // Problem validation factors
  if (data.problemValidation && data.problemValidation.problem_validation) {
    maxScore += 40;
    
    // Problem exists (up to 10 points)
    if (data.problemValidation.problem_validation.exists) {
      score += 10;
      reasons.push("Problem confirmed to exist");
    }
    
    // Problem severity (up to 15 points)
    const severity = data.problemValidation.problem_validation.severity || 0;
    const severityPoints = Math.round(severity * 1.5);
    score += severityPoints;
    reasons.push(`Problem severity: ${severity}/10`);
    
    // Willingness to pay (up to 15 points)
    const wtp = data.problemValidation.problem_validation.willingness_to_pay || 0;
    const wtpPoints = Math.round(wtp * 1.5);
    score += wtpPoints;
    reasons.push(`Willingness to pay: ${wtp}/10`);
  }
  
  // Normalize score if we don't have all components
  const normalizedScore = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
  
  // Add risk factors
  const riskFactors = identifyRiskFactors(data);
  
  // Final recommendation
  let recommendation = '';
  if (normalizedScore >= 75) {
    recommendation = 'GO - Strong opportunity detected';
  } else if (normalizedScore >= 50) {
    recommendation = 'PROCEED WITH CAUTION - Moderate opportunity with risks';
  } else {
    recommendation = 'NO-GO - Significant challenges identified';
  }
  
  return {
    score: normalizedScore,
    recommendation: recommendation,
    reasons: reasons,
    riskFactors: riskFactors
  };
}

/**
 * Identify specific risk factors based on analysis data
 * @param {Object} data - The complete business analysis data
 * @returns {Array} List of risk factors
 */
function identifyRiskFactors(data) {
  const risks = [];
  
  // Market risks
  if (data.marketSize) {
    if (data.marketSize.tam < 50000000) {
      risks.push("Small total market limits growth potential");
    }
    
    if (data.marketSize.growth_rate?.value < 5) {
      risks.push("Low market growth rate may indicate market saturation");
    }
    
    if (data.marketSize.confidence < 6) {
      risks.push("Low confidence in market size data - further research needed");
    }
  }
  
  // Competition risks
  if (data.competition) {
    if (data.competition.competitors?.length > 10) {
      risks.push("Highly fragmented market with many competitors");
    }
    
    if (data.competition.market_concentration === "Highly concentrated") {
      risks.push("Market dominated by few large players - difficult to penetrate");
    }
    
    const wellFundedCount = (data.competition.competitors || []).filter(
      c => c.funding && c.funding.includes("million") || c.funding.includes("billion")
    ).length;
    
    if (wellFundedCount >= 3) {
      risks.push(`${wellFundedCount} well-funded competitors with deep pockets`);
    }
  }
  
  // Problem risks
  if (data.problemValidation && data.problemValidation.problem_validation) {
    if (data.problemValidation.problem_validation.severity < 5) {
      risks.push("Problem not severe enough to drive strong adoption");
    }
    
    if (data.problemValidation.problem_validation.willingness_to_pay < 5) {
      risks.push("Low willingness to pay may create monetization challenges");
    }
    
    const alternativesCount = data.problemValidation.alternative_solutions?.length || 0;
    if (alternativesCount > 5) {
      risks.push(`Many alternative solutions (${alternativesCount}) already exist`);
    }
  }
  
  return risks;
}

module.exports = {
  generateRecommendation,
  identifyRiskFactors
};