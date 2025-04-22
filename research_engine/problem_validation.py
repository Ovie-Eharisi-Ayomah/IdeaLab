# problem_validation.py - Fixed for ACTUAL browser-use API, not the fantasy one Claude thought existed
import json
import re
import asyncio
from typing import Dict, List, Any, Optional
from browser_use import Agent
from llm_provider import ResilientLLM

class ProblemValidationService:
    def __init__(self, openai_api_key=None, anthropic_api_key=None):
        self.llm_provider = ResilientLLM(
            openai_api_key=openai_api_key,
            anthropic_api_key=anthropic_api_key
        )
    
    async def validate_problem(self, business_idea, problem_statement, industry):
        """Validate problem with resilient LLM provider"""
        
        # Define the improved search task
        search_task = self._create_search_task(business_idea, problem_statement, industry)
        
        # Use our resilient LLM with fallback
        try:
            result = await self.llm_provider.with_fallback(
                self._run_browser_agent,
                search_task=search_task
            )
            
            # Parse the result using our more robust extraction
            parsed_result = self._parse_validation_result(result)
            
            # If extraction failed, try fallback JSON extraction
            if parsed_result.get("error"):
                fallback_result = self._extract_json(result)
                if "error" not in fallback_result:
                    return fallback_result
            
            return parsed_result
            
        except Exception as e:
            # Last resort fallback - return a structured error
            print(f"All LLM attempts failed: {str(e)}")
            return {
                "error": "Problem validation failed after multiple attempts",
                "problem_validation": {
                    "exists": None,
                    "severity": 0,
                    "frequency": 0,
                    "willingness_to_pay": 0,
                    "evidence": []
                },
                "confidence_score": 0
            }
    
    async def _run_browser_agent(self, llm, search_task):
        """Run browser agent with given LLM"""
        # No more 'headless' param - browser-use clearly decided that was too convenient
        agent = Agent(
            task=search_task, 
            llm=llm,
            save_conversation_path="logs/problem_validation"
        )
        
        # This returns an AgentHistoryList object, not a string
        # Because returning strings is so 2023, apparently
        history = await agent.run()
        
        # Extract the actual text result we need
        return history.final_result()
    
    def _create_search_task(self, business_idea, problem_statement, industry):
        """Create the search task prompt with specific queries and format"""
        return f"""
        Research if this problem exists: "{problem_statement}" in the {industry} industry.
        Context: This is for a business idea: {business_idea}
        
        SEARCH STRATEGY:
        1. Search for evidence using THESE EXACT queries (run at least 3 of these):
           - "{problem_statement} statistics"
           - "{industry} {problem_statement} problem"
           - "customers complain about {problem_statement}"
           - "how much do people pay to solve {problem_statement}"
           - "{problem_statement} market size"
           - "{problem_statement} forum discussion"
        
        2. For EACH piece of evidence found:
           - Note the SOURCE (website name)
           - Note the TYPE (research_study, forum, news, review)
           - Note the DATE if available
           - Extract key QUOTES that demonstrate the problem exists
           - Look for NUMBERS on frequency, severity, or costs
        
        3. Assess:
           - EXISTENCE: Does substantial evidence show this problem exists? (yes/no)
           - SEVERITY: How painful is this problem on a scale of 1-10?
           - FREQUENCY: How often do people encounter this problem on a scale of 1-10?
           - WILLINGNESS TO PAY: What do people currently pay to solve it? (dollar amount or range)
        
        4. For the top 2-3 ALTERNATIVE SOLUTIONS people currently use:
           - Name of the solution
           - How it addresses the problem
           - Key limitations or complaints users have
        
        FORMAT YOUR ANSWER EXACTLY LIKE THIS:
        
        PROBLEM VALIDATION SUMMARY:
        Exists: [Yes/No]
        Severity: [1-10]
        Frequency: [1-10]
        Willingness to Pay: [$amount or range]
        Confidence Level: [1-10 based on quality and quantity of evidence]
        
        EVIDENCE:
        [Source 1]: [Type] ([Date if available])
        - [Exact quote or statistic]
        - [Key insight]
        
        [Source 2]: [Type]
        - [Exact quote or statistic]
        - [Key insight]
        
        [Continue for all sources...]
        
        ALTERNATIVE SOLUTIONS:
        [Solution 1]: 
        - Approach: [How it solves the problem]
        - Limitations: [Key complaints or shortcomings]
        
        [Solution 2]:
        - Approach: [How it solves the problem]
        - Limitations: [Key complaints or shortcomings]
        
        PROBLEM STATEMENT FEEDBACK:
        [Analysis of how accurate/well-formulated the problem statement is]
        
        YOU CAN ALSO RETURN JSON IF YOU PREFER, WITH THIS STRUCTURE:
        {{
          "problem_validation": {{
            "exists": true/false,
            "severity": 1-10,
            "frequency": 1-10,
            "willingness_to_pay": "dollar amount or range",
            "confidence_level": 1-10,
            "evidence": [
              {{
                "type": "research_study/forum/news/review",
                "source": "source.com",
                "excerpt": "Quote showing the problem exists",
                "date": "2023-05-12"
              }}
            ]
          }},
          "alternative_solutions": [
            {{
              "name": "Existing solution",
              "approach": "How they solve it",
              "limitations": ["Limitation 1", "Limitation 2"]
            }}
          ],
          "problem_statement_feedback": "Analysis of how accurate the problem statement is"
        }}
        """
    
    def _parse_validation_result(self, text):
        """Enhanced parsing with fallback mechanisms"""
        try:
            # First try to extract JSON - this is cleaner if it works
            try:
                json_result = self._extract_json(text)
                if "error" not in json_result:
                    # Successfully parsed as JSON
                    return json_result
            except Exception as json_err:
                # JSON extraction failed, continue with text parsing
                print(f"JSON extraction attempted but failed: {str(json_err)}")
                pass
            
            # Print a snippet of what we're trying to parse
            print(f"Parsing from text. First 100 chars: {text[:100]}")
            
            # Extract summary metrics
            exists_match = re.search(r'Exists:\s*(Yes|No)', text, re.IGNORECASE)
            severity_match = re.search(r'Severity:\s*(\d+(?:\.\d+)?)', text)
            frequency_match = re.search(r'Frequency:\s*(\d+(?:\.\d+)?)', text)
            wtp_match = re.search(r'Willingness to Pay:\s*\$?([^\n]+)', text)
            confidence_match = re.search(r'Confidence Level:\s*(\d+(?:\.\d+)?)', text)
            
            # Extract evidence sources
            evidence_pattern = r'([^:\n]+):\s*([^(]+)(?:\(([^)]+)\))?\s*\n((?:- [^\n]+\n?)+)'
            evidence_blocks = re.findall(evidence_pattern, text, re.DOTALL)
            
            evidence = []
            for source, type_str, date, quote_block in evidence_blocks:
                # ADD THIS LINE HERE 👇
                if "PROBLEM VALIDATION SUMMARY" in source or source.strip() == "PROBLEM VALIDATION SUMMARY":
                    continue  # Skip summary section
                    
                if "ALTERNATIVE SOLUTIONS" in source or "PROBLEM STATEMENT" in source:
                    continue  # Skip non-evidence sections
                    
                source = source.strip()
                if not source or source.startswith("EVIDENCE"):
                    continue
                    
                quotes = re.findall(r'- ([^\n]+)', quote_block)
                evidence.append({
                    "source": source.strip(),
                    "type": type_str.strip(),
                    "date": date.strip() if date else None,
                    "quotes": quotes
                })
            
            # Extract alternative solutions
            alt_pattern = r'([^:\n]+):\s*\n- Approach:\s*([^\n]+)\n- Limitations:\s*([^\n]+)'
            alternative_blocks = re.findall(alt_pattern, text, re.DOTALL)
            
            alternatives = []
            for name, approach, limitations in alternative_blocks:
                name = name.strip()
                if not name or name == "ALTERNATIVE SOLUTIONS":
                    continue
                
                alternatives.append({
                    "name": name,
                    "approach": approach.strip(),
                    "limitations": limitations.strip()
                })
            
            # Extract problem statement feedback
            feedback_match = re.search(r'PROBLEM STATEMENT FEEDBACK:\s*([^\n]+(?:\n[^\n]+)*?)(?=\n\n|\Z)', text, re.DOTALL)
            feedback = feedback_match.group(1).strip() if feedback_match else ""
            
            # Clean up willingness to pay value
            wtp_value = wtp_match.group(1).strip() if wtp_match else None
            if wtp_value and wtp_value.startswith("$"):
                wtp_value = wtp_value[1:]
            
            # Assemble the result
            result = {
                "problem_validation": {
                    "exists": exists_match and exists_match.group(1).lower() == "yes",
                    "severity": float(severity_match.group(1)) if severity_match else None,
                    "frequency": float(frequency_match.group(1)) if frequency_match else None,
                    "willingness_to_pay": wtp_value,
                    "confidence_level": float(confidence_match.group(1)) if confidence_match else None,
                },
                "evidence": evidence,
                "alternative_solutions": alternatives,
                "problem_statement_feedback": feedback,
                "raw_text": text[:1000] + ("..." if len(text) > 1000 else "")
            }
            
            # Add default confidence if not found
            if not result["problem_validation"]["confidence_level"]:
                result["problem_validation"]["confidence_level"] = min(len(evidence) * 2, 10)
            
            return result
            
        except Exception as e:
            # Fallback for any parsing errors
            print(f"Error parsing validation result: {str(e)}")
            return {
                "error": f"Failed to parse validation result: {str(e)}",
                "raw_text": text[:1000] + ("..." if len(text) > 1000 else "")
            }
    
    def _extract_json(self, text):
        """Extract JSON from the response text with enhanced patterns"""
        try:
            # First try JSON code blocks (most reliable)
            json_match = re.search(r'```(?:json)?\s*([\s\S]*?)\s*```', text)
            if json_match:
                try:
                    return json.loads(json_match.group(1))
                except json.JSONDecodeError:
                    pass
            
            # Next try to find raw JSON objects (with handling of triple backticks)
            json_match = re.search(r'({[\s\S]*})', text)
            if json_match:
                # Remove any backticks that might be part of the JSON
                json_str = json_match.group(1).replace('```', '')
                try:
                    return json.loads(json_str)
                except json.JSONDecodeError:
                    pass
            
            # Try with more flexible JSON finding (ignoring other characters)
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
                        return json.loads(cleaned_json)
                    except json.JSONDecodeError:
                        pass
            
            # If all else fails, return the raw text
            return {
                "error": "Failed to extract valid JSON",
                "raw_text": text[:1000] + ("..." if len(text) > 1000 else "")
            }
            
        except Exception as e:
            return {
                "error": f"JSON extraction error: {str(e)}",
                "raw_text": text[:300] + "..."
            }

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