import React from 'react';
import { Target } from 'lucide-react';
import SectionCard from '../shared/SectionCard';
import '../Components.css';

interface ProblemSectionProps {
  // Add detailed props here when implementing
}

const ProblemSection: React.FC<ProblemSectionProps> = ({}) => {
  return (
    <SectionCard
      title="Problem Validation Analysis"
      subtitle="Evaluation of the problem statement and market need"
      icon={<Target className="h-6 w-6 text-yellow-500" />}
    >
      <p className="placeholder-text">Full problem validation analysis will be implemented here.</p>
      <p className="placeholder-subtitle">This will include:</p>
      <ul className="placeholder-list">
        <li>Problem severity assessment</li>
        <li>Target audience pain point validation</li>
        <li>Current solutions and their limitations</li>
        <li>Willingness to pay for solutions</li>
        <li>Market signals and trends</li>
      </ul>
    </SectionCard>
  );
};

export default ProblemSection; 