# llm_provider.py - Our resilient LLM provider

import os
import time
import random
from pathlib import Path
from dotenv import load_dotenv
from langchain_anthropic import ChatAnthropic
from langchain_openai import ChatOpenAI
from typing import Dict, Any, Optional, List, Union

# Load environment variables from .env file
project_root = Path(__file__).parent.parent
load_dotenv(project_root / ".env")

class ResilientLLM:
    """Resilient LLM provider with fallback capabilities"""
    
    def __init__(self, 
                 openai_api_key: Optional[str] = None, 
                 anthropic_api_key: Optional[str] = None,
                 max_retries: int = 3,
                 retry_delay: int = 2):
        
        # First try constructor args, then environment variables
        self.openai_api_key = openai_api_key or os.getenv("OPENAI_API_KEY")
        self.anthropic_api_key = anthropic_api_key or os.getenv("ANTHROPIC_API_KEY")
        self.max_retries = max_retries
        self.retry_delay = retry_delay
        
        # Initialize primary model
        self.primary_llm = self._init_openai()
        
        # Initialize fallback model
        self.fallback_llm = self._init_anthropic()
    
    def _init_openai(self) -> ChatOpenAI:
        """Initialize OpenAI LLM"""
        if not self.openai_api_key:
            raise ValueError("OpenAI API key is required")
        
        return ChatOpenAI(
            model="gpt-4o",
            temperature=0.1,
            max_tokens=4000,
            api_key=self.openai_api_key
        )
    
    def _init_anthropic(self) -> ChatAnthropic:
        """Initialize Anthropic LLM as fallback"""
        if not self.anthropic_api_key:
            raise ValueError("Anthropic API key is required for fallback")
        
        return ChatAnthropic(
            model="claude-3-5-sonnet-20240620",
            temperature=0.3,
            api_key=self.anthropic_api_key
        )
    
    async def get_llm(self, fallback: bool = False):
        """Get LLM instance (primary or fallback)"""
        if fallback and self.fallback_llm:
            return self.fallback_llm
        return self.primary_llm
    
    async def with_fallback(self, func, *args, **kwargs):
        """Run a function with fallback if it fails"""
        exceptions = []
        
        # Try with primary LLM
        for attempt in range(self.max_retries):
            try:
                return await func(self.primary_llm, *args, **kwargs)
            except Exception as e:
                exceptions.append(f"Primary LLM attempt {attempt+1} failed: {str(e)}")
                
                # Only sleep if we're going to retry
                if attempt < self.max_retries - 1:
                    # Exponential backoff with jitter
                    delay = (2 ** attempt) * self.retry_delay + random.uniform(0, 1)
                    print(f"Retrying in {delay:.2f} seconds...")
                    time.sleep(delay)
        
        # If we get here, all primary attempts failed
        print("Primary LLM failed, falling back to secondary LLM")
        
        # Try with fallback LLM
        for attempt in range(self.max_retries):
            try:
                if not self.fallback_llm:
                    raise ValueError("No fallback LLM available")
                    
                return await func(self.fallback_llm, *args, **kwargs)
            except Exception as e:
                exceptions.append(f"Fallback LLM attempt {attempt+1} failed: {str(e)}")
                
                # Only sleep if we're going to retry
                if attempt < self.max_retries - 1:
                    delay = (2 ** attempt) * self.retry_delay + random.uniform(0, 1)
                    print(f"Retrying fallback in {delay:.2f} seconds...")
                    time.sleep(delay)
        
        # If we get here, both primary and fallback failed
        error_msg = "All LLM attempts failed:\n" + "\n".join(exceptions)
        raise Exception(error_msg)