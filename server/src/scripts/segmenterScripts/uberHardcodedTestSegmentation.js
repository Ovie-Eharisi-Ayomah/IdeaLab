/**
 * This script demonstrates how to use pre-existing classification results
 * as input for the customer segmentation module.
 * 
 * This approach is useful when you:
 * 1. Already have classification results from a previous run
 * 2. Want to save API calls/costs by not re-running classification
 * 3. Want to test segmentation with different classification variations
 */

require('dotenv').config();
const { identifyCustomerSegments } = require('../../llm/segmenters/customerSegementer');

// Uber business description (same as in previous tests)
const uberDescription = `
Our mobile app connects people who need rides with nearby drivers who use their own cars.
Riders can request a ride through the app, see the driver's location and estimated arrival time,
and pay automatically through stored payment methods. Drivers can choose when to work by simply
going online in the app, and they receive a portion of each fare. Our pricing is dynamic based on
demand, and we offer different service levels from economy to luxury vehicles. We handle all
payment processing, driver background checks, and customer support.
`;

// You can manually define classification results from a previous run
// or load them from a file/database to avoid re-running the classifier
const uberClassification = {
  classification: {
    primaryIndustry: "Transportation",
    secondaryIndustry: "Technology",
    targetAudience: "Consumers",
    productType: "Marketplace"
  },
  method: "llm",
  confidence: "high"
};

async function runSegmentationWithExistingClassification() {
  console.log('TESTING SEGMENTATION WITH EXISTING CLASSIFICATION');
  console.log('=============================================');
  console.log('Business Description:');
  console.log(uberDescription);
  console.log('=============================================');
  console.log('Using Existing Classification:');
  console.log(`Primary Industry: ${uberClassification.classification.primaryIndustry}`);
  console.log(`Secondary Industry: ${uberClassification.classification.secondaryIndustry || 'None'}`);
  console.log(`Target Audience: ${uberClassification.classification.targetAudience}`);
  console.log(`Product Type: ${uberClassification.classification.productType}`);
  console.log('=============================================');
  
  try {
    // Run segmentation using the existing classification
    console.log('IDENTIFYING CUSTOMER SEGMENTS...');
    console.log('---------------------------------------------');
    
    const segmentationOptions = {
      numberOfSegments: 3,
      includeExcludedSegments: true
    };
    
    const segmentationResult = await identifyCustomerSegments(
      uberDescription,
      uberClassification,
      segmentationOptions
    );
    
    // Print a summary of the segmentation results
    console.log(`Identified ${segmentationResult.primarySegments.length} primary segments:`);
    segmentationResult.primarySegments.forEach((segment, index) => {
      console.log(`${index + 1}. ${segment.name}`);
    });
    
    console.log(`\nIdentified ${segmentationResult.secondarySegments?.length || 0} secondary segments:`);
    if (segmentationResult.secondarySegments) {
      segmentationResult.secondarySegments.forEach((segment, index) => {
        console.log(`${index + 1}. ${segment.name}`);
      });
    }
    
    console.log(`\nIdentified ${segmentationResult.excludedSegments?.length || 0} excluded segments:`);
    if (segmentationResult.excludedSegments) {
      segmentationResult.excludedSegments.forEach((segment, index) => {
        console.log(`${index + 1}. ${segment.name}`);
      });
    }
    
    // Save the full results to a file for inspection
    const fs = require('fs');
    fs.writeFileSync(
      './uber-segmentation-results.json', 
      JSON.stringify(segmentationResult, null, 2)
    );
    
    console.log('\n=============================================');
    console.log('Full results saved to uber-segmentation-results.json');
    console.log('TEST COMPLETED SUCCESSFULLY');
    
  } catch (error) {
    console.error('Test failed with error:', error);
  }
}

// Run the test
runSegmentationWithExistingClassification();