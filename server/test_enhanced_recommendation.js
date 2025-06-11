// test_enhanced_recommendation.js - Test enhanced recommendation engine features

const { generateRecommendation } = require('./src/services/recommendationEngine');

// Enhanced mock data with more comprehensive information
const enhancedMockData = {
  businessIdea: "AI-powered personal finance advisor that provides real-time investment recommendations and automated portfolio rebalancing",
  problemStatement: "Individual investors lose an average of 2-3% annually due to poor timing, emotional decisions, and lack of professional financial advice, costing them hundreds of thousands in retirement savings",
  
  classification: {
    primaryIndustry: "Financial Services",
    secondaryIndustry: "Technology",
    productType: "SaaS Platform",
    targetAudience: "Individual Investors"
  },
  
  segmentation: {
    primarySegments: [
      {
        name: "Young Professionals",
        percentage: 40,
        characteristics: "Tech-savvy, high income, limited investment knowledge",
        growthPotential: "High - rapidly growing demographic with increasing wealth"
      },
      {
        name: "Pre-Retirement Investors", 
        percentage: 35,
        characteristics: "Experienced but seeking optimization, risk-averse",
        growthPotential: "High - large accumulated wealth, willing to pay for advice"
      },
      {
        name: "DIY Investors",
        percentage: 25,
        characteristics: "Self-directed but want validation and automation",
        growthPotential: "Medium - growing segment seeking efficiency"
      }
    ]
  },
  
  marketSize: {
    status: "success",
    market_data: {
      market_breakdown: {
        tam: 4200.0, // $4.2T global wealth management
        sam: 850.0,  // $850B robo-advisor market
        som: 42.5,   // $42.5B serviceable obtainable market
        growth_rate: 28.5, // 28.5% CAGR
        growth_drivers: [
          "Increasing adoption of robo-advisors",
          "Growing retail investor participation",
          "Demand for low-cost investment solutions",
          "AI/ML advancement in financial services"
        ],
        market_challenges: [
          "Regulatory compliance complexity",
          "Customer trust and security concerns",
          "Competition from traditional financial advisors"
        ]
      }
    },
    confidence_score: 9
  },
  
  competition: {
    status: "success",
    competitors: [
      {
        name: "Betterment",
        website: "https://betterment.com",
        market_position: "$33B+ assets under management",
        pricing_model: "0.25% annual fee"
      },
      {
        name: "Wealthfront", 
        website: "https://wealthfront.com",
        market_position: "$27B+ assets under management",
        pricing_model: "0.25% annual fee"
      },
      {
        name: "Robinhood",
        website: "https://robinhood.com", 
        market_position: "22M+ users, commission-free trading",
        pricing_model: "Free trading, premium subscriptions"
      },
      {
        name: "Personal Capital",
        website: "https://personalcapital.com",
        market_position: "Acquired by Empower, wealth tracking focus",
        pricing_model: "Free tools, paid advisory services"
      },
      {
        name: "Acorns",
        website: "https://acorns.com",
        market_position: "9M+ users, micro-investing focus",
        pricing_model: "$1-5/month subscription"
      }
    ],
    market_gaps: [
      "Real-time AI-powered rebalancing with tax optimization",
      "Personalized investment education and behavioral coaching",
      "Integration with comprehensive financial planning tools"
    ],
    barriers_to_entry: [
      "Regulatory requirements (SEC registration, compliance)",
      "High customer acquisition costs in competitive market",
      "Need for significant capital to build trust and scale"
    ],
    market_concentration: "Moderate concentration with several major players but room for innovation",
    confidence_score: 8
  },
  
  problemValidation: {
    status: "success",
    problem_validation: {
      exists: true,
      severity: 8.5,
      frequency: 9.0, 
      willingness_to_pay: "Individual investors pay 0.25-1.5% annually for professional advice, representing $50-500+ per year for typical portfolios"
    },
    evidence: [
      {
        source: "DALBAR Quantitative Analysis",
        type: "research_study",
        credibility: "High",
        key_insight: "Average investor underperforms S&P 500 by 2.9% annually over 20 years due to poor timing and emotional decisions"
      },
      {
        source: "Morningstar Direct", 
        type: "industry_report",
        credibility: "High",
        key_insight: "Robo-advisor assets expected to reach $1.4T by 2025, growing at 25%+ CAGR"
      },
      {
        source: "Vanguard Advisor Alpha Study",
        type: "research_study",
        credibility: "High", 
        key_insight: "Professional financial advice adds ~3% annual value through behavioral coaching and optimization"
      }
    ],
    alternative_solutions: [
      {
        name: "Traditional Financial Advisors",
        approach: "Human-based advice and portfolio management",
        limitations: ["High fees (1-2% annually)", "Minimum investment requirements", "Limited availability"]
      },
      {
        name: "DIY Investment Platforms",
        approach: "Self-directed investing with basic tools",
        limitations: ["Requires significant knowledge", "No behavioral coaching", "Manual rebalancing"]
      }
    ],
    confidence_score: 9.5
  }
};

