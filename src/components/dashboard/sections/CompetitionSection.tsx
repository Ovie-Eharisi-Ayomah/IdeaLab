import React from 'react';
import { BarChart2 } from 'lucide-react';
import SectionCard from '../shared/SectionCard';
import '../Components.css';

interface CompetitionSectionProps {
  // Add detailed props here when implementing
}

const CompetitionSection: React.FC<CompetitionSectionProps> = ({}) => {
  return (
    <SectionCard
      title="Competitive Analysis"
      subtitle="Evaluation of market competitors and your positioning"
      icon={<BarChart2 className="h-6 w-6 text-purple-500" />}
    >
      <p className="placeholder-text">Full competitive analysis will be implemented here.</p>
      <p className="placeholder-subtitle">This will include:</p>
      <ul className="placeholder-list">
        <li>Major competitors and market share breakdown</li>
        <li>Competitive positioning map</li>
        <li>Key differentiators and gaps in the market</li>
        <li>Competitor strengths and weaknesses</li>
        <li>Strategic recommendations for positioning</li>
      </ul>
    </SectionCard>
  );
};

export default CompetitionSection; 