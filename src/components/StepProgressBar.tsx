import React from 'react';
import { Check } from 'lucide-react';

interface StepProgressBarProps {
  currentStep: number;
  steps: { label: string; description: string }[];
}

const StepProgressBar: React.FC<StepProgressBarProps> = ({ currentStep, steps }) => {
  return (
    <div className="flex items-center justify-between w-full max-w-md mx-auto mb-8 sm:mb-10 px-2" role="progressbar" aria-valuenow={currentStep + 1} aria-valuemin={1} aria-valuemax={steps.length} aria-label={`Étape ${currentStep + 1} sur ${steps.length}: ${steps[currentStep]?.label}`}>
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;

        return (
          <React.Fragment key={index}>
            <div className="flex flex-col items-center gap-1.5 relative z-10">
              <div
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                  isCompleted
                    ? 'bg-accent text-accent-foreground shadow-md'
                    : isCurrent
                    ? 'bg-primary text-primary-foreground glow-button'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {isCompleted ? <Check className="w-4 h-4 sm:w-5 sm:h-5" /> : index + 1}
              </div>
              <div className="text-center">
                <div className={`text-[11px] sm:text-xs font-semibold leading-tight ${
                  isCurrent ? 'text-foreground' : isCompleted ? 'text-accent' : 'text-muted-foreground'
                }`}>
                  {step.label}
                </div>
                <div className="text-[9px] sm:text-[10px] text-muted-foreground hidden sm:block mt-0.5">
                  {step.description}
                </div>
              </div>
            </div>

            {index < steps.length - 1 && (
              <div className="flex-1 mx-1 sm:mx-3 mt-[-18px]">
                <div className="h-0.5 sm:h-1 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500 ease-out"
                    style={{
                      width: isCompleted ? '100%' : '0%',
                      background: 'var(--gradient-hero)',
                    }}
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