/**
 * Data Transformer Utilities
 * 
 * Functions to transform backend API responses to the format expected by frontend components.
 * Handles snake_case to camelCase conversion, data normalization, and provides sensible defaults
 * for missing data to ensure UI components don't break.
 */

// Define and export the main AnalysisResult interface
export interface AnalysisResult {
  businessIdea: string;
  analysisDate: string;
  score: number;
  primaryIndustry: string;
  secondaryIndustry: string;
  productType: string;
  targetAudience: string;
  insights: {
    segmentation: string | null; // Allow null if no data
    problem: string | null;    // Allow null if no data
    competition: string | null; // Allow null if no data
    market: string | null;     // Allow null if no data
    error?: string;
  };
  recommendations: Array<{
    type: 'positive' | 'warning' | 'negative';
    title: string;
    description: string;
  }>;
  // Add the section-specific transformed data, allowing for null
  marketData: any | null;
  competitionData: any | null;
  problemData: any | null;
  segmentationData: any | null;
  // Add status and error from the job
  status: 'processing' | 'complete' | 'failed';
  error?: string | null;
}

/**
 * Helper function to convert snake_case keys to camelCase
 */
function toCamelCase(str: string): string {
  return str.replace(/([-_][a-z])/g, (group) =>
    group.toUpperCase().replace('-', '').replace('_', '')
  );
}

/**
 * Helper function to deeply convert object keys from snake_case to camelCase
 */
function convertKeysToCamelCase(obj: any): any {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(convertKeysToCamelCase);
  }

  const camelCaseObj: Record<string, any> = {};
  Object.keys(obj).forEach(key => {
    const camelCaseKey = toCamelCase(key);
    camelCaseObj[camelCaseKey] = convertKeysToCamelCase(obj[key]);
  });

  return camelCaseObj;
}

/**
 * Helper to format numbers into currency strings
 */
function formatCurrency(value: number, abbreviate: boolean = true): string {
  if (abbreviate) {
    if (value >= 1_000_000_000) {
      return `$${(value / 1_000_000_000).toFixed(1)}B`;
    } else if (value >= 1_000_000) {
      return `$${(value / 1_000_000).toFixed(1)}M`;
    } else if (value >= 1_000) {
      return `$${(value / 1_000).toFixed(1)}K`;
    }
  }
  return `$${value.toLocaleString()}`;
}

/**
 * Transform market sizing data from backend to the format expected by MarketSizingSection component
 */
