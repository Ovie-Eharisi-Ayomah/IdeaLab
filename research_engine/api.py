# api.py
import os
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

# Load API keys
openai_api_key = os.getenv("OPENAI_API_KEY")
anthropic_api_key = os.getenv("ANTHROPIC_API_KEY")

# Lazy initialization - services will be created only when needed
market_sizing = None
competition = None
problem = None

def get_market_sizing_service():
    global market_sizing
    if market_sizing is None:
        from research_modules.market_sizing import MarketSizingService
        market_sizing = MarketSizingService(
            openai_api_key=openai_api_key,
            anthropic_api_key=anthropic_api_key
        )
    return market_sizing

def get_competition_service():
    global competition
    if competition is None:
        from research_modules.competitive_analysis import CompetitiveAnalysisService
        competition = CompetitiveAnalysisService(
            openai_api_key=openai_api_key,
            anthropic_api_key=anthropic_api_key
        )
    return competition

def get_problem_service():
    global problem
    if problem is None:
        from research_modules.problem_validation import ProblemValidationService
        problem = ProblemValidationService(
            openai_api_key=openai_api_key,
            anthropic_api_key=anthropic_api_key
        )
    return problem

app = FastAPI()

@app.get("/health")
async def health_check():
    return {"status": "ok", "message": "Research Engine API is running"}

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
        result = await get_market_sizing_service().research_market_size(
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
        result = await get_competition_service().analyze_competition(
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
        result = await get_problem_service().validate_problem(
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