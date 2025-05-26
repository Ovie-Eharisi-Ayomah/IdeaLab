#!/usr/bin/env python3
"""
Quick test to verify alternative solutions parsing fix
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from problem_validation import ProblemValidationService

def test_parsing_fix():
    """Test the parsing fix with actual browser output format"""
    
    # This is the ACTUAL output format from the user's current problem validation
    test_text = """
PROBLEM VALIDATION SUMMARY:
Exists: Yes
Severity: 8
Frequency: 8
Willingness to Pay: $100-$50,000
Market Size: Large, affecting many startups globally
Confidence Level: 9

EVIDENCE:
[Investopedia]: research_study (2025-05-12 - high)
- The U.S. Bureau of Labor Statistics estimates that over 20% of small businesses fail within the first year. Lack of Market Research is a contributing factor.

[Capsule CRM]: research_study (2024-07-11 - high)  
- Lack of market need is a primary reason small businesses fail, with 35% of startups failing due to no market demand.

ALTERNATIVE SOLUTIONS:
OpenVC:
- Approach: Engage with potential customers to understand current solutions.
- Limitations: May not capture all market nuances.
- Pricing: Not specified

Harvard Business School:
- Approach: Structured methodologies like writing down goals and conducting market research.
- Limitations: Time-consuming and resource-intensive.
- Pricing: Not specified

PROBLEM STATEMENT FEEDBACK:
- Accuracy: Accurately describes the real problem of unvalidated business ideas.
- Specificity: Specific enough to capture key pain points.
- Improvements: Consider emphasizing the role of technology in validation.

RESEARCH LIMITATIONS:
- None encountered during the research process.
"""

    # Initialize service
    service = ProblemValidationService()
    
    # Test the parsing
    print("Testing alternative solutions parsing fix with ACTUAL format...")
    result = service._parse_validation_result(test_text)
    
    # Check if alternative solutions were parsed correctly
    alt_solutions = result.get("alternative_solutions", [])
    
    print(f"\nParsed {len(alt_solutions)} alternative solutions:")
    
    for i, solution in enumerate(alt_solutions, 1):
        print(f"\n{i}. {solution.get('name', 'No name')}")
        print(f"   Approach: {solution.get('approach', 'No approach')}")
        print(f"   Limitations: {solution.get('limitations', [])}")
        print(f"   Pricing: {solution.get('pricing', 'No pricing')}")
    
    # Verify the expected solutions from the user's actual output
    expected_names = ["OpenVC", "Harvard Business School"]
    parsed_names = [sol.get('name', '') for sol in alt_solutions]
    
    print(f"\nExpected: {expected_names}")
    print(f"Parsed: {parsed_names}")
    
    if parsed_names == expected_names:
        print("✅ SUCCESS: Alternative solutions parsing is now working correctly!")
        return True
    else:
        print("❌ FAILURE: Alternative solutions parsing still has issues")
        print("Debug info:")
        print(f"Alt text extracted: {repr(result.get('debug_alt_text', 'Not found'))}")
        return False

if __name__ == "__main__":
    test_parsing_fix() 