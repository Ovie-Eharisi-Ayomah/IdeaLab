# test_basic_browseruse.py
import asyncio
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from browser_use import Agent, Browser, BrowserConfig

load_dotenv()

async def test_basic_browser():
    """Simple test for browser-use in development"""
    
    # Even simpler task with explicit instructions
    task = "Go to https://www.wikipedia.org and tell me the title of the main page."
    
    # Initialize LLM
    llm = ChatOpenAI(
        model="gpt-4o",
        temperature=0.1  # Lower temperature for more deterministic results
    )
    
    # Create browser configuration
    browser_config = BrowserConfig(
        headless=False,  # Show the browser window
        disable_security=True  # Disable security features for testing
    )
    
    # Create browser instance with our config
    browser = Browser(config=browser_config)
    
    # Create agent with browser
    agent = Agent(
        task=task,
        llm=llm,
        browser=browser,
        save_conversation_path="logs/dev_test"  # Save logs
    )
    
    # Run the agent
    print("Starting browser-use test...")
    
    try:
        # Increase max steps to give it more chances
        history = await agent.run(max_steps=10)
        
        # Print result
        print("\nFinal result:")
        result = history.final_result()
        print(result if result else "No result returned")
        
        # Print additional debugging information
        print("\nURLs visited:")
        print(history.urls())
        
        print("\nActions performed:")
        for action in history.action_names():
            print(f"- {action}")
            
        print("\nErrors encountered:")
        for error in history.errors():
            print(f"- {error}")
            
    except Exception as e:
        print(f"Error during browser-use test: {e}")
    finally:
        # Make sure we close the browser
        await browser.close()

if __name__ == "__main__":
    asyncio.run(test_basic_browser())