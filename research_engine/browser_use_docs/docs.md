# Browser Use Documentation

## Getting Started

### Introduction

Welcome to Browser Use - the easiest way to connect your AI agents with web browsers.

Browser Use enables AI agents to control web browsers through a powerful yet simple interface for browser automation. It makes websites accessible for AI agents, allowing them to interact with web content just like humans do.

> 💡 **Community**: If you've used Browser Use for your project, feel free to show it off in our [Discord community](https://discord.gg/browser-use)!

---

## Quick Start Guide

### Prerequisites

Browser Use requires **Python 3.11** or higher.

### Installation

#### 1. Set up Python Environment

We recommend using `uv` to set up your Python environment:

```bash
# Create virtual environment
uv venv --python 3.11

# Activate environment
# For Mac/Linux:
source .venv/bin/activate

# For Windows:
.venv\Scripts\activate
```

#### 2. Install Dependencies

```bash
# Install Browser Use
uv pip install browser-use

# Install Playwright browsers
uv run playwright install
```

### Basic Usage

#### 1. Create Your First Agent

Create a file called `agent.py`:

```python
from langchain_openai import ChatOpenAI
from browser_use import Agent
from dotenv import load_dotenv
import asyncio

# Load environment variables
load_dotenv()

# Initialize LLM
llm = ChatOpenAI(model="gpt-4o")

async def main():
    # Create agent
    agent = Agent(
        task="Compare the price of gpt-4o and DeepSeek-V3",
        llm=llm,
    )
    
    # Run the agent
    result = await agent.run()
    print(result)

# Run the agent
asyncio.run(main())
```

#### 2. Set Up API Keys

Create a `.env` file in your project root:

```bash
# OpenAI API Key (required for ChatOpenAI)
OPENAI_API_KEY=your-openai-api-key-here

# Anthropic API Key (if using Claude)
ANTHROPIC_API_KEY=your-anthropic-api-key-here
```

