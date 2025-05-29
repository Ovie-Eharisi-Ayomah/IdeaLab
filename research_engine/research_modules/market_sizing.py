# market_sizing.py - Enhanced with better browser configuration, quality validation, and research methodology
import json
import re
import asyncio
import time
import os
import hashlib
from typing import Dict, List, Any, Optional
from browser_use import Agent, Browser, BrowserConfig
from browser_use.browser.context import BrowserContextConfig
from langchain_openai import ChatOpenAI
from pathlib import Path
from dotenv import load_dotenv
from browser_config_fix import get_enhanced_browser_config, get_enhanced_context_config, get_enhanced_agent_config

# Load environment variables
load_dotenv()

class MarketSizingService:
    def __init__(self, openai_api_key=None, anthropic_api_key=None):
        self.openai_api_key = openai_api_key or os.getenv("OPENAI_API_KEY")
        
        # Initialize LLM directly with OpenAI like other enhanced modules
        if not self.openai_api_key:
            raise ValueError("MarketSizingService: OpenAI API key is required.")
        self.llm = ChatOpenAI(
            model="gpt-4o",
            temperature=0.1,  # Lower temperature for more consistent research
            api_key=self.openai_api_key,
            timeout=120  # Increased timeout for complex research tasks
        )
        print("MarketSizingService: Using OpenAI as primary LLM.")
    
    async def research_market_size(self, business_idea, industry, product_type):
        """Research market size using enhanced browser automation with 5-phase methodology"""
        try:
            # Input validation
            if not all([business_idea, industry, product_type]):
                return {
                    "status": "error",
                    "error": "Missing required inputs: business_idea, industry, or product_type",
                    "market_data": {
                        "sources": [],
                        "confidence_score": 0
                    }
                }
            
            # Check cache first
            cache_key = self._generate_cache_key(business_idea, industry, product_type)
            cached_result = self._check_cache(cache_key)
            if cached_result:
                print(f"Using cached market data for {industry}")
                cached_result["research_method"] = "cached"
                return cached_result
            
            print(f"Starting enhanced market sizing research for {industry} using {self.llm.__class__.__name__}...")
            
            # Generate LLM-powered search queries
            search_queries = await self._generate_search_queries(business_idea, industry, product_type)
            
            # Create enhanced search task with 5-phase methodology
            search_task = self._create_search_task(business_idea, industry, product_type, search_queries)
            
            # Get enhanced agent configuration
            agent_config = get_enhanced_agent_config()
            
            # Create browser with enhanced configuration (ensures headless mode)
            browser = Browser(config=BrowserConfig(**get_enhanced_browser_config()))
            
            try:
                # Create agent with configured browser (as per docs)
                agent = Agent(
                    task=search_task,
                    llm=self.llm,
                    browser=browser,
                    use_vision=agent_config['use_vision'],
                    save_conversation_path="logs/market_sizing_research"
                )
                
                # Run agent
                print(f"Executing enhanced market sizing research agent with max {agent_config['max_steps']} steps...")
                history = await agent.run(max_steps=agent_config['max_steps'])
                
                # Get final result from history
                final_result = history.final_result()
                if not final_result:
                    raise ValueError("Agent completed but returned no final result")
                    
            finally:
                # Clean up browser
                await browser.close()
            
            # Process the result
            result = self._process_result(final_result, industry)
            
            # Validate and enhance result
            result = self._validate_and_enhance_result(result, business_idea, industry)
            
            # Cache the result for future use (only if quality is sufficient)
            if result.get("confidence_score", 0) >= 5:
                self._save_to_cache(cache_key, result)
                print(f"Cached high-quality result for {cache_key}")
            
            # Add research method and metadata
            result["research_method"] = "web_research"
            result["analysis_timestamp"] = time.time()
            result["agent_steps"] = len(history.model_actions()) if hasattr(history, 'model_actions') else 0
            
            return result
                
        except Exception as e:
            error_msg = f"Market sizing research failed: {str(e)}"
            print(f"Enhanced market sizing research failed: {error_msg}")
            
            # Return comprehensive error response
            return {
                "status": "error",
                "error": error_msg,
                "market_data": {
                    "sources": [],
                    "market_breakdown": {},
                    "confidence_score": 0
                },
                "research_method": "failed",
                "analysis_timestamp": time.time(),
                "research_limitations": [f"Analysis failed: {error_msg}"]
            }
    
    def _generate_cache_key(self, business_idea, industry, product_type):
        """Generate unique cache key using MD5 hash"""
        key_string = f"{business_idea}_{industry}_{product_type}".lower()
        return hashlib.md5(key_string.encode()).hexdigest()
    
    def _check_cache(self, key):
        """Check if data exists in cache with quality threshold"""
        cache_dir = os.path.join(os.path.dirname(__file__), "cache")
        os.makedirs(cache_dir, exist_ok=True)
        
        cache_file = os.path.join(cache_dir, f"market_sizing_{key}.json")
        if os.path.exists(cache_file):
            # Check if cache is less than 7 days old
            if time.time() - os.path.getmtime(cache_file) < 604800:  # 7 days in seconds
                with open(cache_file, "r") as f:
                    cached_data = json.load(f)
                    # Only use cache if quality meets threshold
                    if cached_data.get("market_data", {}).get("confidence_score", 0) >= 5:
                        return cached_data
        return None

    def _save_to_cache(self, key, data):
        """Save data to cache"""
        cache_dir = os.path.join(os.path.dirname(__file__), "cache")
        os.makedirs(cache_dir, exist_ok=True)
        
        cache_file = os.path.join(cache_dir, f"market_sizing_{key}.json")
        with open(cache_file, "w") as f:
            json.dump(data, f)
    
    async def _generate_search_queries(self, business_idea, industry, product_type):
        """Generate specific search queries using LLM to extract key market concepts"""
        try:
            query_prompt = f"""
            Generate 6-8 specific and targeted search queries for market sizing research based on this business idea:
            
            Business Idea: "{business_idea}"
            Industry Context: {industry}
            Product Type: {product_type}
            
            Extract key market concepts, target segments, revenue models, and geographic regions.
            Create search queries that would find ACTUAL market size data, revenue figures, and growth projections.
            
            Rules:
            1. Focus on market size, revenue, TAM/SAM, industry reports
            2. Include relevant market research terms (market size, revenue, CAGR, forecast)
            3. Target specific industry segments and use cases
            4. Use terms market research firms and analysts would search for
            5. Include geographic modifiers (global, US, Europe, etc.) where relevant
            6. Avoid overly broad industry terms
            7. Each query should be 3-7 words
            8. Think about what market researchers looking for sizing data would search
            
            Return exactly 6-8 search queries, one per line, without numbers or quotes.
            
            Example for "AI-powered business idea validation tool" in "Business Services":
            AI business validation market size
            business idea validation software revenue
            startup validation tools market forecast
            AI market research platform TAM
            business validation industry CAGR
            startup tools market size 2024
            AI SaaS validation market growth
            business idea testing market revenue
            """
            
            response = self.llm.invoke(query_prompt)
            
            # Extract queries from response
            queries = []
            for line in response.content.strip().split('\n'):
                line = line.strip()
                # Remove numbers, bullets, quotes
                line = re.sub(r'^[\d\.\-\*\s]*', '', line)
                line = line.strip('"\'')
                if line and len(line.split()) >= 2:  # Ensure meaningful queries
                    queries.append(line)
            
            # Fallback to original method if LLM fails
            if len(queries) < 4:
                print("LLM query generation insufficient, using fallback queries")
                return self._get_fallback_queries(business_idea, industry, product_type)
            
            print(f"Generated {len(queries)} specific market sizing queries: {queries}")
            return queries[:8]  # Limit to 8 queries
            
        except Exception as e:
            print(f"Search query generation failed: {e}, using fallback")
            return self._get_fallback_queries(business_idea, industry, product_type)
    
    def _get_fallback_queries(self, business_idea, industry, product_type):
        """Fallback to basic query method if LLM generation fails"""
        return [
            f"{industry} market size 2024",
            f"{product_type} {industry} revenue forecast",
            f"{industry} market growth rate CAGR",
            f"global {industry} {product_type} market",
            f"{industry} TAM SAM market sizing",
            f"{product_type} market research report",
            f"{industry} industry analysis revenue"
        ]
    
    def _create_search_task(self, business_idea, industry, product_type, search_queries):
        """Create enhanced search task with 5-phase research methodology"""
        
        # Format queries for the prompt
        formatted_queries = '\n            '.join([f'- "{query}"' for query in search_queries])
        
        return f"""
        **Objective:** Conduct comprehensive market sizing research for the business idea: "{business_idea}" (Industry: {industry}, Product Type: {product_type}).

        **Your Role:** You are an expert market research analyst specializing in market sizing and TAM/SAM calculations. Your goal is to find accurate, recent market data from reputable sources.

        **Primary Output Format Request:** Please return your findings in the JSON format specified at the end of this prompt. If you absolutely cannot generate valid JSON, fall back to the structured text format.

        **IMPORTANT: CAPTCHA and Access Restrictions Handling:**
        - If you encounter a CAPTCHA or are blocked from accessing a website, **DO NOT get stuck or wait indefinitely**
        - **TIMEOUT HANDLING**: If a page takes longer than 30 seconds to load, immediately move to alternative sources
        - **STUCK DETECTION**: If you find yourself repeatedly trying the same action, stop and move to a different task
        - Skip that specific website and move to alternative sources immediately
        - Try alternative search engines (Google, Bing, DuckDuckGo) if one blocks you or times out
        - **PRIORITIZE MARKET RESEARCH SITES**: Focus on Statista, IBISWorld, Grand View Research, Fortune Business Insights, etc.
        - Look for information on company investor pages, SEC filings, and industry association reports
        - **AVOID AUTHENTICATION**: Do not attempt to log into paid research platforms
        - **STEP LIMIT AWARENESS**: You have limited steps (40), so be efficient and move quickly between sources

        **Research & Data Collection Strategy:**

        **Phase 1: Initial Market Data Discovery**
        1. Execute *at least 5* of the following TARGETED search queries on accessible search engines:
            {formatted_queries}
        2. If you encounter access restrictions on any search engine, immediately switch to an alternative
        3. Focus on finding recent market research reports, industry analyses, and revenue data

        **Phase 2: Detailed Market Data Collection**
        For EACH distinct market data source identified, diligently collect the following. If a website is blocked or shows CAPTCHA:
        - Skip the blocked site and search for market data on alternative sources
        - Try market research aggregators (Statista, IBISWorld, Research and Markets)
        - Look for investor presentations, SEC filings, or industry association reports
        - If a piece of information is not found after trying multiple accessible sources, use `null` for JSON fields or "Not Found" for text:
            - **Publisher/Source:** (Official name of research firm or organization)
            - **Report Title:** (Title of the specific report or study)
            - **Publication Date:** (Year or full date when published)
            - **Current Market Size:** (Value with currency and unit, e.g., "$50.2 billion")
            - **Base Year:** (Year the market size data refers to)
            - **Growth Rate (CAGR):** (Compound Annual Growth Rate as percentage)
            - **Forecast Period:** (e.g., "2024-2030")
            - **Projected Market Size:** (Future market size with target year)
            - **Geographic Scope:** (Global, North America, Europe, Asia-Pacific, etc.)
            - **Market Segments:** (Key sub-segments or categories if mentioned)
            - **Source Quality:** (Rate credibility: High/Medium/Low based on publisher reputation)

        **Phase 3: TAM/SAM/SOM Analysis**
        1. **Total Addressable Market (TAM):** Identify the broadest market size for the overall industry
        2. **Serviceable Addressable Market (SAM):** Find data for the specific product/service category
        3. **Serviceable Obtainable Market (SOM):** Look for startup/new entrant market share data
        4. **Geographic Breakdown:** Find regional market size distributions if available
        5. **Market Drivers:** Identify key factors driving market growth
        6. **Market Challenges:** Note factors that could limit market growth

        **Phase 4: Source Documentation & Validation**
        For EACH significant data point, record its source:
            - **URL:** The direct web address (or note "Access restricted via CAPTCHA" if blocked)
            - **Publisher:** (e.g., "Grand View Research," "Statista," "IBISWorld")
            - **Publication Date:** (YYYY-MM-DD if available, otherwise "Date not found")
            - **Access Status:** Note if any sources were blocked or required payment
            - **Data Recency:** How recent the data is (current year, 1-2 years old, etc.)
        *Prioritize recent reports from established market research firms. If primary sources are blocked, use secondary sources like news articles or company filings.*

        **Phase 5: Final Review & Quality Assessment**
        Before providing your output, please review your findings:
            - Do you have market size data from at least 3 different sources?
            - Are the market sizes consistent or do they show a reasonable range?
            - Did you successfully work around any CAPTCHA or access restrictions?
            - Are growth rates and projections clearly documented?
            - Are all claims backed by cited sources with publication dates?
            - Does your output strictly adhere to one of the requested formats below, preferably JSON?
            - Did you document any access restrictions or limitations encountered?

        **Output Formats:**

        **PREFERRED: JSON FORMAT (Ensure valid JSON):**
        ```json
        {{
          "market_data": {{
            "sources": [
              {{
                "publisher": "Grand View Research",
                "report_title": "Business Validation Software Market Report",
                "publication_date": "2024-03-15",
                "market_size": 5.2,
                "market_size_unit": "billion",
                "currency": "USD",
                "base_year": 2023,
                "growth_rate": 15.8,
                "forecast_period": "2024-2030",
                "projected_size": 12.1,
                "projected_year": 2030,
                "geographic_scope": "Global",
                "market_segments": ["SaaS platforms", "Consulting services"],
                "source_quality": "high",
                "url": "https://example.com/report"
              }}
              // ... more sources
            ],
            "market_breakdown": {{
              "tam": 50.2,
              "sam": 12.1,
              "som": 1.2,
              "geographic_regions": [
                "North America: 35%",
                "Europe: 28%",
                "Asia-Pacific: 25%",
                "Others: 12%"
              ],
              "growth_drivers": [
                "Increasing startup ecosystem",
                "Digital transformation trends"
              ],
              "market_challenges": [
                "High competition",
                "Economic uncertainty"
              ]
            }},
            "confidence_score": 8, // Your assessed confidence (1-10) in the overall findings
            "data_recency": "Most data from 2023-2024"
          }},
          "research_limitations": [
            "Any access restrictions, CAPTCHAs, or blocked websites encountered"
          ]
        }}
        ```

        **FALLBACK: STRUCTURED TEXT FORMAT (If JSON fails):**
        MARKET DATA SOURCES:

        SOURCE 1: [Publisher Name] - [Report Title] ([Publication Date])
        - Current Market Size: $X billion/million ([Base Year])
        - Growth Rate: X.X% CAGR ([Forecast Period])
        - Projected Size: $X billion/million by [Year]
        - Geographic Scope: [Global/Regional]
        - Source Quality: [High/Medium/Low]
        - URL: [URL or "Access restricted"]

        ... (repeat for each source)

        MARKET BREAKDOWN:
        TAM: $X billion
        SAM: $X billion  
        SOM: $X billion
        
        Geographic Distribution:
        - [Region]: [Percentage]
        ...

        Growth Drivers:
        1. [Driver description]
        ...

        Market Challenges:
        1. [Challenge description]
        ...

        SOURCES:
        1. [URL or "Access restricted"] - [Publisher] ([Date]) [Access status]
        ...

        RESEARCH LIMITATIONS:
        - [Any CAPTCHAs, blocked sites, or access restrictions encountered]
        """
    
    def _process_result(self, text, industry):
        """Process raw text into structured format with enhanced parsing"""
        # The Browser-Use agent returns JSON embedded in the text
        # First, try to extract the JSON string from the response
        json_data = self._extract_json(text)
        
        if isinstance(json_data, dict):
            # If we got the complete market_data structure, return it
            if "market_data" in json_data:
                market_data = json_data["market_data"]
                
                # Ensure required structure exists
                if "sources" not in market_data:
                    market_data["sources"] = []
                if "market_breakdown" not in market_data:
                    market_data["market_breakdown"] = {}
                if "confidence_score" not in market_data:
                    market_data["confidence_score"] = 0
                    
                # Add research limitations if present
                research_limitations = json_data.get("research_limitations", [])
                
                return {
                    "status": "success",
                    "market_data": market_data,
                    "research_limitations": research_limitations
                }
            
            # If we got the sources directly, wrap it in the expected structure
            elif "sources" in json_data or "tam" in json_data:
                return {
                    "status": "success",
                    "market_data": {
                        "sources": json_data.get("sources", []),
                        "market_breakdown": json_data.get("market_breakdown", {}),
                        "confidence_score": json_data.get("confidence_score", 0),
                        "data_recency": json_data.get("data_recency", "Unknown")
                    },
                    "research_limitations": json_data.get("research_limitations", [])
                }
        
        # If JSON parsing failed, try to parse structured text format
        print(f"JSON extraction failed, attempting text parsing...")
        
        result = {
            "status": "success",
            "market_data": {
                "sources": [],
                "market_breakdown": {},
                "confidence_score": 0,
                "data_recency": "Unknown"
            },
            "research_limitations": []
        }
        
        # Extract market data sources from structured text
        sources_section = re.search(r'MARKET DATA SOURCES:(.*?)(?:MARKET BREAKDOWN:|TAM/SAM/SOM|RESEARCH LIMITATIONS|$)', text, re.DOTALL | re.IGNORECASE)
        if sources_section:
            sources_text = sources_section.group(1).strip()
            
            # Parse source blocks
            source_blocks = re.split(r'\d+\.\s*([^\n]+)', sources_text)[1:]  # Skip first empty element
            
            # Process sources in pairs (title, details)
            for i in range(0, len(source_blocks), 2):
                if i + 1 < len(source_blocks):
                    source_title = source_blocks[i].strip()
                    source_details = source_blocks[i + 1].strip()
                    
                    source = self._parse_source_block(source_title, source_details)
                    if source:
                        result["market_data"]["sources"].append(source)
        
        # Extract market breakdown
        breakdown_section = re.search(r'(?:MARKET BREAKDOWN|TAM/SAM/SOM):(.*?)(?:RESEARCH LIMITATIONS|CONFIDENCE|$)', text, re.DOTALL | re.IGNORECASE)
        if breakdown_section:
            breakdown_text = breakdown_section.group(1).strip()
            result["market_data"]["market_breakdown"] = self._parse_market_breakdown(breakdown_text)
        
        # Extract research limitations
        limitations_section = re.search(r'RESEARCH LIMITATIONS:(.*?)(?:CONFIDENCE|$)', text, re.DOTALL | re.IGNORECASE)
        if limitations_section:
            limitations_text = limitations_section.group(1).strip()
            # Extract bullet points or numbered items
            limitations = re.findall(r'[-\*\d+\.]\s*([^\n]+)', limitations_text)
            result["research_limitations"] = limitations
        
        # Extract confidence score
        confidence_match = re.search(r'CONFIDENCE SCORE:\s*(\d+)', text, re.IGNORECASE)
        if confidence_match:
            result["market_data"]["confidence_score"] = int(confidence_match.group(1))
        else:
            # Calculate confidence based on data quality
            source_count = len(result["market_data"]["sources"])
            breakdown_quality = 1 if result["market_data"]["market_breakdown"] else 0
            result["market_data"]["confidence_score"] = min(10, source_count * 2 + breakdown_quality * 3)
        
        # Assess data recency
        result["market_data"]["data_recency"] = self._assess_data_recency(result["market_data"]["sources"])
        
        return result
    
    def _parse_source_block(self, source_title, source_details):
        """Parse individual source block into structured data"""
        # Extract publisher and report title
        first_line_match = re.match(r'([^-]+?)(?:\s*-\s*([^(]+))?\s*(?:\(([^)]+)\))?', source_title.strip())
        if not first_line_match:
            return None
        
        publisher = first_line_match.group(1).strip()
        report_title = first_line_match.group(2).strip() if first_line_match.group(2) else ""
        publication_date = first_line_match.group(3).strip() if first_line_match.group(3) else None
        
        # Extract market size
        market_size_match = re.search(r'Current Market Size:\s*\$?\s*(\d+(?:[\.,]\d+)?)\s*(billion|million|trillion)(?:\s*\(([^)]+)\))?', source_details, re.IGNORECASE)
        
        # Extract growth rate
        growth_rate_match = re.search(r'Growth Rate:\s*(\d+(?:\.\d+)?)\s*%', source_details, re.IGNORECASE)
        
        # Extract projected size
        projected_size_match = re.search(r'Projected Size:\s*\$?\s*(\d+(?:[\.,]\d+)?)\s*(billion|million|trillion)(?:.*?(?:by|in|year)?\s*(\d{4}))?', source_details, re.IGNORECASE)
        
        # Extract geographic scope
        geo_match = re.search(r'Geographic Scope:\s*([^\n]+)', source_details, re.IGNORECASE)
        
        # Extract source quality
        quality_match = re.search(r'Source Quality:\s*([^\n]+)', source_details, re.IGNORECASE)
        
        # Extract URL
        url_match = re.search(r'URL:\s*([^\n]+)', source_details, re.IGNORECASE)
        
        if market_size_match:
            source_data = {
                "publisher": publisher,
                "report_title": report_title,
                "publication_date": publication_date,
                "market_size": float(market_size_match.group(1).replace(',', '')),
                "market_size_unit": market_size_match.group(2).lower(),
                "currency": "USD",
                "base_year": 2024,  # Default base year
                "geographic_scope": geo_match.group(1).strip() if geo_match else "Global",
                "source_quality": quality_match.group(1).strip().lower() if quality_match else "medium",
                "url": url_match.group(1).strip() if url_match else ""
            }
            
            # Add growth rate if available
            if growth_rate_match:
                source_data["growth_rate"] = float(growth_rate_match.group(1))
            
            # Add projected size if available
            if projected_size_match:
                source_data["projected_size"] = float(projected_size_match.group(1).replace(',', ''))
                source_data["projected_size_unit"] = projected_size_match.group(2).lower()
                source_data["projected_year"] = int(projected_size_match.group(3)) if projected_size_match.group(3) else None
            
            return source_data
        
        return None
    
    def _parse_market_breakdown(self, breakdown_text):
        """Parse market breakdown section"""
        breakdown = {}
        
        # Extract TAM/SAM/SOM
        tam_match = re.search(r'TAM:\s*\$?\s*(\d+(?:[\.,]\d+)?)\s*(billion|million)', breakdown_text, re.IGNORECASE)
        sam_match = re.search(r'SAM:\s*\$?\s*(\d+(?:[\.,]\d+)?)\s*(billion|million)', breakdown_text, re.IGNORECASE)
        som_match = re.search(r'SOM:\s*\$?\s*(\d+(?:[\.,]\d+)?)\s*(billion|million)', breakdown_text, re.IGNORECASE)
        
        if tam_match:
            breakdown["tam"] = float(tam_match.group(1).replace(',', ''))
            breakdown["tam_unit"] = tam_match.group(2).lower()
        if sam_match:
            breakdown["sam"] = float(sam_match.group(1).replace(',', ''))
            breakdown["sam_unit"] = sam_match.group(2).lower()
        if som_match:
            breakdown["som"] = float(som_match.group(1).replace(',', ''))
            breakdown["som_unit"] = som_match.group(2).lower()
        
        # Extract geographic regions
        geo_section = re.search(r'Geographic (?:Distribution|Regions?):(.*?)(?=Growth Drivers:|Market Challenges:|$)', breakdown_text, re.DOTALL | re.IGNORECASE)
        if geo_section:
            geo_text = geo_section.group(1).strip()
            regions = []
            if '\n' in geo_text:
                regions = [region.strip() for region in geo_text.split('\n') if region.strip() and not region.strip().startswith('-')]
            else:
                regions = [region.strip() for region in geo_text.split(',') if region.strip()]
            breakdown["geographic_regions"] = regions
        
        # Extract growth drivers
        drivers_section = re.search(r'Growth Drivers:(.*?)(?=Market Challenges:|$)', breakdown_text, re.DOTALL | re.IGNORECASE)
        if drivers_section:
            drivers_text = drivers_section.group(1).strip()
            drivers = re.findall(r'(?:\d+\.\s*|\-\s*)([^\n]+)', drivers_text)
            breakdown["growth_drivers"] = drivers
        
        # Extract market challenges
        challenges_section = re.search(r'Market Challenges:(.*?)$', breakdown_text, re.DOTALL | re.IGNORECASE)
        if challenges_section:
            challenges_text = challenges_section.group(1).strip()
            challenges = re.findall(r'(?:\d+\.\s*|\-\s*)([^\n]+)', challenges_text)
            breakdown["market_challenges"] = challenges
        
        return breakdown
    
    def _extract_json(self, text):
        """Extract JSON from the response text - enhanced for Browser-Use agent format"""
        import re
        
        # The Browser-Use agent often returns JSON directly in the "done" action text
        # First, try to find a complete JSON object
        json_match = re.search(r'(\{[^{}]*?"market_data"[^{}]*?\{.*?\}.*?\})', text, re.DOTALL)
        if json_match:
            try:
                return json.loads(json_match.group(1))
            except json.JSONDecodeError:
                pass
        
        # Try to find JSON code blocks
        json_match = re.search(r'```(?:json)?\s*([\s\S]*?)\s*```', text)
        if json_match:
            try:
                return json.loads(json_match.group(1))
            except json.JSONDecodeError:
                pass
        
        # Try to find raw JSON objects with market_data
        json_match = re.search(r'(\{.*?"market_data".*?\})', text, re.DOTALL)
        if json_match:
            # Find the complete JSON by balancing braces
            json_text = json_match.group(1)
            brace_count = 0
            end_pos = 0
            
            for i, char in enumerate(json_text):
                if char == '{':
                    brace_count += 1
                elif char == '}':
                    brace_count -= 1
                    if brace_count == 0:
                        end_pos = i + 1
                        break
            
            if end_pos > 0:
                try:
                    return json.loads(json_text[:end_pos])
                except json.JSONDecodeError:
                    pass
        
        # Try to find any JSON-like structure
        json_match = re.search(r'(\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\})', text)
        if json_match:
            try:
                return json.loads(json_match.group(1))
            except json.JSONDecodeError:
                pass
        
        # If all else fails, return empty dict
        return {}
    
    def _validate_and_enhance_result(self, result, business_idea, industry):
        """Validate and enhance market sizing result with quality checks"""
        if not isinstance(result, dict):
            return result
        
        # Ensure all required fields exist
        if "market_data" not in result:
            result["market_data"] = {}
        
        market_data = result["market_data"]
        
        # Ensure required market_data fields exist
        required_fields = ["sources", "market_breakdown", "confidence_score"]
        for field in required_fields:
            if field not in market_data:
                if field == "sources":
                    market_data[field] = []
                elif field == "market_breakdown":
                    market_data[field] = {}
                else:
                    market_data[field] = 0
        
        # Validate and enhance sources
        validated_sources = []
        for source in market_data.get("sources", []):
            if isinstance(source, dict) and source.get("publisher"):
                # Ensure all source fields exist
                source_template = {
                    "publisher": source.get("publisher", ""),
                    "report_title": source.get("report_title", ""),
                    "publication_date": source.get("publication_date"),
                    "market_size": source.get("market_size"),
                    "market_size_unit": source.get("market_size_unit", "billion"),
                    "currency": source.get("currency", "USD"),
                    "base_year": source.get("base_year", 2024),
                    "growth_rate": source.get("growth_rate"),
                    "geographic_scope": source.get("geographic_scope", "Global"),
                    "source_quality": source.get("source_quality", "medium"),
                    "url": source.get("url", "")
                }
                
                validated_sources.append(source_template)
        
        market_data["sources"] = validated_sources
        
        # Recalculate confidence score based on data quality
        quality_score = 0
        
        # Sources quality (0-6 points)
        if len(validated_sources) >= 3:
            quality_score += 4
        elif len(validated_sources) >= 1:
            quality_score += len(validated_sources)
        
        # High quality sources bonus (0-2 points)
        high_quality_sources = [s for s in validated_sources if s.get("source_quality") == "high"]
        if len(high_quality_sources) >= 2:
            quality_score += 2
        elif len(high_quality_sources) >= 1:
            quality_score += 1
        
        # Market breakdown completeness (0-2 points)
        breakdown = market_data.get("market_breakdown", {})
        if breakdown.get("tam") or breakdown.get("sam"):
            quality_score += 1
        if breakdown.get("growth_drivers") or breakdown.get("geographic_regions"):
            quality_score += 1
        
        # Update confidence score (keep existing if higher)
        existing_score = market_data.get("confidence_score", 0)
        market_data["confidence_score"] = max(existing_score, quality_score)
        
        # Add data quality metadata
        market_data["data_quality"] = {
            "total_sources": len(validated_sources),
            "high_quality_sources": len(high_quality_sources),
            "has_tam_sam": bool(breakdown.get("tam") or breakdown.get("sam")),
            "analysis_completeness": quality_score / 10.0,  # Convert to 0-1 scale
            "data_recency": self._assess_data_recency(validated_sources)
        }
        
        # Ensure research_limitations exists
        if "research_limitations" not in result:
            result["research_limitations"] = []
        
        return result
    
    def _assess_data_recency(self, sources):
        """Assess how recent the market data is"""
        current_year = 2024
        recent_count = 0
        total_count = 0
        
        for source in sources:
            pub_date = source.get("publication_date")
            if pub_date:
                try:
                    # Extract year from various date formats
                    year_match = re.search(r'(\d{4})', str(pub_date))
                    if year_match:
                        year = int(year_match.group(1))
                        total_count += 1
                        if current_year - year <= 2:  # Within last 2 years
                            recent_count += 1
                except:
                    pass
        
        if total_count == 0:
            return "Unknown"
        elif recent_count / total_count >= 0.8:
            return "Very recent (most data within 2 years)"
        elif recent_count / total_count >= 0.5:
            return "Moderately recent"
        else:
            return "Some older data sources"