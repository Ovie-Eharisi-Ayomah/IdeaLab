// src/services/marketDataService.js

const axios = require('axios');
// const NodeCache = require('node-cache');
const { OpenAI } = require('openai');
const fallbackData = require('./fallbackMarketData');
require('dotenv').config();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Cache market data with 24-hour TTL
// const dataCache = new NodeCache({ stdTTL: 86400 });

/**
 * Market Data Service
 * Fetches and processes market data from multiple sources with LLM enhancement
 */
const marketDataService = {
  /**
   * Get market data for a specific industry
   * 
   * @param {string} industry - The industry to get data for
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Market data for the industry
   */
  getIndustryData: async (industry, options = {}) => {
    // const cacheKey = `industry_${industry.toLowerCase().replace(/\s+/g, '_')}`;
    
    // Check cache first
    // const cachedData = dataCache.get(cacheKey);
    // if (cachedData && !options.bypassCache) {
    //   console.log(`Cache hit for ${industry}`);
    //   return cachedData;
    // }
    
    // Data retrieval pipeline
    try {
      // Step 1: Try to get data from public sources
      console.log(`Fetching data for ${industry} from public sources...`);
      const publicData = await fetchFromPublicSources(industry);
      
      // Step 2: Enhance data with LLM if needed
      const enhancedData = await enhanceWithLLM(publicData, { industry });
      
      // Step 3: Cache and return if we have good data
      if (enhancedData.isRelevant && enhancedData.enhancedData) {
        // const result = {
        //   ...enhancedData.enhancedData,
        //   source: 'public-enhanced',
        //   confidence: enhancedData.confidenceScore,
        //   enhancedFields: enhancedData.filledFields || []
        // };
        
        // dataCache.set(cacheKey, result);
        return result;
      }
      
      throw new Error('Public data not relevant or insufficient');
    } catch (error) {
      console.log(`Public data retrieval failed: ${error.message}`);
      
      // Step 4: Try fallback data
      try {
        const fallbackResult = await getFallbackData(industry);
        if (fallbackResult) {
          // dataCache.set(cacheKey, fallbackResult);
          return fallbackResult;
        }
      } catch (fallbackError) {
        console.log(`Fallback data retrieval failed: ${fallbackError.message}`);
      }
      
      // Step 5: Generate data with LLM as last resort
      console.log(`Generating synthetic data for ${industry}...`);
      const syntheticData = await generateSyntheticData(industry);
      // dataCache.set(cacheKey, syntheticData);
      return syntheticData;
    }
  },
  
  /**
   * Find similar industries using LLM reasoning
   * 
   * @param {string} industry - Target industry to find similar industries for
   * @returns {Promise<Object>} Similar industries with reasoning
   */
  findSimilarIndustries: async (industry) => {
    // const cacheKey = `similar_${industry.toLowerCase().replace(/\s+/g, '_')}`;
    
    // Check cache first
    // const cachedSimilarities = dataCache.get(cacheKey);
    // if (cachedSimilarities) {
    //   return cachedSimilarities;
    // }
    
    // Use LLM to find similar industries
    const similarIndustries = await findSimilarIndustriesWithLLM(industry);
    
    // Cache the results
    // dataCache.set(cacheKey, similarIndustries);
    return similarIndustries;
  },
  
  // Add method to clear cache if needed
  // clearCache: () => {
  //   dataCache.flushAll();
  //   return { success: true, message: 'Cache cleared' };
  // }
};

/**
 * Fetch data from public source APIs
 * 
 * @param {string} industry - Industry to fetch data for
 * @returns {Promise<Object>} Raw data from public sources
 */
async function fetchFromPublicSources(industry) {
  // For MVP, let's focus on these free/public data sources:
  // 1. World Bank API (growth rates, country data)
  // 2. BLS API (US industry employment and revenue)
  // 3. Simple web-based statistics APIs
  
  // Let's try the World Bank API first as an example
  try {
    // Note: This is a simplified example. In reality, you'd need to map
    // your industry to the right World Bank industry code.
    const response = await axios.get(
      `https://api.worldbank.org/v2/country/all/indicator/NY.GDP.MKTP.KD.ZG?format=json&per_page=1000&date=2020:2022`
    );
    
    // Process the response - in reality this would be more complex
    // For MVP we're keeping this simple
    if (response.data && response.data[1]) {
      // Take the global average growth rate as a starting point
      const growthRates = response.data[1].map(item => item.value).filter(Boolean);
      const avgGrowthRate = growthRates.reduce((sum, rate) => sum + rate, 0) / growthRates.length;
      
      return {
        industry,
        globalMarketSize: null, // We don't have this from World Bank
        growthRate: avgGrowthRate / 100, // Convert percentage to decimal
        source: 'World Bank API',
        dataCompleteness: 'partial', // We only have growth rate
        retrievalDate: new Date().toISOString()
      };
    }
    
    throw new Error('No data available from World Bank API');
  } catch (error) {
    console.error('World Bank API error:', error.message);
    
    // For MVP, let's return a partial data object to indicate what we tried
    return {
      industry,
      dataCompleteness: 'minimal',
      source: 'attempted-public-api',
      error: error.message
    };
  }
}

