import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Alert, AlertDescription } from "../../components/ui/alert";
import { CheckCircle, Clock, User, Info } from "lucide-react";
import { cn } from "../../lib/utils";
import type { ApprovalStep } from "../../types/workflow";

interface Step5Props {
  approvalPath: ApprovalStep[];
  onSubmit: () => void;
  onBack: () => void;
  isSubmitted?: boolean;
}

export function Step5Approvals({ approvalPath, onSubmit, onBack, isSubmitted }: Step5Props) {
  return (
    <div className="flex-1 overflow-y-auto p-8 bg-muted/30">
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight mb-2">Approval Path</h2>
          <p className="text-sm text-muted-foreground">
            Here's who will review and approve your request
          </p>
        </div>

        <Card>
          <CardContent className="p-8">
            <div className="space-y-1">
              {approvalPath.map((step, index) => (
                <div key={step.id} className="flex items-start gap-6">
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300",
                        step.status === "approved" && "bg-green-500 shadow-lg shadow-green-500/30",
                        step.status === "pending" && "bg-primary shadow-lg shadow-primary/30 ring-4 ring-primary/20",
                        step.status !== "approved" && step.status !== "pending" && "bg-muted"
                      )}
                    >
                      {step.status === "approved" ? (
                        <CheckCircle className="h-6 w-6 text-white" />
                      ) : step.status === "pending" ? (
                        <Clock className="h-6 w-6 text-white" />
                      ) : (
                        <User className="h-6 w-6 text-muted-foreground" />
                      )}
                    </div>
                    {index < approvalPath.length - 1 && (
                      <div className="w-1 h-16 my-2 rounded-full bg-gradient-to-b from-border to-muted" />
                    )}
                  </div>

                  <div className="flex-1 pt-2 pb-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-foreground text-base">{step.role}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{step.approverName}</p>
                      </div>
                      <Badge
                        variant={
                          step.status === "approved"
                            ? "default"
                            : step.status === "pending"
                            ? "secondary"
                            : "outline"
                        }
                        className={cn(
                          step.status === "approved" && "bg-green-500 text-white hover:bg-green-600",
                          step.status === "pending" && "bg-primary/10 text-primary hover:bg-primary/20"
                        )}
                      >
                        {step.status === "approved" ? "Approved" : step.status === "pending" ? "Pending" : "Waiting"}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {!isSubmitted ? (
          <Alert variant="info">
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong className="font-semibold">Next steps:</strong> Once submitted, your request will be sent to{" "}
              {approvalPath[0]?.approverName || "the first approver"} for review. You'll
              receive notifications as it progresses through the approval chain.
            </AlertDescription>
          </Alert>
        ) : (
          <Alert variant="success">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <strong className="font-semibold">Submitted successfully!</strong> Your request is now being reviewed.
              Check "My Requests" to track its progress.
            </AlertDescription>
          </Alert>
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
