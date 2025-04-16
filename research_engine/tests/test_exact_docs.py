# test_exact_docs.py
from langchain_openai import ChatOpenAI
from browser_use import Agent
from dotenv import load_dotenv
import asyncio

load_dotenv()

async def main():
    # Following browser-use docs exactly
    llm = ChatOpenAI(model="gpt-4o")
    
    agent = Agent(
        task="Go to Wikipedia and tell me the title of the page",
        llm=llm,
    )
    
    print("Running agent...")
    result = await agent.run()
    print("Agent completed")
    print(result)

if __name__ == "__main__":
    asyncio.run(main())