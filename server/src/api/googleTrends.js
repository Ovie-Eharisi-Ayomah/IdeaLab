// server/src/api/googleTrends.js

const googleTrends = require('google-trends-api');

/**
 * Fetches Google Trends data for a set of keywords
 * @param {Object} extractedKeywords - The structured keywords from extraction
 * @returns {Object} Processed Google Trends data
 */
async function fetchGoogleTrendsData(extractedKeywords) {
  try {
    // Select the most relevant search terms from the extraction
    const searchTerms = selectSearchTerms(extractedKeywords);
    
    console.log("📊 Fetching Google Trends data for terms:", searchTerms);
    
    // Get interest over time for primary keywords (last 12 months)
    const interestOverTime = await Promise.all(
      searchTerms.map(async (term) => {
        try {
          console.log(`Fetching interest over time for term: ${term}`);
          const result = await googleTrends.interestOverTime({
            keyword: term,
            startTime: new Date(Date.now() - (365 * 24 * 60 * 60 * 1000)), // 1 year ago
            granularTimeResolution: true,
          });
          
          if (!result) {
            console.warn(`No data returned for term: ${term}`);
            return {
              term,
              data: { default: { timelineData: [] } }
            };
          }
          
          return {
            term,
            data: JSON.parse(result)
          };
        } catch (termError) {
          console.error(`Error fetching data for term "${term}":`, termError);
          return {
            term,
            data: { default: { timelineData: [] } }
          };
        }
      })
    );
    
    // Get related queries for each term
    const relatedQueries = await Promise.all(
      searchTerms.slice(0, 3).map(async (term) => { // Limit to top 3 terms to avoid rate limiting
        try {
          console.log(`Fetching related queries for term: ${term}`);
          const result = await googleTrends.relatedQueries({
            keyword: term
          });
          
          if (!result) {
            console.warn(`No related queries returned for term: ${term}`);
            return {
              term,
              data: { default: { rankedList: [] } }
            };
          }
          
          return {
            term,
            data: JSON.parse(result)
          };
        } catch (termError) {
          console.error(`Error fetching related queries for term "${term}":`, termError);
          return {
            term,
            data: { default: { rankedList: [] } }
          };
        }
      })
    );
    
    // Format the data for easier consumption
    return processGoogleTrendsData(interestOverTime, relatedQueries);
    
  } catch (error) {
    console.error("Google Trends data fetching error:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      response: error.response
    });
    throw new Error("Failed to fetch Google Trends data");
  }
}

/**
 * Selects the most relevant search terms from extracted keywords
 * @param {Object} extractedKeywords - The structured keywords from extraction
 * @returns {Array} Array of search terms to use with Google Trends
 */
function selectSearchTerms(extractedKeywords) {
  // Start with any explicit search terms provided
  let searchTerms = extractedKeywords.search_terms || [];
  
  // If we don't have explicit search terms or need more, build from structured data
  if (searchTerms.length < 5) {
    // Add primary problem keywords
    if (extractedKeywords.core_problem && extractedKeywords.core_problem.primary) {
      searchTerms = searchTerms.concat(extractedKeywords.core_problem.primary);
    }
    
    // Add solution approach keywords
    if (extractedKeywords.proposed_solution && extractedKeywords.proposed_solution.approach) {
      searchTerms = searchTerms.concat(extractedKeywords.proposed_solution.approach);
    }
    
    // Add key industry terms
    if (extractedKeywords.industry_context && extractedKeywords.industry_context.sector) {
      searchTerms = searchTerms.concat(extractedKeywords.industry_context.sector);
    }
  }
  
  // Remove duplicates and limit to reasonable number (5-8 terms is good for testing)
  return [...new Set(searchTerms)].slice(0, 8);
}

/**
 * Processes and formats Google Trends data for easier consumption
 * @param {Array} interestOverTime - Interest over time data from Google Trends
 * @param {Array} relatedQueries - Related queries data from Google Trends
 * @returns {Object} Processed Google Trends data
 */
function processGoogleTrendsData(interestOverTime, relatedQueries) {
  // Extract the time series data for each term
  const timeSeriesData = interestOverTime.map(item => {
    const timelineData = item.data.default.timelineData;
    
    return {
      term: item.term,
      timeline: timelineData.map(point => ({
        date: point.formattedTime,
        value: point.value[0]
      }))
    };
  });
  
  // Extract rising and top related queries
  const processedRelatedQueries = relatedQueries.map(item => {
    const relatedData = item.data.default;
    
    return {
      term: item.term,
      rising: relatedData.rankedList[0]?.rankedKeyword || [],
      top: relatedData.rankedList[1]?.rankedKeyword || []
    };
  });
  
  // Calculate some simple metrics for quick insights
  const metrics = calculateTrendsMetrics(timeSeriesData);
  
  return {
    timeSeriesData,
    relatedQueries: processedRelatedQueries,
    metrics
  };
}

/**
 * Calculates simple metrics from Google Trends data
 * @param {Array} timeSeriesData - Processed time series data
 * @returns {Object} Simple metrics about the trends
 */
function calculateTrendsMetrics(timeSeriesData) {
  return timeSeriesData.map(item => {
    const values = item.timeline.map(point => point.value);
    
    // Skip calculation if we have no data
    if (values.length === 0) {
      return {
        term: item.term,
        average: 0,
        trend: 'no_data'
      };
    }
    
    // Calculate average interest
    const average = values.reduce((sum, val) => sum + val, 0) / values.length;
    
    // Determine if trend is rising (compare first quarter to last quarter)
    const quarterLength = Math.floor(values.length / 4);
    const firstQuarter = values.slice(0, quarterLength);
    const lastQuarter = values.slice(-quarterLength);
    
    const firstQuarterAvg = firstQuarter.reduce((sum, val) => sum + val, 0) / firstQuarter.length;
    const lastQuarterAvg = lastQuarter.reduce((sum, val) => sum + val, 0) / lastQuarter.length;
    
    let trend;
    if (lastQuarterAvg > firstQuarterAvg * 1.1) {
      trend = 'rising';
    } else if (lastQuarterAvg < firstQuarterAvg * 0.9) {
      trend = 'falling';
    } else {
      trend = 'stable';
    }
    
    return {
      term: item.term,
      average: Math.round(average * 100) / 100,
      trend
    };
  });
}

module.exports = {
  fetchGoogleTrendsData
};