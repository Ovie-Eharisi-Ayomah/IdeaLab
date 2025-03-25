/**
 * Test script for the business idea classifier
 * 
 * This script tests the classifier with a ridesharing service similar to Uber
 * to verify proper identification of primary and secondary industries.
 */

require('dotenv').config({ path: '../../../.env' });
const { classifyBusinessIdea } = require('../../llm/classifiers/businessClassifier');

/**
 * Expected classification for a ridesharing service like Uber:
 * 
 * Primary Industry: Transportation
 * Secondary Industry: Technology
 * Target Audience: Consumers
 * Product Type: Marketplace
 * 
 * The business operates primarily in the transportation industry
 * as it facilitates moving people from one place to another.
 * Technology is a strong secondary industry as the mobile app and
 * matching algorithm are essential to the service.
 * 
 * It's a two-sided marketplace connecting drivers and riders,
 * with consumers (riders) being the primary audience.
 */

// Test case for Uber-like service
const testUberIdea = `
Our mobile app connects people who need rides with nearby drivers who use their own cars.
Riders can request a ride through the app, see the driver's location and estimated arrival time,
and pay automatically through stored payment methods. Drivers can choose when to work by simply
going online in the app, and they receive a portion of each fare. Our pricing is dynamic based on
demand, and we offer different service levels from economy to luxury vehicles. We handle all
payment processing, driver background checks, and customer support.
`;

async function runTest() {
  console.log('Testing classifier with Uber-like business idea...');
  console.log('-------------------------------------------------');
  console.log('Business Description:');
  console.log(testUberIdea);
  console.log('-------------------------------------------------');
  
  try {
    // Run the classification with reasoning included
    const result = await classifyBusinessIdea(testUberIdea, { includeReasoning: true });
    
    console.log('Classification Results:');
    console.log('-------------------------------------------------');
    console.log(`Primary Industry: ${result.classification.primaryIndustry}`);
    console.log(`Secondary Industry: ${result.classification.secondaryIndustry || 'None'}`);
    console.log(`Target Audience: ${result.classification.targetAudience}`);
    console.log(`Product Type: ${result.classification.productType}`);
    console.log(`Classification Method: ${result.method}`);
    console.log(`Confidence: ${result.confidence}`);
    console.log('-------------------------------------------------');
    
    if (result.reasoning) {
      console.log('Reasoning:');
      console.log(result.reasoning);
      console.log('-------------------------------------------------');
    }
    
    // Validate against expected results
    const expectedResults = {
      primaryIndustry: 'Transportation',
      secondaryIndustry: 'Technology',
      targetAudience: 'Consumers',
      productType: 'Marketplace'
    };
    
    console.log('Validation:');
    console.log('-------------------------------------------------');
    for (const [key, expectedValue] of Object.entries(expectedResults)) {
      const actualValue = result.classification[key];
      const isMatch = actualValue && actualValue.toLowerCase() === expectedValue.toLowerCase();
      
      console.log(`${key}: ${isMatch ? '✓' : '✗'} Expected "${expectedValue}", Got "${actualValue || 'None'}"`);
    }
    
  } catch (error) {
    console.error('Test failed with error:', error);
  }
}

// Run the test
runTest();