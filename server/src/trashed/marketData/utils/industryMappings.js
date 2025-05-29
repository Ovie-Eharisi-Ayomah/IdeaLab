// src/services/marketData/utils/industryMappings.js

/**
 * Industry mapping utilities
 * 
 * This is important because we need to translate between:
 * 1. User-friendly industry names ("AI assistants", "Mental health apps")
 * 2. Standard industry codes and categories used by data sources
 * 
 * Each data source has its own classification system:
 * - World Bank: Uses indicator codes
 * - BLS: Uses NAICS codes
 * - SEC: Uses SIC codes
 * 
 * This module handles the messy translation between them
 */

/**
 * Find the best matching industry in a mapping object
 * 
 * @param {string} industry - Our internal industry name
 * @param {Object} mappings - Object mapping industries to codes
 * @returns {Object|null} Best match with score and indicator
 */
function findBestMatchingIndustry(industry, mappings) {
  if (!industry || !mappings) return null;
  
  // 1. Check for exact match (case insensitive)
  const lowerIndustry = industry.toLowerCase();
  
  for (const [key, value] of Object.entries(mappings)) {
    if (key.toLowerCase() === lowerIndustry) {
      return {
        industry: key,
        indicator: value,
        matchScore: 1.0, // Perfect match
        matchType: 'exact'
      };
    }
  }
  
  // 2. Check for contained words
  const bestMatches = [];
  
  for (const [key, value] of Object.entries(mappings)) {
    const score = calculateSimilarityScore(industry, key);
    
    if (score > 0.4) { // Only consider reasonable matches
      bestMatches.push({
        industry: key,
        indicator: value,
        matchScore: score,
        matchType: 'partial'
      });
    }
  }
  
  // 3. Sort by score and return the best match (if any)
  if (bestMatches.length > 0) {
    bestMatches.sort((a, b) => b.matchScore - a.matchScore);
    return bestMatches[0];
  }
  
  // 4. No good match found, return null or default
  return {
    industry: 'DEFAULT',
    indicator: mappings.DEFAULT_GROWTH || Object.values(mappings)[0],
    matchScore: 0,
    matchType: 'fallback'
  };
}

/**
 * Calculate a similarity score between two industry strings
 * Uses a combination of techniques for better matching
 * 
 * @param {string} industry1 - First industry name
 * @param {string} industry2 - Second industry name
 * @returns {number} Similarity score (0-1)
 */
function calculateSimilarityScore(industry1, industry2) {
  if (!industry1 || !industry2) return 0;
  if (industry1.toLowerCase() === industry2.toLowerCase()) return 1;
  
  // Clean strings
  const str1 = industry1.toLowerCase().replace(/[^\w\s]/g, '');
  const str2 = industry2.toLowerCase().replace(/[^\w\s]/g, '');
  
  // 1. Check for contained words
  const words1 = str1.split(/\s+/);
  const words2 = str2.split(/\s+/);
  
  let sharedWords = 0;
  for (const word of words1) {
    if (word.length > 2 && words2.includes(word)) { // Only count meaningful words
      sharedWords++;
    }
  }
  
  const wordScore = sharedWords / Math.max(words1.length, words2.length);
  
  // 2. Check for substring containment
  let substringScore = 0;
  if (str1.includes(str2) || str2.includes(str1)) {
    substringScore = 0.8; // Strong signal that they're related
  }
  
  // 3. Check for character-level similarity (very basic implementation)
  let charScore = 0;
  const maxLength = Math.max(str1.length, str2.length);
  if (maxLength > 0) {
    const minLength = Math.min(str1.length, str2.length);
    
    // Count matching characters in sequence
    let matchingChars = 0;
    for (let i = 0; i < minLength; i++) {
      if (str1[i] === str2[i]) {
        matchingChars++;
      }
    }
    
    charScore = matchingChars / maxLength;
  }
  
  // Combine scores with weights
  return Math.max(
    wordScore * 0.6,       // Word matching is most important
    substringScore * 0.3,  // Substring containment is good signal
    charScore * 0.1        // Character matching is weakest signal
  );
}

/**
 * Maps our app's industry categories to NAICS codes (for BLS)
 * Just a sample - would need to be extended for production
 */
const NAICS_MAPPINGS = {
  // Technology sectors
  'Software': '511210', // Software Publishers
  'SaaS': '511210', // Software Publishers
  'Cloud Computing': '518210', // Data Processing, Hosting, and Related Services
  'IT Services': '541512', // Computer Systems Design Services
  'Cybersecurity': '541512', // Computer Systems Design Services
  'AI': '541512', // Computer Systems Design Services
  'Machine Learning': '541512', // Computer Systems Design Services
  
  // Healthcare
  'Healthcare': '621111', // Offices of Physicians
  'Health Tech': '621999', // All Other Outpatient Care Centers
  'Medical Devices': '339112', // Surgical and Medical Instrument Manufacturing
  'Biotech': '541711', // Research and Development in Biotechnology
  'Pharmaceuticals': '325412', // Pharmaceutical Preparation Manufacturing
  
  // Financial services
  'Fintech': '522320', // Financial Transactions Processing
  'Banking': '522110', // Commercial Banking
  'Insurance': '524126', // Direct Property and Casualty Insurance Carriers
  'Investment': '523920', // Portfolio Management
  
  // Consumer
  'Ecommerce': '454110', // Electronic Shopping and Mail-Order Houses
  'Retail': '452210', // Department Stores
  'Consumer Products': '339999', // All Other Miscellaneous Manufacturing
  'Food & Beverage': '311999', // All Other Miscellaneous Food Manufacturing
  
  // Other major sectors
  'Real Estate': '531210', // Offices of Real Estate Agents and Brokers
  'Education': '611310', // Colleges, Universities, and Professional Schools
  'Transportation': '485999', // All Other Transit and Ground Passenger Transportation
  'Energy': '221118', // Other Electric Power Generation
  'Agriculture': '111000', // Crop Production
  'Manufacturing': '339999' // All Other Miscellaneous Manufacturing
};

/**
 * Maps our app's industry categories to SIC codes (older system still used in some data)
 * Just a sample - would need to be extended for production
 */
const SIC_MAPPINGS = {
  // Technology sectors
  'Software': '7372', // Prepackaged Software
  'Computer Hardware': '3571', // Electronic Computers
  'IT Services': '7379', // Computer Related Services, NEC
  
  // Healthcare
  'Healthcare': '8000', // Health Services
  'Medical Devices': '3841', // Surgical and Medical Instruments
  'Biotech': '2836', // Biological Products, Except Diagnostic
  'Pharmaceuticals': '2834', // Pharmaceutical Preparations
  
  // Financial services
  'Banking': '6021', // National Commercial Banks
  'Insurance': '6311', // Life Insurance
  'Investment': '6211', // Security Brokers and Dealers
  
  // Consumer
  'Retail': '5200', // Retail Trade
  'Consumer Products': '3900', // Miscellaneous Manufacturing Industries
  'Food & Beverage': '2000', // Food and Kindred Products
};

module.exports = {
  findBestMatchingIndustry,
  calculateSimilarityScore,
  NAICS_MAPPINGS,
  SIC_MAPPINGS
};