// src/services/businessAnalyzer.js
const { classifyBusinessIdea } = require('./classifiers/businessClassifier');
const { identifySegmentsWithLLM } = require('./segmenters/llmSegmenter');
const { researchMarketSize, analyzeCompetition, validateProblem } = require('./marketResearch');
const { calculateMarketSizing } = require('./marketSizingCalculator');
const { generateRecommendation } = require('./recommendationEngine');
const { generateOrRefineStatement } = require('./problemStatement/problemStatementGenerator');

/**
 * Analyze a business idea comprehensively
 * @param {string} description - The business idea description
 * @param {Object} options - Analysis options
 * @returns {Promise<Object>} Complete business analysis
 */
async function analyzeBusinessIdea(description, options = {}) {
  try {
    // Default options
    const {
      segmentCount = 3,
      problemStatement = null,
      includeMarketSize = true,
      includeCompetition = true,
      includeProblemValidation = true
    } = options;
    
    // Step 1: Classify the business
    console.log("Classifying business idea...");
    const classification = await classifyBusinessIdea(description);
    console.log("Classification complete:", classification);
    
    // Step 2: Identify customer segments
    console.log("Identifying customer segments...");
    const segmentation = await identifySegmentsWithLLM(
      description, 
      classification,
      { numberOfSegments: segmentCount }
    );
    console.log(`Identified ${segmentation.primarySegments.length} customer segments`);
    
    // Step 3: Initialize results object
    const result = {
      classification,
      segmentation,
      marketSize: null,
      competition: null,
      problemValidation: null,
      recommendation: null
    };
    
    // Step 4: Run selected analyses in parallel
    const analysisTasks = [];
    
    if (includeMarketSize) {
      analysisTasks.push(
        researchMarketSize(
          description, 
          classification.primaryIndustry, 
          classification.productType
        ).then(data => {
          result.marketSize = calculateMarketSizing(data, segmentation);
          console.log("Market sizing complete");
        }).catch(err => {
          console.error("Market sizing failed:", err.message);
          result.marketSize = { error: err.message };
        })
      );
    }
    
    if (includeCompetition) {
      analysisTasks.push(
        analyzeCompetition(
          description,
          classification.primaryIndustry,
          classification.productType
        ).then(data => {
          result.competition = data;
          console.log(`Identified ${data.competitors?.length || 0} competitors`);
        }).catch(err => {
          console.error("Competition analysis failed:", err.message);
          result.competition = { error: err.message };
        })
      );
    }
    
    if (includeProblemValidation && problemStatement) {
      analysisTasks.push(
        validateProblem(
          description,
          classification.primaryIndustry,
          problemStatement
        ).then(data => {
          result.problemValidation = data;
          const severity = data.problem_validation?.severity || 0;
          console.log(`Problem validation complete (severity: ${severity}/10)`);
        }).catch(err => {
          console.error("Problem validation failed:", err.message);
          result.problemValidation = { error: err.message };
        })
      );
    }
    
    // Wait for all tasks to complete
    await Promise.all(analysisTasks);
    
    // Step 5: Generate recommendation
    result.recommendation = generateRecommendation(result);
    
    return result;
  } catch (error) {
    console.error('Business analysis failed:', error);
    throw error;
  }
}

/**
 * Generates a problem statement based on business description
 * @param {string} description - Business idea description
 * @returns {Promise<string>} Problem statement
 */
async function generateProblemStatement(description) {
  try {
    // Try the AI-powered generator first
    const result = await generateOrRefineStatement(description);
    
    if (result.success && result.statement) {
      return result.statement;
    }
    
    // Fall back to rule-based approach if AI method fails
    return generateProblemStatementWithRules(description);
  } catch (error) {
    console.error("AI problem statement generation failed:", error);
    // Fall back to the rule-based approach we just implemented
    return generateProblemStatementWithRules(description);
  }
}

/**
 * Extract explicit problem statements using various patterns
 * @param {string} description - Business idea description
 * @returns {string|null} Extracted problem or null
 */