/**
 * Enhance market data using LLM
 * Verifies relevance and fills gaps in data
 * 
 * @param {Object} rawData - Raw data from public sources
 * @param {Object} context - Business context
 * @returns {Promise<Object>} Enhanced data with LLM insights
 */
async function enhanceWithLLM(rawData, context) {
  try {
    const prompt = `
    You are analyzing market data for the ${context.industry} industry.
    
    Raw data available:
    ${JSON.stringify(rawData, null, 2)}
    
    Task: Analyze this data and enhance it for market sizing purposes.
    
    1. Is this data relevant to the ${context.industry} industry? (yes/no)
    2. If relevant, fill in any missing critical fields:
       - Market size (global, in USD)
       - Growth rate (annual %)
       - Geographic distribution (% by major region)
       - Average revenue per customer/user
       - Competitive intensity (0-1 scale)
    3. For any fields you estimate, explain your reasoning
    
    Respond in this JSON format:
    {
      "isRelevant": true/false,
      "enhancedData": {
        "industry": "${context.industry}",
        "globalMarketSize": number in billions USD,
        "growthRate": decimal (e.g., 0.12 for 12%),
        "geographicDistribution": {
          "northAmerica": decimal,
          "europe": decimal,
          "asiaPacific": decimal,
          "restOfWorld": decimal
        },
        "averageRevenuePerUser": number in USD,
        "competitiveIntensity": decimal between 0-1
      },
      "filledFields": ["list of fields you estimated"],
      "confidenceScore": decimal between 0-1,
      "reasoning": "Explanation of your estimates and analysis"
    }
    `;
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'You are a market research expert specializing in industry analysis.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.2, // Low temperature for more reliable data generation
      response_format: { type: 'json_object' }
    });
    
    // Parse the response
    const content = response.choices[0].message.content;
    const result = JSON.parse(content);
    
    // Add metadata
    result.metadata = {
      generatedAt: new Date().toISOString(),
      originalSource: rawData.source || 'unknown',
      enhancementModel: 'gpt-4o'
    };
    
    return result;
  } catch (error) {
    console.error('LLM enhancement error:', error.message);
    // Return a non-relevant result if enhancement fails
    return {
      isRelevant: false,
      enhancedData: null,
      confidenceScore: 0,
      error: error.message
    };
  }
}

/**
 * Get data from fallback compiled dataset
 * If exact match not found, uses LLM to find similar industries
 * 
 * @param {string} industry - Industry to get data for
 * @returns {Promise<Object>} Fallback data with possible adjustments
 */
async function getFallbackData(industry) {
  // Check for direct match first
  if (fallbackData[industry]) {
    return {
      ...fallbackData[industry],
      dataSource: 'fallback-exact-match',
      confidence: 'medium'
    };
  }
  
  // No exact match, use LLM to find similar industries
  console.log(`No exact match for ${industry}, finding similar industries...`);
  const similarityResults = await findSimilarIndustriesWithLLM(industry);
  
  if (similarityResults.similarIndustries.length > 0) {
    // Use the most similar industry as a base
    const mostSimilar = similarityResults.similarIndustries[0];
    const baseIndustry = mostSimilar.industry;
    
    if (fallbackData[baseIndustry]) {
      // Apply the suggested adjustments
      const baseData = fallbackData[baseIndustry];
      const adjustedData = {
        ...baseData,
        // Apply the multipliers suggested by the LLM
        globalMarketSize: baseData.globalMarketSize * (mostSimilar.sizeMultiplier || 1),
        growthRate: baseData.growthRate * (mostSimilar.growthMultiplier || 1),
        
        // Add metadata about the similarity
        dataSource: 'fallback-similarity-adjusted',
        similarityMatch: {
          baseIndustry,
          similarityScore: mostSimilar.similarityScore,
          adjustmentRationale: mostSimilar.rationale
        },
        confidence: 'low-medium'
      };
      
      return adjustedData;
    }
  }
  
  throw new Error('No suitable fallback data found');
}

