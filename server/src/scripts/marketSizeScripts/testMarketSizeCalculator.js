// test-market-sizing.js
require('dotenv').config(); // Make sure we have access to env variables

const mockClassifierOutput = {
  primaryIndustry: "HealthTech",
  secondaryIndustry: "Fitness",
  targetAudience: "Health-conscious consumers",
  productType: "Mobile Application",
  confidence: 0.92
};

const mockSegmenterOutput = {
  primarySegments: [
    {
      name: "Urban Fitness Enthusiasts",
      description: "Young professionals living in urban areas focused on fitness",
      percentage: 28,
      characteristics: {
        demographics: ["25-40 years old", "Higher income", "Urban"],
        psychographics: ["Health-conscious", "Tech-savvy", "Time-strapped"],
        problemsNeeds: ["Lack of personalized fitness plans", "Need for tracking progress"],
        behaviors: ["Uses fitness apps daily", "Willing to pay for premium features"]
      },
      growthPotential: "High"
    },
    {
      name: "Health-Focused Seniors",
      description: "Older adults managing health conditions through technology",
      percentage: 15,
      characteristics: {
        demographics: ["60+ years old", "Retirement age", "Mixed urban/suburban"],
        psychographics: ["Health-focused", "Increasing tech adoption", "Prevention-minded"],
        problemsNeeds: ["Chronic condition management", "Medication tracking", "Simple interfaces"],
        behaviors: ["Daily health check-ins", "Shares data with healthcare providers"]
      },
      growthPotential: "Medium"
    }
  ],
  excludedSegments: [
    {
      name: "Budget-Constrained Consumers",
      reason: "Low willingness to pay for premium health services"
    }
  ]
};

// Import our market sizing modules
const { marketDataService } = require('../../llm/marketSizeCalculators/marketDataService');
const { calculateTAM, calculateSAM, calculateSOM, calculateMarketSize } = require('../../llm/marketSizeCalculators/marketSizeCalculator');

async function runTest() {
  console.log("🧪 Testing Market Size Calculator");
  console.log("--------------------------------");
  
  // Step 1: Test market data service directly
  console.log("\n📊 Testing Market Data Service...");
  try {
    const industryData = await marketDataService.getIndustryData("HealthTech");
    console.log("Industry Data Retrieved:");
    console.log(JSON.stringify(industryData, null, 2));
    console.log(`Data Source: ${industryData.dataSource}`);
    console.log(`Confidence: ${industryData.confidence || 'Not specified'}`);
  } catch (error) {
    console.error("❌ Market Data Service Error:", error.message);
  }
  
  // Step 2: Test TAM calculation
  console.log("\n🌎 Testing TAM Calculation...");
  try {
    const tamResult = await calculateTAM(mockClassifierOutput);
    console.log("TAM Result:");
    console.log(`Value: ${tamResult.displayValue}`);
    console.log(`Growth Rate: ${(tamResult.growthRate * 100).toFixed(1)}%`);
    console.log(`Confidence: ${tamResult.confidenceScore}`);
    console.log(`Data Source: ${tamResult.dataSource}`);
  } catch (error) {
    console.error("❌ TAM Calculation Error:", error.message);
  }
  
  // Step 3: Test SAM calculation (requires TAM result)
  console.log("\n🔍 Testing SAM Calculation...");
  try {
    const tamResult = await calculateTAM(mockClassifierOutput);
    const samResult = await calculateSAM(tamResult, mockSegmenterOutput, mockClassifierOutput);
    console.log("SAM Result:");
    console.log(`Value: ${samResult.displayValue}`);
    console.log(`Percent of TAM: ${samResult.percentOfTAM}`);
    console.log(`Addressable Percentage: ${samResult.addressablePercentage}%`);
    console.log(`Geographic Factor: ${(samResult.geographicFactor * 100).toFixed(0)}%`);
    console.log(`Technological Factor: ${(samResult.technologicalFactor * 100).toFixed(0)}%`);
  } catch (error) {
    console.error("❌ SAM Calculation Error:", error.message);
  }
  
  // Step 4: Test SOM calculation (requires TAM and SAM results)
  console.log("\n📈 Testing SOM Calculation...");
  try {
    const tamResult = await calculateTAM(mockClassifierOutput);
    const samResult = await calculateSAM(tamResult, mockSegmenterOutput, mockClassifierOutput);
    const somResult = await calculateSOM(samResult, mockClassifierOutput);
    console.log("SOM Result:");
    console.log(`Value: ${somResult.displayValue}`);
    console.log(`Percent of SAM: ${somResult.percentOfSAM}`);
    console.log(`Competitive Landscape: ${somResult.competitiveLandscape}`);
    console.log(`Year 1 Projection: ${somResult.yearOneDisplay}`);
    console.log(`Year 3 Projection: ${somResult.yearThreeDisplay}`);
    console.log(`Year 5 Projection: ${somResult.yearFiveDisplay}`);
  } catch (error) {
    console.error("❌ SOM Calculation Error:", error.message);
  }
  
  // Step 5: Test full market size calculation
  console.log("\n🚀 Testing Full Market Size Pipeline...");
  try {
    const marketSizingResult = await calculateMarketSize(mockClassifierOutput, mockSegmenterOutput);
    console.log("Market Sizing Complete Result:");
    console.log(`TAM: ${marketSizingResult.marketSizing.tam.displayValue}`);
    console.log(`SAM: ${marketSizingResult.marketSizing.sam.displayValue}`);
    console.log(`SOM: ${marketSizingResult.marketSizing.som.displayValue}`);
    console.log(`Go/No-Go: ${marketSizingResult.marketSizing.goNoGoDecision.recommendation}`);
    console.log(`Decision Score: ${marketSizingResult.marketSizing.goNoGoDecision.score}/100`);
    console.log("Key Factors:", marketSizingResult.marketSizing.goNoGoDecision.keyFactors);
    console.log("Risk Factors:", marketSizingResult.marketSizing.goNoGoDecision.riskFactors);
  } catch (error) {
    console.error("❌ Full Market Sizing Error:", error.message);
  }
}

// Run the test
runTest()
  .then(() => console.log("\n✅ Testing complete"))
  .catch(error => console.error("\n❌ Testing failed:", error))
  .finally(() => process.exit());