// src/services/marketData/worldBankSource.js

const axios = require('axios');
const { findBestMatchingIndustry } = require('./utils/industryMappings');

/**
 * World Bank Data Source
 * 
 * What it's good for:
 * - Growth rates for economic sectors
 * - Relative size of sectors as % of GDP
 * - Global/regional economic trends
 * 
 * What it sucks at:
 * - Specific industry market sizes
 * - Emerging technology sectors
 * - Anything smaller than major economic sectors
 */

// Map our industry categories to World Bank indicator codes
// See full list: https://data.worldbank.org/indicator
const INDICATOR_MAPPINGS = {
  // General economic indicators
  'DEFAULT_GROWTH': 'NY.GDP.MKTP.KD.ZG', // GDP growth annual %
  
  // Industry sectors to World Bank indicators
  'Technology': 'NV.IND.MANF.ZS',       // Manufacturing value added (% of GDP)
  'Software': 'BX.GSR.CCIS.ZS',         // ICT service exports (% of service exports)
  'Healthcare': 'SH.XPD.CHEX.GD.ZS',    // Current health expenditure (% of GDP)
  'Financial Services': 'FS.AST.PRVT.GD.ZS', // Domestic credit to private sector (% of GDP)
  'Retail': 'NE.CON.PRVT.ZS',           // Household consumption (% of GDP)
  'Agriculture': 'NV.AGR.TOTL.ZS',      // Agriculture, forestry, fishing value added (% of GDP)
  'Energy': 'EG.USE.PCAP.KG.OE',        // Energy use (kg of oil equivalent per capita)
  'Education': 'SE.XPD.TOTL.GD.ZS',     // Government expenditure on education (% of GDP)
  'Telecommunications': 'IT.CEL.SETS.P2', // Mobile cellular subscriptions (per 100 people)
  'Manufacturing': 'NV.IND.MANF.ZS',    // Manufacturing value added (% of GDP)
  'Construction': 'NV.IND.TOTL.ZS',     // Industry value added (% of GDP)
  'Transportation': 'IS.VEH.NVEH.P3',   // Vehicles per 1000 people
  'Real Estate': 'NV.SRV.TOTL.ZS',      // Services value added (% of GDP)
};

/**
 * Fetch industry-related data from World Bank API
 * 
 * @param {string} industry - Industry name/category
 * @param {Object} options - Optional parameters
 * @returns {Promise<Object>} Market data object or null if not found
 */
