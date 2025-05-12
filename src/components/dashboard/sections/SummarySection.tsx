import React from 'react';
import { 
  Check, 
  X, 
  AlertTriangle, 
  Users, 
  Target, 
  BarChart2, 
  TrendingUp 
} from 'lucide-react';
import SectionCard from '../shared/SectionCard';
import InsightItem from '../shared/InsightItem';
import RecommendationItem from '../shared/RecommendationItem';
import '../Components.css';

interface SummarySectionProps {
  businessIdea: string;
  analysisDate: string;
  score: number;
  primaryIndustry: string;
  secondaryIndustry: string;
  productType: string;
  targetAudience: string;
  insights: {
    segmentation: string;
    problem: string;
    competition: string;
    market: string;
  };
  recommendations: Array<{
    type: 'positive' | 'warning' | 'negative';
    title: string;
    description: string;
  }>;
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
  onNavigate
}) => {
  const getStatusIcon = (score: number) => {
    if (score >= 70) {
      return <Check className="h-6 w-6 text-green-600" />;
    } else if (score >= 50) {
      return <AlertTriangle className="h-6 w-6 text-yellow-600" />;
    } else {
      return <X className="h-6 w-6 text-red-600" />;
    }
  };

  const getStatusMessage = (score: number) => {
    if (score >= 70) {
      return 'GO';
    } else if (score >= 50) {
      return 'PROCEED WITH CAUTION';
    } else {
      return 'NO-GO';
    }
  };

  const getStatusDescription = (score: number) => {
    if (score >= 70) {
      return 'Strong opportunity with promising market potential';
    } else if (score >= 50) {
      return 'Moderate opportunity with some significant risks';
    } else {
      return 'Significant challenges identified - reconsider or pivot';
    }
  };

  const getStatusClass = (score: number) => {
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

  return (
    <>
      {/* Go/No-Go Card */}
      <SectionCard
        title={getStatusMessage(score)}
        subtitle={getStatusDescription(score)}
        icon={
          <div className={`section-card-icon-wrapper ${getStatusClass(score)}`}>
            {getStatusIcon(score)}
          </div>
        }
      >
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
      </SectionCard>
      
      {/* Key Insights Card */}
      <SectionCard
        title="Key Insights"
        subtitle="Summary of major findings across all analyses"
      >
        <div>
          <InsightItem
            icon={<Users className="h-5 w-5 text-blue-500" />}
            title="Customer Segments"
            value={insights.segmentation}
            onViewDetails={() => onNavigate('segmentation')}
            alternateBackground={true}
          />
          <InsightItem
            icon={<Target className="h-5 w-5 text-yellow-500" />}
            title="Problem Validation"
            value={insights.problem}
            onViewDetails={() => onNavigate('problem')}
          />
          <InsightItem
            icon={<BarChart2 className="h-5 w-5 text-purple-500" />}
            title="Competition"
            value={insights.competition}
            onViewDetails={() => onNavigate('competition')}
            alternateBackground={true}
          />
          <InsightItem
            icon={<TrendingUp className="h-5 w-5 text-green-500" />}
            title="Market Size"
            value={insights.market}
            onViewDetails={() => onNavigate('market')}
          />
        </div>
      </SectionCard>
      
      {/* Recommendations Card */}
      <SectionCard
        title="Strategic Recommendations"
        subtitle="Next steps based on analysis findings"
      >
        <div className="recommendations-list">
          {recommendations.map((recommendation, index) => (
            <RecommendationItem
              key={index}
              icon={getRecommendationIcon(recommendation.type)}
              title={recommendation.title}
              description={recommendation.description}
            />
          ))}
        </div>
      </SectionCard>
    </>
  );
};

export default SummarySection; 