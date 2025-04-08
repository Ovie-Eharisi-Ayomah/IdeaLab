/**
 * Customer Segmentation Module
 * 
 * This module identifies potential customer segments for a business idea
 * based on the business description and its classification.
 */

const { identifySegmentsWithLLM } = require('./llmSegmenter');
const { sanitizeInput } = require('../classifiers/utils');

/**
 * Identify customer segments for a business idea
 * 
 * @param {string} businessDescription - Description of the business idea
 * @param {Object} classificationResult - Result from the business classifier
 * @param {Object} options - Additional options
 * @param {number} options.numberOfSegments - Target number of segments to identify (default: 3)
 * @param {boolean} options.includeExcludedSegments - Whether to include segments that aren't good fits
 * @returns {Promise<Object>} Segmentation results
 */
async function identifyCustomerSegments(businessDescription, classificationResult, options = {}) {
  try {
    const {
      numberOfSegments = 3,
      includeExcludedSegments = true
    } = options;

    // Validate inputs
    if (!businessDescription || typeof businessDescription !== 'string') {
      throw new Error('Business description is required');
    }

    if (!classificationResult || !classificationResult.classification) {
      throw new Error('Classification result is required');
    }

    // Sanitize input
    const sanitizedDescription = sanitizeInput(businessDescription);

    // Extract classification details
    const { primaryIndustry, secondaryIndustry, targetAudience, productType } = classificationResult.classification;

    // Start with LLM-based segmentation
    console.log('Identifying customer segments with LLM...');
    const segments = await identifySegmentsWithLLM(
      sanitizedDescription, 
      { primaryIndustry, secondaryIndustry, targetAudience, productType },
      { numberOfSegments, includeExcludedSegments }
    );

    return {
      ...segments,
      analysisDetails: {
        basedOn: {
          businessDescription: sanitizedDescription.substring(0, 100) + (sanitizedDescription.length > 100 ? '...' : ''),
          classification: {
            primaryIndustry,
            secondaryIndustry: secondaryIndustry || 'None',
            targetAudience,
            productType
          }
        },
        method: 'llm',
        generatedAt: new Date().toISOString()
      }
    };
  } catch (error) {
    console.error('Segmentation error:', error);
    throw error;
  }
}

module.exports = {
  identifyCustomerSegments
};