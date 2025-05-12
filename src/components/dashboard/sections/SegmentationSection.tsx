import React from 'react';
import { Users } from 'lucide-react';
import SectionCard from '../shared/SectionCard';
import '../Components.css';

interface SegmentationSectionProps {
  // Add detailed props here when implementing
}

const SegmentationSection: React.FC<SegmentationSectionProps> = ({}) => {
  return (
    <SectionCard
      title="Customer Segmentation Analysis"
      subtitle="Detailed breakdown of customer segments for your business idea"
      icon={<Users className="h-6 w-6 text-blue-500" />}
    >
      <p className="placeholder-text">Full segmentation analysis will be implemented here.</p>
      <p className="placeholder-subtitle">This will include:</p>
      <ul className="placeholder-list">
        <li>Primary customer segments with size percentages</li>
        <li>Detailed personas for each segment</li>
        <li>Pain points and motivations by segment</li>
        <li>Willingness to pay by segment</li>
        <li>Growth trends for each segment</li>
      </ul>
    </SectionCard>
  );
};

export default SegmentationSection; 