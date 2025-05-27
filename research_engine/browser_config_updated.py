#!/usr/bin/env python3
"""
Updated Browser Configuration
Based on official Browser-Use documentation to fix step 1 infinite loops
"""

def get_minimal_browser_config():
    """
    Returns minimal browser configuration based on official docs
    """
    return {
        # 'headless': False,  # Keep visible for debugging as per docs recommendation
        'disable_security': True,  # This is recommended in docs for functionality
        'extra_chromium_args': [
            '--no-sandbox',  # Essential for many environments
            '--disable-dev-shm-usage',  # Essential for Docker/CI
        ]
    }

def get_recommended_context_config():
    """
    Returns context configuration based on official documentation
    """
    return {
        'minimum_wait_page_load_time': 0.5,  # Official default
        'wait_for_network_idle_page_load_time': 1.0,  # Official default  
        'maximum_wait_page_load_time': 5.0,  # Official default
        'browser_window_size': {'width': 1280, 'height': 1100},  # Official optimized size
        'highlight_elements': True,  # Official default - helps with debugging
        'viewport_expansion': 500,  # Official default
    }

def get_docs_based_agent_config():
    """
    Returns agent configuration based on official documentation
    """
    return {
        'max_steps': 60,  # Our requirement
        'use_vision': True,  # Official default - recommended for better interaction
    }

# Test function using official patterns from docs
async def test_docs_based_config():
    """
    Test configuration using patterns from official documentation
    """
    try:
        from browser_use import Agent, Browser, BrowserConfig
        from browser_use.browser.context import BrowserContextConfig
        from langchain_openai import ChatOpenAI
        import asyncio
        
        print("🧪 Testing Documentation-Based Configuration...")
        
        # Use official patterns
        browser_config = BrowserConfig(**get_minimal_browser_config())
        context_config = BrowserContextConfig(**get_recommended_context_config())
        agent_config = get_docs_based_agent_config()
        
        # Initialize LLM as shown in docs
        llm = ChatOpenAI(model="gpt-4o", temperature=0.0)
        
        # Create browser
        browser = Browser(config=browser_config)
        
        try:
            # Create context as shown in docs
            browser_context = await browser.new_context(config=context_config)
            
            # Create agent following docs pattern
            agent = Agent(
                task="Go to google.com, search for 'Browser-Use', and tell me the first result title",
                llm=llm,
                browser_context=browser_context,
                use_vision=agent_config['use_vision']
            )
            
            print("✅ Agent created with documentation-based config")
            
            # Run with timeout
            print("🚀 Running agent with 2-minute timeout...")
            result = await asyncio.wait_for(
                agent.run(max_steps=agent_config['max_steps']), 
                timeout=120
            )
            
            print("✅ Agent completed successfully!")
            print(f"📄 Final result: {result.final_result()}")
            
            return True
            
        finally:
            await browser.close()
            print("✅ Browser closed")
            
    except asyncio.TimeoutError:
        print("⏰ Agent timed out after 2 minutes")
        return False
    except Exception as e:
        print(f"❌ Test failed: {str(e)}")
        import traceback
        print(f"🔍 Full error: {traceback.format_exc()}")
        return False

if __name__ == "__main__":
    import asyncio
    asyncio.run(test_docs_based_config()) 