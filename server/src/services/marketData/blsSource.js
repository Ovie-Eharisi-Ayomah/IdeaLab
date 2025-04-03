// src/services/marketData/blsSource.js

const axios = require('axios');
const { findBestMatchingIndustry, NAICS_MAPPINGS } = require('./utils/industryMappings');

/**
 * Bureau of Labor Statistics (BLS) Data Source
 * 
 * What it's good for:
 * - US employment numbers by industry (very reliable)
 * - Wage data by industry (solid)
 * - Industry revenue estimates via employment * revenue per employee
 * 
 * What it sucks at:
 * - Global market data (US only)
 * - Non-employment based industries
 * - Emerging tech sectors that don't have dedicated NAICS codes
 */

// Revenue per employee by industry (industry averages in USD)
// These are critical for converting employment to market size
const REVENUE_PER_EMPLOYEE = {
  // Tech sectors
  'Software': 420000,
  'SaaS': 375000,
  'IT Services': 350000,
  'Computer Hardware': 650000,
  'Semiconductors': 550000,
  
  // Healthcare
  'Healthcare': 280000,
  'Health Tech': 350000,
  'Pharmaceuticals': 1200000,
  'Medical Devices': 450000,
  'Biotech': 650000,
  
  // Financial services
  'Financial Services': 450000,
  'Banking': 500000,
  'Insurance': 400000,
  'Fintech': 375000,
  
  // Retail
  'Retail': 220000,
  'Ecommerce': 300000,
  'Consumer Products': 350000,
  
  // Other sectors
  'Manufacturing': 320000,
  'Energy': 700000,
  'Telecommunications': 450000,
  'Transportation': 280000,
  'Education': 150000,
  'Entertainment': 320000,
  
  // Default for unknown industries
  'DEFAULT': 350000
};

// US market share of global market by industry (rough estimates)
// Critical for extrapolating from US to global market
const US_MARKET_SHARE = {
  'Software': 0.45,
  'SaaS': 0.50,
  'Healthcare': 0.40,
  'Financial Services': 0.35,
  'Retail': 0.25,
  'Manufacturing': 0.20,
  'Energy': 0.20,
  'Telecommunications': 0.22,
  'Transportation': 0.18,
  'Education': 0.25,
  'Entertainment': 0.40,
  'Agriculture': 0.15,
  
  // Default for unknown industries
  'DEFAULT': 0.25
};

/**
 * Fetch industry data from BLS API
 * 
 * @param {string} industry - Industry name/category
 * @param {Object} options - Optional parameters
 * @returns {Promise<Object>} Market data object or null if not found
 */
