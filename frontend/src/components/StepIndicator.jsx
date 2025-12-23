import React from 'react';
import { Check, Upload, Settings, Split, Cpu, BarChart } from 'lucide-react';

const StepIndicator = ({ currentStep, completedSteps }) => {
  const steps = [
    { id: 1, label: 'Upload Data', icon: Upload },
    { id: 2, label: 'Preprocess', icon: Settings },
    { id: 3, label: 'Split Data', icon: Split },
    { id: 4, label: 'Train Model', icon: Cpu },
    { id: 5, label: 'Results', icon: BarChart },
  ];

  return (
    <div className="step-indicator">
      {steps.map((step, index) => {
        const isCompleted = completedSteps.includes(step.id);
        const isActive = currentStep === step.id;
        const IconComponent = step.icon;

        return (
          <React.Fragment key={step.id}>
            <div className="step-item">
              <div className={`step-circle ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}>
                {isCompleted ? <Check size={18} /> : <IconComponent size={18} />}
              </div>
              <span className={`step-label ${isActive ? 'active' : ''}`}>
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className={`step-connector ${isCompleted ? 'completed' : ''}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default StepIndicator;