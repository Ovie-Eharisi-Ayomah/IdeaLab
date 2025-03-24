// server/scripts/test-reddit-analysis.js

require('dotenv').config(); // Load environment variables
const { extractKeywords } = require('../llm/keywordExtraction');
const { getRedditInsights } = require('../api/redditSource');
const { analyzeRedditWithLLM } = require('../analysis/redditAnalysis');

// Test business ideas
const businessIdeas = [
  "A mobile app that helps remote workers find quiet, temporary workspaces in their city on demand.",
  "A subscription box that delivers eco-friendly kitchen products to environmentally conscious millennials."
];

async function runTest() {
  console.log("🧪 TESTING REDDIT DATA COLLECTION AND ANALYSIS 🧪\n");
  
  for (const idea of businessIdeas) {
    console.log(`\n📝 BUSINESS IDEA: "${idea}"\n`);
    
    try {
      // Step 1: Extract keywords from the business idea
      console.log("⏳ Extracting keywords...");
      const extractedKeywords = await extractKeywords(idea);
      console.log("✅ Keywords extracted successfully");
      
      // Step 2: Collect data from Reddit
      console.log("\n⏳ Collecting Reddit data...");
      const redditData = await getRedditInsights(extractedKeywords);
      console.log(`✅ Collected ${redditData.postCount} posts with a Reddit score of ${redditData.redditScore}/100`);
      
      // Step 3: Analyze the data with LLM
      console.log("\n⏳ Analyzing Reddit data with LLM...");
      const insights = await analyzeRedditWithLLM(redditData, extractedKeywords);
      console.log("✅ Analysis complete");
      
      // Display the results
      console.log("\n📊 ANALYSIS RESULTS:");
      console.log("--------------------");
      console.log(`Market Sentiment: ${insights.marketSentiment}`);
      console.log(`Market Maturity: ${insights.marketMaturity}`);
      console.log(`Engagement Level: ${insights.redditEngagement}`);
      console.log(`Confidence: ${insights.insightConfidence}`);
      
      console.log("\n🔍 CUSTOMER PROBLEMS:");
      insights.customerProblems.forEach((problem, index) => {
        console.log(`\n#${index + 1}: ${problem.problem}`);
        console.log(`Evidence: ${problem.evidence}`);
        console.log(`Intensity: ${problem.intensity}/10, Frequency: ${problem.frequency}/10`);
      });
      
      console.log("\n💡 UNMET NEEDS:");
      insights.unmetNeeds.forEach((need, index) => {
        console.log(`- ${need}`);
      });
      
      console.log("\n-----------------------------------------------");
    } catch (error) {
      console.error(`❌ ERROR: ${error.message}`);
    }
  }
}

// Run the test
runTest();