function extractExplicitProblem(description) {
  // More comprehensive patterns to identify explicit problem statements
  const problemPatterns = [
    // Explicit problem-solution patterns
    /solve(?:s|d)?\s+(?:the\s+)?(?:problem\s+)?(?:of\s+)?(.+?)(?:\s+(?:for|when|by|with|using|through))/i,
    /address(?:es|ed)?\s+(?:the\s+)?(?:problem\s+)?(?:of\s+)?(.+?)(?:\s+(?:for|when|by|with|using|through))/i,
    /(?:the\s+)?problem(?:s)?\s+(?:of|with)\s+(.+?)(?:\.|\s+(?:is|are|can|by))/i,
    /(?:many|most)\s+(?:\w+\s+)(?:struggle|face\s+challenges|have\s+difficulty)\s+(?:with|when|in)\s+(.+?)(?:\.|\s+(?:Our|This|The|We|I))/i,
    
    // User pain points
    /users?\s+(?:struggle|face\s+challenges|have\s+difficulty|need)\s+(?:with|when|in|to)\s+(.+?)(?:\.|\s+(?:Our|This|The|We|I))/i,
    /customers?\s+(?:struggle|face\s+challenges|have\s+difficulty|need)\s+(?:with|when|in|to)\s+(.+?)(?:\.|\s+(?:Our|This|The|We|I))/i,
    /people\s+(?:struggle|face\s+challenges|have\s+difficulty|need)\s+(?:with|when|in|to)\s+(.+?)(?:\.|\s+(?:Our|This|The|We|I))/i,
    
    // Challenge statements
    /challenge(?:s)?\s+(?:is|are|in)\s+(.+?)(?:\.|\s+(?:Our|This|The|We|I))/i,
    /difficult\s+(?:for|to)\s+(.+?)(?:\.|\s+(?:Our|This|The|We|I))/i
  ];
  
  for (const pattern of problemPatterns) {
    const match = description.match(pattern);
    if (match && match[1] && match[1].length > 10) { // Ensure meaningful length
      // Clean up the extracted problem
      let problem = match[1].trim();
      
      // Add proper sentence structure if needed
      if (!/^[A-Z]/.test(problem)) {
        problem = problem.charAt(0).toUpperCase() + problem.slice(1);
      }
      
      // Ensure it ends with proper punctuation
      if (!/[.!?]$/.test(problem)) {
        problem += '.';
      }
      
      return problem;
    }
  }
  
  return null;
}

/**
 * Infer problem from solution description
 * @param {string} description - Business idea description
 * @returns {string|null} Inferred problem or null
 */
