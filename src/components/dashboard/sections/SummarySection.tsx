import React from 'react';
import { 
  Check, 
  X, 
  AlertTriangle, 
  Users, 
  Target, 
  BarChart2, 
  TrendingUp,
  Clock,
  Award,
  Shield,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import SectionCard from '../shared/SectionCard';
import InsightItem from '../shared/InsightItem';
import RecommendationItem from '../shared/RecommendationItem';
import '../Components.css';

interface RecommendationData {
  recommendation: 'GO' | 'CONDITIONAL_GO' | 'NO_GO' | 'NEEDS_RESEARCH';
  score: number;
  confidence: number;
  reasoning: string | string[];
  key_insights?: string[];
  risks?: string[];
  opportunities?: string[];
  next_steps?: string[];
  market_timing?: {
    assessment: 'OPTIMAL' | 'GOOD' | 'FAIR' | 'POOR';
    score: number;
    factors?: string[];
    recommendation?: string;
  };
  risk_adjusted_score?: {
    base_score: number;
    adjusted_score: number;
    risk_factors?: string[];
    confidence_impact?: 'HIGH' | 'MEDIUM' | 'LOW';
  };
  metadata?: {
    confidence_factors?: {
      overall_confidence?: number;
      confidence_level?: 'HIGH' | 'MEDIUM' | 'LOW';
    };
  };
}

interface SummarySectionProps {
  businessIdea: string;
  analysisDate: string;
  score: number;
  primaryIndustry: string;
  secondaryIndustry: string;
  productType: string;
  targetAudience: string;
  insights: {
    segmentation: string | null;
    problem: string | null;
    competition: string | null;
    market: string | null;
  };
  recommendations: Array<{
    type: 'positive' | 'warning' | 'negative';
    title: string;
    description: string;
  }>;
  recommendationData?: RecommendationData | null;
  onNavigate: (section: string) => void;
}

const SummarySection: React.FC<SummarySectionProps> = ({
  businessIdea,
  analysisDate,
  score,
  primaryIndustry,
  secondaryIndustry,
  productType,
  targetAudience,
  insights,
  recommendations,
  recommendationData,
  onNavigate
}) => {
  const finalScore = recommendationData?.score || score;
  const finalRecommendation = recommendationData?.recommendation;
  const confidence = recommendationData?.confidence;
  const marketTiming = recommendationData?.market_timing;
  const riskAdjustedScore = recommendationData?.risk_adjusted_score;

  const getStatusIcon = (score: number, recommendation?: string) => {
    if (recommendation) {
      switch (recommendation) {
        case 'GO':
          return <CheckCircle className="h-6 w-6 text-green-600" />;
        case 'CONDITIONAL_GO':
          return <AlertTriangle className="h-6 w-6 text-yellow-600" />;
        case 'NO_GO':
          return <XCircle className="h-6 w-6 text-red-600" />;
        default:
          return <AlertCircle className="h-6 w-6 text-gray-600" />;
      }
    }
    
    if (score >= 70) {
      return <Check className="h-6 w-6 text-green-600" />;
    } else if (score >= 50) {
      return <AlertTriangle className="h-6 w-6 text-yellow-600" />;
    } else {
      return <X className="h-6 w-6 text-red-600" />;
    }
  };

  const getStatusMessage = (score: number, recommendation?: string) => {
    if (recommendation) {
      switch (recommendation) {
        case 'GO': return 'GO';
        case 'CONDITIONAL_GO': return 'CONDITIONAL GO';
        case 'NO_GO': return 'NO-GO';
        default: return 'NEEDS RESEARCH';
      }
    }
    
    if (score >= 70) {
      return 'GO';
    } else if (score >= 50) {
      return 'PROCEED WITH CAUTION';
    } else {
      return 'NO-GO';
    }
  };

  const getStatusDescription = (score: number, recommendation?: string) => {
    if (recommendation) {
      switch (recommendation) {
        case 'GO': 
          return 'Strong opportunity with promising market potential';
        case 'CONDITIONAL_GO': 
          return 'Promising opportunity with conditions to address';
        case 'NO_GO': 
          return 'Significant challenges identified - reconsider or pivot';
        default: 
          return 'More research needed before making a decision';
      }
    }
    
    if (score >= 70) {
      return 'Strong opportunity with promising market potential';
    } else if (score >= 50) {
      return 'Moderate opportunity with some significant risks';
    } else {
      return 'Significant challenges identified - reconsider or pivot';
    }
  };

  const getStatusClass = (score: number, recommendation?: string) => {
    if (recommendation) {
      switch (recommendation) {
        case 'GO': return 'success';
        case 'CONDITIONAL_GO': return 'warning';
        case 'NO_GO': return 'error';
        default: return 'info';
      }
    }
    
    if (score >= 70) {
      return 'success';
    } else if (score >= 50) {
      return 'warning';
    } else {
      return 'error';
    }
  };

  const getRecommendationIcon = (type: string) => {
    switch(type) {
      case 'positive':
        return <Check className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'negative':
        return <X className="h-5 w-5 text-red-500" />;
      default:
        return <Check className="h-5 w-5 text-green-500" />;
    }
  };

  const enhancedRecommendations = React.useMemo(() => {
    const enhanced: Array<{
      type: 'positive' | 'warning' | 'negative';
      title: string;
      description: string;
    }> = [];
    
    if (recommendationData) {
      if (recommendationData.key_insights) {
        recommendationData.key_insights.slice(0, 2).forEach(insight => {
          enhanced.push({
            type: 'positive' as const,
            title: 'Key Insight',
            description: insight
          });
        });
      }
      
      if (recommendationData.opportunities) {
        recommendationData.opportunities.slice(0, 1).forEach(opportunity => {
          enhanced.push({
            type: 'positive' as const,
            title: 'Market Opportunity',
            description: opportunity
          });
        });
      }
      
      if (recommendationData.risks) {
        recommendationData.risks.slice(0, 2).forEach(risk => {
          enhanced.push({
            type: 'warning' as const,
            title: 'Risk to Consider',
            description: risk
          });
        });
      }
      
      if (recommendationData.next_steps) {
        recommendationData.next_steps.slice(0, 1).forEach(step => {
          enhanced.push({
            type: 'positive' as const,
            title: 'Next Step',
            description: step
          });
        });
      }
    }
    
    if (enhanced.length < 3) {
      return [...enhanced, ...recommendations.slice(0, 5 - enhanced.length)];
    }
    
    return enhanced.slice(0, 5);
  }, [recommendationData, recommendations]);

  return (
    <>
      <SectionCard
        title={getStatusMessage(finalScore, finalRecommendation)}
        subtitle={getStatusDescription(finalScore, finalRecommendation)}
        icon={
          <div className={`section-card-icon-wrapper ${getStatusClass(finalScore, finalRecommendation)}`}>
            {getStatusIcon(finalScore, finalRecommendation)}
          </div>
        }
      >
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex space-x-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{finalScore}</div>
                <div className="text-sm text-gray-500">Overall Score</div>
              </div>
              {confidence && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{confidence}</div>
                  <div className="text-sm text-gray-500">Confidence</div>
                </div>
              )}
              {marketTiming && (
                <div className="text-center">
                  <div className={`text-sm font-semibold ${
                    marketTiming.assessment === 'OPTIMAL' ? 'text-green-600' :
                    marketTiming.assessment === 'GOOD' ? 'text-blue-600' :
                    marketTiming.assessment === 'FAIR' ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {marketTiming.assessment}
                  </div>
                  <div className="text-sm text-gray-500">Market Timing</div>
                </div>
              )}
            </div>
            
            {riskAdjustedScore && (
              <div className="text-right">
                <div className="text-sm text-gray-600">
                  Risk Adjusted: <span className="font-semibold">{riskAdjustedScore.adjusted_score}</span>
                </div>
                <div className="text-xs text-gray-500">
                  Base: {riskAdjustedScore.base_score}
                </div>
              </div>
            )}
          </div>

          <dl className="definition-list">
            <div>
              <dt className="definition-term">Primary Industry</dt>
              <dd className="definition-detail">{primaryIndustry}</dd>
            </div>
            <div>
              <dt className="definition-term">Secondary Industry</dt>
              <dd className="definition-detail">{secondaryIndustry}</dd>
            </div>
            <div>
              <dt className="definition-term">Product Type</dt>
              <dd className="definition-detail">{productType}</dd>
            </div>
            <div>
              <dt className="definition-term">Target Audience</dt>
              <dd className="definition-detail">{targetAudience}</dd>
            </div>
          </dl>
        </div>
      </SectionCard>
      
      <SectionCard
        title="Key Insights"
        subtitle="Summary of major findings across all analyses"
      >
        <div>
          <InsightItem
            icon={<Users className="h-5 w-5 text-blue-500" />}
            title="Customer Segments"
            value={insights.segmentation || "Segmentation data unavailable"}
            onViewDetails={() => onNavigate('segmentation')}
            alternateBackground={true}
          />
          <InsightItem
            icon={<Target className="h-5 w-5 text-yellow-500" />}
            title="Problem Validation"
            value={insights.problem || "Problem validation data unavailable"}
            onViewDetails={() => onNavigate('problem')}
          />
          <InsightItem
            icon={<BarChart2 className="h-5 w-5 text-purple-500" />}
            title="Competition"
            value={insights.competition || "Competition data unavailable"}
            onViewDetails={() => onNavigate('competition')}
            alternateBackground={true}
          />
          <InsightItem
            icon={<TrendingUp className="h-5 w-5 text-green-500" />}
            title="Market Size"
            value={insights.market || "Market data unavailable"}
            onViewDetails={() => onNavigate('market')}
          />
        </div>
      </SectionCard>
      
      <SectionCard
        title="Strategic Recommendations"
        subtitle={recommendationData ? "AI-powered insights and strategic guidance" : "Next steps based on analysis findings"}
      >
        <div className="recommendations-list">
          {enhancedRecommendations.map((recommendation, index) => (
            <RecommendationItem
              key={index}
              icon={getRecommendationIcon(recommendation.type)}
              title={recommendation.title}
              description={recommendation.description}
            />
          ))}
          
          {recommendationData && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Award className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">
                    View Detailed AI Analysis
                  </span>
                </div>
                <button
                  onClick={() => onNavigate('recommendation')}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  View Details →
                </button>
              </div>
            </div>
          )}
        </div>
      </SectionCard>
    </>
  );
};

export default SummarySection; 