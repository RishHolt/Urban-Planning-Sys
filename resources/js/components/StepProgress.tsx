import { CheckCircle } from 'lucide-react';

interface StepProgressProps {
    steps: string[];
    currentStep: number;
    completedSteps: Set<number>;
    onStepClick?: (stepNumber: number) => void;
    connectorWidth?: string;
    showStepLabel?: boolean;
}

export default function StepProgress({
    steps,
    currentStep,
    completedSteps,
    onStepClick,
    connectorWidth = 'w-16',
    showStepLabel = true,
}: StepProgressProps) {
    return (
        <div className="mb-8">
            <div className="flex items-center justify-center">
                {steps.map((step, index) => {
                    const stepNumber = index + 1;
                    const isCompleted = completedSteps.has(stepNumber);
                    const isCurrent = currentStep === stepNumber;
                    const isPast = currentStep > stepNumber;
                    const isClickable = isCompleted || isPast || isCurrent;

                    return (
                        <div key={stepNumber} className="flex items-center">
                            <button
                                type="button"
                                onClick={() => isClickable && onStepClick?.(stepNumber)}
                                disabled={!isClickable}
                                className={`
                                    flex items-center justify-center
                                    rounded-full w-10 h-10 transition-colors
                                    ${isCurrent
                                        ? 'bg-primary text-white'
                                        : isCompleted || isPast
                                        ? 'bg-green-500 text-white cursor-pointer hover:bg-green-600'
                                        : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 cursor-not-allowed opacity-60'
                                    }
                                `}
                            >
                                {isCompleted || isPast ? (
                                    <CheckCircle size={20} />
                                ) : (
                                    stepNumber
                                )}
                            </button>
                            {index < steps.length - 1 && (
                                <div
                                    className={`
                                        h-1 ${connectorWidth} mx-2
                                        ${isPast || isCompleted
                                            ? 'bg-green-500'
                                            : 'bg-gray-200 dark:bg-gray-700'
                                        }
                                    `}
                                />
                            )}
                        </div>
                    );
                })}
            </div>
            {showStepLabel && (
                <div className="mt-4 text-center">
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                        Step {currentStep} of {steps.length}: {steps[currentStep - 1]}
                    </p>
                </div>
            )}
        </div>
    );
}
