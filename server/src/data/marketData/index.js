// src/services/marketData/index.js

const marketDataCache = require('./utils/dataCache');
const { aggregateMarketData, generateExplanation } = require('./utils/marketDataAggregator');
const worldBankSource = require('./worldBankSource');
const blsSource = require('./blsSource');
// We'll import other sources as we implement them
// const secFilingsSource = require('./secFilingsSource');
// const industryScraperSource = require('./industryScraperSource');

// Fallback data (will be implemented later)
const fallbackData = {};

/**
 * Market Data Service
 * 
 * This is the main entry point for all market data operations.
 * It coordinates fetching data from multiple sources, aggregating it,
 * and applying caching.
 */
const marketDataService = {
  /**
   * Get industry market data from all available sources
   * 
   * @param {string} industry - Industry name/category
   * @param {Object} options - Options for data retrieval
   * @returns {Promise<Object>} Aggregated market data
   */
  getIndustryData: async (industry, options = {}) => {
    try {
      console.log(`📊 Getting market data for "${industry}"...`);
      
      // Normalize industry name
      const normalizedIndustry = industry.trim();
      
      // Check cache first (unless bypass requested)
      if (!options.bypassCache) {
        const cachedData = marketDataCache.get('aggregated', normalizedIndustry, options);
        if (cachedData) {
          console.log(`✅ Found cached market data for "${industry}"`);
          return cachedData;
        }
      }
      
      // Define sources - add more as we implement them
      const sources = [
        worldBankSource,
        blsSource,
        // Add more sources here as we build them
        // secFilingsSource,
        // industryScraperSource,
      ];
      
      // Try all available sources in parallel
      console.log(`🔍 Querying ${sources.length} data sources for "${industry}"...`);
      
      const sourcePromises = sources.map(source => {
        return source.fetchData(normalizedIndustry, options)
          .catch(error => {
            console.error(`❌ Error fetching data from ${source.SOURCE_ID}:`, error.message);
            return { 
              hasData: false, 
              source: source.SOURCE_ID,
              error: error.message
            };
          });
      });
      
      // Wait for all sources to return data (or fail gracefully)
      const results = await Promise.all(sourcePromises);
      
      // Aggregate the results from all sources
      console.log(`🧩 Aggregating data from ${results.filter(r => r.hasData).length} successful sources`);
      const aggregatedData = aggregateMarketData(results, normalizedIndustry);
      
      // Add explanation
      aggregatedData.explanation = generateExplanation(aggregatedData);
      
      // If we have no data but there's a fallback, use it
      if (!aggregatedData.hasData && fallbackData[normalizedIndustry]) {
        console.log(`📚 Using fallback data for "${industry}"`);
        const fallbackResult = {
          ...fallbackData[normalizedIndustry],
          source: 'fallback-dataset',
          confidence: { overall: 0.3, marketSize: 0.3, growthRate: 0.3 },
          explanation: `Using fallback dataset for ${normalizedIndustry} as no live data sources were available.`
        };
        
        // Cache the fallback result too
        marketDataCache.set('aggregated', normalizedIndustry, fallbackResult, options);
        return fallbackResult;
      }
      
      // Store in cache if we have data
      if (aggregatedData.hasData) {
        marketDataCache.set('aggregated', normalizedIndustry, aggregatedData, options);
      }
      
      return aggregatedData;
    } catch (error) {
      console.error(`❌ Error in market data service for "${industry}":`, error);
      
      // Return a structured error
      return {
        industry,
        hasData: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  },
  
  /**
   * Clear the market data cache
   */
  clearCache: () => marketDataCache.flush(),
  
  /**
   * Get cache statistics
   */
  getCacheStats: () => marketDataCache.getStats()
};

module.exports = { marketDataService };