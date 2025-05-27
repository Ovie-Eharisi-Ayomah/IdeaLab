# competitive_analysis.py - Upgraded with better prompts, caching and parsing
import json
import os
import time
import re
from pathlib import Path
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from browser_use import Agent, Browser, BrowserConfig
from browser_use.browser.context import BrowserContextConfig
from browser_config_fix import get_enhanced_browser_config, get_enhanced_context_config, get_enhanced_agent_config

# Load environment variables
load_dotenv()

class CompetitiveAnalysisService:
    def __init__(self, openai_api_key=None, anthropic_api_key=None):
        self.openai_api_key = openai_api_key or os.getenv("OPENAI_API_KEY")
        
        # Initialize LLM directly with OpenAI
        if not self.openai_api_key:
            raise ValueError("CompetitiveAnalysisService: OpenAI API key is required.")
        self.llm = ChatOpenAI(
            model="gpt-4o",
            temperature=0.1,  # Even lower temperature for more consistent research
            api_key=self.openai_api_key,
            timeout=120  # Increased timeout for complex research tasks
        )
        print("CompetitiveAnalysisService: Using OpenAI as primary LLM.")
    
    async def analyze_competition(self, business_idea, industry, product_type, problem_statement=None):
        """Analyze competition using browser-use with enhanced error handling and caching"""
        try:
            # Input validation
            if not all([business_idea, industry, product_type]):
                return {
                    "status": "error",
                    "error": "Missing required inputs: business_idea, industry, or product_type",
                    "competitors": [],
                    "market_gaps": [],
                    "barriers_to_entry": [],
                    "market_concentration": "unknown",
                    "confidence_score": 0
                }
            
            # Check cache first
            cache_key = f"{industry}_{product_type}_competition".lower().replace(' ', '_')
            cached_result = self._check_cache(cache_key)
            if cached_result:
                print(f"Using cached competition data for {industry}")
                cached_result["research_method"] = "cached"
                return cached_result
            
            print(f"Starting competition analysis for {industry} using {self.llm.__class__.__name__}...")
            
            # Create task prompt - more detailed and structured (now with problem statement)
            search_task = self._create_search_task(business_idea, industry, product_type, problem_statement)
            
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
                    save_conversation_path="logs/competition_research"
                )
                
                # Run agent
                print(f"Executing competitive research agent with max {agent_config['max_steps']} steps...")
                history = await agent.run(max_steps=agent_config['max_steps'])
                
                # Get final result from history
                final_result = history.final_result()
                if not final_result:
                    raise ValueError("Agent completed but returned no final result")
                    
            finally:
                # Clean up browser
                await browser.close()
            
            # Extract structured data with enhanced processing
            result = self._process_result(final_result, industry)
            
            # Add quality validation
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
            error_msg = f"Competition analysis failed: {str(e)}"
            print(f"Browser-use competition analysis failed: {error_msg}")
            
            # Return comprehensive error response
            return {
                "status": "error",
                "error": error_msg,
                "competitors": [],
                "market_gaps": [],
                "barriers_to_entry": [],
                "market_concentration": "unknown",
                "emerging_trends": [],
                "sources": [],
                "confidence_score": 0,
                "research_method": "failed",
                "analysis_timestamp": time.time(),
                "research_limitations": [f"Analysis failed: {error_msg}"]
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
    
    def _create_search_task(self, business_idea, industry, product_type, problem_statement=None):
        """Create the refined search task prompt with specific queries and format"""
        
        # Generate specific search queries using LLM
        search_queries = self._generate_search_queries(business_idea, industry, product_type, problem_statement)
        
        # Format queries for the prompt
        formatted_queries = '\n            '.join([f'- "{query}"' for query in search_queries])
        
        return f"""
        **Objective:** Conduct a comprehensive competitive landscape analysis for the business idea: "{business_idea}" (Industry: {industry}, Product Type: {product_type}).

        **Your Role:** You are an expert market research analyst. Your goal is to be thorough, accurate, and to structure your findings precisely as requested.

        **Primary Output Format Request:** Please return your findings in the JSON format specified at the end of this prompt. If you absolutely cannot generate valid JSON, fall back to the structured text format.

        **IMPORTANT: CAPTCHA and Access Restrictions Handling:**
        - If you encounter a CAPTCHA or are blocked from accessing a website, **DO NOT get stuck or wait indefinitely**
        - **TIMEOUT HANDLING**: If a page takes longer than 30 seconds to load, immediately move to alternative sources
        - **STUCK DETECTION**: If you find yourself repeatedly trying the same action (like switching tabs), stop and move to a different task
        - Skip that specific website and move to alternative sources immediately
        - Try alternative search engines (Google, Bing, DuckDuckGo) if one blocks you or times out
        - **AVOID AUTHENTICATION**: Do not attempt to log into sites like LinkedIn, Crunchbase, or social media platforms
        - Look for information on alternative sites like company directories, news sites, or industry reports
        - If a key competitor's main website is blocked, search for information about them on third-party sites
        - **PRIORITIZE ACCESSIBLE SOURCES**: Focus on sites that work reliably (Wikipedia, news sites, public company directories)
        - Always prioritize completing the research over accessing any single specific website
        - Document any access restrictions encountered in your sources notes
        - **STEP LIMIT AWARENESS**: You have limited steps (30), so be efficient and move quickly between sources

        **Research & Data Collection Strategy:**

        **Phase 1: Initial Competitor Identification**
        1.  Execute *at least 5* of the following TARGETED search queries on accessible search engines:
            {formatted_queries}
        2.  If you encounter access restrictions on any search engine, immediately switch to an alternative
        3.  Identify distinct competitors offering similar solutions to a similar target audience

        **Phase 2: Detailed Competitor Profiling**
        For EACH distinct competitor identified, diligently collect the following. If a website is blocked or shows CAPTCHA:
        - Skip the blocked site and search for company information on alternative sources
        - Try company directory sites (Crunchbase, LinkedIn, Wikipedia, industry databases)
        - Look for news articles, press releases, or reviews mentioning the company
        - If a piece of information is not found after trying multiple accessible sources, use `null` for optional JSON fields or "Not Found" for text fields:
            - **Company Name:** (Official name)
            - **Website URL:** (Direct link to their main site, or note "Access restricted" if blocked)
            - **Key Products/Features:** (List specific offerings, be detailed)
            - **Target Audience:** (Describe their typical customer/segment, e.g., "Small e-commerce businesses," "Fitness-conscious millennials")
            - **Pricing Model:** (e.g., "Freemium with premium at $29/month," "Subscription tiers: Basic $10/mo, Pro $30/mo," "One-time purchase: $99." If exact prices are unavailable, describe the model, e.g., "Subscription-based, pricing not public.")
            - **Unique Selling Points (USPs):** (What makes them stand out? List 2-3 key differentiators.)
            - **Market Position:** (e.g., "Estimated market leader," "Niche player," "Emerging challenger." Include market share percentage or revenue if found, otherwise "Market share not found.")
            - **Founded Year:** (Year, e.g., 2015. If not found, use `null` or "Not Found.")
            - **Funding:** (e.g., "$10M Series A," "Bootstrapped." If not found, use `null` or "Not Found.")

        **Phase 3: Broader Market Analysis**
        1.  **Market Gaps:** Identify 2-4 specific unmet customer needs or underserved areas. For each, briefly state the supporting observation (e.g., "Common user complaint in forums: X," "No major player offers Y for Z segment.").
        2.  **Barriers to Entry:** Identify 2-4 significant challenges a new company would face entering this market (e.g., "High capital investment for R&D," "Strong brand loyalty to existing players.").
        3.  **Market Concentration:** Assess if the market is: Highly Concentrated (few dominant players), Moderately Concentrated, or Fragmented. Briefly justify.
        4.  **Emerging Trends:** List 2-3 key trends shaping this market (e.g., "AI-driven personalization," "Subscription model fatigue," "Focus on sustainability.").

        **Phase 4: Source Documentation**
        For EACH significant piece of information or data point, record its source:
            - **URL:** The direct web address (or note "Access restricted via CAPTCHA" if blocked)
            - **Publication/Website Name:** (e.g., "TechCrunch," "Company X Blog," "Statista")
            - **Publication Date:** (YYYY-MM-DD if available, otherwise "Date not found")
            - **Access Status:** Note if any sources were blocked or required CAPTCHA
        *Prioritize official company websites, reputable industry news, and established market research reports. If primary sources are blocked, use secondary sources like news articles, industry reports, or company directories.*

        **Phase 5: Final Review (Self-Correction)**
        Before providing your output, please review your findings:
            - Is the information for each competitor as complete as possible, using `null` or "Not Found" where appropriate?
            - Did you successfully work around any CAPTCHA or access restrictions encountered?
            - Are market gaps and barriers distinct and clearly explained?
            - Is the market concentration assessment justified?
            - Are all claims backed by cited sources? (Crucial)
            - Does your output strictly adhere to one of the requested formats below, preferably JSON?
            - Did you document any access restrictions or limitations encountered?

        **Output Formats:**

        **PREFERRED: JSON FORMAT (Ensure valid JSON):**
        ```json
        {{
          "competitors": [
            {{
              "name": "Company Name",
              "website": "https://domain.com",
              "products": ["Product A", "Product B"],
              "target_audience": "Specific market segment",
              "pricing_model": "Details with actual prices or model description",
              "unique_selling_points": ["USP 1", "USP 2"],
              "market_position": "Market leader with X% share / Description",
              "founded": 2015, // Use null if not found
              "funding": "$X million Series B" // Use null if not found
            }}
            // ... more competitors
          ],
          "market_gaps": [
            "Gap 1: Detailed description with brief supporting observation.",
            "Gap 2: Detailed description with brief supporting observation."
          ],
          "barriers_to_entry": [
            "Barrier 1: Detailed description.",
            "Barrier 2: Detailed description."
          ],
          "market_concentration": "Highly concentrated/Fragmented with brief justification.",
          "emerging_trends": [
            "Trend 1: Detailed description.",
            "Trend 2: Detailed description."
          ],
          "sources": [
            {{
              "url": "https://source1.com",
              "name": "Publication Name",
              "date": "2023-05-12", // Use null or "Date not found" if unavailable
              "access_status": "accessible" // or "blocked_by_captcha", "access_restricted", etc.
            }}
            // ... more sources
          ],
          "confidence_score": 8, // Your assessed confidence (1-10) in the overall findings based on info quality and availability
          "research_limitations": [
            "Any access restrictions, CAPTCHAs, or blocked websites encountered during research"
          ]
        }}
        ```

        **FALLBACK: STRUCTURED TEXT FORMAT (If JSON fails):**
        COMPETITORS:

        [Company 1 Name] (Website: [URL or "Access restricted"])
        - Products: [List]
        - Target Audience: [Description]
        - Pricing: [Details]
        - USPs: [List]
        - Market Position: [Description]
        - Founded: [Year or "Not Found"] | Funding: [Details or "Not Found"]

        ... (repeat for each competitor)

        MARKET GAPS:
        1. [Gap description with supporting observation]
        ...

        BARRIERS TO ENTRY:
        1. [Barrier description]
        ...

        MARKET CONCENTRATION:
        [Assessment and justification]

        EMERGING TRENDS:
        1. [Trend description]
        ...

        SOURCES:
        1. [URL or "Access restricted"] - [Publication Name] ([Date or "Date not found"]) [Access status]
        ...

        RESEARCH LIMITATIONS:
        - [Any CAPTCHAs, blocked sites, or access restrictions encountered]
        """
    
    def _process_result(self, text, industry):
        """Process raw text into structured format with comprehensive competitor data"""
        # First try to extract JSON (in case agent returns JSON format)
        json_data = self._extract_json(text)
        
        # If we got parseable JSON with expected structure, return it
        if isinstance(json_data, dict) and "competitors" in json_data:
            # Ensure confidence score exists
            if "confidence_score" not in json_data:
                json_data["confidence_score"] = min(len(json_data.get("competitors", [])) * 2, 10)
            
            # Add status field
            json_data["status"] = "success"
            return json_data
        
        # Parse structured text format (what the agent actually returns)
        result = {
            "status": "success",
            "competitors": [],
            "market_gaps": [],
            "barriers_to_entry": [],
            "market_concentration": "unknown",
            "emerging_trends": [],
            "sources": [],
            "confidence_score": 0,
            "research_limitations": []
        }
        
        # Extract competitors using the actual format: **CompanyName**
        competitors_section = re.search(r'\*\*Competitors:\*\*(.*?)(?:\*\*Market Gaps:\*\*|\*\*Barriers|\*\*Market Concentration|\*\*Emerging Trends|\*\*Sources|\*\*Research Limitations|\*\*Confidence Score|$)', text, re.DOTALL)
        
        if competitors_section:
            competitors_text = competitors_section.group(1).strip()
            
            # Split by numbered competitors (1. **CompanyName**, 2. **CompanyName**, etc.)
            competitor_blocks = re.split(r'\d+\.\s*\*\*([^*]+)\*\*', competitors_text)[1:]  # Skip first empty element
            
            # Process competitors in pairs (name, details)
            for i in range(0, len(competitor_blocks), 2):
                if i + 1 < len(competitor_blocks):
                    name = competitor_blocks[i].strip()
                    details_block = competitor_blocks[i + 1].strip()
                    
                    competitor = {
                        "name": name,
                        "website": "",
                        "products": [],
                        "target_audience": "",
                        "pricing_model": "",
                        "unique_selling_points": [],
                        "market_position": "",
                        "founded": None,
                        "funding": ""
                    }
                    
                    # Extract details using the actual format
                    website_match = re.search(r'- \*\*Website:\*\*\s*(?:\[([^\]]+)\]\([^)]+\)|([^\n]+))', details_block)
                    products_match = re.search(r'- \*\*Products:\*\*\s*([^\n]+)', details_block)
                    audience_match = re.search(r'- \*\*Target Audience:\*\*\s*([^\n]+)', details_block)
                    pricing_match = re.search(r'- \*\*Pricing Model:\*\*\s*([^\n]+)', details_block)
                    usps_match = re.search(r'- \*\*Unique Selling Points:\*\*\s*([^\n]+)', details_block)
                    position_match = re.search(r'- \*\*Market Position:\*\*\s*([^\n]+)', details_block)
                    founded_match = re.search(r'- \*\*Founded Year:\*\*\s*(\d{4}|Not Found)', details_block)
                    funding_match = re.search(r'- \*\*Funding:\*\*\s*([^\n]+)', details_block)
                    
                    if website_match:
                        competitor["website"] = website_match.group(1) or website_match.group(2) or ""
                    
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
                        founded_text = founded_match.group(1).strip()
                        if founded_text.isdigit():
                            competitor["founded"] = int(founded_text)
                    
                    if funding_match:
                        funding_text = funding_match.group(1).strip()
                        if funding_text.lower() != "not found":
                            competitor["funding"] = funding_text
                    
                    result["competitors"].append(competitor)
        
        # Extract market gaps
        gaps_section = re.search(r'\*\*Market Gaps:\*\*(.*?)(?:\*\*Barriers|\*\*Market Concentration|\*\*Emerging Trends|\*\*Sources|\*\*Research Limitations|\*\*Confidence Score|$)', text, re.DOTALL)
        if gaps_section:
            gaps_text = gaps_section.group(1).strip()
            # Extract numbered items
            gaps = re.findall(r'\d+\.\s*([^\n]+)', gaps_text)
            result["market_gaps"] = gaps
        
        # Extract barriers to entry
        barriers_section = re.search(r'\*\*Barriers to Entry:\*\*(.*?)(?:\*\*Market Concentration|\*\*Emerging Trends|\*\*Sources|\*\*Research Limitations|\*\*Confidence Score|$)', text, re.DOTALL)
        if barriers_section:
            barriers_text = barriers_section.group(1).strip()
            barriers = re.findall(r'\d+\.\s*([^\n]+)', barriers_text)
            result["barriers_to_entry"] = barriers
        
        # Extract market concentration
        concentration_section = re.search(r'\*\*Market Concentration:\*\*\s*([^\n]+)', text)
        if concentration_section:
            result["market_concentration"] = concentration_section.group(1).strip()
        
        # Extract emerging trends
        trends_section = re.search(r'\*\*Emerging Trends:\*\*(.*?)(?:\*\*Sources|\*\*Research Limitations|\*\*Confidence Score|$)', text, re.DOTALL)
        if trends_section:
            trends_text = trends_section.group(1).strip()
            trends = re.findall(r'\d+\.\s*([^\n]+)', trends_text)
            result["emerging_trends"] = trends
        
        # Extract sources
        sources_section = re.search(r'\*\*Sources:\*\*(.*?)(?:\*\*Research Limitations|\*\*Confidence Score|$)', text, re.DOTALL)
        if sources_section:
            sources_text = sources_section.group(1).strip()
            # Extract sources with format: [Number]. [URL](link) - Description
            source_matches = re.findall(r'\d+\.\s*(?:\[([^\]]+)\]\([^)]+\)|([^\-\n]+))(?:\s*-\s*([^\n]+))?', sources_text)
            
            for match in source_matches:
                name = match[0] or match[1] or ""
                description = match[2] or ""
                
                # Extract URL if present
                url_match = re.search(r'\(([^)]+)\)', name) if name else None
                url = url_match.group(1) if url_match else ""
                
                # Clean name
                name = re.sub(r'\[|\]|\([^)]*\)', '', name).strip()
                
                if name:
                    source = {
                        "url": url,
                        "name": name,
                        "date": None,
                        "access_status": "accessible"
                    }
                    result["sources"].append(source)
        
        # Extract research limitations
        limitations_section = re.search(r'\*\*Research Limitations:\*\*(.*?)(?:\*\*Confidence Score|$)', text, re.DOTALL)
        if limitations_section:
            limitations_text = limitations_section.group(1).strip()
            # Extract bullet points
            limitations = re.findall(r'[-\*]\s*([^\n]+)', limitations_text)
            result["research_limitations"] = limitations
        
        # Extract confidence score
        confidence_match = re.search(r'\*\*Confidence Score:\*\*\s*(\d+)', text)
        if confidence_match:
            result["confidence_score"] = int(confidence_match.group(1))
        else:
            # Calculate based on data quality
            competitor_score = min(5, len(result["competitors"]))
            source_score = min(3, len(result["sources"]))
            analysis_score = min(2, len(result["market_gaps"]) + len(result["barriers_to_entry"]))
            result["confidence_score"] = competitor_score + source_score + analysis_score
        
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

    def _validate_and_enhance_result(self, result, business_idea, industry):
        """Validate and enhance the competitive analysis result with quality checks"""
        if not isinstance(result, dict):
            return result
            
        # Ensure all required fields exist
        required_fields = ["competitors", "market_gaps", "barriers_to_entry", "market_concentration", "emerging_trends", "sources", "research_limitations"]
        for field in required_fields:
            if field not in result:
                if field == "market_concentration":
                    result[field] = "unknown"
                else:
                    result[field] = []
        
        # Validate competitors data quality
        validated_competitors = []
        for competitor in result.get("competitors", []):
            if isinstance(competitor, dict) and competitor.get("name"):
                # Ensure all competitor fields exist
                competitor_template = {
                    "name": competitor.get("name", ""),
                    "website": competitor.get("website", ""),
                    "products": competitor.get("products", []),
                    "target_audience": competitor.get("target_audience", ""),
                    "pricing_model": competitor.get("pricing_model", ""),
                    "unique_selling_points": competitor.get("unique_selling_points", []),
                    "market_position": competitor.get("market_position", ""),
                    "founded": competitor.get("founded"),
                    "funding": competitor.get("funding", "")
                }
                
                # Convert single strings to lists where appropriate
                if isinstance(competitor_template["products"], str):
                    competitor_template["products"] = [competitor_template["products"]]
                if isinstance(competitor_template["unique_selling_points"], str):
                    competitor_template["unique_selling_points"] = [competitor_template["unique_selling_points"]]
                
                validated_competitors.append(competitor_template)
        
        result["competitors"] = validated_competitors
        
        # Validate and enhance sources with access_status
        validated_sources = []
        for source in result.get("sources", []):
            if isinstance(source, dict) and source.get("url"):
                source_template = {
                    "url": source.get("url", ""),
                    "name": source.get("name", ""),
                    "date": source.get("date"),
                    "access_status": source.get("access_status", "accessible")
                }
                validated_sources.append(source_template)
        
        result["sources"] = validated_sources
        
        # Recalculate confidence score based on data quality
        quality_score = 0
        
        # Competitors quality (0-5 points)
        if len(result["competitors"]) >= 3:
            quality_score += 3
        elif len(result["competitors"]) >= 1:
            quality_score += len(result["competitors"])
            
        # Market analysis quality (0-3 points)
        if len(result.get("market_gaps", [])) >= 2:
            quality_score += 1
        if len(result.get("barriers_to_entry", [])) >= 2:
            quality_score += 1
        if result.get("market_concentration") and result["market_concentration"] != "unknown":
            quality_score += 1
            
        # Sources quality (0-2 points)
        valid_sources = [s for s in result.get("sources", []) if isinstance(s, dict) and s.get("url")]
        if len(valid_sources) >= 3:
            quality_score += 2
        elif len(valid_sources) >= 1:
            quality_score += 1
        
        # Update confidence score (keep existing if higher)
        existing_score = result.get("confidence_score", 0)
        result["confidence_score"] = max(existing_score, quality_score)
        
        # Add quality metadata
        result["data_quality"] = {
            "total_competitors": len(result["competitors"]),
            "valid_sources": len(valid_sources),
            "analysis_completeness": quality_score / 10.0,  # Convert to 0-1 scale
            "missing_fields": [field for field in required_fields if not result.get(field)]
        }
        
        return result

    def _generate_search_queries(self, business_idea, industry, product_type, problem_statement=None):
        """Generate specific search queries using LLM to extract key concepts from business idea and problem statement"""
        try:
            # Include problem statement if available
            problem_context = ""
            if problem_statement:
                problem_context = f"""
            Problem Statement: "{problem_statement}"
            """
            
            query_prompt = f"""
            Generate 6-8 specific and targeted search queries for competitive research based on this business idea:
            
            Business Idea: "{business_idea}"
            Industry Context: {industry}
            Product Type: {product_type}{problem_context}
            
            Extract the key concepts, technologies, value propositions, target use cases, and specific problems being solved.
            Create search queries that would find ACTUAL competitors solving the same problem, not just companies in the broad industry category.
            
            Rules:
            1. Focus on the specific value proposition and unique features
            2. Include relevant technology terms (AI, automation, etc.)
            3. Target the exact problem being solved and pain points mentioned
            4. Use terms potential customers would search for when looking for solutions
            5. Include target audience keywords if evident (startups, small business, etc.)
            6. Avoid overly broad industry terms
            7. Each query should be 2-6 words
            8. Think about what someone with this exact problem would search for
            
            Return exactly 6-8 search queries, one per line, without numbers or quotes.
            
            Example for "AI-powered tool that validates business ideas" with problem "Entrepreneurs waste time building unvalidated products":
            AI business idea validation
            startup idea validation software
            entrepreneur market testing tools
            business concept validation platforms
            AI market research automation
            startup validation before building
            idea testing for entrepreneurs
            market demand validation tools
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
            
            print(f"Generated {len(queries)} specific search queries: {queries}")
            return queries[:8]  # Limit to 8 queries
            
        except Exception as e:
            print(f"Search query generation failed: {e}, using fallback")
            return self._get_fallback_queries(business_idea, industry, product_type)
    
    def _get_fallback_queries(self, business_idea, industry, product_type):
        """Fallback to original query method if LLM generation fails"""
        return [
            f"top {industry} {product_type} companies",
            f"{industry} {product_type} market leaders",
            f"leading {industry} {product_type} solutions",
            f"{industry} startups {product_type}",
            f"{product_type} {industry} market share analysis",
            f"{industry} {product_type} pricing comparison",
            f"reviews of {industry} {product_type}"
        ]