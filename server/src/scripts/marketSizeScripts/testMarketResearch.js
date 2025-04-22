// test_market_research.js
const { getMarketSize } = require('../../services/marketResearch');

async function testMarketResearch() {
  try {
    console.log('Testing market research API...');
    
    // This should use the cache if you've run it before
    const result = await getMarketSize(
      'An app that helps people optimise workouts for their fitness goals',
      'Fitness',
      'Mobile Application'
    );
    
    console.log('Market Research Results:');
    console.log(JSON.stringify(result, null, 2));
    
    // Calculate TAM based on the most conservative estimate
    const sources = result.market_data.sources;
    if (sources && sources.length > 0) {
      console.log('\nMarket Size Estimates:');
      
      sources.forEach(source => {
        // Convert to billions for comparison
        let sizeInBillions;
        if (source.market_size_unit === 'trillion') {
          sizeInBillions = source.market_size * 1000;
        } else if (source.market_size_unit === 'billion') {
          sizeInBillions = source.market_size;
        } else if (source.market_size_unit === 'million') {
          sizeInBillions = source.market_size / 1000;
        }
        
        console.log(`${source.publisher}: $${sizeInBillions.toFixed(3)}B`);
      });
    }
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testMarketResearch();