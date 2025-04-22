# test_competitive_analysis.py
import asyncio
import sys
import os
import json
from pathlib import Path

# Add the parent directory to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from competitive_analysis import CompetitiveAnalysisService

async def test_competitive_analysis():
    # Initialize the service
    service = CompetitiveAnalysisService()
    
    print("\n=== TESTING COMPETITIVE ANALYSIS WITH BROWSER-USE ===\n")
    print("A browser window will open. Don't mess with it - let the AI do its thing.")
    print("This will take 30-60 seconds, maybe more. Go grab a coffee.")
    
    try:
        # Test with a simple business idea
        # Feel free to change this to whatever you're actually building
        business_idea = "A mobile app that helps people find and book fitness classes nearby"
        industry = "Fitness"
        product_type = "Mobile Application"
        
        print(f"\nAnalyzing competition for: {business_idea}")
        print(f"Industry: {industry}")
        print(f"Product Type: {product_type}")
        
        # Run the analysis
        result = await service.analyze_competition(
            business_idea,
            industry,
            product_type
        )
        
        # Print the result
        print("\n=== COMPETITIVE ANALYSIS RESULTS ===\n")
        
        # Print competitors nicely formatted
        print(f"Found {len(result['competitors'])} competitors:")
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
        
        # Print confidence score
        print(f"\nConfidence Score: {result['confidence_score']}/10")
        
        # Print sources
        print("\nSources:")
        for i, source in enumerate(result['sources'], 1):
            date_str = f" ({source['date']})" if source.get('date') else ""
            print(f"{i}. {source['name']}{date_str}: {source['url']}")
        
        # Save full JSON to a file for inspection
        output_dir = Path("./output")
        output_dir.mkdir(exist_ok=True)
        
        output_file = output_dir / "competitive_analysis_result.json"
        with open(output_file, "w") as f:
            json.dump(result, f, indent=2)
        
        print(f"\nFull results saved to {output_file}")
        
    except Exception as e:
        print(f"\nERROR: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_competitive_analysis())