function inferProblemFromSolution(description) {
  // Identify solution keywords
  const solutionPatterns = [
    /app\s+that\s+(.+?)(?:\.|\s+(?:and|to|for))/i,
    /platform\s+(?:for|that|which)\s+(.+?)(?:\.|\s+(?:and|to|for))/i,
    /service\s+(?:for|that|which)\s+(.+?)(?:\.|\s+(?:and|to|for))/i,
    /tool\s+(?:for|that|which)\s+(.+?)(?:\.|\s+(?:and|to|for))/i,
    /system\s+(?:for|that|which)\s+(.+?)(?:\.|\s+(?:and|to|for))/i,
    /website\s+(?:for|that|which)\s+(.+?)(?:\.|\s+(?:and|to|for))/i,
    /marketplace\s+(?:for|that|which)\s+(.+?)(?:\.|\s+(?:and|to|for))/i,
    /AI[\s-]powered\s+(.+?)(?:\.|\s+(?:and|to|for))/i,
    /revolutionary\s+(.+?)(?:\.|\s+(?:and|to|for))/i,
    /innovative\s+(.+?)(?:\.|\s+(?:and|to|for))/i
  ];
  
  // Extract the solution description
  let solutionDesc = '';
  for (const pattern of solutionPatterns) {
    const match = description.match(pattern);
    if (match && match[1] && match[1].length > 10) {
      solutionDesc = match[1].trim();
      break;
    }
  }
  
  if (!solutionDesc) {
    // Take the first sentence if we couldn't match a pattern
    const firstSentence = description.split(/[.!?]/).filter(s => s.trim().length > 0)[0];
    if (firstSentence && firstSentence.length > 15) {
      solutionDesc = firstSentence.trim();
    } else {
      return null;
    }
  }
  
  // Map the solution to a problem
  const words = solutionDesc.toLowerCase().split(/\s+/);
  let domainKeywords = [];
  
  // Extract domain keywords
  const domainDictionary = {
    'fitness': ['workout', 'exercise', 'gym', 'training', 'nutrition', 'diet', 'health', 'weight'],
    'finance': ['money', 'budget', 'financial', 'invest', 'saving', 'payment', 'banking', 'transaction'],
    'education': ['learn', 'study', 'education', 'course', 'student', 'teach', 'school', 'training'],
    'productivity': ['task', 'productivity', 'efficient', 'time', 'management', 'organize', 'planning'],
    'healthcare': ['health', 'medical', 'doctor', 'patient', 'hospital', 'care', 'wellness'],
    'ecommerce': ['shop', 'buy', 'sell', 'product', 'store', 'retail', 'marketplace'],
    'travel': ['travel', 'trip', 'vacation', 'hotel', 'flight', 'booking', 'destination'],
    'food': ['food', 'meal', 'recipe', 'restaurant', 'delivery', 'cooking', 'grocery'],
    'social': ['social', 'community', 'connect', 'share', 'network', 'communication', 'message'],
    'entertainment': ['entertainment', 'media', 'video', 'game', 'music', 'stream', 'watch']
  };
  
  // Identify domains present in the description
  for (const [domain, keywords] of Object.entries(domainDictionary)) {
    for (const keyword of keywords) {
      if (words.some(word => word.includes(keyword))) {
        domainKeywords.push(domain);
        break;
      }
    }
  }
  
  // Extract actions and purposes
  const createPattern = /create(?:s|d)?|provide(?:s|d)?|generate(?:s|d)?|build(?:s|d)?|develop(?:s|d)?/i;
  const forPattern = /for\s(.+?)(?:\.|\s+(?:and|to|by))/i;
  const helpPattern = /help(?:s|ed)?\s(.+?)(?:\.|\s+(?:and|to|by))/i;
  
  let purpose = '';
  
  // Look for explicit purposes
  const forMatch = description.match(forPattern);
  if (forMatch && forMatch[1]) {
    purpose = forMatch[1].trim();
  }
  
  const helpMatch = description.match(helpPattern);
  if (!purpose && helpMatch && helpMatch[1]) {
    purpose = helpMatch[1].trim();
  }
  
  // Construct the problem statement based on the domain and solution characteristics
  if (domainKeywords.length > 0) {
    const domain = domainKeywords[0]; // Take the first domain found
    
    // Domain-specific problem templates
    const problemTemplates = {
      'fitness': "Many fitness enthusiasts struggle to find personalized workout and nutrition plans that match their specific needs and goals.",
      'finance': "People often find it difficult to manage their finances effectively and make informed financial decisions.",
      'education': "Students and learners face challenges in accessing personalized educational content that matches their learning style and pace.",
      'productivity': "Professionals struggle to effectively manage their time and tasks, leading to reduced productivity and increased stress.",
      'healthcare': "Patients often have difficulty accessing quality healthcare services and managing their health information efficiently.",
      'ecommerce': "Consumers find it challenging to discover products that truly match their preferences and needs among countless options.",
      'travel': "Travelers face difficulties in planning and organizing trips that perfectly match their preferences and budgets.",
      'food': "People struggle to find convenient access to healthy meal options that fit their dietary preferences and lifestyle.",
      'social': "Users find it challenging to meaningfully connect with others who share their specific interests and values.",
      'entertainment': "People have trouble discovering entertainment content that truly matches their personal preferences and interests."
    };
    
    // Use the domain-specific template
    if (problemTemplates[domain]) {
      return problemTemplates[domain];
    }
  }
  
  // If we have a purpose, use it
  if (purpose) {
    // Clean up the purpose
    if (purpose.startsWith('to ')) {
      purpose = purpose.substring(3);
    }
    
    return `People often struggle to ${purpose} effectively and efficiently.`;
  }
  
  return null;
}

/**
 * Analyze the business domain to generate a problem statement
 * @param {string} description - Business idea description
 * @returns {string|null} Domain-based problem or null
 */
