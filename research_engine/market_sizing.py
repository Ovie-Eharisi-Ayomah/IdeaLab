# market_sizing.py - Following docs accurately
import asyncio
import json
import os
import re
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from browser_use import Agent, Browser, BrowserConfig

# Load environment variables
load_dotenv()

class MarketSizingService:
    def __init__(self, openai_api_key=None):
        self.openai_api_key = openai_api_key or os.getenv("OPENAI_API_KEY")
        
        # Initialize LLM following docs
        self.llm = ChatOpenAI(
            model="gpt-4o",
            temperature=0.2,  # Lower temperature for more precise research
            api_key=self.openai_api_key
        )
    
    async def research_market_size(self, business_idea, industry, product_type):
        """Research market size using browser-use"""
        
        # Create browser config following docs
        browser_config = BrowserConfig(
            headless=False,  # Set to False for debugging
            disable_security=True,  # Help with potential CORS issues
        )
        
        # Create task prompt - simpler following docs example style
        search_task = f"Research the market size and growth rate for {industry}, focusing on {product_type} like '{business_idea}'. Find at least 2 reputable sources with market size in dollars and growth percentage."
        
        try:
            print(f"Starting market research for {industry}...")
            
            # Create agent according to docs
            agent = Agent(
                task=search_task,
                llm=self.llm,
                save_conversation_path="logs/market_research"
            )
            
            # Run agent according to docs
            history = await agent.run()
            
            # Get final result from history
            final_result = history.final_result()
            print("Agent completed research task")
            
            # Extract structured data
            return self._process_result(final_result, industry)
            
        except Exception as e:
            print(f"Browser-use market research failed: {str(e)}")
            return {
                "error": f"Market research failed: {str(e)}",
                "market_size": {
                    "value": None,
                    "unit": None,
                    "sources": []
                },
                "growth_rate": {
                    "value": None,
                    "period": None
                },
                "confidence_score": 0
            }
    
    def _process_result(self, text, industry):
        """Process raw text into structured format"""
        # Try to extract JSON
        json_data = self._extract_json(text)
        
        # If we got parseable JSON, return it
        if isinstance(json_data, dict) and "market_size" in json_data:
            return json_data
        
        # Otherwise try to extract market data from text
        market_size_pattern = r'(\$?\d+(?:\.\d+)?)\s*(billion|million|trillion)'
        growth_pattern = r'(\d+(?:\.\d+)?)\s*(?:%|percent)'
        
        # Basic extraction
        market_match = re.search(market_size_pattern, text, re.IGNORECASE)
        growth_match = re.search(growth_pattern, text, re.IGNORECASE)
        
        # Build structured result
        result = {
            "market_size": {
                "value": float(market_match.group(1)) if market_match else None,
                "unit": market_match.group(2).lower() if market_match else None,
                "year": 2024,  # Default to current year
                "sources": [{
                    "url": "N/A",
                    "publisher": "Extracted from research",
                    "excerpt": text[:200] + "...",
                    "credibility": 5  # Medium credibility
                }]
            },
            "growth_rate": {
                "value": float(growth_match.group(1)) if growth_match else None,
                "period": "Annual",  # Default
                "sources": []
            },
            "confidence_score": 4,  # Lower confidence since we're extracting
            "raw_text": text[:1000] + ("..." if len(text) > 1000 else "")
        }
        
        return result