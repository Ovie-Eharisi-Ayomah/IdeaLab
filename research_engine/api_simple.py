# api_simple.py - Minimal working version
import os
from fastapi import FastAPI
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Research Engine API", version="1.0.0")

@app.get("/health")
async def health_check():
    return {
        "status": "ok", 
        "message": "Research Engine API is running",
        "version": "1.0.0"
    }

@app.get("/")
async def root():
    return {"message": "Welcome to Research Engine API"}

if __name__ == "__main__":
    import uvicorn
    print("Starting Research Engine API...")
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=False) 