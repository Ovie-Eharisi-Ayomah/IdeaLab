// src/services/marketData/utils/dataCache.js

const NodeCache = require('node-cache');

/**
 * Cache for market data
 * 
 * This prevents us from hammering data sources with repeat requests.
 * It's especially important because:
 * 1. Many free APIs have request limits
 * 2. Market data doesn't change that frequently
 * 3. We want consistent results for the same queries
 */
class MarketDataCache {
  constructor(options = {}) {
    // Default TTL (time to live) - 24 hours
    const ttl = options.ttl || 86400; 
    
    // Create cache instance
    this.cache = new NodeCache({ 
      stdTTL: ttl,
      checkperiod: Math.floor(ttl / 10), // Check for expired keys at 1/10th of TTL
      useClones: false // For performance, don't clone objects going in/out of cache
    });
    
    // Track hits and misses for monitoring
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0
    };
  }
  
  /**
   * Generate a cache key from parameters
   * 
   * @param {string} sourceId - Unique ID for the data source
   * @param {string} industry - Industry name
   * @param {Object} options - Additional options that affect the result
   * @returns {string} Cache key
   */
  generateKey(sourceId, industry, options = {}) {
    // Normalize industry name for consistent keys
    const normalizedIndustry = industry.toLowerCase().trim().replace(/\s+/g, '_');
    
    // Base key
    let key = `${sourceId}:${normalizedIndustry}`;
    
    // Add options hash if provided
    if (Object.keys(options).length > 0) {
      // Sort keys for consistent hashing
      const optionsStr = JSON.stringify(
        Object.entries(options)
          .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
          .reduce((obj, [k, v]) => ({ ...obj, [k]: v }), {})
      );
      
      // Append options hash to key
      key += `:${Buffer.from(optionsStr).toString('base64')}`;
    }
    
    return key;
  }
  
  /**
   * Get data from cache
   * 
   * @param {string} sourceId - Data source identifier
   * @param {string} industry - Industry to look up 
   * @param {Object} options - Additional options that affect the result
   * @returns {Object|null} Cached data or null if not found
   */
  get(sourceId, industry, options = {}) {
    const key = this.generateKey(sourceId, industry, options);
    const value = this.cache.get(key);
    
    if (value) {
      this.stats.hits++;
      return value;
    } else {
      this.stats.misses++;
      return null;
    }
  }
  
  /**
   * Store data in cache
   * 
   * @param {string} sourceId - Data source identifier
   * @param {string} industry - Industry name
   * @param {Object} data - Data to cache
   * @param {Object} options - Additional options that affect the result
   * @param {number} ttl - Optional TTL override in seconds
   * @returns {boolean} Success
   */
  set(sourceId, industry, data, options = {}, ttl = undefined) {
    const key = this.generateKey(sourceId, industry, options);
    
    // Add timestamp to cached data
    const dataWithMeta = {
      ...data,
      _cached: new Date().toISOString()
    };
    
    const success = this.cache.set(key, dataWithMeta, ttl);
    
    if (success) {
      this.stats.sets++;
    }
    
    return success;
  }
  
  /**
   * Check if an item exists in cache
   * 
   * @param {string} sourceId - Data source identifier
   * @param {string} industry - Industry name
   * @param {Object} options - Additional options that affect the result
   * @returns {boolean} True if in cache
   */
  has(sourceId, industry, options = {}) {
    const key = this.generateKey(sourceId, industry, options);
    return this.cache.has(key);
  }
  
  /**
   * Delete an item from cache
   * 
   * @param {string} sourceId - Data source identifier
   * @param {string} industry - Industry name
   * @param {Object} options - Additional options that affect the result
   * @returns {number} Number of deleted keys (0 or 1)
   */
  delete(sourceId, industry, options = {}) {
    const key = this.generateKey(sourceId, industry, options);
    return this.cache.del(key);
  }
  
  /**
   * Flush the entire cache
   * 
   * @returns {void}
   */
  flush() {
    this.cache.flushAll();
    console.log('🧹 Market data cache cleared');
  }
  
  /**
   * Get cache statistics
   * 
   * @returns {Object} Cache stats
   */
  getStats() {
    const cacheStats = this.cache.getStats();
    
    return {
      ...this.stats,
      keys: this.cache.keys().length,
      ...cacheStats
    };
  }
}

// Create a singleton instance
const marketDataCache = new MarketDataCache();

module.exports = marketDataCache;