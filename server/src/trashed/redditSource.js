// server/src/api/dataSources/redditSource.js

const axios = require('axios');

/**
 * Collects and analyzes data from Reddit based on keywords
 * @param {Object} extractedKeywords - Keywords from the extraction module
 * @returns {Object} Processed Reddit insights
 */
async function getRedditInsights(extractedKeywords) {
  try {
    console.log("🔍 Searching Reddit for relevant discussions...");
    
    // Create search terms from our extracted keywords
    const searchTerms = createSearchTerms(extractedKeywords);
    
    // Determine which subreddits to search based on the business idea
    const relevantSubreddits = determineRelevantSubreddits(extractedKeywords);
    
    console.log(`📊 Searching ${relevantSubreddits.length} subreddits with terms: ${searchTerms.slice(0, 3).join(', ')}...`);
    
    // Collect posts from relevant subreddits
    const posts = await collectRedditPosts(searchTerms, relevantSubreddits);
    
    console.log(`✅ Collected ${posts.length} relevant Reddit posts`);
    
    // Process the collected data
    return analyzeRedditData(posts, extractedKeywords);
    
  } catch (error) {
    console.error("Reddit data collection error:", error);
    return {
      success: false,
      error: error.message,
      posts: [],
      insights: {
        customerProblems: [],
        sentiment: "unknown",
        marketSaturation: "unknown"
      }
    };
  }
}

/**
 * Creates effective search terms from extracted keywords
 */
function createSearchTerms(extractedKeywords) {
  const searchTerms = [];
  
  // Add primary problem keywords
  if (extractedKeywords.core_problem && extractedKeywords.core_problem.primary) {
    searchTerms.push(...extractedKeywords.core_problem.primary);
  }
  
  // Add solution keywords
  if (extractedKeywords.proposed_solution && extractedKeywords.proposed_solution.approach) {
    searchTerms.push(...extractedKeywords.proposed_solution.approach);
  }
  
  // Add specific search terms if available
  if (extractedKeywords.search_terms && extractedKeywords.search_terms.length > 0) {
    searchTerms.push(...extractedKeywords.search_terms.slice(0, 5));
  }
  
  // Clean up and deduplicate
  return [...new Set(searchTerms.filter(term => term.length > 3))];
}

/**
 * Determines relevant subreddits based on the business idea
 */
function determineRelevantSubreddits(extractedKeywords) {
  // Default subreddits that cover general business and entrepreneurship
  const defaultSubreddits = ['Entrepreneur', 'smallbusiness', 'startups'];
  
  // Map industry sectors to relevant subreddits
  const subredditMapping = {
    // Tech
    'tech': ['technology', 'TechStartups', 'SideProject'],
    'software': ['software', 'webdev', 'programming'],
    'app': ['androidapps', 'iosapps', 'AppIdeas'],
    'mobile': ['androidapps', 'iosapps', 'mobile'],
    
    // Health & Wellness
    'health': ['health', 'wellness', 'Fitness'],
    'fitness': ['Fitness', 'bodybuilding', 'loseit'],
    'food': ['EatCheapAndHealthy', 'food', 'Cooking'],
    
    // Remote Work
    'remote work': ['remotework', 'digitalnomad', 'WorkOnline'],
    'workspace': ['remotework', 'coworkingspaces', 'digitalnomad'],
    
    // Sustainability
    'eco': ['ZeroWaste', 'sustainability', 'Green'],
    'sustainable': ['sustainability', 'ZeroWaste', 'Green'],
    
    // E-commerce
    'ecommerce': ['ecommerce', 'FulfillmentByAmazon', 'Entrepreneur'],
    'subscription': ['Subscription_Boxes', 'ecommerce', 'Entrepreneur'],
    
    // General
    'problems': ['firstworldproblems', 'LifeProTips', 'DoesAnybodyElse']
  };
  
  // Collect relevant subreddits based on keywords
  const customSubreddits = new Set();
  
  // Check industry context
  if (extractedKeywords.industry_context && extractedKeywords.industry_context.sector) {
    extractedKeywords.industry_context.sector.forEach(sector => {
      // Check each word in the sector
      sector.toLowerCase().split(' ').forEach(word => {
        if (subredditMapping[word]) {
          subredditMapping[word].forEach(sub => customSubreddits.add(sub));
        }
      });
      
      // Also check the whole sector phrase
      if (subredditMapping[sector.toLowerCase()]) {
        subredditMapping[sector.toLowerCase()].forEach(sub => customSubreddits.add(sub));
      }
    });
  }
  
  // Add target market based subreddits
  if (extractedKeywords.target_market && extractedKeywords.target_market.demographics) {
    extractedKeywords.target_market.demographics.forEach(demo => {
      if (subredditMapping[demo.toLowerCase()]) {
        subredditMapping[demo.toLowerCase()].forEach(sub => customSubreddits.add(sub));
      }
    });
  }
  
  // Combine default with custom, removing duplicates
  return [...new Set([...defaultSubreddits, ...customSubreddits])];
}

