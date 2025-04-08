// server/src/llm/keywordExtraction.js
require('dotenv').config();
const OpenAI = require('openai');
// Or const { Client } = require('@anthropic/sdk'); if using Anthropic

// Initialize the LLM client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Extracts structured keywords from a user's business idea
 * @param {string} businessIdea - The raw business idea input
 * @returns {Object} Structured keyword information
 */
async function extractKeywords(businessIdea) {
  try {
    const prompt = createExtractionPrompt(businessIdea);
    
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are an expert business analyst specialized in market research and business validation." },
        { role: "user", content: prompt }
      ],
      temperature: 0.3,
    });
    
    // Parse and validate the response
    const extractedData = JSON.parse(response.choices[0].message.content);
    const validatedData = validateExtraction(extractedData, businessIdea);
    
    return validatedData;
  } catch (error) {
    console.error("Keyword extraction error:", error);
    throw new Error("Failed to extract keywords from business idea");
  }
}

function createExtractionPrompt(businessIdea) {
  return `
Analyze the following business idea and extract structured information:
"${businessIdea}"

Return a JSON object with the following:
{
  "core_problem": {
    "primary": ["main problem keyword"],
    "secondary": ["related problem keywords"]
  },
  "proposed_solution": {
    "approach": ["solution method keywords"],
    "features": ["key feature keywords"]
  },
  "target_market": {
    "demographics": ["demographic keywords"],
    "psychographics": ["psychographic keywords"],
    "behaviors": ["behavioral keywords"]
  },
  "industry_context": {
    "sector": ["industry sector"],
    "trends": ["relevant trend keywords"]
  },
  "search_terms": ["list of 10-15 search terms to research this idea"]
}`;
}

function validateExtraction(data, originalIdea) {
  // Add validation logic here
  // Check for missing fields, validate that keywords make sense, etc.
  
  return data;
}

module.exports = {
  extractKeywords
};