async function testEnhancedRecommendationEngine() {
  console.log('🚀 Testing Enhanced Recommendation Engine Features\n');
  console.log('=' .repeat(70));
  
  const startTime = Date.now();
  
  try {
    console.log('\n📊 Generating Enhanced AI-Powered Recommendation');
    console.log('-'.repeat(60));
    
    const recommendation = await generateRecommendation({
      businessIdea: enhancedMockData.businessIdea,
      classification: enhancedMockData.classification,
      customerSegments: enhancedMockData.segmentation.primarySegments,
      marketSize: enhancedMockData.marketSize,
      competitiveAnalysis: enhancedMockData.competition
    }, {
      model: 'gpt-4o'
    });
    
    // Core Recommendation
    console.log('\n✅ CORE RECOMMENDATION:');
    console.log(`   Decision: ${recommendation.recommendation}`);
    console.log(`   Score: ${recommendation.score}/100`);
    console.log(`   Confidence: ${recommendation.confidence}/10`);
    console.log(`   Market Readiness: ${recommendation.market_readiness}`);
    console.log(`   Source: ${recommendation.source}`);
    
    // Enhanced Features
    console.log('\n🎯 MARKET TIMING ANALYSIS:');
    if (recommendation.market_timing) {
      console.log(`   Assessment: ${recommendation.market_timing.assessment}`);
      console.log(`   Timing Score: ${recommendation.market_timing.score}/100`);
      console.log(`   Recommendation: ${recommendation.market_timing.recommendation}`);
      
      if (recommendation.market_timing.factors?.length > 0) {
        console.log('   Positive Factors:');
        recommendation.market_timing.factors.forEach(factor => {
          console.log(`     • ${factor}`);
        });
      }
      
      if (recommendation.market_timing.risks?.length > 0) {
        console.log('   Timing Risks:');
        recommendation.market_timing.risks.forEach(risk => {
          console.log(`     ⚠️  ${risk}`);
        });
      }
    }
    
    console.log('\n📈 RISK-ADJUSTED SCORING:');
    if (recommendation.risk_adjusted_score) {
      const ras = recommendation.risk_adjusted_score;
      console.log(`   Base Score: ${ras.base_score}/100`);
      console.log(`   Risk Adjustment: ${ras.risk_adjustment} points`);
      console.log(`   Adjusted Score: ${ras.adjusted_score}/100`);
      console.log(`   Confidence Impact: ${ras.confidence_impact}`);
      
      if (ras.risk_factors?.length > 0) {
        console.log('   Risk Factors:');
        ras.risk_factors.forEach(factor => {
          console.log(`     • ${factor}`);
        });
      }
    }
    
    console.log('\n🏆 COMPETITIVE POSITIONING:');
    if (recommendation.competitive_positioning) {
      const cp = recommendation.competitive_positioning;
      console.log(`   Strategy: ${cp.strategy_recommendation}`);
      
      if (cp.opportunities?.length > 0) {
        console.log('   Positioning Opportunities:');
        cp.opportunities.forEach(opp => {
          console.log(`     🎯 ${opp}`);
        });
      }
      
      if (cp.advantages?.length > 0) {
        console.log('   Competitive Advantages:');
        cp.advantages.forEach(adv => {
          console.log(`     ✅ ${adv}`);
        });
      }
      
      if (cp.risks?.length > 0) {
        console.log('   Positioning Risks:');
        cp.risks.forEach(risk => {
          console.log(`     ⚠️  ${risk}`);
        });
      }
    }
    
    // LLM Insights
    if (recommendation.key_insights?.length > 0) {
      console.log('\n💡 KEY INSIGHTS:');
      recommendation.key_insights.forEach((insight, i) => {
        console.log(`   ${i + 1}. ${insight}`);
      });
    }
    
    if (recommendation.opportunities?.length > 0) {
      console.log('\n🌟 OPPORTUNITIES:');
      recommendation.opportunities.forEach((opp, i) => {
        console.log(`   ${i + 1}. ${opp}`);
      });
    }
    
    if (recommendation.risks?.length > 0) {
      console.log('\n⚠️  RISKS:');
      recommendation.risks.forEach((risk, i) => {
        console.log(`   ${i + 1}. ${risk}`);
      });
    }
    
    if (recommendation.next_steps?.length > 0) {
      console.log('\n📋 NEXT STEPS:');
      recommendation.next_steps.forEach((step, i) => {
        console.log(`   ${i + 1}. ${step}`);
      });
    }
    
    console.log(`\n🧠 REASONING: ${recommendation.reasoning}`);
    
    // Enhanced Metadata
    console.log('\n📊 ENHANCED METADATA:');
    if (recommendation.metadata) {
      const meta = recommendation.metadata;
      console.log(`   Processing Time: ${meta.processingTimeMs}ms`);
      console.log(`   LLM Status: ${meta.llmInsights}`);
      console.log(`   Fallback Used: ${meta.fallbackUsed}`);
      
      if (meta.confidence_factors) {
        const cf = meta.confidence_factors;
        console.log('\n🔍 CONFIDENCE ANALYSIS:');
        console.log(`   Overall Confidence: ${cf.overall_confidence}% (${cf.confidence_level})`);
        console.log(`   Data Completeness: ${cf.data_completeness}%`);
        console.log(`   Data Consistency: ${cf.data_consistency}%`);
        console.log(`   Source Credibility: ${cf.source_credibility}%`);
        console.log(`   Analysis Depth: ${cf.analysis_depth}%`);
      }
      
      if (meta.dataQuality) {
        const dq = meta.dataQuality;
        console.log('\n📈 DATA QUALITY:');
        console.log(`   Modules Available: ${dq.modules_available}/${dq.total_modules}`);
        console.log(`   Completeness: ${(dq.completeness * 100).toFixed(1)}%`);
        if (dq.missing_modules?.length > 0) {
          console.log(`   Missing: ${dq.missing_modules.join(', ')}`);
        }
      }
    }
    
    // Validation Check
    if (recommendation.validation) {
      console.log('\n🔍 VALIDATION CHECK:');
      console.log(`   Rule-based Score: ${recommendation.validation.rule_based_score}/100`);
      console.log(`   Score Validation: ${recommendation.validation.score_validation}`);
      console.log(`   Score Difference: ${recommendation.validation.score_difference} points`);
    }
    
    const totalTime = Date.now() - startTime;
    console.log('\n' + '='.repeat(70));
    console.log(`🎉 ENHANCED RECOMMENDATION ENGINE TEST COMPLETED!`);
    console.log(`⏱️  Total Test Time: ${totalTime}ms`);
    console.log('='.repeat(70));
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error(error.stack);
  }
}

// Run the test
testEnhancedRecommendationEngine(); 