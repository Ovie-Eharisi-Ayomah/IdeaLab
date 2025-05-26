# api.py
import os
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv
from market_sizing import MarketSizingService
from competitive_analysis import CompetitiveAnalysisService
from problem_validation import ProblemValidationService

load_dotenv()

# Load API keys
openai_api_key = os.getenv("OPENAI_API_KEY")
anthropic_api_key = os.getenv("ANTHROPIC_API_KEY")

# Initialize services with both API keys
market_sizing = MarketSizingService(
    openai_api_key=openai_api_key,
    anthropic_api_key=anthropic_api_key
)
competition = CompetitiveAnalysisService(
    openai_api_key=openai_api_key,
    anthropic_api_key=anthropic_api_key
)
problem = ProblemValidationService(
    openai_api_key=openai_api_key,
    anthropic_api_key=anthropic_api_key
)

app = FastAPI()

class BusinessRequest(BaseModel):
    description: str
    industry: str
    product_type: str
    problem_statement: str = None  # Optional problem statement

class ProblemRequest(BaseModel):
    description: str
    industry: str
    problem_statement: str

@app.post("/market-size")
async def get_market_size(request: BusinessRequest):
    try:
        result = await market_sizing.research_market_size(
            request.description,
            request.industry,
            request.product_type
        )
        
        # Check if we got an error response
        if "error" in result and not result.get("market_data", {}).get("sources"):
            raise HTTPException(
                status_code=500, 
                detail=result.get("error", "Unknown error in market sizing")
            )
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/competition")
async def analyze_competition(request: BusinessRequest):
    try:
        result = await competition.analyze_competition(
            request.description,
            request.industry,
            request.product_type,
            request.problem_statement
        )
        
        # Check if we got an error response with no useful data
        if "error" in result and not result.get("competitors"):
            raise HTTPException(
                status_code=500, 
                detail=result.get("error", "Unknown error in competition analysis")
            )
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/problem-validation")
async def validate_problem(request: ProblemRequest):
    try:
        result = await problem.validate_problem(
            request.description,
            request.problem_statement,
            request.industry
        )
        
        # Check if we got an error response with no useful data
        if "error" in result and not result.get("problem_validation", {}).get("exists") is not None:
            raise HTTPException(
                status_code=500, 
                detail=result.get("error", "Unknown error in problem validation")
            )
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)