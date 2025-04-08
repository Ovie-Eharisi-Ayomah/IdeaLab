/**
 * Few-shot examples for business idea classification
 * These examples are used to guide the LLM in understanding how to classify businesses
 */

/**
 * Returns a set of few-shot examples for LLM prompting
 * Each example includes:
 * - A business description
 * - A step-by-step reasoning process
 * - The final classification
 * 
 * @returns {Array<Object>} Array of example objects
 */
function getFewShotExamples() {
  return [
    {
      description: "We're building a platform that connects homeowners who have excess solar energy with local businesses that want to purchase clean energy. Our app shows real-time energy availability and manages the financial transactions between parties.",
      reasoning: `INDUSTRY ANALYSIS:
This business involves connecting homeowners with excess solar energy to businesses that want to purchase clean energy. I need to determine the primary industry and if a secondary industry is applicable.

Primary candidates for classification:
1. Energy - because the core value proposition relates to renewable energy trading
2. Technology - because it's a platform/app that facilitates connections

The primary focus is clearly on energy trading - specifically renewable solar energy. The platform enables homeowners to sell their excess solar power to businesses, which places it firmly in the Energy industry as the primary classification. 

However, the technology component is not merely incidental. The description mentions "Our app shows real-time energy availability and manages the financial transactions," indicating that the digital platform is a critical enabler of this business. The technology isn't just a sales channel but a core part of the service delivery. Therefore, Technology is a significant secondary industry.

Primary Industry: Energy - The fundamental value proposition is about trading renewable energy resources.
Secondary Industry: Technology - The digital platform is essential to enabling these energy transactions.

TARGET AUDIENCE ANALYSIS:
This business has two user groups:
1. Homeowners with excess solar energy (suppliers)
2. Local businesses wanting to purchase clean energy (buyers)

While both groups are essential for the marketplace to function, I need to identify the primary paying customer. Looking at the description "Our app shows real-time energy availability and manages the financial transactions between parties", it appears the platform facilitates businesses paying homeowners for energy. The businesses are the ones with the purchasing power and likely the ones generating revenue for the platform (probably through transaction fees). Therefore, Businesses are the primary target audience.

PRODUCT TYPE ANALYSIS:
This business offers a digital platform that connects two different user groups (homeowners and businesses) and facilitates transactions between them. This is a classic marketplace model, similar to Airbnb or Uber, where the business doesn't own the inventory (energy) but instead connects suppliers with buyers and takes a cut of transactions. While it's delivered as an app, the core product type is a Marketplace rather than just an app or software service.

REVIEW AND FINAL DECISION:
Looking at my analysis holistically:
- Primary Industry: Energy is most appropriate as the primary value relates to energy trading
- Secondary Industry: Technology is appropriate as the digital platform is essential to the service
- Target Audience: Businesses are the primary paying customers
- Product Type: Marketplace best describes the two-sided platform model`,
      classification: {
        primaryIndustry: "Energy",
        secondaryIndustry: "Technology",
        targetAudience: "Businesses",
        productType: "Marketplace"
      }
    },
    {
      description: "Our mobile app helps patients remember to take their medications by sending personalized reminders based on their prescription schedule. Users can track their adherence history and share reports with their healthcare providers. We offer a basic free version and a premium subscription with advanced features.",
      reasoning: `INDUSTRY ANALYSIS:
This business is a mobile app for medication reminders and tracking. There are two potential industries I should consider:
1. Healthcare - because it relates to medication management and patient care
2. Technology - because it's delivered as a mobile application

Looking deeper, this is a classic example of HealthTech - a business at the intersection of healthcare and technology. The core value proposition is helping patients manage their medications, which is fundamentally a healthcare concern. The app also allows sharing reports with healthcare providers, further embedding it in the healthcare ecosystem. However, the technology component is not merely incidental - the mobile app platform and digital tracking are integral to how the service works.

Primary Industry: Healthcare is most appropriate as the primary industry because the core value and purpose relate to medication management and health outcomes.

Secondary Industry: Technology is an appropriate secondary industry because the digital platform is central to the service delivery, not just an incidental channel.

TARGET AUDIENCE ANALYSIS:
The description specifically mentions "patients" who need to take medications according to prescription schedules. This clearly indicates individual consumers rather than businesses or healthcare providers as the primary users. While healthcare providers may receive reports, they are not the primary users of the app. The mention of "free version and premium subscription" further supports this as a consumer-oriented product. Therefore, the target audience is Consumers.

PRODUCT TYPE ANALYSIS:
This business delivers value through a mobile application with both free and premium tiers. While it has a subscription component, the primary way users interact with the service is through a mobile app. Looking at all possible product types, Mobile App is the most specific and accurate classification since it reflects both the delivery method and user experience. The subscription aspect is a business model rather than the product type itself.

REVIEW AND FINAL DECISION:
Looking at my analysis holistically:
- Primary Industry: Healthcare is most appropriate as medication management is a healthcare function
- Secondary Industry: Technology is appropriate as the digital platform is central to delivery
- Target Audience: Consumers (patients) are the primary users and customers
- Product Type: Mobile App best describes how users access and interact with the service

I considered making Technology the primary industry, but the healthcare purpose is more fundamental to the business's value proposition than the technology used to deliver it.`,
      classification: {
        primaryIndustry: "Healthcare",
        secondaryIndustry: "Technology",
        targetAudience: "Consumers",
        productType: "Mobile App"
      }
    },
    {
      description: "We deliver customized cooking kits with pre-measured ingredients and recipes to customers' homes on a weekly subscription basis. Customers can select meals through our website, specify dietary preferences, and pause or cancel anytime.",
      reasoning: `INDUSTRY ANALYSIS:
This business delivers cooking kits with pre-measured ingredients and recipes. I need to determine if it fits primarily in one industry or spans multiple industries.

Primary candidates for classification:
1. Food - because they are providing food ingredients and recipes
2. Retail - because they're selling physical products to consumers
3. Logistics - because delivery is involved

Looking at the core offering, this is primarily about food - specifically meal preparation. The ingredients and recipes are all food-related, and the primary value proposition is making cooking easier and more convenient. The Food industry is clearly the primary classification.

For a potential secondary industry, I could consider Retail since they're selling physical products, but this doesn't seem distinct enough from Food retail to warrant a secondary classification. The logistics/delivery component is merely a distribution channel rather than a defining feature of the business.

Primary Industry: Food - The core offering is food ingredients and recipes for meal preparation.
Secondary Industry: None - While there are retail and logistics components, they aren't significant enough to warrant a secondary industry classification.

TARGET AUDIENCE ANALYSIS:
The description mentions delivering "to customers' homes" and refers to features like selecting meals, specifying dietary preferences, etc. This clearly indicates this is targeting individual consumers or households rather than businesses. There's no mention of bulk orders, catering, or B2B services. The service is designed for people who want to cook at home but with added convenience. Therefore, Consumers is the appropriate target audience.

PRODUCT TYPE ANALYSIS:
This business has both physical and service elements:
1. Physical products - the ingredients in the cooking kits
2. Service - the curation, recipe development, and delivery
3. Subscription - weekly recurring delivery model

The core aspect that distinguishes this business model is the recurring, subscription-based delivery - "weekly subscription basis" with the ability to "pause or cancel anytime." While the physical product is important, the subscription nature is what defines the business model. Therefore, Subscription is the most accurate product type classification.

REVIEW AND FINAL DECISION:
Looking at my analysis holistically:
- Primary Industry: Food is most appropriate as the core offering is food ingredients and recipes
- Secondary Industry: None - there isn't a strong secondary industry that significantly shapes the business
- Target Audience: Consumers are clearly the target market
- Product Type: Subscription best captures the recurring delivery business model`,
      classification: {
        primaryIndustry: "Food",
        secondaryIndustry: null,
        targetAudience: "Consumers",
        productType: "Subscription"
      }
    },
    {
      description: "We're developing software for dental practices that automates appointment scheduling, sends reminders to patients, and integrates with billing systems. Dental offices pay a monthly fee based on the number of dentists in their practice.",
      reasoning: `INDUSTRY ANALYSIS:
This business provides specialized software for dental practices. I need to determine if it fits primarily in one industry or spans multiple industries.

Primary candidates for classification:
1. Healthcare - because it serves dental practices, which are healthcare providers
2. Technology - because it's software that automates business operations

This is a classic example of HealthTech - specifically software designed for healthcare providers. Looking at the core offering, it's software that helps dental practices with appointment scheduling, patient reminders, and billing integration. 

The primary value is delivered to healthcare providers (dental practices specifically), and the software addresses healthcare-specific needs. However, the business is fundamentally a software company developing tools for a specific vertical, making Technology a strong secondary industry.

Primary Industry: Healthcare - The product is specifically designed for dental practices with features tailored to healthcare operations.
Secondary Industry: Technology - The business is fundamentally creating and selling software solutions.

TARGET AUDIENCE ANALYSIS:
The description clearly states that "Dental offices pay a monthly fee based on the number of dentists in their practice." This identifies dental practices as the customers, which are businesses rather than individual consumers. These are specifically healthcare businesses, but from a target audience perspective, they fall under the business-to-business (B2B) classification. Therefore, Businesses is the appropriate target audience.

PRODUCT TYPE ANALYSIS:
The business is offering software with a recurring monthly fee structure based on usage (number of dentists). This is a classic Software as a Service (SaaS) model where:
1. The product is delivered as software
2. It's likely cloud-based (implied by the integration features)
3. It has a subscription pricing model
4. It's accessed remotely rather than installed on-premises (implied)

Therefore, SaaS is the most accurate product type classification.

REVIEW AND FINAL DECISION:
Looking at my analysis holistically:
- Primary Industry: Healthcare is most appropriate as the software is specifically designed for dental practices
- Secondary Industry: Technology is appropriate as the company is fundamentally a software provider
- Target Audience: Businesses (specifically dental practices) are the customers
- Product Type: SaaS best describes the software subscription business model`,
      classification: {
        primaryIndustry: "Healthcare",
        secondaryIndustry: "Technology",
        targetAudience: "Businesses",
        productType: "SaaS"
      }
    },
    {
      description: "Our consulting firm helps manufacturing companies implement sustainable practices to reduce waste and energy consumption. We assess their current operations, create customized sustainability roadmaps, and provide implementation support.",
      reasoning: `INDUSTRY ANALYSIS:
This business provides sustainability consulting services to manufacturing companies. I need to determine if it fits primarily in one industry or spans multiple.

Primary candidates for classification:
1. Professional Services - because they're providing consulting expertise
2. Energy - because they focus on energy consumption reduction
3. Manufacturing - because they serve manufacturing clients

The core offering is professional expertise in the form of sustainability consulting. They assess operations, create roadmaps, and support implementation - all classic consulting services. This places the business primarily in the Professional Services industry.

For a secondary industry, we could consider Energy or Environment since the consulting specifically focuses on sustainability, waste reduction, and energy consumption. This specialized focus is significant enough to warrant a secondary classification.

Primary Industry: Professional Services - The business provides expert consulting services.
Secondary Industry: Energy - The specific focus on energy consumption and sustainability is a significant specialization.

TARGET AUDIENCE ANALYSIS:
The description clearly states they help "manufacturing companies" implement sustainable practices. This identifies manufacturers as the customers, which are businesses rather than individual consumers. This is clearly a business-to-business (B2B) operation. Therefore, Businesses is the appropriate target audience.

PRODUCT TYPE ANALYSIS:
The business is offering expert services in sustainability, including assessment, planning, and implementation support. This is delivered through human expertise rather than software or physical products. The service appears to be customized for each client ("customized sustainability roadmaps") rather than standardized. This is a classic professional service model, making Service the most accurate product type classification.

REVIEW AND FINAL DECISION:
Looking at my analysis holistically:
- Primary Industry: Professional Services is most appropriate as the company provides expert consulting
- Secondary Industry: Energy is appropriate as the consulting specifically focuses on energy efficiency and sustainability
- Target Audience: Businesses (specifically manufacturing companies) are the customers
- Product Type: Service best describes the professional consulting business model`,
      classification: {
        primaryIndustry: "Professional Services",
        secondaryIndustry: "Energy",
        targetAudience: "Businesses",
        productType: "Service"
      }
    }
  ];
}

