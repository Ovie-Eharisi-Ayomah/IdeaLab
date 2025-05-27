#!/usr/bin/env python3
"""
Browser Diagnostic Script
Tests different browser configurations to identify loading issues
"""

async def test_playwright_browser():
    """
    Test Playwright browser directly without browser-use wrapper
    """
    try:
        from playwright.async_api import async_playwright
        import asyncio
        
        print("🎭 Testing Pure Playwright...")
        
        async with async_playwright() as p:
            print("  📱 Launching browser...")
            browser = await p.chromium.launch(headless=False)
            
            print("  📄 Creating new page...")
            page = await browser.new_page()
            
            print("  🔗 Loading Google...")
            await page.goto("https://google.com", timeout=30000)
            
            print("  🔍 Getting page title...")
            title = await page.title()
            print(f"  ✅ Success! Title: {title}")
            
            print("  📸 Taking screenshot...")
            await page.screenshot(path="playwright_test.png")
            
            await browser.close()
            return True
            
    except Exception as e:
        print(f"  ❌ Playwright test failed: {str(e)}")
        return False

async def test_browser_use_minimal():
    """
    Test browser-use with absolutely minimal configuration
    """
    try:
        from browser_use import Browser, BrowserConfig
        from browser_use.browser.context import BrowserContextConfig
        import asyncio
        
        print("🧪 Testing Browser-Use Minimal...")
        
        # Absolutely minimal config
        browser_config = BrowserConfig(
            headless=False,
            disable_security=False,
            extra_chromium_args=[]
        )
        
        context_config = BrowserContextConfig(
            minimum_wait_page_load_time=0.5,
            wait_for_network_idle_page_load_time=1.0,
            maximum_wait_page_load_time=5.0
        )
        
        print("  📱 Creating browser...")
        browser = Browser(config=browser_config)
        
        print("  🌐 Creating browser context...")
        browser_context = await browser.new_context(config=context_config)
        
        print("  ✅ Browser-Use context created successfully!")
        print(f"  📝 Context type: {type(browser_context)}")
        
        print("  🧹 Cleaning up...")
        await browser_context.close()
        await browser.close()
        return True
        
    except Exception as e:
        print(f"  ❌ Browser-Use test failed: {str(e)}")
        import traceback
        print(f"  🔍 Full error: {traceback.format_exc()}")
        return False

async def test_browser_use_with_context():
    """
    Test browser-use with enhanced context configuration (like our modules use)
    """
    try:
        from browser_use import Browser, BrowserConfig
        from browser_use.browser.context import BrowserContextConfig
        
        print("🔧 Testing Browser-Use with Enhanced Context...")
        
        # Enhanced config like our modules use
        browser_config = BrowserConfig(
            headless=False,
            disable_security=True,
            extra_chromium_args=[
                '--no-sandbox',
                '--disable-dev-shm-usage'
            ]
        )
        
        context_config = BrowserContextConfig(
            minimum_wait_page_load_time=1.0,
            wait_for_network_idle_page_load_time=3.0,
            maximum_wait_page_load_time=45.0,
            browser_window_size={'width': 1280, 'height': 1100},
            user_agent='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        )
        
        print("  📱 Creating enhanced browser...")
        browser = Browser(config=browser_config)
        
        print("  🌐 Creating enhanced context...")
        browser_context = await browser.new_context(config=context_config)
        
        print("  ✅ Enhanced Browser-Use context created successfully!")
        print(f"  📝 Context type: {type(browser_context)}")
        
        print("  🧹 Cleaning up...")
        await browser_context.close()
        await browser.close()
        return True
        
    except Exception as e:
        print(f"  ❌ Enhanced Browser-Use test failed: {str(e)}")
        import traceback
        print(f"  🔍 Full error: {traceback.format_exc()}")
        return False

async def test_simple_agent():
    """
    Test a minimal Browser-Use Agent to see if it gets stuck
    """
    try:
        from browser_use import Agent, Browser, BrowserConfig
        from browser_use.browser.context import BrowserContextConfig
        from langchain_openai import ChatOpenAI
        import os
        
        print("🤖 Testing Simple Browser-Use Agent...")
        
        # Check for API key
        if not os.getenv("OPENAI_API_KEY"):
            print("  ⚠️  OPENAI_API_KEY not found, skipping agent test")
            return False
        
        # Minimal browser config
        browser_config = BrowserConfig(
            headless=False,
            disable_security=True,
            extra_chromium_args=['--no-sandbox']
        )
        
        context_config = BrowserContextConfig(
            minimum_wait_page_load_time=0.5,
            wait_for_network_idle_page_load_time=2.0,
            maximum_wait_page_load_time=10.0
        )
        
        browser = Browser(config=browser_config)
        browser_context = await browser.new_context(config=context_config)
        
        print("  🧠 Creating LLM...")
        llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.0)
        
        print("  🤖 Creating Agent...")
        agent = Agent(
            task="Go to google.com and tell me the page title. Don't get stuck on CAPTCHA or page loading issues.",
            llm=llm,
            browser_context=browser_context,
            use_vision=False  # Disable vision for speed
        )
        
        print("  🚀 Running agent (max 5 steps)...")
        history = await agent.run(max_steps=5)
        
        print(f"  ✅ Agent completed! Steps taken: {len(history)}")
        print(f"  📝 Final result: {history.final_result()}")
        
        await browser_context.close()
        await browser.close()
        return True
        
    except Exception as e:
        print(f"  ❌ Agent test failed: {str(e)}")
        import traceback
        print(f"  🔍 Full error: {traceback.format_exc()}")
        return False

