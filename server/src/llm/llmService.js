// server/src/llm/llmService.js

require('dotenv').config();
const axios = require('axios');

/**
 * Call an LLM (OpenAI or Anthropic) with the provided prompt
 * @param {string} prompt - The prompt to send to the LLM
 * @param {Object} options - Additional options
 * @returns {string} LLM response text
 */
async function callLLM(prompt, options = {}) {
  // Default options
  const defaultOptions = {
    temperature: 0.3,
    maxTokens: 1000,
    service: process.env.LLM_SERVICE || 'openai' // 'openai' or 'anthropic'
  };
  
  const config = { ...defaultOptions, ...options };
  
  try {
    // Choose which service to use
    if (config.service.toLowerCase() === 'anthropic') {
      return await callAnthropic(prompt, config);
    } else {
      return await callOpenAI(prompt, config);
    }
  } catch (error) {
    console.error('LLM service error:', error.message);
    throw new Error(`LLM processing failed: ${error.message}`);
  }
}

/**
 * Call OpenAI API
 */
async function callOpenAI(prompt, config) {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    throw new Error('OpenAI API key is missing. Add OPENAI_API_KEY to your .env file');
  }
  
  const response = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: config.model || 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a business analysis expert specialized in market research and validation.'
        },
        { role: 'user', content: prompt }
      ],
      temperature: config.temperature,
      max_tokens: config.maxTokens
    },
    {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    }
  );
  
  return response.data.choices[0].message.content;
}

/**
 * Call Anthropic API
 */
// async function callAnthropic(prompt, config) {
//   const apiKey = process.env.ANTHROPIC_API_KEY;
  
//   if (!apiKey) {
//     throw new Error('Anthropic API key is missing. Add ANTHROPIC_API_KEY to your .env file');
//   }
  
//   const systemPrompt = 'You are a business analysis expert specialized in market research and validation.';
//   const fullPrompt = `${systemPrompt}\n\nHuman: ${prompt}\n\nAssistant:`;
  
//   const response = await axios.post(
//     'https://api.anthropic.com/v1/messages',
//     {
//       model: config.model || 'claude-3-opus-20240229',
//       messages: [
//         { role: 'user', content: prompt }
//       ],
//       system: systemPrompt,
//       temperature: config.temperature,
//       max_tokens: config.maxTokens
//     },
//     {
//       headers: {
//         'x-api-key': apiKey,
//         'anthropic-version': '2023-06-01',
//         'Content-Type': 'application/json'
//       }
//     }
//   );
  
//   return response.data.content[0].text;
// }

module.exports = {
  callLLM
};