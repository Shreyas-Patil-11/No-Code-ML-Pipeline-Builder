

import React from 'react';
import { Upload, Settings, Split, Cpu, BarChart, ChevronRight } from 'lucide-react';

const PipelineFlow = ({ completedSteps, currentStep }) => {
  const steps = [
    { id: 1, label: 'Upload', icon: Upload },
    { id: 2, label: 'Preprocess', icon: Settings },
    { id: 3, label: 'Split', icon: Split },
    { id: 4, label: 'Train', icon: Cpu },
    { id: 5, label: 'Results', icon: BarChart },
  ];

  return (
    <div className="pipeline-flow">
      {steps.map((step, index) => {
        const IconComponent = step.icon;
        const isCompleted = completedSteps.includes(step.id);
        const isActive = currentStep === step.id;

        return (
          <React.Fragment key={step.id}>
            <div className={`pipeline-node ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}>
              <IconComponent size={16} />
              <span>{step.label}</span>
            </div>
            {index < steps.length - 1 && (
              <ChevronRight className="pipeline-arrow" size={20} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default PipelineFlow;