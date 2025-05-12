import React from 'react';
import { TrendingUp } from 'lucide-react';
import SectionCard from '../shared/SectionCard';
import '../Components.css';

interface MarketSectionProps {
  // Add detailed props here when implementing
}

const MarketSection: React.FC<MarketSectionProps> = ({}) => {
  return (
    <SectionCard
      title="Market Sizing Analysis"
      subtitle="Evaluation of total addressable market and growth potential"
      icon={<TrendingUp className="h-6 w-6 text-green-500" />}
    >
      <p className="placeholder-text">Full market sizing analysis will be implemented here.</p>
      <p className="placeholder-subtitle">This will include:</p>
      <ul className="placeholder-list">
        <li>Total Addressable Market (TAM) size and growth rate</li>
        <li>Serviceable Available Market (SAM) breakdown</li>
        <li>Serviceable Obtainable Market (SOM) projections</li>
        <li>Market growth trends and projections</li>
        <li>Key market drivers and inhibitors</li>
      </ul>
    </SectionCard>
  );
};

export default MarketSection; 