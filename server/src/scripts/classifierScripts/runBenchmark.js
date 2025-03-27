/**
 * Benchmark script for the business idea classifier
 * 
 * This script tests the classifier with multiple business ideas to evaluate performance
 * across different industries and business models.
 */

require('dotenv').config({ path: '../../.env' });
const { classifyBusinessIdea } = require('./index');
const { getTestExamples } = require('./examples');

// Add more test cases for diverse business types
const testCases = [
  // Ridesharing (Uber-like)
  {
    description: `Our mobile app connects people who need rides with nearby drivers who use their own cars.
    Riders can request a ride through the app, see the driver's location and estimated arrival time,
    and pay automatically through stored payment methods. Drivers can choose when to work by simply
    going online in the app, and they receive a portion of each fare. Our pricing is dynamic based on
    demand, and we offer different service levels from economy to luxury vehicles.`,
    expected: {
      primaryIndustry: 'Transportation',
      secondaryIndustry: 'Technology',
      targetAudience: 'Consumers',
      productType: 'Marketplace'
    }
  },
  
  // Telemedicine platform
  {
    description: `We've built a platform that connects patients with licensed doctors for virtual consultations.
    Patients can book appointments, have video calls with specialists, receive diagnoses and prescriptions,
    and access their medical records through our secure portal. We integrate with insurance providers and
    offer both one-time consultations and subscription plans for ongoing care.`,
    expected: {
      primaryIndustry: 'Healthcare',
      secondaryIndustry: 'Technology',
      targetAudience: 'Consumers',
      productType: 'Marketplace'
    }
  },
  
  // FinTech budgeting app
  {
    description: `Our personal finance app helps users track spending, create budgets, and achieve savings goals.
    It connects securely to users' bank accounts and credit cards to automatically categorize transactions,
    provides insights on spending patterns, and sends alerts for unusual activity or when approaching budget limits.
    We use machine learning to offer personalized financial advice and recommendations.`,
    expected: {
      primaryIndustry: 'Finance',
      secondaryIndustry: 'Technology',
      targetAudience: 'Consumers',
      productType: 'Mobile App'
    }
  }
];

// Add the examples from our examples.js file
const exampleTestCases = getTestExamples();
const allTestCases = [...testCases, ...exampleTestCases];

/**
 * Calculate the similarity score between expected and actual classifications
 * 
 * @param {Object} expected - Expected classification
 * @param {Object} actual - Actual classification from the classifier
 * @returns {Object} Detailed scoring with matches and overall score
 */
function calculateScore(expected, actual) {
  const matches = {};
  let totalScore = 0;
  
  // Check primary industry (3 points)
  matches.primaryIndustry = expected.primaryIndustry.toLowerCase() === 
                          (actual.primaryIndustry || '').toLowerCase();
  if (matches.primaryIndustry) totalScore += 3;
  
  // Check secondary industry (2 points)
  // If expected is null and actual is null/empty, it's a match
  if (expected.secondaryIndustry === null) {
    matches.secondaryIndustry = !actual.secondaryIndustry;
  } else {
    matches.secondaryIndustry = expected.secondaryIndustry.toLowerCase() === 
                              (actual.secondaryIndustry || '').toLowerCase();
  }
  if (matches.secondaryIndustry) totalScore += 2;
  
  // Check target audience (2 points)
  matches.targetAudience = expected.targetAudience.toLowerCase() === 
                         (actual.targetAudience || '').toLowerCase();
  if (matches.targetAudience) totalScore += 2;
  
  // Check product type (3 points)
  matches.productType = expected.productType.toLowerCase() === 
                      (actual.productType || '').toLowerCase();
  if (matches.productType) totalScore += 3;
  
  // Calculate percentage (out of 10 possible points)
  const percentage = (totalScore / 10) * 100;
  
  return {
    matches,
    totalScore,
    percentage,
    grade: percentage >= 90 ? 'A' : percentage >= 80 ? 'B' : percentage >= 70 ? 'C' : percentage >= 60 ? 'D' : 'F'
  };
}

/**
 * Run a single test case
 * 
 * @param {Object} testCase - Test case with description and expected classification
 * @returns {Object} Test results including score
 */
async function runSingleTest(testCase) {
  try {
    console.log(`Testing: ${testCase.description.substring(0, 50)}...`);
    
    const result = await classifyBusinessIdea(testCase.description, { includeReasoning: false });
    const score = calculateScore(testCase.expected, result.classification);
    
    return {
      expected: testCase.expected,
      actual: result.classification,
      method: result.method,
      score
    };
  } catch (error) {
    console.error(`Test failed: ${error.message}`);
    return {
      expected: testCase.expected,
      actual: null,
      method: 'error',
      error: error.message,
      score: {
        matches: { primaryIndustry: false, secondaryIndustry: false, targetAudience: false, productType: false },
        totalScore: 0,
        percentage: 0,
        grade: 'F'
      }
    };
  }
}

/**
 * Run all test cases and report results
 */
async function runBenchmark() {
  console.log(`Starting benchmark with ${allTestCases.length} test cases...`);
  console.log('======================================================');
  
  const results = [];
  
  for (const [index, testCase] of allTestCases.entries()) {
    const result = await runSingleTest(testCase);
    results.push(result);
    
    // Print progress
    console.log(`Test ${index + 1}/${allTestCases.length} - Score: ${result.score.percentage.toFixed(1)}% (${result.score.grade})`);
  }
  
  // Calculate overall scores
  const totalScore = results.reduce((sum, result) => sum + result.score.totalScore, 0);
  const maxPossibleScore = allTestCases.length * 10;
  const overallPercentage = (totalScore / maxPossibleScore) * 100;
  
  // Count methods used
  const methodCounts = results.reduce((counts, result) => {
    counts[result.method] = (counts[result.method] || 0) + 1;
    return counts;
  }, {});
  
  // Print summary
  console.log('\n======================================================');
  console.log('BENCHMARK RESULTS');
  console.log('======================================================');
  console.log(`Total Score: ${totalScore}/${maxPossibleScore} (${overallPercentage.toFixed(1)}%)`);
  console.log(`Average Score: ${(overallPercentage).toFixed(1)}%`);
  console.log('\nClassification Methods Used:');
  Object.entries(methodCounts).forEach(([method, count]) => {
    console.log(`- ${method}: ${count} (${((count / allTestCases.length) * 100).toFixed(1)}%)`);
  });
  
  console.log('\nDetailed Results:');
  results.forEach((result, index) => {
    console.log(`\nTest ${index + 1}:`);
    console.log(`- Score: ${result.score.percentage.toFixed(1)}% (${result.score.grade})`);
    console.log(`- Method: ${result.method}`);
    console.log('- Matches:');
    Object.entries(result.score.matches).forEach(([key, match]) => {
      console.log(`  - ${key}: ${match ? '✓' : '✗'} Expected "${result.expected[key] || 'None'}", Got "${result.actual?.[key] || 'None'}"`);
    });
  });
}

// Run the benchmark
runBenchmark();