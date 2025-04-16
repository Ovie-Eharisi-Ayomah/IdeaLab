# market_sizing.py
import asyncio
import json
import os
import re
import time
from pathlib import Path
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from browser_use import Agent, Browser, BrowserConfig

# Load environment variables
load_dotenv()

class MarketSizingService:
    def __init__(self, openai_api_key=None, anthropic_api_key=None):
        self.openai_api_key = openai_api_key or os.getenv("OPENAI_API_KEY")
        
        # Initialize LLM
        self.llm = ChatOpenAI(
            model="gpt-4o",
            temperature=0.2,  # Lower temperature for more precise research
            api_key=self.openai_api_key
        )
    
    async def research_market_size(self, business_idea, industry, product_type):
        """Research market size using browser-use with caching"""
        try:
            # Check cache first
            cache_key = f"{industry}_{product_type}".lower().replace(' ', '_')
            cached_result = self._check_cache(cache_key)
            if cached_result:
                print(f"Using cached market data for {industry}")
                cached_result["research_method"] = "cached"
                return cached_result
            
            print(f"Starting market research for {industry}...")
            
            # Create task prompt - more detailed and structured
            search_task = f"""Research the market size and growth rate for {industry}, focusing on {product_type} like '{business_idea}'.

RESEARCH OBJECTIVES:
1. Find AT LEAST 3 reputable sources (up to 10 if available) for market size and growth information
2. For EACH source, identify the current market size, growth rate (CAGR), and projection timeline
3. Focus on global market data first, then regional breakdowns if available
4. Prioritize recent reports (last 2 years) from market research firms

FOR EACH SOURCE:
- Identify the publisher name and publication date
- Record the EXACT market size value with its unit (e.g., $5.2 billion, $720 million)
- Note the current year of the market size data 
- Find the compound annual growth rate (CAGR) as a percentage
- Note any projected future market size and the target year

FORMAT YOUR RESPONSE EXACTLY LIKE THIS:
"I've researched the market size and growth rate for {industry}, focusing on {product_type}.

SOURCE 1: [Publisher Name]
Current Market Size: $X billion/million (Year: 20XX)
Growth Rate: X.X% CAGR 
Projected Size: $X billion/million by 20XX
Key Information: [Brief summary of any additional insights]

SOURCE 2: [Publisher Name]
Current Market Size: $X billion/million (Year: 20XX)
Growth Rate: X.X% CAGR
Projected Size: $X billion/million by 20XX
Key Information: [Brief summary of any additional insights]

[Repeat for each source]

MARKET BREAKDOWN:
Geographic Regions: [List top regions with percentages if available]
Key Growth Drivers: [List main factors driving market growth]
Key Challenges: [List main factors that could limit growth]

RESEARCH SUMMARY:
Range of Current Market Sizes: $X-Y billion/million
Range of Growth Rates: X-Y% CAGR
Highest Quality Source: [Most reputable source found]"
"""
            
            # Create agent
            agent = Agent(
                task=search_task,
                llm=self.llm,
                save_conversation_path="logs/market_research"
            )
            
            # Run agent
            history = await agent.run()
            
            # Get final result from history
            final_result = history.final_result()
            print("Agent completed research task")
            
            # Extract structured data
            result = self._process_result(final_result, industry)
            
            # Cache the result for future use
            self._save_to_cache(cache_key, result)
            
            # Add research method
            result["research_method"] = "web_research"
            return result
            
        except Exception as e:
            print(f"Browser-use market research failed: {str(e)}")
            return {
                "status": "error",
                "error": f"Market research failed: {str(e)}",
                "market_data": {
                    "sources": [],
                    "confidence_score": 0
                }
            }
    
    def _check_cache(self, key):
        """Check if data exists in cache"""
        cache_dir = os.path.join(os.path.dirname(__file__), "cache")
        os.makedirs(cache_dir, exist_ok=True)
        
        cache_file = os.path.join(cache_dir, f"{key}.json")
        if os.path.exists(cache_file):
            # Check if cache is less than 7 days old
            if time.time() - os.path.getmtime(cache_file) < 604800:  # 7 days in seconds
                with open(cache_file, "r") as f:
                    return json.load(f)
        return None

    def _save_to_cache(self, key, data):
        """Save data to cache"""
        cache_dir = os.path.join(os.path.dirname(__file__), "cache")
        os.makedirs(cache_dir, exist_ok=True)
        
        cache_file = os.path.join(cache_dir, f"{key}.json")
        with open(cache_file, "w") as f:
            json.dump(data, f)
    
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
    
    def _process_result(self, text, industry):
        """Process raw text into structured format with multiple sources"""
        # Try to extract JSON first
        json_data = self._extract_json(text)
        
        # If we got parseable JSON with expected structure, return it
        if isinstance(json_data, dict) and "market_data" in json_data:
            return json_data
        
        # Extract sources using the structured format we requested
        sources_data = []
        
        # Extract source blocks
        source_pattern = r'SOURCE\s+\d+:\s+(.*?)(?=SOURCE\s+\d+:|MARKET BREAKDOWN:|RESEARCH SUMMARY:|$)'
        source_blocks = re.findall(source_pattern, text, re.DOTALL | re.IGNORECASE)
        
        for source_block in source_blocks:
            # Extract publisher
            publisher_match = re.match(r'([^\n]+)', source_block.strip())
            publisher = publisher_match.group(1).strip() if publisher_match else "Unknown Publisher"
            
            # Extract market size
            market_size_match = re.search(r'Current Market Size:\s*\$?\s*(\d+(?:[\.,]\d+)?)\s*(billion|million|trillion)(?:\s*\(Year:\s*(20\d\d)\))?', source_block, re.IGNORECASE)
            
            # Extract growth rate
            growth_rate_match = re.search(r'Growth Rate:\s*(\d+(?:\.\d+)?)\s*%', source_block, re.IGNORECASE)
            
            # Extract projected size with improved pattern
            projected_size_match = re.search(r'Projected (?:Size|Market|Value):\s*\$?\s*(\d+(?:[\.,]\d+)?)\s*(billion|million|trillion)(?:.*?(?:by|in|year)?\s*(20\d\d))?', source_block, re.IGNORECASE)
            
            # If primary pattern doesn't match, try fallback pattern for projected size
            if not projected_size_match:
                projected_size_match = re.search(r'(?:projected|forecast|reach|grow to|expected to be)\s+\$?\s*(\d+(?:[\.,]\d+)?)\s*(billion|million|trillion)(?:.*?(?:by|in|year)?\s*(20\d\d))?', source_block, re.IGNORECASE)
            
            # Extract key information
            key_info_match = re.search(r'Key Information:\s*(.*?)(?=\n\n|$)', source_block, re.DOTALL | re.IGNORECASE)
            
            # Build source data
            if market_size_match:
                source_data = {
                    "publisher": publisher,
                    "market_size": float(market_size_match.group(1).replace(',', '')),
                    "market_size_unit": market_size_match.group(2).lower(),
                    "currency": "USD",
                    "year": int(market_size_match.group(3)) if market_size_match.group(3) else 2024,
                    "source_quality": 7  # Default to moderate quality
                }
                
                # Add growth rate if available
                if growth_rate_match:
                    source_data["growth_rate"] = float(growth_rate_match.group(1))
                    source_data["growth_rate_period"] = "annual"
                
                # Add projected size if available
                if projected_size_match:
                    source_data["projected_size"] = float(projected_size_match.group(1).replace(',', ''))
                    source_data["projected_size_unit"] = projected_size_match.group(2).lower()
                    source_data["projection_year"] = int(projected_size_match.group(3)) if projected_size_match.group(3) else None
                
                # Add key information if available
                if key_info_match:
                    source_data["key_information"] = key_info_match.group(1).strip()
                
                sources_data.append(source_data)
        
        # Extract market breakdown sections
        market_breakdown = {}
        
        # Geographic regions with better array handling
        geo_match = re.search(r'Geographic Regions:\s*(.*?)(?=Key Growth Drivers:|Key Challenges:|$)', text, re.DOTALL | re.IGNORECASE)
        if geo_match:
            raw_text = geo_match.group(1).strip()
            # First try to split by newlines if they exist
            if '\n' in raw_text:
                regions = [region.strip() for region in raw_text.split('\n') if region.strip()]
            else:
                # Try to split by commas with careful handling
                regions = []
                for item in raw_text.split(','):
                    item = item.strip()
                    if item:
                        regions.append(item)
            
            market_breakdown["geographic_regions"] = regions
        
        # Growth drivers with improved array handling
        drivers_match = re.search(r'Key Growth Drivers:\s*(.*?)(?=Key Challenges:|$)', text, re.DOTALL | re.IGNORECASE)
        if drivers_match:
            raw_text = drivers_match.group(1).strip()
            # First try to split by newlines if they exist
            if '\n' in raw_text:
                drivers = [driver.strip() for driver in raw_text.split('\n') if driver.strip()]
            else:
                # Try to split by commas with careful handling
                drivers = []
                for item in raw_text.split(','):
                    item = item.strip()
                    if item:
                        drivers.append(item)
            
            market_breakdown["growth_drivers"] = drivers
        
        # Challenges with improved array handling
        challenges_match = re.search(r'Key Challenges:\s*(.*?)(?=RESEARCH SUMMARY:|$)', text, re.DOTALL | re.IGNORECASE)
        if challenges_match:
            raw_text = challenges_match.group(1).strip()
            # First try to split by newlines if they exist
            if '\n' in raw_text:
                challenges = [challenge.strip() for challenge in raw_text.split('\n') if challenge.strip()]
            else:
                # Try to split by commas with careful handling
                challenges = []
                for item in raw_text.split(','):
                    item = item.strip()
                    if item:
                        challenges.append(item)
            
            market_breakdown["challenges"] = challenges
        
        # Calculate confidence score based on number of sources
        confidence_score = min(10, len(sources_data) * 2)  # 2 points per source, max 10
        
        # Return the structured data
        return {
            "status": "success",
            "market_data": {
                "sources": sources_data,
                "market_breakdown": market_breakdown,
                "confidence_score": confidence_score
            },
            "raw_text": text[:1000] + ("..." if len(text) > 1000 else "")
        }