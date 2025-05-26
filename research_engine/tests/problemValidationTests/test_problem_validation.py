# test_problem_validation.py - Enhanced test for problem validation service
import asyncio
import sys
import os
import json
from pathlib import Path

# Add the parent directory to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from problem_validation import ProblemValidationService

async def test_problem_validation():
    """Test the enhanced problem validation service with comprehensive output"""
    # Initialize the service
    service = ProblemValidationService()
    
    print("\n" + "="*70)
    print("TESTING ENHANCED PROBLEM VALIDATION WITH BROWSER AUTOMATION")
    print("="*70)
    print("\nThis test will:")
    print("• Use LLM-generated search queries for targeted research")
    print("• Employ enhanced browser automation with timeout handling")
    print("• Validate problem existence with confidence scoring")
    print("• Find alternative solutions and market evidence")
    print("• Provide quality metrics and research limitations")
    print("\nExpected duration: 2-5 minutes")
    print("The browser will run in headless mode (no visible window)")
    
    try:
        # Test with a specific business idea and problem statement
        business_idea = "AI-powered tool that validates business ideas before entrepreneurs invest time and money"
        problem_statement = "Entrepreneurs waste months building products without validating if there's real market demand"
        industry = "Business Services"
        
        print(f"\n📋 ANALYSIS PARAMETERS:")
        print(f"   Business Idea: {business_idea}")
        print(f"   Problem Statement: {problem_statement}")
        print(f"   Industry: {industry}")
        
        print(f"\n🔍 Starting problem validation research...")
        
        # Run the analysis
        result = await service.validate_problem(
            business_idea,
            problem_statement,
            industry
        )
        
        # Display comprehensive results
        print("\n" + "="*70)
        print("PROBLEM VALIDATION RESULTS")
        print("="*70)
        
        # Core problem validation metrics
        pv = result.get("problem_validation", {})
        print(f"\n📊 PROBLEM VALIDATION SUMMARY:")
        print(f"   Problem Exists: {pv.get('exists', 'Unknown')}")
        print(f"   Severity (1-10): {pv.get('severity', 'N/A')}")
        print(f"   Frequency (1-10): {pv.get('frequency', 'N/A')}")
        print(f"   Willingness to Pay: {pv.get('willingness_to_pay', 'N/A')}")
        print(f"   Market Size Estimate: {pv.get('market_size_estimate', 'N/A')}")
        print(f"   Confidence Level: {pv.get('confidence_level', 'N/A')}/10")
        
        # Evidence analysis
        evidence = result.get("evidence", [])
        print(f"\n🔍 EVIDENCE FOUND ({len(evidence)} sources):")
        if evidence:
            for i, ev in enumerate(evidence, 1):
                print(f"\n   {i}. {ev.get('source', 'Unknown Source')}")
                print(f"      Type: {ev.get('type', 'Unknown')}")
                print(f"      Credibility: {ev.get('credibility', 'Unknown')}")
                if ev.get('date'):
                    print(f"      Date: {ev.get('date')}")
                if ev.get('url') and ev.get('url') != "":
                    print(f"      URL: {ev.get('url')}")
                if ev.get('excerpt'):
                    print(f"      Excerpt: \"{ev.get('excerpt')[:100]}...\"")
                if ev.get('key_insight'):
                    print(f"      Key Insight: {ev.get('key_insight')}")
        else:
            print("   No evidence sources found")
        
        # Alternative solutions
        alternatives = result.get("alternative_solutions", [])
        print(f"\n🛠️  ALTERNATIVE SOLUTIONS ({len(alternatives)} found):")
        if alternatives:
            for i, alt in enumerate(alternatives, 1):
                print(f"\n   {i}. {alt.get('name', 'Unknown Solution')}")
                print(f"      Approach: {alt.get('approach', 'N/A')}")
                if alt.get('limitations'):
                    limitations = alt.get('limitations', [])
                    if isinstance(limitations, list):
                        print(f"      Limitations: {', '.join(limitations)}")
                    else:
                        print(f"      Limitations: {limitations}")
                if alt.get('pricing'):
                    print(f"      Pricing: {alt.get('pricing')}")
        else:
            print("   No alternative solutions identified")
        
        # Problem statement feedback
        feedback = result.get("problem_statement_feedback", "")
        if feedback and feedback != "No feedback provided":
            print(f"\n💬 PROBLEM STATEMENT FEEDBACK:")
            print(f"   {feedback}")
        
        # Quality and research metrics
        print(f"\n📈 RESEARCH QUALITY METRICS:")
        print(f"   Overall Confidence Score: {result.get('confidence_score', 0)}/10")
        print(f"   Research Method: {result.get('research_method', 'Unknown')}")
        
        # Data quality breakdown
        data_quality = result.get("data_quality", {})
        if data_quality:
            print(f"   Evidence Sources: {data_quality.get('total_evidence_sources', 0)}")
            print(f"   High Credibility Sources: {data_quality.get('high_credibility_sources', 0)}")
            print(f"   Alternative Solutions: {data_quality.get('alternative_solutions_found', 0)}")
            print(f"   Analysis Completeness: {data_quality.get('analysis_completeness', 0):.1%}")
            
            evidence_types = data_quality.get('evidence_types', [])
            if evidence_types:
                print(f"   Evidence Types: {', '.join(evidence_types)}")
        
        # Agent execution metrics
        if result.get("agent_steps"):
            print(f"   Agent Steps Executed: {result.get('agent_steps')}")
        
        # Search queries used
        search_queries = result.get("search_queries_used", [])
        if search_queries:
            print(f"\n🔍 SEARCH QUERIES USED ({len(search_queries)}):")
            for i, query in enumerate(search_queries, 1):
                print(f"   {i}. \"{query}\"")
        
        # Research limitations
        limitations = result.get("research_limitations", [])
        if limitations:
            print(f"\n⚠️  RESEARCH LIMITATIONS:")
            for i, limitation in enumerate(limitations, 1):
                print(f"   {i}. {limitation}")
        
        # Status and error handling
        status = result.get("status", "unknown")
        print(f"\n✅ Analysis Status: {status.upper()}")
        
        if result.get("error"):
            print(f"❌ Error: {result.get('error')}")
        
        # Save detailed results
        output_dir = Path("./output")
        output_dir.mkdir(exist_ok=True)
        
        output_file = output_dir / "problem_validation_result.json"
        with open(output_file, "w") as f:
            json.dump(result, f, indent=2)
        
        print(f"\n💾 Full results saved to: {output_file}")
        
        # Performance summary
        print(f"\n🎯 ANALYSIS SUMMARY:")
        confidence = result.get("confidence_score", 0)
        if confidence >= 7:
            print("   ✅ HIGH CONFIDENCE - Strong evidence for problem validation")
        elif confidence >= 4:
            print("   ⚠️  MEDIUM CONFIDENCE - Some evidence found, further research recommended")
        else:
            print("   ❌ LOW CONFIDENCE - Limited evidence, problem may not be significant")
        
        # Actionable insights
        print(f"\n💡 KEY INSIGHTS:")
        if pv.get('exists'):
            print("   • Problem appears to exist in the market")
            if pv.get('severity', 0) >= 7:
                print("   • High severity indicates strong market pain point")
            if pv.get('willingness_to_pay'):
                print(f"   • Market shows willingness to pay: {pv.get('willingness_to_pay')}")
        else:
            print("   • Problem existence unclear or not validated")
            print("   • Consider refining problem statement or target market")
        
        if len(alternatives) >= 2:
            print(f"   • {len(alternatives)} alternative solutions exist - competitive market")
        elif len(alternatives) == 1:
            print("   • Limited competition - potential market gap")
        else:
            print("   • No clear alternatives found - potential blue ocean opportunity")
        
        return result
        
    except Exception as e:
        print(f"\n❌ ERROR during problem validation test:")
        print(f"   {str(e)}")
        import traceback
        traceback.print_exc()
        return None