export function transformMarketData(backendData: any): any | null {
  if (!backendData || backendData.status === 'error') {
    // If backend indicates an error or no data, check for raw sources
    if (!backendData?.market_data?.sources || backendData.market_data.sources.length === 0) {
      console.warn("MarketSizing: No backend calculations and no sources for frontend calculation. Returning null.");
      return null; // Critical data missing for any calculation
    }
  }

  const hasBackendCalculations = !!(backendData.tam && backendData.sam && backendData.som);
  let tamData, samData, somData, confidenceScore;
  let calculationSource = "Error: Calculation not performed";
  let marketDataForUI = { ...(backendData || {}) }; // Start with backend data or empty obj

  if (hasBackendCalculations) {
    console.log("MarketSizing: Using backend TAM/SAM/SOM calculations");
    tamData = backendData.tam;
    samData = backendData.sam;
    somData = backendData.som;
    confidenceScore = backendData.confidence_score;
    calculationSource = "Calculated using sophisticated statistical modeling";
    if (backendData.error) {
      marketDataForUI.hasError = true;
      marketDataForUI.errorMessage = backendData.error;
      calculationSource = "Backend calculation error, using provided values with caution";
    }
  } else if (backendData?.market_data?.sources && backendData.market_data.sources.length > 0) {
    console.log("MarketSizing: Falling back to frontend TAM/SAM/SOM calculations from sources");
    const sources = backendData.market_data.sources;
    const marketSizes = sources.map((source: any) => {
      const size = parseFloat(source.market_size);
      const unit = (source.market_size_unit || "").toLowerCase();
      if (isNaN(size)) return 0;
      if (unit === "billion") return size * 1_000_000_000;
      if (unit === "million") return size * 1_000_000;
      return size;
    }).filter((size: number) => size > 0);

    const growthRates = sources
      .map((source: any) => parseFloat(source.growth_rate))
      .filter((rate: number) => !isNaN(rate) && rate > 0);

    if (marketSizes.length === 0) {
      console.warn("MarketSizing: No valid market size data in sources for frontend calculation. Returning null.");
      return null;
    }

    const avgMarketSize = marketSizes.reduce((sum: number, size: number) => sum + size, 0) / marketSizes.length;
    const avgGrowthRate = growthRates.length > 0 ? growthRates.reduce((sum: number, rate: number) => sum + rate, 0) / growthRates.length : 0; // Default to 0 if no valid rates
    
    const samMultipliers = backendData.assumptions?.sam_multipliers || { geographic: 0.4, segments: 0.9, techAdoption: 0.85 };
    const samValue = avgMarketSize * samMultipliers.geographic * samMultipliers.segments * samMultipliers.techAdoption;
    const somMultipliers = backendData.assumptions?.som_multipliers || { newEntrant: 0.03, marketingReach: 0.23, conversion: 0.08 };
    const somValue = samValue * somMultipliers.newEntrant * somMultipliers.marketingReach * somMultipliers.conversion;

    tamData = {
      value: avgMarketSize,
      low: avgMarketSize * 0.5,
      high: avgMarketSize * 1.5,
      formatted: formatCurrency(avgMarketSize),
      range: `${formatCurrency(avgMarketSize * 0.5)} - ${formatCurrency(avgMarketSize * 1.5)}`,
      growth_rate: { value: avgGrowthRate, formatted: `${avgGrowthRate.toFixed(1)}%` },
      sources_count: sources.length,
      outliers_count: 0 
    };
    samData = {
      value: samValue,
      low: samValue * 0.7,
      high: samValue * 1.3,
      formatted: formatCurrency(samValue),
      range: `${formatCurrency(samValue * 0.7)} - ${formatCurrency(samValue * 1.3)}`,
      multipliers: samMultipliers
    };
    somData = {
      value: somValue,
      low: somValue * 0.5,
      high: somValue * 2.0,
      formatted: formatCurrency(somValue),
      range: `${formatCurrency(somValue * 0.5)} - ${formatCurrency(somValue * 2.0)}`,
      multipliers: somMultipliers
    };
    confidenceScore = backendData.market_data.confidence_score; // Use score from market_data if available
    calculationSource = "Estimated from available market research sources";
    marketDataForUI.hasError = !!backendData.market_data.calculation_error;
    marketDataForUI.errorMessage = backendData.market_data.calculation_error;
  } else {
    console.warn("MarketSizing: Insufficient data for any calculation. Returning null.");
    return null;
  }

  const growthRateValue = tamData.growth_rate?.value || 0;
  const geographicData = [
    { name: 'North America', value: 40, color: '#3b82f6' },
    { name: 'Europe', value: 30, color: '#10b981' },
    { name: 'Asia', value: 20, color: '#f59e0b' },
    { name: 'Rest of World', value: 10, color: '#6366f1' }
  ];
  const currentYear = new Date().getFullYear();
  const growthData = Array.from({ length: 10 }, (_, i) => {
    const year = currentYear + i;
    const market = (tamData.value / 1_000_000_000) * Math.pow(1 + growthRateValue / 100, i);
    return { year, market: parseFloat(market.toFixed(2)) };
  });

  return {
    ...marketDataForUI, // Includes original market_data.sources if present
    sizingCalculation: {
      tam: tamData,
      sam: samData,
      som: somData,
      confidence_score: confidenceScore
    },
    marketSizeData: [
      { name: 'TAM', value: tamData.value / 1_000_000_000, displayValue: tamData.formatted, description: 'Total Addressable Market' },
      { name: 'SAM', value: samData.value / 1_000_000_000, displayValue: samData.formatted, description: 'Serviceable Addressable Market' },
      { name: 'SOM', value: somData.value / 1_000_000_000, displayValue: somData.formatted, description: 'Serviceable Obtainable Market' }
    ],
    geographicData,
    growthData,
    averageGrowthRate: growthRateValue,
    tamPotential: (tamData.value * Math.pow(1 + growthRateValue / 100, 5)) / 1_000_000_000,
    calculationSource
  };
}

/**
 * Transform competition data from backend to the format expected by CompetitionSection component
 */