/**
 * Find similar industries using LLM reasoning
 * 
 * @param {string} industry - Target industry to find similar industries for
 * @returns {Promise<Object>} Similar industries with reasoning
 */
async function findSimilarIndustriesWithLLM(industry) {
  try {
    // Get available industries from our fallback data
    const availableIndustries = Object.keys(fallbackData);
    
    const prompt = `
    I need to analyze the market for "${industry}" but don't have direct data.
    
    Here are the industries I DO have data for:
    ${availableIndustries.join(', ')}
    
    Please identify the 2-3 most similar industries from this list that would share comparable:
    - Business models
    - Customer purchasing patterns
    - Growth drivers
    - Competitive dynamics
    - Market adoption curves
    
    For each similar industry:
    1. Assign a similarity score (0-1)
    2. Explain WHY it's similar
    3. Note key differences that would require adjustment
    4. Suggest specific multipliers for:
       - Market size (e.g., 1.2x larger, 0.8x smaller)
       - Growth rate (e.g., 1.3x faster growing, 0.9x slower growing)
    
    Respond in this JSON format:
    {
      "targetIndustry": "${industry}",
      "similarIndustries": [
        {
          "industry": "Industry Name",
          "similarityScore": 0.8,
          "rationale": "Explanation of similarities",
          "keyDifferences": "Explanation of differences",
          "sizeMultiplier": 1.2,
          "growthMultiplier": 0.9
        }
      ],
      "reasoning": "Your overall analysis of the industry relationships"
    }
    `;
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'You are a market research expert specializing in industry analysis and classification.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' }
    });
    
    // Parse the response
    const content = response.choices[0].message.content;
    return JSON.parse(content);
  } catch (error) {
    console.error('Error finding similar industries:', error);
    // Return an empty result if the process fails
    return {
      targetIndustry: industry,
      similarIndustries: [],
      reasoning: `Error analyzing similar industries: ${error.message}`
    };
  }
}

/**
 * Generate synthetic data with LLM when no real data is available
 * Clearly marked as synthetic estimate
 * 
 * @param {string} industry - Industry to generate data for
 * @returns {Promise<Object>} Synthetic market data
 */
async function generateSyntheticData(industry) {
  try {
    const prompt = `
    I need market sizing data for the "${industry}" industry, but I don't have reliable sources.
    Please generate a reasonable synthetic estimate based on your knowledge of this industry or similar ones.
    
    Provide estimates for:
    1. Global market size (in billions USD)
    2. Annual growth rate (as a decimal)
    3. Geographic distribution (% by region)
    4. Average revenue per customer/user
    5. Competitive intensity (0-1 scale)
    
    Be conservative in your estimates and explain your reasoning.
    
    Respond in this JSON format:
    {
      "industry": "${industry}",
      "globalMarketSize": number in billions USD,
      "growthRate": decimal (e.g., 0.12 for 12%),
      "geographicDistribution": {
        "northAmerica": decimal,
        "europe": decimal,
        "asiaPacific": decimal,
        "restOfWorld": decimal
      },
      "averageRevenuePerUser": number,
      "competitiveIntensity": decimal between 0-1,
      "reasoning": "Explanation of your estimates"
    }
    `;
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'You are a market research expert specializing in industry analysis.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.4,
      response_format: { type: 'json_object' }
    });
    
    // Parse the response
    const content = response.choices[0].message.content;
    const result = JSON.parse(content);
    
    // Add synthetic data markers
    return {
      ...result,
      dataSource: 'synthetic-estimate',
      confidence: 'low',
      synthetic: true,
      disclaimer: 'This is an AI-generated estimate based on general knowledge. Treat as approximate and validate with additional research.'
    };
  } catch (error) {
    console.error('Error generating synthetic data:', error);
    
    // Return a minimal synthetic dataset if the LLM fails
    return {
      industry,
      globalMarketSize: 10 + Math.random() * 40, // Random between 10-50B
      growthRate: 0.05 + Math.random() * 0.1, // Random between 5-15%
      dataSource: 'minimal-synthetic-fallback',
      confidence: 'very-low',
      synthetic: true,
      disclaimer: 'Minimal synthetic estimate due to data generation failure. Treat with caution.'
    };
  }
}

module.exports = { marketDataService };