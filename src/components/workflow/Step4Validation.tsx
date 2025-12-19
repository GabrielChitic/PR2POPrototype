import { Button } from "../ui/Button";
import { AlertCircle, CheckCircle, AlertTriangle } from "lucide-react";
import type { ValidationIssue } from "../../types/workflow";

interface Step4Props {
  issues: ValidationIssue[];
  onResolveIssue: (issueId: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export function Step4Validation({ issues, onResolveIssue, onNext, onBack }: Step4Props) {
  const errors = issues.filter((i) => i.type === "error");
  const warnings = issues.filter((i) => i.type === "warning");
  const suggestions = issues.filter((i) => i.type === "suggestion");
  const allResolved = errors.length === 0;

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-1">Validation</h2>
          <p className="text-sm text-muted-foreground">
            Checking your request against policy and compliance rules
          </p>
        </div>

        {/* All Clear */}
        {allResolved && issues.length === 0 && (
          <div className="border rounded-lg p-6 bg-green-50 border-green-200">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-6 w-6 text-green-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-green-900">Everything looks good!</h3>
                <p className="text-sm text-green-700 mt-1">
                  Your request is compliant with all policies. Ready to proceed to approvals.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Errors */}
        {errors.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              Issues that must be resolved ({errors.length})
            </h3>
            {errors.map((issue) => (
              <div key={issue.id} className="border border-red-200 rounded-lg p-4 bg-red-50">
                <p className="text-sm text-red-900 font-medium">{issue.message}</p>
                {issue.canFix && (
                  <Button
                    size="sm"
                    className="mt-2"
                    onClick={() => onResolveIssue(issue.id)}
                  >
                    {issue.fixAction || "Resolve"}
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Warnings */}
        {warnings.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              Warnings ({warnings.length})
            </h3>
            {warnings.map((issue) => (
              <div key={issue.id} className="border border-amber-200 rounded-lg p-4 bg-amber-50">
                <p className="text-sm text-amber-900">{issue.message}</p>
              </div>
            ))}
          </div>
        )}

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium flex items-center gap-2">
              Suggestions for optimization ({suggestions.length})
            </h3>
            {suggestions.map((issue) => (
              <div key={issue.id} className="border rounded-lg p-4 bg-blue-50 border-blue-200">
                <p className="text-sm text-blue-900">{issue.message}</p>
                {issue.canFix && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-2"
                    onClick={() => onResolveIssue(issue.id)}
                  >
                    {issue.fixAction || "Apply suggestion"}
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-between pt-6">
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button onClick={onNext} disabled={!allResolved} size="lg">
            Continue to Approvals
          </Button>
        </div>
      </div>
    </div>
  );
}
