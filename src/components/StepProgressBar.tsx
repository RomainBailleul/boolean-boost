import React from 'react';
import { Check } from 'lucide-react';

interface StepProgressBarProps {
  currentStep: number;
  steps: { label: string; description: string }[];
}

const StepProgressBar: React.FC<StepProgressBarProps> = ({ currentStep, steps }) => {
  return (
    <div className="flex items-center justify-between w-full max-w-lg mx-auto mb-10">
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;

        return (
          <React.Fragment key={index}>
            {/* Step circle + label */}
            <div className="flex flex-col items-center gap-2 relative">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                  isCompleted
                    ? 'bg-accent text-accent-foreground shadow-md'
                    : isCurrent
                    ? 'bg-primary text-primary-foreground ring-4 ring-primary/20 shadow-lg'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {isCompleted ? <Check className="w-5 h-5" /> : index + 1}
              </div>
              <div className="text-center">
                <div className={`text-xs font-semibold ${isCurrent ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {step.label}
                </div>
                <div className="text-[10px] text-muted-foreground hidden sm:block">
                  {step.description}
                </div>
              </div>
            </div>

            {/* Connector line */}
            {index < steps.length - 1 && (
              <div className="flex-1 mx-2 mt-[-20px]">
                <div className="h-1 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-accent rounded-full transition-all duration-500"
                    style={{ width: isCompleted ? '100%' : '0%' }}
                  />
                </div>
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default StepProgressBar;