export function transformCompetitionData(backendData: any): any | null {
  if (!backendData || backendData.status === 'error' || !backendData.competitors || backendData.competitors.length === 0) {
    console.warn("Competition: Backend data indicates error or no competitors. Returning null.");
    return null;
  }

  const competitionData = { ...(backendData || {}) };

  competitionData.competitors = (competitionData.competitors || []).map((competitor: any, index: number) => {
    const marketShare = competitor.marketShare || competitor.market_share; // Use provided, no default index-based
    return {
      name: competitor.name || `Competitor ${index + 1}`,
      website: competitor.website || "N/A",
      products: competitor.products || [],
      target_audience: competitor.target_audience || competitor.targetAudience || "General consumers",
      pricing_model: competitor.pricing_model || competitor.pricingModel || "Unknown pricing model",
      unique_selling_points: competitor.unique_selling_points || competitor.uniqueSellingPoints || [],
      market_position: competitor.market_position || competitor.marketPosition || "Market participant",
      founded: competitor.founded || null,
      funding: competitor.funding || "",
      marketShare: marketShare, // Can be undefined if not provided
      strengths: competitor.strengths || [], // No defaults
      weaknesses: competitor.weaknesses || []  // No defaults
    };
  });
  
  // Do not add default competitors, market_gaps, barriers_to_entry, emerging_trends
  competitionData.market_gaps = competitionData.market_gaps || [];
  competitionData.barriers_to_entry = competitionData.barriers_to_entry || [];
  competitionData.emerging_trends = competitionData.emerging_trends || [];
  competitionData.market_concentration = competitionData.market_concentration || "Unknown";
  competitionData.confidence_score = backendData.confidence_score; // Use only backend score

  const enhancedCompetitors = competitionData.competitors;
  const marketShareData = enhancedCompetitors
    .filter((c: any) => typeof c.marketShare === 'number') // Only include if marketShare is present
    .map((competitor: any, index: number) => ({
      name: competitor.name,
      value: competitor.marketShare,
      color: ['#3b82f6', '#10b981', '#f59e0b', '#6366f1', '#94a3b8'][index % 5]
  }));

  // Radar data could be based on dynamic features or a fixed set if no dynamic data is available from backend
  // For now, retain fixed set but it could be made dynamic or removed if backend doesn't support it
  const radarData = [
    { subject: 'Reliability', 'Your Idea': 8, 'Competitor Avg': 6 }, // Example values
    { subject: 'Affordability', 'Your Idea': 7, 'Competitor Avg': 7 },
    { subject: 'Convenience', 'Your Idea': 9, 'Competitor Avg': 7 },
  ].map(item => ({ ...item }));

  return {
    ...competitionData,
    enhancedCompetitors,
    marketShareData: marketShareData.length > 0 ? marketShareData : [], // ensure it's an array
    radarData
  };
}

/**
 * Transform problem validation data from backend to the format expected by ProblemSection component
 */
export function transformProblemData(backendData: any): any | null {
  if (!backendData || backendData.status === 'error' || !backendData.problem_validation) {
    console.warn("ProblemValidation: Backend data indicates error or missing problem_validation. Returning null.");
    return null;
  }
  
  const problemData = { ...(backendData || {}) };
  const pv = backendData.problem_validation || {};

  // Prioritize 'severity' and 'frequency' but fallback to 'severity_score' and 'frequency_score'
  const severity = pv.severity !== undefined ? pv.severity : pv.severity_score;
  const frequency = pv.frequency !== undefined ? pv.frequency : pv.frequency_score;

  if (severity === undefined || frequency === undefined) {
    console.warn("ProblemValidation: Severity or Frequency missing. Returning null.");
    return null; // Essential metrics missing
  }

  const severityScore = Math.min(10, Math.max(0, Math.round(severity || 0)));
  const frequencyScore = Math.min(10, Math.max(0, Math.round(frequency || 0)));

  const problemValidityScore = Math.round((severityScore + frequencyScore) / 2);
  let marketFit = "Low";
  if (problemValidityScore >= 8) marketFit = "High";
  else if (problemValidityScore >= 6) marketFit = "Medium";

  // Use backend evidence structure: source, type, date, quotes
  const evidence = (pv.evidence || []).map((item: any) => ({
    source: item.source || "Unknown Source",
    type: item.type || "Unknown Type",
    date: item.date || "Unknown Date",
    quotes: item.quotes || [],
    // If other fields were expected by component, they might be missing or need defaults here
    // For now, sticking to what was requested to be preserved.
  }));

  // Use backend alternative_solutions structure: name, approach, limitations
  const alternativeSolutions = (pv.alternative_solutions || []).map((item: any) => ({
    name: item.name || "Unknown Solution",
    approach: item.approach || "N/A",
    limitations: item.limitations || "N/A",
  }));
  
  return {
    ...problemData, // Includes original top-level fields like problem_statement, problem_statement_feedback
    problem_validation: {
      // Keep all original pv fields, then add/override transformed ones
      ...pv, 
      severity: severityScore, // Standardized to severity for component if needed, or use severity_score
      frequency: frequencyScore, // Standardized to frequency for component
      severity_score: severityScore, // Keep score versions for consistency if other parts rely on them
      frequency_score: frequencyScore,
      problem_validity_score: problemValidityScore,
      market_fit: marketFit,
      evidence: evidence, // Transformed evidence
      alternative_solutions: alternativeSolutions, // Transformed solutions
      confidence_level: pv.confidence_level // Use only backend confidence_level, no default
    }
  };
}