/**
 * Collects relevant posts from Reddit using search terms
 */
async function collectRedditPosts(searchTerms, subreddits, limit = 100) {
  const allPosts = [];
  const processedIds = new Set(); // To avoid duplicates
  
  // We'll use a simple approach with the Reddit JSON API
  // This doesn't require authentication for basic searching
  for (const subreddit of subreddits) {
    // Don't overwhelm the API with too many requests at once
    if (allPosts.length >= limit) break;
    
    try {
      // We're combining terms with OR to get more results
      const searchQuery = searchTerms.slice(0, 3).join(' OR ');
      
      // Use the Reddit JSON API to search
      const response = await axios.get(
        `https://www.reddit.com/r/${subreddit}/search.json?q=${encodeURIComponent(searchQuery)}&restrict_sr=1&limit=25&sort=relevance`,
        {
          headers: {
            'User-Agent': 'IdeaLab-ResearchBot/1.0'
          }
        }
      );
      
      if (response.data && response.data.data && response.data.data.children) {
        // Process each post
        for (const post of response.data.data.children) {
          // Skip if we already have this post
          if (processedIds.has(post.data.id)) continue;
          processedIds.add(post.data.id);
          
          // Extract the relevant data
          allPosts.push({
            id: post.data.id,
            title: post.data.title,
            selftext: post.data.selftext || '',
            score: post.data.score,
            upvote_ratio: post.data.upvote_ratio,
            num_comments: post.data.num_comments,
            created_utc: post.data.created_utc,
            subreddit: post.data.subreddit,
            url: `https://www.reddit.com${post.data.permalink}`
          });
        }
      }
      
      // Small delay to be nice to Reddit's servers
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.warn(`Error searching r/${subreddit}: ${error.message}`);
      // Continue with other subreddits
    }
  }
  
  return allPosts;
}

/**
 * Analyzes collected Reddit posts to extract insights
 */
function analyzeRedditData(posts, extractedKeywords) {
  // Sort posts by engagement (a combination of score and comments)
  const sortedPosts = [...posts].sort((a, b) => {
    const engagementA = a.score + (a.num_comments * 3); // Comments weighted higher
    const engagementB = b.score + (b.num_comments * 3);
    return engagementB - engagementA;
  });
  
  // Get top posts by engagement
  const topPosts = sortedPosts.slice(0, 10);
  
  // For the MVP, we'll return the processed data
  // In a future version, you'll use the LLM to analyze this data
  return {
    success: true,
    postCount: posts.length,
    topPosts: topPosts,
    redditScore: calculateRedditScore(posts),
    engagement: {
      totalScore: posts.reduce((sum, post) => sum + post.score, 0),
      totalComments: posts.reduce((sum, post) => sum + post.num_comments, 0),
      averageUpvoteRatio: posts.reduce((sum, post) => sum + (post.upvote_ratio || 0), 0) / posts.length
    },
    // We'll add LLM-based analysis later
    rawPosts: posts
  };
}

/**
 * Calculates a simple Reddit score to gauge interest
 */
function calculateRedditScore(posts) {
  if (posts.length === 0) return 0;
  
  // Calculate a weighted score based on upvotes, comments, and recency
  let totalScore = 0;
  
  for (const post of posts) {
    // Base score from post score (upvotes)
    let postScore = post.score;
    
    // Comments indicate engagement, weight them higher
    postScore += post.num_comments * 3;
    
    // Recency matters - posts within last 6 months get a boost
    const sixMonthsAgo = Date.now() / 1000 - (180 * 24 * 60 * 60);
    if (post.created_utc > sixMonthsAgo) {
      postScore *= 1.5;
    }
    
    totalScore += postScore;
  }
  
  // Normalize to 0-100 scale
  // More posts should increase the score, but with diminishing returns
  const normalizedScore = Math.min(100, Math.sqrt(posts.length) * Math.sqrt(totalScore) / 5);
  
  return Math.round(normalizedScore);
}

module.exports = {
  getRedditInsights
};