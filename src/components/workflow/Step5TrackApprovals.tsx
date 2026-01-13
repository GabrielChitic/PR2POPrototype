import { useState } from "react";
import { CheckCircle, Clock, User, AlertCircle, Edit, Search, FileText, Package2, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Input } from "../ui/input";
import { Separator } from "../ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui/collapsible";
import { cn } from "../../lib/utils";
import type { SubmittedPR, RequesterAction } from "../../types/workflow";

interface Step5Props {
  mode: "tracking" | "list"; // Mode 1 or Mode 2
  submittedPR?: SubmittedPR; // Current PR for tracking mode
  allPRs: SubmittedPR[]; // All PRs for list mode
  onSelectPR: (pr: SubmittedPR) => void; // Switch to tracking mode for selected PR
  onNewRequest: () => void;
  onMyRequests: () => void; // Switch to list mode
  onEditPR?: (pr: SubmittedPR) => void; // Edit request (gated)
  onCompleteAction?: (action: RequesterAction) => void;
}

// Mode 1: Post-submit Tracking View
function TrackingView({
  pr,
  onMyRequests,
  onNewRequest,
  onEditPR,
  onCompleteAction,
}: {
  pr: SubmittedPR;
  onMyRequests: () => void;
  onNewRequest: () => void;
  onEditPR?: (pr: SubmittedPR) => void;
  onCompleteAction?: (action: RequesterAction) => void;
}) {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  return (
    <TooltipProvider>
      <div className="flex-1 overflow-y-auto p-8 bg-muted/30">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Success Confirmation Banner */}
          <Alert className="border-green-600 bg-green-50 dark:bg-green-950">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <AlertTitle className="text-green-900 dark:text-green-100 text-lg">
              Purchase Requisition submitted
            </AlertTitle>
            <AlertDescription className="text-green-800 dark:text-green-200">
              <div className="space-y-1">
                <p className="font-semibold text-base">{pr.prNumber}</p>
                <p>
                  is now in the approval flow. We'll notify you when something needs your attention.
                </p>
              </div>
            </AlertDescription>
          </Alert>

          {/* Current Status Summary */}
          <Card>
            <CardContent className="p-6">
              <div className={`grid ${pr.draftPR?.journeyType === "NON_CATALOG" ? "grid-cols-4" : "grid-cols-3"} gap-6`}>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Current step</p>
                  <p className="text-sm font-semibold text-foreground">{pr.currentStep}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Owner</p>
                  <p className="text-sm font-semibold text-foreground">{pr.currentOwner || "System"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Time in step</p>
                  <p className="text-sm font-semibold text-foreground">{pr.timeInStep}</p>
                </div>
                {pr.draftPR?.journeyType === "NON_CATALOG" && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">SLA</p>
                    <p className="text-sm font-semibold text-green-600">On track</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Action Required Panel (only when needed) */}
          {pr.actionRequired && !pr.actionRequired.completedAt && (
            <Alert variant="warning">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Action required</AlertTitle>
              <AlertDescription>
                <p className="mb-2">
                  <strong>{pr.actionRequired.title}</strong>
                </p>
                <p className="text-sm mb-3">{pr.actionRequired.description}</p>
                <Button
                  size="sm"
                  onClick={() => onCompleteAction && onCompleteAction(pr.actionRequired!)}
                >
                  Complete Action
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Lifecycle Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Approval Timeline</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-1">
                {pr.lifecycleTimeline.map((node, index) => (
                  <div key={node.id} className="flex items-start gap-6">
                    <div className="flex flex-col items-center">
                      <div
                        className={cn(
                          "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300",
                          node.status === "completed" &&
                            "bg-green-500 shadow-lg shadow-green-500/30",
                          node.status === "in_progress" &&
                            "bg-primary shadow-lg shadow-primary/30 ring-4 ring-primary/20",
                          (node.status === "pending" || node.status === "on_hold") && "bg-muted"
                        )}
                      >
                        {node.status === "completed" ? (
                          <CheckCircle className="h-6 w-6 text-white" />
                        ) : node.status === "in_progress" ? (
                          <Clock className="h-6 w-6 text-white animate-pulse" />
                        ) : (
                          <User className="h-6 w-6 text-muted-foreground" />
                        )}
                      </div>
                      {index < pr.lifecycleTimeline.length - 1 && (
                        <div className="w-1 h-16 my-2 rounded-full bg-gradient-to-b from-border to-muted" />
                      )}
                    </div>

                    <div className="flex-1 pt-2 pb-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-foreground text-base">
                            {node.label}
                          </h4>
                          {node.owner && (
                            <p className="text-sm text-muted-foreground mt-1">{node.owner}</p>
                          )}
                          {node.helperText && (
                            <p className="text-xs text-muted-foreground mt-1 italic">
                              {node.helperText}
                            </p>
                          )}
                          {node.completedAt && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(node.completedAt).toLocaleString()}
                            </p>
                          )}
                        </div>
                        <Badge
                          variant={
                            node.status === "completed"
                              ? "default"
                              : node.status === "in_progress"
                              ? "secondary"
                              : "outline"
                          }
                          className={cn(
                            node.status === "completed" &&
                              "bg-green-500 text-white hover:bg-green-600",
                            node.status === "in_progress" &&
                              "bg-primary/10 text-primary hover:bg-primary/20"
                          )}
                        >
                          {node.status === "completed"
                            ? "Completed"
                            : node.status === "in_progress"
                            ? "In progress"
                            : node.status === "on_hold"
                            ? "On hold"
                            : "Pending"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* PR Details (Collapsible) */}
          <Collapsible open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-lg font-semibold">Request Details</CardTitle>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
                        {isDetailsOpen ? (
                          <>
                            <ChevronUp className="h-4 w-4" />
                            Hide details
                          </>
                        ) : (
                          <>
                            <ChevronDown className="h-4 w-4" />
                            More info
                          </>
                        )}
                      </Button>
                    </CollapsibleTrigger>
                  </div>
                  <div className="flex items-center gap-2">
                    {pr.canEdit && onEditPR ? (
                      <Button variant="outline" size="sm" onClick={() => onEditPR(pr)} className="gap-2">
                        <Edit className="h-3 w-3" />
                        Edit Request
                      </Button>
                    ) : (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="outline" size="sm" disabled className="gap-2">
                            <Edit className="h-3 w-3" />
                            Edit Request
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">Edits are locked once approvals complete</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                </div>

                {/* One-line summary when collapsed */}
                {!isDetailsOpen && (
                  <div className="pt-2">
                    <p className="text-sm text-muted-foreground">
                      {pr.itemsSummary} • {pr.draftPR?.journeyType === "NON_CATALOG"
                        ? `${pr.draftPR?.lineItems[0]?.currency || "EUR"} ${pr.totalValue.toLocaleString()}`
                        : `$${pr.totalValue.toLocaleString()}`} • {pr.deliverySummary.split(',')[0]}
                    </p>
                  </div>
                )}
              </CardHeader>

              <CollapsibleContent>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">PR Number</p>
                    <p className="text-sm font-medium">{pr.prNumber}</p>
                  </div>
                  <Separator />
                  {pr.draftPR?.journeyType === "NON_CATALOG" && (
                    <>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Supplier</p>
                        <p className="text-sm font-medium">
                          {pr.draftPR?.lineItems[0]?.supplier || "Manufacturing A/S"}
                        </p>
                      </div>
                      <Separator />
                    </>
                  )}
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Items</p>
                    <p className="text-sm">{pr.itemsSummary}</p>
                    <p className="text-sm font-semibold mt-1">
                      Total: {pr.draftPR?.journeyType === "NON_CATALOG"
                        ? `${pr.draftPR?.lineItems[0]?.currency || "EUR"} ${pr.totalValue.toLocaleString()}`
                        : `$${pr.totalValue.toLocaleString()}`}
                    </p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Delivery</p>
                    <p className="text-sm">{pr.deliverySummary}</p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Accounting</p>
                    <p className="text-sm">{pr.accountingSummary}</p>
                  </div>
                  <Separator />
                  {pr.draftPR?.journeyType === "NON_CATALOG" && pr.draftPR?.quoteDetails && (
                    <>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Evidence</p>
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <p className="text-sm">
                            Quote — {pr.draftPR.quoteDetails.quoteNumber} (PDF)
                          </p>
                          <Button variant="ghost" size="sm" className="text-xs h-6 px-2">
                            View quote
                          </Button>
                        </div>
                      </div>
                      <Separator />
                    </>
                  )}
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Policy Checks</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {pr.policySummary.map((policy, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {policy}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button variant="default" onClick={onMyRequests} size="lg" className="flex-1">
              My Requests
            </Button>
            <Button variant="outline" onClick={onNewRequest} size="lg" className="flex-1">
              New Request
            </Button>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}

// Mode 2: My Requests List View
function MyRequestsList({
  prs,
  onSelectPR,
  onNewRequest,
}: {
  prs: SubmittedPR[];
  onSelectPR: (pr: SubmittedPR) => void;
  onNewRequest: () => void;
}) {
  const [searchQuery, setSearchQuery] = useState("");

  // Filter PRs based on search
  const filteredPRs = prs.filter(
    (pr) =>
      pr.prNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pr.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pr.itemsSummary.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "pending_approval":
        return "bg-amber-100 text-amber-800 border-amber-300";
      case "approved":
        return "bg-green-100 text-green-800 border-green-300";
      case "po_created":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "on_hold":
        return "bg-gray-100 text-gray-800 border-gray-300";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending_approval":
        return "Pending Approval";
      case "po_created":
        return "PO Created";
      case "on_hold":
        return "On Hold";
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-muted/30">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                My Requests
              </h2>
              <p className="text-sm text-muted-foreground">Track and manage your purchase requests</p>
            </div>
          </div>
          <Button onClick={onNewRequest} size="lg" className="gap-2">
            <Package2 className="h-4 w-4" />
            New Request
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by PR number or keyword..."
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* PR List */}
        <Card>
          <CardContent className="p-0">
            {filteredPRs.length === 0 ? (
              <div className="p-12 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-sm font-medium text-foreground mb-1">
                  {searchQuery ? "No requests found matching your search" : "No requests yet"}
                </p>
                {!searchQuery && (
                  <p className="text-xs text-muted-foreground">
                    Start a request to see it here.
                  </p>
                )}
              </div>
            ) : (
              <div className="divide-y">
                {filteredPRs.map((pr) => (
                  <button
                    key={pr.prNumber}
                    onClick={() => onSelectPR(pr)}
                    className="w-full p-4 hover:bg-muted/50 transition-colors text-left"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-foreground">{pr.prNumber}</span>
                          <span className="text-sm text-muted-foreground">{pr.title}</span>
                          {pr.actionRequired && !pr.actionRequired.completedAt && (
                            <Badge variant="destructive" className="text-xs">
                              Needs your action
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {pr.timeInStep}
                          </span>
                          <span>{pr.currentStep}</span>
                          {pr.currentOwner && <span>• {pr.currentOwner}</span>}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {pr.itemsSummary}
                          {pr.draftPR?.journeyType === "NON_CATALOG" && pr.draftPR?.lineItems[0]?.supplier && (
                            <span className="ml-2">• Supplier: {pr.draftPR.lineItems[0].supplier}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge variant="outline" className={getStatusBadgeColor(pr.status)}>
                          {getStatusLabel(pr.status)}
                        </Badge>
                        <span className="text-sm font-semibold text-foreground">
                          {pr.draftPR?.journeyType === "NON_CATALOG"
                            ? `${pr.draftPR?.lineItems[0]?.currency || "EUR"} ${pr.totalValue.toLocaleString()}`
                            : `$${pr.totalValue.toLocaleString()}`}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(pr.submittedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Main Component
export function Step5TrackApprovals({
  mode,
  submittedPR,
  allPRs,
  onSelectPR,
  onNewRequest,
  onMyRequests,
  onEditPR,
  onCompleteAction,
}: Step5Props) {
  if (mode === "list") {
    return <MyRequestsList prs={allPRs} onSelectPR={onSelectPR} onNewRequest={onNewRequest} />;
  }

  if (mode === "tracking" && submittedPR) {
    return (
      <TrackingView
        pr={submittedPR}
        onMyRequests={onMyRequests}
        onNewRequest={onNewRequest}
        onEditPR={onEditPR}
        onCompleteAction={onCompleteAction}
      />
    );
  }

  // Fallback
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <p className="text-muted-foreground">No PR selected</p>
    </div>
  );
}
