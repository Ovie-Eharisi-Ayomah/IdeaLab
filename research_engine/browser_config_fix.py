#!/usr/bin/env python3
"""
Browser Configuration Fix
Updated based on official Browser-Use documentation to prevent stuck processes
"""

def get_enhanced_browser_config():
    """
    Returns browser configuration based on official documentation
    Including enhanced context config as default for new contexts
    """
    from browser_use.browser.context import BrowserContextConfig
    
    return {
        'headless': True,  # Run headless to avoid page loading issues
        'disable_security': True,  # This is recommended in docs for functionality
        'extra_chromium_args': [
            '--no-sandbox',  # Essential for many environments
            '--disable-dev-shm-usage',  # Essential for Docker/CI
        ],
        'new_context_config': BrowserContextConfig(**get_enhanced_context_config())  # Apply our enhanced context settings as default
    }

def get_enhanced_context_config():
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

def get_enhanced_agent_config():
    """
    Returns agent configuration based on official documentation
    """
    return {
        'max_steps': 30,  # Reduced from 60 to prevent infinite loops
        'step_timeout': 30,  # 30 seconds per step
        'use_vision': True  # Enable vision capabilities by default
    }

# Create a test function that can be run without getting stuck
async def test_browser_config():
    """
    Test the enhanced browser configuration
    """
    try:
        from browser_use import Agent, Browser, BrowserConfig
        from browser_use.browser.context import BrowserContextConfig
        from langchain_openai import ChatOpenAI
        import asyncio
        
        print("🧪 Testing Enhanced Browser Configuration...")
        
        # Create configurations based on official docs
        browser_config = BrowserConfig(**get_enhanced_browser_config())
        context_config = BrowserContextConfig(**get_enhanced_context_config())
        agent_config = get_enhanced_agent_config()
        
        # Create browser with timeout
        browser = Browser(config=browser_config)
        
        try:
            # Test with a simple task and timeout
            llm = ChatOpenAI(model="gpt-4o", temperature=0)  
            
            browser_context = await browser.new_context(config=context_config)
            
            agent = Agent(
                task="Go to google.com and tell me the page title",
                llm=llm,
                browser_context=browser_context,
                use_vision=agent_config['use_vision']
            )
            
            print("✅ Agent created successfully")
            
            # Run with timeout
            result = await asyncio.wait_for(
                agent.run(max_steps=agent_config['max_steps']), 
                timeout=60
            )
            print("✅ Agent run completed successfully")
            print(f"📄 Result: {result.final_result()}")
            
        finally:
            await browser.close()
            print("✅ Browser closed successfully")
            
        return True
        
    except Exception as e:
        print(f"❌ Browser test failed: {str(e)}")
        return False

if __name__ == "__main__":
    import asyncio
    asyncio.run(test_browser_config()) 