async function fetchData(industry, options = {}) {
  try {
    console.log(`💼 Fetching BLS data for ${industry}...`);
    
    // Find matching NAICS code for this industry
    const naicsMatch = findBestMatchingIndustry(industry, NAICS_MAPPINGS);
    
    if (!naicsMatch || naicsMatch.matchScore < 0.5) {
      console.log(`😬 No good NAICS match for ${industry}`);
      return { 
        hasData: false, 
        source: 'BLS',
        error: 'No matching NAICS code found' 
      };
    }
    
    const naicsCode = naicsMatch.indicator;
    console.log(`📊 Found NAICS code ${naicsCode} for ${industry} (match score: ${naicsMatch.matchScore.toFixed(2)})`);
    
    // BLS API key - you'll need to register for a free key at https://www.bls.gov/developers/
    // No key = limited to 25 calls per day, with key = 500 calls per day
    const apiKey = process.env.BLS_API_KEY || "";
    
    // Latest year for data (BLS is usually 1-2 years behind)
    const currentYear = new Date().getFullYear();
    const dataYear = options.year || (currentYear - 1);
    
    // Build series ID for employment data
    // For employment: CEU + supersector code + industry code + data type (all employees)
    // See: https://www.bls.gov/help/hlpforma.htm
    
    // This is a simplified approach - in production you'd need more sophisticated handling
    // of different BLS series IDs based on industry type
    
    // For this example, we'll use NAICS-based employment data from the Current Employment Statistics
    const seriesId = `CEU${naicsCode.slice(0, 2)}${naicsCode}03`;
    
    // Make request to BLS API
    let response;
    
    if (apiKey) {
      // Registered API request with key
      response = await axios.post(
        "https://api.bls.gov/publicAPI/v2/timeseries/data/",
        {
          seriesid: [seriesId],
          startyear: `${dataYear - 2}`,
          endyear: `${dataYear}`,
          registrationKey: apiKey
        }
      );
    } else {
      // Unregistered request (limited)
      response = await axios.post(
        "https://api.bls.gov/publicAPI/v2/timeseries/data/",
        {
          seriesid: [seriesId],
          startyear: `${dataYear - 1}`,
          endyear: `${dataYear}`
        }
      );
    }
    
    // Check if we got valid data
    if (response.data.status !== 'REQUEST_SUCCEEDED' || 
        !response.data.Results || 
        !response.data.Results.series || 
        response.data.Results.series.length === 0 ||
        !response.data.Results.series[0].data ||
        response.data.Results.series[0].data.length === 0) {
      
      console.log(`😬 No BLS data found for ${industry} with NAICS ${naicsCode}`);
      return { 
        hasData: false, 
        source: 'BLS',
        error: 'No data returned from BLS API',
        naicsCode
      };
    }
    
    // Extract the employment data
    const seriesData = response.data.Results.series[0].data;
    
    // Sort by date (newest first)
    seriesData.sort((a, b) => {
      if (a.year !== b.year) {
        return parseInt(b.year) - parseInt(a.year);
      }
      return parseInt(b.period.replace('M', '')) - parseInt(a.period.replace('M', ''));
    });
    
    // Get the most recent month's employment 
    const latestData = seriesData[0];
    const employmentCount = parseInt(latestData.value, 10) * 1000; // BLS data is in thousands
    
    // Get YOY growth rate if available
    let growthRate = null;
    if (seriesData.length > 12) {
      const yearAgoData = seriesData.find(d => 
        d.year === (parseInt(latestData.year) - 1).toString() && 
        d.period === latestData.period
      );
      
      if (yearAgoData) {
        const yearAgoEmployment = parseInt(yearAgoData.value, 10) * 1000;
        growthRate = (employmentCount - yearAgoEmployment) / yearAgoEmployment;
      }
    }
    
    // Calculate US market size based on employment and revenue per employee
    // This is a simplification, but reasonable for estimation
    const revenuePerEmployee = REVENUE_PER_EMPLOYEE[industry] || 
                              REVENUE_PER_EMPLOYEE.DEFAULT;
    
    const usMarketSize = (employmentCount * revenuePerEmployee) / 1e9; // In billions USD
    
    // Extrapolate to global market using typical US market share
    const usMarketShare = US_MARKET_SHARE[industry] || US_MARKET_SHARE.DEFAULT;
    const globalMarketSize = usMarketSize / usMarketShare;
    
    // Get the employment data date
    const dataDate = `${latestData.year}-${latestData.period.replace('M', '')}`;
    
    // Create estimated geographic distribution
    const geographicDistribution = {
      'North America': usMarketShare * 1.1, // US + Canada
      'Europe': (1 - usMarketShare) * 0.4,
      'Asia Pacific': (1 - usMarketShare) * 0.45,
      'Rest of World': (1 - usMarketShare) * 0.15
    };
    
    // Return the processed data
    return {
      hasData: true,
      source: 'BLS',
      sourceQuality: 4, // 1-5 scale, BLS is very reliable for US data
      industryName: industry,
      
      // Market size data
      globalMarketSize,
      usMarketSize,
      
      // Growth data
      growthRate,
      
      // Supporting data
      employmentCount,
      revenuePerEmployee,
      naicsCode,
      
      // Geographic distribution
      geographicDistribution,
      
      // Metadata
      year: parseInt(latestData.year),
      month: parseInt(latestData.period.replace('M', '')),
      dataDate,
      usMarketShare,
      
      // Confidence assessment
      confidence: naicsMatch.matchScore > 0.8 ? 'high' : 'medium',
      notes: `Based on BLS employment data for NAICS ${naicsCode}. ` +
             `US market extrapolated to global using typical US market share of ${(usMarketShare * 100).toFixed(0)}%.`
    };
  } catch (error) {
    console.error(`🚨 BLS API error for ${industry}:`, error.message);
    return { 
      hasData: false, 
      source: 'BLS',
      error: error.message
    };
  }
}

module.exports = {
  fetchData,
  SOURCE_ID: 'bls'
};