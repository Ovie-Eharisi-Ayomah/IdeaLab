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
// Adjust import paths for shared components from the new location
import SectionCard from '../../../../src/components/dashboard/shared/SectionCard';
import InsightItem from '../../../../src/components/dashboard/shared/InsightItem';
import RecommendationItem from '../../../../src/components/dashboard/shared/RecommendationItem';
import '../Components.css'; // This path should be correct if Components.css is in src/components/dashboard/

// Props interface remains the same as the original SummarySectionProps
interface MockSummarySectionProps {
  businessIdea: string;
  analysisDate: string;
  score: number;
  primaryIndustry: string;
  secondaryIndustry: string;
  productType: string;
  targetAudience: string;
  insights: {
    segmentation: string; // Assumes these are non-null for the mock version from MockIdeaLabDashboard
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

const MockSummarySection: React.FC<MockSummarySectionProps> = ({
  businessIdea, // This prop might not be directly used in JSX if dashboard header shows it
  analysisDate, // This prop might not be directly used in JSX if dashboard header shows it
  score,
  primaryIndustry,
  secondaryIndustry,
  productType,
  targetAudience,
  insights,
  recommendations,
  onNavigate
}) => {
  const getStatusIcon = (scoreVal: number) => {
    if (scoreVal >= 70) return <Check className="h-6 w-6 text-green-600" />;
    if (scoreVal >= 50) return <AlertTriangle className="h-6 w-6 text-yellow-600" />;
    return <X className="h-6 w-6 text-red-600" />;
  };

  const getStatusMessage = (scoreVal: number) => {
    if (scoreVal >= 70) return 'GO';
    if (scoreVal >= 50) return 'PROCEED WITH CAUTION';
    return 'NO-GO';
  };

  const getStatusDescription = (scoreVal: number) => {
    if (scoreVal >= 70) return 'Strong opportunity with promising market potential';
    if (scoreVal >= 50) return 'Moderate opportunity with some significant risks';
    return 'Significant challenges identified - reconsider or pivot';
  };

  const getStatusClass = (scoreVal: number) => {
    if (scoreVal >= 70) return 'success';
    if (scoreVal >= 50) return 'warning';
    return 'error';
  };

  const getRecommendationIcon = (type: string) => {
    switch(type) {
      case 'positive': return <Check className="h-5 w-5 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'negative': return <X className="h-5 w-5 text-red-500" />;
      default: return <Check className="h-5 w-5 text-green-500" />;
    }
  };

  return (
    <>
      <SectionCard
        title={getStatusMessage(score)}
        subtitle={getStatusDescription(score)}
        icon={<div className={`section-card-icon-wrapper ${getStatusClass(score)}`}>{getStatusIcon(score)}</div>}
      >
        <dl className="definition-list">
          <div><dt className="definition-term">Primary Industry</dt><dd className="definition-detail">{primaryIndustry || 'N/A'}</dd></div>
          <div><dt className="definition-term">Secondary Industry</dt><dd className="definition-detail">{secondaryIndustry || 'N/A'}</dd></div>
          <div><dt className="definition-term">Product Type</dt><dd className="definition-detail">{productType || 'N/A'}</dd></div>
          <div><dt className="definition-term">Target Audience</dt><dd className="definition-detail">{targetAudience || 'N/A'}</dd></div>
        </dl>
      </SectionCard>
      
      <SectionCard title="Key Insights" subtitle="Summary of major findings across all analyses">
        <div>
          <InsightItem icon={<Users className="h-5 w-5 text-blue-500" />} title="Customer Segments" value={insights.segmentation} onViewDetails={() => onNavigate('segmentation')} alternateBackground={true} />
          <InsightItem icon={<Target className="h-5 w-5 text-yellow-500" />} title="Problem Validation" value={insights.problem} onViewDetails={() => onNavigate('problem')} />
          <InsightItem icon={<BarChart2 className="h-5 w-5 text-purple-500" />} title="Competition" value={insights.competition} onViewDetails={() => onNavigate('competition')} alternateBackground={true} />
          <InsightItem icon={<TrendingUp className="h-5 w-5 text-green-500" />} title="Market Size" value={insights.market} onViewDetails={() => onNavigate('market')} />
        </div>
      </SectionCard>
      
      <SectionCard title="Strategic Recommendations" subtitle="Next steps based on analysis findings">
        <div className="recommendations-list">
          {recommendations.map((recommendation, index) => (
            <RecommendationItem key={index} icon={getRecommendationIcon(recommendation.type)} title={recommendation.title} description={recommendation.description} />
          ))}
        </div>
      </SectionCard>
    </>
  );
};

export default MockSummarySection; 