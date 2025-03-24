// server/scripts/test-extraction.js
require('dotenv').config();

const { extractKeywords } = require('../llm/keywordExtraction');

// Hardcoded business ideas for testing
const testIdeas = [
  "I want to create a platform where wantrepreneurs can input ideas and get validation using AI"
];

async function runTest() {
  console.log("🔍 TESTING KEYWORD EXTRACTION MODULE 🔍\n");
  
  for (const idea of testIdeas) {
    console.log(`\n📝 BUSINESS IDEA: "${idea}"\n`);
    
    try {
      console.log("⏳ Extracting keywords...");
      const startTime = Date.now();
      
      const result = await extractKeywords(idea);
      
      const endTime = Date.now();
      console.log(`✅ Extraction completed in ${(endTime - startTime) / 1000} seconds\n`);
      
      // Pretty print the results
      console.log("🔑 EXTRACTED KEYWORDS:");
      console.log(JSON.stringify(result, null, 2));
      
      // Simple validation check
      let totalKeywords = 0;
      for (const category in result) {
        if (typeof result[category] === 'object') {
          if (Array.isArray(result[category])) {
            totalKeywords += result[category].length;
          } else {
            for (const subCategory in result[category]) {
              totalKeywords += result[category][subCategory].length;
            }
          }
        }
      }
      
      console.log(`\n📊 EXTRACTION STATS: Found ${totalKeywords} total keywords/phrases`);
      console.log("--------------------------------------------------");
    } catch (error) {
      console.error(`❌ ERROR processing idea: ${error.message}`);
    }
  }
}

// Run the test
runTest();