/**
 * Transform segmentation data from backend to the format expected by SegmentationSection component
 */
export function transformSegmentationData(backendData: any): any | null {
  if (!backendData || backendData.status === 'error' || !backendData.primarySegments || backendData.primarySegments.length === 0) {
     console.warn("Segmentation: Backend data indicates error or no primary_segments. Returning null.");
    return null;
  }

  const segmentationData = { ...(backendData || {}) };

  let totalPercentage = 0;
  segmentationData.primarySegments = segmentationData.primarySegments.map((segment: any) => {
    const percentage = typeof segment.percentage === 'number' ? segment.percentage : parseInt(segment.percentage, 10) || 0;
    totalPercentage += percentage;
    return {
      ...segment,
      // Preserve characteristics as an object if it is one, otherwise keep as is.
      characteristics: typeof segment.characteristics === 'object' && !Array.isArray(segment.characteristics) 
                       ? segment.characteristics 
                       : (segment.characteristics || {}), // Default to empty object if undefined
      percentage
    };
  });

  if (totalPercentage !== 100 && totalPercentage > 0 && segmentationData.primarySegments.length > 0) {
    const factor = 100 / totalPercentage;
    segmentationData.primarySegments = segmentationData.primarySegments.map((segment: any) => ({
      ...segment,
      percentage: Math.round(segment.percentage * factor)
    }));
    // Recalculate totalPercentage to ensure it's close to 100 after rounding
    let finalTotal = segmentationData.primarySegments.reduce((sum:number, s:any) => sum + s.percentage, 0);
    // Adjust the largest segment if needed due to rounding to make it sum to 100
    if (finalTotal !== 100 && segmentationData.primarySegments.length > 0) {
        const diff = 100 - finalTotal;
        segmentationData.primarySegments[0].percentage += diff;
    }
  }

  const segmentColors = ['#3b82f6', '#10b981', '#f59e0b', '#6366f1', '#94a3b8'];
  const pieChartData = segmentationData.primarySegments.map((segment: any, index: number) => ({
    name: segment.name,
    value: segment.percentage,
    color: segmentColors[index % segmentColors.length]
  })); 
  
  // Remove default segment_analysis.confidence_score, use backend if provided
  const segmentAnalysis = backendData.segment_analysis ? {
      ...backendData.segment_analysis,
      confidence_score: backendData.segment_analysis.confidence_score // No default
  } : { confidence_score: undefined }; // Explicitly undefined if no backend data

  return {
    ...segmentationData,
    pieChartData,
    segment_analysis: segmentAnalysis,
    selectedSegmentIndex: 0 // UI helper, can remain
  };
}

/**
 * Main transformer that combines all individual transformers
 * to convert a complete job result to the format expected by the dashboard
 */