async function fetchData(industry, options = {}) {
  try {
    console.log(`🏦 Fetching World Bank data for ${industry}...`);
    
    // Find matching indicator for this industry
    const indicatorMapping = findBestMatchingIndustry(industry, INDICATOR_MAPPINGS);
    const indicator = indicatorMapping?.indicator || INDICATOR_MAPPINGS.DEFAULT_GROWTH;
    
    // Years to fetch (default to recent years)
    const startYear = options.startYear || (new Date().getFullYear() - 4); // 4 years ago
    const endYear = options.endYear || (new Date().getFullYear() - 1); // last year (most recent available)
    
    // Make API request
    // World Bank API is public and doesn't require authentication
    const response = await axios.get(
      `https://api.worldbank.org/v2/country/all/indicator/${indicator}?format=json&per_page=1000&date=${startYear}:${endYear}`
    );
    
    // Check if we got valid data
    if (!response.data || !response.data[1] || response.data[1].length === 0) {
      console.log(`😬 No World Bank data found for ${industry} using indicator ${indicator}`);
      return { hasData: false, indicator };
    }
    
    // Process the data - Filter out nulls and calculate averages
    const valuesByYear = {};
    const valuesByCountry = {};
    let totalValue = 0;
    let valueCount = 0;
    
    response.data[1].forEach(item => {
      if (item.value !== null) {
        // Track by year
        if (!valuesByYear[item.date]) valuesByYear[item.date] = [];
        valuesByYear[item.date].push(item.value);
        
        // Track by country
        if (!valuesByCountry[item.country.value]) valuesByCountry[item.country.value] = [];
        valuesByCountry[item.country.value].push(item.value);
        
        // Track overall
        totalValue += item.value;
        valueCount++;
      }
    });
    
    // Skip if we don't have any valid data
    if (valueCount === 0) {
      console.log(`😬 No valid data points for ${industry} with indicator ${indicator}`);
      return { hasData: false, indicator };
    }
    
    // Calculate average across all years/countries
    const averageValue = totalValue / valueCount;
    
    // Calculate year-over-year growth rates where possible
    const growthRates = [];
    const years = Object.keys(valuesByYear).sort();
    
    for (let i = 1; i < years.length; i++) {
      const prevYear = years[i-1];
      const currYear = years[i];
      
      // Calculate average for each year
      const prevYearAvg = valuesByYear[prevYear].reduce((sum, val) => sum + val, 0) / valuesByYear[prevYear].length;
      const currYearAvg = valuesByYear[currYear].reduce((sum, val) => sum + val, 0) / valuesByYear[currYear].length;
      
      // Calculate YoY growth
      if (prevYearAvg > 0) { // Avoid division by zero
        const growth = (currYearAvg - prevYearAvg) / prevYearAvg;
        growthRates.push(growth);
      }
    }
    
    // Calculate average growth rate if we have enough data
    const averageGrowthRate = growthRates.length > 0 
      ? growthRates.reduce((sum, rate) => sum + rate, 0) / growthRates.length
      : null;
    
    // Get region totals for geographic distribution
    // Define major regions
    const regions = {
      'North America': ['USA', 'CAN'],
      'Europe': ['DEU', 'FRA', 'GBR', 'ITA', 'ESP', 'NLD', 'CHE', 'SWE', 'POL'],
      'Asia Pacific': ['CHN', 'JPN', 'KOR', 'IND', 'AUS', 'SGP', 'IDN', 'MYS', 'THA', 'VNM'],
      'Latin America': ['BRA', 'MEX', 'ARG', 'COL', 'CHL', 'PER'],
      'Middle East & Africa': ['ZAF', 'EGY', 'SAU', 'ARE', 'ISR', 'NGA', 'KEN']
    };
    
    // Calculate value by region 
    const valuesByRegion = {};
    let totalRegionValue = 0;
    
    // Sum values by region for all countries we can categorize
    Object.keys(valuesByCountry).forEach(country => {
      const countryValues = valuesByCountry[country];
      const avgCountryValue = countryValues.reduce((sum, val) => sum + val, 0) / countryValues.length;
      
      // Find which region this country belongs to
      let regionFound = false;
      
      for (const [region, countryCodes] of Object.entries(regions)) {
        if (countryCodes.includes(country)) {
          if (!valuesByRegion[region]) valuesByRegion[region] = 0;
          valuesByRegion[region] += avgCountryValue;
          totalRegionValue += avgCountryValue;
          regionFound = true;
          break;
        }
      }
      
      // If not found, put in "Rest of World"
      if (!regionFound) {
        if (!valuesByRegion['Rest of World']) valuesByRegion['Rest of World'] = 0;
        valuesByRegion['Rest of World'] += avgCountryValue;
        totalRegionValue += avgCountryValue;
      }
    });
    
    // Calculate regional percentages
    const geographicDistribution = {};
    if (totalRegionValue > 0) {
      for (const [region, value] of Object.entries(valuesByRegion)) {
        geographicDistribution[region] = value / totalRegionValue;
      }
    }
    
    // Process this data into a useful market data object
    const result = {
      hasData: true,
      source: "World Bank",
      sourceQuality: 4, // 1-5 scale, World Bank is trustworthy but limited for specific markets
      industryName: industry,
      indicator,
      indicatorName: getIndicatorName(indicator),
      
      // The World Bank doesn't provide direct market size estimates
      // It gives indicator values like "percentage of GDP" or "per capita" metrics
      globalMarketSize: null, // We can't reliably estimate market size from this data alone
      
      // Growth rate (if we could calculate it)
      growthRate: averageGrowthRate, 
      
      // Other data
      indicatorValue: averageValue,
      latestYear: Math.max(...years.map(y => parseInt(y))),
      geographicDistribution: Object.keys(geographicDistribution).length > 0 ? geographicDistribution : null,
      yearsIncluded: years,
      
      // Metadata
      confidence: growthRates.length > 1 ? "medium" : "low",
      notes: `Based on World Bank indicator ${indicator}. `+
             `Average value: ${averageValue.toFixed(2)}. `+
             `${growthRates.length > 0 ? `Average annual growth: ${(averageGrowthRate * 100).toFixed(2)}%` : 'Growth rate could not be calculated'}.`
    };
    
    console.log(`✅ Found World Bank data for ${industry} (indicator: ${indicator})`);
    return result;
  } catch (error) {
    console.error(`🚨 World Bank API error for ${industry}:`, error.message);
    return { 
      hasData: false, 
      error: error.message,
      indicator: findBestMatchingIndustry(industry, INDICATOR_MAPPINGS)?.indicator || INDICATOR_MAPPINGS.DEFAULT_GROWTH
    };
  }
}

/**
 * Get a human-readable name for World Bank indicator code
 */
function getIndicatorName(indicator) {
  const indicatorNames = {
    'NY.GDP.MKTP.KD.ZG': 'GDP Growth Rate',
    'NV.IND.MANF.ZS': 'Manufacturing (% of GDP)',
    'BX.GSR.CCIS.ZS': 'ICT Service Exports',
    'SH.XPD.CHEX.GD.ZS': 'Healthcare Expenditure (% of GDP)',
    'FS.AST.PRVT.GD.ZS': 'Financial Sector Depth',
    'NE.CON.PRVT.ZS': 'Household Consumption',
    'NV.AGR.TOTL.ZS': 'Agriculture Value Added',
    'EG.USE.PCAP.KG.OE': 'Energy Consumption Per Capita',
    'SE.XPD.TOTL.GD.ZS': 'Education Expenditure',
    'IT.CEL.SETS.P2': 'Mobile Subscriptions',
    'NV.IND.TOTL.ZS': 'Industry Value Added',
    'IS.VEH.NVEH.P3': 'Vehicles Per Capita',
    'NV.SRV.TOTL.ZS': 'Services Value Added'
  };
  
  return indicatorNames[indicator] || indicator;
}

/**
 * Convert World Bank indicator data to growth rate
 * This is a stretch - indicators aren't always growth-convertible
 */
function indicatorToGrowthRate(indicatorValue, industry) {
  // For direct growth rate indicators
  if (indicatorValue <= 0.5 && indicatorValue >= -0.5) { 
    // Looks like it's already a decimal growth rate
    return indicatorValue;
  }
  
  // For percentage of GDP indicators (rough estimate)
  if (indicatorValue < 100) {
    // This is more of a guess - we're assuming sectors with higher GDP share 
    // grow somewhat proportionally to that share.
    // Totally imperfect but better than nothing
    return 0.02 + (indicatorValue / 100) * 0.1; // Base 2% + up to 10% based on GDP share
  }
  
  return 0.05; // Default 5% when we can't make a reasonable estimate
}

module.exports = {
  fetchData,
  SOURCE_ID: 'world-bank'
};