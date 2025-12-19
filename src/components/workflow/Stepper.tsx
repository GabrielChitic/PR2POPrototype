import { cn } from "../../lib/utils";
import type { WorkflowStep } from "../../types/workflow";

interface StepperProps {
  currentStep: WorkflowStep;
  onStepClick?: (step: WorkflowStep) => void;
}

const STEPS = [
  { id: 1 as WorkflowStep, label: "Choose items" },
  { id: 2 as WorkflowStep, label: "Purchase info" },
  { id: 3 as WorkflowStep, label: "Summary" },
  { id: 4 as WorkflowStep, label: "Validation" },
  { id: 5 as WorkflowStep, label: "Approvals" },
];

export function Stepper({ currentStep, onStepClick }: StepperProps) {
  return (
    <div className="w-full px-8 py-6 border-b bg-white">
      <div className="flex items-center max-w-5xl mx-auto">
        {STEPS.map((step, index) => {
          const isCompleted = currentStep > step.id;
          const isCurrent = currentStep === step.id;
          const isClickable = isCompleted && onStepClick;

          return (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                {/* Step Circle */}
                <button
                  onClick={() => isClickable && onStepClick(step.id)}
                  disabled={!isClickable}
                  className={cn(
                    "relative flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                    isCompleted && "bg-blue-600 text-white shadow-md",
                    isCurrent && "bg-blue-600 text-white shadow-lg ring-4 ring-blue-200 border-2 border-blue-600",
                    !isCompleted && !isCurrent && "bg-gray-100 text-gray-500 border-2 border-gray-300",
                    isClickable && "cursor-pointer hover:scale-110"
                  )}
                >
                  <span className="text-sm font-bold">{step.id}</span>
                </button>

                {/* Step Label */}
                <p
                  className={cn(
                    "mt-2 text-xs font-medium text-center whitespace-nowrap transition-colors",
                    isCurrent && "text-blue-700 font-bold",
                    isCompleted && "text-gray-700",
                    !isCompleted && !isCurrent && "text-gray-500"
                  )}
                >
                  {step.label}
                </p>
              </div>

              {/* Connector Line */}
              {index < STEPS.length - 1 && (
                <div className="flex-1 h-0.5 mx-4 mt-[-32px] relative">
                  <div className="absolute inset-0 bg-gray-300" />
                  <div
                    className={cn(
                      "absolute inset-0 transition-all duration-500",
                      isCompleted ? "bg-blue-600 w-full" : "bg-blue-600 w-0"
                    )}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
