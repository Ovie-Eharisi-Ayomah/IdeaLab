#!/usr/bin/env python3
"""
Individual test for Problem Validation module
"""
import asyncio
import os
from dotenv import load_dotenv
from research_modules.problem_validation import ProblemValidationService

load_dotenv()

async def test_problem_validation():
    """Test problem validation in isolation"""
    print("🔍 Testing Problem Validation Module Individually")
    print("=" * 60)
    
    # Initialize service
    try:
        service = ProblemValidationService()
        print("✅ Service initialized successfully")
    except Exception as e:
        print(f"❌ Service initialization failed: {e}")
        return
    
    # Test data
    business_idea="An AI-powered tool that validates business ideas by analyzing market size, competition, and demand"
    problem_statement="Entrepreneurs and startup founders waste months building products without validating market demand first, leading to 90% of startups failing due to lack of market need"
    industry="Business Services"

    
    print(f"\n📋 Test Parameters:")
    print(f"   Business Idea: {business_idea}")
    print(f"   Industry: {industry}")
    print(f"   Problem Statement: {problem_statement}")
    
    # Run the validation
    try:
        print(f"\n🚀 Starting problem validation...")
        result = await service.validate_problem(
            business_idea=business_idea,
            problem_statement=problem_statement,
            industry=industry
        )
        
        print(f"\n✅ Validation completed!")
        print(f"   Status: {result.get('status', 'unknown')}")
        print(f"   Problem Exists: {result.get('problem_validation', {}).get('exists')}")
        print(f"   Severity: {result.get('problem_validation', {}).get('severity', 0)}/10")
        print(f"   Confidence Score: {result.get('confidence_score', 0)}/10")
        print(f"   Research Method: {result.get('research_method', 'unknown')}")
        
        if result.get('error'):
            print(f"   Error: {result['error']}")
            
        return result
        
    except Exception as e:
        print(f"❌ Validation failed with exception: {e}")
        import traceback
        traceback.print_exc()
        return None

if __name__ == "__main__":
    asyncio.run(test_problem_validation()) 