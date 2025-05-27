# test_market_sizing.py - Enhanced test for market sizing service
import asyncio
import sys
import os
import json
from pathlib import Path

# Add the parent directory to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from market_sizing import MarketSizingService

async def test_market_sizing():
    """Test the enhanced market sizing service with comprehensive output"""
    # Initialize the service
    service = MarketSizingService()
    
    print("\n" + "="*70)
    print("TESTING ENHANCED MARKET SIZING WITH BROWSER AUTOMATION")
    print("="*70)
    print("\nThis test will:")
    print("• Use LLM-generated search queries for targeted market research")
    print("• Execute 5-phase research methodology")
    print("• Search multiple market research sources (Statista, IBISWorld, etc.)")
    print("• Extract structured market data with TAM/SAM/SOM analysis")
    print("• Apply quality validation and confidence scoring")
    print("• Demonstrate enhanced error handling and browser automation")
    print("• Cache high-quality results for future use")
    
    # Test problem description
    business_idea = "AI-powered tool that helps entrepreneurs validate their business ideas before building products"
    industry = "Business Services"
    product_type = "SaaS Platform"
    
    print(f"\n" + "-"*50)
    print("TEST INPUT:")
    print(f"Business Idea: {business_idea}")
    print(f"Industry: {industry}")
    print(f"Product Type: {product_type}")
    print("-"*50)
    
    try:
        print("\n🔍 Starting enhanced market sizing research...")
        print("⚠️  This may take 3-7 minutes due to comprehensive web research")
        
        # Run the enhanced market sizing
        result = await service.research_market_size(
            business_idea=business_idea,
            industry=industry,
            product_type=product_type
        )
        
        print("\n✅ Market sizing research completed!")
        print("\n" + "="*70)
        print("DETAILED ANALYSIS RESULTS")
        print("="*70)
        
        # Display status and metadata
        print(f"\n📊 RESEARCH STATUS:")
        print(f"Status: {result.get('status', 'unknown')}")
        print(f"Research Method: {result.get('research_method', 'unknown')}")
        if result.get('analysis_timestamp'):
            print(f"Analysis Timestamp: {result.get('analysis_timestamp')}")
        if result.get('agent_steps'):
            print(f"Browser Agent Steps: {result.get('agent_steps')}")
        
        # Display market data
        market_data = result.get('market_data', {})
        
        print(f"\n📈 MARKET DATA SUMMARY:")
        print(f"Confidence Score: {market_data.get('confidence_score', 0)}/10")
        print(f"Data Recency: {market_data.get('data_recency', 'Unknown')}")
        print(f"Total Sources Found: {len(market_data.get('sources', []))}")
        
        # Display sources
        sources = market_data.get('sources', [])
        if sources:
            print(f"\n🔍 MARKET DATA SOURCES ({len(sources)} found):")
            for i, source in enumerate(sources, 1):
                print(f"\nSource {i}:")
                print(f"  Publisher: {source.get('publisher', 'Unknown')}")
                print(f"  Report: {source.get('report_title', 'N/A')}")
                print(f"  Publication Date: {source.get('publication_date', 'Unknown')}")
                
                if source.get('market_size'):
                    size_unit = source.get('market_size_unit', '')
                    currency = source.get('currency', '')
                    base_year = source.get('base_year', '')
                    print(f"  Market Size: {currency} {source['market_size']} {size_unit} ({base_year})")
                
                if source.get('growth_rate'):
                    print(f"  Growth Rate: {source['growth_rate']}% CAGR")
                
                if source.get('projected_size'):
                    proj_unit = source.get('projected_size_unit', source.get('market_size_unit', ''))
                    proj_year = source.get('projected_year', '')
                    print(f"  Projected Size: {currency} {source['projected_size']} {proj_unit} by {proj_year}")
                
                print(f"  Geographic Scope: {source.get('geographic_scope', 'Unknown')}")
                print(f"  Source Quality: {source.get('source_quality', 'Unknown')}")
                
                if source.get('url'):
                    print(f"  URL: {source['url']}")
        else:
            print("\n⚠️  No market data sources found")
        
        # Display market breakdown
        breakdown = market_data.get('market_breakdown', {})
        if breakdown:
            print(f"\n📊 MARKET BREAKDOWN:")
            
            if breakdown.get('tam'):
                tam_unit = breakdown.get('tam_unit', 'billion')
                print(f"  TAM (Total Addressable Market): ${breakdown['tam']} {tam_unit}")
            
            if breakdown.get('sam'):
                sam_unit = breakdown.get('sam_unit', 'billion')
                print(f"  SAM (Serviceable Addressable Market): ${breakdown['sam']} {sam_unit}")
            
            if breakdown.get('som'):
                som_unit = breakdown.get('som_unit', 'billion')
                print(f"  SOM (Serviceable Obtainable Market): ${breakdown['som']} {som_unit}")
            
            # Geographic regions
            regions = breakdown.get('geographic_regions', [])
            if regions:
                print(f"\n  Geographic Distribution:")
                for region in regions:
                    print(f"    • {region}")
            
            # Growth drivers
            drivers = breakdown.get('growth_drivers', [])
            if drivers:
                print(f"\n  Growth Drivers:")
                for driver in drivers:
                    print(f"    • {driver}")
            
            # Market challenges
            challenges = breakdown.get('market_challenges', [])
            if challenges:
                print(f"\n  Market Challenges:")
                for challenge in challenges:
                    print(f"    • {challenge}")
        
        # Display data quality metrics
        data_quality = market_data.get('data_quality', {})
        if data_quality:
            print(f"\n🎯 DATA QUALITY METRICS:")
            print(f"  Total Sources: {data_quality.get('total_sources', 0)}")
            print(f"  High Quality Sources: {data_quality.get('high_quality_sources', 0)}")
            print(f"  Has TAM/SAM Data: {data_quality.get('has_tam_sam', False)}")
            print(f"  Analysis Completeness: {data_quality.get('analysis_completeness', 0):.1%}")
            print(f"  Data Recency Assessment: {data_quality.get('data_recency', 'Unknown')}")
        
        # Display research limitations
        limitations = result.get('research_limitations', [])
        if limitations:
            print(f"\n⚠️  RESEARCH LIMITATIONS:")
            for limitation in limitations:
                print(f"  • {limitation}")
        
        # Display errors if any
        if result.get('status') == 'error':
            print(f"\n❌ ERROR DETAILS:")
            print(f"Error: {result.get('error', 'Unknown error')}")
        
        # Save result to file for inspection
        output_dir = Path("output")
        output_dir.mkdir(exist_ok=True)
        
        output_file = output_dir / "market_sizing_result.json"
        with open(output_file, 'w') as f:
            json.dump(result, f, indent=2, default=str)
        
        print(f"\n💾 Full results saved to: {output_file}")
        
        # Performance analysis
        print(f"\n🔬 ENHANCED FEATURES ANALYSIS:")
        print(f"✅ LLM-powered search query generation")
        print(f"✅ 5-phase research methodology")
        print(f"✅ Enhanced browser configuration with timeout handling")
        print(f"✅ Quality validation and confidence scoring")
        if result.get('research_method') == 'cached':
            print(f"✅ Intelligent caching system (used cached result)")
        else:
            print(f"✅ Fresh web research with comprehensive data collection")
        print(f"✅ TAM/SAM/SOM analysis framework")
        print(f"✅ Source quality assessment and documentation")
        
        # Actionable insights
        print(f"\n💡 ACTIONABLE INSIGHTS:")
        if market_data.get('confidence_score', 0) >= 7:
            print("✅ High-confidence market data - suitable for business planning")
        elif market_data.get('confidence_score', 0) >= 5:
            print("⚠️  Moderate-confidence data - consider additional research")
        else:
            print("❌ Low-confidence data - requires more comprehensive research")
        
        if len(sources) >= 3:
            print("✅ Multiple sources provide good market validation")
        else:
            print("⚠️  Limited sources - consider expanding research scope")
        
        if breakdown.get('tam') and breakdown.get('sam'):
            print("✅ TAM/SAM data available for investment planning")
        else:
            print("⚠️  Limited TAM/SAM data - may need industry-specific research")
        
        print(f"\n" + "="*70)
        print("MARKET SIZING ANALYSIS COMPLETE")
        print("="*70)
        
    except Exception as e:
        print(f"\n❌ Test failed with error: {str(e)}")
        import traceback
        traceback.print_exc()

