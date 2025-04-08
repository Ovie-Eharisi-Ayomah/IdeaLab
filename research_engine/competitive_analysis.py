# competitive_analysis.py
import json
from browser_use import Agent
from llm_provider import ResilientLLM

class CompetitiveAnalysisService:
    def __init__(self, openai_api_key=None, anthropic_api_key=None):
        self.llm_provider = ResilientLLM(
            openai_api_key=openai_api_key,
            anthropic_api_key=anthropic_api_key
        )
    
    async def analyze_competition(self, business_idea, industry, product_type):
        """Analyze competition with resilient LLM provider"""
        
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
                "error": "Competition analysis failed after multiple attempts",
                "competitors": [],
                "market_gaps": [],
                "confidence_score": 0
            }
    
    async def _run_browser_agent(self, llm, search_task):
        """Run browser agent with given LLM"""
        agent = Agent(
            task=search_task, 
            llm=llm,
            headless=True,
            enable_screenshot=True
        )
        return await agent.run()
    
    def _create_search_task(self, business_idea, industry, product_type):
        """Create the search task prompt"""
        return f"""
        Research the competitive landscape for: {business_idea} (Industry: {industry}, Product Type: {product_type})
        
        SEARCH STRATEGY:
        1. Search for "top {industry} {product_type} companies" and "{industry} competitors"
        2. Identify 5-8 key players in this market
        3. For EACH competitor find:
           - Company name and website
           - Key products/features
           - Target audience
           - Pricing model (freemium, subscription, one-time, etc.)
           - Unique selling points
           - Market share or size (if available)
           - Founded year and funding (if available)
        4. Identify potential market gaps or unmet customer needs
        
        FORMAT ALL RESULTS IN THIS EXACT JSON STRUCTURE:
        {{
          "competitors": [
            {{
              "name": "CompanyX",
              "website": "companyx.com",
              "products": ["Product A", "Product B"],
              "target_audience": "Enterprise businesses",
              "pricing_model": "Subscription, $X/month",
              "unique_selling_points": ["Feature 1", "Feature 2"],
              "market_position": "Market leader with X% share",
              "founded": 2015,
              "funding": "$X million Series B"
            }}
          ],
          "market_gaps": [
            "Gap 1: Underserved audience segment",
            "Gap 2: Missing feature set"
          ],
          "market_concentration": "Highly concentrated/Fragmented",
          "barriers_to_entry": ["Barrier 1", "Barrier 2"],
          "confidence_score": 8,
          "sources": [
            {{
              "url": "source1.com",
              "title": "Source name"
            }}
          ]
        }}
        """
    
    # Same JSON extraction logic as before
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