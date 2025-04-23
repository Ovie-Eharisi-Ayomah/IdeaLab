# save_research_data.py - FIXED VERSION
import asyncio
import json
import os
import sys
from datetime import datetime
from pathlib import Path

# --- Path Setup ---
# Get the directory of the current script
script_dir = os.path.dirname(os.path.abspath(__file__))
# Get the research_engine directory (one level up from script_dir)
research_engine_dir = os.path.dirname(script_dir)
# Get the project root directory (one level up from research_engine_dir)
project_root_dir = os.path.dirname(research_engine_dir)

# Add both research_engine and project root to sys.path
# This ensures imports work regardless of execution context
if research_engine_dir not in sys.path:
    sys.path.append(research_engine_dir)
if project_root_dir not in sys.path:
    sys.path.append(project_root_dir)
# --- End Path Setup ---

# Import ONLY Python-based services
from market_sizing import MarketSizingService
from competitive_analysis import CompetitiveAnalysisService
from problem_validation import ProblemValidationService

async def run_and_save_research(business_idea, industry, product_type, problem_statement=None, output_dir=None):
    """
    Run Python-based research services and save outputs as JSON files
    """
    print(f"\n🔬 RUNNING MARKET RESEARCH FOR: {business_idea}")
    print(f"Industry: {industry}")
    print(f"Product Type: {product_type}")
    
    # Create output directory if not provided
    if not output_dir:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        business_slug = business_idea.split()[0].lower()  # Just use first word for filename
        output_dir = f"./data/{business_slug}_{timestamp}"
        print(f"Warning: Output directory not provided, defaulting to {output_dir}")
    
    os.makedirs(output_dir, exist_ok=True)
    print(f"Results will be saved to: {output_dir}")
    
    # Initialize research services
    market_sizing = MarketSizingService()
    competition = CompetitiveAnalysisService()
    problem = ProblemValidationService()
    
    # Generate default problem statement if none provided
    if not problem_statement:
        problem_statement = f"difficulty finding or accessing {industry} {product_type}"
        print(f"Using default problem statement: '{problem_statement}'")
    
    # Create tasks to run in parallel
    print("\n⏳ Running market research services in parallel (this could take 30-60 seconds)...")
    print("    • Market sizing analysis")
    print("    • Competitive landscape analysis") 
    print("    • Problem validation research")
    
    tasks = [
        market_sizing.research_market_size(business_idea, industry, product_type),
        competition.analyze_competition(business_idea, industry, product_type),
        problem.validate_problem(business_idea, problem_statement, industry)
    ]
    
    # Run all tasks in parallel
    start_time = datetime.now()
    results = await asyncio.gather(*tasks, return_exceptions=True)
    end_time = datetime.now()
    
    print(f"\n✅ Research completed in {(end_time - start_time).total_seconds():.1f} seconds")
    
    # Process and save results
    market_data, comp_data, problem_data = results
    
    # Check if any tasks failed
    failed_tasks = []
    if isinstance(market_data, Exception):
        print(f"❌ Market sizing failed: {str(market_data)}")
        market_data = {"error": str(market_data)}
        failed_tasks.append("market_sizing")
    
    if isinstance(comp_data, Exception):
        print(f"❌ Competitive analysis failed: {str(comp_data)}")
        comp_data = {"error": str(comp_data)}
        failed_tasks.append("competitive_analysis")
    
    if isinstance(problem_data, Exception):
        print(f"❌ Problem validation failed: {str(problem_data)}")
        problem_data = {"error": str(problem_data)}
        failed_tasks.append("problem_validation")
    
    # Save inputs for reference
    inputs_data = {
        "business_idea": business_idea,
        "industry": industry,
        "product_type": product_type,
        "problem_statement": problem_statement,
        "timestamp": datetime.now().isoformat(),
        "failed_tasks": failed_tasks
    }
    
    # Save all outputs as JSON files
    files_saved = []
    files_saved.append(save_to_json(inputs_data, "inputs.json", output_dir))
    files_saved.append(save_to_json(market_data, "market_data.json", output_dir))
    files_saved.append(save_to_json(comp_data, "competition.json", output_dir))
    files_saved.append(save_to_json(problem_data, "problem.json", output_dir))
    
    # Print summary of data saved
    print("\n📁 RESEARCH DATA SAVED:")
    for f in files_saved:
        print(f"    • {os.path.basename(f)}")
    
    print(f"\nAll research data saved to {output_dir}")
    # Updated next steps message - segmentation is now done in JS
    print("\n🔀 NEXT STEPS:")
    print(f"1. Use the JS market sizing calculator with these files (ensure segmentation.json exists in the same dir): ")
    print(f"   node test_market_sizing_with_real_data.js {Path(output_dir)}/market_data.json {Path(output_dir)}/segmentation.json {Path(output_dir)}/problem.json {Path(output_dir)}/competition.json")
    
    return output_dir

def save_to_json(data, filename, output_dir):
    """Save data to JSON file and return the file path"""
    filepath = os.path.join(output_dir, filename)
    with open(filepath, 'w') as f:
        json.dump(data, f, indent=2)
    return filepath

if __name__ == "__main__":
    # Validate command line arguments
    if len(sys.argv) < 4:
        print("\n❌ ERROR: Missing required arguments")
        print("\nUsage: python save_research_data.py 'Your business idea' 'Industry' 'Product Type' ['Problem statement'] [output_directory]")
        print("\nExample:")
        print("python save_research_data.py 'A mobile app that connects dog owners with dog walkers' 'Pet Services' 'Mobile App' None ./output/dogwalkers_test")
        sys.exit(1)
    
    # Parse arguments
    business_idea = sys.argv[1]
    industry = sys.argv[2]
    product_type = sys.argv[3]
    problem_statement = sys.argv[4] if len(sys.argv) > 4 and sys.argv[4].lower() != 'none' else None
    output_dir_arg = sys.argv[5] if len(sys.argv) > 5 else None
    
    # Run the research
    asyncio.run(run_and_save_research(business_idea, industry, product_type, problem_statement, output_dir=output_dir_arg))