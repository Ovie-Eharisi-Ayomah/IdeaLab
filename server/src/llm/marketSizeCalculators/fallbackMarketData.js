// src/data/fallbackMarketData.js

/**
 * Fallback market data for common industries
 * Used when public API data is unavailable
 * 
 * Market sizes are in billions USD
 * Growth rates are in decimal form (e.g., 0.12 = 12%)
 * 
 * Sources:
 * - Industry reports (Statista, Grand View Research, etc.)
 * - Public company reports
 * - Market research publications
 */
module.exports = {
  // Technology Industries
  "SaaS": {
    globalMarketSize: 195.2,
    growthRate: 0.112,
    averageRevenuePerUser: 9600,
    geographicDistribution: {
      northAmerica: 0.48,
      europe: 0.29,
      asiaPacific: 0.18,
      restOfWorld: 0.05
    },
    competitiveIntensity: 0.78,
    sources: ["Gartner SaaS Forecast 2023", "IDC SaaS Market Analysis"]
  },
  "HealthTech": {
    globalMarketSize: 142.9,
    growthRate: 0.162,
    averageRevenuePerUser: 120,
    geographicDistribution: {
      northAmerica: 0.42,
      europe: 0.31,
      asiaPacific: 0.22,
      restOfWorld: 0.05
    },
    competitiveIntensity: 0.65,
    sources: ["Grand View Research Healthcare IT Market Size", "Statista Digital Health Market"]
  },
  "Ecommerce": {
    globalMarketSize: 5700, // $5.7 trillion
    growthRate: 0.089,
    averageRevenuePerUser: 840,
    geographicDistribution: {
      northAmerica: 0.22,
      europe: 0.21,
      asiaPacific: 0.48,
      restOfWorld: 0.09
    },
    competitiveIntensity: 0.92,
    sources: ["eMarketer Global Retail Ecommerce Forecast", "Statista E-Commerce Market"]
  },
  "EdTech": {
    globalMarketSize: 123.4,
    growthRate: 0.143,
    averageRevenuePerUser: 240,
    geographicDistribution: {
      northAmerica: 0.38,
      europe: 0.24,
      asiaPacific: 0.32,
      restOfWorld: 0.06
    },
    competitiveIntensity: 0.71,
    sources: ["HolonIQ EdTech Market Analysis", "Grand View Research EdTech Market Report"]
  },
  "Fintech": {
    globalMarketSize: 228.3,
    growthRate: 0.198,
    averageRevenuePerUser: 380,
    geographicDistribution: {
      northAmerica: 0.34,
      europe: 0.27,
      asiaPacific: 0.33,
      restOfWorld: 0.06
    },
    competitiveIntensity: 0.83,
    sources: ["CB Insights State of Fintech", "Statista FinTech Market"]
  },
  "Artificial Intelligence": {
    globalMarketSize: 150.2,
    growthRate: 0.362,
    averageRevenuePerUser: 15000,
    geographicDistribution: {
      northAmerica: 0.41,
      europe: 0.22,
      asiaPacific: 0.32,
      restOfWorld: 0.05
    },
    competitiveIntensity: 0.76,
    sources: ["Grand View Research AI Market", "IDC AI Market Forecast"]
  },
  
  // Consumer Goods & Services
  "Food & Beverage": {
    globalMarketSize: 7200, // $7.2 trillion
    growthRate: 0.043,
    averageRevenuePerUser: 2400,
    geographicDistribution: {
      northAmerica: 0.28,
      europe: 0.25,
      asiaPacific: 0.38,
      restOfWorld: 0.09
    },
    competitiveIntensity: 0.88,
    sources: ["Statista Food & Beverages Market", "Mordor Intelligence F&B Market"]
  },
  "Fashion Retail": {
    globalMarketSize: 1700, // $1.7 trillion
    growthRate: 0.033,
    averageRevenuePerUser: 750,
    geographicDistribution: {
      northAmerica: 0.25,
      europe: 0.32,
      asiaPacific: 0.36,
      restOfWorld: 0.07
    },
    competitiveIntensity: 0.91,
    sources: ["McKinsey Global Fashion Index", "Statista Apparel Market"]
  },
  "Travel & Tourism": {
    globalMarketSize: 1300, // $1.3 trillion (post-pandemic recovery)
    growthRate: 0.055,
    averageRevenuePerUser: 1300,
    geographicDistribution: {
      northAmerica: 0.23,
      europe: 0.38,
      asiaPacific: 0.31,
      restOfWorld: 0.08
    },
    competitiveIntensity: 0.82,
    sources: ["UNWTO Tourism Market Report", "Statista Travel & Tourism Market"]
  },
  
  // Business Services
  "Management Consulting": {
    globalMarketSize: 298.5,
    growthRate: 0.076,
    averageRevenuePerUser: 25000,
    geographicDistribution: {
      northAmerica: 0.45,
      europe: 0.31,
      asiaPacific: 0.19,
      restOfWorld: 0.05
    },
    competitiveIntensity: 0.69,
    sources: ["IBIS World Consulting Market", "Statista Business Consulting Market"]
  },
  "Digital Marketing": {
    globalMarketSize: 383.1,
    growthRate: 0.145,
    averageRevenuePerUser: 5500,
    geographicDistribution: {
      northAmerica: 0.42,
      europe: 0.28,
      asiaPacific: 0.25,
      restOfWorld: 0.05
    },
    competitiveIntensity: 0.87,
    sources: ["eMarketer Digital Ad Spending", "Dentsu Digital Ad Forecast"]
  },
  
  // Healthcare
  "Telemedicine": {
    globalMarketSize: 87.4,
    growthRate: 0.253,
    averageRevenuePerUser: 150,
    geographicDistribution: {
      northAmerica: 0.49,
      europe: 0.24,
      asiaPacific: 0.22,
      restOfWorld: 0.05
    },
    competitiveIntensity: 0.72,
    sources: ["Fortune Business Insights Telemedicine Market", "Grand View Research Telehealth Market"]
  },
  "Mental Health Apps": {
    globalMarketSize: 5.2,
    growthRate: 0.232,
    averageRevenuePerUser: 48,
    geographicDistribution: {
      northAmerica: 0.52,
      europe: 0.29,
      asiaPacific: 0.16,
      restOfWorld: 0.03
    },
    competitiveIntensity: 0.68,
    sources: ["Grand View Research Mental Health Apps Market", "Statista Mental Health App Market"]
  },
  
  // Emerging Markets
  "Virtual Reality": {
    globalMarketSize: 28.4,
    growthRate: 0.271,
    averageRevenuePerUser: 130,
    geographicDistribution: {
      northAmerica: 0.45,
      europe: 0.25,
      asiaPacific: 0.26,
      restOfWorld: 0.04
    },
    competitiveIntensity: 0.74,
    sources: ["IDC AR/VR Market Forecast", "Statista Virtual Reality Market"]
  },
  "Renewable Energy": {
    globalMarketSize: 953.6,
    growthRate: 0.188,
    averageRevenuePerUser: 8500,
    geographicDistribution: {
      northAmerica: 0.25,
      europe: 0.33,
      asiaPacific: 0.36,
      restOfWorld: 0.06
    },
    competitiveIntensity: 0.65,
    sources: ["IRENA Renewable Energy Statistics", "IEA World Energy Outlook"]
  },
  "Plant-based Foods": {
    globalMarketSize: 42.8,
    growthRate: 0.172,
    averageRevenuePerUser: 120,
    geographicDistribution: {
      northAmerica: 0.38,
      europe: 0.35,
      asiaPacific: 0.22,
      restOfWorld: 0.05
    },
    competitiveIntensity: 0.79,
    sources: ["Bloomberg Plant-Based Foods Market Report", "Good Food Institute Market Analysis"]
  }
};