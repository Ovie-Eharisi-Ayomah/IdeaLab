/**
 * Test script for the end-to-end workflow:
 * 1. Classify a business idea
 * 2. Use the classification to identify customer segments
 * 
 * This script tests the full process with a ridesharing service (Uber-like business).
 */

require('dotenv').config({ path: '../../.env' });
const { classifyBusinessIdea } = require('../../llm/classifiers/businessClassifier');
const { identifyCustomerSegments } = require('../../llm/segmenters/customerSegementer');

// Test case for Uber-like service (same as in the classifier test)
const testUberIdea = `
Our mobile app connects people who need rides with nearby drivers who use their own cars.
Riders can request a ride through the app, see the driver's location and estimated arrival time,
and pay automatically through stored payment methods. Drivers can choose when to work by simply
going online in the app, and they receive a portion of each fare. Our pricing is dynamic based on
demand, and we offer different service levels from economy to luxury vehicles. We handle all
payment processing, driver background checks, and customer support.
`;

/**
 * Expected classification for a ridesharing service like Uber:
 * 
 * Primary Industry: Transportation
 * Secondary Industry: Technology
 * Target Audience: Consumers
 * Product Type: Marketplace
 */

/**
 * Expected customer segments for Uber might include:
 * 
 * 1. Urban Commuters - People without cars who need regular transportation
 * 2. Night-life Patrons - People wanting safe transportation after social events
 * 3. Business Travelers - Professionals needing reliable transportation in unfamiliar cities
 * 4. Car-free Households - Families or individuals who have chosen not to own cars
 * 5. Drivers seeking flexible income - People looking for supplemental income with flexible hours
 */

async function runEndToEndTest() {
  console.log('TESTING END-TO-END MARKET ANALYSIS WORKFLOW');
  console.log('=============================================');
  console.log('Business Description:');
  console.log(testUberIdea);
  console.log('=============================================');
  
  try {
    // STEP 1: Run the business classifier
    console.log('STEP 1: CLASSIFYING BUSINESS...');
    console.log('---------------------------------------------');
    
    const classificationResult = await classifyBusinessIdea(testUberIdea, { includeReasoning: true });
    
    console.log('Classification Results:');
    console.log(`Primary Industry: ${classificationResult.classification.primaryIndustry}`);
    console.log(`Secondary Industry: ${classificationResult.classification.secondaryIndustry || 'None'}`);
    console.log(`Target Audience: ${classificationResult.classification.targetAudience}`);
    console.log(`Product Type: ${classificationResult.classification.productType}`);
    console.log(`Classification Method: ${classificationResult.method}`);
    console.log(`Confidence: ${classificationResult.confidence}`);
    console.log('---------------------------------------------');
    
    // STEP 2: Run the customer segmentation using the classification
    console.log('STEP 2: IDENTIFYING CUSTOMER SEGMENTS...');
    console.log('---------------------------------------------');
    
    // Options for segmentation (you can adjust these)
    const segmentationOptions = {
      numberOfSegments: 3,
      includeExcludedSegments: true
    };
    
    const segmentationResult = await identifyCustomerSegments(
      testUberIdea,
      classificationResult,
      segmentationOptions
    );
    
    // Print primary segments
    console.log('PRIMARY CUSTOMER SEGMENTS:');
    segmentationResult.primarySegments.forEach((segment, index) => {
      console.log(`\n${index + 1}. ${segment.name}`);
      console.log(`   Description: ${segment.description}`);
      console.log(`   Percentage: ${segment.percentage || 'N/A'}%`);
      
      if (segment.characteristics) {
        if (segment.characteristics.demographics) {
          console.log('   Demographics:');
          Object.entries(segment.characteristics.demographics).forEach(([key, value]) => {
            console.log(`     - ${key}: ${Array.isArray(value) ? value.join(', ') : value}`);
          });
        }
        
        if (segment.characteristics.psychographics) {
          console.log('   Psychographics:');
          Object.entries(segment.characteristics.psychographics).forEach(([key, value]) => {
            console.log(`     - ${key}: ${Array.isArray(value) ? value.join(', ') : value}`);
          });
        }
      }
    });
    
    // Print secondary segments
    if (segmentationResult.secondarySegments && segmentationResult.secondarySegments.length > 0) {
      console.log('\nSECONDARY CUSTOMER SEGMENTS:');
      segmentationResult.secondarySegments.forEach((segment, index) => {
        console.log(`\n${index + 1}. ${segment.name}`);
        console.log(`   Description: ${segment.description}`);
      });
    }
    
    // Print excluded segments
    if (segmentationResult.excludedSegments && segmentationResult.excludedSegments.length > 0) {
      console.log('\nEXCLUDED SEGMENTS:');
      segmentationResult.excludedSegments.forEach((segment, index) => {
        console.log(`\n${index + 1}. ${segment.name}`);
        console.log(`   Description: ${segment.description}`);
        console.log(`   Reason: ${segment.reason || 'N/A'}`);
      });
    }
    
    // Print market insights
    if (segmentationResult.marketInsights) {
      console.log('\nMARKET INSIGHTS:');
      Object.entries(segmentationResult.marketInsights).forEach(([key, value]) => {
        console.log(`   - ${key}: ${value}`);
      });
    }
    
    console.log('\n=============================================');
    console.log('END-TO-END TEST COMPLETED SUCCESSFULLY');
    
  } catch (error) {
    console.error('Test failed with error:', error);
  }
}

// Run the test
runEndToEndTest();