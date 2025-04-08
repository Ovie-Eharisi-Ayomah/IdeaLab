// server/src/analysis/redditAnalysis.js

const { callLLM } = require('../llm/llmService'); // Your existing LLM service

/**
 * Analyze Reddit data using LLM to extract customer problems and sentiment
 * @param {Object} redditData - Processed Reddit data
 * @param {Object} extractedKeywords - Original keywords from extraction
 * @returns {Object} Advanced insights from LLM analysis
 */
async function analyzeRedditWithLLM(redditData, extractedKeywords) {
  try {
    // Prepare post content for analysis
    const analysisContent = prepareContentForAnalysis(redditData);
    
    // Create the analysis prompt
    const prompt = createAnalysisPrompt(analysisContent, extractedKeywords);
    
    // Call your LLM service
    const llmResponse = await callLLM(prompt);
    
    // Parse and validate the response
    return JSON.parse(llmResponse);
  } catch (error) {
    console.error("Reddit LLM analysis error:", error);
    return {
      customerProblems: [],
      marketSentiment: "unknown",
      insightConfidence: "low"
    };
  }
}

/**
 * Prepares Reddit content for LLM analysis
 */
function prepareContentForAnalysis(redditData) {
  // Select the most relevant content to fit within token limits
  const topPosts = redditData.topPosts || [];
  const otherPosts = redditData.rawPosts || [];
  
  // Format top posts with full content
  const formattedTopPosts = topPosts.map(post => ({
    title: post.title,
    content: post.selftext.slice(0, 500) + (post.selftext.length > 500 ? '...' : ''),
    upvotes: post.score,
    comments: post.num_comments,
    subreddit: post.subreddit
  }));
  
  // For other posts, just include titles to save tokens
  const formattedOtherPosts = otherPosts
    .filter(post => !topPosts.some(tp => tp.id === post.id)) // Exclude top posts
    .slice(0, 20) // Limit to 20 additional posts
    .map(post => ({
      title: post.title,
      upvotes: post.score,
      comments: post.num_comments,
      subreddit: post.subreddit
    }));
  
  return {
    topPosts: formattedTopPosts,
    otherPosts: formattedOtherPosts,
    totalPostsFound: redditData.postCount || 0,
    redditScore: redditData.redditScore || 0
  };
}

/**
 * Creates a prompt for LLM analysis of Reddit data
 */
function createAnalysisPrompt(analysisContent, extractedKeywords) {
  return `
You are an expert market analyst reviewing Reddit discussions related to a business idea:

BUSINESS IDEA KEYWORDS:
Core Problem: ${JSON.stringify(extractedKeywords.core_problem)}
Proposed Solution: ${JSON.stringify(extractedKeywords.proposed_solution)}
Target Market: ${JSON.stringify(extractedKeywords.target_market)}
Industry Context: ${JSON.stringify(extractedKeywords.industry_context)}

REDDIT DATA:
Total Posts Found: ${analysisContent.totalPostsFound}
Reddit Interest Score: ${analysisContent.redditScore}/100

TOP REDDIT POSTS:
${JSON.stringify(analysisContent.topPosts, null, 2)}

ADDITIONAL POST TITLES:
${analysisContent.otherPosts.map(p => `- "${p.title}" (r/${p.subreddit}, ${p.upvotes} upvotes, ${p.comments} comments)`).join('\n')}

Based on this Reddit data, analyze:

1. What specific customer problems are being discussed? Identify 3-5 clear problems.
2. What is the overall market sentiment toward solutions in this space?
3. Are there gaps between what users want and what existing solutions provide?
4. How passionate/engaged do people seem about this problem?
5. Does this problem appear to be growing or established?

Return your analysis as a JSON object with this structure:
{
  "customerProblems": [
    {
      "problem": "Clear description of the problem",
      "evidence": "Specific evidence from Reddit data",
      "intensity": "Score 1-10 indicating how strongly felt this problem is",
      "frequency": "Score 1-10 indicating how commonly mentioned this problem is"
    }
  ],
  "marketSentiment": "positive|negative|mixed|neutral",
  "sentimentDetails": "Explanation of the sentiment",
  "marketMaturity": "emerging|growing|established|saturated",
  "maturityEvidence": "Evidence for market maturity assessment",
  "unmetNeeds": ["List of potential gaps in the market"],
  "redditEngagement": "high|medium|low",
  "insightConfidence": "high|medium|low"
}
`;
}

module.exports = {
  analyzeRedditWithLLM
};