> 📚 **Note**: For other LLM models, refer to the [LangChain documentation](https://python.langchain.com/docs/integrations/chat/) for specific API key setup instructions.

---

## Customize

Supported Models
Guide to using different LangChain chat models with Browser Use

​
Overview
Browser Use supports various LangChain chat models. Here's how to configure and use the most popular ones. The full list is available in the LangChain documentation.

​
Model Recommendations
We have yet to test performance across all models. Currently, we achieve the best results using GPT-4o with an 89% accuracy on the WebVoyager Dataset. DeepSeek-V3 is 30 times cheaper than GPT-4o. Gemini-2.0-exp is also gaining popularity in the community because it is currently free. We also support local models, like Qwen 2.5, but be aware that small models often return the wrong output structure-which lead to parsing errors. We believe that local models will improve significantly this year.

All models require their respective API keys. Make sure to set them in your environment variables before running the agent.

​
Supported Models
All LangChain chat models, which support tool-calling are available. We will document the most popular ones here.

​
OpenAI
OpenAI's GPT-4o models are recommended for best performance.


Copy
from langchain_openai import ChatOpenAI
from browser_use import Agent

# Initialize the model
llm = ChatOpenAI(
    model="gpt-4o",
    temperature=0.0,
)

# Create agent with the model
agent = Agent(
    task="Your task here",
    llm=llm
)
Required environment variables:

.env

Copy
OPENAI_API_KEY=
​
Anthropic

Copy
from langchain_anthropic import ChatAnthropic
from browser_use import Agent

# Initialize the model
llm = ChatAnthropic(
    model_name="claude-3-5-sonnet-20240620",
    temperature=0.0,
    timeout=100, # Increase for complex tasks
)

# Create agent with the model
agent = Agent(
    task="Your task here",
    llm=llm
)
And add the variable:

.env

Copy
ANTHROPIC_API_KEY=
​
Azure OpenAI

Copy
from langchain_openai import AzureChatOpenAI
from browser_use import Agent
from pydantic import SecretStr
import os

# Initialize the model
llm = AzureChatOpenAI(
    model="gpt-4o",
    api_version='2024-10-21',
    azure_endpoint=os.getenv('AZURE_OPENAI_ENDPOINT', ''),
    api_key=SecretStr(os.getenv('AZURE_OPENAI_KEY', '')),
)

# Create agent with the model
agent = Agent(
    task="Your task here",
    llm=llm
)
Required environment variables:

.env

Copy
AZURE_OPENAI_ENDPOINT=https://your-endpoint.openai.azure.com/
AZURE_OPENAI_KEY=
​
Gemini
[!IMPORTANT] GEMINI_API_KEY was the old environment var name, it should be called GOOGLE_API_KEY as of 2025-05.


Copy
from langchain_google_genai import ChatGoogleGenerativeAI
from browser_use import Agent
from dotenv import load_dotenv

# Read GOOGLE_API_KEY into env
load_dotenv()

# Initialize the model
llm = ChatGoogleGenerativeAI(model='gemini-2.0-flash-exp')

# Create agent with the model
agent = Agent(
    task="Your task here",
    llm=llm
)
Required environment variables:

.env

Copy
GOOGLE_API_KEY=
​
DeepSeek-V3
The community likes DeepSeek-V3 for its low price, no rate limits, open-source nature, and good performance. The example is available here.


Copy
from langchain_deepseek import ChatDeepSeek
from browser_use import Agent
from pydantic import SecretStr
from dotenv import load_dotenv
import os

load_dotenv()
api_key = os.getenv("DEEPSEEK_API_KEY")

# Initialize the model
llm=ChatDeepSeek(base_url='https://api.deepseek.com/v1', model='deepseek-chat', api_key=SecretStr(api_key))

# Create agent with the model
agent = Agent(
    task="Your task here",
    llm=llm,
    use_vision=False
)
Required environment variables:

.env

Copy
DEEPSEEK_API_KEY=
​
DeepSeek-R1
We support DeepSeek-R1. Its not fully tested yet, more and more functionality will be added, like e.g. the output of it'sreasoning content. The example is available here. It does not support vision. The model is open-source so you could also use it with Ollama, but we have not tested it.


Copy
from langchain_deepseek import ChatDeepSeek
from browser_use import Agent
from pydantic import SecretStr
from dotenv import load_dotenv
import os

load_dotenv()
api_key = os.getenv("DEEPSEEK_API_KEY")

# Initialize the model
llm=ChatDeepSeek(base_url='https://api.deepseek.com/v1', model='deepseek-reasoner', api_key=SecretStr(api_key))

# Create agent with the model
agent = Agent(
    task="Your task here",
    llm=llm,
    use_vision=False
)
Required environment variables:

.env

Copy
DEEPSEEK_API_KEY=
​
Ollama
Many users asked for local models. Here they are.

Download Ollama from here
Run ollama pull model_name. Pick a model which supports tool-calling from here
Run ollama start

Copy
from langchain_ollama import ChatOllama
from browser_use import Agent
from pydantic import SecretStr


# Initialize the model
llm=ChatOllama(model="qwen2.5", num_ctx=32000)

# Create agent with the model
agent = Agent(
    task="Your task here",
    llm=llm
)
Required environment variables: None!

​
Novita AI
Novita AI is an LLM API provider that offers a wide range of models. Note: choose a model that supports function calling.


Copy
from langchain_openai import ChatOpenAI
from browser_use import Agent
from pydantic import SecretStr
from dotenv import load_dotenv
import os

load_dotenv()
api_key = os.getenv("NOVITA_API_KEY")

# Initialize the model
llm = ChatOpenAI(base_url='https://api.novita.ai/v3/openai', model='deepseek/deepseek-v3-0324', api_key=SecretStr(api_key))

# Create agent with the model
agent = Agent(
    task="Your task here",
    llm=llm,
    use_vision=False
)
Required environment variables:

.env

Copy
NOVITA_API_KEY=
​
X AI
X AI is an LLM API provider that offers a wide range of models. Note: choose a model that supports function calling.


Copy
from langchain_openai import ChatOpenAI
from browser_use import Agent
from pydantic import SecretStr
from dotenv import load_dotenv
import os

load_dotenv()
api_key = os.getenv("GROK_API_KEY")

# Initialize the model
llm = ChatOpenAI(
    base_url='https://api.x.ai/v1',
    model='grok-3-beta',
    api_key=SecretStr(api_key)
)

# Create agent with the model
agent = Agent(
    task="Your task here",
    llm=llm,
    use_vision=False
)
Required environment variables:

.env

Copy
GROK_API_KEY=
​
Coming soon
(We are working on it)

Groq
Github
Fine-tuned models

Agent Settings
Learn how to configure the agent

​
Overview
The Agent class is the core component of Browser Use that handles browser automation. Here are the main configuration options you can use when initializing an agent.

​
Basic Settings

Copy
from browser_use import Agent
from langchain_openai import ChatOpenAI

agent = Agent(
    task="Search for latest news about AI",
    llm=ChatOpenAI(model="gpt-4o"),
)
​
Required Parameters
task: The instruction for the agent to execute
llm: A LangChain chat model instance. See LangChain Models for supported models.
​
Agent Behavior
Control how the agent operates:


Copy
agent = Agent(
    task="your task",
    llm=llm,
    controller=custom_controller,  # For custom tool calling
    use_vision=True,              # Enable vision capabilities
    save_conversation_path="logs/conversation"  # Save chat logs
)
​
Behavior Parameters
controller: Registry of functions the agent can call. Defaults to base Controller. See Custom Functions for details.
use_vision: Enable/disable vision capabilities. Defaults to True.
When enabled, the model processes visual information from web pages
Disable to reduce costs or use models without vision support
For GPT-4o, image processing costs approximately 800-1000 tokens (~$0.002 USD) per image (but this depends on the defined screen size)
save_conversation_path: Path to save the complete conversation history. Useful for debugging.
override_system_message: Completely replace the default system prompt with a custom one.
extend_system_message: Add additional instructions to the default system prompt.
Vision capabilities are recommended for better web interaction understanding, but can be disabled to reduce costs or when using models without vision support.

​
Reuse Existing Browser Context
By default browser-use launches its own builtin browser using playwright chromium. You can also connect to a remote browser or pass any of the following existing playwright objects to the Agent: page, browser_context, browser, browser_session, or browser_profile.

These all get passed down to create a BrowserSession for the Agent:


Copy
agent = Agent(
    task='book a flight to fiji',
    llm=llm,
    browser_profile=browser_profile,  # use this profile to create a BrowserSession
    browser_session=BrowserSession(   # use an existing BrowserSession
      cdp_url=...,                      # remote CDP browser to connect to
      # or
      wss_url=...,                      # remote wss playwright server provider
      # or
      browser_pid=...                   # pid of a locally running browser process to attach to
      # or
      executable_path=...               # provide a custom chrome binary path
      # or
      channel=...                       # specify chrome, chromium, ms-edge, etc.
      # or
      page=page,                        # use an existing playwright Page object
      # or
      browser_context=browser_context,  # use an existing playwright BrowserContext object
      # or
      browser=browser,                  # use an existing playwright Browser object
    ),
)
For example, to connect to an existing browser over CDP you could do:


Copy
agent = Agent(
    ...
    browser_session=BrowserSession(cdp_url='http://localhost:9222'),
)
For example, to connect to a local running chrome instance you can do:


Copy
agent = Agent(
    ...
    browser_session=BrowserSession(browser_pid=1234),
)
See Connect to your Browser for more info.

You can reuse the same BrowserSession after an agent has completed running. If you do nothing, the browser will be automatically closed on run() completion only if it was launched by us.

​
Running the Agent
The agent is executed using the async run() method:

max_steps (default: 100) Maximum number of steps the agent can take during execution. This prevents infinite loops and helps control execution time.
​
Agent History
The method returns an AgentHistoryList object containing the complete execution history. This history is invaluable for debugging, analysis, and creating reproducible scripts.


Copy
# Example of accessing history
history = await agent.run()

# Access (some) useful information
history.urls()              # List of visited URLs
history.screenshots()       # List of screenshot paths
history.action_names()      # Names of executed actions
history.extracted_content() # Content extracted during execution
history.errors()           # Any errors that occurred
history.model_actions()     # All actions with their parameters
The AgentHistoryList provides many helper methods to analyze the execution:

final_result(): Get the final extracted content
is_done(): Check if the agent completed successfully
has_errors(): Check if any errors occurred
model_thoughts(): Get the agent's reasoning process
action_results(): Get results of all actions
For a complete list of helper methods and detailed history analysis capabilities, refer to the AgentHistoryList source code.

​
Run initial actions without LLM
With this example you can run initial actions without the LLM. Specify the action as a dictionary where the key is the action name and the value is the action parameters. You can find all our actions in the Controller source code.


Copy
initial_actions = [
	{'open_tab': {'url': 'https://www.google.com'}},
	{'open_tab': {'url': 'https://en.wikipedia.org/wiki/Randomness'}},
	{'scroll_down': {'amount': 1000}},
]
agent = Agent(
	task='What theories are displayed on the page?',
	initial_actions=initial_actions,
	llm=llm,
)
​
Run with message context
You can configure the agent and provide a separate message to help the LLM understand the task better.


Copy
from langchain_openai import ChatOpenAI

agent = Agent(
    task="your task",
    message_context="Additional information about the task",
    llm = ChatOpenAI(model='gpt-4o')
)
​
Run with planner model
You can configure the agent to use a separate planner model for high-level task planning:


Copy
from langchain_openai import ChatOpenAI

# Initialize models
llm = ChatOpenAI(model='gpt-4o')
planner_llm = ChatOpenAI(model='o3-mini')

agent = Agent(
    task="your task",
    llm=llm,
    planner_llm=planner_llm,           # Separate model for planning
    use_vision_for_planner=False,      # Disable vision for planner
    planner_interval=4                 # Plan every 4 steps
)
​
Planner Parameters
planner_llm: A LangChain chat model instance used for high-level task planning. Can be a smaller/cheaper model than the main LLM.
use_vision_for_planner: Enable/disable vision capabilities for the planner model. Defaults to True.
planner_interval: Number of steps between planning phases. Defaults to 1.
Using a separate planner model can help:

Reduce costs by using a smaller model for high-level planning
Improve task decomposition and strategic thinking
Better handle complex, multi-step tasks
The planner model is optional. If not specified, the agent will not use the planner model.

​
Optional Parameters
message_context: Additional information about the task to help the LLM understand the task better.
initial_actions: List of initial actions to run before the main task.
max_actions_per_step: Maximum number of actions to run in a step. Defaults to 10.
max_failures: Maximum number of failures before giving up. Defaults to 3.
retry_delay: Time to wait between retries in seconds when rate limited. Defaults to 10.
generate_gif: Enable/disable GIF generation. Defaults to False. Set to True or a string path to save the GIF.
​
Memory Management
Browser Use includes a procedural memory system using Mem0 that automatically summarizes the agent's conversation history at regular intervals to optimize context window usage during long tasks.


Copy
from browser_use.agent.memory import MemoryConfig

agent = Agent(
    task="your task",
    llm=llm,
    enable_memory=True,
    memory_config=MemoryConfig( # Ensure llm_instance is passed if not using default LLM config
        llm_instance=llm,      # Important: Pass the agent's LLM instance here
        agent_id="my_custom_agent",
        memory_interval=15
    )
)
​
Memory Parameters
enable_memory: Enable/disable the procedural memory system. Defaults to True.
memory_config: A MemoryConfig Pydantic model instance (required if enable_memory is True). Dictionary format is not supported.
​
Using MemoryConfig
You must configure the memory system using the MemoryConfig Pydantic model for a type-safe approach:


Copy
from browser_use.agent.memory import MemoryConfig
from langchain_openai import ChatOpenAI # Assuming llm is an instance of ChatOpenAI

llm_for_agent = ChatOpenAI(model="gpt-4o")

agent = Agent(
    task=task_description,
    llm=llm_for_agent,
    enable_memory=True, # This is True by default
    memory_config=MemoryConfig(
        llm_instance=llm_for_agent, # Pass the LLM instance for Mem0
        agent_id="my_agent",
        memory_interval=15, # Summarize every 15 steps
        embedder_provider="openai",
        embedder_model="text-embedding-3-large",
        embedder_dims=1536,
        # --- Vector Store Customization ---
        vector_store_provider="qdrant", # e.g., Qdrant, Pinecone, Chroma, etc.
        vector_store_collection_name="my_browser_use_memories", # Optional: custom collection name
        vector_store_config_override={ # Provider-specific config
            "host": "localhost",
            "port": 6333
            # Add other Qdrant specific configs here if needed, e.g., api_key for cloud
        }
    )
)
The MemoryConfig model provides these configuration options:

​
Memory Settings
agent_id: Unique identifier for the agent (default: "browser_use_agent"). Essential for persistent memory sessions if using a persistent vector store.
memory_interval: Number of steps between memory summarization (default: 10)
​
LLM Settings (for Mem0's internal operations)
llm_instance: The LangChain BaseChatModel instance that Mem0 will use for its internal summarization and processing. You must pass the same LLM instance used by the main agent, or another compatible one, here.
​
Embedder Settings
embedder_provider: Provider for embeddings ('openai', 'gemini', 'ollama', or 'huggingface')
embedder_model: Model name for the embedder
embedder_dims: Dimensions for the embeddings
​
Vector Store Settings
vector_store_provider: Choose the vector store backend. Supported options include: 'faiss' (default), 'qdrant', 'pinecone', 'supabase', 'elasticsearch', 'chroma', 'weaviate', 'milvus', 'pgvector', 'upstash_vector', 'vertex_ai_vector_search', 'azure_ai_search', 'lancedb', 'mongodb', 'redis', 'memory' (in-memory, non-persistent).
vector_store_collection_name: (Optional) Specify a custom name for the collection or index in your vector store. If not provided, a default name is generated (especially for local stores like FAISS/Chroma) or used by Mem0.
vector_store_base_path: Path for local vector stores like FAISS or Chroma (e.g., /tmp/mem0). Default is /tmp/mem0.
vector_store_config_override: (Optional) A dictionary to provide or override specific configuration parameters required by Mem0 for the chosen vector_store_provider. This is where you'd put connection details like host, port, api_key, url, environment, etc., for cloud-based or server-based vector stores.
The model automatically sets appropriate defaults based on the LLM being used:

For ChatOpenAI: Uses OpenAI's text-embedding-3-small embeddings
For ChatGoogleGenerativeAI: Uses Gemini's models/text-embedding-004 embeddings
For ChatOllama: Uses Ollama's nomic-embed-text embeddings
Default: Uses Hugging Face's all-MiniLM-L6-v2 embeddings
Important:

Always pass a properly constructed MemoryConfig object to the memory_config parameter.
Ensure the llm_instance is provided to MemoryConfig so Mem0 can perform its operations.
For persistent memory across agent runs or for shared memory, choose a scalable vector store provider (like Qdrant, Pinecone, etc.) and configure it correctly using vector_store_provider and vector_store_config_override. The default 'faiss' provider stores data locally in vector_store_base_path.
​
How Memory Works
When enabled, the agent periodically compresses its conversation history into concise summaries:

Every memory_interval steps, the agent reviews its recent interactions.
It uses Mem0 (configured with your chosen LLM and vector store) to create a procedural memory summary.
The original messages in the agent's active context are replaced with this summary, reducing token usage.
This process helps maintain important context while freeing up the context window for new information.
​
Disabling Memory
If you want to disable the memory system (for debugging or for shorter tasks), set enable_memory to False:


Copy
agent = Agent(
    task="your task",
    llm=llm,
    enable_memory=False
)
Disabling memory may be useful for debugging or short tasks, but for longer tasks, it can lead to context window overflow as the conversation history grows. The memory system helps maintain performance during extended sessions.

Browser Settings
Launch or connect to an existing browser and configure it to your needs.

Browser Use uses playwright (or patchright) to manage its connection with a real browser.

To launch or connect to a browser, pass any playwright / browser-use configuration arguments you want to BrowserSession(...):


Copy
from browser_use import BrowserSession, Agent

browser_session = BrowserSession(
    headless=True,
    viewport={'width': 964, 'height': 647},
    user_data_dir='~/.config/browseruse/profiles/default',
)
agent = Agent('fill out the form on this page', browser_session=browser_session)
The new BrowserSession & BrowserProfile accept all the same arguments that Playwright's launch_persistent_context(...) takes, giving you full control over browser settings at launch. (see below for the full list)

​
BrowserSession
🎭 BrowserSession(**params) is Browser Use's object that tracks a playwright connection to a running browser. It sets up:
the playwright library, browser and/or browser_context, and page objects and tracks which tabs the agent & human are focused on
methods to interact with the browser window, apply config needed by the Agent, and run the DOMService for element detection
it can take a browser_profile=BrowserProfile(...) template containing some config defaults, and **kwargs session-specific config overrides
​
Browser Connection Parameters
Provide any one of these options to connect to an existing browser. These options are session-specific and cannot be stored in a BrowserProfile(...) template.

​
wss_url

Copy
wss_url: str | None = None
WSS URL of the playwright-protocol browser server to connect to. See here for WSS connection instructions.

​
cdp_url

Copy
cdp_url: str | None = None
CDP URL of the browser to connect to (e.g. http://localhost:9222). See here for CDP connection instructions.

​
browser_pid

Copy
browser_pid: int | None = None
PID of a running chromium-based browser process to connect to on localhost. See here for connection via pid instructions.

For web scraping tasks on sites that restrict automated access, we recommend using our cloud or an external browser provider for better reliability. See the Connect to your Browser guide for detailed connection instructions.

​
Session-Specific Parameters
​
browser_profile

Copy
browser_profile: BrowserProfile = BrowserProfile()
Optional BrowserProfile template containing default config to use for the BrowserSession. (see below for more info)

​
playwright

Copy
playwright: Playwright | None = None
Optional playwright or patchright API client object to use, the result of (await async_playwright().start()) or (await async_patchright().start()). See here for more detailed usage instructions.

​
browser

Copy
browser: Browser | None = None
Playwright Browser object to use (optional). See here for more detailed usage instructions.

​
browser_context

Copy
browser_context: BrowserContext | None = None
Playwright BrowserContext object to use (optional). See here for more detailed usage instructions.

​
page aka agent_current_page

Copy
page: Page | None = None
Foreground Page that the agent is focused on, can also be passed as page=... as a shortcut. See here for more detailed usage instructions.

​
human_current_page

Copy
human_current_page: Page | None = None
Foreground Page that the human is focused on to start, usually not necessary to set manually.

​
initialized

Copy
initialized: bool = False
Mark BrowserSession as already initialized, skips launch/connection (not recommended)

​
**kwargs
BrowserSession can also accept all of the parameters below. (the parameters above this point are specific to BrowserSession and cannot be stored in a BrowserProfile template)

Extra **kwargs passed to BrowserSession(...) act as session-specific overrides to the BrowserProfile(...) template.


Copy
base_iphone13 = BrowserProfile(
    storage_state='/tmp/auth.json',     # share cookies between parallel browsers
    **playwright.devices['iPhone 13'],
    timezone_id='UTC',
)
usa_phone = BrowserSession(
    browser_profile=base_iphone13,
    timezone_id='America/New_York',     # kwargs override values in base_iphone13
)
eu_phone = BrowserSession(
    browser_profile=base_iphone13,
    timezone_id='Europe/Paris',
)

usa_agent = Agent(task='show me todays schedule...', browser_session=usa_phone)
eu_agent = Agent(task='show me todays schedule...', browser_session=eu_phone)
await asyncio.gather(agent1.run(), agent2.run())
​
BrowserProfile
A BrowserProfile is a 📋 config template for a 🎭 BrowserSession(...).

It's basically just a typed + validated version of a dict to hold config.

When you find yourself storing or re-using many browser configs, you can upgrade from:


Copy
- config = {key: val, key: val, ...}
- BrowserSession(**config)
To this instead:


Copy
+ config = BrowserProfile(key=val, key=val, ...)
+ BrowserSession(browser_profile=config)
You don't ever need to use a BrowserProfile, you can always pass config parameters directly to BrowserSession:


Copy
session = BrowserSession(headless=True, storage_state='auth.json', viewport={...}, ...)
BrowserProfile is optional, but it provides a number of benefits over a normal dict for holding config:

has type hints and pydantic field descriptions that show up in your IDE
validates config at runtime quickly without having to start a browser
provides helper methods to autodetect screen size, set up local paths, save/load config as json, and more…
BrowserProfiless are designed to easily be given 🆔 uuids and put in a database + made editable by users. BrowserSessions get their own 🆔 uuids and be linked by 🖇 foreign key to whatever BrowserProfiles they use.

This cleanly separates the per-connection rows from the bulky re-usable config and avoids wasting space in your db. This is useful because a user may only have 2 or 3 profiles, but they could have 100k+ sessions within a few months.

BrowserProfile and BrowserSession can both take any of the:

Playwright parameters
Browser-Use parameters (extra options we provide on top of playwright)
The only parameters BrowserProfile can NOT take are the session-specific connection parameters and live playwright objects:
cdp_url, wss_url, browser_pid, page, browser, browser_context, playwright, etc.

​
Basic Example

Copy
from browser_use.browser import BrowserProfile

profile = BrowserProfile(
    stealth=True,
    storage_state='/tmp/google_docs_cookies.json',
    allowed_domains=['docs.google.com', 'https://accounts.google.com'],
    viewport={'width': 396, 'height': 774},
    # ... playwright args / browser-use config args ...
)

phone1 = BrowserSession(browser_profile=profile, device_scale_factor=1)
phone2 = BrowserSession(browser_profile=profile, device_scale_factor=2)
phone3 = BrowserSession(browser_profile=profile, device_scale_factor=3)
​
Browser-Use Parameters
These parameters control Browser Use-specific features, and are outside the standard playwright set. They can be passed to BrowserSession(...) and/or stored in a BrowserProfile template.

​
keep_alive

Copy
keep_alive: bool | None = None
If True it wont close the browser after the first agent.run() ends. Useful for running multiple tasks with the same browser instance. If this is left as None and the Agent launched its own browser, the default is to close the browser after the agent completes. If the agent connected to an existing browser then it will leave it open.

​
stealth

Copy
stealth: bool = False
Set to True to use patchright to avoid bot-blocking. (Might cause issues with some sites, requires manual testing.)

​
allowed_domains

Copy
allowed_domains: list[str] | None = None
List of allowed domains for navigation. If None, all domains are allowed. Example: ['google.com', '*.wikipedia.org'] - Here the agent will only be able to access google.com exactly and wikipedia.org + *.wikipedia.org.

Glob patterns are supported:

['example.com'] ✅ will match only https://example.com/* exactly, subdomains will not be allowed. It's always the most secure to list all the domains you want to give the access to explicitly w/ schemes e.g. ['https://google.com', 'http*://www.google.com', 'https://myaccount.google.com', 'https://mail.google.com', 'https://docs.google.com']
['*.example.com'] ⚠️ CAUTION this will match https://example.com and all its subdomains. Make sure all the subdomains are safe for the agent! abc.example.com, def.example.com, …, useruploads.example.com, admin.example.com
​
disable_security

Copy
disable_security: bool = False
Completely disables all basic browser security features. Allows interacting across cross-site iFrames boundaries, but very INSECURE, don't visit untrusted URLs or use cookies.

​
deterministic_rendering

Copy
deterministic_rendering: bool = False
Enable deterministic rendering flags for consistent screenshots.

​
highlight_elements

Copy
highlight_elements: bool = True
Highlight interactive elements on the screen with colorful bounding boxes.

​
viewport_expansion

Copy
viewport_expansion: int = 500
Viewport expansion in pixels. With this you can control how much of the page is included in the context of the LLM:

-1: All elements from the entire page will be included, regardless of visibility (highest token usage but most complete).
0: Only elements which are currently visible in the viewport will be included.
500 (default): Elements in the viewport plus an additional 500 pixels in each direction will be included, providing a balance between context and token usage.
​
include_dynamic_attributes

Copy
include_dynamic_attributes: bool = True
Include dynamic attributes in selectors for better element targeting.

​
minimum_wait_page_load_time

Copy
minimum_wait_page_load_time: float = 0.25
Minimum time to wait before capturing page state for LLM input.

​
wait_for_network_idle_page_load_time

Copy
wait_for_network_idle_page_load_time: float = 0.5
Time to wait for network activity to cease. Increase to 3-5s for slower websites. This tracks essential content loading, not dynamic elements like videos.

​
maximum_wait_page_load_time

Copy
maximum_wait_page_load_time: float = 5.0
Maximum time to wait for page load before proceeding.

​
wait_between_actions

Copy
wait_between_actions: float = 0.5
Time to wait between agent actions.

​
cookies_file

Copy
cookies_file: str | None = None
JSON file path to save cookies to.

This option is DEPRECATED. Use storage_state instead, it's the standard playwright format and also supports localStorage!

Transfer any cookies from your existing cookies_file to the new JSON format:

cookies_file.json: [{cookie}, {cookie}, {cookie}]
⬇️ storage_state.json: {"cookies": [{cookie}, {cookie}, {cookie}], "origins": {... optional localstorage state ...}}

Or run playwright open https://example.com/ --save-storage=storage_state.json and log into any sites you need.

​
profile_directory

Copy
profile_directory: str = 'Default'
Chrome profile subdirectory name inside of your user_data_dir (e.g. Default, Profile 1, Work, etc.).

​
window_position

Copy
window_position: dict | None = {"width": 0, "height": 0}
Window position from top-left corner.

​
save_recording_path

Copy
save_recording_path: str | None = None
Directory path for saving video recordings.

​
trace_path

Copy
trace_path: str | None = None
Directory path for saving Agent trace files. Files are automatically named as {trace_path}/{context_id}.zip.

​
Playwright Launch Options
All the parameters below are standard playwright parameters and can be passed to both BrowserSession and BrowserProfile. They are defined in browser_use/browser/profile.py. See here for the official Playwright documentation for all of these options.

​
headless

Copy
headless: bool | None = None
Runs the browser without a visible UI. If None, auto-detects based on display availability.

​
channel

Copy
channel: BrowserChannel = 'chromium'
Browser channel: 'chromium', 'chrome', 'chrome-beta', 'chrome-dev', 'chrome-canary', 'msedge', 'msedge-beta', 'msedge-dev', 'msedge-canary'

Don't worry, other chromium-based browsers not in this list (e.g. brave) are still supported if you provide your own executable_path.

​
executable_path

Copy
executable_path: str | Path | None = None
Path to browser executable for custom installations.

​
user_data_dir

Copy
user_data_dir: str | Path | None = '~/.config/browseruse/profiles/default'
Directory for browser profile data. Set to None to use an ephemeral temporary profile (aka incognito mode).

Multiple running browsers cannot share a single user_data_dir at the same time. You must set it to None or provide a unique user_data_dir per-session if you plan to run multiple browsers.

The browser version run must always be equal to or greater than the version used to create the user_data_dir. If you see errors like Failed to parse Extensions or similar and failures when launching, you're attempting to run an older browser with an incompatible user_data_dir that's already been migrated to a newer schema version.

​
args

Copy
args: list[str] = []
Additional command-line arguments to pass to the browser. See here for the full list of available chrome launch options.

​
ignore_default_args

Copy
ignore_default_args: list[str] | bool = ['--enable-automation', '--disable-extensions']
List of default CLI args to stop playwright from including when launching chrome. Set it to True to disable all default options (not recommended).

​
env

Copy
env: dict[str, str] = {}
Extra environment variables to set when launching browser. e.g. {'DISPLAY': '1'} to use a specific X11 display.

​
chromium_sandbox

Copy
chromium_sandbox: bool = not IN_DOCKER
Whether to enable Chromium sandboxing (recommended for security). Should always be False when running inside Docker because Docker provides its own sandboxing can conflict with Chrome's.

​
devtools

Copy
devtools: bool = False
Whether to open DevTools panel automatically (only works when headless=False).

​
slow_mo

Copy
slow_mo: float = 0
Slow down actions by this many milliseconds.

​
timeout

Copy
timeout: float = 30000
Default timeout in milliseconds for connecting to a remote browser.

​
accept_downloads

Copy
accept_downloads: bool = True
Whether to automatically accept all downloads.

​
proxy

Copy
proxy: dict | None = None
Proxy settings. Example: {"server": "http://proxy.com:8080", "username": "user", "password": "pass"}.

​
permissions

Copy
permissions: list[str] = ['clipboard-read', 'clipboard-write', 'notifications']
Browser permissions to grant. See here for the full list of available permission.

​
storage_state

Copy
storage_state: str | Path | dict | None = None
Browser storage state (cookies, localStorage). Can be file path or dict. See here for the Playwright storage_state documentation on how to use it. This option is only applied when launching a new browser using the default builtin playwright chromium and user_data_dir=None is set.


Copy
# to create a storage state file, run the following and log into the sites you need once the browser opens:
playwright open https://example.com/ --save-storage=./storage_state.json
# then setup a BrowserSession with storage_state='./storage_state.json' and user_data_dir=None to use it
​
Playwright Timing Settings
These control how the browser waits for CDP API calls to complete and pages to load.

​
default_timeout

Copy
default_timeout: float | None = None
Default timeout for Playwright operations in milliseconds.

​
default_navigation_timeout

Copy
default_navigation_timeout: float | None = None
Default timeout for page navigation in milliseconds.

​
Playwright Viewport Options
Configure browser window size, viewport, and display properties:

​
user_agent

Copy
user_agent: str | None = None
Specific user agent to use in this context.

​
is_mobile

Copy
is_mobile: bool = False
Whether the meta viewport tag is taken into account and touch events are enabled.

​
has_touch

Copy
has_touch: bool = False
Specifies if viewport supports touch events.

​
geolocation

Copy
geolocation: dict | None = None
Geolocation coordinates. Example: {"latitude": 59.95, "longitude": 30.31667}

​
locale

Copy
locale: str | None = None
Specify user locale, for example en-GB, de-DE, etc. Locale will affect the navigator.language value, Accept-Language request header value as well as number and date formatting rules.

​
timezone_id

Copy
timezone_id: str | None = None
Timezone identifier (e.g., 'America/New_York').

​
window_size

Copy
window_size: dict | None = None
Browser window size for headful mode. Example: {"width": 1920, "height": 1080}

​
viewport

Copy
viewport: dict | None = None
Viewport size with width and height. Example: {"width": 1280, "height": 720}

​
no_viewport

Copy
no_viewport: bool | None = not headless
Disable fixed viewport. Content will resize with window.

Tip: don't use this parameter, it's a playwright standard parameter but it's redundant and only serves to override the viewport setting above. A viewport is always used in headless mode regardless of this setting, and is never used in headful mode unless you pass viewport={width, height} explicitly.

​
device_scale_factor

Copy
device_scale_factor: float | None = None
Device scale factor (DPI). Useful for high-resolution screenshots (set it to 2).

​
screen

Copy
screen: dict | None = None
Screen size available to browser. Auto-detected if not specified.

​
color_scheme

Copy
color_scheme: ColorScheme = 'light'
Preferred color scheme: 'light', 'dark', 'no-preference'

​
contrast

Copy
contrast: Contrast = 'no-preference'
Contrast preference: 'no-preference', 'more', 'null'

​
reduced_motion

Copy
reduced_motion: ReducedMotion = 'no-preference'
Reduced motion preference: 'reduce', 'no-preference', 'null'

​
forced_colors

Copy
forced_colors: ForcedColors = 'none'
Forced colors mode: 'active', 'none', 'null'

​
**playwright.devices[...]
Playwright provides launch & context arg presets to emulate common device fingerprints.


Copy
BrowserProfile(
    ...
    **playwright.devices['iPhone 13'],    # playwright = await async_playwright().start()
)
Because BrowserSession and BrowserProfile take all the standard playwright args, we are able to support these device presets as well.

​
Playwright Security Options
See allowed_domains above too!

​
offline

Copy
offline: bool = False
Emulate network being offline.

​
http_credentials

Copy
http_credentials: dict | None = None
Credentials for HTTP authentication.

​
extra_http_headers

Copy
extra_http_headers: dict[str, str] = {}
Additional HTTP headers to be sent with every request.

​
ignore_https_errors

Copy
ignore_https_errors: bool = False
Whether to ignore HTTPS errors when sending network requests.

​
bypass_csp

Copy
bypass_csp: bool = False
Toggles bypassing Content-Security-Policy.

​
java_script_enabled

Copy
java_script_enabled: bool = True
Whether or not to enable JavaScript in the context.

​
service_workers

Copy
service_workers: ServiceWorkers = 'allow'
Whether to allow sites to register Service workers: 'allow', 'block'

​
base_url

Copy
base_url: str | None = None
Base URL to be used in page.goto() and similar operations.

​
strict_selectors

Copy
strict_selectors: bool = False
If true, selector passed to Playwright methods will throw if more than one element matches.

​
client_certificates

Copy
client_certificates: list[ClientCertificate] = []
Client certificates to be used with requests.

​
Playwright Recording Options
Note: Browser Use also provides some of our own recording-related options not listed below (see above).

​
record_video_dir

Copy
record_video_dir: str | Path | None = None
Directory to save video recordings. Playwright Docs: record_video_dir

​
record_video_size

Copy
record_video_size: dict | None = None. [Playwright Docs: `record_video_size`](https://playwright.dev/python/docs/api/class-browsertype#browser-type-launch-persistent-context-option-record-video-size)
Video size. Example: {"width": 1280, "height": 720}

​
record_har_path

Copy
record_har_path: str | Path | None = None
Path to save HAR file with network activity.

​
record_har_content

Copy
record_har_content: RecordHarContent = 'embed'
How to persist HAR content: 'omit', 'embed', 'attach'

​
record_har_mode

Copy
record_har_mode: RecordHarMode = 'full'
HAR recording mode: 'full', 'minimal'

​
record_har_omit_content

Copy
record_har_omit_content: bool = False
Whether to omit request content from the HAR.

​
record_har_url_filter

Copy
record_har_url_filter: str | Pattern | None = None
URL filter for HAR recording.

​
downloads_path

Copy
downloads_path: str | Path | None = '~/.config/browseruse/downloads'
(aliases: downloads_dir, save_downloads_path)

Local filesystem directory to save downloads to.

​
traces_dir

Copy
traces_dir: str | Path | None = None
Directory to save HAR trace files to.

​
handle_sighup

Copy
handle_sighup: bool = True
Whether playwright should swallow SIGHUP signals and kill the browser.

​
handle_sigint

Copy
handle_sigint: bool = False
Whether playwright should swallow SIGINT signals and kill the browser.

​
handle_sigterm

Copy
handle_sigterm: bool = False
Whether playwright should swallow SIGTERM signals and kill the browser.

​
Full Example

Copy
from browser_use import BrowserSession, BrowserProfile, Agent

browser_profile = BrowserProfile(
    headless=False,
    storage_state="path/to/storage_state.json",
    wait_for_network_idle_page_load_time=3.0,
    viewport={"width": 1280, "height": 1100},
    locale='en-US',
    user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.102 Safari/537.36',
    highlight_elements=True,
    viewport_expansion=500,
    allowed_domains=['*.google.com', 'http*://*.wikipedia.org'],
    user_data_dir=None,
)

browser_session = BrowserSession(
    browser_profile=browser_profile,
    headless=True,                          # extra kwargs to the session override the defaults in the profile
)

# you can drive a session without the agent / reuse it between agents
await browser_session.start()
page = await browser_session.get_current_page()
await page.goto('https://example.com/first/page')

async def run_search():
    agent = Agent(
        task='Your task',
        llm=llm,
        page=page,                        # optional: pass a specific playwright page to start on
        browser_session=browser_session,  # optional: pass an existing browser session to an agent
    )
​
Summary
BrowserSession (defined in browser_use/browser/session.py) handles the live browser connection and runtime state
BrowserProfile (defined in browser_use/browser/profile.py) is a template that can store default config parameters for a BrowserSession(...)
Configuration parameters defined in both scopes consumed by these calls depending on whether we're connecting/launching:

BrowserConnectArgs - args for playwright.BrowserType.connect_over_cdp(...)
BrowserLaunchArgs - args for playwright.BrowserType.launch(...)
BrowserNewContextArgs - args for playwright.BrowserType.new_context(...)
BrowserLaunchPersistentContextArgs - args for playwright.BrowserType.launch_persistent_context(...)
Browser Use's own internal methods
For more details on Playwright's browser context options, see their launch args documentation.

Connect to your Browser
Connect to a remote browser or launch a new local browser.

​
Overview
Browser Use supports a wide variety of ways to launch or connect to a browser:

Launch a new local browser using playwright/patchright chromium (the default)
Connect to a remote browser using CDP or WSS
Use an existing playwright Page, Browser, or BrowserContext object
Connect to a local browser already running using browser_pid
Don't want to manage your own browser infrastructure? Try ☁️ Browser Use Cloud ➡️

We provide automatic CAPTCHA solving, proxies, human-in-the-loop automation, and more!

​
Connection Methods
​
Method A: Launch a New Local Browser (Default)
Launch a local browser using built-in default (playwright chromium) or a provided executable_path:


Copy
from browser_use import Agent, BrowserSession

# If no executable_path provided, uses Playwright/Patchright's built-in Chromium
browser_session = BrowserSession(
    # Path to a specific Chromium-based executable (optional)
    executable_path='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',  # macOS
    # For Windows: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
    # For Linux: '/usr/bin/google-chrome'
    
    # Use a specific data directory on disk (optional, set to None for incognito)
    user_data_dir='~/.config/browseruse/profiles/default',   # this is the default
    # ... any other BrowserProfile or playwright launch_persistnet_context config...
    # headless=False,
)

agent = Agent(
    task="Your task here",
    llm=llm,
    browser_session=browser_session,
)
We support most chromium-based browsers in executable_path, including Brave, patchright chromium, rebrowser, Edge, and more. See examples/browser/stealth.py for more. We do not support Firefox or Safari at the moment.

As of Chrome v136, driving browsers with the default profile is no longer supported for security reasons. Browser-Use has transitioned to creating a new dedicated profile for agents in: ~/.config/browseruse/profiles/default. You can open this profile and log into everything you need your agent to have access to, and it will persist over time.

​
Method B: Connect Using Existing Playwright Objects
Pass existing Playwright Page, BrowserContext, Browser, and/or playwright API object to BrowserSession(...):


Copy
from browser_use import Agent, BrowserSession
from playwright.async_api import async_playwright
# from patchright.async_api import async_playwright   # stealth alternative

async with async_playwright() as playwright:
    browser = await playwright.chromium.launch()
    context = await browser.new_context()
    page = await context.new_page()
    
    browser_session = BrowserSession(
        page=page,
        # browser_context=context,  # all these are supported
        # browser=browser,
        # playwright=playwright,
    )

    agent = Agent(
        task="Your task here",
        llm=llm,
        browser_session=browser_session,
    )
You can also pass page directly to Agent(...) as a shortcut.


Copy
agent = Agent(
    task="Your task here",
    llm=llm,
    page=page,
)
​
Method C: Connect to Local Browser Using Browser PID
Connect to a browser with open --remote-debugging-port:


Copy
from browser_use import Agent, BrowserSession

# First, start Chrome with remote debugging:
# /Applications/Google Chrome.app/Contents/MacOS/Google Chrome --remote-debugging-port=9242

# Then connect using the process ID
browser_session = BrowserSession(browser_pid=12345)  # Replace with actual Chrome PID

agent = Agent(
    task="Your task here",
    llm=llm,
    browser_session=browser_session,
)
​
Method D: Connect to remote Playwright Node.js Browser Server via WSS URL
Connect to Playwright Node.js server providers:


Copy
from browser_use import Agent, BrowserSession

# Connect to a playwright server
browser_session = BrowserSession(wss_url="wss://your-playwright-server.com/ws")

agent = Agent(
    task="Your task here",
    llm=llm,
    browser_session=browser_session,
)
​
Method E: Connect to Remote Browser via CDP URL
Connect to any remote Chromium-based browser:


Copy
from browser_use import Agent, BrowserSession

# Connect to Chrome via CDP
browser_session = BrowserSession(cdp_url="http://localhost:9222")

agent = Agent(
    task="Your task here",
    llm=llm,
    browser_session=browser_session,
)
​
Security Considerations
When using any browser profile, the agent will have access to:

All its logged-in sessions and cookies
Saved passwords (if autofill is enabled)
Browser history and bookmarks
Extensions and their data
Always review the task you're giving to the agent and ensure it aligns with your security requirements! Use Agent(sensitive_data={'https://auth.example.com': {x_key: value}}) for any secrets, and restrict the browser with BrowserSession(allowed_domains=['https://*.example.com']).

​
Best Practices
Use isolated profiles: Create separate Chrome profiles for different agents to limit scope of risk:


Copy
browser_session = BrowserSession(
    user_data_dir='~/.config/browseruse/profiles/banking',
    # profile_directory='Default'
)
Limit domain access: Restrict which sites the agent can visit:


Copy
browser_session = BrowserSession(
    allowed_domains=['example.com', 'http*://*.github.com'],
)
Enable keep_alive=True If you want to use a single BrowserSession with more than one agent:


Copy
browser_session = BrowserSession(
    keep_alive=True,
    ...
)
await browser_session.start()  # start the session yourself before passing to Agent
...
agent = Agent(..., browser_session=browser_session)
await agent.run()
...
await browser_session.kill()   # end the session yourself, shortcut for keep_alive=False + .stop()
​
Re-Using a Browser
A BrowserSession starts when the browser is launched/connected, and ends when the browser process exits/disconnects. A session internally manages a single live playwright browser context, and is normally auto-closed by the agent when its task is complete (if the agent started the session itself). If you pass an existing BrowserSession into an Agent, or if you set BrowserSession(keep_alive=True), the session will not be closed and can be re-used between agents.

Browser Use provides a number of ways to re-use profiles, sessions, and other configuration across multiple agents.

✅ sequential agents can re-use a single user_data_dir in new BrowserSessions
✅ sequential agents can re-use a single BrowserSession without closing it
❌ parallel agents cannot run separate BrowserSessions using the same user_data_dir
✅ parallel agents can run separate BrowserSessions using the same storage_state
✅ parallel agents can share a single BrowserSession, working in different tabs
⚠️ parallel agents can share a single BrowserSession, working in the same tab
​
Sequential Agents, Same Profile, Different Browser
If you are only running one agent & browser at a time, they can re-use the same user_data_dir sequentially.


Copy
from browser_use import Agent, BrowserSession
from langchain_openai import ChatOpenAI

reused_profile = BrowserProfile(user_data_dir='~/.config/browseruse/profiles/default')

agent1 = Agent(
    task="The first task...",
    llm=ChatOpenAI(model="gpt-4o-mini"),
    browser_profile=reused_profile,    # pass the profile in, it will auto-create a session
)
await agent1.run()

agent2 = Agent(
    task="The second task...",
    llm=ChatOpenAI(model="gpt-4o-mini"),
    browser_profile=reused_profile,    # agent will auto-create its own new session
)
await agent2.run()
Make sure to never mix different browser versions or executable_paths with the same user_data_dir. Once run with a newer browser version, some migrations are applied to the dir and older browsers wont be able to read it.

​
Sequential Agents, Same Profile, Same Browser
If you are only running one agent at a time, they can re-use the same active BrowserSession and avoid having to relaunch chrome. Each agent will start off looking at the same tab the last agent ended off on.


Copy
from browser_use import Agent, BrowserSession
from langchain_openai import ChatOpenAI

reused_session = BrowserSession(
    user_data_dir='~/.config/browseruse/profiles/default',
    keep_alive=True,  # dont close browser after 1st agent.run() ends
)
await reused_session.start()   # when keep_alive=True, session must be started manually

agent1 = Agent(
    task="The first task...",
    llm=ChatOpenAI(model="gpt-4o-mini"),
    browser_session=reused_session,
)
await agent1.run()

agent2 = Agent(
    task="The second task...",
    llm=ChatOpenAI(model="gpt-4o-mini"),
    browser_session=reused_session,      # re-use the same session
)
await agent2.run()

await reused_session.close()
​
Parallel Agents, Same Browser, Multiple Tabs

Copy
from browser_use import Agent, BrowserSession
from langchain_openai import ChatOpenAI

shared_browser = BrowserSession(
    storage_state='/tmp/cookies.json',
    user_data_dir=None,
    keep_alive=True,
    headless=True,
)
await shared_browser.start()   # when keep_alive=True, you must start the session yourself

agent1 = Agent(
    task="The first task...",
    llm=ChatOpenAI(model="gpt-4o-mini"),
    browser_session=shared_browser,              # pass the session in
)
agent2 = Agent(
    task="The second task...",
    llm=ChatOpenAI(model="gpt-4o-mini"),
    browser_session=shared_browser,              # re-use the same session
)
await asyncio.gather(agent1.run(), agent2.run()) # run in parallel

await shared_browser.close()
​
Parallel Agents, Same Browser, Same Tab
⚠️ This mode is not recommended. Agents are not yet optimized to share the same tab in the same browser, they may interfere with each other or cause errors.


Copy
from browser_use import Agent, BrowserSession
from langchain_openai import ChatOpenAI
from playwright.async_api import async_playwright

playwright = await async_playwright().start()
browser = await playwright.chromium.launch(headless=True)
context = await browser.new_context()
shared_page = await context.new_page()
await shared_page.goto('https://example.com', wait_until='domcontentloaded')

shared_session = BrowserSession(page=shared_page, keep_alive=True)
await shared_session.start()

agent1 = Agent(
    task="Fill out the form in section A...",
    llm=ChatOpenAI(model="gpt-4o-mini"),
    browser_session=shared_session
)
agent2 = Agent(
    task="Fill out the form in section B...",
    llm=ChatOpenAI(model="gpt-4o-mini"),
    browser_session=shared_session,
)
await asyncio.gather(agent1.run(), agent2.run()) # run in parallel

await shared_session.kill()
​
Parallel Agents, Same Profile, Different Browsers
This mode is the recommended default.

To share a single set of configuration or cookies, but still have agents working in their own browser sessions (potentially in parallel), use our provided BrowserProfile object.

The recommended way to re-use cookies and localStorage state between separate parallel sessions is to use the storage_state option.


Copy
# open a browser to log into sites you want the Agent to have access to
playwright open https://example.com/ --save-storage=/tmp/auth.json
playwright open https://example.com/ --load-storage=/tmp/auth.json

Copy
from browser_use.browser import BrowserProfile, BrowserSession

shared_profile = BrowserProfile(
    headless=True,
    user_data_dir=None,               # use dedicated tmp user_data_dir per session
    storage_state='/tmp/auth.json',   # load/save cookies to/from json file
    keep_alive=True,                  # don't close the browser after the agent finishes (only needed to save the session's updated cookies to disk after the run, see below)
)

window1 = BrowserSession(browser_profile=profile_a)
await window1.start()
agent1 = Agent(browser_session=window1)

window2 = BrowserSession(browser_profile=profile_a)
await window2.start()
agent2 = Agent(browser_session=window2)

await asyncio.gather(agent1.run(), agent2.run())  # run in parallel
await window1.save_storage_state()  # write storage state (cookies, localStorage, etc.) to auth.json
await window2.save_storage_state()  # you must decide when to save manually

# can also reload the cookies from the file into the active session if they change
await window1.load_storage_state()
await window1.close()
await window2.close()
​
Troubleshooting
​
Chrome Won't Connect
If you're having trouble connecting:

Close all Chrome instances before trying to launch with a custom profile
Check if Chrome is running with debugging port:

Copy
ps aux | grep chrome | grep remote-debugging-port
Verify the executable path is correct for your system
Check profile permissions - ensure your user has read/write access
​
Profile Lock Issues
If you get a "profile is already in use" error:

Close all Chrome instances
The profile will automatically be unlocked when BrowserSession starts
Alternatively, manually delete the SingletonLock file in the profile directory
For more configuration options, see the Browser Settings documentation.

​
Profile Version Issues
The browser version you run must always be equal to or greater than the version used to create the user_data_dir. If you see errors like Failed to parse Extensions when launching, you're likely attempting to run an older browser with an incompatible user_data_dir that's already been migrated to a newer Chrome version.

Playwright ships a version of chromium that's newer than the default stable Google Chrome release channel, so this can happen if you try to use a profile created by the default playwright chromium (e.g. user_data_dir='~/.config/browseruse/profiles/default') with an older local browser like executable_path='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'.

Output Format
The default is text. But you can define a structured output format to make post-processing easier.

​
Custom output format
With this example you can define what output format the agent should return to you.


Copy
from pydantic import BaseModel
# Define the output format as a Pydantic model
class Post(BaseModel):
	post_title: str
	post_url: str
	num_comments: int
	hours_since_post: int


class Posts(BaseModel):
	posts: List[Post]


controller = Controller(output_model=Posts)


async def main():
	task = 'Go to hackernews show hn and give me the first  5 posts'
	model = ChatOpenAI(model='gpt-4o')
	agent = Agent(task=task, llm=model, controller=controller)

	history = await agent.run()

	result = history.final_result()
	if result:
		parsed: Posts = Posts.model_validate_json(result)

		for post in parsed.posts:
			print('\n--------------------------------')
			print(f'Title:            {post.post_title}')
			print(f'URL:              {post.post_url}')
			print(f'Comments:         {post.num_comments}')
			print(f'Hours since post: {post.hours_since_post}')
	else:
		print('No result')


if __name__ == '__main__':
	asyncio.run(main())

System Prompt
Customize the system prompt to control agent behavior and capabilities

​
Overview
You can customize the system prompt in two ways:

Extend the default system prompt with additional instructions
Override the default system prompt entirely
Custom system prompts allow you to modify the agent's behavior at a fundamental level. Use this feature carefully as it can significantly impact the agent's performance and reliability.

​
Extend System Prompt (recommended)
To add additional instructions to the default system prompt:


Copy
extend_system_message = """
REMEMBER the most important RULE:
ALWAYS open first a new tab and go first to url wikipedia.com no matter the task!!!
"""
​
Override System Prompt
Not recommended! If you must override the default system prompt, make sure to test the agent yourself.

Anyway, to override the default system prompt:


Copy
# Define your complete custom prompt
override_system_message = """
You are an AI agent that helps users with web browsing tasks.

[Your complete custom instructions here...]
"""

# Create agent with custom system prompt
agent = Agent(
    task="Your task here",
    llm=ChatOpenAI(model='gpt-4'),
    override_system_message=override_system_message
)
​
Extend Planner System Prompt
You can customize the behavior of the planning agent by extending its system prompt:


Copy
extend_planner_system_message = """
PRIORITIZE gathering information before taking any action.
Always suggest exploring multiple options before making a decision.
"""

# Create agent with extended planner system prompt
llm = ChatOpenAI(model='gpt-4o')
planner_llm = ChatOpenAI(model='gpt-4o-mini')

agent = Agent(
	task="Your task here",
	llm=llm,
	planner_llm=planner_llm,
	extend_planner_system_message=extend_planner_system_message
)

Sensitive Data
Handle sensitive information securely and avoid sending PII & passwords to the LLM.

​
Handling Sensitive Data
When working with sensitive information like passwords or PII, you can use the Agent(sensitive_data=...) parameter to provide sensitive strings that the model can use in actions without ever seeing directly.


Copy
agent = Agent(
    task='Log into example.com as user x_username with password x_password',
    sensitive_data={
        'https://example.com': {
            'x_username': 'abc@example.com',
            'x_password': 'abc123456',  # 'x_placeholder': '<actual secret value>',
        },
    },
)
You should also configure BrowserSession(allowed_domains=...) to prevent the Agent from visiting URLs not needed for the task.

​
Basic Usage
Here's a basic example of how to use sensitive data:


Copy
from dotenv import load_dotenv
load_dotenv()

from langchain_openai import ChatOpenAI
from browser_use import Agent, BrowserSession

llm = ChatOpenAI(model='gpt-4o', temperature=0.0)

# Define sensitive data
# The LLM will only see placeholder names (x_member_number, x_passphrase), never the actual values
sensitive_data = {
    'https://*.example.com': {
        'x_member_number': '123235325',
        'x_passphrase': 'abcwe234',
    },
}

# Use the placeholder names in your task description
task = """
1. go to https://travel.example.com
2. sign in with your member number x_member_number and private access code x_passphrase
3. extract today's list of travel deals as JSON
"""

# Recommended: Limit the domains available for the entire browser so the Agent can't be tricked into visiting untrusted URLs
browser_session = BrowserSession(allowed_domains=['https://*.example.com'])

agent = Agent(
    task=task,
    llm=llm,
    sensitive_data=sensitive_data,   # Pass the sensitive data to the agent
    browser_session=browser_session, # Pass the restricted browser_session to limit URLs Agent can visit
    use_vision=False,                # Disable vision or else the LLM might see entered values in screenshots
)

async def main():
    await agent.run()

if __name__ == '__main__':
    asyncio.run(main())
In this example:

The LLM only ever sees the x_member_number and x_passphrase placeholders in prompts
When the model wants to use your password it outputs x_passphrase - and we replace it with the actual value in the DOM
When sensitive data appear in the content of the current page, we replace it in the page summary fed to the LLM - so that the model never has it in its state.
The browser will be entirely prevented from going to any site not under https://*.example.com
This approach ensures that sensitive information remains secure while still allowing the agent to perform tasks that require authentication.

​
Best Practices
Always restrict your sensitive data to only the exact domains that need it, https://travel.example.com is better than *.example.com
Always restrict BrowserSession(allowed_domains=[...]) to only the domains the agent needs to visit to accomplish its task. This helps guard against prompt injection attacks, jailbreaks, and LLM mistakes.
Only use sensitive_data for strings that can be inputted verbatim as text. The LLM never sees the actual values, so it can't "understand" them, adapt them, or split them up for multiple input fields. For example, you can't ask the Agent to click through a datepicker UI to input the sensitive value 1990-12-31. For these situations you can implement a custom function the LLM can call that updates the DOM using Python / JS.
Don't use sensitive_data for login credentials, it's better to use storage_state or a user_data_dir to log into the sites the agent needs in advance & reuse the cookies:

Copy
# open a browser to log into the sites you need & save the cookies
$ playwright open https://accounts.google.com --save-storage auth.json
Then use those cookies when the agent runs:


Copy
agent = Agent(..., browser_session=BrowserSession(storage_state='./auth.json'))
Warning: Vision models still see the screenshot of the page by default - where the sensitive data might be visible.

It's recommended to set Agent(use_vision=False) when working with sensitive_data.

​
Allowed Domains
Domain patterns in sensitive_data follow the same format as allowed_domains:

example.com - Matches only https://example.com/*
*.example.com - Matches https://example.com/* and any subdomain https://*.example.com/*
http*://example.com - Matches both http:// and https:// protocols for example.com/*
chrome-extension://* - Matches any Chrome extension URL e.g. chrome-extension://anyextensionid/options.html
Security Warning: For security reasons, certain patterns are explicitly rejected:

Wildcards in TLD part (e.g., example.*) are not allowed (google.* would match google.ninja, google.pizza, etc. which is a bad idea)
Embedded wildcards (e.g., g*e.com) are rejected to prevent overly broad matches
Multiple wildcards like *.*.domain are not supported currently, open an issue if you need this feature
The default protocol when no scheme is specified is now https:// for enhanced security.

For convenience the system will validate that all domain patterns used in Agent(sensitive_data) are also included in BrowserSession(allowed_domains).

​
Missing or Empty Values
When working with sensitive data, keep these details in mind:

If a key referenced by the model (<secret>key_name</secret>) is missing from your sensitive_data dictionary, a warning will be logged but the substitution tag will be preserved.
If you provide an empty value for a key in the sensitive_data dictionary, it will be treated the same as a missing key.
The system will always attempt to process all valid substitutions, even if some keys are missing or empty.
​
Full Example
Here's a more complex example demonstrating multiple domains and sensitive data values.


Copy
from dotenv import load_dotenv
load_dotenv()

from langchain_openai import ChatOpenAI
from browser_use import Agent, BrowserSession


llm = ChatOpenAI(model='gpt-4o', temperature=0.0)

# Domain-specific sensitive data
sensitive_data = {
    'https://*.google.com': {'x_email': '...', 'x_pass': '...'},
    'chrome-extension://abcd1243': {'x_api_key': '...'},
    'http*://example.com': {'x_authcode': '123123'}
}

# Set browser session with allowed domains that match all domain patterns in sensitive_data
browser_session = BrowserSession(
    allowed_domains=[
        'https://*.google.com',
        'chrome-extension://abcd',
        'http://example.com',   # Explicitly include http:// if needed
        'https://example.com'   # By default, only https:// is matched
    ]
)

# Pass the sensitive data to the agent
agent = Agent(
    task="Log into Google, then check my account information",
    llm=llm,
    sensitive_data=sensitive_data,
    browser_session=browser_session,
    use_vision=False,
)

async def main():
    await agent.run()

if __name__ == '__main__':
    asyncio.run(main())
With this approach:

The Google credentials (x_email and x_pass) will only be used on Google domains (any subdomain, https only)
The API key (x_api_key) will only be used on pages served by the specific Chrome extension abcd1243
The auth code (x_authcode) will only be used on http://example.com/* or https://example.com/*

Custom Functions
Extend default agent and write custom action functions to do certain tasks

Custom actions are functions you provide, that are added to our default actions the agent can use to accomplish tasks. Action functions can request arbitrary parameters that the LLM has to come up with + a fixed set of framework-provided arguments for browser APIs / Agent(context=...) / etc.

Our default set of actions is already quite powerful, the built-in Controller provides basics like open_tab, scroll_down, extract_content, and more.

It's easy to add your own actions to implement additional custom behaviors, integrations with other apps, or performance optimizations.

For examples of custom actions (e.g. uploading files, asking a human-in-the-loop for help, drawing a polygon with the mouse, and more), see examples/custom-functions.

​
Action Function Registration
To register your own custom functions (which can be sync or async), decorate them with the @controller.action(...) decorator. This saves them into the controller.registry.


Copy
from browser_use import Controller, ActionResult

controller = Controller()

@controller.action('Ask human for help with a question', domains=['example.com'])   # pass allowed_domains= or page_filter= to limit actions to certain pages
def ask_human(question: str) -> ActionResult:
    answer = input(f'{question} > ')
    return ActionResult(extracted_content=f'The human responded with: {answer}', include_in_memory=True)

Copy
# Then pass your controller to the agent to use it
agent = Agent(
    task='...',
    llm=llm,
    controller=controller,
)
Keep your action function names and descriptions short and concise:

The LLM chooses between actions to run solely based on the function name and description
The LLM decides how to fill action params based on their names, type hints, & defaults
​
Action Parameters
Browser Use supports two patterns for defining action parameters: normal function arguments, or a Pydantic model.

​
Function Arguments
For simple actions that don't need default values, you can define the action parameters directly as arguments to the function. This one takes a single string argument, css_selector. When the LLM calls an action, it sees its argument names & types, and will provide values that fit.


Copy
@controller.action('Click element')
def click_element(css_selector: str, page: Page) -> ActionResult:
    # css_selector is an action param the LLM must provide when calling
    # page is a special framework-provided param to access the browser APIs (see below)
    await page.locator(css_selector).click()
    return ActionResult(extracted_content=f"Clicked element {css_selector}")
​
Pydantic Model
You can define a pydantic model for the parameters your action expects by setting a @controller.action(..., param_model=MyParams). This allows you to use optional parameters, default values, Annotated[...] types with custom validation, field descriptions, and other features offered by pydantic.

When the agent calls calls your agent function, an instance of your model with the values filled by the LLM will be passed as the argument named params to your action function.

Using a pydantic model is helpful because it allows more flexibility and power to enforce the schema of the values the LLM should provide. The LLM gets the entire pydantic JSON schema for your param_model, it will see the function name & description + individual field names, types, descriptions, and default values.


Copy
from typing import Annotated
from pydantic import BaseModel, AfterValidator
from browser_use import ActionResult

class MyParams(BaseModel):
    field1: int
    field2: str = 'default value'
    field3: Annotated[str, AfterValidator(lambda s: s.lower())]  # example: enforce always lowercase
    field4: str = Field(default='abc', description='Detailed description for the LLM')

@controller.action('My action', param_model=MyParams)
def my_action(params: MyParams, page: Page) -> ActionResult:
    await page.keyboard.type(params.field2)
    return ActionResult(extracted_content=f"Inputted {params} on {page.url}")
Any special framework-provided arguments (e.g. page) will be passed as separate positional arguments after params.

​
Framework-Provided Parameters
These special action parameters are injected by the Controller and are passed as extra args to any actions that expect them.

For example, actions that need to run playwright code to interact with the browser should take the argument page or browser_session.

page: Page - The current Playwright page (shortcut for browser_session.get_current_page())
browser_session: BrowserSession - The current browser session (and playwright context via browser_session.browser_context)
context: AgentContext - Any optional top-level context object passed to the Agent, e.g. Agent(context=user_provided_obj)
page_extraction_llm: BaseChatModel - LLM instance used for page content extraction
available_file_paths: list[str] - List of available file paths for upload / processing
has_sensitive_data: bool - Whether the action content contains sensitive data markers (check this to avoid logging sensitive data to terminal by accident)
​
Example: Action uses the current page

Copy
from playwright.async_api import Page
from browser_use import Controller, ActionResult

controller = Controller()

@controller.action('Type keyboard input into a page')
async def input_text_into_page(text: str, page: Page) -> ActionResult:
    await page.keyboard.type(text)
    return ActionResult(extracted_content='Website opened')
​
Example: Action uses the browser_context

Copy
from browser_use import BrowserSession, Controller, ActionResult

controller = Controller()

@controller.action('Open website')
async def open_website(url: str, browser_session: BrowserSession) -> ActionResult:
    # find matching existing tab by looking through all pages in playwright browser_context
    all_tabs = await browser_session.browser_context.pages
    for tab in all_tabs:
        if tab.url == url:
            await tab.bring_to_foreground()
            return ActionResult(extracted_content=f'Switched to tab with url {url}')
    # otherwise, create a new tab
    new_tab = await browser_session.browser_context.new_page()
    await new_tab.goto(url)
    return ActionResult(extracted_content=f'Opened new tab with url {url}')
​
Important Rules
Return an ActionResult: All actions should return an ActionResult | str | None. The stringified version of the result is passed back to the LLM, and optionally persisted in the long-term memory when ActionResult(..., include_in_memory=True).
Type hints on arguments are required: They are used to verify that action params don't conflict with special arguments injected by the controller (e.g. page)
Actions functions called directly must be passed kwargs: When calling actions from other actions or python code, you must pass all parameters as kwargs only, even though the actions are usually defined using positional args (for the same reasons as pluggy). Action arguments are always matched by name and type, not positional order, so this helps prevent ambiguity / reordering issues while keeping action signatures short.

Copy
@controller.action('Fill in the country form field')
def input_country_field(country: str, page: Page) -> ActionResult:
    await some_action(123, page=page)                                # ❌ not allowed: positional args, use kwarg syntax when calling
    await some_action(abc=123, page=page)                            # ✅ allowed: action params & special kwargs
    await some_other_action(params=OtherAction(abc=123), page=page)  # ✅ allowed: params=model & special kwargs

Copy
# Using Pydantic Model to define action params (recommended)
class PinCodeParams(BaseModel):
    code: int
    retries: int = 3                                               # ✅ supports optional/defaults

@controller.action('...', param_model=PinCodeParams)
async def input_pin_code(params: PinCodeParams, page: Page): ...   # ✅ special params at the end

# Using function arguments to define action params
async def input_pin_code(code: int, retries: int, page: Page): ... # ✅ params first, special params second, no defaults
async def input_pin_code(code: int, retries: int=3): ...           # ✅ defaults ok only if no special params needed
async def input_pin_code(code: int, retries: int=3, page: Page): ... # ❌ Python SyntaxError! not allowed
​
Reusing Custom Actions Across Agents
You can use the same controller for multiple agents.


Copy
controller = Controller()

# ... register actions to the controller

agent = Agent(
    task="Go to website X and find the latest news",
    llm=llm,
    controller=controller
)

# Run the agent
await agent.run()

agent2 = Agent(
    task="Go to website Y and find the latest news",
    llm=llm,
    controller=controller
)

await agent2.run()
The controller is stateless and can be used to register multiple actions and multiple agents.

​
Exclude functions
If you want to exclude some registered actions and make them unavailable to the agent, you can do:


Copy
controller = Controller(exclude_actions=['open_tab', 'search_google'])
agent = Agent(controller=controller, ...)
If you want actions to only be available on certain pages, and to not tell the LLM about them on other pages, you can use the allowed_domains and page_filter:


Copy
from pydantic import BaseModel
from browser_use import Controller, ActionResult

controller = Controller()

async def is_ai_allowed(page: Page):
    if api.some_service.check_url(page.url):
        logger.warning('Allowing AI agent to visit url:', page.url)
        return True
    return False

@controller.action('Fill out secret_form', allowed_domains=['https://*.example.com'], page_filter=is_ai_allowed)
def fill_out_form(...) -> ActionResult:
    ... will only be runnable by LLM on pages that match https://*.example.com *AND* where is_ai_allowed(page) returns True

Lifecycle Hooks
Customize agent behavior with lifecycle hooks

Browser-Use provides lifecycle hooks that allow you to execute custom code at specific points during the agent's execution. Hook functions can be used to read and modify agent state while running, implement custom logic, change configuration, integrate the Agent with external applications.

​
Available Hooks
Currently, Browser-Use provides the following hooks:

Hook	Description	When it's called
on_step_start	Executed at the beginning of each agent step	Before the agent processes the current state and decides on the next action
on_step_end	Executed at the end of each agent step	After the agent has executed all the actions for the current step, before it starts the next step

Copy
await agent.run(on_step_start=..., on_step_end=...)
Each hook should be an async callable function that accepts the agent instance as its only parameter.

​
Basic Example

Copy
from browser_use import Agent
from langchain_openai import ChatOpenAI


async def my_step_hook(agent: Agent):
    # inside a hook you can access all the state and methods under the Agent object:
    #   agent.settings, agent.state, agent.task
    #   agent.controller, agent.llm, agent.browser_session
    #   agent.pause(), agent.resume(), agent.add_new_task(...), etc.
    
    # You also have direct access to the playwright Page and Browser Context
    page = await agent.browser_session.get_current_page()
    #   https://playwright.dev/python/docs/api/class-page
    
    current_url = page.url
    visit_log = agent.state.history.urls()
    previous_url = visit_log[-2] if len(visit_log) >= 2 else None
    print(f"Agent was last on URL: {previous_url} and is now on {current_url}")
    
    # Example: listen for events on the page, interact with the DOM, run JS directly, etc.
    await page.on('domcontentloaded', lambda: print('page navigated to a new url...'))
    await page.locator("css=form > input[type=submit]").click()
    await page.evaluate('() => alert(1)')
    await page.browser.new_tab
    await agent.browser_session.session.context.add_init_script('/* some JS to run on every page */')
    
    # Example: monitor or intercept all network requests
    async def handle_request(route):
		# Print, modify, block, etc. do anything to the requests here
        #   https://playwright.dev/python/docs/network#handle-requests
		print(route.request, route.request.headers)
		await route.continue_(headers=route.request.headers)
	await page.route("**/*", handle_route)

    # Example: pause agent execution and resume it based on some custom code
    if '/completed' in current_url:
        agent.pause()
        Path('result.txt').write_text(await page.content()) 
        input('Saved "completed" page content to result.txt, press [Enter] to resume...')
        agent.resume()
    
agent = Agent(
    task="Search for the latest news about AI",
    llm=ChatOpenAI(model="gpt-4o"),
)

await agent.run(
    on_step_start=my_step_hook,
    # on_step_end=...
    max_steps=10
)
​
Data Available in Hooks
When working with agent hooks, you have access to the entire Agent instance. Here are some useful data points you can access:

agent.task lets you see what the main task is, agent.add_new_task(...) lets you queue up a new one
agent.controller give access to the Controller() object and Registry() containing the available actions
agent.controller.registry.execute_action('click_element_by_index', {'index': 123}, browser_session=agent.browser_session)
agent.context lets you access any user-provided context object passed in to Agent(context=...)
agent.sensitive_data contains the sensitive data dict, which can be updated in-place to add/remove/modify items
agent.settings contains all the configuration options passed to the Agent(...) at init time
agent.llm gives direct access to the main LLM object (e.g. ChatOpenAI)
agent.state gives access to lots of internal state, including agent thoughts, outputs, actions, etc.
agent.state.history.model_thoughts(): Reasoning from Browser Use's model.
agent.state.history.model_outputs(): Raw outputs from the Browsre Use's model.
agent.state.history.model_actions(): Actions taken by the agent
agent.state.history.extracted_content(): Content extracted from web pages
agent.state.history.urls(): URLs visited by the agent
agent.browser_session gives direct access to the BrowserSession() and playwright objects
agent.browser_session.get_current_page(): Get the current playwright Page object the agent is focused on
agent.browser_session.browser_context: Get the current playwright BrowserContext object
agent.browser_session.browser_context.pages: Get all the tabs currently open in the context
agent.browser_session.get_page_html(): Current page HTML
agent.browser_session.take_screenshot(): Screenshot of the current page
​
Tips for Using Hooks
Avoid blocking operations: Since hooks run in the same execution thread as the agent, try to keep them efficient or use asynchronous patterns.
Handle exceptions: Make sure your hook functions handle exceptions gracefully to prevent interrupting the agent's main flow.
Use custom actions instead: hooks are fairly advanced, most things can be implemented with custom action functions instead
​
Complex Example: Agent Activity Recording System
This comprehensive example demonstrates a complete implementation for recording and saving Browser-Use agent activity, consisting of both server and client components.

​
Setup Instructions
To use this example, you'll need to:

Set up the required dependencies:


Copy
pip install fastapi uvicorn prettyprinter pyobjtojson dotenv browser-use langchain-openai
Create two separate Python files:

api.py - The FastAPI server component
client.py - The Browser-Use agent with recording hook
Run both components:

Start the API server first: python api.py
Then run the client: python client.py
​
Server Component (api.py)
The server component handles receiving and storing the agent's activity data:


Copy
#!/usr/bin/env python3

#
# FastAPI API to record and save Browser-Use activity data.
# Save this code to api.py and run with `python api.py`
# 

import json
import base64
from pathlib import Path

from fastapi import FastAPI, Request
import prettyprinter
import uvicorn

prettyprinter.install_extras()

# Utility function to save screenshots
def b64_to_png(b64_string: str, output_file):
    """
    Convert a Base64-encoded string to a PNG file.
    
    :param b64_string: A string containing Base64-encoded data
    :param output_file: The path to the output PNG file
    """
    with open(output_file, "wb") as f:
        f.write(base64.b64decode(b64_string))

# Initialize FastAPI app
app = FastAPI()


@app.post("/post_agent_history_step")
async def post_agent_history_step(request: Request):
    data = await request.json()
    prettyprinter.cpprint(data)

    # Ensure the "recordings" folder exists using pathlib
    recordings_folder = Path("recordings")
    recordings_folder.mkdir(exist_ok=True)

    # Determine the next file number by examining existing .json files
    existing_numbers = []
    for item in recordings_folder.iterdir():
        if item.is_file() and item.suffix == ".json":
            try:
                file_num = int(item.stem)
                existing_numbers.append(file_num)
            except ValueError:
                # In case the file name isn't just a number
                pass

    if existing_numbers:
        next_number = max(existing_numbers) + 1
    else:
        next_number = 1

    # Construct the file path
    file_path = recordings_folder / f"{next_number}.json"

    # Save the JSON data to the file
    with file_path.open("w") as f:
        json.dump(data, f, indent=2)

    # Optionally save screenshot if needed
    # if "website_screenshot" in data and data["website_screenshot"]:
    #     screenshot_folder = Path("screenshots")
    #     screenshot_folder.mkdir(exist_ok=True)
    #     b64_to_png(data["website_screenshot"], screenshot_folder / f"{next_number}.png")

    return {"status": "ok", "message": f"Saved to {file_path}"}

if __name__ == "__main__":
    print("Starting Browser-Use recording API on http://0.0.0.0:9000")
    uvicorn.run(app, host="0.0.0.0", port=9000)
​
Client Component (client.py)
The client component runs the Browser-Use agent with a recording hook:


Copy
#!/usr/bin/env python3

#
# Client to record and save Browser-Use activity.
# Save this code to client.py and run with `python client.py`
#

import asyncio
import requests
from dotenv import load_dotenv
from pyobjtojson import obj_to_json
from langchain_openai import ChatOpenAI
from browser_use import Agent

# Load environment variables (for API keys)
load_dotenv()


def send_agent_history_step(data):
    """Send the agent step data to the recording API"""
    url = "http://127.0.0.1:9000/post_agent_history_step"
    response = requests.post(url, json=data)
    return response.json()


async def record_activity(agent_obj):
    """Hook function that captures and records agent activity at each step"""
    website_html = None
    website_screenshot = None
    urls_json_last_elem = None
    model_thoughts_last_elem = None
    model_outputs_json_last_elem = None
    model_actions_json_last_elem = None
    extracted_content_json_last_elem = None

    print('--- ON_STEP_START HOOK ---')
    
    # Capture current page state
    website_html = await agent_obj.browser_session.get_page_html()
    website_screenshot = await agent_obj.browser_session.take_screenshot()

    # Make sure we have state history
    if hasattr(agent_obj, "state"):
        history = agent_obj.state.history
    else:
        history = None
        print("Warning: Agent has no state history")
        return

    # Process model thoughts
    model_thoughts = obj_to_json(
        obj=history.model_thoughts(),
        check_circular=False
    )
    if len(model_thoughts) > 0:
        model_thoughts_last_elem = model_thoughts[-1]

    # Process model outputs
    model_outputs = agent_obj.state.history.model_outputs()
    model_outputs_json = obj_to_json(
        obj=model_outputs,
        check_circular=False
    )
    if len(model_outputs_json) > 0:
        model_outputs_json_last_elem = model_outputs_json[-1]

    # Process model actions
    model_actions = agent_obj.state.history.model_actions()
    model_actions_json = obj_to_json(
        obj=model_actions,
        check_circular=False
    )
    if len(model_actions_json) > 0:
        model_actions_json_last_elem = model_actions_json[-1]

    # Process extracted content
    extracted_content = agent_obj.state.history.extracted_content()
    extracted_content_json = obj_to_json(
        obj=extracted_content,
        check_circular=False
    )
    if len(extracted_content_json) > 0:
        extracted_content_json_last_elem = extracted_content_json[-1]

    # Process URLs
    urls = agent_obj.state.history.urls()
    urls_json = obj_to_json(
        obj=urls,
        check_circular=False
    )
    if len(urls_json) > 0:
        urls_json_last_elem = urls_json[-1]

    # Create a summary of all data for this step
    model_step_summary = {
        "website_html": website_html,
        "website_screenshot": website_screenshot,
        "url": urls_json_last_elem,
        "model_thoughts": model_thoughts_last_elem,
        "model_outputs": model_outputs_json_last_elem,
        "model_actions": model_actions_json_last_elem,
        "extracted_content": extracted_content_json_last_elem
    }

    print("--- MODEL STEP SUMMARY ---")
    print(f"URL: {urls_json_last_elem}")
    
    # Send data to the API
    result = send_agent_history_step(data=model_step_summary)
    print(f"Recording API response: {result}")


async def run_agent():
    """Run the Browser-Use agent with the recording hook"""
    agent = Agent(
        task="Compare the price of gpt-4o and DeepSeek-V3",
        llm=ChatOpenAI(model="gpt-4o"),
    )
    
    try:
        print("Starting Browser-Use agent with recording hook")
        await agent.run(
            on_step_start=record_activity,
            max_steps=30
        )
    except Exception as e:
        print(f"Error running agent: {e}")


if __name__ == "__main__":
    # Check if API is running
    try:
        requests.get("http://127.0.0.1:9000")
        print("Recording API is available")
    except:
        print("Warning: Recording API may not be running. Start api.py first.")
    
    # Run the agent
    asyncio.run(run_agent())
Contribution by Carlos A. Planchón.

​
Working with the Recorded Data
After running the agent, you'll find the recorded data in the recordings directory. Here's how you can use this data:

View recorded sessions: Each JSON file contains a snapshot of agent activity for one step
Extract screenshots: You can modify the API to save screenshots separately
Analyze agent behavior: Use the recorded data to study how the agent navigates websites
​
Extending the Example
You can extend this recording system in several ways:

Save screenshots separately: Uncomment the screenshot saving code in the API
Add a web dashboard: Create a simple web interface to view recorded sessions
Add session IDs: Modify the API to group steps by agent session
Add filtering: Implement filters to record only specific types of actions



## CAPTCHA Handling

### Overview
Browser Use currently has limited built-in CAPTCHA solving capabilities. This is a common challenge in browser automation systems. Here are the current approaches and limitations.

### Current Limitations
Browser Use does not include automatic CAPTCHA solving. When the agent encounters CAPTCHAs:
- The agent may get stuck waiting for manual intervention
- Some tasks may fail if CAPTCHAs block critical steps
- Vision-enabled models can sometimes describe the CAPTCHA but cannot solve it automatically

### Recommended Approaches

#### Manual Intervention
For testing and development, you can pause the agent and manually solve CAPTCHAs:

```python
from browser_use import Agent
from langchain_openai import ChatOpenAI

agent = Agent(
    task="Your task that might encounter CAPTCHAs",
    llm=ChatOpenAI(model="gpt-4o"),
    # Use headless=False to see and interact manually
)

# Note: Agent will pause when it encounters unsolvable elements
await agent.run()
```

#### Third-Party CAPTCHA Services
For production use, consider integrating external CAPTCHA solving services:
- 2captcha.com
- Anti-Captcha
- CapMonster
- DeathByCaptcha

Integration would require custom functions (see Custom Functions documentation):

```python
from browser_use import Controller, ActionResult
import requests

controller = Controller()

@controller.action('Solve CAPTCHA using external service')
async def solve_captcha(captcha_image_url: str, browser: Browser):
    # Example integration with 2captcha service
    # This is pseudocode - actual implementation varies by service
    
    page = browser.get_current_page()
    
    # Submit CAPTCHA to solving service
    # ... service-specific API calls ...
    
    # Wait for solution
    # ... polling logic ...
    
    # Input solution
    await page.fill('[name="captcha"]', solution)
    
    return ActionResult(extracted_content="CAPTCHA solved")
```

#### Avoiding CAPTCHAs
Best practices to minimize CAPTCHA encounters:
- Use realistic delays between actions
- Vary your user agent strings
- Consider using proxy services
- Avoid rapid-fire requests
- Use stealth browsers for sensitive tasks

### Browser Provider Solutions
Some cloud browser providers offer CAPTCHA-resistant environments:
- **BrowserBase**: Provides residential IP browsers
- **Browserless**: Offers stealth mode options
- **Steel**: Includes anti-detection features

```python
config = BrowserConfig(
    wss_url="wss://your-provider.com/ws",  # Provider with anti-detection
    disable_security=True
)
```

### Future Development
The Browser Use team is actively exploring:
- Built-in CAPTCHA detection
- Integration partnerships with solving services
- Improved stealth capabilities
- Better handling of common anti-bot measures

### When CAPTCHAs Block Your Task
If your automation consistently hits CAPTCHAs:
1. **Reconsider the approach**: Can you achieve the goal without triggering anti-bot measures?
2. **Use alternative data sources**: APIs or data feeds instead of web scraping
3. **Implement retry logic**: Some CAPTCHAs are intermittent
4. **Contact the website owner**: For legitimate business use cases

Remember that CAPTCHAs exist to prevent automated access, so always ensure your use case complies with the website's terms of service.



0.2.1
@pirate pirate released this 3 weeks ago
· 529 commits to main since this release
 0.2.1
 27ca169 
What's Changed


Tip

☁️ Browser-Use Cloud also now supports Webhooks! We've made it easy to wire up Browser-Use to other systems.

🔎 Element detection, page interaction, and LLM model support improvements
We've added several new methods of detecting elements on pages and refined the existing ones. We've also added support for more models and vector store providers for memory. Debug and info logging is also significantly improved in general.

#1749
#1729
#1710
🎭 Browsers are now much simpler to set up: just BrowserProfile + BrowserSession
https://docs.browser-use.com/customize/browser-settings
https://docs.browser-use.com/customize/real-browser

You can also now pass in existing Playwright (or Patchright!) Page, BrowserContext, and/or Browser objects.

agent = Agent(task='fill out this form', llm=llm, page=page)
Replaces: Browser, BrowserConfig, BrowserContext, BrowserContextConfig. See more...
📄 Actions functions now get the playwright Page object directly
Custom actions can now ask for the playwright page or browser_session parameters:

from patchright.async_api import Page
from browser_use import Controller, Registry 

controller = Controller

@controller.registry.action(description='Some custom Google sheets action', allowed_domains=['https://docs.google.com'])
async def setup_spreadsheet_graph(cell_range: str, page: Page):   # <-- 🎭 use page to get a normal playwright Page object
	# page = await browser.get_current_page()  # <--- extra call no longer needed to get current page
	await page.evaluate("""() => { 
        // define the wiggle animation
        document.styleSheets[0].insertRule('@keyframes wiggle { 0% { transform: rotate(0deg); } 50% { transform: rotate(10deg); } 100% { transform: rotate(0deg); } }');
        
        document.querySelectorAll("*").forEach(element => {
            element.style.animation = "wiggle 0.5s infinite";
        });
    }""")
🔒 Significant security improvements
https://docs.browser-use.com/customize/sensitive-data#domain-specific-sensitive-data
https://docs.browser-use.com/customize/browser-settings#:~:text=same%20browser%20instance.-,allowed_domains

local browsers now all start with a dedicated empty profile that persists between runs in ~/.config/browseruse/profiles/default
will now refuse to start with default profile in order to avoid security risks of exposing too many cookies unintentionally
browser-use default profile is stored under ~/.config and can be easily set up with only the cookies the bot needs for its tasks
Agent(sensitive_data) now expects a new format {domain: {key, val, ...}} instead of {key: value, ...}, the new format restricts credentials on a per-domain basis. The domain uses the same matching system as allowed_domains so it supports globs and scheme checking too: http*://*.example.com
BrowserSession(allowed_domains=[...]) now defaults to enforcing https:// unless http:// or http*:// is explicitly included
#1750

## Configuration

### Supported Models

Browser Use supports various LangChain chat models with tool-calling capabilities. Here's how to configure and use the most popular ones.

> 📖 **Full List**: The complete list of supported models is available in the [LangChain documentation](https://python.langchain.com/docs/integrations/chat/).

#### Model Performance & Recommendations

| Model | Performance | Cost | Notes |
|-------|-------------|------|-------|
| **GPT-4o** | 89% accuracy (WebVoyager) | High | ✅ **Recommended** for best performance |
| **DeepSeek-V3** | Good | 30x cheaper than GPT-4o | ✅ Great cost/performance ratio, no rate limits |
| **Gemini-2.0-flash-exp** | Good | **Free** | ✅ Popular in community, currently free |
| **Local Models** (Qwen 2.5) | Variable | Free | ⚠️ May have parsing errors with small models |

> ⚠️ **Important**: All models require their respective API keys. Set them in your environment variables before running the agent.

---

#### OpenAI Models

OpenAI's GPT-4o models deliver the best performance and are recommended for production use.

```python
from langchain_openai import ChatOpenAI
from browser_use import Agent

# Initialize the model
llm = ChatOpenAI(
    model="gpt-4o",
    temperature=0.0,
)

# Create agent with the model
agent = Agent(
    task="Your task here",
    llm=llm
)
```

**Required environment variables:**
```bash
OPENAI_API_KEY=your-openai-api-key-here
```

---

#### Anthropic (Claude)

```python
from langchain_anthropic import ChatAnthropic
from browser_use import Agent

# Initialize the model
llm = ChatAnthropic(
    model_name="claude-3-5-sonnet-20240620",
    temperature=0.0,
    timeout=100,  # Increase for complex tasks
)

# Create agent with the model
agent = Agent(
    task="Your task here",
    llm=llm
)
```

**Required environment variables:**
```bash
ANTHROPIC_API_KEY=your-anthropic-api-key-here
```

---

#### Azure OpenAI

```python
from langchain_openai import AzureChatOpenAI
from browser_use import Agent
from pydantic import SecretStr
import os

# Initialize the model
llm = AzureChatOpenAI(
    model="gpt-4o",
    api_version='2024-10-21',
    azure_endpoint=os.getenv('AZURE_OPENAI_ENDPOINT', ''),
    api_key=SecretStr(os.getenv('AZURE_OPENAI_KEY', '')),
)

# Create agent with the model
agent = Agent(
    task="Your task here",
    llm=llm
)
```

**Required environment variables:**
```bash
AZURE_OPENAI_ENDPOINT=https://your-endpoint.openai.azure.com/
AZURE_OPENAI_KEY=your-azure-openai-key-here
```

---

#### Google Gemini

> 🔄 **Important**: `GEMINI_API_KEY` was renamed to `GOOGLE_API_KEY` as of 2025-01.

```python
from langchain_google_genai import ChatGoogleGenerativeAI
from browser_use import Agent
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize the model
llm = ChatGoogleGenerativeAI(model='gemini-2.0-flash-exp')

# Create agent with the model
agent = Agent(
    task="Your task here",
    llm=llm
)
```

**Required environment variables:**
```bash
GOOGLE_API_KEY=your-google-api-key-here
```

---

#### DeepSeek-V3

Popular for its low cost, no rate limits, and open-source nature with good performance.

```python
from langchain_deepseek import ChatDeepSeek
from browser_use import Agent
from pydantic import SecretStr
from dotenv import load_dotenv
import os

load_dotenv()
api_key = os.getenv("DEEPSEEK_API_KEY")

# Initialize the model
llm = ChatDeepSeek(
    base_url='https://api.deepseek.com/v1', 
    model='deepseek-chat', 
    api_key=SecretStr(api_key)
)

# Create agent with the model
agent = Agent(
    task="Your task here",
    llm=llm,
    use_vision=False  # DeepSeek requires vision to be disabled
)
```

**Required environment variables:**
```bash
DEEPSEEK_API_KEY=your-deepseek-api-key-here
```

---

#### DeepSeek-R1 (Reasoning Model)

> ⚠️ **Beta**: Not fully tested yet. More functionality will be added, including reasoning content output. Does not support vision.

```python
from langchain_deepseek import ChatDeepSeek
from browser_use import Agent
from pydantic import SecretStr
from dotenv import load_dotenv
import os

load_dotenv()
api_key = os.getenv("DEEPSEEK_API_KEY")

# Initialize the model
llm = ChatDeepSeek(
    base_url='https://api.deepseek.com/v1', 
    model='deepseek-reasoner', 
    api_key=SecretStr(api_key)
)

# Create agent with the model
agent = Agent(
    task="Your task here",
    llm=llm,
    use_vision=False  # Vision not supported
)
```

**Required environment variables:**
```bash
DEEPSEEK_API_KEY=your-deepseek-api-key-here
```

---

#### Ollama (Local Models)

For users who want to run models locally:

1. **Install Ollama**: Download from [ollama.ai](https://ollama.ai)
2. **Pull a model**: Run `ollama pull model_name` (choose a model with tool-calling support)
3. **Start Ollama**: Run `ollama start`

```python
from langchain_ollama import ChatOllama
from browser_use import Agent

# Initialize the model
llm = ChatOllama(model="qwen2.5", num_ctx=32000)

# Create agent with the model
agent = Agent(
    task="Your task here",
    llm=llm
)
```

**Required environment variables:** None! 🎉

---

#### Novita AI

Multi-model API provider. Choose a model that supports function calling.

```python
from langchain_openai import ChatOpenAI
from browser_use import Agent
from pydantic import SecretStr
from dotenv import load_dotenv
import os

load_dotenv()
api_key = os.getenv("NOVITA_API_KEY")

# Initialize the model
llm = ChatOpenAI(
    base_url='https://api.novita.ai/v3/openai', 
    model='deepseek/deepseek-v3-0324', 
    api_key=SecretStr(api_key)
)

# Create agent with the model
agent = Agent(
    task="Your task here",
    llm=llm,
    use_vision=False
)
```

**Required environment variables:**
```bash
NOVITA_API_KEY=your-novita-api-key-here
```

---

#### X AI (Grok)

X AI's Grok models. Choose a model that supports function calling.

```python
from langchain_openai import ChatOpenAI
from browser_use import Agent
from pydantic import SecretStr
from dotenv import load_dotenv
import os

load_dotenv()
api_key = os.getenv("GROK_API_KEY")

# Initialize the model
llm = ChatOpenAI(
    base_url='https://api.x.ai/v1',
    model='grok-3-beta',
    api_key=SecretStr(api_key)
)

# Create agent with the model
agent = Agent(
    task="Your task here",
    llm=llm,
    use_vision=False
)
```

**Required environment variables:**
```bash
GROK_API_KEY=your-grok-api-key-here
```

---

#### Coming Soon

We're actively working on supporting:

- **Groq** - Fast inference API
- **GitHub Models** - GitHub's model hosting
- **Fine-tuned Models** - Custom model support

---

### Agent Settings

The `Agent` class is the core component of Browser Use that handles browser automation. Here are the main configuration options available when initializing an agent.

#### Basic Usage

```python
from browser_use import Agent
from langchain_openai import ChatOpenAI

agent = Agent(
    task="Search for latest news about AI",
    llm=ChatOpenAI(model="gpt-4o"),
)
```

#### Required Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `task` | `str` | The instruction for the agent to execute |
| `llm` | `BaseChatModel` | A LangChain chat model instance |

#### Optional Parameters

##### Agent Behavior

Control how the agent operates:

```python
agent = Agent(
    task="your task",
    llm=llm,
    controller=custom_controller,                    # Custom function registry
    use_vision=True,                                # Enable vision capabilities
    save_conversation_path="logs/conversation"      # Save chat logs
)
```

**Parameter Details:**

- **`controller`**: Registry of functions the agent can call. Defaults to base `Controller`. See [Custom Functions](#custom-functions) for details.
- **`use_vision`**: Enable/disable vision capabilities (default: `True`)
  - When enabled, the model processes visual information from web pages
  - Disable to reduce costs or use models without vision support
  - For GPT-4o, image processing costs ~800-1000 tokens (~$0.002 USD) per image
- **`save_conversation_path`**: Path to save complete conversation history (useful for debugging)
- **`override_system_message`**: Completely replace the default system prompt
- **`extend_system_message`**: Add additional instructions to the default system prompt

> 💡 **Vision Tip**: Vision capabilities provide better web interaction understanding but can be disabled to reduce costs when using models without vision support.

##### Browser Connection

By default, Browser Use launches its own built-in browser using Playwright Chromium. You can also connect to remote browsers or pass existing Playwright objects:

```python
agent = Agent(
    task='book a flight to fiji',
    llm=llm,
    browser_profile=browser_profile,     # Use profile template
    browser_session=BrowserSession(      # Use existing session
        cdp_url="http://localhost:9222", # Remote CDP browser
        # or
        wss_url="wss://...",             # Remote WSS server
        # or
        browser_pid=1234,                # Local browser PID
        # or
        page=page,                       # Existing Page object
        # or
        browser_context=browser_context, # Existing BrowserContext
        # or
        browser=browser,                 # Existing Browser object
    ),
)
```

**Connection Examples:**

```python
# Connect to existing browser over CDP
agent = Agent(
    task="your task",
    llm=llm,
    browser_session=BrowserSession(cdp_url='http://localhost:9222'),
)

# Connect to local Chrome instance
agent = Agent(
    task="your task", 
    llm=llm,
    browser_session=BrowserSession(browser_pid=1234),
)
```

> 📚 **More Info**: See [Connect to your Browser](#connect-to-your-browser) for detailed connection instructions.

#### Running the Agent

Execute the agent using the async `run()` method:

```python
history = await agent.run(max_steps=100)
```

**Parameters:**
- `max_steps` (default: 100): Maximum number of steps the agent can take during execution. Prevents infinite loops and helps control execution time.

#### Agent History

The `run()` method returns an `AgentHistoryList` object containing complete execution history:

```python
# Example of accessing history
history = await agent.run()

# Access useful information
urls = history.urls()                    # List of visited URLs
screenshots = history.screenshots()       # List of screenshot paths  
actions = history.action_names()         # Names of executed actions
content = history.extracted_content()    # Content extracted during execution
errors = history.errors()               # Any errors that occurred
model_actions = history.model_actions() # All actions with parameters
```

**Helper Methods:**

- `final_result()`: Get the final extracted content
- `is_done()`: Check if the agent completed successfully
- `has_errors()`: Check if any errors occurred
- `model_thoughts()`: Get the agent's reasoning process
- `action_results()`: Get results of all actions

> 📖 **Complete Reference**: For a full list of helper methods, refer to the [AgentHistoryList source code](https://github.com/browser-use/browser-use).

#### Advanced Features

##### Initial Actions

Run actions without LLM involvement first:

```python
initial_actions = [
    {'open_tab': {'url': 'https://www.google.com'}},
    {'open_tab': {'url': 'https://en.wikipedia.org/wiki/Randomness'}},
    {'scroll_down': {'amount': 1000}},
]

agent = Agent(
    task='What theories are displayed on the page?',
    initial_actions=initial_actions,
    llm=llm,
)
```

> 📝 **Action Reference**: Find all available actions in the [Controller source code](https://github.com/browser-use/browser-use).

##### Message Context

Provide additional context to help the LLM understand the task:

```python
agent = Agent(
    task="your task",
    message_context="Additional information about the task",
    llm=ChatOpenAI(model='gpt-4o')
)
```

##### Planner Model

Use a separate model for high-level task planning:

```python
from langchain_openai import ChatOpenAI

# Initialize models
llm = ChatOpenAI(model='gpt-4o')
planner_llm = ChatOpenAI(model='o3-mini')

agent = Agent(
    task="your task",
    llm=llm,
    planner_llm=planner_llm,           # Separate model for planning
    use_vision_for_planner=False,      # Disable vision for planner
    planner_interval=4                 # Plan every 4 steps
)
```

**Planner Benefits:**
- Reduce costs by using smaller models for planning
- Improve task decomposition and strategic thinking
- Better handle complex, multi-step tasks

**Planner Parameters:**
- `planner_llm`: LangChain chat model for high-level planning
- `use_vision_for_planner`: Enable/disable vision for planner (default: `True`)
- `planner_interval`: Steps between planning phases (default: 1)

##### Optional Parameters Summary

```python
agent = Agent(
    # Core parameters
    task="your task",
    llm=llm,
    
    # Behavior
    controller=controller,
    use_vision=True,
    save_conversation_path="logs/",
    override_system_message="custom prompt",
    extend_system_message="additional instructions",
    
    # Context & Planning
    message_context="additional context",
    initial_actions=actions_list,
    planner_llm=planner_model,
    use_vision_for_planner=False,
    planner_interval=4,
    
    # Execution Control
    max_actions_per_step=10,
    max_failures=3,
    retry_delay=10,
    generate_gif=False,
    
    # Memory (see Memory Management section)
    enable_memory=True,
    memory_config=memory_config,
    
    # Browser Connection
    browser_session=browser_session,
    browser_profile=browser_profile,
)
```

---

// ... existing code ...

---

### Browser Settings

Browser Use provides extensive browser configuration options through `BrowserSession` and `BrowserProfile` classes.

#### Overview

- **`BrowserSession`** - Manages the live browser connection and runtime state
- **`BrowserProfile`** - Template that stores default configuration parameters for a `BrowserSession`

#### BrowserSession

`BrowserSession` is Browser Use's main object that tracks a Playwright connection to a running browser. It handles:

- Playwright library, browser, browser_context, and page objects
- Tab management for both agent and human interactions
- Browser window interactions and DOM element detection
- Configuration needed by the Agent

#### BrowserProfile

`BrowserProfile` is a configuration template for `BrowserSession`. It provides:

- Type hints and field descriptions for your IDE
- Runtime configuration validation
- Helper methods for screen size detection and config management
- Database-friendly structure with UUID support

**Usage Pattern:**

```python
# Without BrowserProfile
session = BrowserSession(headless=True, storage_state='auth.json', viewport={...})

# With BrowserProfile (recommended for reusable configs)
profile = BrowserProfile(headless=True, storage_state='auth.json', viewport={...})
session = BrowserSession(browser_profile=profile)
```

---

#### Connection Parameters

Choose one of these options to connect to an existing browser:

##### WebSocket (WSS) Connection

```python
browser_session = BrowserSession(wss_url="wss://your-browser-server-url")
```

WSS URL of the Playwright-protocol browser server to connect to.

##### Chrome DevTools Protocol (CDP)

```python
browser_session = BrowserSession(cdp_url="http://localhost:9222")
```

CDP URL of the browser to connect to.

##### Process ID Connection

```python
browser_session = BrowserSession(browser_pid=1234)
```

Connect to a running Chromium-based browser process by PID.

> 🌐 **Cloud Recommendation**: For web scraping tasks on sites that restrict automated access, consider using Browser Use Cloud or external browser providers for better reliability.

---

#### Session-Specific Parameters

These parameters are specific to `BrowserSession` and cannot be stored in a `BrowserProfile`:

##### Playwright Objects

```python
browser_session = BrowserSession(
    playwright=playwright_instance,           # Playwright API client
    browser=browser_instance,                # Playwright Browser object
    browser_context=browser_context_instance, # Playwright BrowserContext
    page=page_instance,                      # Agent's current page
    human_current_page=human_page_instance,  # Human's current page
)
```

##### Configuration Template

```python
browser_session = BrowserSession(
    browser_profile=profile,  # BrowserProfile template
    **kwargs                  # Session-specific overrides
)
```

**Example with overrides:**

```python
base_mobile = BrowserProfile(
    storage_state='/tmp/auth.json',
    **playwright.devices['iPhone 13'],
    timezone_id='UTC',
)

# Create regional variants
usa_session = BrowserSession(
    browser_profile=base_mobile,
    timezone_id='America/New_York',  # Override timezone
)

eu_session = BrowserSession(
    browser_profile=base_mobile,
    timezone_id='Europe/Paris',      # Override timezone
)

# Use with agents
usa_agent = Agent(task='show me today\'s schedule', browser_session=usa_session)
eu_agent = Agent(task='show me today\'s schedule', browser_session=eu_session)

# Run in parallel
await asyncio.gather(usa_agent.run(), eu_agent.run())
```

---

#### Browser-Use Specific Parameters

These parameters control Browser Use features beyond standard Playwright options:

##### Session Management

```python
browser_session = BrowserSession(
    keep_alive=True,    # Don't close browser after agent completes
)
```

- **`keep_alive`** (default: `None`): 
  - `True`: Browser stays open after `agent.run()` completes
  - `False`: Browser closes after completion
  - `None`: Auto-detect (close if launched by agent, keep open if connected to existing)

##### Security & Access Control

```python
browser_session = BrowserSession(
    stealth=True,                    # Use patchright to avoid bot detection
    allowed_domains=[                # Restrict navigation to specific domains
        'https://google.com',
        '*.wikipedia.org',
        'docs.google.com'
    ],
    disable_security=False,          # Enable/disable browser security features
)
```

**Parameter Details:**

- **`stealth`** (default: `False`): Use patchright to avoid bot-blocking
  - ⚠️ May cause issues with some sites - test manually
  - Requires `patchright` package installation

- **`allowed_domains`** (default: `None`): Domain access control
  - `None`: All domains allowed
  - List of domains/patterns: Restrict to specified domains
  - Supports glob patterns:
    - `['example.com']` ✅ Matches only `https://example.com/*`
    - `['*.example.com']` ⚠️ Matches all subdomains (use with caution)

- **`disable_security`** (default: `False`): Completely disable browser security
  - ⚠️ **Very insecure** - only for trusted environments
  - Allows cross-site iframe interactions
  - Don't visit untrusted URLs or handle sensitive data

**Security Best Practices:**

```python
# ✅ Secure configuration
secure_session = BrowserSession(
    allowed_domains=[
        'https://api.example.com',
        'https://app.example.com',
        'https://auth.example.com'
    ],
    disable_security=False,
    stealth=False,
)

# ⚠️ Less secure but sometimes necessary
development_session = BrowserSession(
    allowed_domains=['http://localhost:*'],
    disable_security=True,  # Only for local development
)
```

---

#### Complete Configuration Example

```python
from browser_use import Agent, BrowserProfile, BrowserSession
from langchain_openai import ChatOpenAI
import asyncio

# Create reusable profile
profile = BrowserProfile(
    # Browser behavior
    headless=False,
    stealth=True,
    
    # Access control
    allowed_domains=[
        'https://docs.google.com',
        'https://accounts.google.com'
    ],
    
    # Authentication
    storage_state='/tmp/google_auth.json',
    
    # Viewport
    viewport={'width': 1920, 'height': 1080},
    
    # Device emulation
    user_agent='Mozilla/5.0 (compatible; BrowserUse/1.0)',
    
    # Performance
    timeout=30000,
)

# Create session with profile
session = BrowserSession(
    browser_profile=profile,
    keep_alive=True,  # Keep browser open between tasks
)

# Use with agent
agent = Agent(
    task="Create a new document in Google Docs",
    llm=ChatOpenAI(model="gpt-4o"),
    browser_session=session,
)

# Run task
result = await agent.run()
print(f"Task completed: {result.final_result()}")
```

---

// ... existing code ...
