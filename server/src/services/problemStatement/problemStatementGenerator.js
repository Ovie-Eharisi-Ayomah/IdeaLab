// problemStatementGenerator.js

const OpenAI = require('openai');
const Anthropic = require('@anthropic-ai/sdk');
const dotenv = require('dotenv');

dotenv.config();

// Lazy initialization - clients will be created only when needed
let openai = null;
let anthropic = null;

function getOpenAIClient() {
  if (!openai && process.env.OPENAI_API_KEY) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openai;
}

function getAnthropicClient() {
  if (!anthropic && process.env.ANTHROPIC_API_KEY) {
    anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }
  return anthropic;
}

/**
 * Main function to generate or refine a problem statement
 * @param {string} businessIdea - The original business idea text
 * @param {string|null} userProvidedStatement - User's problem statement (if any)
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} The generated/refined statement with metadata
 */
async function generateOrRefineStatement(businessIdea, userProvidedStatement = null, options = {}) {
  const {
    maxRetries = 2,
    timeoutMs = 10000,
    industryHint = null,
    productTypeHint = null,
  } = options;

  // Early validation - if both inputs are garbage, fail fast
  if (!businessIdea || businessIdea.trim().length < 10) {
    return {
      success: false,
      statement: null,
      error: "Business idea is too short or missing",
      originalStatement: userProvidedStatement
    };
  }

  const mode = userProvidedStatement ? "REFINE" : "GENERATE";
  const prompt = createPrompt(
    businessIdea, 
    userProvidedStatement, 
    mode, 
    industryHint, 
    productTypeHint
  );

  // Try OpenAI with retries
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const statement = await callOpenAI(prompt, timeoutMs);
      return processStatement(statement, userProvidedStatement);
    } catch (error) {
      console.warn(`OpenAI attempt ${attempt + 1} failed: ${error.message}`);
      if (attempt === maxRetries - 1) {
        // Last attempt, try Anthropic as fallback
        try {
          console.log("Falling back to Anthropic for problem statement");
          const statement = await callAnthropic(prompt, timeoutMs);
          return processStatement(statement, userProvidedStatement);
        } catch (fallbackError) {
          console.error("Anthropic fallback failed:", fallbackError.message);
          
          // All attempts failed - return a basic formatted version of user input or default
          return createFallbackStatement(businessIdea, userProvidedStatement);
        }
      }
      // Not the last attempt, sleep and retry
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
}

/**
 * Creates the prompt for the LLM
 */
function createPrompt(businessIdea, userStatement, mode, industryHint, productTypeHint) {
  // Add industry and product type context if available
  const contextHints = [];
  if (industryHint) contextHints.push(`Industry: ${industryHint}`);
  if (productTypeHint) contextHints.push(`Product Type: ${productTypeHint}`);
  const context = contextHints.length > 0 ? `\nContext: ${contextHints.join(', ')}` : '';

  if (mode === "GENERATE") {
    return `You are an expert market researcher who can identify the core customer problem that a business is trying to solve.

Given a business idea, extract or infer the primary underlying problem statement. The business idea is: "${businessIdea}"${context}

A GREAT problem statement has these qualities:
- Focuses on the customer pain point, not the business solution
- Is specific and measurable when possible (e.g., "wastes 5 hours per week" instead of "wastes time")
- Is 1-2 concise sentences (ideal for search queries)
- Uses clear, jargon-free language that average people would use when searching
- States the problem as a current reality, not a hypothetical

Here are examples of good problem statements:
1. "Small business owners struggle to find affordable legal services, often paying $500+ per hour for basic contract reviews."
2. "Remote workers experience frequent loneliness and isolation, with 68% reporting decreased job satisfaction due to lack of social interaction."
3. "Parents waste 45+ minutes daily preparing healthy lunches for kids, often settling for less nutritious options due to time constraints."

BAD examples (don't do these):
❌ "People might need my app" (too vague)
❌ "Our revolutionary platform solves inefficiencies in the supply chain utilizing blockchain" (focused on solution, not problem)
❌ "Users want personalization" (too generic)

ONLY RETURN THE PROBLEM STATEMENT TEXT. No explanations, introductions, or other text.`;
  } else {
    // REFINE mode
    return `You are an expert market researcher who writes effective problem statements for business validation.

I need you to refine this user-provided problem statement to make it more effective for market research and problem validation. 

Original Business Idea: "${businessIdea}"${context}
User's Problem Statement: "${userStatement}"

Your task is to refine their statement to have these qualities:
- More focused on the customer pain point, not the business solution
- More specific and measurable when possible (e.g., "wastes 5 hours per week" instead of "wastes time")
- 1-2 concise sentences (ideal for search queries)
- Clear, jargon-free language that average people would use when searching
- Stated as a current reality, not a hypothetical

Example of a GREAT problem statement:
"Small business owners struggle to find affordable legal services, often paying $500+ per hour for basic contract reviews."

DO NOT completely change the meaning or intent of the original statement.
DO add specificity, clarity, and focus on the customer problem.

ONLY RETURN THE REFINED PROBLEM STATEMENT TEXT. No explanations, introductions, or other text.`;
  }
}

