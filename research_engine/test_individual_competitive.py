#!/usr/bin/env python3
"""
Individual test for Competitive Analysis module
"""
import asyncio
import os
from dotenv import load_dotenv
from competitive_analysis import CompetitiveAnalysisService

load_dotenv()

async def test_competitive_analysis():
    """Test competitive analysis in isolation"""
    print("🔍 Testing Competitive Analysis Module Individually")
    print("=" * 60)
    
    # Initialize service
    try:
        service = CompetitiveAnalysisService()
        print("✅ Service initialized successfully")
    except Exception as e:
        print(f"❌ Service initialization failed: {e}")
        return
    
    # Test data
    business_idea="An AI-powered tool that validates business ideas by analyzing market size, competition, and demand"
    problem_statement="Entrepreneurs and startup founders waste months building products without validating market demand first, leading to 90% of startups failing due to lack of market need"
    industry="Business Services"
    product_type="SaaS Platform"
    
    print(f"\n📋 Test Parameters:")
    print(f"   Business Idea: {business_idea}")
    print(f"   Industry: {industry}")
    print(f"   Product Type: {product_type}")
    print(f"   Problem Statement: {problem_statement}")
    
    # Run the analysis
    try:
        print(f"\n🚀 Starting competitive analysis...")
        result = await service.analyze_competition(
            business_idea=business_idea,
            industry=industry,
            product_type=product_type,
            problem_statement=problem_statement
        )
        
        print(f"\n✅ Analysis completed!")
        print(f"   Status: {result.get('status', 'unknown')}")
        print(f"   Competitors Found: {len(result.get('competitors', []))}")
        print(f"   Confidence Score: {result.get('confidence_score', 0)}/10")
        print(f"   Research Method: {result.get('research_method', 'unknown')}")
        
        if result.get('error'):
            print(f"   Error: {result['error']}")
            
        return result
        
    except Exception as e:
        print(f"❌ Analysis failed with exception: {e}")
        import traceback
        traceback.print_exc()
        return None

if __name__ == "__main__":
    asyncio.run(test_competitive_analysis()) 