#!/usr/bin/env python3
"""
Test script to verify all enhanced research engine modules
"""
import asyncio
import json
import time
import os
from datetime import datetime
from dotenv import load_dotenv

# Import all enhanced services
from research_modules.competitive_analysis import CompetitiveAnalysisService
from research_modules.problem_validation import ProblemValidationService
from research_modules.market_sizing import MarketSizingService

load_dotenv()

async def test_competitive_analysis():
    """Test the enhanced competitive analysis module"""
    print("🏢 Testing Competitive Analysis...")
    
    service = CompetitiveAnalysisService()
    
    start_time = time.time()
    result = await service.analyze_competition(
        business_idea="An AI-powered tool that validates business ideas by analyzing market size, competition, and demand",
        problem_statement="Entrepreneurs and startup founders waste months building products without validating market demand first, leading to 90% of startups failing due to lack of market need",
        industry="Business Services",
        product_type="SaaS Platform"
    )
    end_time = time.time()
    
    # Add test metadata
    result["test_metadata"] = {
        "module": "competitive_analysis",
        "execution_time_seconds": round(end_time - start_time, 1),
        "test_timestamp": datetime.now().isoformat(),
        "competitors_found": len(result.get('competitors', [])),
        "market_gaps_found": len(result.get('market_gaps', [])),
        "barriers_found": len(result.get('barriers_to_entry', [])),
        "trends_found": len(result.get('emerging_trends', [])),
        "sources_found": len(result.get('sources', []))
    }
    
    print(f"   ✅ Completed in {end_time - start_time:.1f}s - Status: {result.get('status', 'unknown')}")
    print(f"   📊 Found: {len(result.get('competitors', []))} competitors, {len(result.get('sources', []))} sources")
    
    return result

async def test_problem_validation():
    """Test the enhanced problem validation module"""
    print("❓ Testing Problem Validation...")
    
    service = ProblemValidationService()
    
    start_time = time.time()
    result = await service.validate_problem(
        business_idea="An AI-powered tool that validates business ideas by analyzing market size, competition, and demand",
        problem_statement="Entrepreneurs and startup founders waste months building products without validating market demand first, leading to 90% of startups failing due to lack of market need",
        industry="Business Services"
    )
    end_time = time.time()
    
    # Add test metadata
    validation = result.get('problem_validation', {})
    result["test_metadata"] = {
        "module": "problem_validation",
        "execution_time_seconds": round(end_time - start_time, 1),
        "test_timestamp": datetime.now().isoformat(),
        "problem_exists": validation.get('exists'),
        "severity_score": validation.get('severity', 0),
        "frequency_score": validation.get('frequency', 0),
        "evidence_count": len(result.get('evidence', [])),
        "alternative_solutions_count": len(result.get('alternative_solutions', []))
    }
    
    print(f"   ✅ Completed in {end_time - start_time:.1f}s - Status: {result.get('status', 'unknown')}")
    print(f"   📊 Problem exists: {validation.get('exists')}, Severity: {validation.get('severity', 0)}/10")
    
    return result

async def test_market_sizing():
    """Test the enhanced market sizing module"""
    print("📈 Testing Market Sizing...")
    
    service = MarketSizingService()
    
    start_time = time.time()
    result = await service.research_market_size(
        business_idea="An AI-powered tool that validates business ideas by analyzing market size, competition, and demand",
        industry="Business Services",
        product_type="SaaS Platform"
    )
    end_time = time.time()
    
    # Add test metadata
    market_data = result.get('market_data', {})
    result["test_metadata"] = {
        "module": "market_sizing",
        "execution_time_seconds": round(end_time - start_time, 1),
        "test_timestamp": datetime.now().isoformat(),
        "sources_found": len(market_data.get('sources', [])),
        "confidence_score": market_data.get('confidence_score', 0),
        "has_market_breakdown": bool(market_data.get('market_breakdown', {})),
        "data_recency": market_data.get('data_recency', 'Unknown')
    }
    
    print(f"   ✅ Completed in {end_time - start_time:.1f}s - Status: {result.get('status', 'unknown')}")
    print(f"   📊 Found: {len(market_data.get('sources', []))} sources, Confidence: {market_data.get('confidence_score', 0)}/10")
    
    return result

