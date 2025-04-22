# competitive_analysis.py - Upgraded with better prompts, caching and parsing
import json
import os
import time
import re
from pathlib import Path
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from browser_use import Agent, Browser, BrowserConfig

# Load environment variables
load_dotenv()

class CompetitiveAnalysisService:
    def __init__(self, openai_api_key=None, anthropic_api_key=None):
        self.openai_api_key = openai_api_key or os.getenv("OPENAI_API_KEY")
        
        # Initialize LLM
        self.llm = ChatOpenAI(
            model="gpt-4o",
            temperature=0.2,  # Lower temperature for more precise research
            api_key=self.openai_api_key
        )
    
    async def analyze_competition(self, business_idea, industry, product_type):
        """Analyze competition using browser-use with caching"""
        try:
            # Check cache first
            cache_key = f"{industry}_{product_type}_competition".lower().replace(' ', '_')
            cached_result = self._check_cache(cache_key)
            if cached_result:
                print(f"Using cached competition data for {industry}")
                cached_result["research_method"] = "cached"
                return cached_result
            
            print(f"Starting competition analysis for {industry}...")
            
            # Create task prompt - more detailed and structured
            search_task = self._create_search_task(business_idea, industry, product_type)
            
            # Create agent
            agent = Agent(
                task=search_task,
                llm=self.llm,
                save_conversation_path="logs/competition_research"
            )
            
            # Run agent
            history = await agent.run()
            
            # Get final result from history
            final_result = history.final_result()
            print("Agent completed competition research task")
            
            # Extract structured data
            result = self._process_result(final_result, industry)
            
            # Cache the result for future use
            self._save_to_cache(cache_key, result)
            
            # Add research method
            result["research_method"] = "web_research"
            return result
            
        except Exception as e:
            print(f"Browser-use competition analysis failed: {str(e)}")
            return {
                "status": "error",
                "error": f"Competition analysis failed: {str(e)}",
                "competitors": [],
                "market_gaps": [],
                "barriers_to_entry": [],
                "market_concentration": "unknown",
                "confidence_score": 0
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
    
    def _create_search_task(self, business_idea, industry, product_type):
        """Create the search task prompt with specific queries and format"""
        return f"""
        Research the competitive landscape for: {business_idea} (Industry: {industry}, Product Type: {product_type})
        
        SEARCH STRATEGY:
        1. Search for THESE EXACT queries (run at least 3 of these):
           - "top {industry} {product_type} companies"
           - "{industry} {product_type} market leaders"
           - "{industry} startups {product_type}"
           - "{product_type} {industry} market share analysis"
           - "{industry} {product_type} pricing comparison"
           
        2. For EACH competitor found, collect:
           - Company name and website URL
           - Key products/features (be specific about what they offer)
           - Target audience (be specific about demographics/segments)
           - Pricing model (exact prices if available: freemium, subscription, one-time, etc.)
           - Unique selling points (what makes them different)
           - Market share or size (specific percentage or revenue if available)
           - Founded year and funding (specific amounts if available)
        
        3. Identify:
           - Specific market gaps or unmet customer needs (at least 3)
           - Barriers to entry in this market (at least 3)
           - Market concentration (is it dominated by a few players or fragmented?)
           - Emerging trends in this market
        
        4. For EACH source you find:
           - Record the URL
           - Note the publication/website name
           - Publication date if available
        
        FORMAT YOUR RESPONSE EXACTLY LIKE THIS:
        
        COMPETITORS:
        
        [Company 1 Name] (Website: domain.com)
        - Products: [Specific list of products/features]
        - Target Audience: [Specific demographic/user segment]
        - Pricing: [Exact pricing model with numbers if available]
        - USPs: [Specific unique selling points]
        - Market Position: [Market share percentage or description]
        - Founded: [Year] | Funding: [Amount and round if available]
        
        [Company 2 Name] (Website: domain.com)
        ... (repeat format for each competitor)
        
        MARKET GAPS:
        1. [Specific unmet need with evidence]
        2. [Specific unmet need with evidence]
        3. [Specific unmet need with evidence]
        
        BARRIERS TO ENTRY:
        1. [Specific barrier with explanation]
        2. [Specific barrier with explanation]
        3. [Specific barrier with explanation]
        
        MARKET CONCENTRATION:
        [Assessment of whether the market is highly concentrated, moderately concentrated, or fragmented, with evidence]
        
        EMERGING TRENDS:
        1. [Specific trend with evidence]
        2. [Specific trend with evidence]
        3. [Specific trend with evidence]
        
        SOURCES:
        1. [Source URL] - [Publication Name] ([Date if available])
        2. [Source URL] - [Publication Name] ([Date if available])
        ... (list all sources)
        
        YOU CAN ALSO RETURN JSON IF YOU PREFER, WITH THIS EXACT STRUCTURE:
        {{
          "competitors": [
            {{
              "name": "Company Name",
              "website": "domain.com",
              "products": ["Product A", "Product B"],
              "target_audience": "Specific market segment",
              "pricing_model": "Details with actual prices",
              "unique_selling_points": ["USP 1", "USP 2"],
              "market_position": "Market leader with X% share",
              "founded": 2015,
              "funding": "$X million Series B"
            }}
          ],
          "market_gaps": [
            "Gap 1: Detailed description",
            "Gap 2: Detailed description"
          ],
          "barriers_to_entry": [
            "Barrier 1: Detailed description",
            "Barrier 2: Detailed description"
          ],
          "market_concentration": "Highly concentrated/Fragmented with details",
          "emerging_trends": [
            "Trend 1: Detailed description",
            "Trend 2: Detailed description"
          ],
          "sources": [
            {{
              "url": "source1.com",
              "name": "Publication Name",
              "date": "2023-05-12"
            }}
          ],
          "confidence_score": 8
        }}
        """
    
    def _process_result(self, text, industry):
        """Process raw text into structured format with comprehensive competitor data"""
        # Try to extract JSON first
        json_data = self._extract_json(text)
        
        # If we got parseable JSON with expected structure, return it
        if isinstance(json_data, dict) and "competitors" in json_data:
            # Ensure confidence score exists
            if "confidence_score" not in json_data:
                json_data["confidence_score"] = min(len(json_data.get("competitors", [])) * 2, 10)
            
            # Add status field
            json_data["status"] = "success"
            return json_data
        
        # If JSON extraction failed, parse text format
        result = {
            "status": "success",
            "competitors": [],
            "market_gaps": [],
            "barriers_to_entry": [],
            "market_concentration": "unknown",
            "emerging_trends": [],
            "sources": [],
            "confidence_score": 0
        }
        
        # Extract competitors
        competitor_pattern = r'([^\n]+)\s*\(Website:\s*([^\)]+)\)\s*\n((?:- [^\n]+\n?)+)'
        competitor_blocks = re.findall(competitor_pattern, text, re.DOTALL)
        
        for name, website, details_block in competitor_blocks:
            competitor = {
                "name": name.strip(),
                "website": website.strip(),
                "products": [],
                "target_audience": "",
                "pricing_model": "",
                "unique_selling_points": [],
                "market_position": "",
                "founded": None,
                "funding": ""
            }
            
            # Extract details
            products_match = re.search(r'- Products:\s*([^\n]+)', details_block)
            audience_match = re.search(r'- Target Audience:\s*([^\n]+)', details_block)
            pricing_match = re.search(r'- Pricing:\s*([^\n]+)', details_block)
            usps_match = re.search(r'- USPs?:\s*([^\n]+)', details_block)
            position_match = re.search(r'- Market Position:\s*([^\n]+)', details_block)
            founded_match = re.search(r'- Founded:\s*(\d{4})', details_block)
            funding_match = re.search(r'- Funding:\s*([^\n]+)', details_block)
            
            if products_match:
                products_text = products_match.group(1).strip()
                if "," in products_text:
                    competitor["products"] = [p.strip() for p in products_text.split(",")]
                else:
                    competitor["products"] = [products_text]
            
            if audience_match:
                competitor["target_audience"] = audience_match.group(1).strip()
            
            if pricing_match:
                competitor["pricing_model"] = pricing_match.group(1).strip()
            
            if usps_match:
                usps_text = usps_match.group(1).strip()
                if "," in usps_text:
                    competitor["unique_selling_points"] = [usp.strip() for usp in usps_text.split(",")]
                else:
                    competitor["unique_selling_points"] = [usps_text]
            
            if position_match:
                competitor["market_position"] = position_match.group(1).strip()
            
            if founded_match:
                competitor["founded"] = int(founded_match.group(1).strip())
            
            if funding_match:
                competitor["funding"] = funding_match.group(1).strip()
            
            result["competitors"].append(competitor)
        
        # Extract market gaps
        gaps_section = re.search(r'MARKET GAPS:(.*?)(?:BARRIERS TO ENTRY:|$)', text, re.DOTALL)
        if gaps_section:
            gaps_text = gaps_section.group(1).strip()
            # Try numbered list pattern
            gaps = re.findall(r'\d+\.\s*([^\n]+)', gaps_text)
            # If no numbered items found, try bullet points
            if not gaps:
                gaps = re.findall(r'- ([^\n]+)', gaps_text)
            result["market_gaps"] = gaps
        
        # Extract barriers to entry
        barriers_section = re.search(r'BARRIERS TO ENTRY:(.*?)(?:MARKET CONCENTRATION:|$)', text, re.DOTALL)
        if barriers_section:
            barriers_text = barriers_section.group(1).strip()
            # Try numbered list pattern
            barriers = re.findall(r'\d+\.\s*([^\n]+)', barriers_text)
            # If no numbered items found, try bullet points
            if not barriers:
                barriers = re.findall(r'- ([^\n]+)', barriers_text)
            result["barriers_to_entry"] = barriers
        
        # Extract market concentration
        concentration_section = re.search(r'MARKET CONCENTRATION:(.*?)(?:EMERGING TRENDS:|SOURCES:|$)', text, re.DOTALL)
        if concentration_section:
            result["market_concentration"] = concentration_section.group(1).strip()
        
        # Extract emerging trends
        trends_section = re.search(r'EMERGING TRENDS:(.*?)(?:SOURCES:|$)', text, re.DOTALL)
        if trends_section:
            trends_text = trends_section.group(1).strip()
            # Try numbered list pattern
            trends = re.findall(r'\d+\.\s*([^\n]+)', trends_text)
            # If no numbered items found, try bullet points
            if not trends:
                trends = re.findall(r'- ([^\n]+)', trends_text)
            result["emerging_trends"] = trends
        
        # Extract sources
        sources_section = re.search(r'SOURCES:(.*?)$', text, re.DOTALL)
        if sources_section:
            sources_text = sources_section.group(1).strip()
            # Try numbered list pattern
            source_matches = re.findall(r'\d+\.\s*([^\s]+)\s*-\s*([^\(]+)(?:\(([^\)]+)\))?', sources_text)
            
            for url, name, date in source_matches:
                source = {
                    "url": url.strip(),
                    "name": name.strip(),
                    "date": date.strip() if date else None
                }
                result["sources"].append(source)
        
        # Calculate confidence score based on number of competitors and sources
        competitor_score = min(5, len(result["competitors"]))
        source_score = min(5, len(result["sources"]))
        result["confidence_score"] = competitor_score + source_score
        
        return result
    
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
        
        # Try with more flexible JSON finding
        json_search = re.search(r'{[\s\S]*?"competitors"[\s\S]*?}', text)
        if json_search:
            # Extract just the JSON portion
            potential_json = json_search.group(0)
            
            # Attempt to balance braces to find complete JSON
            brace_count = 0
            end_pos = 0
            
            for i, char in enumerate(potential_json):
                if char == '{':
                    brace_count += 1
                elif char == '}':
                    brace_count -= 1
                    if brace_count == 0:
                        end_pos = i + 1
                        break
            
            if end_pos > 0:
                cleaned_json = potential_json[:end_pos].strip()
                try:
                    return json.loads(cleaned_json)
                except json.JSONDecodeError:
                    pass
        
        # If all else fails, return an empty dict
        return {}