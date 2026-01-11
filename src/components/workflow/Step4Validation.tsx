import { Button } from "../ui/button";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
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
          <Alert variant="success">
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>Everything looks good!</AlertTitle>
            <AlertDescription>
              Your request is compliant with all policies. Ready to proceed to approvals.
            </AlertDescription>
          </Alert>
        )}

        {/* Errors */}
        {errors.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-destructive" />
              Issues that must be resolved ({errors.length})
            </h3>
            {errors.map((issue) => (
              <Alert key={issue.id} variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <p className="font-medium">{issue.message}</p>
                  {issue.canFix && (
                    <Button
                      size="sm"
                      className="mt-2"
                      onClick={() => onResolveIssue(issue.id)}
                    >
                      {issue.fixAction || "Resolve"}
                    </Button>
                  )}
                </AlertDescription>
              </Alert>
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
              <Alert key={issue.id} variant="warning">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{issue.message}</AlertDescription>
              </Alert>
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
              <Alert key={issue.id} variant="info">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <p>{issue.message}</p>
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
                </AlertDescription>
              </Alert>
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