async def check_system_requirements():
    """
    Check basic system requirements and dependencies
    """
    print("🔍 Checking System Requirements...")
    
    # Check Python version
    import sys
    print(f"  🐍 Python: {sys.version}")
    
    # Check browser-use
    try:
        import browser_use
        print(f"  📦 browser-use: Available")
    except ImportError as e:
        print(f"  ❌ browser-use: {e}")
        return False
    
    # Check Playwright
    try:
        import playwright
        print(f"  🎭 playwright: Available")
    except ImportError as e:
        print(f"  ❌ playwright: {e}")
        return False
    
    # Check LangChain
    try:
        from langchain_openai import ChatOpenAI
        print(f"  🦜 langchain-openai: Available")
    except ImportError as e:
        print(f"  ❌ langchain-openai: {e}")
        return False
    
    # Check environment variables
    import os
    openai_key = os.getenv("OPENAI_API_KEY")
    if openai_key:
        print(f"  🔑 OPENAI_API_KEY: Set ({openai_key[:8]}...)")
    else:
        print(f"  ⚠️ OPENAI_API_KEY: Not set")
    
    return True

async def run_all_diagnostics():
    """
    Run all diagnostic tests in sequence
    """
    print("=" * 60)
    print("🔍 BROWSER DIAGNOSTIC SUITE")
    print("=" * 60)
    
    # Check system requirements first
    print("\n🔧 SYSTEM CHECK")
    print("-" * 30)
    system_ok = await check_system_requirements()
    
    if not system_ok:
        print("\n❌ System requirements not met. Please fix and try again.")
        return
    
    print("\n🧪 BROWSER TESTS")
    print("-" * 30)
    
    # Test 1: Pure Playwright
    playwright_ok = await test_playwright_browser()
    
    # Test 2: Browser-Use Minimal
    browser_use_minimal_ok = await test_browser_use_minimal()
    
    # Test 3: Browser-Use with Context
    browser_use_context_ok = await test_browser_use_with_context()
    
    # Test 4: Simple Agent (only if previous tests work)
    agent_ok = False
    if browser_use_minimal_ok or browser_use_context_ok:
        agent_ok = await test_simple_agent()
    else:
        print("🤖 Skipping agent test due to browser-use failures")
    
    print("\n" + "=" * 60)
    print("📊 DIAGNOSTIC RESULTS")
    print("=" * 60)
    
    results = [
        ("Pure Playwright", playwright_ok),
        ("Browser-Use Minimal", browser_use_minimal_ok),
        ("Browser-Use Context", browser_use_context_ok),
        ("Simple Agent", agent_ok)
    ]
    
    for test_name, success in results:
        status = "✅" if success else "❌"
        print(f"{status} {test_name}")
    
    print("\n🔧 RECOMMENDATIONS:")
    print("-" * 30)
    
    if not playwright_ok:
        print("❌ Playwright itself is broken - reinstall: playwright install")
    elif not browser_use_minimal_ok and not browser_use_context_ok:
        print("❌ Browser-Use has fundamental issues:")
        print("   - Try: pip install --upgrade browser-use")
        print("   - Check for conflicting browser processes")
        print("   - Try headless=True mode")
    elif not agent_ok:
        print("⚠️ Browser works but Agent has issues:")
        print("   - Check OPENAI_API_KEY")
        print("   - Try simpler tasks")
        print("   - Check network connectivity")
    else:
        print("✅ All tests passed! Issue is likely in your specific configuration.")
        print("   - Check your browser configuration parameters")
        print("   - Try reducing max_steps or timeouts")
        print("   - Look for task-specific issues")

if __name__ == "__main__":
    import asyncio
    asyncio.run(run_all_diagnostics()) 