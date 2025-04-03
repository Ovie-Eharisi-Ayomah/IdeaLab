// test-market-data.js

require('dotenv').config();

// Import our market data service
const { marketDataService } = require('../../services/marketData/index');

/**
 * Test the market data service with various industries
 */
async function runTest() {
  console.log('🧪 Testing Market Data Service with Multiple Sources');
  console.log('==================================================');
  
  // Clear cache to ensure fresh results
  marketDataService.clearCache();
  
  // Test a variety of industries including some that should work well 
  // with both World Bank and BLS
  const testIndustries = [
    'Software',
    'Healthcare',
    'Financial Services',
    'Retail',
    'Manufacturing',
    // Some that might be tricky
    'SaaS',
    'Artificial Intelligence',
    'Cybersecurity'
  ];
  
  for (const industry of testIndustries) {
    console.log(`\n\n🔍 Testing industry: ${industry}`);
    console.log('--------------------------------------------------');
    
    try {
      // Fetch data with all sources
      console.time(`${industry} fetch`);
      const result = await marketDataService.getIndustryData(industry);
      console.timeEnd(`${industry} fetch`);
      
      // Print the results
      if (result.hasData) {
        console.log('✅ SUCCESS: Found market data');
        console.log(`📊 Results for ${industry}:`);
        console.log(`   Sources: ${result.sources.join(', ')}`);
        
        // Market size
        if (result.globalMarketSize !== null) {
          console.log(`   Market Size: ${result.displayMarketSize}`);
        } else {
          console.log('   Market Size: Not available');
        }
        
        // Growth rate
        if (result.growthRate !== null) {
          console.log(`   Growth Rate: ${result.displayGrowthRate}`);
        } else {
          console.log('   Growth Rate: Not available');
        }
        
        // Geographic distribution if available
        if (result.geographicDistribution) {
          console.log('   Geographic Distribution:');
          Object.entries(result.geographicDistribution).forEach(([region, value]) => {
            console.log(`     ${region}: ${(value * 100).toFixed(1)}%`);
          });
        }
        
        // Confidence scores
        console.log('   Confidence:');
        console.log(`     Overall: ${(result.confidence.overall * 100).toFixed(0)}%`);
        console.log(`     Market Size: ${(result.confidence.marketSize * 100).toFixed(0)}%`);
        console.log(`     Growth Rate: ${(result.confidence.growthRate * 100).toFixed(0)}%`);
        
        // Source details
        console.log('   Source Details:');
        result.sourceDetails.forEach(source => {
          console.log(`     ${source.name}: Metrics provided: ${source.providedMetrics.join(', ')}`);
        });
        
        // Explanation
        console.log(`   Explanation: ${result.explanation}`);
      } else {
        console.log('❌ FAIL: No market data found');
        console.log('   Sources attempted:', result.sources || 'none');
        if (result.errors) {
          console.log('   Errors:', result.errors);
        }
      }
    } catch (error) {
      console.error(`❌ Error testing ${industry}:`, error.message);
    }
  }
  
  // Print cache stats
  console.log('\n\n📊 Cache Statistics:');
  console.log(marketDataService.getCacheStats());
}

// Run the tests
runTest()
  .then(() => console.log('\n\n✅ Testing complete'))
  .catch(err => console.error('❌ Test failed:', err))
  .finally(() => {
    // Give time for any pending connections to close
    setTimeout(() => process.exit(), 1000);
  });