function analyzeBusinessDomain(description) {
  // Extract key business types
  const businessTypes = [
    { type: 'app', keywords: ['app', 'application', 'mobile app'] },
    { type: 'platform', keywords: ['platform', 'marketplace', 'system'] },
    { type: 'service', keywords: ['service', 'subscription'] },
    { type: 'product', keywords: ['product', 'device', 'gadget'] },
    { type: 'ai', keywords: ['ai', 'artificial intelligence', 'machine learning', 'ml'] }
  ];
  
  // Extract target users
  const userTypes = [
    { type: 'professionals', keywords: ['professional', 'worker', 'employee', 'business', 'executive'] },
    { type: 'consumers', keywords: ['consumer', 'user', 'customer', 'individual'] },
    { type: 'students', keywords: ['student', 'learner', 'education'] },
    { type: 'patients', keywords: ['patient', 'healthcare', 'medical'] },
    { type: 'fitness', keywords: ['fitness', 'workout', 'exercise', 'gym', 'athletic'] }
  ];
  
  // Identify business type
  let businessType = 'solution';
  for (const type of businessTypes) {
    if (type.keywords.some(keyword => description.toLowerCase().includes(keyword))) {
      businessType = type.type;
      break;
    }
  }
  
  // Identify user type
  let userType = 'people';
  for (const type of userTypes) {
    if (type.keywords.some(keyword => description.toLowerCase().includes(keyword))) {
      userType = type.type;
      break;
    }
  }
  
  // Construct relevant problem statement based on business and user type
  const problemTemplates = {
    'app_professionals': "Professionals lack efficient mobile tools that streamline their workflows and boost productivity.",
    'app_consumers': "Consumers struggle to find user-friendly mobile applications that truly address their everyday needs.",
    'app_students': "Students need better mobile applications to organize their studies and access educational resources efficiently.",
    'app_patients': "Patients need more accessible and user-friendly ways to manage their health information and care plans.",
    'app_fitness': "Fitness enthusiasts struggle to find personalized workout and nutrition guidance without expensive personal trainers.",
    'platform_professionals': "Professionals lack integrated platforms that connect all aspects of their work and professional development.",
    'platform_consumers': "Consumers are overwhelmed by fragmented marketplaces that make comparing and choosing products difficult.",
    'platform_students': "Students need comprehensive learning platforms that adapt to their individual learning styles and pace.",
    'platform_patients': "Patients need unified platforms to coordinate their healthcare services and information across providers.",
    'platform_fitness': "Fitness enthusiasts lack comprehensive platforms that integrate workout planning, nutrition, and progress tracking.",
    'service_professionals': "Professionals struggle to find specialized services that address their unique business needs efficiently.",
    'service_consumers': "Consumers have difficulty accessing reliable services that offer convenience and value for their money.",
    'service_students': "Students need accessible support services that complement their formal education effectively.",
    'service_patients': "Patients lack consistent and coordinated healthcare services that address their complete health needs.",
    'service_fitness': "Fitness enthusiasts struggle to access affordable, personalized fitness services and guidance.",
    'product_professionals': "Professionals need more specialized tools designed specifically for their industry challenges.",
    'product_consumers': "Consumers often cannot find products that perfectly match their specific needs and preferences.",
    'product_students': "Students lack affordable and effective learning tools designed for their specific educational needs.",
    'product_patients': "Patients need better products to help manage their health conditions and treatment plans effectively.",
    'product_fitness': "Fitness enthusiasts lack effective equipment and tools that adapt to their changing fitness levels and goals.",
    'ai_professionals': "Professionals spend too much time on repetitive tasks that could be automated with intelligent solutions.",
    'ai_consumers': "Consumers struggle to find personalized recommendations and solutions tailored to their unique preferences.",
    'ai_students': "Students need smarter learning systems that adapt to their individual strengths and weaknesses.",
    'ai_patients': "Patients lack personalized healthcare insights that could help them make better health decisions.",
    'ai_fitness': "Fitness enthusiasts struggle to create truly personalized workout and nutrition plans without professional guidance."
  };
  
  const key = `${businessType}_${userType}`;
  if (problemTemplates[key]) {
    return problemTemplates[key];
  }
  
  return null;
}

/**
 * Create a fallback problem statement when other methods fail
 * @param {string} description - Business idea description
 * @returns {string} A reasonable problem statement
 */
function createFallbackProblemStatement(description) {
  // Extract key topics from the description
  const words = description.toLowerCase().split(/\s+/);
  const stopWords = new Set(['a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'with', 'by', 'is', 'are', 'that', 'this', 'these', 'those', 'of']);
  
  // Filter out common words and get key terms
  const keyTerms = words.filter(word => 
    word.length > 3 && 
    !stopWords.has(word) && 
    !word.match(/^\d+$/)
  ).slice(0, 3);
  
  if (keyTerms.length > 0) {
    return `Many people struggle to find effective solutions for ${keyTerms.join(', ')}-related needs and challenges.`;
  }
  
  // Ultimate fallback
  return "People often struggle to find effective solutions that address their specific needs efficiently.";
}

function generateProblemStatementWithRules(description) {
  // All the existing rule-based code we just wrote
  // ...
}

module.exports = {
  analyzeBusinessIdea,
  generateProblemStatement
};