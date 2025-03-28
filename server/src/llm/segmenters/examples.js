/**
 * Few-shot examples for customer segmentation
 */

/**
 * Get example segmentation analyses for few-shot prompting
 * 
 * @returns {Array} Array of examples
 */
function getSegmentationExamples() {
  return [
    // Example 1: Meal kit delivery service
    {
      businessDescription: "We deliver customized cooking kits with pre-measured ingredients and recipes to customers' homes on a weekly subscription basis. Customers can select meals through our website, specify dietary preferences, and pause or cancel anytime.",
      classification: {
        primaryIndustry: "Food",
        secondaryIndustry: null,
        targetAudience: "Consumers",
        productType: "Subscription"
      },
      segmentationAnalysis: `PRIMARY SEGMENTS:

1. Busy Urban Professionals
Description: Working professionals (25-45) in urban areas with above-average income, limited time for grocery shopping and meal preparation, but who value healthy, home-cooked meals.
Percentage: 40%
Demographics:
- Age range: 25-45
- Income level: Middle to upper-middle
- Education: College degree or higher
- Location: Urban and dense suburban areas
- Household: Singles and couples without children
Psychographics:
- Values: Convenience, health, quality ingredients, work-life balance
- Lifestyle: Career-focused, time-constrained, socially active
- Pain points: Limited time for cooking, desire for healthy alternatives to takeout
Behaviors:
- Tech adoption: High (comfortable with digital platforms)
- Price elasticity: Medium (willing to pay premium for convenience)
- Cooking experience: Basic to intermediate
- Decision factors: Time-saving, meal variety, portion control
Growth potential: High
Acquisition channels: Instagram, professional networks, urban digital advertising

2. Health-Conscious Parents
Description: Parents (30-45) with young children who prioritize nutritious family meals but struggle with time constraints and meal planning.
Percentage: 30%
Demographics:
- Age range: 30-45
- Income level: Middle to upper-middle
- Education: Mixed education levels
- Location: Suburban areas
- Household: Families with young children
Psychographics:
- Values: Family health, nutrition, teaching children about food
- Lifestyle: Family-oriented, scheduled, wellness-focused
- Pain points: Limited time, picky eaters, desire for nutritious kid-friendly options
Behaviors:
- Tech adoption: Medium to high
- Price elasticity: Medium (value-focused)
- Cooking experience: Intermediate
- Decision factors: Nutrition, family-friendly recipes, portion sizes
Growth potential: Medium-high
Acquisition channels: Parenting blogs, school partnerships, family-oriented social media

3. Culinary Enthusiasts
Description: Food hobbyists (25-60) who enjoy cooking but want to expand their skills and try new recipes without the hassle of research and shopping.
Percentage: 20%
Demographics:
- Age range: 25-60 (broad)
- Income level: Middle to upper
- Education: Mixed education levels
- Location: Mixed urban/suburban
- Household: Varied household types
Psychographics:
- Values: Culinary exploration, quality ingredients, authenticity
- Lifestyle: Food-focused, experience-seeking
- Pain points: Finding specialty ingredients, recipe discovery
Behaviors:
- Tech adoption: Medium to high
- Price elasticity: Medium-low (willing to pay for quality and uniqueness)
- Cooking experience: Intermediate to advanced
- Decision factors: Recipe uniqueness, ingredient quality, cuisine variety
Growth potential: Medium
Acquisition channels: Cooking shows, food blogs, culinary social media groups

SECONDARY SEGMENTS:

1. Diet-Restricted Consumers
Description: People with specific dietary needs (gluten-free, keto, vegan, etc.) who struggle to find convenient meal options that meet their requirements.
Percentage: 10%
Growth potential: High (growing dietary awareness market)
Acquisition challenges: Requires specialized menu options, ingredient transparency

EXCLUDED SEGMENTS:

1. Budget-Constrained Households
Description: Lower-income families prioritizing food cost above convenience or variety.
Reason: Meal kit pricing is too high compared to budget grocery shopping, leading to high acquisition cost and low retention.

2. Cooking Avoiders
Description: Individuals who strongly prefer ready-to-eat meals and have no interest in cooking.
Reason: Poor product-market fit as these customers want fully prepared meals rather than meal kits.

MARKET INSIGHTS:
Segmentation confidence: High
Primary segment overlap: Moderate overlap between busy professionals and health-conscious parents
Underserved segments: Diet-restricted consumers represent a growing opportunity
Competitive pressure: High for urban professionals, moderate for other segments
Segmentation implications: Marketing should emphasize different benefits for each segment (time-saving for professionals, nutrition for parents, culinary exploration for enthusiasts)`
    },
    
    // Example 2: Finance app
    {
      businessDescription: "Our personal finance app helps users track spending, create budgets, and achieve savings goals. It connects securely to users' bank accounts and credit cards to automatically categorize transactions, provides insights on spending patterns, and sends alerts for unusual activity or when approaching budget limits.",
      classification: {
        primaryIndustry: "Finance",
        secondaryIndustry: "Technology",
        targetAudience: "Consumers",
        productType: "Mobile App"
      },
      segmentationAnalysis: `PRIMARY SEGMENTS:

1. Young Professionals Building Financial Habits
Description: Young adults (22-35) in early to mid-career stages who are establishing financial independence and building good money habits.
Percentage: 35%
Demographics:
- Age range: 22-35
- Income level: Entry to mid-level salaries
- Education: College educated
- Location: Urban and suburban areas
- Occupation: Early to mid-career professionals
Psychographics:
- Values: Financial security, career advancement, work-life balance
- Lifestyle: Career-focused, socially active, digitally connected
- Pain points: Student loans, building credit, balancing current lifestyle with future goals
Behaviors:
- Tech adoption: Early adopters
- Financial literacy: Basic to intermediate
- Banking behavior: Digital-first, multiple accounts
- Decision factors: Ease of use, visual data presentation, actionable insights
Growth potential: High
Acquisition channels: Social media, professional networks, financial wellness programs

2. Budget-Conscious Families
Description: Parents (30-45) managing household finances who need to track and optimize spending across multiple categories and family members.
Percentage: 25%
Demographics:
- Age range: 30-45
- Income level: Middle income
- Education: Mixed education levels
- Location: Suburban areas
- Household: Families with children
Psychographics:
- Values: Family security, responsible spending, future planning
- Lifestyle: Family-oriented, practical, value-seeking
- Pain points: Childcare costs, planning for education, balancing current needs with savings
Behaviors:
- Tech adoption: Pragmatic adopters
- Financial literacy: Varied
- Banking behavior: Mix of traditional and digital
- Decision factors: Comprehensive budgeting features, family sharing options, savings tools
Growth potential: Medium-high
Acquisition channels: Family finance blogs, parenting platforms, school financial literacy programs

3. Debt Reducers
Description: Adults (25-50) actively working to reduce credit card debt, student loans, or other liabilities through disciplined budgeting and spending tracking.
Percentage: 20%
Demographics:
- Age range: 25-50
- Income level: Variable
- Education: Mixed education levels
- Location: Diverse
- Financial situation: Carrying moderate to high debt loads
Psychographics:
- Values: Financial freedom, progress tracking, debt elimination
- Lifestyle: Disciplined, goal-oriented
- Pain points: High interest payments, multiple debt sources, maintaining motivation
Behaviors:
- Tech adoption: Moderate
- Financial literacy: Growing through necessity
- Banking behavior: Multiple credit accounts
- Decision factors: Debt payoff features, progress visualization, actionable cost-cutting insights
Growth potential: High
Acquisition channels: Debt reduction communities, finance blogs, credit improvement services

SECONDARY SEGMENTS:

1. Financial Independence Seekers
Description: Individuals (30-45) pursuing aggressive savings and investment goals aimed at early retirement or financial independence.
Percentage: 10%
Growth potential: Medium
Acquisition challenges: High expectations for advanced features and investment integrations

2. Financial Novices
Description: Young adults (18-25) with limited financial experience who need guidance on basic financial concepts and establishing initial budgets.
Percentage: 10%
Growth potential: High (lifetime value potential)
Acquisition challenges: Limited financial resources, need for educational content

EXCLUDED SEGMENTS:

1. Traditional Banking Loyalists
Description: Older adults (55+) who prefer in-person banking and paper-based finance tracking.
Reason: Strong resistance to digital financial tools, high customer education costs, low adoption likelihood

2. High-Net-Worth Individuals
Description: Wealthy individuals with complex financial situations requiring personalized wealth management.
Reason: Product lacks advanced investment features and personalized advisory services needed by this segment

MARKET INSIGHTS:
Segmentation confidence: High
Primary segment overlap: Moderate overlap between young professionals and debt reducers
Underserved segments: Financial novices represent a long-term growth opportunity
Competitive pressure: High for young professionals, moderate for other segments
Segmentation implications: Interface design and feature prioritization should align with the different financial goals and literacy levels of each segment`
    }
  ];
}

module.exports = {
  getSegmentationExamples
};