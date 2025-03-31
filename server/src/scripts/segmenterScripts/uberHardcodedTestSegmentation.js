/**
 * Enhanced test script for customer segmentation
 * 
 * This script specifically tests the two-step segmentation approach
 * that uses both text and JSON responses to ensure excluded segments
 * are properly captured.
 */

require('dotenv').config();
const fs = require('fs');
const { identifySegmentsWithLLM, 
        getOpenAITextResponse, 
        identifySegmentsWithOpenAI } = require('../../llm/segmenters/llmSegmenter');
const { parseSegmentationResponse } = require('../../llm/segmenters/utils');

// Uber business description (same as in previous tests)
const uberDescription = `
Our mobile app connects people who need rides with nearby drivers who use their own cars.
Riders can request a ride through the app, see the driver's location and estimated arrival time,
and pay automatically through stored payment methods. Drivers can choose when to work by simply
going online in the app, and they receive a portion of each fare. Our pricing is dynamic based on
demand, and we offer different service levels from economy to luxury vehicles. We handle all
payment processing, driver background checks, and customer support.
`;

// Classification results for Uber (to save API calls)
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

// Add the required additional exports if they don't exist
if (!getOpenAITextResponse) {
  console.log("Note: This test assumes the updated llmSegmenter.js with new exported functions");
  console.log("If you haven't updated the file yet, please do so first.");
  process.exit(1);
}

async function runEnhancedTest() {
  console.log('TESTING ENHANCED CUSTOMER SEGMENTATION');
  console.log('='.repeat(70));
  console.log('Business: Ridesharing App (similar to Uber)');
  console.log('-'.repeat(70));
  
  try {
    // Use the predefined classification
    console.log('Using existing classification:');
    console.log(`Primary Industry: ${uberClassification.classification.primaryIndustry}`);
    console.log(`Secondary Industry: ${uberClassification.classification.secondaryIndustry}`);
    console.log(`Target Audience: ${uberClassification.classification.targetAudience}`);
    console.log(`Product Type: ${uberClassification.classification.productType}`);
    console.log('-'.repeat(70));
    
    // STEP 1: Get text-based response
    console.log('\nSTEP 1: GETTING TEXT-BASED RESPONSE');
    console.log('='.repeat(70));
    
    const textResponse = await getOpenAITextResponse(
      uberDescription,
      uberClassification.classification,
      { numberOfSegments: 3, includeExcludedSegments: true }
    );
    
    // Save raw text response
    fs.writeFileSync('./uber-text-response.txt', textResponse);
    
    console.log('Raw text response from OpenAI:');
    console.log('-'.repeat(70));
    console.log(textResponse);
    console.log('-'.repeat(70));
    
    // Parse the text response
    console.log('\nParsing text response to extract segments...');
    const textParsedResult = parseSegmentationResponse(textResponse);
    
    console.log(`Found ${textParsedResult.primarySegments.length} primary segments and ${textParsedResult.excludedSegments.length} excluded segments in text.`);
    
    console.log('\nExcluded segments from text response:');
    if (textParsedResult.excludedSegments && textParsedResult.excludedSegments.length > 0) {
      textParsedResult.excludedSegments.forEach((segment, index) => {
        console.log(`${index + 1}. ${segment.name}`);
        console.log(`   Reason: ${segment.reason}`);
      });
    } else {
      console.log('No excluded segments found in text response.');
    }
    
    // STEP 2: Get JSON-based response
    console.log('\nSTEP 2: GETTING JSON-STRUCTURED RESPONSE');
    console.log('='.repeat(70));
    
    const jsonResult = await identifySegmentsWithOpenAI(
      uberDescription,
      uberClassification.classification,
      { numberOfSegments: 3, includeExcludedSegments: true }
    );
    
    // Save JSON response
    fs.writeFileSync('./uber-json-response.json', JSON.stringify(jsonResult, null, 2));
    
    console.log('JSON response structure:');
    console.log('-'.repeat(70));
    console.log(`Primary segments: ${jsonResult.primarySegments.length}`);
    console.log(`Excluded segments: ${jsonResult.excludedSegments?.length || 0}`);
    console.log('-'.repeat(70));
    
    console.log('\nExcluded segments from JSON response:');
    if (jsonResult.excludedSegments && jsonResult.excludedSegments.length > 0) {
      jsonResult.excludedSegments.forEach((segment, index) => {
        console.log(`${index + 1}. ${segment.name}`);
        console.log(`   Reason: ${segment.reason}`);
      });
    } else {
      console.log('No excluded segments found in JSON response.');
    }
    
    // STEP 3: Test combined approach with identifySegmentsWithLLM
    console.log('\nSTEP 3: TESTING COMBINED APPROACH');
    console.log('='.repeat(70));
    
    // This should now use the two-step process internally
    const combinedResult = await identifySegmentsWithLLM(
      uberDescription,
      uberClassification.classification,
      { numberOfSegments: 3, includeExcludedSegments: true }
    );
    
    // Save combined result
    fs.writeFileSync('./uber-combined-result.json', JSON.stringify(combinedResult, null, 2));
    
    // Display the final segmentation results
    console.log('FINAL COMBINED SEGMENTATION RESULTS');
    console.log('='.repeat(70));
    
    console.log(`Found ${combinedResult.primarySegments.length} primary segments.`);
    
    combinedResult.primarySegments.forEach((segment, index) => {
      console.log(`\nSEGMENT ${index + 1}: ${segment.name}`);
      console.log('-'.repeat(50));
      console.log(`OVERVIEW: ${segment.description}`);
      console.log(`MARKET PERCENTAGE: ${segment.percentage || 'N/A'}%`);
      
      console.log('\nDEMOGRAPHICS:');
      if (Array.isArray(segment.characteristics.demographics)) {
        segment.characteristics.demographics.forEach(item => {
          console.log(`  • ${item}`);
        });
      }
      
      console.log('\nPSYCHOGRAPHICS:');
      if (Array.isArray(segment.characteristics.psychographics)) {
        segment.characteristics.psychographics.forEach(item => {
          console.log(`  • ${item}`);
        });
      }
      
      console.log('\nPROBLEMS & NEEDS:');
      if (Array.isArray(segment.characteristics.problemsNeeds)) {
        segment.characteristics.problemsNeeds.forEach(item => {
          console.log(`  • ${item}`);
        });
      }
      
      console.log('\nBEHAVIORS:');
      if (Array.isArray(segment.characteristics.behaviors)) {
        segment.characteristics.behaviors.forEach(item => {
          console.log(`  • ${item}`);
        });
      }
      
      console.log(`\nGROWTH POTENTIAL: ${segment.growthPotential || 'N/A'}`);
      console.log('='.repeat(50));
    });
    
    // Display the excluded segments
    console.log('\nEXCLUDED SEGMENTS:');
    if (combinedResult.excludedSegments && combinedResult.excludedSegments.length > 0) {
      combinedResult.excludedSegments.forEach((segment, index) => {
        console.log(`\n${index + 1}. ${segment.name}`);
        console.log(`   Description: ${segment.description || 'N/A'}`);
        console.log(`   Reason: ${segment.reason || 'N/A'}`);
      });
    } else {
      console.log('No excluded segments found in combined response.');
    }
    
    console.log('\nTest files saved to:');
    console.log('- Text response: ./uber-text-response.txt');
    console.log('- JSON response: ./uber-json-response.json');
    console.log('- Combined result: ./uber-combined-result.json');
    
    console.log('\nTEST COMPLETED SUCCESSFULLY');
    
  } catch (error) {
    console.error('Error running test:', error);
  }
}

// Run the test
runEnhancedTest();