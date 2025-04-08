// server/scripts/test-trends-integration.js

const { extractKeywords } = require('../llm/keywordExtraction');
const { fetchGoogleTrendsData } = require('../api/googleTrends');

// Test business idea
const businessIdea = "I want to create a mobile app that helps remote workers find quiet, temporary workspaces in their city on demand.";

async function runTest() {
  console.log("🔬 TESTING GOOGLE TRENDS INTEGRATION 🔬\n");
  
  try {
    console.log(`📝 BUSINESS IDEA: "${businessIdea}"\n`);
    
    // Step 1: Extract keywords
    console.log("⏳ Extracting keywords...");
    const extractedKeywords = await extractKeywords(businessIdea);
    console.log("✅ Keywords extracted successfully");
    console.log("🔑 KEYWORDS SAMPLE:");
    console.log(JSON.stringify({
      core_problem: extractedKeywords.core_problem,
      search_terms: extractedKeywords.search_terms?.slice(0, 3) + "..." || []
    }, null, 2));
    
    // Step 2: Fetch Google Trends data
    console.log("\n⏳ Fetching Google Trends data...");
    const trendsData = await fetchGoogleTrendsData(extractedKeywords);
    console.log("✅ Google Trends data fetched successfully\n");
    
    // Print metrics summary
    console.log("📊 TRENDS METRICS SUMMARY:");
    console.table(trendsData.metrics);
    
    // Print a sample of the time series data
    console.log("\n📈 SAMPLE TIME SERIES DATA (First term, first 3 points):");
    if (trendsData.timeSeriesData.length > 0 && trendsData.timeSeriesData[0].timeline.length > 0) {
      console.log(JSON.stringify(trendsData.timeSeriesData[0].timeline.slice(0, 3), null, 2));
    } else {
      console.log("No time series data available");
    }
    
    // Print related queries for the first term
    console.log("\n🔍 RELATED QUERIES (First term):");
    if (trendsData.relatedQueries.length > 0) {
      console.log(`Top queries for "${trendsData.relatedQueries[0].term}":`);
      console.log(JSON.stringify(trendsData.relatedQueries[0].top.slice(0, 5), null, 2));
    } else {
      console.log("No related queries available");
    }
    
  } catch (error) {
    console.error(`❌ ERROR: ${error.message}`);
    console.error(error.stack);
  }
}

// Run the test
runTest();