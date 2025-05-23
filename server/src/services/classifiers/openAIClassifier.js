/**
 * OpenAI-based business idea classifier with few-shot and chain-of-thought prompting
 */
require('dotenv').config();
const { OpenAI } = require('openai');
const examples = require('./examples');
const { parseClassificationResponse } = require('./utils');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Classifies a business idea using OpenAI with few-shot and chain-of-thought prompting
 * 
 * @param {string} businessDescription - User's description of their business idea
 * @param {Object} options - Classification options
 * @param {boolean} options.includeReasoning - Whether to include reasoning in the response
 * @returns {Promise<Object>} Classification result with industry, audience, and product types
 */
async function classifyWithOpenAI(businessDescription, options = {}) {
  const { includeReasoning = true } = options;
  
  try {
    // Set timeout to prevent hanging requests
    const timeoutMs = 15000; // 15 seconds
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('OpenAI request timed out')), timeoutMs)
    );
    
    // Create the prompt with few-shot examples and enhanced chain-of-thought reasoning
    const systemPrompt = `You are an expert business analyst specializing in classifying business ideas into categories.
Your task is to classify the given business idea into three categories:
1. Industry (e.g., Healthcare, Education, Finance, Retail, Technology)
2. Target Audience (e.g., Consumers, Businesses, Government, Specific demographic)
3. Product Type (e.g., Physical product, SaaS, Marketplace, Service)

Use this specific step-by-step reasoning process for each classification:

STEP 1: INDUSTRY ANALYSIS
- Identify all industries mentioned or implied in the business description
- Consider the primary function or value proposition of the business
- Determine which industry represents the core focus (even if technology is used, the primary industry might be healthcare, finance, etc.)
- Identify a secondary industry if the business clearly operates at the intersection of multiple industries
- Examples of multi-industry businesses: HealthTech (Healthcare + Technology), FinTech (Finance + Technology), EdTech (Education + Technology)
- Be selective about assigning a secondary industry - only include one when it significantly influences the business model

STEP 2: TARGET AUDIENCE ANALYSIS
- Identify who will use or pay for the product/service
- If multiple audiences exist, determine the primary paying customer
- Consider whether the business is B2C (business to consumer), B2B (business to business), or B2G (business to government)
- Assess if there are specific demographics or specialized segments being targeted
- Select the audience category that best represents the main customer

STEP 3: PRODUCT TYPE ANALYSIS
- Determine the form in which value is delivered (software, physical product, service, content, etc.)
- Consider the delivery method and business model (one-time purchase, subscription, marketplace, etc.)
- Identify whether the offering is primarily digital or physical
- Evaluate if it's a platform connecting multiple parties or a direct product/service
- Select the product type that best describes how value is delivered to customers

STEP 4: REVIEW AND VALIDATE
- Review all three classifications together for consistency
- Consider alternative classifications and explain why your chosen ones are more appropriate
- Ensure the classifications are as specific as possible while remaining accurate`;
    
    const fewShotExamples = examples.getFewShotExamples();
    
    // Combine into a full prompt
    let userPrompt = `Here are some examples of business classifications:\n\n`;
    
    // Add few-shot examples
    fewShotExamples.forEach((example, index) => {
      userPrompt += `Example ${index + 1}:\nBusiness Description: ${example.description}\n\nThinking Process: ${example.reasoning}\n\nClassification:\nIndustry: ${example.classification.industry}\nTarget Audience: ${example.classification.targetAudience}\nProduct Type: ${example.classification.productType}\n\n`;
    });
    
    // Add the current business to classify with enhanced chain of thought instructions
    userPrompt += `Now, please classify the following business idea:\n\n${businessDescription}\n\n`;
    
    if (includeReasoning) {
      userPrompt += `Follow this specific format in your response:

INDUSTRY ANALYSIS:
[Walk through your step-by-step reasoning about which industry this business belongs to. Consider multiple possibilities and explain why you're selecting one over others.]

TARGET AUDIENCE ANALYSIS:
[Walk through your step-by-step reasoning about who the primary target audience is. Consider all potential customer types and explain why you're selecting one.]

PRODUCT TYPE ANALYSIS:
[Walk through your step-by-step reasoning about what type of product/service this is. Consider delivery methods and business models.]

REVIEW AND FINAL DECISION:
[Carefully review your analysis above and confirm or revise your initial classifications.]

CLASSIFICATION:
Primary Industry: [Final primary industry classification]
Secondary Industry: [Final secondary industry classification, or "None" if not applicable]
Target Audience: [Final target audience classification]
Product Type: [Final product type classification]`;
    } else {
      userPrompt += `Please provide your classification in the exact format shown in the examples.`;
    }
    
    // Make the OpenAI request with a timeout
    const openAIPromise = openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.1, // Lower temperature for more consistent results
      max_tokens: 800
    });
    
    // Race between the API call and the timeout
    const response = await Promise.race([openAIPromise, timeoutPromise]);
    
    // Parse the response content
    const content = response.choices[0].message.content;
    
    // --- ADDING LOGGING HERE ---
    console.log("--- OpenAI Raw Response Content ---");
    console.log(content);
    console.log("-----------------------------------");
    
    // Parse the classification from the response
    const parsedResult = parseClassificationResponse(content, includeReasoning);
    
    // --- ADDING LOGGING HERE ---
    console.log("--- Parsed Classification Result by classifyWithOpenAI ---");
    console.log(JSON.stringify(parsedResult, null, 2));
    console.log("---------------------------------------------------------");

    return parsedResult;
    
  } catch (error) {
    console.error('OpenAI classification error:', error);
    throw new Error(`OpenAI classification failed: ${error.message}`);
  }
}

module.exports = {
  classifyWithOpenAI
};