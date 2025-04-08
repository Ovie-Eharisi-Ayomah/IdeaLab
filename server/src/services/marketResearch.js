// marketResearch.js
const axios = require('axios');

/**
 * Market Research client for accessing our Python research services
 */
class MarketResearch {
  /**
   * Create a new MarketResearch client
   * @param {string} baseUrl - Base URL for the research API
   * @param {number} timeout - Timeout in milliseconds
   */
  constructor(baseUrl = 'http://localhost:8000', timeout = 300000) {
    this.baseUrl = baseUrl;
    this.axios = axios.create({
      baseURL: baseUrl,
      timeout: timeout, // 5 minute timeout - browser research takes time
    });
  }

  /**
   * Research market size for a business idea
   * @param {string} businessDescription - Description of the business idea
   * @param {string} industry - Primary industry
   * @param {string} productType - Type of product or service
   * @returns {Promise<Object>} Market size data
   */
  async researchMarketSize(businessDescription, industry, productType) {
    try {
      console.log(`Researching market size for ${industry}...`);
      const response = await this.axios.post('/market-size', {
        description: businessDescription,
        industry: industry,
        product_type: productType
      });
      return response.data;
    } catch (error) {
      console.error('Market size research failed:', error.message);
      if (error.response) {
        console.error('Response:', error.response.data);
      }
      throw new Error(`Market size research failed: ${error.message}`);
    }
  }

  /**
   * Analyze competition for a business idea
   * @param {string} businessDescription - Description of the business idea
   * @param {string} industry - Primary industry
   * @param {string} productType - Type of product or service
   * @returns {Promise<Object>} Competition analysis data
   */
  async analyzeCompetition(businessDescription, industry, productType) {
    try {
      console.log(`Analyzing competition for ${industry}...`);
      const response = await this.axios.post('/competition', {
        description: businessDescription,
        industry: industry,
        product_type: productType
      });
      return response.data;
    } catch (error) {
      console.error('Competition analysis failed:', error.message);
      if (error.response) {
        console.error('Response:', error.response.data);
      }
      throw new Error(`Competition analysis failed: ${error.message}`);
    }
  }

  /**
   * Validate a problem statement
   * @param {string} businessDescription - Description of the business idea
   * @param {string} industry - Primary industry
   * @param {string} problemStatement - Problem statement to validate
   * @returns {Promise<Object>} Problem validation data
   */
  async validateProblem(businessDescription, industry, problemStatement) {
    try {
      console.log(`Validating problem: "${problemStatement}"...`);
      const response = await this.axios.post('/problem-validation', {
        description: businessDescription,
        industry: industry,
        problem_statement: problemStatement
      });
      return response.data;
    } catch (error) {
      console.error('Problem validation failed:', error.message);
      if (error.response) {
        console.error('Response:', error.response.data);
      }
      throw new Error(`Problem validation failed: ${error.message}`);
    }
  }
}

// Create a default instance
const defaultClient = new MarketResearch();

// Export both the class and individual functions for more flexible usage
module.exports = {
  MarketResearch,
  // Export standalone functions that use the default client
  researchMarketSize: defaultClient.researchMarketSize.bind(defaultClient),
  analyzeCompetition: defaultClient.analyzeCompetition.bind(defaultClient),
  validateProblem: defaultClient.validateProblem.bind(defaultClient),
  // Allow users to create a custom client with different settings
  createClient: (baseUrl, timeout) => new MarketResearch(baseUrl, timeout)
};