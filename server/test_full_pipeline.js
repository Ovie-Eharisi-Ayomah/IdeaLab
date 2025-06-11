// test_full_pipeline.js - Test complete pipeline integration with enhanced recommendation engine

const axios = require('axios');

// Test configuration
const SERVER_URL = 'http://localhost:5002';
const PYTHON_API_URL = 'http://localhost:8000';

const testBusinessIdea = {
  businessIdea: "An AI-powered software that automates market research and problem validation of business ideas and opportunities and clarifies next steps for business builders",
  problemStatement: "Business builders struggle to validate business ideas and opportunities, wasting valuable time and resources on unneeded ventures."
};

async function testFullPipeline() {
  console.log('🚀 Testing Complete Pipeline Integration');
  console.log('=' .repeat(60));
  console.log(`Business Idea: ${testBusinessIdea.businessIdea}`);
  console.log(`Problem Statement: ${testBusinessIdea.problemStatement}`);
  console.log('=' .repeat(60));

  try {
    // Step 1: Start analysis job
    console.log('\n📋 Step 1: Starting Analysis Job');
    console.log('-'.repeat(40));
    
    const startResponse = await axios.post(`${SERVER_URL}/api/analyze`, testBusinessIdea);
    const jobId = startResponse.data.jobId;
    
    console.log(`✅ Job created successfully: ${jobId}`);
    
    // Step 2: Monitor job progress
    console.log('\n⏳ Step 2: Monitoring Job Progress');
    console.log('-'.repeat(40));
    
    let job;
    let attempts = 0;
    const maxAttempts = 60; // 5 minutes max
    
    do {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
      attempts++;
      
      const statusResponse = await axios.get(`${SERVER_URL}/api/jobs/${jobId}`);
      job = statusResponse.data;
      
      console.log(`\n📊 Attempt ${attempts}/${maxAttempts} - Status: ${job.status}`);
      console.log('Progress:');
      Object.entries(job.progress).forEach(([step, status]) => {
        const emoji = status === 'complete' ? '✅' : 
                     status === 'processing' ? '🔄' : 
                     status === 'failed' ? '❌' : 
                     status === 'skipped' ? '⏭️' : '⏸️';
        console.log(`  ${emoji} ${step}: ${status}`);
      });
      
      if (job.status === 'complete' || job.status === 'failed') {
        break;
      }
      
    } while (attempts < maxAttempts);
    
    // Step 3: Analyze results
    console.log('\n📈 Step 3: Analysis Results');
    console.log('-'.repeat(40));
    
    if (job.status === 'complete') {
      console.log('✅ Job completed successfully!\n');
      
      // Classification Results
      if (job.results.classification) {
        console.log('🏷️  Classification:');
        console.log(`   Industry: ${job.results.classification.primaryIndustry}`);
        console.log(`   Product Type: ${job.results.classification.productType}`);
        console.log(`   Target Audience: ${job.results.classification.targetAudience}`);
      }
      
      // Segmentation Results
      if (job.results.segmentation?.primarySegments) {
        console.log('\n👥 Customer Segmentation:');
        job.results.segmentation.primarySegments.slice(0, 3).forEach((segment, i) => {
          console.log(`   ${i + 1}. ${segment.name} (${segment.percentage}%)`);
        });
      }
      
      // Market Sizing Results
      if (job.results.marketSize) {
        console.log('\n💰 Market Sizing:');
        if (job.results.marketSize.market_data?.market_breakdown) {
          const mb = job.results.marketSize.market_data.market_breakdown;
          console.log(`   TAM: $${mb.tam}B`);
          console.log(`   SAM: $${mb.sam}B`);
          console.log(`   SOM: $${mb.som}B`);
          console.log(`   Growth Rate: ${mb.growth_rate}%`);
        }
        console.log(`   Confidence: ${job.results.marketSize.confidence_score}/10`);
      }
      
      // Competition Results
      if (job.results.competition) {
        console.log('\n🏆 Competition Analysis:');
        console.log(`   Competitors Found: ${job.results.competition.competitors?.length || 0}`);
        console.log(`   Market Gaps: ${job.results.competition.market_gaps?.length || 0}`);
        console.log(`   Confidence: ${job.results.competition.confidence_score}/10`);
      }
      
      // Problem Validation Results
      if (job.results.problemValidation) {
        console.log('\n❓ Problem Validation:');
        const pv = job.results.problemValidation.problem_validation;
        if (pv) {
          console.log(`   Problem Exists: ${pv.exists ? 'Yes' : 'No'}`);
          console.log(`   Severity: ${pv.severity}/10`);
          console.log(`   Frequency: ${pv.frequency}/10`);
        }
        console.log(`   Confidence: ${job.results.problemValidation.confidence_score}/10`);
      }
      
      // Enhanced Recommendation Results
      if (job.results.recommendation) {
        console.log('\n🎯 AI-Powered Recommendation:');
        console.log('-'.repeat(40));
        const rec = job.results.recommendation;
        
        console.log(`\n🚦 RECOMMENDATION: ${rec.recommendation}`);
        console.log(`📊 Score: ${rec.score}/100`);
        console.log(`🎯 Confidence: ${rec.confidence}/10`);
        console.log(`🏁 Market Readiness: ${rec.market_readiness}`);
        console.log(`🔧 Source: ${rec.source}`);
        
        if (rec.key_insights) {
          console.log('\n💡 Key Insights:');
          rec.key_insights.forEach((insight, i) => {
            console.log(`   ${i + 1}. ${insight}`);
          });
        }
        
        if (rec.opportunities) {
          console.log('\n🌟 Opportunities:');
          rec.opportunities.forEach((opp, i) => {
            console.log(`   ${i + 1}. ${opp}`);
          });
        }
        
        if (rec.risks) {
          console.log('\n⚠️  Risks:');
          rec.risks.forEach((risk, i) => {
            console.log(`   ${i + 1}. ${risk}`);
          });
        }
        
        if (rec.next_steps) {
          console.log('\n📋 Next Steps:');
          rec.next_steps.forEach((step, i) => {
            console.log(`   ${i + 1}. ${step}`);
          });
        }
        
        console.log(`\n🧠 Reasoning: ${rec.reasoning}`);
        
        if (rec.validation) {
          console.log('\n🔍 Validation:');
          console.log(`   Rule-based Score: ${rec.validation.rule_based_score}/100`);
          console.log(`   Score Validation: ${rec.validation.score_validation}`);
          console.log(`   Score Difference: ${rec.validation.score_difference} points`);
        }
        
        if (rec.metadata) {
          console.log('\n📊 Metadata:');
          console.log(`   Processing Time: ${rec.metadata.processingTimeMs}ms`);
          console.log(`   LLM Insights: ${rec.metadata.llmInsights}`);
          console.log(`   Fallback Used: ${rec.metadata.fallbackUsed}`);
          if (rec.metadata.dataQuality) {
            const dq = rec.metadata.dataQuality;
            console.log(`   Data Quality: ${dq.modules_available}/${dq.total_modules} modules (${(dq.completeness * 100).toFixed(1)}%)`);
          }
        }
      }
      
      // Step 4: Integration validation
      console.log('\n\n🔍 Step 4: Integration Validation');
      console.log('-'.repeat(40));
      
      const validationChecks = [
        { name: 'Classification completed', passed: !!job.results.classification },
        { name: 'Segmentation completed', passed: !!job.results.segmentation },
        { name: 'Market sizing completed', passed: !!job.results.marketSize },
        { name: 'Competition analysis completed', passed: !!job.results.competition },
        { name: 'Problem validation completed', passed: !!job.results.problemValidation },
        { name: 'Recommendation generated', passed: !!job.results.recommendation },
        { name: 'LLM insights generated', passed: job.results.recommendation?.source === 'llm_enhanced' },
        { name: 'All modules have data', passed: job.results.recommendation?.metadata?.dataQuality?.completeness === 1 }
      ];
      
      console.log('\n✅ Validation Results:');
      validationChecks.forEach(check => {
        const emoji = check.passed ? '✅' : '❌';
        console.log(`   ${emoji} ${check.name}`);
      });
      
      const allPassed = validationChecks.every(check => check.passed);
      
      console.log('\n' + '='.repeat(60));
      if (allPassed) {
        console.log('🎉 FULL PIPELINE INTEGRATION TEST PASSED!');
        console.log('🚀 Enhanced recommendation engine successfully integrated!');
      } else {
        console.log('⚠️  SOME VALIDATION CHECKS FAILED');
        console.log('🔧 Review failed components above');
      }
      console.log('='.repeat(60));
      
      return {
        success: allPassed,
        jobId,
        results: job.results,
        validationChecks
      };
      
    } else {
      console.log('❌ Job failed or timed out');
      console.log(`Status: ${job.status}`);
      if (job.error) {
        console.log(`Error: ${job.error}`);
      }
      
      return {
        success: false,
        jobId,
        status: job.status,
        error: job.error
      };
    }
    
  } catch (error) {
    console.error('\n❌ Pipeline test failed:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Make sure both servers are running:');
      console.log('   1. Node.js server: npm run dev (port 5002)');
      console.log('   2. Python API: python api.py (port 8000)');
    }
    
    return {
      success: false,
      error: error.message
    };
  }
}

// Run the test
if (require.main === module) {
  testFullPipeline()
    .then(result => {
      if (result.success) {
        console.log('\n🔬 Full pipeline test completed successfully!');
        process.exit(0);
      } else {
        console.log('\n💥 Full pipeline test failed!');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('Test execution error:', error);
      process.exit(1);
    });
}

module.exports = { testFullPipeline }; 