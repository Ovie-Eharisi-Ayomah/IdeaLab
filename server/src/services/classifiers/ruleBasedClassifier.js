/**
 * Rule-based business idea classifier using TF-IDF and keyword matching
 * This serves as the final fallback when LLM-based approaches fail
 */

/**
 * Simple rule-based classification system using keyword matching
 * 
 * @param {string} businessDescription - User's description of their business idea
 * @returns {Promise<Object>} Classification result
 */
async function classifyWithRules(businessDescription) {
  try {
    const lowerDescription = businessDescription.toLowerCase();
    
    // Define industry keywords with weights
    const industryKeywords = {
      'Healthcare': ['health', 'medical', 'doctor', 'patient', 'hospital', 'clinic', 'wellness', 'fitness', 'therapy'],
      'Education': ['education', 'learning', 'teach', 'student', 'school', 'course', 'training', 'skill', 'knowledge'],
      'Finance': ['finance', 'banking', 'invest', 'money', 'payment', 'loan', 'credit', 'financial', 'insurance'],
      'Retail': ['retail', 'shop', 'store', 'ecommerce', 'product', 'consumer', 'merchandise', 'brand', 'selling'],
      'Technology': ['tech', 'software', 'app', 'digital', 'platform', 'online', 'data', 'AI', 'algorithm', 'mobile'],
      'Food': ['food', 'restaurant', 'meal', 'dining', 'kitchen', 'chef', 'recipe', 'catering', 'culinary', 'grocery'],
      'Transportation': ['transport', 'delivery', 'logistics', 'shipping', 'travel', 'vehicle', 'driver', 'mobility'],
      'Real Estate': ['real estate', 'property', 'housing', 'home', 'apartment', 'rent', 'lease', 'building', 'space'],
      'Entertainment': ['entertainment', 'media', 'game', 'video', 'music', 'film', 'content', 'streaming', 'creative'],
      'Energy': ['energy', 'power', 'utility', 'electricity', 'solar', 'renewable', 'gas', 'sustainable', 'green']
    };
    
    // Define audience keywords
    const audienceKeywords = {
      'Consumers': ['consumer', 'individual', 'personal', 'people', 'user', 'customer', 'public', 'household', 'family'],
      'Businesses': ['business', 'company', 'corporate', 'enterprise', 'organization', 'firm', 'startup', 'commercial', 'industry'],
      'Government': ['government', 'public sector', 'administration', 'municipal', 'city', 'state', 'federal', 'agency'],
      'Healthcare Providers': ['hospital', 'clinic', 'doctor', 'physician', 'nurse', 'medical', 'provider', 'healthcare system'],
      'Students': ['student', 'learner', 'education', 'school', 'university', 'college', 'academic', 'classroom'],
      'Parents': ['parent', 'family', 'child', 'kid', 'mom', 'dad', 'guardian', 'home'],
      'Elderly': ['elderly', 'senior', 'aging', 'retirement', 'older adults'],
      'Professional': ['professional', 'worker', 'employee', 'job', 'career', 'occupation']
    };
    
    // Define product type keywords
    const productTypeKeywords = {
      'Physical Product': ['product', 'device', 'hardware', 'equipment', 'material', 'item', 'gadget', 'machine'],
      'SaaS': ['software', 'saas', 'platform', 'cloud', 'subscription', 'service', 'application', 'tool', 'solution'],
      'Marketplace': ['marketplace', 'platform', 'network', 'connect', 'matching', 'two-sided', 'buyers and sellers'],
      'Service': ['service', 'consulting', 'support', 'assistance', 'help', 'advisor', 'professional service'],
      'Mobile App': ['app', 'mobile', 'smartphone', 'ios', 'android', 'application'],
      'E-commerce': ['ecommerce', 'e-commerce', 'online store', 'shop', 'retail', 'selling'],
      'Subscription': ['subscription', 'recurring', 'monthly', 'membership'],
      'Content': ['content', 'media', 'publication', 'information', 'resource']
    };
    
    // Count matches for each category
    function countMatches(keywords, text) {
      const result = {};
      
      for (const [category, terms] of Object.entries(keywords)) {
        let count = 0;
        
        for (const term of terms) {
          // Check if the term is in the text (as a whole word)
          const regex = new RegExp(`\\b${term}\\b`, 'i');
          if (regex.test(text)) {
            count += 1;
          }
        }
        
        result[category] = count;
      }
      
      return result;
    }
    
    // Find the primary and secondary categories with the most matches
    function findBestMatches(matches) {
      let primaryCategory = null;
      let secondaryCategory = null;
      let primaryCount = -1;
      let secondaryCount = -1;
      
      // Sort categories by match count in descending order
      const sortedCategories = Object.entries(matches)
        .sort((a, b) => b[1] - a[1]);
      
      // Get the primary category (highest match count)
      if (sortedCategories.length > 0) {
        primaryCategory = sortedCategories[0][0];
        primaryCount = sortedCategories[0][1];
      }
      
      // Get the secondary category (second highest match count)
      if (sortedCategories.length > 1 && sortedCategories[1][1] > 0) {
        // Only set secondary if it has at least one match
        secondaryCategory = sortedCategories[1][0];
        secondaryCount = sortedCategories[1][1];
        
        // If secondary count is too low compared to primary, don't include it
        if (secondaryCount < primaryCount / 3) {
          secondaryCategory = null;
        }
      }
      
      // If we don't have any matches, provide defaults
      if (primaryCount === 0) {
        primaryCategory = 'Other';
      }
      
      return {
        primary: primaryCategory,
        secondary: secondaryCategory
      };
    }
    
    // Run the matching algorithms
    const industryMatches = countMatches(industryKeywords, lowerDescription);
    const audienceMatches = countMatches(audienceKeywords, lowerDescription);
    const productTypeMatches = countMatches(productTypeKeywords, lowerDescription);
    
    // Get the best matches
    const industryResults = findBestMatches(industryMatches);
    const primaryIndustry = industryResults.primary;
    const secondaryIndustry = industryResults.secondary;
    const targetAudience = findBestMatches(audienceMatches).primary;
    const productType = findBestMatches(productTypeMatches).primary;
    
    return {
      classification: {
        primaryIndustry,
        secondaryIndustry,
        targetAudience,
        productType
      },
      confidence: 'low', // Rule-based classification always has low confidence
      method: 'rule-based'
    };
    
  } catch (error) {
    console.error('Rule-based classification error:', error);
    
    // Even if the rule-based classification fails, return a generic classification
    // since this is our last resort
    return {
      classification: {
        primaryIndustry: 'Other',
        secondaryIndustry: null,
        targetAudience: 'Consumers',
        productType: 'Service'
      },
      confidence: 'very low',
      method: 'rule-based',
      error: error.message
    };
  }
}

module.exports = {
  classifyWithRules
};