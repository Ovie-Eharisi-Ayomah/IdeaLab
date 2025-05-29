# test_competitive_analysis.py
import asyncio
import sys
import os
import json
from pathlib import Path

# Add the parent directory to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from research_modules.competitive_analysis import CompetitiveAnalysisService

async def test_competitive_analysis():
    # Initialize the service
    service = CompetitiveAnalysisService()
    
    print("\n=== TESTING ENHANCED COMPETITIVE ANALYSIS WITH PROBLEM STATEMENT ===\n")
    print("A browser window will open. Don't mess with it - let the AI do its thing.")
    print("This will take 30-60 seconds, maybe more. Go grab a coffee.")
    
    try:
        # Test with a comprehensive business idea and problem statement
        business_idea = "An AI-powered tool that validates business ideas by analyzing market size, competition, and demand"
        industry = "Business Services"
        product_type = "SaaS"
        problem_statement = "Entrepreneurs and startup founders waste months building products without validating market demand first, leading to 90% of startups failing due to lack of market need"
        
        print(f"\nAnalyzing competition for: {business_idea}")
        print(f"Industry: {industry}")
        print(f"Product Type: {product_type}")
        print(f"Problem Statement: {problem_statement}")
        
        print("\n--- This test will demonstrate enhanced search query generation ---")
        print("The AI will now generate more specific search queries based on:")
        print("1. The actual problem being solved (validation before building)")
        print("2. Target audience (entrepreneurs, startup founders)")
        print("3. Specific pain points (wasting time, startup failure rates)")
        print("4. Value proposition (market demand validation)")
        
        # Run the analysis with problem statement
        result = await service.analyze_competition(
            business_idea,
            industry,
            product_type,
            problem_statement  # Now includes the problem statement
        )
        
        # Print the result
        print("\n=== ENHANCED COMPETITIVE ANALYSIS RESULTS ===\n")
        
        # Print research method and metadata
        print(f"Research Method: {result.get('research_method', 'Unknown')}")
        if 'agent_steps' in result:
            print(f"Agent Steps Taken: {result['agent_steps']}")
        
        # Print competitors nicely formatted
        print(f"\nFound {len(result['competitors'])} competitors:")
        for i, comp in enumerate(result['competitors'], 1):
            print(f"\n{i}. {comp['name']} ({comp['website']})")
            print(f"   Products: {', '.join(comp['products'])}")
            print(f"   Target Audience: {comp['target_audience']}")
            print(f"   Pricing: {comp['pricing_model']}")
            print(f"   USPs: {', '.join(comp['unique_selling_points'])}")
            print(f"   Market Position: {comp['market_position']}")
            if comp['founded']:
                print(f"   Founded: {comp['founded']}")
            if comp['funding']:
                print(f"   Funding: {comp['funding']}")
        
        # Print market gaps
        print("\nMarket Gaps:")
        for i, gap in enumerate(result['market_gaps'], 1):
            print(f"{i}. {gap}")
        
        # Print barriers to entry
        print("\nBarriers to Entry:")
        for i, barrier in enumerate(result['barriers_to_entry'], 1):
            print(f"{i}. {barrier}")
        
        # Print market concentration
        print(f"\nMarket Concentration: {result['market_concentration']}")
        
        # Print emerging trends
        print("\nEmerging Trends:")
        for i, trend in enumerate(result['emerging_trends'], 1):
            print(f"{i}. {trend}")
        
        # Print confidence score and quality metrics
        print(f"\nConfidence Score: {result['confidence_score']}/10")
        
        if 'data_quality' in result:
            quality = result['data_quality']
            print(f"Data Quality Metrics:")
            print(f"  - Total Competitors Found: {quality['total_competitors']}")
            print(f"  - Valid Sources: {quality['valid_sources']}")
            print(f"  - Analysis Completeness: {quality['analysis_completeness']:.1%}")
            if quality['missing_fields']:
                print(f"  - Missing Fields: {', '.join(quality['missing_fields'])}")
        
        # Print research limitations (new feature)
        if result.get('research_limitations'):
            print("\nResearch Limitations:")
            for i, limitation in enumerate(result['research_limitations'], 1):
                print(f"{i}. {limitation}")
        
        # Print sources with access status
        print("\nSources:")
        for i, source in enumerate(result['sources'], 1):
            date_str = f" ({source['date']})" if source.get('date') else ""
            access_status = f" [{source.get('access_status', 'accessible')}]"
            print(f"{i}. {source['name']}{date_str}: {source['url']}{access_status}")
        
        # Save full JSON to a file for inspection
        output_dir = Path("./output")
        output_dir.mkdir(exist_ok=True)
        
        output_file = output_dir / "competitive_analysis_result_enhanced.json"
        with open(output_file, "w") as f:
            json.dump(result, f, indent=2)
        
        print(f"\nFull results saved to {output_file}")
        
        # Test comparison: show how this differs from basic analysis
        print("\n=== ENHANCEMENT DEMONSTRATION ===")
        print("This enhanced analysis should show:")
        print("✓ More targeted competitors (idea validation tools, not just business software)")
        print("✓ Better understanding of the startup/entrepreneur target market")
        print("✓ Specific focus on pre-launch validation solutions")
        print("✓ Recognition of the 'build first, validate later' problem")
        print("✓ Research limitations and access restrictions documented")
        
    except Exception as e:
        print(f"\nERROR: {str(e)}")
        import traceback
        traceback.print_exc()

async def test_comparison_with_without_problem_statement():
    """Test to demonstrate the difference between using problem statement vs not using it"""
    service = CompetitiveAnalysisService()
    
    print("\n=== COMPARISON TEST: WITH vs WITHOUT PROBLEM STATEMENT ===\n")
    
    business_idea = "An AI-powered tool that validates business ideas by analyzing market size, competition, and demand"
    industry = "Business Services"
    product_type = "SaaS"
    problem_statement = "Entrepreneurs and startup founders waste months building products without validating market demand first, leading to 90% of startups failing due to lack of market need"
    
    try:
        print("🔍 Testing search query generation without problem statement...")
        queries_without = service._generate_search_queries(business_idea, industry, product_type)
        print("Generated queries (without problem statement):")
        for i, query in enumerate(queries_without, 1):
            print(f"  {i}. {query}")
        
        print("\n🔍 Testing search query generation WITH problem statement...")
        queries_with = service._generate_search_queries(business_idea, industry, product_type, problem_statement)
        print("Generated queries (with problem statement):")
        for i, query in enumerate(queries_with, 1):
            print(f"  {i}. {query}")
        
        print("\n📊 COMPARISON ANALYSIS:")
        print("Without problem statement: Likely broader, generic business software terms")
        print("With problem statement: Should include startup-specific, validation-focused terms")
        print("\nKey improvements to look for:")
        print("✓ 'startup validation' vs generic 'business analysis'")
        print("✓ 'entrepreneur tools' vs generic 'business tools'")
        print("✓ 'idea testing' vs generic 'market research'")
        print("✓ References to 'before building' or 'pre-launch'")
        
    except Exception as e:
        print(f"Comparison test failed: {e}")

if __name__ == "__main__":
    # Run both tests
    print("="*60)
    print("RUNNING MAIN COMPETITIVE ANALYSIS TEST")
    print("="*60)
    asyncio.run(test_competitive_analysis())
    
    print("\n" + "="*60)
    print("RUNNING COMPARISON TEST")
    print("="*60)
    asyncio.run(test_comparison_with_without_problem_statement())