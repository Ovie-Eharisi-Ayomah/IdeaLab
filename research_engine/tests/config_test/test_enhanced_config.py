#!/usr/bin/env python3
"""
Test script to verify enhanced browser configuration with 30 max steps
and prevent stuck processes
"""
import asyncio
import json
import time
from dotenv import load_dotenv

# Import enhanced services with new browser config
from competitive_analysis import CompetitiveAnalysisService
from problem_validation import ProblemValidationService
from market_sizing import MarketSizingService

load_dotenv()

async def test_competitive_analysis():
    """Test competitive analysis with enhanced config"""
    print("\n" + "="*60)
    print("TESTING COMPETITIVE ANALYSIS WITH ENHANCED CONFIG")
    print("="*60)
    
    service = CompetitiveAnalysisService()
    
    start_time = time.time()
    result = await service.analyze_competition(
        business_idea="AI-powered food delivery optimization tool for restaurants",
        industry="Food Technology",
        product_type="SaaS Platform"
    )
    end_time = time.time()
    
    print(f"⏱️ Analysis completed in {end_time - start_time:.2f} seconds")
    print(f"📊 Status: {result.get('status', 'unknown')}")
    print(f"🏢 Competitors found: {len(result.get('competitors', []))}")
    print(f"📈 Confidence score: {result.get('confidence_score', 0)}/10")
    print(f"🛠️ Research method: {result.get('research_method', 'unknown')}")
    print(f"🔢 Agent steps: {result.get('agent_steps', 0)}")
    
    if result.get("status") == "error":
        print(f"❌ Error: {result.get('error', 'Unknown error')}")
    
    return result

async def test_problem_validation():
    """Test problem validation with enhanced config"""
    print("\n" + "="*60)
    print("TESTING PROBLEM VALIDATION WITH ENHANCED CONFIG")
    print("="*60)
    
    service = ProblemValidationService()
    
    start_time = time.time()
    result = await service.validate_problem(
        business_idea="AI-powered food delivery optimization tool",
        problem_statement="Restaurant owners struggle with inefficient delivery routing that leads to cold food and unhappy customers",
        industry="Food Technology"
    )
    end_time = time.time()
    
    print(f"⏱️ Analysis completed in {end_time - start_time:.2f} seconds")
    print(f"📊 Status: {result.get('status', 'unknown')}")
    
    problem_validation = result.get('problem_validation', {})
    print(f"✅ Problem exists: {problem_validation.get('exists', 'unknown')}")
    print(f"🔥 Severity: {problem_validation.get('severity', 0)}/10")
    print(f"📈 Confidence score: {result.get('confidence_score', 0)}/10")
    print(f"🛠️ Research method: {result.get('research_method', 'unknown')}")
    print(f"🔢 Agent steps: {result.get('agent_steps', 0)}")
    
    if result.get("status") == "error":
        print(f"❌ Error: {result.get('error', 'Unknown error')}")
    
    return result

async def test_market_sizing():
    """Test market sizing with enhanced config"""
    print("\n" + "="*60)
    print("TESTING MARKET SIZING WITH ENHANCED CONFIG")
    print("="*60)
    
    service = MarketSizingService()
    
    start_time = time.time()
    result = await service.research_market_size(
        business_idea="AI-powered food delivery optimization tool",
        industry="Food Technology",
        product_type="SaaS Platform"
    )
    end_time = time.time()
    
    print(f"⏱️ Analysis completed in {end_time - start_time:.2f} seconds")
    print(f"📊 Status: {result.get('status', 'unknown')}")
    
    market_data = result.get('market_data', {})
    sources = market_data.get('sources', [])
    print(f"📚 Market sources found: {len(sources)}")
    print(f"📈 Confidence score: {market_data.get('confidence_score', 0)}/10")
    print(f"🛠️ Research method: {result.get('research_method', 'unknown')}")
    print(f"🔢 Agent steps: {result.get('agent_steps', 0)}")
    
    if result.get("status") == "error":
        print(f"❌ Error: {result.get('error', 'Unknown error')}")
    
    return result

async def main():
    """Run all enhanced configuration tests"""
    print("🚀 Starting Enhanced Configuration Tests with 30 Max Steps")
    print(f"⏰ Start time: {time.strftime('%Y-%m-%d %H:%M:%S')}")
    
    all_results = {}
    
    try:
        # Test competitive analysis
        all_results['competitive_analysis'] = await test_competitive_analysis()
        
        # Test problem validation  
        all_results['problem_validation'] = await test_problem_validation()
        
        # Test market sizing
        all_results['market_sizing'] = await test_market_sizing()
        
        # Summary
        print("\n" + "="*60)
        print("ENHANCED CONFIGURATION TEST SUMMARY")
        print("="*60)
        
        for test_name, result in all_results.items():
            status = result.get('status', 'unknown')
            steps = result.get('agent_steps', 0)
            confidence = result.get('confidence_score', 0)
            method = result.get('research_method', 'unknown')
            
            status_emoji = "✅" if status == "success" else "❌" if status == "error" else "⚠️"
            
            print(f"{status_emoji} {test_name.upper()}: {status}")
            print(f"   📊 Steps: {steps}/30 | Confidence: {confidence}/10 | Method: {method}")
            
            if status == "error":
                print(f"   🚨 Error: {result.get('error', 'Unknown error')}")
        
        # Save detailed results
        output_file = f"output/enhanced_config_test_results_{int(time.time())}.json"
        with open(output_file, 'w') as f:
            json.dump(all_results, f, indent=2, default=str)
        
        print(f"\n💾 Detailed results saved to: {output_file}")
        print(f"⏰ End time: {time.strftime('%Y-%m-%d %H:%M:%S')}")
        
    except Exception as e:
        print(f"\n❌ Test suite failed: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(main()) 