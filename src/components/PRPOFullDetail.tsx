import { useRef } from "react";
import { ArrowLeft, AlertCircle, CheckCircle, XCircle, AlertTriangle, User, MessageSquare } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import { cn } from "../lib/utils";
import type { ProcurementPR, ProcurementPO } from "../data/procurementData";

interface PRPOFullDetailProps {
  pr: ProcurementPR | null;
  po: ProcurementPO | null;
  tab: "overview" | "details" | "audit" | "collaboration";
  onTabChange: (tab: "overview" | "details" | "audit" | "collaboration") => void;
  onBack: () => void;
  onAssign: (id: string, assignee: string) => void;
  onRequestInfo: () => void;
}

// Phase ribbon definitions
const PR_PHASES = [
  { id: "gatekeep", label: "Gatekeep" },
  { id: "reviews", label: "Coordinate reviews" },
  { id: "approvals", label: "Approvals" },
  { id: "ready", label: "Ready for PO" },
  { id: "converted", label: "Converted" },
  { id: "handoff", label: "Handoff to PO" },
];

const PO_PHASES = [
  { id: "create", label: "Create/Post" },
  { id: "dispatch", label: "Dispatch" },
  { id: "confirm", label: "Confirm" },
  { id: "change", label: "Change" },
  { id: "close", label: "Close" },
];