/**
 * Calls OpenAI API to generate text
 */
async function callOpenAI(prompt, timeoutMs) {
  const client = getOpenAIClient();
  if (!client) {
    throw new Error('OpenAI API key not configured');
  }

  // Create a promise that rejects after the timeout
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('OpenAI request timed out')), timeoutMs);
  });

  // Create the OpenAI API call promise
  const openaiPromise = client.chat.completions.create({
    model: "gpt-3.5-turbo", // Using gpt-3.5-turbo as the original cheaper model
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3, // Low temperature for consistent outputs
    max_tokens: 150 // Short responses are fine for problem statements
  });

  // Race the API call against the timeout
  const response = await Promise.race([openaiPromise, timeoutPromise]);
  return response.choices[0].message.content.trim();
}

/**
 * Calls Anthropic API as fallback
 */
async function callAnthropic(prompt, timeoutMs) {
  const client = getAnthropicClient();
  if (!client) {
    throw new Error('Anthropic API key not configured');
  }

  // Create a promise that rejects after the timeout
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Anthropic request timed out')), timeoutMs);
  });

  // Create the Anthropic API call promise
  const anthropicPromise = client.messages.create({
    model: "claude-instant-1.2", // Faster, cheaper model
    max_tokens: 150,
    temperature: 0.3,
    system: "You are an expert at identifying core customer problems from business ideas.",
    messages: [
      { role: "user", content: prompt }
    ]
  });

  // Race the API call against the timeout
  const response = await Promise.race([anthropicPromise, timeoutPromise]);
  return response.content[0].text.trim();
}

/**
 * Process and validate the generated statement
 */
function processStatement(statement, originalStatement) {
  // Basic validation - check if the output is too short or too long
  if (!statement || statement.length < 10) {
    return createFallbackStatement(null, originalStatement);
  }

  if (statement.length > 500) {
    // LLM gave us too much text, try to extract just the statement
    const sentences = statement.split(/(?<=[.!?])\s+/);
    statement = sentences.slice(0, 2).join(' ').trim();
  }

  // Remove quotes if the LLM wrapped the statement in them
  statement = statement.replace(/^["'](.+)["']$/, '$1');

  // Calculate a rough quality score
  const qualityScore = calculateQualityScore(statement);

  return {
    success: true,
    statement: statement,
    qualityScore: qualityScore,
    originalStatement: originalStatement,
    isRefined: !!originalStatement
  };
}

/**
 * Generate a basic fallback when all else fails
 */
function createFallbackStatement(businessIdea, userStatement) {
  // If user provided something, clean it and use it
  if (userStatement && userStatement.trim().length > 0) {
    // Make sure it ends with a period
    let cleaned = userStatement.trim();
    if (!cleaned.match(/[.!?]$/)) {
      cleaned += ".";
    }
    return {
      success: true,
      statement: cleaned,
      qualityScore: 3,
      originalStatement: userStatement,
      isRefined: false,
      note: "Using original statement (LLM processing failed)"
    };
  }

  // Generate a generic problem statement from the business idea
  if (businessIdea && businessIdea.length > 20) {
    // Extract the first noun phrase as the target customer
    const words = businessIdea.split(' ');
    const subject = words.length > 5 ? 
      `${words[0]} ${words[1]} ${words[2]}` : 
      "Users";
    
    return {
      success: true,
      statement: `${subject} struggle with finding solutions in this area.`,
      qualityScore: 1,
      originalStatement: userStatement,
      isRefined: false,
      note: "Using generated fallback (LLM processing failed)"
    };
  }

  // Ultimate fallback
  return {
    success: false,
    statement: "Users face challenges that this business aims to solve.",
    qualityScore: 0,
    originalStatement: userStatement,
    error: "Could not generate a specific problem statement"
  };
}

/**
 * Calculate a rough quality score for the problem statement
 */
function calculateQualityScore(statement) {
  let score = 5; // Start with middle score
  
  // Look for specific qualities that make good problem statements
  if (statement.match(/\d+%|\d+ hours|\d+ days|\$\d+/)) {
    score += 2; // Contains specific metrics
  }
  
  if (statement.length > 30 && statement.length < 200) {
    score += 1; // Good length
  } else if (statement.length > 200) {
    score -= 1; // Too long
  }
  
  if (statement.match(/struggle|challenge|difficulty|problem|pain|frustration|waste|lose|costly/i)) {
    score += 1; // Contains problem-focused language
  }
  
  if (statement.match(/our|we|platform|solution|app|website|blockchain|AI|ML|revolutionary/i)) {
    score -= 2; // Focuses on solution instead of problem
  }
  
  // Cap the score between 1-10
  return Math.min(10, Math.max(1, score));
}

module.exports = {
  generateOrRefineStatement
};