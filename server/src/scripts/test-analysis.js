// test-analysis.js
const { analyzeBusinessIdea } = require('../services/businessAnalyser');

async function runTest() {
  try {
    const businessIdea = "An AI-powered fitness coaching app that creates personalized workout and nutrition plans based on users' fitness goals, health conditions, and progress";
    
    console.log("Starting business analysis...");
    const result = await analyzeBusinessIdea(businessIdea, {
      segmentCount: 3,
      problemStatement: "People struggle to create effective fitness routines tailored to their specific needs and goals",
      includeMarketSize: true,
      includeCompetition: true,
      includeProblemValidation: true
    });
    
    console.log("\n=== ANALYSIS SUMMARY ===");
    console.log(`Industry: ${result.classification.primaryIndustry}`);
    console.log(`Product Type: ${result.classification.productType}`);
    console.log(`Target Audience: ${result.classification.targetAudience}`);
    console.log(`\nTarget Segments: ${result.segmentation.primarySegments.map(s => s.name).join(', ')}`);
    
    if (result.marketSize) {
      console.log(`\nTAM: ${result.marketSize.tamFormatted}`);
      console.log(`SAM: ${result.marketSize.samFormatted}`);
      console.log(`SOM: ${result.marketSize.somFormatted}`);
      console.log(`Growth Rate: ${result.marketSize.growth_rate.value}%`);
    }
    
    if (result.competition) {
      console.log(`\nCompetitors: ${result.competition.competitors.length}`);
      console.log(`Market Gaps: ${result.competition.market_gaps.length}`);
    }
    
    if (result.problemValidation && result.problemValidation.problem_validation) {
      console.log(`\nProblem Severity: ${result.problemValidation.problem_validation.severity}/10`);
      console.log(`Willingness to Pay: ${result.problemValidation.problem_validation.willingness_to_pay}/10`);
    }
    
    console.log(`\nFINAL SCORE: ${result.recommendation.score}/100`);
    console.log(`RECOMMENDATION: ${result.recommendation.recommendation}`);
    console.log("\nKEY FACTORS:");
    result.recommendation.reasons.forEach(reason => console.log(`- ${reason}`));
    
  } catch (error) {
    console.error("Test failed:", error);
  }
}

runTest();