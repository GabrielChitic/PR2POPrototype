import { Button } from "../ui/Button";
import { CheckCircle, Clock, User } from "lucide-react";
import type { ApprovalStep } from "../../types/workflow";

interface Step5Props {
  approvalPath: ApprovalStep[];
  onSubmit: () => void;
  onBack: () => void;
  isSubmitted?: boolean;
}

export function Step5Approvals({ approvalPath, onSubmit, onBack, isSubmitted }: Step5Props) {
  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-1">Approval Path</h2>
          <p className="text-sm text-muted-foreground">
            Here's who will review and approve your request
          </p>
        </div>

        <div className="border border-gray-200 rounded-xl p-8 bg-white shadow-sm">
          <div className="space-y-1">
            {approvalPath.map((step, index) => (
              <div key={step.id} className="flex items-start gap-6">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                      step.status === "approved"
                        ? "bg-green-500 shadow-lg shadow-green-500/30"
                        : step.status === "pending"
                        ? "bg-blue-600 shadow-lg shadow-blue-600/30 ring-4 ring-blue-200"
                        : "bg-gray-300"
                    }`}
                  >
                    {step.status === "approved" ? (
                      <CheckCircle className="h-6 w-6 text-white" />
                    ) : step.status === "pending" ? (
                      <Clock className="h-6 w-6 text-white" />
                    ) : (
                      <User className="h-6 w-6 text-gray-500" />
                    )}
                  </div>
                  {index < approvalPath.length - 1 && (
                    <div className="w-1 h-16 my-2 rounded-full bg-gradient-to-b from-gray-300 to-gray-200" />
                  )}
                </div>

                <div className="flex-1 pt-2 pb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-900 text-base">{step.role}</h4>
                      <p className="text-sm text-gray-600 mt-1">{step.approverName}</p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        step.status === "approved"
                          ? "bg-green-50 text-green-700 border border-green-200"
                          : step.status === "pending"
                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                          : "bg-gray-50 text-gray-600 border border-gray-200"
                      }`}
                    >
                      {step.status === "approved" ? "Approved" : step.status === "pending" ? "Pending" : "Waiting"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {!isSubmitted ? (
          <div className="border border-blue-200 rounded-xl p-5 bg-blue-50">
            <p className="text-sm text-blue-900 leading-relaxed">
              <strong className="font-semibold">Next steps:</strong> Once submitted, your request will be sent to{" "}
              {approvalPath[0]?.approverName || "the first approver"} for review. You'll
              receive notifications as it progresses through the approval chain.
            </p>
          </div>
        ) : (
          <div className="border border-green-200 rounded-xl p-5 bg-green-50">
            <p className="text-sm text-green-900 leading-relaxed">
              <strong className="font-semibold">Submitted successfully!</strong> Your request is now being reviewed.
              Check "My PRs" to track its progress.
            </p>
          </div>
        )}

        <div className="flex justify-between items-center pt-8">
          <Button variant="outline" onClick={onBack} disabled={isSubmitted}>
            Back
          </Button>
          {!isSubmitted && (
            <Button onClick={onSubmit} size="lg">
              Submit PR
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