/**
 * Returns example business ideas for testing the classifier
 * 
 * @returns {Array<Object>} Array of test business ideas with expected classifications
 */
function getTestExamples() {
  return [
    {
      description: "We're creating an online marketplace where independent authors can sell their e-books directly to readers without going through traditional publishers. We handle the payment processing and digital rights management, taking a small percentage of each sale.",
      expectedClassification: {
        primaryIndustry: "Publishing",
        secondaryIndustry: "Technology",
        targetAudience: "Consumers",
        productType: "Marketplace"
      }
    },
    {
      description: "Our B2B software helps restaurants manage their inventory, track food costs, and reduce waste by predicting usage patterns based on historical data and upcoming reservations. Restaurants pay a monthly subscription, and we offer integration with popular POS systems.",
      expectedClassification: {
        primaryIndustry: "Food",
        secondaryIndustry: "Technology",
        targetAudience: "Businesses",
        productType: "SaaS"
      }
    },
    {
      description: "We manufacture and sell smart home devices that monitor water usage and automatically detect leaks. Our system sends alerts to homeowners' phones and can automatically shut off the water main if a serious leak is detected. The devices can be purchased online or through home improvement stores.",
      expectedClassification: {
        primaryIndustry: "Smart Home",
        secondaryIndustry: "Technology",
        targetAudience: "Consumers",
        productType: "Physical Product"
      }
    }
  ];
}

module.exports = {
  getFewShotExamples,
  getTestExamples
};