# problem_validation.py
import json
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
        
        # Define the search task
        search_task = self._create_search_task(business_idea, problem_statement, industry)
        
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
        agent = Agent(
            task=search_task, 
            llm=llm,
            headless=True,
            enable_screenshot=True
        )
        return await agent.run()
    
    def _create_search_task(self, business_idea, problem_statement, industry):
        """Create the search task prompt"""
        return f"""
        Validate if this problem actually exists and how severe it is:
        Business idea: {business_idea}
        Problem statement: "{problem_statement}"
        Industry: {industry}
        
        SEARCH STRATEGY:
        1. Search for evidence of this problem using queries like:
           - "{problem_statement} statistics"
           - "{industry} pain points"
           - "challenges with {industry}"
        2. Look for:
           - Survey data or research studies 
           - Forum discussions where people complain about this problem
           - News articles discussing the problem
           - Existing solutions and their limitations
        3. Assess:
           - How frequently the problem occurs
           - How painful the problem is
           - Who experiences this problem most acutely
           - How much people would pay to solve it
        
        FORMAT ALL RESULTS IN THIS EXACT JSON STRUCTURE:
        {{
          "problem_validation": {{
            "exists": true/false,
            "severity": 1-10,
            "frequency": 1-10,
            "willingness_to_pay": 1-10,
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
          "problem_statement_feedback": "Analysis of how accurate the problem statement is",
          "confidence_score": 7
        }}
        """
    
    # Same JSON extraction logic
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