async def test_search_query_generation():
    """Test the search query generation to validate it works correctly"""
    print("\n" + "="*70)
    print("TESTING SEARCH QUERY GENERATION")
    print("="*70)
    
    service = ProblemValidationService()
    business_idea = "AI-powered tool that validates business ideas"
    problem_statement = "Entrepreneurs waste months building products without validating market demand"
    industry = "Business Services"
    
    print(f"\nTesting search query generation for:")
    print(f"Business Idea: {business_idea}")
    print(f"Problem Statement: {problem_statement}")
    print(f"Industry: {industry}")
    
    try:
        queries = await service._generate_search_queries(business_idea, problem_statement, industry)
        print(f"\n🎯 GENERATED SEARCH QUERIES ({len(queries)}):")
        for i, q in enumerate(queries, 1):
            print(f"   {i}. \"{q}\"")
        
        print(f"\n✅ Query generation test successful!")
        return queries
        
    except Exception as e:
        print(f"❌ Query generation test failed: {str(e)}")
        import traceback
        traceback.print_exc()
        return None

if __name__ == "__main__":
    print("🚀 Starting Problem Validation Service Tests...")
    
    # First test query generation
    asyncio.run(test_search_query_generation())
    
    # Then run the main test
    asyncio.run(test_problem_validation())
    
    print(f"\n🎉 All tests completed!")
    print("Check the ./output/ directory for detailed JSON results.") 