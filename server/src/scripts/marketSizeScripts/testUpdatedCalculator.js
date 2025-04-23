// test_market_sizing.js
const { calculateMarketSizing } = require('../../services/marketSizingCalculator');

// Mock data to simulate real-world market research results
const mockMarketData = {
  market_data: {
    sources: [
      {
        publisher: "Gartner", 
        market_size: 5.2, 
        market_size_unit: "billion",
        year: 2023,
        growth_rate: 14.5
      },
      {
        publisher: "McKinsey", 
        market_size: 4.8, 
        market_size_unit: "billion",
        year: 2023,
        growth_rate: 12.8
      },
      {
        publisher: "Random Blog Post", 
        market_size: 8.7, 
        market_size_unit: "billion", 
        year: 2020,
        growth_rate: 22.3
      },
      {
        publisher: "Totally Bullshit Research Inc", 
        market_size: 187, 
        market_size_unit: "billion",  // This is our outlier (36x higher)
        year: 2022,
        growth_rate: 35.0
      }
    ],
    confidence_score: 7
  }
};

// Mock segmentation data
const mockSegmentation = {
  primarySegments: [
    { name: "Enterprise Users", percentage: 40, growthPotential: "High" },
    { name: "SMB Users", percentage: 35, growthPotential: "Medium" },
    { name: "Individual Users", percentage: 15, growthPotential: "Low" }
  ]
};

// Mock problem validation data
const mockProblemValidation = {
  problem_validation: {
    exists: true,
    severity: 8,
    frequency: 7,
    willingness_to_pay: "8",
    confidence_level: 9
  }
};

// Mock competitive analysis data
const mockCompetitiveData = {
  competitors: [
    {
      name: "Established Corp",
      website: "established.com",
      funding: "$150 million Series C"
    },
    {
      name: "Startup XYZ",
      website: "xyz.io",
      funding: "$5 million Seed"
    },
    {
      name: "Big Enterprise Solutions",
      website: "bigenterprise.com",
      funding: "$1.2 billion IPO"
    }
  ],
  market_concentration: "Moderately concentrated",
  market_gaps: [
    "No affordable solution for small businesses",
    "Existing solutions lack modern UI/UX",
    "No mobile-first approach in the market"
  ]
};

function runTest(testName, marketData, segmentation, problemValidation, competitiveData) {
  console.log(`\n========== TEST: ${testName} ==========`);
  
  // Run the calculation
  const result = calculateMarketSizing(
    marketData, 
    segmentation, 
    problemValidation, 
    competitiveData
  );
  
  // Print the main results
  console.log(`\nMARKET SIZE RESULTS:`);
  console.log(`TAM: ${result.tam.formatted} (Range: ${result.tam.range})`);
  console.log(`SAM: ${result.sam.formatted} (Range: ${result.sam.range})`);
  console.log(`SOM: ${result.som.formatted} (Range: ${result.som.range})`);
  console.log(`Confidence Score: ${result.confidence_score}/10`);
  
  // Print outlier detection results
  if (result.tam.outliers_count > 0) {
    console.log(`\n⚠️  OUTLIERS DETECTED: ${result.tam.outliers_count} source(s) excluded from calculations`);
    console.log(`Sources used: ${result.tam.sources_count - result.tam.outliers_count}/${result.tam.sources_count}`);
  }
  
  // Print sensitivity analysis
  console.log(`\nSENSITIVITY ANALYSIS (most impactful factors):`);
  result.sensitivity.slice(0, 3).forEach((factor, idx) => {
    console.log(`${idx + 1}. ${factor.name.replace(/_/g, ' ')}: +20% → ${factor.impact.toFixed(1)}% impact on SOM`);
  });
  
  // Print key multipliers
  console.log(`\nKEY MULTIPLIERS:`);
  console.log(`Geographic Focus: ${(result.assumptions.geographic_focus * 100).toFixed(0)}%`);
  console.log(`Tech Adoption: ${(result.assumptions.tech_adoption * 100).toFixed(0)}%`);
  console.log(`New Entrant Share: ${(result.assumptions.new_entrant_share * 100).toFixed(1)}%`);
  console.log(`Marketing Reach: ${(result.assumptions.marketing_reach * 100).toFixed(0)}%`);
  console.log(`Conversion Rate: ${(result.assumptions.conversion_rate * 100).toFixed(1)}%`);
  
  return result;
}

// Test 1: Full data with outlier
console.log("\n🧪 RUNNING MARKET SIZING TESTS 🧪");
console.log("================================");

const fullResult = runTest(
  "Full calculation with all data", 
  mockMarketData, 
  mockSegmentation, 
  mockProblemValidation, 
  mockCompetitiveData
);

// Test 2: Without problem validation
const noProblemResult = runTest(
  "Without problem validation", 
  mockMarketData, 
  mockSegmentation, 
  null, 
  mockCompetitiveData
);

// Test 3: Without competitive data
const noCompetitiveResult = runTest(
  "Without competitive data", 
  mockMarketData, 
  mockSegmentation, 
  mockProblemValidation, 
  null
);

// Compare the results
console.log("\n========== COMPARISON ==========");
console.log(`TAM is consistent: ${fullResult.tam.value === noProblemResult.tam.value ? '✅' : '❌'}`);
console.log(`\nSAM with problem validation: ${fullResult.sam.formatted}`);
console.log(`SAM without problem validation: ${noProblemResult.sam.formatted}`);
console.log(`Difference: ${((fullResult.sam.value / noProblemResult.sam.value - 1) * 100).toFixed(1)}%`);

console.log(`\nSOM with competitive data: ${fullResult.som.formatted}`);
console.log(`SOM without competitive data: ${noCompetitiveResult.som.formatted}`);
console.log(`Difference: ${((fullResult.som.value / noCompetitiveResult.som.value - 1) * 100).toFixed(1)}%`);

console.log("\n🚨 REMINDER: These are synthetic calculations based on market research.");
console.log("The real value is in understanding the ranges and sensitivity factors,");
console.log("not the specific numbers. No investor will believe your exact TAM number anyway.");