export function transformJobToAnalysisResult(job: any): AnalysisResult {
  if (!job) {
    return {
      status: 'failed',
      error: 'Job data is missing',
      businessIdea: "Analysis Unavailable",
      analysisDate: new Date().toISOString(), score: 0, primaryIndustry: "N/A", secondaryIndustry: "N/A", productType: "N/A",
      targetAudience: "N/A",
      insights: { segmentation: null, problem: null, competition: null, market: null, error: "Job data missing" },
      recommendations: [],
      marketData: null, competitionData: null, problemData: null, segmentationData: null
    };
  }
  
  // Correctly access the nested classification data
  const rawClassification = job.results?.classification || {};
  const classificationDetails = rawClassification.classification || {}; // Access the inner object

  // Attempt to transform each section. They will return null if data is insufficient.
  const marketData = transformMarketData(job.results?.marketSize);
  const competitionData = transformCompetitionData(job.results?.competition);
  const problemData = transformProblemData(job.results?.problemValidation ? {
    ...job.results.problemValidation, 
    problem_statement: job.input?.problemStatement || job.results.problemValidation?.problem_statement 
  } : null);
  const segmentationData = transformSegmentationData(job.results?.segmentation);

  // Calculate overall score - be resilient to null section data
  const marketScore = marketData?.sizingCalculation?.confidence_score;
  const competitionScore = competitionData?.confidence_score;
  const problemScore = problemData?.problem_validation?.confidence_level; // or problem_validity_score
  const segmentationScore = segmentationData?.segment_analysis?.confidence_score;

  const scores = [
      marketScore,
      competitionScore,
      problemScore,
      segmentationScore
  ].filter(s => typeof s === 'number');
  
  const averageScore = scores.length > 0 ? (scores.reduce((a, b) => a + b, 0) / scores.length) * 10 : 0;
  const finalScore = Math.min(100, Math.max(0, Math.round(averageScore)));

  // Insights - generate based on available transformed data
  const insights = {
    market: marketData ? `${marketData.sizingCalculation.tam.formatted} TAM, ${marketData.sizingCalculation.sam.formatted} SAM, ${marketData.sizingCalculation.som.formatted} SOM` : "Market data unavailable",
    competition: competitionData?.competitors?.length > 0 ? `${competitionData.competitors.length} competitors identified. Market concentration: ${competitionData.market_concentration}` : "Competition data unavailable",
    problem: problemData?.problem_validation ? `Severity: ${problemData.problem_validation.severity}/10, Frequency: ${problemData.problem_validation.frequency}/10` : "Problem validation data unavailable",
    segmentation: segmentationData?.primarySegments?.length > 0 ? `${segmentationData.primarySegments.length} primary segments. Top segment: ${segmentationData.primarySegments[0].name} (${segmentationData.primarySegments[0].percentage}%)` : "Segmentation data unavailable",
    error: job.error || (marketData === null && competitionData === null && problemData === null && segmentationData === null ? "Overall analysis failed to generate sufficient data" : undefined)
  };
  
  // Recommendations - generate based on available transformed data
  const recommendations: AnalysisResult['recommendations'] = [];
  if (marketData?.averageGrowthRate > 7) recommendations.push({ type: "positive", title: "High Market Growth", description: `Capitalize on ${marketData.averageGrowthRate.toFixed(1)}% market growth.` });
  if (problemData?.problem_validation?.severity >= 7) recommendations.push({ type: "positive", title: "Strong Problem Validation", description: `Problem severity is high (${problemData.problem_validation.severity}/10), indicating strong market need.`});
  if (competitionData?.market_gaps?.length > 0) recommendations.push({type: "positive", title: "Market Gap Identified", description: `Opportunity to address: ${competitionData.market_gaps[0]}.`});
  if (segmentationData?.primarySegments?.[0]?.growthPotential === "High") recommendations.push({type: "positive", title: `Target High Growth Segment: ${segmentationData.primarySegments[0].name}`, description: "Focus efforts on this promising segment."}) 
  if (recommendations.length < 2 && finalScore > 60) recommendations.push({type: "positive", title: "Promising Outlook", description: "Overall analysis indicates a promising business idea. Proceed with caution and further validation."}) 
  if (recommendations.length === 0) recommendations.push({type:"warning", title: "Further Validation Needed", description: "More data is needed to provide specific recommendations."}) 

  return {
    businessIdea: job.input?.businessIdea || "Analysis Data",
    analysisDate: job.createdAt || new Date().toISOString(),
    score: finalScore,
    primaryIndustry: classificationDetails.primaryIndustry || "N/A",
    secondaryIndustry: classificationDetails.secondaryIndustry || "N/A",
    productType: classificationDetails.productType || "N/A",
    targetAudience: classificationDetails.targetAudience || (segmentationData?.primarySegments?.[0]?.name || "N/A"), // Prioritize classification
    insights,
    recommendations: recommendations.slice(0,5),
    marketData,
    competitionData,
    problemData,
    segmentationData,
    status: job.status || 'failed',
    error: job.error || insights.error
  };
} 