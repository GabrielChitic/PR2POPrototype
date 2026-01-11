import { cn } from "@/lib/utils";
import type { WorkflowStep } from "@/types/workflow";
import { Check } from "lucide-react";

interface StepperProps {
  currentStep: WorkflowStep;
  onStepClick?: (step: WorkflowStep) => void;
}

const STEPS = [
  { id: 1 as WorkflowStep, label: "Shop & Select" },
  { id: 2 as WorkflowStep, label: "Delivery & Details" },
  { id: 3 as WorkflowStep, label: "Accounting & Policy Checks" },
  { id: 4 as WorkflowStep, label: "Review & Submit" },
  { id: 5 as WorkflowStep, label: "Track & Approvals" },
];

export function Stepper({ currentStep, onStepClick }: StepperProps) {
  // Don't render during Phase 0 (background processing)
  if (currentStep === 0) {
    return null;
  }

  return (
    <div className="w-full border-b bg-background">
      <div className="px-8 py-6">
        <nav aria-label="Progress" className="max-w-5xl mx-auto">
          <ol className="flex items-center justify-between">
            {STEPS.map((step, index) => {
              const isCompleted = currentStep > step.id;
              const isCurrent = currentStep === step.id;
              const isClickable = isCompleted && onStepClick;
              const isUpcoming = currentStep < step.id;

              return (
                <li
                  key={step.id}
                  className={cn(
                    "relative flex flex-col items-center",
                    index < STEPS.length - 1 ? "flex-1" : "flex-initial"
                  )}
                >
                  {/* Connector Line - positioned behind step circle */}
                  {index < STEPS.length - 1 && (
                    <div
                      className="absolute left-[calc(50%+20px)] right-[calc(-50%+20px)] top-5 h-0.5"
                      aria-hidden="true"
                    >
                      <div className="h-full w-full bg-border" />
                      <div
                        className={cn(
                          "absolute top-0 left-0 h-full transition-all duration-500 ease-in-out bg-primary",
                          isCompleted ? "w-full" : "w-0"
                        )}
                      />
                    </div>
                  )}

                  {/* Step Button/Circle */}
                  <button
                    type="button"
                    onClick={() => isClickable && onStepClick(step.id)}
                    disabled={!isClickable}
                    aria-current={isCurrent ? "step" : undefined}
                    className={cn(
                      "relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-200",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                      isCompleted && "border-primary bg-primary text-primary-foreground shadow-sm",
                      isCurrent && "border-primary bg-primary text-primary-foreground shadow-md ring-4 ring-primary/20",
                      isUpcoming && "border-muted-foreground/30 bg-background text-muted-foreground",
                      isClickable && "cursor-pointer hover:scale-105 hover:shadow-md",
                      !isClickable && "cursor-default"
                    )}
                  >
                    {isCompleted ? (
                      <Check className="h-5 w-5" aria-hidden="true" />
                    ) : (
                      <span className="text-sm font-semibold">{step.id}</span>
                    )}
                  </button>

                  {/* Step Label */}
                  <span
                    className={cn(
                      "mt-2 text-center text-xs font-medium transition-colors max-w-[120px]",
                      isCurrent && "text-foreground font-semibold",
                      isCompleted && "text-foreground",
                      isUpcoming && "text-muted-foreground"
                    )}
                  >
                    {step.label}
                  </span>
                </li>
              );
            })}
          </ol>
        </nav>
      </div>
    </div>
  );
}
