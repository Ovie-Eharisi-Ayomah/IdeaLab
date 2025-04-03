// test-world-bank.js

// Load environment variables if needed
require('dotenv').config();

// Import our market data service
const { marketDataService } = require('../../marketData/index');

/**
 * Test the market data service with various industries
 */
async function runTest() {
  console.log('🧪 Testing Market Data Service with World Bank Source');
  console.log('=================================================');
  
  // Test industries that should map well to World Bank indicators
  const testIndustries = [
    'Healthcare',
    'Technology',
    'Financial Services',
    'Retail',
    'Education',
    // Add some that aren't directly mapped
    'SaaS',
    'Artificial Intelligence',
    'Renewable Energy'
  ];
  
  for (const industry of testIndustries) {
    console.log(`\n\n🔍 Testing industry: ${industry}`);
    console.log('--------------------------------------------------');
    
    try {
      // First request (should hit API)
      console.time(`${industry} fetch`);
      const result = await marketDataService.getIndustryData(industry);
      console.timeEnd(`${industry} fetch`);
      
      // Print results
      if (result.hasData) {
        console.log('✅ SUCCESS: Found market data');
        console.log(`📊 Results for ${industry}:`);
        console.log(`   Sources: ${result.sources.join(', ')}`);
        
        if (result.globalMarketSize !== null) {
          console.log(`   Market Size: ${result.displayMarketSize}`);
        } else {
          console.log('   Market Size: Not available');
        }
        
        if (result.growthRate !== null) {
          console.log(`   Growth Rate: ${result.displayGrowthRate}`);
        } else {
          console.log('   Growth Rate: Not available');
        }
        
        console.log(`   Confidence: ${(result.confidence.overall * 100).toFixed(0)}%`);
        console.log(`   Explanation: ${result.explanation}`);
      } else {
        console.log('❌ FAIL: No market data found');
        console.log('   Sources attempted:', result.sources || 'none');
        if (result.errors) {
          console.log('   Errors:', result.errors);
        }
      }
      
      // Test caching (second request should be instant)
      console.log('\n   Testing cache...');
      console.time(`${industry} cache test`);
      const cachedResult = await marketDataService.getIndustryData(industry);
      console.timeEnd(`${industry} cache test`);
      
      if (cachedResult.hasData) {
        console.log('   ✅ Cache working, found data instantly');
      } else {
        console.log('   ❌ Cache not working properly');
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