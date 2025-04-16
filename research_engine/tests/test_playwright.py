# test_playwright.py
import asyncio
from playwright.async_api import async_playwright

async def test_playwright():
    print("Testing direct Playwright functionality...")
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        context = await browser.new_context()
        page = await context.new_page()
        
        try:
            print("Navigating to Wikipedia...")
            await page.goto("https://www.wikipedia.org")
            title = await page.title()
            print(f"Page title: {title}")
            
            # Take a screenshot for verification
            await page.screenshot(path="wikipedia_screenshot.png")
            print("Screenshot saved to wikipedia_screenshot.png")
            
            content = await page.content()
            print(f"Page content length: {len(content)} characters")
            
            await asyncio.sleep(3)  # Give time to visually verify
            
        finally:
            await browser.close()
            print("Browser closed")

if __name__ == "__main__":
    asyncio.run(test_playwright())
  