# test_market_sizing.py - Following docs approach
import asyncio
import sys
import os
import json
# Add the parent directory to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from market_sizing import MarketSizingService

async def test_market_sizing():
    # Initialize the service
    service = MarketSizingService()
    
    print("\n=== TESTING MARKET RESEARCH WITH BROWSER-USE ===\n")
    print("A browser window will open. Please don't interfere with it.")
    
    try:
        # Test with a simple business idea
        result = await service.research_market_size(
            "An app that helps people find dog walkers",
            "Pet Services",
            "Mobile Application"
        )
        
        # Print the result
        print("\n=== MARKET SIZING RESULTS ===\n")
        print(json.dumps(result, indent=2))
        
    except Exception as e:
        print(f"\nERROR: {str(e)}")

if __name__ == "__main__":
    asyncio.run(test_market_sizing())