export function PRPOFullDetail({
  pr,
  po,
  tab,
  onTabChange,
  onBack,
  onAssign,
  onRequestInfo,
}: PRPOFullDetailProps) {
  const item = pr || po;
  if (!item) return null;

  // Refs for scroll targets
  const linesRef = useRef<HTMLDivElement>(null);
  const deliveryRef = useRef<HTMLDivElement>(null);
  const codingRef = useRef<HTMLDivElement>(null);
  const attachmentsRef = useRef<HTMLDivElement>(null);

  // Map phaseStep to current phase index
  const getCurrentPhaseIndex = () => {
    if (pr) {
      const phaseStep = pr.phaseStep.toLowerCase();
      if (phaseStep.includes("gatekeep")) return 0;
      if (phaseStep.includes("review")) return 1;
      if (phaseStep.includes("approval")) return 2;
      if (phaseStep.includes("ready")) return 3;
      if (phaseStep.includes("converted")) return 4;
      if (phaseStep.includes("handoff")) return 5;
      return 0;
    } else if (po) {
      const phaseStep = po.phaseStep.toLowerCase();
      if (phaseStep.includes("create") || phaseStep.includes("post")) return 0;
      if (phaseStep.includes("dispatch")) return 1;
      if (phaseStep.includes("confirm")) return 2;
      if (phaseStep.includes("change")) return 3;
      if (phaseStep.includes("close")) return 4;
      return 0;
    }
    return 0;
  };

  const currentPhaseIndex = getCurrentPhaseIndex();
  const phases = pr ? PR_PHASES : PO_PHASES;

  // Generate validation cockpit data
  const getValidationCockpit = () => {
    const failed: Array<{ id: string; name: string; section: string }> = [];
    const warnings: Array<{ id: string; name: string }> = [];
    const passed: Array<{ id: string; name: string }> = [];

    if (pr) {
      if (pr.topBlocker) {
        failed.push({
          id: "blocker-1",
          name: pr.topBlocker,
          section: pr.topBlocker.toLowerCase().includes("cost center") ? "coding" : "lines",
        });
      }
      if (pr.slaBreached) {
        warnings.push({ id: "sla-1", name: "SLA breach detected" });
      }
      if (!pr.topBlocker) {
        passed.push({ id: "pass-1", name: "Mandatory fields present" });
        passed.push({ id: "pass-2", name: "Policy evaluated" });
        passed.push({ id: "pass-3", name: "Approval path configured" });
      }
    } else if (po) {
      if (po.failureReason) {
        failed.push({
          id: "blocker-1",
          name: po.failureReason,
          section: "delivery",
        });
      }
      if (po.slaBreached) {
        warnings.push({ id: "sla-1", name: "SLA breach detected" });
      }
      if (!po.failureReason) {
        passed.push({ id: "pass-1", name: "Supplier active" });
        passed.push({ id: "pass-2", name: "Posting successful" });
        passed.push({ id: "pass-3", name: "Dispatch ready" });
      }
    }

    return { failed, warnings, passed };
  };

  const cockpit = getValidationCockpit();

  // Handle click-to-fix
  const handleFixClick = (section: string) => {
    onTabChange("details");
    // Scroll to section after tab changes
    setTimeout(() => {
      if (section === "lines" && linesRef.current) {
        linesRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      } else if (section === "delivery" && deliveryRef.current) {
        deliveryRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      } else if (section === "coding" && codingRef.current) {
        codingRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      } else if (section === "attachments" && attachmentsRef.current) {
        attachmentsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-muted/20">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-background border-b shadow-sm">
        <div className="px-8 py-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4 flex-1">
              <Button
                variant="ghost"
                size="sm"
                className="mt-1"
                onClick={onBack}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to workbench
              </Button>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-semibold text-foreground">
                    {pr ? pr.prNumber : po?.poNumber}
                  </h1>
                  {item.slaBreached && (
                    <Badge variant="destructive" className="text-xs">
                      SLA Breached
                    </Badge>
                  )}
                  {pr?.exception && (
                    <Badge variant="secondary" className="text-xs">
                      Exception
                    </Badge>
                  )}
                  {pr?.hold && (
                    <Badge variant="outline" className="text-xs">
                      Hold
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  {pr?.title || `Supplier: ${po?.supplier}`}
                </p>
                <div className="grid grid-cols-3 gap-x-6 gap-y-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Amount:</span>
                    <span className="font-medium ml-2">
                      {item.currency} {item.amount.toLocaleString()}
                    </span>
                  </div>
                  {pr && (
                    <>
                      <div>
                        <span className="text-muted-foreground">Entity:</span>
                        <span className="font-medium ml-2">{pr.entityCode}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Requester:</span>
                        <span className="font-medium ml-2">{pr.requester}</span>
                      </div>
                    </>
                  )}
                  {po && (
                    <div>
                      <span className="text-muted-foreground">Supplier:</span>
                      <span className="font-medium ml-2">{po.supplier}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-muted-foreground">Phase/Step:</span>
                    <Badge variant="outline" className="text-xs ml-2">
                      {item.phaseStep}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Owner:</span>
                    <span className="font-medium ml-2">
                      {pr ? pr.assigneeOrQueue : po?.assigneeOrResolverGroup}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Age:</span>
                    <span
                      className={cn(
                        "font-medium ml-2",
                        item.slaBreached && "text-red-600"
                      )}
                    >
                      {item.age}
                    </span>
                  </div>
                </div>
                {(pr?.topBlocker || po?.failureReason) && (
                  <div className="flex items-start gap-2 mt-3 p-3 rounded-md bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800">
                    <AlertCircle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-orange-900 dark:text-orange-100">
                        {pr ? "Blocker" : "Failure Reason"}
                      </p>
                      <p className="text-sm text-orange-800 dark:text-orange-200">
                        {pr?.topBlocker || po?.failureReason}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={(value: string) => onTabChange(value as typeof tab)} className="flex-1 flex flex-col overflow-hidden">
        <div className="border-b bg-background/95 px-8">
          <TabsList className="bg-transparent">
            <TabsTrigger value="overview" className="data-[state=active]:bg-background">
              Overview
            </TabsTrigger>
            <TabsTrigger value="details" className="data-[state=active]:bg-background">
              Details
            </TabsTrigger>
            <TabsTrigger value="audit" className="data-[state=active]:bg-background">
              Audit Trail
            </TabsTrigger>
            <TabsTrigger value="collaboration" className="data-[state=active]:bg-background">
              Collaboration
            </TabsTrigger>
          </TabsList>
        </div>

        <ScrollArea className="flex-1">
          <div className="px-8 py-6">
            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6 m-0">
              {/* Phase Ribbon */}
              <Card className="p-6">
                <h3 className="text-sm font-semibold text-foreground mb-4">Phase Progress</h3>
                <div className="flex items-center gap-2">
                  {phases.map((phase, index) => (
                    <div key={phase.id} className="flex-1 flex items-center">
                      <div className="flex-1 flex flex-col items-center">
                        <div
                          className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors",
                            index < currentPhaseIndex && "bg-primary border-primary text-primary-foreground",
                            index === currentPhaseIndex && "bg-primary border-primary text-primary-foreground ring-4 ring-primary/20",
                            index > currentPhaseIndex && "bg-background border-muted-foreground/30 text-muted-foreground"
                          )}
                        >
                          {index < currentPhaseIndex ? (
                            <CheckCircle className="h-5 w-5" />
                          ) : (
                            <span className="text-xs font-semibold">{index + 1}</span>
                          )}
                        </div>
                        <span
                          className={cn(
                            "text-xs mt-2 text-center",
                            index <= currentPhaseIndex ? "text-foreground font-medium" : "text-muted-foreground"
                          )}
                        >
                          {phase.label}
                        </span>
                      </div>
                      {index < phases.length - 1 && (
                        <div
                          className={cn(
                            "flex-1 h-0.5 mx-2",
                            index < currentPhaseIndex ? "bg-primary" : "bg-border"
                          )}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </Card>

              {/* Validation Cockpit */}
              <Card className="p-6">
                <h3 className="text-sm font-semibold text-foreground mb-4">Validation Cockpit</h3>
                <div className="space-y-4">
                  {/* Failed */}
                  {cockpit.failed.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <XCircle className="h-4 w-4 text-red-600" />
                        <span className="text-sm font-medium text-red-600">
                          Failed ({cockpit.failed.length})
                        </span>
                      </div>
                      <div className="space-y-2 ml-6">
                        {cockpit.failed.map((check) => (
                          <div
                            key={check.id}
                            className="flex items-center justify-between p-3 rounded-md bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 cursor-pointer hover:bg-red-100 dark:hover:bg-red-950/30 transition-colors"
                            onClick={() => handleFixClick(check.section)}
                          >
                            <span className="text-sm text-red-900 dark:text-red-100">{check.name}</span>
                            <Button variant="ghost" size="sm" className="h-7 text-xs text-red-600 hover:text-red-700">
                              Fix →
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Warnings */}
                  {cockpit.warnings.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="h-4 w-4 text-orange-600" />
                        <span className="text-sm font-medium text-orange-600">
                          Warnings ({cockpit.warnings.length})
                        </span>
                      </div>
                      <div className="space-y-2 ml-6">
                        {cockpit.warnings.map((check) => (
                          <div
                            key={check.id}
                            className="flex items-center justify-between p-3 rounded-md bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800"
                          >
                            <span className="text-sm text-orange-900 dark:text-orange-100">{check.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Passed */}
                  {cockpit.passed.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-green-600">
                          Passed ({cockpit.passed.length})
                        </span>
                      </div>
                      <div className="space-y-2 ml-6">
                        {cockpit.passed.map((check) => (
                          <div
                            key={check.id}
                            className="flex items-center p-2 rounded-md bg-green-50 dark:bg-green-950/20"
                          >
                            <span className="text-sm text-green-900 dark:text-green-100">{check.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              {/* Next Best Actions */}
              <Card className="p-6">
                <h3 className="text-sm font-semibold text-foreground mb-4">Next Best Actions</h3>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    className="justify-start"
                    onClick={() => onAssign(item.id, "Emily Rodriguez")}
                  >
                    <User className="h-4 w-4 mr-2" />
                    Assign to me
                  </Button>
                  <Button
                    variant="outline"
                    className="justify-start"
                    onClick={onRequestInfo}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Request info
                  </Button>
                  <Button
                    variant="outline"
                    className="justify-start"
                    onClick={() => alert("Checks re-run (stub)")}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Re-run checks
                  </Button>
                  <Button
                    variant="outline"
                    className="justify-start"
                    onClick={() => alert("Create linked review (stub)")}
                  >
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Route to side review
                  </Button>
                </div>
              </Card>
            </TabsContent>

            {/* Details Tab */}
            <TabsContent value="details" className="space-y-4 m-0">
              <Accordion type="multiple" className="space-y-4">
                {/* Lines */}
                <AccordionItem value="lines" ref={linesRef} className="border rounded-md px-4">
                  <AccordionTrigger className="hover:no-underline">
                    <span className="font-semibold">Lines (Items/Services)</span>
                  </AccordionTrigger>
                  <AccordionContent className="pt-4">
                    <div className="text-sm text-muted-foreground">
                      <p>Line items will appear here in Step 3+.</p>
                      <p className="mt-2">Example: Dell Latitude 5430 × 15 @ $1,200 each</p>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Delivery / Location */}
                <AccordionItem value="delivery" ref={deliveryRef} className="border rounded-md px-4">
                  <AccordionTrigger className="hover:no-underline">
                    <span className="font-semibold">Delivery / Location</span>
                  </AccordionTrigger>
                  <AccordionContent className="pt-4">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Location:</span>
                        <span className="font-medium">
                          {pr?.title.includes("Bucharest") ? "Bucharest" :
                           pr?.title.includes("New York") ? "New York" :
                           pr?.title.includes("Munich") ? "Munich" :
                           pr?.title.includes("Tokyo") ? "Tokyo" : "—"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Delivery contact:</span>
                        <span className="font-medium">—</span>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Coding / Accounting */}
                <AccordionItem value="coding" ref={codingRef} className="border rounded-md px-4">
                  <AccordionTrigger className="hover:no-underline">
                    <span className="font-semibold">Coding / Accounting</span>
                  </AccordionTrigger>
                  <AccordionContent className="pt-4">
                    <div className="space-y-2 text-sm">
                      {pr && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Entity:</span>
                          <span className="font-medium">{pr.entityCode}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Cost Center:</span>
                        <span className="font-medium">—</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">GL Account:</span>
                        <span className="font-medium">—</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Commodity Group:</span>
                        <span className="font-medium">—</span>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Attachments */}
                <AccordionItem value="attachments" ref={attachmentsRef} className="border rounded-md px-4">
                  <AccordionTrigger className="hover:no-underline">
                    <span className="font-semibold">Attachments Checklist</span>
                  </AccordionTrigger>
                  <AccordionContent className="pt-4">
                    <div className="text-sm text-muted-foreground">
                      <p>No required attachments for this item.</p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </TabsContent>

            {/* Audit Trail Tab */}
            <TabsContent value="audit" className="space-y-3 m-0">
              <Card className="p-6">
                <h3 className="text-sm font-semibold text-foreground mb-4">Forensic Timeline</h3>
                <div className="space-y-4">
                  {item.auditTrail.map((event, index) => (
                    <div key={event.id} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <CheckCircle className="h-5 w-5 text-primary" />
                        </div>
                        {index < item.auditTrail.length - 1 && (
                          <div className="flex-1 w-0.5 bg-border my-1" style={{ minHeight: "20px" }} />
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-sm font-semibold text-foreground">{event.action}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {event.actor} • {event.timestamp.toLocaleString()}
                            </p>
                          </div>
                        </div>
                        {event.details && (
                          <p className="text-sm text-muted-foreground mt-2">{event.details}</p>
                        )}
                        <div className="flex gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            Who: {event.actor}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            What: {event.action}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </TabsContent>

            {/* Collaboration Tab */}
            <TabsContent value="collaboration" className="m-0">
              <Card className="p-6">
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground">
                    Collaboration features coming soon.
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Comments, mentions, and linked reviews will appear here.
                  </p>
                </div>
              </Card>
            </TabsContent>
          </div>
        </ScrollArea>
      </Tabs>
    </div>
  );
}
