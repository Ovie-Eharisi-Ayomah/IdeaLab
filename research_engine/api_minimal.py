#!/usr/bin/env python3
"""
Minimal Research Engine API Server
Provides basic endpoints without browser automation dependencies
"""

import os
import asyncio
from datetime import datetime
from typing import Dict, Any, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI(title="Research Engine API", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request/Response Models
class BusinessIdeaRequest(BaseModel):
    business_idea: str
    problem_statement: Optional[str] = None

class AnalysisResponse(BaseModel):
    status: str
    message: str
    data: Optional[Dict[str, Any]] = None

# Mock data for testing
def create_mock_market_sizing(business_idea: str) -> Dict[str, Any]:
    """Create mock market sizing data"""
    return {
        "status": "complete",
        "tam": {
            "value": 50000000000,  # $50B
            "formatted": "$50.0B",
            "low": 35000000000,
            "high": 75000000000,
            "range": "$35.0B - $75.0B",
            "growth_rate": {"value": 12.5, "formatted": "12.5%"},
            "sources_count": 5,
            "outliers_count": 1
        },
        "sam": {
            "value": 15000000000,  # $15B
            "formatted": "$15.0B",
            "low": 10500000000,
            "high": 19500000000,
            "range": "$10.5B - $19.5B",
            "multipliers": {"geographic": 0.4, "segments": 0.9, "techAdoption": 0.85}
        },
        "som": {
            "value": 450000000,  # $450M
            "formatted": "$450.0M",
            "low": 225000000,
            "high": 900000000,
            "range": "$225.0M - $900.0M",
            "multipliers": {"newEntrant": 0.03, "marketingReach": 0.23, "conversion": 0.08}
        },
        "confidence_score": 7.5,
        "market_data": {
            "sources": [
                {
                    "source": "Industry Research Report 2024",
                    "market_size": "45",
                    "market_size_unit": "billion",
                    "market_size_formatted": "$45.0B",
                    "growth_rate": "12.0",
                    "projected_size": "55",
                    "projected_size_unit": "billion",
                    "projected_size_formatted": "$55.0B",
                    "year": "2024"
                }
            ],
            "confidence_score": 7.5
        }
    }

def create_mock_competition(business_idea: str) -> Dict[str, Any]:
    """Create mock competition data"""
    return {
        "status": "complete",
        "competitors": [
            {
                "name": "Market Leader Inc",
                "website": "https://marketleader.com",
                "products": ["Product A", "Product B"],
                "target_audience": "Enterprise customers",
                "pricing_model": "Subscription-based",
                "unique_selling_points": ["Advanced features", "24/7 support"],
                "market_position": "Market leader",
                "founded": "2015",
                "funding": "$100M Series C",
                "marketShare": 35,
                "strengths": ["Strong brand", "Large customer base"],
                "weaknesses": ["High pricing", "Complex setup"]
            },
            {
                "name": "Innovative Startup",
                "website": "https://innovativestartup.com",
                "products": ["Disruptive Solution"],
                "target_audience": "SMB customers",
                "pricing_model": "Freemium",
                "unique_selling_points": ["Easy to use", "Affordable"],
                "market_position": "Challenger",
                "founded": "2020",
                "funding": "$25M Series A",
                "marketShare": 15,
                "strengths": ["User-friendly", "Competitive pricing"],
                "weaknesses": ["Limited features", "Small team"]
            }
        ],
        "market_gaps": [
            "Mid-market segment underserved",
            "Mobile-first solutions lacking"
        ],
        "barriers_to_entry": [
            "High customer acquisition costs",
            "Regulatory compliance requirements"
        ],
        "emerging_trends": [
            "AI integration becoming standard",
            "Increased focus on data privacy"
        ],
        "market_concentration": "Moderately concentrated",
        "confidence_score": 8.0
    }

def create_mock_problem_validation(business_idea: str, problem_statement: str) -> Dict[str, Any]:
    """Create mock problem validation data"""
    return {
        "status": "complete",
        "problem_statement": problem_statement or f"Problem related to {business_idea}",
        "problem_validation": {
            "exists": True,
            "severity": 8,
            "frequency": 7,
            "severity_score": 8,
            "frequency_score": 7,
            "problem_validity_score": 7.5,
            "market_fit": "High",
            "willingness_to_pay": "Users willing to pay $50-200/month",
            "confidence_level": 7.8,
            "evidence": [
                {
                    "source": "Customer Survey 2024",
                    "type": "Survey",
                    "date": "2024-01-15",
                    "quotes": [
                        "This is a major pain point in our daily workflow",
                        "We spend 3-4 hours daily dealing with this issue"
                    ]
                }
            ],
            "alternative_solutions": [
                {
                    "name": "Manual Process",
                    "approach": "Time-consuming manual workaround",
                    "limitations": "Not scalable, error-prone"
                }
            ]
        }
    }

def create_mock_segmentation(business_idea: str) -> Dict[str, Any]:
    """Create mock segmentation data"""
    return {
        "status": "complete",
        "primarySegments": [
            {
                "name": "Enterprise Customers",
                "percentage": 45,
                "characteristics": {
                    "size": "1000+ employees",
                    "budget": "High",
                    "decision_process": "Complex"
                },
                "growthPotential": "High"
            },
            {
                "name": "SMB Customers",
                "percentage": 35,
                "characteristics": {
                    "size": "10-999 employees",
                    "budget": "Medium",
                    "decision_process": "Moderate"
                },
                "growthPotential": "Medium"
            },
            {
                "name": "Individual Users",
                "percentage": 20,
                "characteristics": {
                    "size": "1-9 employees",
                    "budget": "Low",
                    "decision_process": "Simple"
                },
                "growthPotential": "Low"
            }
        ],
        "segment_analysis": {
            "confidence_score": 7.2
        }
    }

def create_mock_recommendation(business_idea: str) -> Dict[str, Any]:
    """Create mock recommendation data"""
    return {
        "recommendation": "CONDITIONAL_GO",
        "score": 72,
        "confidence": 7.5,
        "reasoning": "Strong market opportunity with moderate competition. Key risks around customer acquisition costs need to be addressed.",
        "key_insights": [
            "Large addressable market with strong growth potential",
            "Clear problem validation from target customers",
            "Competitive landscape shows room for differentiation"
        ],
        "opportunities": [
            "Mid-market segment appears underserved",
            "Mobile-first approach could provide competitive advantage"
        ],
        "risks": [
            "High customer acquisition costs in this market",
            "Regulatory compliance may add complexity"
        ],
        "next_steps": [
            "Conduct deeper customer interviews",
            "Develop MVP focusing on mid-market segment",
            "Research regulatory requirements"
        ],
        "market_timing": {
            "assessment": "GOOD",
            "score": 75,
            "factors": ["Strong market growth", "Emerging technology trends"],
            "recommendation": "Market timing is favorable for entry"
        },
        "risk_adjusted_score": {
            "base_score": 72,
            "adjusted_score": 68,
            "risk_factors": ["Customer acquisition costs", "Regulatory complexity"],
            "confidence_impact": "MEDIUM"
        }
    }

@app.get("/")
async def root():
    """Health check endpoint"""
    return {"message": "Research Engine API is running", "status": "healthy"}

@app.post("/analyze/market-sizing")
async def analyze_market_sizing(request: BusinessIdeaRequest) -> AnalysisResponse:
    """Analyze market sizing for a business idea"""
    try:
        # Simulate processing time
        await asyncio.sleep(1)
        
        data = create_mock_market_sizing(request.business_idea)
        
        return AnalysisResponse(
            status="success",
            message="Market sizing analysis completed",
            data=data
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Market sizing analysis failed: {str(e)}")

@app.post("/analyze/competition")
async def analyze_competition(request: BusinessIdeaRequest) -> AnalysisResponse:
    """Analyze competition for a business idea"""
    try:
        # Simulate processing time
        await asyncio.sleep(1)
        
        data = create_mock_competition(request.business_idea)
        
        return AnalysisResponse(
            status="success",
            message="Competition analysis completed",
            data=data
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Competition analysis failed: {str(e)}")

@app.post("/analyze/problem-validation")
async def analyze_problem_validation(request: BusinessIdeaRequest) -> AnalysisResponse:
    """Analyze problem validation for a business idea"""
    try:
        # Simulate processing time
        await asyncio.sleep(1)
        
        data = create_mock_problem_validation(request.business_idea, request.problem_statement)
        
        return AnalysisResponse(
            status="success",
            message="Problem validation analysis completed",
            data=data
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Problem validation analysis failed: {str(e)}")

@app.post("/analyze/segmentation")
async def analyze_segmentation(request: BusinessIdeaRequest) -> AnalysisResponse:
    """Analyze customer segmentation for a business idea"""
    try:
        # Simulate processing time
        await asyncio.sleep(1)
        
        data = create_mock_segmentation(request.business_idea)
        
        return AnalysisResponse(
            status="success",
            message="Segmentation analysis completed",
            data=data
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Segmentation analysis failed: {str(e)}")

@app.post("/analyze/recommendation")
async def analyze_recommendation(request: BusinessIdeaRequest) -> AnalysisResponse:
    """Generate recommendation for a business idea"""
    try:
        # Simulate processing time
        await asyncio.sleep(1)
        
        data = create_mock_recommendation(request.business_idea)
        
        return AnalysisResponse(
            status="success",
            message="Recommendation analysis completed",
            data=data
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Recommendation analysis failed: {str(e)}")

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port) 