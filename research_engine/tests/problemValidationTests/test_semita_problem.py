# test_obvious_problem.py
import asyncio
import json
import sys
import os

# Add the parent directory to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from problem_validation import ProblemValidationService


async def test_semita_problem():
    service = ProblemValidationService()
    
    print("\n=== TESTING PROBLEM VALIDATION ===\n")
    print("A browser window will open. Please don't interfere with it.")
    
    # This is a problem that clearly exists - should be an easy test
    result = await service.validate_problem(
        business_idea="An AI-powered tool that validates business ideas by analyzing market size, competition, and demand",
        problem_statement="Entrepreneurs and startup founders waste months building products without validating market demand first, leading to 90% of startups failing due to lack of market need",
        industry="Business Services"
    )
    
    print("\n=== PROBLEM VALIDATION RESULTS ===\n")
    print(json.dumps(result, indent=2))
    
    # Check if we got a legit result or an error
    if "error" in result:
        print(f"🚨 TEST FAILED: Got error: {result['error']}")
        sys.exit(1)
    
    # Basic sanity checks
    if result["problem_validation"]["exists"] is not None:
        if result["problem_validation"]["exists"] == True:
            print("✅ Test passed: Problem exists")
        else:
            print("⚠️ Unexpected result: System says problem doesn't exist")
    else:
        print("🚨 TEST FAILED: Couldn't determine if problem exists")
        sys.exit(1)
        
    # Print key stats
    if result["problem_validation"]["severity"]:
        print(f"📊 Severity: {result['problem_validation']['severity']}/10")
    
    if result["problem_validation"]["frequency"]:
        print(f"📊 Frequency: {result['problem_validation']['frequency']}/10")
        
    if result["problem_validation"]["willingness_to_pay"]:
        print(f"💰 WTP: {result['problem_validation']['willingness_to_pay']}")
    
    if result["evidence"]:
        print(f"📚 Evidence count: {len(result['evidence'])}")
    
    if result["alternative_solutions"]:
        print(f"🔀 Alternative solutions found: {len(result['alternative_solutions'])}")
    
    print("\n=== TEST COMPLETED SUCCESSFULLY ===\n")

if __name__ == "__main__":
    asyncio.run(test_obvious_problem())