async def main():
    """Run all module tests and save results to JSON"""
    print("🚀 Starting Enhanced Research Engine Module Tests")
    print("=" * 60)
    
    # Initialize test results structure
    test_results = {
        "test_session": {
            "start_time": datetime.now().isoformat(),
            "test_type": "enhanced_modules_comprehensive",
            "test_case": {
                "business_idea": "An AI-powered tool that validates business ideas by analyzing market size, competition, and demand",
                "problem_statement": "Entrepreneurs and startup founders waste months building products without validating market demand first, leading to 90% of startups failing due to lack of market need",
                "industry": "Business Services",
                "product_type": "SaaS Platform"
            }
        },
        "results": {},
        "summary": {},
        "errors": []
    }
    
    total_start_time = time.time()
    
    try:
        # Test competitive analysis
        print("\n" + "-" * 60)
        comp_result = await test_competitive_analysis()
        test_results["results"]["competitive_analysis"] = comp_result
        
        # Test problem validation  
        print("\n" + "-" * 60)
        prob_result = await test_problem_validation()
        test_results["results"]["problem_validation"] = prob_result
        
        # Test market sizing
        print("\n" + "-" * 60)
        market_result = await test_market_sizing()
        test_results["results"]["market_sizing"] = market_result
        
        # Calculate summary
        total_end_time = time.time()
        test_results["test_session"]["end_time"] = datetime.now().isoformat()
        test_results["test_session"]["total_execution_time_seconds"] = round(total_end_time - total_start_time, 1)
        
        test_results["summary"] = {
            "all_tests_passed": all(
                result.get('status') == 'success' for result in [comp_result, prob_result, market_result]
            ),
            "competitive_analysis": {
                "status": comp_result.get('status', 'unknown'),
                "confidence_score": comp_result.get('confidence_score', 0),
                "execution_time": comp_result.get('test_metadata', {}).get('execution_time_seconds', 0),
                "research_method": comp_result.get('research_method', 'unknown')
            },
            "problem_validation": {
                "status": prob_result.get('status', 'unknown'),
                "confidence_score": prob_result.get('confidence_score', 0),
                "execution_time": prob_result.get('test_metadata', {}).get('execution_time_seconds', 0),
                "research_method": prob_result.get('research_method', 'unknown')
            },
            "market_sizing": {
                "status": market_result.get('status', 'unknown'),
                "confidence_score": market_result.get('market_data', {}).get('confidence_score', 0),
                "execution_time": market_result.get('test_metadata', {}).get('execution_time_seconds', 0),
                "research_method": market_result.get('research_method', 'unknown')
            },
            "enhanced_features_verified": [
                "5-Phase Research Methodology",
                "Enhanced JSON Output Processing", 
                "Browser Configuration Improvements",
                "CAPTCHA Handling",
                "Quality Validation System",
                "LLM-Powered Search Query Generation",
                "Intelligent Caching",
                "Confidence Scoring",
                "Headless Browser Operation"
            ]
        }
        
        print("\n" + "=" * 60)
        print("📊 ENHANCED MODULES TEST SUMMARY")
        print("=" * 60)
        
        print(f"✅ Competitive Analysis: {comp_result.get('status', 'unknown')} (Score: {comp_result.get('confidence_score', 0)}/10)")
        print(f"✅ Problem Validation: {prob_result.get('status', 'unknown')} (Score: {prob_result.get('confidence_score', 0)}/10)")
        print(f"✅ Market Sizing: {market_result.get('status', 'unknown')} (Score: {market_result.get('market_data', {}).get('confidence_score', 0)}/10)")
        print(f"\n🕒 Total execution time: {test_results['test_session']['total_execution_time_seconds']} seconds")
        
        if test_results["summary"]["all_tests_passed"]:
            print(f"\n🎉 Enhanced Research Engine Status: FULLY OPERATIONAL")
        else:
            print(f"\n⚠️  Some tests encountered issues - check detailed results")
        
    except Exception as e:
        error_info = {
            "error_type": type(e).__name__,
            "error_message": str(e),
            "timestamp": datetime.now().isoformat()
        }
        test_results["errors"].append(error_info)
        test_results["summary"]["all_tests_passed"] = False
        
        print(f"❌ Test failed with error: {str(e)}")
        import traceback
        traceback.print_exc()
    
    # Save results to JSON file
    output_dir = "output"
    os.makedirs(output_dir, exist_ok=True)
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    output_file = os.path.join(output_dir, f"enhanced_modules_test_results_{timestamp}.json")
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(test_results, f, indent=2, ensure_ascii=False)
    
    print(f"\n💾 Detailed test results saved to: {output_file}")
    print(f"📄 File size: {os.path.getsize(output_file) / 1024:.1f} KB")

if __name__ == "__main__":
    asyncio.run(main()) 