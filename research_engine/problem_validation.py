# problem_validation.py - Enhanced with Browser-Use and improved prompts
import json
import os
import time
import re
import hashlib
from pathlib import Path
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from browser_use import Agent, Browser, BrowserConfig
from browser_use.browser.context import BrowserContextConfig
from browser_config_fix import get_enhanced_browser_config, get_enhanced_context_config, get_enhanced_agent_config

# Load environment variables
load_dotenv()

class ProblemValidationService:
    def __init__(self, openai_api_key=None, anthropic_api_key=None):
        self.openai_api_key = openai_api_key or os.getenv("OPENAI_API_KEY")
        
        # Initialize LLM directly with OpenAI like competitive analysis
        if not self.openai_api_key:
            raise ValueError("ProblemValidationService: OpenAI API key is required.")
        self.llm = ChatOpenAI(
            model="gpt-4o",
            temperature=0.1,  # Low temperature for consistent research
            api_key=self.openai_api_key,
            timeout=120  # Increased timeout for complex research tasks
        )
        print("ProblemValidationService: Using OpenAI as primary LLM.")
    
    async def validate_problem(self, business_idea, problem_statement, industry):
        """Validate problem with enhanced browser automation, caching, and LLM-powered search queries"""
        
        # Input validation
        if not all([business_idea, problem_statement, industry]):
            return {
                "status": "error",
                "error": "Missing required inputs: business_idea, problem_statement, or industry",
                "problem_validation": {
                    "exists": None,
                    "severity": 0,
                    "frequency": 0,
                    "willingness_to_pay": None,
                    "market_size_estimate": None,
                    "confidence_level": 0
                },
                "evidence": [],
                "alternative_solutions": [],
                "problem_statement_feedback": "Input validation failed",
                "confidence_score": 0,
                "research_limitations": ["Missing required inputs"]
            }
        
        # Create cache key for this validation
        cache_key = hashlib.md5(f"{business_idea}_{problem_statement}_{industry}".encode()).hexdigest()
        
        # Check cache first
        cached_result = self._check_cache(cache_key)
        if cached_result:
            print(f"Using cached problem validation result for {cache_key[:8]}...")
            cached_result["research_method"] = "cached"
            return cached_result
        
        try:
            print(f"Starting problem validation for '{problem_statement}' in {industry}...")
            
            # Generate specific search queries using LLM
            search_queries = await self._generate_search_queries(business_idea, problem_statement, industry)
            
            # Create search task with generated queries
            search_task = self._create_search_task(business_idea, problem_statement, industry, search_queries)
            
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
                    save_conversation_path="logs/problem_validation_research"
                )
                
                # Run agent
                print(f"Executing problem validation research agent with max {agent_config['max_steps']} steps...")
                history = await agent.run(max_steps=agent_config['max_steps'])
                
                # Get final result from history
                final_result = history.final_result()
                if not final_result:
                    raise ValueError("Agent completed but returned no final result")
                    
            finally:
                # Clean up browser
                await browser.close()
            
            # Parse and structure the result
            result = self._parse_validation_result(final_result)
            
            # Validate and enhance the result
            result = self._validate_and_enhance_result(result, business_idea, problem_statement, industry)
            
            # Cache the result for future use (only if quality is sufficient)
            if result.get("confidence_score", 0) >= 4:
                self._save_to_cache(cache_key, result)
                print(f"Cached high-quality result for {cache_key[:8]}...")
            
            # Add research metadata
            result["research_method"] = "web_research"
            result["analysis_timestamp"] = time.time()
            result["agent_steps"] = len(history.model_actions()) if hasattr(history, 'model_actions') else 0
            result["search_queries_used"] = search_queries
            
            return result
                
        except Exception as e:
            error_msg = f"Problem validation failed: {str(e)}"
            print(f"Problem validation error: {error_msg}")
            
            # Return comprehensive error response
            return {
                "status": "error",
                "error": error_msg,
                "problem_validation": {
                    "exists": None,
                    "severity": 0,
                    "frequency": 0,
                    "willingness_to_pay": None,
                    "market_size_estimate": None,
                    "confidence_level": 0
                },
                "evidence": [],
                "alternative_solutions": [],
                "problem_statement_feedback": "Research failed",
                "confidence_score": 0,
                "research_method": "failed",
                "analysis_timestamp": time.time(),
                "research_limitations": [f"Analysis failed: {error_msg}"]
            }
    
    def _create_search_task(self, business_idea, problem_statement, industry, search_queries):
        """Create the search task prompt with specific queries and format"""
        
        # Format queries for the prompt
        formatted_queries = '\n            '.join([f'- "{query}"' for query in search_queries])
        
        return f"""
        **Objective:** Research and validate if this problem exists: "{problem_statement}" in the {industry} industry.
        
        **Context:** This is for a business idea: {business_idea}
        
        **Your Role:** You are an expert market researcher specializing in problem validation. Your goal is to find concrete evidence that this problem exists and assess its significance.

        **IMPORTANT: CAPTCHA and Access Restrictions Handling:**
        - If you encounter a CAPTCHA or are blocked from accessing a website, **DO NOT get stuck or wait indefinitely**
        - **TIMEOUT HANDLING**: If a page takes longer than 30 seconds to load, immediately move to alternative sources
        - **STUCK DETECTION**: If you find yourself repeatedly trying the same action, stop and move to a different task
        - Skip that specific website and move to alternative sources immediately
        - Try alternative search engines (Google, Bing, DuckDuckGo) if one blocks you or times out
        - **AVOID AUTHENTICATION**: Do not attempt to log into sites like LinkedIn, social media platforms
        - **PRIORITIZE ACCESSIBLE SOURCES**: Focus on sites that work reliably (Wikipedia, news sites, research publications, forums)
        - Always prioritize completing the research over accessing any single specific website
        - Document any access restrictions encountered in your sources notes
        - **STEP LIMIT AWARENESS**: You have limited steps (30), so be efficient and move quickly between sources

        **Research Strategy:**

        **Phase 1: Evidence Gathering**
        Execute at least 5 of these TARGETED search queries on accessible search engines:
            {formatted_queries}
        
        For EACH piece of evidence found:
        - Note the SOURCE (website name and URL)
        - Note the TYPE (research_study, forum_post, news_article, review, survey)
        - Note the DATE if available (prioritize recent sources)
        - Extract key QUOTES that demonstrate the problem exists
        - Look for NUMBERS on frequency, severity, costs, or market size
        - Assess SOURCE CREDIBILITY (academic, industry report, major publication, etc.)

        **Phase 2: Problem Assessment**
        Based on the evidence, assess:
        - **EXISTENCE**: Does substantial evidence show this problem exists? (yes/no with confidence level)
        - **SEVERITY**: How painful is this problem on a scale of 1-10? (based on user complaints, impact descriptions)
        - **FREQUENCY**: How often do people encounter this problem on a scale of 1-10? (based on prevalence data)
        - **WILLINGNESS TO PAY**: What do people currently pay to solve it? (specific dollar amounts or ranges)
        - **MARKET SIZE**: How many people are affected? (estimates or data)

        **Phase 3: Alternative Solutions Analysis**
        Identify the top 2-3 CURRENT SOLUTIONS people use:
        - Name of the solution or approach
           - How it addresses the problem
        - Key limitations, complaints, or gaps users mention
        - Pricing if available

        **Phase 4: Problem Statement Evaluation**
        Analyze the problem statement itself:
        - Is it accurately describing the real problem?
        - Is it specific enough?
        - Does it capture the key pain points?
        - Suggestions for improvement

        **PREFERRED OUTPUT FORMAT (JSON):**
        ```json
        {{
          "problem_validation": {{
            "exists": true/false,
            "severity": 1-10,
            "frequency": 1-10,
            "willingness_to_pay": "dollar amount or range",
            "market_size_estimate": "number of affected people/businesses",
            "confidence_level": 1-10
          }},
          "evidence": [
            {{
              "source": "website name",
              "url": "full URL or 'Access restricted'",
              "type": "research_study/forum_post/news_article/review/survey",
              "date": "2023-05-12 or 'Date not found'",
              "credibility": "high/medium/low",
              "excerpt": "Exact quote showing the problem exists",
              "key_insight": "What this evidence tells us about the problem"
            }}
          ],
          "alternative_solutions": [
            {{
              "name": "Current solution name",
              "approach": "How they solve the problem",
              "limitations": ["Limitation 1", "Limitation 2"],
              "pricing": "Cost information if available"
            }}
          ],
          "problem_statement_feedback": {{
            "accuracy": "How well the statement captures the real problem",
            "specificity": "Whether it's specific enough",
            "improvements": "Suggestions for better problem statement"
          }},
          "confidence_score": 1-10,
          "research_limitations": [
            "Any access restrictions, CAPTCHAs, or data limitations encountered"
          ]
        }}
        ```

        **FALLBACK TEXT FORMAT (if JSON fails):**
        PROBLEM VALIDATION SUMMARY:
        Exists: [Yes/No]
        Severity: [1-10]
        Frequency: [1-10]
        Willingness to Pay: [$amount or range]
        Market Size: [estimate of affected population]
        Confidence Level: [1-10 based on quality and quantity of evidence]
        
        EVIDENCE:
        [Source 1]: [Type] ([Date] - [Credibility])
        - [Exact quote or statistic]
        - [Key insight about the problem]
        
        [Source 2]: [Type] ([Date] - [Credibility])
        - [Exact quote or statistic]
        - [Key insight about the problem]
        
        ALTERNATIVE SOLUTIONS:
        [Solution 1]: 
        - Approach: [How it solves the problem]
        - Limitations: [Key complaints or shortcomings]
        - Pricing: [Cost information]
        
        PROBLEM STATEMENT FEEDBACK:
        [Analysis of accuracy, specificity, and suggestions for improvement]

        RESEARCH LIMITATIONS:
        - [Any CAPTCHAs, blocked sites, or access restrictions encountered]
        """
    
    def _parse_validation_result(self, text):
        """Enhanced parsing with fallback mechanisms and improved structure"""
        try:
            # First try to extract JSON - this is cleaner if it works
            json_result = self._extract_json(text)
            if json_result and isinstance(json_result, dict) and "problem_validation" in json_result:
                print("Successfully extracted JSON result")
                return json_result
            
            print("JSON extraction failed, attempting text parsing...")
            
            # Initialize result structure
            result = {
                "problem_validation": {
                    "exists": None,
                    "severity": 0,
                    "frequency": 0,
                    "willingness_to_pay": None,
                    "market_size_estimate": None,
                    "confidence_level": 0
                },
                "evidence": [],
                "alternative_solutions": [],
                "problem_statement_feedback": "Research failed",
                "sources": [],
                "confidence_score": 0,
                "status": "success"
            }
            
            # Extract problem validation summary
            exists_match = re.search(r'Exists:\s*(Yes|No|True|False)', text, re.IGNORECASE)
            severity_match = re.search(r'Severity:\s*(\d+(?:\.\d+)?)', text)
            frequency_match = re.search(r'Frequency:\s*(\d+(?:\.\d+)?)', text)
            wtp_match = re.search(r'Willingness to Pay:\s*[^\n]*?\$?([^\n]+)', text)
            market_size_match = re.search(r'Market Size:\s*([^\n]+)', text)
            confidence_match = re.search(r'Confidence Level:\s*(\d+(?:\.\d+)?)', text)
            
            # Parse exists field
            if exists_match:
                exists_value = exists_match.group(1).lower()
                result["problem_validation"]["exists"] = exists_value in ["yes", "true"]
            
            # Parse numeric fields
            if severity_match:
                result["problem_validation"]["severity"] = float(severity_match.group(1))
            if frequency_match:
                result["problem_validation"]["frequency"] = float(frequency_match.group(1))
            if confidence_match:
                result["problem_validation"]["confidence_level"] = float(confidence_match.group(1))
                result["confidence_score"] = float(confidence_match.group(1))
            
            # Parse willingness to pay
            if wtp_match:
                wtp_value = wtp_match.group(1).strip()
                result["problem_validation"]["willingness_to_pay"] = wtp_value
            
            # Parse market size estimate
            if market_size_match:
                result["problem_validation"]["market_size_estimate"] = market_size_match.group(1).strip()
            
            # Extract evidence with improved pattern matching
            evidence_section = re.search(r'EVIDENCE:(.*?)(?:ALTERNATIVE SOLUTIONS:|PROBLEM STATEMENT|$)', text, re.DOTALL | re.IGNORECASE)
            if evidence_section:
                evidence_text = evidence_section.group(1)
                # Pattern: [Source]: [Type] ([Date] - [Credibility])
                evidence_pattern = r'([^:\[\n]+):\s*([^(]+)(?:\(([^-]+)\s*-\s*([^)]+)\))?'
                evidence_matches = re.findall(evidence_pattern, evidence_text)
                
                for match in evidence_matches:
                    source, type_info, date_info, credibility = match
                    source = source.strip()
                    
                    # Skip section headers
                    if any(header in source.upper() for header in ["EVIDENCE", "ALTERNATIVE", "PROBLEM"]):
                        continue
                    
                    # Extract quotes/insights for this source
                    source_section = re.search(rf'{re.escape(source)}:.*?(?=\n[^\s-]|\Z)', evidence_text, re.DOTALL)
                    quotes = []
                    key_insight = ""
                    
                    if source_section:
                        source_content = source_section.group(0)
                        quotes = re.findall(r'- ([^\n]+)', source_content)
                        # Take first quote as excerpt, second as insight if available
                        excerpt = quotes[0] if quotes else ""
                        key_insight = quotes[1] if len(quotes) > 1 else quotes[0] if quotes else ""
                    
                    result["evidence"].append({
                        "source": source,
                        "url": "",  # Not extracted from text format
                        "type": type_info.strip() if type_info else "unknown",
                        "date": date_info.strip() if date_info else None,
                        "credibility": credibility.strip() if credibility else "unknown",
                        "excerpt": excerpt,
                        "key_insight": key_insight
                    })
            
            # Extract alternative solutions with improved parsing
            alt_section = re.search(r'ALTERNATIVE SOLUTIONS:(.*?)(?:PROBLEM STATEMENT|$)', text, re.DOTALL | re.IGNORECASE)
            if alt_section:
                alt_text = alt_section.group(1).strip()
                
                # Format 1: Solution Name: format (actual current output)
                # Look for lines that end with colon and aren't detail fields
                solution_name_pattern = r'^([^:\n-]+):\s*$'
                solution_lines = alt_text.split('\n')
                
                current_solution = None
                for line in solution_lines:
                    line = line.strip()
                    if not line:
                        continue
                    
                    # Check if this is a solution name (ends with colon, not a detail field)
                    name_match = re.match(solution_name_pattern, line)
                    if name_match and not line.lower().startswith(('approach', 'limitation', 'pricing')):
                        # This is a new solution name
                        if current_solution:  # Save previous solution
                            result["alternative_solutions"].append(current_solution)
                        
                        current_solution = {
                            "name": name_match.group(1).strip(),
                            "approach": "",
                            "limitations": [],
                            "pricing": ""
                        }
                    
                    elif current_solution and line.startswith('- '):
                        # This is a detail line for the current solution
                        detail_line = line[2:].strip()  # Remove '- '
                        
                        if detail_line.lower().startswith('approach:'):
                            current_solution["approach"] = detail_line[9:].strip()
                        elif detail_line.lower().startswith('limitations:'):
                            lim_text = detail_line[12:].strip()
                            if lim_text and lim_text.lower() not in ['none', 'n/a', 'not found', 'not specified']:
                                current_solution["limitations"] = [lim_text]
                        elif detail_line.lower().startswith('pricing:'):
                            pricing_text = detail_line[8:].strip()
                            if pricing_text and pricing_text.lower() not in ['none', 'n/a', 'not found', 'not specified']:
                                current_solution["pricing"] = pricing_text
                
                # Don't forget to add the last solution
                if current_solution:
                    result["alternative_solutions"].append(current_solution)
                
                # Format 2: [Solution X]: Solution Name format (fallback)
                if not result["alternative_solutions"]:
                    solution_pattern = r'\[Solution \d+\]:\s*([^\n]+)'
                    solution_matches = re.findall(solution_pattern, alt_text)
                    
                    if solution_matches:
                        # Process [Solution X]: format
                        solution_blocks = re.split(r'\[Solution \d+\]:', alt_text)[1:]  # Skip first empty element
                        
                        for i, block in enumerate(solution_blocks):
                            if i < len(solution_matches):
                                name = solution_matches[i].strip()
                                details = block.strip()
                                
                                # Extract details from the block
                                approach_match = re.search(r'[-\s]*Approach:\s*([^\n]+)', details, re.IGNORECASE)
                                limitations_match = re.search(r'[-\s]*Limitations:\s*([^\n]+)', details, re.IGNORECASE)
                                pricing_match = re.search(r'[-\s]*Pricing:\s*([^\n]+)', details, re.IGNORECASE)
                                
                                # Parse limitations
                                limitations = []
                                if limitations_match:
                                    lim_text = limitations_match.group(1).strip()
                                    if lim_text and lim_text.lower() not in ['none', 'n/a', 'not found']:
                                        # Handle list format or comma-separated
                                        if '[' in lim_text and ']' in lim_text:
                                            limitations = re.findall(r'"([^"]+)"', lim_text)
                                        elif ',' in lim_text:
                                            limitations = [lim.strip() for lim in lim_text.split(',')]
                                        else:
                                            limitations = [lim_text]
                                
                                result["alternative_solutions"].append({
                                    "name": name,
                                    "approach": approach_match.group(1).strip() if approach_match else "",
                                    "limitations": limitations,
                                    "pricing": pricing_match.group(1).strip() if pricing_match else ""
                                })
                
                # Format 3: **Solution Name** followed by details (fallback)
                if not result["alternative_solutions"] and '**' in alt_text:
                    solution_blocks = re.split(r'\*\*([^*]+)\*\*', alt_text)
                    if len(solution_blocks) > 1:
                        # Process **Solution Name** format
                        for i in range(1, len(solution_blocks), 2):
                            if i + 1 < len(solution_blocks):
                                name = solution_blocks[i].strip()
                                details = solution_blocks[i + 1].strip()
                                
                                # Skip if name is just formatting elements
                                if name.lower() in ['approach', 'limitations', 'pricing'] or name.startswith('-'):
                                    continue
                                
                                approach_match = re.search(r'(?:- )?Approach:\s*([^\n]+)', details, re.IGNORECASE)
                                limitations_match = re.search(r'(?:- )?Limitations:\s*([^\n]+)', details, re.IGNORECASE)
                                pricing_match = re.search(r'(?:- )?Pricing:\s*([^\n]+)', details, re.IGNORECASE)
                                
                                # Parse limitations
                                limitations = []
                                if limitations_match:
                                    lim_text = limitations_match.group(1).strip()
                                    if lim_text and lim_text.lower() not in ['none', 'n/a', 'not found']:
                                        # Handle list format or comma-separated
                                        if '[' in lim_text and ']' in lim_text:
                                            limitations = re.findall(r'"([^"]+)"', lim_text)
                                        elif ',' in lim_text:
                                            limitations = [lim.strip() for lim in lim_text.split(',')]
                                        else:
                                            limitations = [lim_text]
                                
                                result["alternative_solutions"].append({
                                    "name": name,
                                    "approach": approach_match.group(1).strip() if approach_match else "",
                                    "limitations": limitations,
                                    "pricing": pricing_match.group(1).strip() if pricing_match else ""
                                })
                
                # Format 4: Numbered list or simple list format (final fallback)
                if not result["alternative_solutions"]:
                    # Look for patterns like "1. Solution Name" or "- Solution Name"
                    solution_matches = re.findall(r'(?:^\d+\.|\-)\s*([^:\n]+)(?::([^\n]+))?', alt_text, re.MULTILINE)
                    
                    current_solution = None
                    for match in solution_matches:
                        name_part = match[0].strip()
                        description_part = match[1].strip() if match[1] else ""
                        
                        # Check if this is a solution name or a detail field
                        if name_part.lower().startswith(('approach', 'limitation', 'pricing')):
                            # This is a detail field for the current solution
                            if current_solution and name_part.lower().startswith('approach'):
                                current_solution["approach"] = description_part
                            elif current_solution and name_part.lower().startswith('limitation'):
                                if description_part:
                                    current_solution["limitations"] = [description_part]
                            elif current_solution and name_part.lower().startswith('pricing'):
                                current_solution["pricing"] = description_part
                        else:
                            # This is a new solution name
                            current_solution = {
                                "name": name_part,
                                "approach": description_part,
                                "limitations": [],
                                "pricing": ""
                            }
                            result["alternative_solutions"].append(current_solution)
                    
                    # Clean up any empty or invalid solutions
                    result["alternative_solutions"] = [
                        sol for sol in result["alternative_solutions"] 
                        if sol.get("name") and not sol["name"].lower().startswith(('-', 'approach', 'limitation', 'pricing'))
                    ]
            
            # Extract problem statement feedback
            feedback_section = re.search(r'PROBLEM STATEMENT FEEDBACK:(.*?)(?:RESEARCH LIMITATIONS|$)', text, re.DOTALL | re.IGNORECASE)
            if feedback_section:
                feedback_text = feedback_section.group(1).strip()
                if feedback_text:
                    result["problem_statement_feedback"] = feedback_text
            
            # Extract research limitations
            limitations_section = re.search(r'RESEARCH LIMITATIONS:(.*?)$', text, re.DOTALL | re.IGNORECASE)
            if limitations_section:
                limitations_text = limitations_section.group(1).strip()
                limitations = re.findall(r'- ([^\n]+)', limitations_text)
                result["research_limitations"] = limitations
            
            # Calculate a basic confidence score if not already set
            if result["confidence_score"] == 0:
                score = 0
                if result["problem_validation"]["exists"] is not None:
                    score += 2
                score += min(3, len(result["evidence"]))
                score += min(2, len(result["alternative_solutions"]))
                result["confidence_score"] = score
            
            return result
            
        except Exception as e:
            print(f"Error parsing validation result: {str(e)}")
            # Return a minimal error structure
            return {
                "status": "error",
                "error": f"Failed to parse validation result: {str(e)}",
                "problem_validation": {
                    "exists": None,
                    "severity": 0,
                    "frequency": 0,
                    "willingness_to_pay": None,
                    "market_size_estimate": None,
                    "confidence_level": 0
                },
                "evidence": [],
                "alternative_solutions": [],
                "problem_statement_feedback": "Parsing failed",
                "confidence_score": 0,
                "research_limitations": ["Failed to parse research results"]
            }
    
    def _extract_json(self, text):
        """Extract JSON from the response text with enhanced patterns and validation"""
        try:
            # First try JSON code blocks (most reliable)
            json_match = re.search(r'```(?:json)?\s*([\s\S]*?)\s*```', text)
            if json_match:
                try:
                    parsed_json = json.loads(json_match.group(1))
                    if self._validate_json_structure(parsed_json):
                        return parsed_json
                except json.JSONDecodeError:
                    pass
            
            # Next try to find raw JSON objects (with handling of triple backticks)
            json_match = re.search(r'(\{[\s\S]*?\})', text)
            if json_match:
                # Remove any backticks that might be part of the JSON
                json_str = json_match.group(1).replace('```', '')
                try:
                    parsed_json = json.loads(json_str)
                    if self._validate_json_structure(parsed_json):
                        return parsed_json
                except json.JSONDecodeError:
                    pass
            
            # Try with more flexible JSON finding (looking for problem_validation key)
            json_search = re.search(r'{[\s\S]*?"problem_validation"[\s\S]*?}', text)
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
                        parsed_json = json.loads(cleaned_json)
                        if self._validate_json_structure(parsed_json):
                            return parsed_json
                    except json.JSONDecodeError:
                        pass
            
            # If all JSON attempts fail, return None to trigger text parsing
            return None
            
        except Exception as e:
            print(f"JSON extraction error: {str(e)}")
            return None

    def _validate_json_structure(self, json_obj):
        """Validate that the JSON has the expected structure for problem validation"""
        if not isinstance(json_obj, dict):
            return False
        
        # Check for required top-level keys
        required_keys = ["problem_validation"]
        if not any(key in json_obj for key in required_keys):
            return False
        
        # Validate problem_validation structure if present
        if "problem_validation" in json_obj:
            pv = json_obj["problem_validation"]
            if not isinstance(pv, dict):
                return False
            
            # Check for at least some expected fields in problem_validation
            expected_pv_fields = ["exists", "severity", "frequency", "confidence_level"]
            if not any(field in pv for field in expected_pv_fields):
                return False
        
        return True

    def _check_cache(self, key):
        """Check if data exists in cache"""
        cache_dir = os.path.join(os.path.dirname(__file__), "cache")
        os.makedirs(cache_dir, exist_ok=True)
        
        cache_file = os.path.join(cache_dir, f"problem_validation_{key}.json")
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
        
        cache_file = os.path.join(cache_dir, f"problem_validation_{key}.json")
        with open(cache_file, "w") as f:
            json.dump(data, f)

    async def _generate_search_queries(self, business_idea, problem_statement, industry):
        """Generate specific search queries using LLM to find evidence for the problem"""
        try:
            llm = self.llm
            
            prompt = f"""
            Generate 6-8 specific search queries to research if this problem exists and validate its severity:
            
            Business Idea: {business_idea}
            Problem Statement: {problem_statement}
            Industry: {industry}
            
            Focus on generating queries that will find:
            1. Statistical evidence the problem exists
            2. Customer complaints and pain points
            3. Current spending on solutions
            4. Market research about this problem
            5. Forums and discussions about the problem
            6. News articles about the problem
            
            Guidelines:
            - Be specific to the exact problem, not just the industry
            - Include terms real customers would use
            - Mix academic/research queries with practical user queries
            - Include specific dollar amounts or cost-related terms
            - Focus on validation and evidence-gathering
            
            Return ONLY a Python list of strings, like:
            ["query 1", "query 2", "query 3", ...]
            
            Example for problem "difficulty finding reliable dog walkers":
            ["pet owners struggle finding reliable dog walkers statistics", "dog walking service complaints reviews", "how much do people pay dog walkers hourly rate", "unreliable pet sitter problems forum", "pet care market research dog walking", "dog owner survey pet care needs"]
            """
            
            response = llm.invoke(prompt)
            
            # Extract the list from the response
            import ast
            try:
                # Try to find and evaluate the list
                if isinstance(response, str):
                    response_text = response
                else:
                    response_text = response.content
                
                # Look for list pattern
                import re
                list_match = re.search(r'\[([^\]]+)\]', response_text, re.DOTALL)
                if list_match:
                    list_str = '[' + list_match.group(1) + ']'
                    queries = ast.literal_eval(list_str)
                    if isinstance(queries, list) and len(queries) > 0:
                        print(f"Generated {len(queries)} search queries for problem validation")
                        return queries
                        
            except Exception as e:
                print(f"Error parsing LLM response for search queries: {e}")
            
            # Fallback to generated queries if LLM fails
            return self._get_fallback_queries(business_idea, problem_statement, industry)
            
        except Exception as e:
            print(f"LLM search query generation failed: {e}")
            return self._get_fallback_queries(business_idea, problem_statement, industry)
    
    def _get_fallback_queries(self, business_idea, problem_statement, industry):
        """Generate fallback search queries if LLM generation fails"""
        return [
            f'"{problem_statement}" statistics',
            f'{industry} "{problem_statement}" problem',
            f'customers complain about "{problem_statement}"',
            f'how much do people pay to solve "{problem_statement}"',
            f'"{problem_statement}" market size',
            f'"{problem_statement}" forum discussion',
            f'{problem_statement} survey research',
            f'cost of {problem_statement} solutions'
        ]

    def _validate_and_enhance_result(self, result, business_idea, problem_statement, industry):
        """Validate and enhance the problem validation result with quality checks"""
        if not isinstance(result, dict):
            return result
        
        # Ensure all required fields exist with proper structure
        if "problem_validation" not in result:
            result["problem_validation"] = {
                "exists": None,
                "severity": 0,
                "frequency": 0,
                "willingness_to_pay": None,
                "market_size_estimate": None,
                "confidence_level": 0
            }
        
        # Validate evidence array
        if "evidence" not in result:
            result["evidence"] = []
        
        validated_evidence = []
        for evidence in result.get("evidence", []):
            if isinstance(evidence, dict) and evidence.get("source"):
                evidence_template = {
                    "source": evidence.get("source", ""),
                    "url": evidence.get("url", ""),
                    "type": evidence.get("type", "unknown"),
                    "date": evidence.get("date"),
                    "credibility": evidence.get("credibility", "unknown"),
                    "excerpt": evidence.get("excerpt", ""),
                    "key_insight": evidence.get("key_insight", "")
                }
                validated_evidence.append(evidence_template)
        
        result["evidence"] = validated_evidence
        
        # Validate alternative solutions
        if "alternative_solutions" not in result:
            result["alternative_solutions"] = []
        
        validated_solutions = []
        for solution in result.get("alternative_solutions", []):
            if isinstance(solution, dict) and solution.get("name"):
                solution_template = {
                    "name": solution.get("name", ""),
                    "approach": solution.get("approach", ""),
                    "limitations": solution.get("limitations", []),
                    "pricing": solution.get("pricing", "")
                }
                validated_solutions.append(solution_template)
        
        result["alternative_solutions"] = validated_solutions
        
        # Ensure problem statement feedback exists
        if "problem_statement_feedback" not in result:
            result["problem_statement_feedback"] = "No feedback provided"
        
        # Ensure research limitations exist
        if "research_limitations" not in result:
            result["research_limitations"] = []
        
        # Calculate confidence score based on evidence quality
        quality_score = 0
        
        # Evidence quality scoring (0-5 points)
        high_credibility_sources = [e for e in result["evidence"] if e.get("credibility") == "high"]
        medium_credibility_sources = [e for e in result["evidence"] if e.get("credibility") == "medium"]
        
        if len(high_credibility_sources) >= 2:
            quality_score += 3
        elif len(high_credibility_sources) >= 1:
            quality_score += 2
        elif len(medium_credibility_sources) >= 2:
            quality_score += 1
        
        # Evidence quantity (0-2 points)
        if len(result["evidence"]) >= 4:
            quality_score += 2
        elif len(result["evidence"]) >= 2:
            quality_score += 1
        
        # Alternative solutions analysis (0-2 points)
        if len(result["alternative_solutions"]) >= 2:
            quality_score += 2
        elif len(result["alternative_solutions"]) >= 1:
            quality_score += 1
        
        # Problem validation completeness (0-1 point)
        pv = result.get("problem_validation", {})
        if (pv.get("exists") is not None and 
            pv.get("severity", 0) > 0 and 
            pv.get("frequency", 0) > 0):
            quality_score += 1
        
        # Update confidence score (keep existing if higher)
        existing_score = result.get("confidence_score", 0)
        problem_confidence = result.get("problem_validation", {}).get("confidence_level", 0)
        result["confidence_score"] = max(existing_score, quality_score, problem_confidence)
        
        # Add quality metadata
        result["data_quality"] = {
            "total_evidence_sources": len(result["evidence"]),
            "high_credibility_sources": len(high_credibility_sources),
            "alternative_solutions_found": len(result["alternative_solutions"]),
            "analysis_completeness": quality_score / 10.0,  # Convert to 0-1 scale
            "evidence_types": list(set([e.get("type", "unknown") for e in result["evidence"]]))
        }
        
        # Add status field
        result["status"] = "success"
        
        return result

# For simple testing
async def test_problem_validation():
    service = ProblemValidationService()
    result = await service.validate_problem(
        "An app for finding dog walkers", 
        "difficulty finding reliable dog walkers",
        "Pet Services"
    )
    print(json.dumps(result, indent=2))

if __name__ == "__main__":
    import asyncio
    asyncio.run(test_problem_validation())