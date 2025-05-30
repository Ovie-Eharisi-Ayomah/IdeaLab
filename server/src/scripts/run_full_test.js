// run_full_test.js - The Unholy Integration Script (Very much a work in progress)
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

const { classifyBusinessIdea } = require('../services/classifiers/businessClassifier');
const { identifySegmentsWithLLM } = require('../services/segmenters/llmSegmenter');
const { calculateMarketSizing } = require('../services/marketSizingCalculator');

/**
 * Run the complete test workflow from a single business idea
 */
async function runFullTest(businessIdea, problemStatement = null) {
  console.log(`\n🚀 TESTING COMPLETE PIPELINE FOR: "${businessIdea}"`);
  console.log("=================================================");
  
  // Create timestamped test directory
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const dirName = businessIdea.split(' ')[0].toLowerCase() + '_' + timestamp;
  // Create an absolute path for the test directory
  const testDir = path.resolve('./test_results', dirName);
  
  fs.mkdirSync(testDir, { recursive: true });
  console.log(`\n📁 Created test directory: ${testDir}`);
  
  try {
    // STEP 1: Run JS classifier
    console.log("\n🧠 STEP 1: Running business classification...");
    const classification = await classifyBusinessIdea(businessIdea);
    // Add a check for classification result
    if (!classification || !classification.primaryIndustry || !classification.productType) {
      console.error("💥 ERROR: Business classification failed to return expected structure.", classification);
      // Decide how to handle: throw error, or use very generic defaults
      // For now, let's use generic defaults and log a prominent error
      classification.primaryIndustry = classification.primaryIndustry || "general industry";
      classification.productType = classification.productType || "product/service type";
      console.warn("⚠️ Proceeding with generic classification defaults for problem statement generation.");
    } else {
    console.log(`Classification result: ${classification.primaryIndustry} / ${classification.productType}`);
    }
    
    // Save classification
    const classificationPath = path.join(testDir, 'classification.json');
    fs.writeFileSync(classificationPath, JSON.stringify(classification, null, 2));
    console.log(`✅ Classification saved to ${classificationPath}`);
    
    // STEP 2: Run JS segmenter
    console.log("\n👥 STEP 2: Running customer segmentation...");
    const segmentation = await identifySegmentsWithLLM(
      businessIdea,
      classification,
      { numberOfSegments: 3 }
    );
    
    // Save segmentation
    const segmentationPath = path.join(testDir, 'segmentation.json');
    fs.writeFileSync(segmentationPath, JSON.stringify(segmentation, null, 2));
    console.log(`✅ Segmentation saved to ${segmentationPath} (${segmentation.primarySegments?.length || 0} segments identified)`);
    
    // STEP 3: Run Python research services
    console.log("\n🔍 STEP 3: Running Python research services...");
    
    if (!problemStatement) {
      let defaultProblemIndustry = "general products/services";
      let defaultProductType = "";

      if (classification && typeof classification.primaryIndustry === 'string' && classification.primaryIndustry.trim() !== "") {
        defaultProblemIndustry = classification.primaryIndustry.toLowerCase();
      } else {
        console.warn("Warning: classification.primaryIndustry is undefined, empty, or not a string. Using default for problem statement.");
      }

      if (classification && typeof classification.productType === 'string' && classification.productType.trim() !== "") {
        defaultProductType = classification.productType.toLowerCase();
      } else {
        console.warn("Warning: classification.productType is undefined, empty, or not a string. Using default for problem statement.");
      }
      
      problemStatement = `difficulty finding ${defaultProblemIndustry}${defaultProductType ? ' ' + defaultProductType : ''}`;
      console.log(`Using generated problem statement: "${problemStatement}"`);
    }
    
    // Correct path to the Python script relative to the project root
    const pythonScriptPath = path.join(__dirname, '../../../research_engine/scripts/save_research_data.py');
    // Explicitly use the Python executable from the research_engine virtual environment
    const pythonExecutable = path.join(__dirname, '../../../research_engine/.venv/bin/python'); 
    // Pass the absolute testDir path as the output directory for the Python script
    const pythonCommand = `"${pythonExecutable}" "${pythonScriptPath}" "${businessIdea}" "${classification.primaryIndustry}" "${classification.productType}" "${problemStatement || 'None'}" "${testDir}"`;
    console.log(`Executing: ${pythonCommand}`);
    
    // Execute from the project root directory
    const projectRoot = path.join(__dirname, '../../..');
    const { stdout, stderr } = await execAsync(pythonCommand, { cwd: projectRoot });
    console.log(stdout);
    if (stderr) console.error(stderr);
    
    // --- REMOVED STEP 4: No need to copy files, Python saves directly to testDir ---
    console.log("\n📋 STEP 4: Skipped (Python saves directly to test directory)");

    // STEP 5: Run market sizing calculator
    console.log("\n💰 STEP 5: Running market sizing calculator...");
    
    // Load all the required data directly from testDir (already absolute)
    const marketDataPath = path.join(testDir, 'market_data.json');
    // const segmentationPath = path.join(testDir, 'segmentation.json'); // Already defined and saved above
    const problemDataPath = path.join(testDir, 'problem.json');
    const competitionDataPath = path.join(testDir, 'competition.json');

    const marketData = JSON.parse(fs.readFileSync(marketDataPath));
    // Read the segmentation data using the existing segmentationPath variable
    const segmentationDataForSizing = JSON.parse(fs.readFileSync(segmentationPath)); 
    
    // Load optional data if available
    let problemDataForSizing = null;
    let competitiveDataForSizing = null;
    
    try {
      problemDataForSizing = JSON.parse(fs.readFileSync(problemDataPath));
      console.log("✅ Loaded problem validation data for sizing");
    } catch (e) {
      console.warn(`⚠️ No problem validation data available for sizing at ${problemDataPath}`);
    }
    
    try {
      competitiveDataForSizing = JSON.parse(fs.readFileSync(competitionDataPath));
      console.log("✅ Loaded competitive analysis data for sizing");
    } catch (e) {
      console.warn(`⚠️ No competitive analysis data available for sizing at ${competitionDataPath}`);
    }
    
    // Run the market sizing calculation
    const marketSizingResult = calculateMarketSizing(
      marketData,
      segmentationDataForSizing, // Use the loaded JS segmentation data
      problemDataForSizing,
      competitiveDataForSizing
    );
    
    // Save the result
    const sizingResultPath = path.join(testDir, 'market_sizing_result.json');
    fs.writeFileSync(sizingResultPath, JSON.stringify(marketSizingResult, null, 2));
    console.log(`✅ Market sizing results saved to ${sizingResultPath}`);
    
    // Print the key results
    console.log("\n📊 MARKET SIZING RESULTS");
    console.log("======================");
    if (marketSizingResult.tam && marketSizingResult.sam && marketSizingResult.som) {
    console.log(`TAM: ${marketSizingResult.tam.formatted} (Range: ${marketSizingResult.tam.range})`);
    console.log(`SAM: ${marketSizingResult.sam.formatted} (Range: ${marketSizingResult.sam.range})`);
    console.log(`SOM: ${marketSizingResult.som.formatted} (Range: ${marketSizingResult.som.range})`);
    console.log(`Confidence Score: ${marketSizingResult.confidence_score}/10`);
        if (marketSizingResult.sensitivity && marketSizingResult.sensitivity.length > 0) {
    console.log("\n🎯 TOP SENSITIVITY FACTORS:");
    marketSizingResult.sensitivity.slice(0, 3).forEach((factor, idx) => {
      console.log(`${idx + 1}. ${factor.name.replace(/_/g, ' ')}: +20% → ${factor.impact.toFixed(1)}% impact`);
    });
        } else {
            console.log("Sensitivity analysis data not available.");
        }
    } else {
        console.log("Market sizing TAM/SAM/SOM data not available or incomplete.");
        if(marketSizingResult.error) console.error("Market Sizing Error:", marketSizingResult.error)
    }
    
    console.log(`\n✨ COMPLETE TEST RESULTS SAVED TO: ${testDir}`);
    return { 
      testDir,
      classification,
      segmentation,
      marketSizingResult
    };
    
  } catch (error) {
    console.error("\n💥 ERROR:", error);
    console.error(error.stack);
    return { error: error.message, testDir };
  }
}

// If run directly
if (require.main === module) {
  if (process.argv.length < 3) {
    console.log("Usage: node run_full_test.js 'Your business idea' ['Problem statement']");
    console.log("\nExample: node run_full_test.js 'A mobile app that connects dog owners with dog walkers'");
    process.exit(1);
  }
  
  const businessIdea = process.argv[2];
  const problemStatement = process.argv.length > 3 ? process.argv[3] : null;
  
  runFullTest(businessIdea, problemStatement)
    .then(() => console.log("\nTest completed successfully!"))
    .catch(err => console.error("\nTest failed:", err));
}

module.exports = { runFullTest };