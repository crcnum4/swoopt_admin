'use client';

const STEP_LABELS = ['Create User', 'Create Org', 'Location', 'Services', 'Review', 'Send Offer'];

interface StepProgressProps {
  currentStep: number;
  totalSteps: number;
}

export function StepProgress({ currentStep, totalSteps }: StepProgressProps) {
  const labels = STEP_LABELS.slice(0, totalSteps);

  return (
    <div className="flex items-center gap-1 overflow-x-auto pb-2">
      {labels.map((label, idx) => {
        const isCompleted = idx < currentStep;
        const isCurrent = idx === currentStep;

        return (
          <div key={idx} className="flex items-center gap-1">
            {idx > 0 && (
              <div
                className="h-0.5 w-6 sm:w-10"
                style={{ backgroundColor: isCompleted ? '#6FFFE9' : '#E5E7EB' }}
              />
            )}
            <div className="flex flex-col items-center gap-1 min-w-[48px]">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold"
                style={
                  isCompleted
                    ? { backgroundColor: '#6FFFE9', color: '#0D7377' }
                    : isCurrent
                      ? { backgroundColor: '#4B3F72', color: '#ffffff' }
                      : { backgroundColor: '#F3F4F6', color: '#9CA3AF' }
                }
              >
                {isCompleted ? '✓' : idx + 1}
              </div>
              <span
                className="text-[10px] font-medium whitespace-nowrap"
                style={{ color: isCurrent ? '#4B3F72' : '#9CA3AF' }}
              >
                {label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
