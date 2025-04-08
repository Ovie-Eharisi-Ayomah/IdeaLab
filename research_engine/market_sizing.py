# market_sizing.py
import asyncio
import json
from browser_use import Agent
from llm_provider import ResilientLLM

class MarketSizingService:
    def __init__(self, openai_api_key=None, anthropic_api_key=None):
        self.llm_provider = ResilientLLM(
            openai_api_key=openai_api_key,
            anthropic_api_key=anthropic_api_key,
            max_retries=2  # Limit retries to keep things moving
        )
    
    async def research_market_size(self, business_idea, industry, product_type):
        """Research market size using browser-use with fallback capabilities"""
        
        # Define the search task
        search_task = self._create_search_task(business_idea, industry, product_type)
        
        # Use our resilient LLM with fallback
        try:
            result = await self.llm_provider.with_fallback(
                self._run_browser_agent,
                search_task=search_task
            )
            return self._extract_json(result)
        except Exception as e:
            # Last resort fallback - return a structured error
            print(f"All LLM attempts failed: {str(e)}")
            return {
                "error": "Market research failed after multiple attempts",
                "market_size": {
                    "value": None,
                    "unit": None,
                    "sources": []
                },
                "growth_rate": {
                    "value": None,
                    "period": None,
                    "sources": []
                },
                "confidence_score": 0
            }
    
    async def _run_browser_agent(self, llm, search_task):
        """Run browser agent with given LLM"""
        agent = Agent(
            task=search_task, 
            llm=llm,
            headless=True,
            enable_screenshot=True,  # For debugging
            timeout=300  # 5 min timeout
        )
        return await agent.run()
    
    def _create_search_task(self, business_idea, industry, product_type):
        """Create the search task prompt"""
        return f"""
        Find reliable market size data for: {business_idea} (Industry: {industry}, Product Type: {product_type})
        
        SEARCH STRATEGY:
        1. Search for "{industry} market size 2024" and "{product_type} market forecast"
        2. Find 3+ credible sources (industry reports, market research firms, business publications)
        3. For EACH source, extract:
           - Total market size in dollars (specify billions/millions)
           - Growth rate (CAGR)
           - Time period of forecast
           - Geographic breakdown if available
        
        FORMAT ALL RESULTS IN THIS EXACT JSON STRUCTURE:
        {{
          "market_size": {{
            "value": 123.4,
            "unit": "billion",
            "year": 2024,
            "sources": [
              {{
                "url": "source1.com",
                "publisher": "Source Name",
                "published_date": "2023-10-15",
                "excerpt": "The exact text where this data was found",
                "credibility": 8
              }}
            ]
          }},
          "growth_rate": {{
            "value": 12.3,
            "period": "2024-2030",
            "sources": [...]
          }},
          "geographic_breakdown": {{
            "North America": 45,
            "Europe": 25,
            "Asia Pacific": 20,
            "Rest of World": 10,
            "sources": [...]
          }},
          "confidence_score": 7
        }}

        THE MOST IMPORTANT PART OF YOUR JOB IS FINDING ACTUAL NUMERICAL DATA WITH SOURCES.
        If you can't find exact data for this specific industry/product, find the closest category and note the limitation.
        """
    
    def _extract_json(self, text):
        """Extract JSON from the response text"""
        import re
        
        # First try JSON code blocks
        json_match = re.search(r'```(?:json)?\s*([\s\S]*?)\s*```', text)
        if json_match:
            try:
                return json.loads(json_match.group(1))
            except json.JSONDecodeError:
                pass
        
        # Next try to find raw JSON objects
        json_match = re.search(r'(\{[\s\S]*\})', text)
        if json_match:
            try:
                return json.loads(json_match.group(1))
            except json.JSONDecodeError:
                pass
        
        # If all else fails, return the raw text
        return {
            "error": "Failed to extract valid JSON",
            "raw_text": text[:1000] + ("..." if len(text) > 1000 else "")
        }