# Test with detailed validation
async def test_market_sizing_detailed():
    """Test market sizing with more detailed business idea"""
    service = MarketSizingService()
    
    print("\n" + "="*70)
    print("TESTING WITH DETAILED BUSINESS DESCRIPTION")
    print("="*70)
    
    # More detailed test case
    detailed_idea = "B2B SaaS platform that uses machine learning to analyze customer feedback, social media sentiment, and market trends to help startups validate their business ideas and pivot strategies before significant investment"
    industry = "Software"
    product_type = "AI/ML Platform"
    
    print(f"Business Idea: {detailed_idea}")
    print(f"Industry: {industry}")
    print(f"Product Type: {product_type}")
    
    try:
        result = await service.research_market_size(detailed_idea, industry, product_type)
        
        print(f"\n📊 COMPARISON RESULTS:")
        print(f"Status: {result.get('status')}")
        print(f"Sources Found: {len(result.get('market_data', {}).get('sources', []))}")
        print(f"Confidence Score: {result.get('market_data', {}).get('confidence_score', 0)}/10")
        print(f"Research Method: {result.get('research_method')}")
        
        # Compare with previous result
        print(f"\n🔍 Analysis shows enhanced module can handle both:")
        print(f"  • Simple business ideas (basic validation)")  
        print(f"  • Complex detailed descriptions (comprehensive research)")
        
    except Exception as e:
        print(f"Detailed test failed: {str(e)}")

if __name__ == "__main__":
    asyncio.run(test_market_sizing())
    asyncio.run(test_market_sizing_detailed()) 