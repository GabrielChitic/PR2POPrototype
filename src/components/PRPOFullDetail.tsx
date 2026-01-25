import { useRef, useState } from "react";
import { ArrowLeft, AlertCircle, CheckCircle, XCircle, AlertTriangle, User, MessageSquare, ArrowRight, RefreshCw, Send, Info } from "lucide-react";
import { useToast } from "../hooks/use-toast";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { cn } from "../lib/utils";
import type { ProcurementPR, ProcurementPO } from "../data/procurementData";
import { isValidCostCenter, getCostCentersForEntity } from "../data/costCenterData";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface PRPOFullDetailProps {
  pr: ProcurementPR | null;
  po: ProcurementPO | null;
  tab: "overview" | "details" | "audit" | "collaboration";
  onTabChange: (tab: "overview" | "details" | "audit" | "collaboration") => void;
  onBack: () => void;
  onAssign: (id: string, assignee: string) => void;
  onRequestInfo: () => void;
  onUpdatePR?: (pr: ProcurementPR) => void;
  onRerunChecks?: (id: string) => void;
  onConvertToPO?: (prId: string) => void;
  onRetryPosting?: (poId: string) => void;
  onDispatchPO?: (poId: string) => void;
  // Step 5: Lifecycle handlers
  onSimulateConfirmation?: (poId: string, deviation?: boolean) => void;
  onContinueToClose?: (poId: string) => void;
  onReviewChange?: (poId: string) => void;
  onAcceptChange?: (poId: string) => void;
  onRejectChange?: (poId: string) => void;
  onCloseDemo?: (poId: string) => void;
  // Traceability navigation
  onNavigateToLinkedObject?: (type: 'PR' | 'PO', number: string) => void;
}

// Phase ribbon definitions
const PR_PHASES = [
  { id: "gatekeep", label: "Gatekeep" },
  { id: "reviews", label: "Coordinate reviews" },
  { id: "approvals", label: "Approvals (pre-recorded)" },
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
  onUpdatePR,
  onRerunChecks,
  onConvertToPO,
  onRetryPosting,
  onDispatchPO,
  onSimulateConfirmation,
  onContinueToClose,
  onReviewChange,
  onAcceptChange,
  onRejectChange,
  onCloseDemo: _onCloseDemo,
}: PRPOFullDetailProps) {
  const item = pr || po;
  if (!item) return null;

  const { toast } = useToast();

  // State for accordion control
  const [openAccordionItems, setOpenAccordionItems] = useState<string[]>([]);

  // State for source of supply dialog
  const [showSourceDialog, setShowSourceDialog] = useState(false);

  // State for historical PO dialog
  const [showHistoryDialog, setShowHistoryDialog] = useState(false);

  // Refs for scroll targets
  const linesRef = useRef<HTMLDivElement>(null);
  const deliveryRef = useRef<HTMLDivElement>(null);
  const codingRef = useRef<HTMLDivElement>(null);
  const attachmentsRef = useRef<HTMLDivElement>(null);

  // Refs for focusable fields
  const costCenterRef = useRef<HTMLButtonElement>(null);
  const deliveryLocationRef = useRef<HTMLDivElement>(null);
  const needByDateRef = useRef<HTMLDivElement>(null);

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

  // Computed validation cockpit based on actual PR/PO fields
  const getValidationCockpit = () => {
    const failed: Array<{ id: string; name: string; section: string }> = [];
    const warnings: Array<{ id: string; name: string }> = [];
    const passed: Array<{ id: string; name: string }> = [];

    if (pr) {
      // Readiness checks
      if (pr.deliveryLocation && pr.deliveryLocation.trim() !== "") {
        passed.push({ id: "pass-delivery-location", name: "Delivery location present" });
      } else {
        failed.push({
          id: "fail-delivery-location",
          name: "Delivery location missing",
          section: "delivery",
        });
      }

      if (pr.needByDate && pr.needByDate.trim() !== "") {
        passed.push({ id: "pass-need-by-date", name: "Need-by date present" });
      } else {
        failed.push({
          id: "fail-need-by-date",
          name: "Need-by date missing",
          section: "delivery",
        });
      }

      if (pr.lineItems && pr.lineItems.length > 0 && pr.lineItems[0].quantity > 0) {
        passed.push({ id: "pass-lines", name: "Lines present with qty > 0" });
      } else {
        failed.push({
          id: "fail-lines",
          name: "No line items or quantity is zero",
          section: "lines",
        });
      }

      // Coding / Accounting checks
      if (pr.costCenter && isValidCostCenter(pr.costCenter, pr.entityCode)) {
        passed.push({ id: "pass-cost-center", name: "Cost center valid for entity" });
      } else {
        failed.push({
          id: "fail-cost-center",
          name: "Invalid cost center",
          section: "coding",
        });
      }

      if (pr.glAccount && pr.glAccount.trim() !== "") {
        passed.push({ id: "pass-gl-account", name: "GL account present" });
      } else {
        failed.push({
          id: "fail-gl-account",
          name: "GL account missing",
          section: "coding",
        });
      }

      if (pr.commodityGroup && pr.commodityGroup.trim() !== "") {
        passed.push({ id: "pass-commodity-group", name: "Commodity group present" });
      } else {
        failed.push({
          id: "fail-commodity-group",
          name: "Commodity group missing",
          section: "coding",
        });
      }

      // Policy / Compliance checks (lightweight for now)
      passed.push({ id: "pass-preferred-supplier", name: "Preferred supplier policy" });
      passed.push({ id: "pass-contract", name: "Contract validity" });

      // SLA warnings
      if (pr.slaBreached) {
        warnings.push({ id: "warn-sla", name: "SLA breach detected" });
      }
    } else if (po) {
      // BBraun PO-4516638113: Enhanced validation cockpit with specific checks
      if (po.poNumber === "PO-4516638113") {
        // Cost & Conditions
        passed.push({
          id: "pass-bbraun-price-match",
          name: "Price matches info record 5301133479: EUR 61.6/PAK"
        });

        const expectedAmount = 2288 * 61.6;
        if (Math.abs(po.amount - expectedAmount) < 0.01) {
          passed.push({
            id: "pass-bbraun-amount-calc",
            name: `Net amount matches calculation: 2,288 PAK × 61.6 = ${expectedAmount.toLocaleString()} EUR`
          });
        }

        // Commercial conditions
        passed.push({
          id: "pass-bbraun-conditions",
          name: "Commercial conditions: defaulted from info record 5301133479 / org policy (demo)"
        });

        // Quantity
        passed.push({
          id: "pass-bbraun-qty-lot",
          name: "Quantity aligns to fixed lot sizing policy (45,760 pcs / 2,288 PAK)"
        });

        passed.push({
          id: "pass-bbraun-uom",
          name: "UoM/spec sanity: 1 PAK = 120 pcs; total 274,560 pcs consistent"
        });

        // Dates
        passed.push({
          id: "pass-bbraun-lead-time",
          name: "Lead time/date plausibility: 120 days lead time within policy"
        });

        // Specifications
        passed.push({
          id: "pass-bbraun-material",
          name: "Material specification: PL568T (Surgical Clips) valid"
        });

        // Master data checks
        passed.push({
          id: "pass-bbraun-vendor",
          name: "Vendor active: 1165336 (AESCULAP) + purch org mapping valid"
        });

        passed.push({
          id: "pass-bbraun-purch-group",
          name: "Purchasing group present: 7EF (Surgical Supplies)"
        });

        passed.push({
          id: "pass-bbraun-plant",
          name: "Plant present: DE01 (BBraun Melsungen)"
        });

        passed.push({
          id: "pass-bbraun-commodity",
          name: "Commodity group present: D05AA19AE (Medical Consumables)"
        });

        passed.push({
          id: "pass-bbraun-accounting",
          name: "Account assignment present: Cost Center 7200 + GL 400100"
        });

      } else {
        // Generic PO validation for non-BBraun POs

        // Supplier check
        if (po.supplier && po.supplier.trim() !== "") {
          passed.push({ id: "pass-po-supplier", name: "Supplier active / valid purchasing org mapping" });
        } else {
          failed.push({
            id: "fail-po-supplier",
            name: "Supplier missing or inactive",
            section: "delivery",
          });
        }

        // Tax/Currency check
        if (po.currency && po.entityCode) {
          passed.push({ id: "pass-po-tax-currency", name: "Tax / currency valid for entity" });
        } else {
          failed.push({
            id: "fail-po-tax-currency",
            name: "Tax or currency invalid",
            section: "coding",
          });
        }

        // Account assignment check
        if (po.costCenter && po.glAccount) {
          passed.push({ id: "pass-po-account-assignment", name: "Account assignment valid (cost center + GL present)" });
        } else {
          failed.push({
            id: "fail-po-account-assignment",
            name: "Account assignment incomplete",
            section: "coding",
          });
        }

        // Price conditions match (demo: assume contract price = unit price for catalog items)
        if (po.lineItems && po.lineItems.length > 0) {
          // For demo, all catalog items pass price check
          passed.push({ id: "pass-po-price", name: "Price conditions match contract/catalog" });
        } else {
          failed.push({
            id: "fail-po-price",
            name: "Price validation failed",
            section: "lines",
          });
        }

        // Delivery data complete
        if (po.deliveryLocation && po.needByDate) {
          passed.push({ id: "pass-po-delivery-data", name: "Delivery data complete (ship-to + requested date)" });
        } else {
          failed.push({
            id: "fail-po-delivery-data",
            name: "Delivery location or need-by date missing",
            section: "delivery",
          });
        }

        // Total amount matches PR snapshot (if from PR conversion)
        if (po.amount > 0) {
          passed.push({ id: "pass-po-amount", name: "Total amount matches PR snapshot" });
        } else {
          failed.push({
            id: "fail-po-amount",
            name: "Amount validation failed",
            section: "lines",
          });
        }

        // Commodity compliance
        if (po.commodityGroup && po.commodityGroup.trim() !== "") {
          passed.push({ id: "pass-po-commodity", name: "No blocked commodity / compliance restriction" });
        } else {
          failed.push({
            id: "fail-po-commodity",
            name: "Commodity group validation failed",
            section: "coding",
          });
        }

        // Lines check
        if (po.lineItems && po.lineItems.length > 0 && po.lineItems[0].quantity > 0) {
          passed.push({ id: "pass-po-lines", name: "Lines present with valid quantities" });
        } else {
          failed.push({
            id: "fail-po-lines",
            name: "No line items or invalid quantity",
            section: "lines",
          });
        }
      }

      // PO Validation - Dispatch gate (sending readiness)

      // Dispatch channel check
      if (po.dispatchMethod && po.dispatchMethod.trim() !== "") {
        passed.push({ id: "pass-po-dispatch-channel", name: "Dispatch channel configured (email/EDI/network)" });
      } else {
        warnings.push({ id: "warn-po-dispatch-channel", name: "Dispatch channel not configured" });
      }

      // Supplier endpoint check (demo: always pass for catalog suppliers)
      if (po.supplier) {
        passed.push({ id: "pass-po-supplier-endpoint", name: "Supplier contact / endpoint available" });
      }

      // PO output form check
      if (po.poNumber) {
        passed.push({ id: "pass-po-output-form", name: "PO output form ready (PDF/email body)" });
      }

      // SLA warnings
      if (po.slaBreached) {
        warnings.push({ id: "warn-sla", name: "SLA breach detected" });
      }

      // If there's a custom failure reason, add it as a failed check
      if (po.failureReason && !failed.some(f => f.name === po.failureReason)) {
        failed.push({
          id: "fail-po-custom",
          name: po.failureReason,
          section: "delivery",
        });
      }
    }

    return { failed, warnings, passed };
  };

  const cockpit = getValidationCockpit();

  // Map of check IDs to their field targets
  const checkFieldMap: Record<string, { section: string; fieldId: string }> = {
    // PR checks
    "fail-cost-center": { section: "coding", fieldId: "costCenter" },
    "fail-gl-account": { section: "coding", fieldId: "glAccount" },
    "fail-commodity-group": { section: "coding", fieldId: "commodityGroup" },
    "fail-delivery-location": { section: "delivery", fieldId: "deliveryLocation" },
    "fail-need-by-date": { section: "delivery", fieldId: "needByDate" },
    "fail-lines": { section: "lines", fieldId: "" },
    // PO checks
    "fail-po-supplier": { section: "delivery", fieldId: "" },
    "fail-po-tax-currency": { section: "coding", fieldId: "" },
    "fail-po-account-assignment": { section: "coding", fieldId: "costCenter" },
    "fail-po-price": { section: "lines", fieldId: "" },
    "fail-po-delivery-data": { section: "delivery", fieldId: "deliveryLocation" },
    "fail-po-amount": { section: "lines", fieldId: "" },
    "fail-po-commodity": { section: "coding", fieldId: "commodityGroup" },
    "fail-po-lines": { section: "lines", fieldId: "" },
    "fail-po-custom": { section: "delivery", fieldId: "" },
  };

  // Handle click-to-fix with accordion expansion and field focus
  const handleFixClick = (section: string, fieldId?: string) => {
    onTabChange("details");

    // Expand the accordion section
    if (!openAccordionItems.includes(section)) {
      setOpenAccordionItems([...openAccordionItems, section]);
    }

    // Scroll to section and focus field after tab changes
    setTimeout(() => {
      let targetElement: HTMLDivElement | null = null;
      let focusElement: HTMLElement | null = null;

      if (section === "lines") {
        targetElement = linesRef.current;
      } else if (section === "delivery") {
        targetElement = deliveryRef.current;
        if (fieldId === "deliveryLocation") focusElement = deliveryLocationRef.current;
        else if (fieldId === "needByDate") focusElement = needByDateRef.current;
      } else if (section === "coding") {
        targetElement = codingRef.current;
        if (fieldId === "costCenter") focusElement = costCenterRef.current;
      } else if (section === "attachments") {
        targetElement = attachmentsRef.current;
      }

      // Scroll to section
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: "smooth", block: "start" });
      }

      // Focus and highlight field
      setTimeout(() => {
        if (focusElement) {
          focusElement.focus();
          focusElement.classList.add("ring-2", "ring-primary", "ring-offset-2");
          setTimeout(() => {
            focusElement?.classList.remove("ring-2", "ring-primary", "ring-offset-2");
          }, 2000);
        }
      }, 300);
    }, 150);
  };

  // Handle re-run checks from Details tab
  const handleRerunChecksFromDetails = () => {
    if (!onRerunChecks || !item.id || !pr) return;

    // Check if all required fields are valid
    const hasValidCostCenter = pr.costCenter && isValidCostCenter(pr.costCenter, pr.entityCode);
    const hasDeliveryLocation = pr.deliveryLocation && pr.deliveryLocation.trim() !== "";
    const hasNeedByDate = pr.needByDate && pr.needByDate.trim() !== "";
    const hasLineItems = pr.lineItems && pr.lineItems.length > 0 && pr.lineItems[0].quantity > 0;
    const hasGLAccount = pr.glAccount && pr.glAccount.trim() !== "";
    const hasCommodityGroup = pr.commodityGroup && pr.commodityGroup.trim() !== "";

    const allValid = hasValidCostCenter && hasDeliveryLocation && hasNeedByDate &&
                     hasLineItems && hasGLAccount && hasCommodityGroup;

    if (!allValid) {
      // Find which field is still invalid
      const missingFields: string[] = [];
      if (!hasValidCostCenter) missingFields.push("Cost Center");
      if (!hasDeliveryLocation) missingFields.push("Delivery Location");
      if (!hasNeedByDate) missingFields.push("Need-by Date");
      if (!hasLineItems) missingFields.push("Line Items");
      if (!hasGLAccount) missingFields.push("GL Account");
      if (!hasCommodityGroup) missingFields.push("Commodity Group");

      toast({
        title: "Validation failed",
        description: `Please fix: ${missingFields.join(", ")}`,
        variant: "destructive",
      });
      return;
    }

    // All checks passed - run validation
    onRerunChecks(item.id);

    // Show success toast
    toast({
      title: "Checks passed!",
      description: "Gatekeep cleared. PR advanced to next phase.",
    });

    // Switch back to Overview
    setTimeout(() => {
      onTabChange("overview");
    }, 500);
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
                  {/* PR → PO Traceability Link */}
                  {pr?.linkedPoNumber && (
                    <Badge
                      variant="outline"
                      className="text-xs cursor-pointer hover:bg-muted transition-colors"
                      onClick={() => onNavigateToLinkedObject?.('PO', pr.linkedPoNumber!)}
                    >
                      <ArrowRight className="h-3 w-3 mr-1" />
                      Linked PO: {pr.linkedPoNumber}
                    </Badge>
                  )}
                  {/* PO → PR Traceability Link */}
                  {po?.sourcePrNumber && (
                    <Badge
                      variant="outline"
                      className="text-xs cursor-pointer hover:bg-muted transition-colors"
                      onClick={() => onNavigateToLinkedObject?.('PR', po.sourcePrNumber!)}
                    >
                      <ArrowLeft className="h-3 w-3 mr-1" />
                      Source PR: {po.sourcePrNumber}
                    </Badge>
                  )}
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
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-sm font-semibold text-foreground">Validation Cockpit</h3>
                  {cockpit.failed.length === 0 && cockpit.warnings.length === 0 && cockpit.passed.length > 0 && (
                    <Badge variant="outline" className="bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      All checks passed
                    </Badge>
                  )}
                  {cockpit.failed.length > 0 && (
                    <Badge variant="outline" className="bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800">
                      <XCircle className="h-3 w-3 mr-1" />
                      {cockpit.failed.length} {cockpit.failed.length === 1 ? "issue" : "issues"}
                    </Badge>
                  )}
                </div>

                <div className="space-y-2">
                  {/* Failed Checks */}
                  {cockpit.failed.map((check) => {
                    const fieldMapping = checkFieldMap[check.id];
                    return (
                      <div
                        key={check.id}
                        className="flex items-start gap-3 p-3 rounded-lg bg-red-50/50 dark:bg-red-950/10 border border-red-100 dark:border-red-900/30 hover:border-red-200 dark:hover:border-red-800/50 transition-colors cursor-pointer group"
                        onClick={() => handleFixClick(
                          fieldMapping?.section || check.section,
                          fieldMapping?.fieldId
                        )}
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <div className="flex-shrink-0">
                            <XCircle className="h-4 w-4 text-red-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground">{check.name}</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800 text-xs">
                          REQUIRED
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFixClick(
                              fieldMapping?.section || check.section,
                              fieldMapping?.fieldId
                            );
                          }}
                        >
                          Fix →
                        </Button>
                      </div>
                    );
                  })}

                  {/* Warning Checks */}
                  {cockpit.warnings.map((check) => (
                    <div
                      key={check.id}
                      className="flex items-start gap-3 p-3 rounded-lg bg-orange-50/50 dark:bg-orange-950/10 border border-orange-100 dark:border-orange-900/30"
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div className="flex-shrink-0">
                          <AlertTriangle className="h-4 w-4 text-orange-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground">{check.name}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-orange-100 dark:bg-orange-950/30 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800 text-xs">
                        WARNING
                      </Badge>
                    </div>
                  ))}

                  {/* Passed Checks - Only show when no failures */}
                  {cockpit.failed.length === 0 && cockpit.passed.map((check) => (
                    <div
                      key={check.id}
                      className="flex items-start gap-3 p-2.5 rounded-lg bg-muted/20"
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div className="flex-shrink-0">
                          <CheckCircle className="h-3.5 w-3.5 text-green-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-muted-foreground">{check.name}</p>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Summary message when all passed */}
                  {cockpit.failed.length === 0 && cockpit.warnings.length === 0 && cockpit.passed.length > 0 && (
                    <div className="text-center py-2">
                      <p className="text-xs text-muted-foreground">
                        {cockpit.passed.length} {cockpit.passed.length === 1 ? "check" : "checks"} completed successfully
                      </p>
                    </div>
                  )}
                </div>
              </Card>

              {/* BBraun PO: Release / Approval Trace */}
              {po && po.poNumber === "PO-4516638113" && (
                <Card className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <h3 className="text-sm font-semibold text-foreground">Release / Approval Trace</h3>
                    <Badge variant="secondary" className="text-xs">
                      Pre-recorded (demo)
                    </Badge>
                  </div>
                  <div className="space-y-4">
                    {/* Release Strategy */}
                    <div className="border rounded-md p-4 bg-muted/20">
                      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                        Release Strategy
                      </div>
                      <div className="text-sm font-medium">
                        High-Value PO Release (3-level approval) - Tier 4
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Applicable for POs ≥ EUR 100,000 · Purchasing Group 7EF
                      </div>
                    </div>

                    {/* Approval Steps */}
                    <div className="space-y-3">
                      {[
                        {
                          step: 1,
                          approver: "Michael Schneider",
                          role: "Operational Buyer",
                          action: "Operational Review",
                          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
                          status: "Approved",
                          sla: "On track",
                          slaHours: 4,
                        },
                        {
                          step: 2,
                          approver: "Dr. Andrea Weber",
                          role: "Head of Operational Purchasing",
                          action: "Purchasing Release",
                          timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000),
                          status: "Approved",
                          sla: "On track",
                          slaHours: 24,
                        },
                        {
                          step: 3,
                          approver: "Thomas Becker",
                          role: "Compliance Manager",
                          action: "Final Compliance Sign-off",
                          timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
                          status: "Approved",
                          sla: "On track",
                          slaHours: 48,
                        },
                      ].map((approval) => (
                        <div key={approval.step} className="flex items-start gap-3 p-3 border rounded-md">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 dark:bg-green-950/30 flex items-center justify-center">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <div>
                                <div className="text-sm font-medium">{approval.approver}</div>
                                <div className="text-xs text-muted-foreground">{approval.role}</div>
                              </div>
                              <Badge variant="outline" className="bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800 text-xs">
                                {approval.sla}
                              </Badge>
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {approval.action} · {approval.timestamp.toLocaleDateString("en-US", { month: "short", day: "numeric" })} at {approval.timestamp.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              SLA: {approval.slaHours} hours
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="text-center py-2 border-t">
                      <p className="text-xs text-muted-foreground">
                        All approval steps completed · Total cycle time: ~3.5 hours
                      </p>
                    </div>
                  </div>
                </Card>
              )}

              {/* BBraun PO: Supplier Confirmation (Step 5) */}
              {po && po.poNumber === "PO-4516638113" && po.dispatchStatus === "Sent" && (
                <Card className="p-6">
                  <h3 className="text-sm font-semibold text-foreground mb-4">Supplier Confirmation (EKES)</h3>
                  <div className="space-y-4">
                    {/* Confirmation Status */}
                    <div className="p-4 rounded-md border border-green-200 bg-green-50 dark:bg-green-950/20">
                      <div className="flex items-center gap-2 mb-3">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span className="text-sm font-semibold text-green-900 dark:text-green-100">
                          Confirmation Received
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">Confirmation Type</div>
                          <div className="font-medium">AB - Acknowledgment</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">Confirmed Quantity</div>
                          <div className="font-medium">2,288 PAK</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">Confirmed Delivery</div>
                          <div className="font-medium">
                            {new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">Received At</div>
                          <div className="font-medium">
                            {new Date(Date.now() + 2 * 60 * 60 * 1000).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 text-xs text-green-800 dark:text-green-200">
                        Supplier confirmed order as requested. No deviations.
                      </div>
                    </div>

                    {/* Delta Check */}
                    <div className="border rounded-md p-4 bg-muted/20">
                      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
                        Delta Check
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                          <span className="text-muted-foreground">Confirmed qty matches PO qty: 2,288 PAK</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                          <span className="text-muted-foreground">Confirmed date within tolerance: 120 days (policy compliant)</span>
                        </div>
                      </div>
                    </div>

                    {/* Status Summary */}
                    <div className="text-center py-2 border-t">
                      <Badge variant="outline" className="bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800">
                        Confirmed · Awaiting Delivery
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-2">
                        Next milestone: Goods Receipt (not implemented in demo)
                      </p>
                    </div>
                  </div>
                </Card>
              )}

              {/* Step 5: PO Lifecycle Card (Confirm/Change/Close phases) */}
              {po && (po.phaseStep === "Confirm" || po.phaseStep === "Change" || po.phaseStep === "Close") && (
                <Card className="p-6">
                  <h3 className="text-sm font-semibold text-foreground mb-4">PO Lifecycle</h3>
                  <div className="space-y-4">
                    {/* Confirm Phase - WAITING status */}
                    {po.phaseStep === "Confirm" && po.confirmationStatus === "WAITING" && (
                      <div className="p-4 rounded-md border border-blue-200 bg-blue-50 dark:bg-blue-950/20">
                        <div className="flex items-center gap-2 mb-3">
                          <AlertCircle className="h-5 w-5 text-blue-600" />
                          <span className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                            Waiting for Supplier Confirmation
                          </span>
                        </div>
                        <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
                          PO has been sent to supplier. Awaiting order confirmation.
                        </p>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => onSimulateConfirmation?.(po.id, false)}
                          >
                            Simulate Confirmation (No Issues)
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onSimulateConfirmation?.(po.id, true)}
                          >
                            Simulate Deviation
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Confirm Phase - RECEIVED status */}
                    {po.phaseStep === "Confirm" && po.confirmationStatus === "RECEIVED" && (
                      <div className="p-4 rounded-md border border-green-200 bg-green-50 dark:bg-green-950/20">
                        <div className="flex items-center gap-2 mb-3">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <span className="text-sm font-semibold text-green-900 dark:text-green-100">
                            Confirmation Received
                          </span>
                        </div>
                        <div className="space-y-2 text-sm text-green-800 dark:text-green-200 mb-3">
                          <p><strong>Confirmed Delivery:</strong> {po.confirmedDeliveryDate ? new Date(po.confirmedDeliveryDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}</p>
                          {po.confirmationNote && <p><strong>Note:</strong> {po.confirmationNote}</p>}
                        </div>
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => onContinueToClose?.(po.id)}
                        >
                          <ArrowRight className="h-4 w-4 mr-2" />
                          Continue to Close
                        </Button>
                      </div>
                    )}

                    {/* Confirm Phase - DEVIATION status */}
                    {po.phaseStep === "Confirm" && po.confirmationStatus === "DEVIATION" && (
                      <div className="p-4 rounded-md border border-orange-200 bg-orange-50 dark:bg-orange-950/20">
                        <div className="flex items-center gap-2 mb-3">
                          <AlertTriangle className="h-5 w-5 text-orange-600" />
                          <span className="text-sm font-semibold text-orange-900 dark:text-orange-100">
                            Confirmation Deviation Detected
                          </span>
                        </div>
                        <div className="space-y-2 text-sm text-orange-800 dark:text-orange-200 mb-3">
                          <p><strong>Original Delivery:</strong> {po.needByDate ? new Date(po.needByDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}</p>
                          <p><strong>Proposed Delivery:</strong> {po.proposedChanges?.deliveryDate ? new Date(po.proposedChanges.deliveryDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}</p>
                          {po.confirmationNote && <p><strong>Reason:</strong> {po.confirmationNote}</p>}
                        </div>
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => onReviewChange?.(po.id)}
                        >
                          <AlertCircle className="h-4 w-4 mr-2" />
                          Review Change Request
                        </Button>
                      </div>
                    )}

                    {/* Change Phase - PENDING status */}
                    {po.phaseStep === "Change" && po.changeStatus === "PENDING" && (
                      <div className="p-4 rounded-md border border-purple-200 bg-purple-50 dark:bg-purple-950/20">
                        <div className="flex items-center gap-2 mb-3">
                          <AlertCircle className="h-5 w-5 text-purple-600" />
                          <span className="text-sm font-semibold text-purple-900 dark:text-purple-100">
                            Change Decision Required
                          </span>
                        </div>
                        <div className="space-y-2 text-sm text-purple-800 dark:text-purple-200 mb-3">
                          <p><strong>Current Delivery:</strong> {po.needByDate ? new Date(po.needByDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}</p>
                          <p><strong>Proposed Delivery:</strong> {po.proposedChanges?.deliveryDate ? new Date(po.proposedChanges.deliveryDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}</p>
                          <p className="text-xs">Accepting will update the PO with the new delivery date.</p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => onAcceptChange?.(po.id)}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Accept Changes
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onRejectChange?.(po.id)}
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject Changes
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Close Phase */}
                    {po.phaseStep === "Close" && po.closeStatus === "CLOSED_DEMO" && (
                      <div className="p-4 rounded-md border border-gray-200 bg-gray-50 dark:bg-gray-950/20">
                        <div className="flex items-center gap-2 mb-3">
                          <CheckCircle className="h-5 w-5 text-gray-600" />
                          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                            PO Closed
                          </span>
                        </div>
                        <p className="text-sm text-gray-800 dark:text-gray-200 mb-3">
                          This purchase order has been successfully closed.
                          {po.changeStatus === "ACCEPTED" && " Changes were accepted and applied."}
                          {po.changeStatus === "REJECTED" && " Changes were rejected."}
                        </p>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onTabChange("audit")}
                        >
                          View Audit Trail
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              )}

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

                  {/* PR-specific actions */}
                  {pr && (
                    <>
                      <Button
                        variant="outline"
                        className="justify-start"
                        onClick={() => {
                          if (onRerunChecks && item.id) {
                            onRerunChecks(item.id);
                          }
                        }}
                        disabled={!onRerunChecks}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Re-run checks
                      </Button>
                      <Button
                        variant={pr.phaseStep === "Ready for PO" ? "default" : "outline"}
                        className="justify-start"
                        onClick={() => {
                          if (onConvertToPO && pr.id) {
                            onConvertToPO(pr.id);
                          }
                        }}
                        disabled={!onConvertToPO || pr.phaseStep !== "Ready for PO"}
                        title={pr.phaseStep !== "Ready for PO" ? "PR must pass gatekeep and be Ready for PO" : "Convert this PR to a Purchase Order"}
                      >
                        <ArrowRight className="h-4 w-4 mr-2" />
                        Convert to PO
                      </Button>
                      {pr.prNumber === "PR-4546245893" && (
                        <Button
                          variant="outline"
                          className="justify-start"
                          onClick={() => setShowSourceDialog(true)}
                        >
                          <Info className="h-4 w-4 mr-2" />
                          View source of supply
                        </Button>
                      )}
                    </>
                  )}

                  {/* PO-specific actions */}
                  {po && (
                    <>
                      {po.failureReason && (
                        <Button
                          variant="default"
                          className="justify-start"
                          onClick={() => {
                            if (onRetryPosting && po.id) {
                              onRetryPosting(po.id);
                            }
                          }}
                          disabled={!onRetryPosting}
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Retry posting
                        </Button>
                      )}
                      {((po.phaseStep === "Dispatch" || po.phaseStep === "Create/Post") && po.dispatchStatus === "Ready to send") && (
                        <Button
                          variant="default"
                          className="justify-start"
                          onClick={() => {
                            if (onDispatchPO && po.id) {
                              onDispatchPO(po.id);
                            }
                          }}
                          disabled={!onDispatchPO}
                        >
                          <Send className="h-4 w-4 mr-2" />
                          Send PO (demo)
                        </Button>
                      )}
                      {po.poNumber === "PO-4516638113" && (
                        <>
                          <Button
                            variant="outline"
                            className="justify-start"
                            onClick={() => setShowSourceDialog(true)}
                          >
                            <Info className="h-4 w-4 mr-2" />
                            View pricing basis
                          </Button>
                          <Button
                            variant="outline"
                            className="justify-start"
                            onClick={() => setShowHistoryDialog(true)}
                          >
                            <Info className="h-4 w-4 mr-2" />
                            View historical POs
                          </Button>
                        </>
                      )}
                    </>
                  )}

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
            <TabsContent value="details" className="space-y-4 m-0 relative pb-20">
              {/* Step 6: Rerun checks CTA in Details tab (for PRs) */}
              {pr && (
                <div className="sticky top-0 z-10 flex justify-end mb-4 bg-background/95 backdrop-blur py-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      if (onRerunChecks && pr.id) {
                        onRerunChecks(pr.id);
                      }
                    }}
                    disabled={!onRerunChecks}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Re-run checks
                  </Button>
                </div>
              )}
              <Accordion
                type="multiple"
                value={openAccordionItems}
                onValueChange={setOpenAccordionItems}
                className="space-y-4"
              >
                {/* Lines */}
                <AccordionItem value="lines" ref={linesRef} className="border rounded-md px-4 bg-white">
                  <AccordionTrigger className="hover:no-underline py-3">
                    <div className="flex items-center justify-between flex-1 mr-2">
                      <span className="font-semibold text-sm">Lines (Items/Services)</span>
                      {pr?.lineItems && pr.lineItems.length > 0 && (
                        <span className="text-xs text-muted-foreground">
                          {pr.lineItems.length} {pr.lineItems.length === 1 ? "item" : "items"}
                        </span>
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-2 pb-4">
                    {((pr?.lineItems && pr.lineItems.length > 0) || (po?.lineItems && po.lineItems.length > 0)) ? (
                      <div className="space-y-2">
                        {(pr?.lineItems || po?.lineItems || []).map((line) => {
                          const currencySymbol = (pr?.currency || po?.currency) === "EUR" ? "EUR" : "$";
                          const isBBraunPO = po?.poNumber === "PO-4516638113";
                          return (
                            <div
                              key={line.id}
                              className="p-2.5 rounded-md border bg-muted/30 space-y-2"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="font-medium text-sm text-foreground">
                                    {line.description}
                                  </div>
                                  {isBBraunPO && (
                                    <div className="text-xs text-muted-foreground mt-1">
                                      Material: PL568T · 120 pieces per PAK
                                    </div>
                                  )}
                                </div>
                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                  <span>Qty: <span className="font-medium text-foreground">{line.quantity.toLocaleString()}</span> {isBBraunPO ? "PAK" : ""}</span>
                                  <span>@ {currencySymbol} {line.unitPrice.toLocaleString()}</span>
                                  <span className="font-semibold text-foreground min-w-[100px] text-right">
                                    {currencySymbol} {(line.quantity * line.unitPrice).toLocaleString()}
                                  </span>
                                </div>
                              </div>
                              {isBBraunPO && (
                                <div className="text-xs text-muted-foreground pt-1 border-t">
                                  Total pieces: {(line.quantity * 120).toLocaleString()} pieces ({line.quantity.toLocaleString()} PAK × 120)
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground py-2">
                        <p>No line items found.</p>
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>

                {/* Delivery / Location */}
                <AccordionItem value="delivery" ref={deliveryRef} className="border rounded-md px-4 bg-white">
                  <AccordionTrigger className="hover:no-underline py-3">
                    <span className="font-semibold text-sm">Delivery / Location</span>
                  </AccordionTrigger>
                  <AccordionContent className="pt-2 pb-4">
                    {(pr || po) && (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5" ref={deliveryLocationRef} tabIndex={-1}>
                          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            {po ? "Plant / Delivery Location" : "Delivery Location"}
                          </label>
                          <div className="text-sm font-medium text-foreground">
                            {(pr?.deliveryLocation || po?.deliveryLocation) || <span className="text-muted-foreground">—</span>}
                          </div>
                        </div>
                        <div className="space-y-1.5" ref={needByDateRef} tabIndex={-1}>
                          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            {po ? "Requested Delivery Date" : "Need-by Date"}
                          </label>
                          <div className="text-sm font-medium text-foreground">
                            {(pr?.needByDate || po?.needByDate)
                              ? new Date(pr?.needByDate || po?.needByDate!).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })
                              : <span className="text-muted-foreground">—</span>}
                          </div>
                        </div>
                        {po?.poNumber === "PO-4516638113" && (
                          <div className="space-y-1.5 col-span-2">
                            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                              Ship-to Address
                            </label>
                            <div className="text-sm font-medium text-foreground">
                              Aesculap Platz, 78532 Tuttlingen, Germany
                            </div>
                          </div>
                        )}
                        <div className="space-y-1.5 col-span-2">
                          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            {pr ? "Delivery Contact" : "Supplier"}
                          </label>
                          <div className="text-sm font-medium text-foreground">
                            {pr ? pr.requester : po?.supplier}
                          </div>
                        </div>
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>

                {/* Coding / Accounting */}
                <AccordionItem value="coding" ref={codingRef} className="border rounded-md px-4 bg-white">
                  <AccordionTrigger className="hover:no-underline py-3">
                    <span className="font-semibold text-sm">Coding / Accounting</span>
                  </AccordionTrigger>
                  <AccordionContent className="pt-2 pb-4">
                    {(pr || po) && (
                      <div className="space-y-4">
                        {/* Entity row */}
                        <div className="pb-2 border-b">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Entity</span>
                            <span className="text-sm font-semibold text-foreground">{pr?.entityCode || po?.entityCode}</span>
                          </div>
                        </div>

                        {/* Form grid */}
                        <div className="grid grid-cols-2 gap-4">
                          {/* Commodity Group (read-only) */}
                          <div className="space-y-1.5">
                            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                              Commodity Group
                            </label>
                            <div className="p-2 rounded-md bg-muted/30 text-sm text-foreground border">
                              {pr?.commodityGroup || po?.commodityGroup || "—"}
                            </div>
                          </div>

                          {/* GL Account (read-only) */}
                          <div className="space-y-1.5">
                            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                              GL Account
                            </label>
                            <div className="p-2 rounded-md bg-muted/30 text-sm text-foreground border">
                              {pr?.glAccount || po?.glAccount || "—"}
                            </div>
                          </div>

                          {/* Cost Center - Editable for PR, Read-only for PO */}
                          <div className="space-y-1.5 col-span-2">
                            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                              Cost Center {pr && <span className="text-red-600">*</span>}
                            </label>
                            {pr ? (
                              <>
                                <Select
                                  value={pr.costCenter || ""}
                                  onValueChange={(value: string) => {
                                    if (onUpdatePR && pr) {
                                      onUpdatePR({
                                        ...pr,
                                        costCenter: value,
                                      });
                                    }
                                  }}
                                >
                                  <SelectTrigger
                                    ref={costCenterRef}
                                    className={cn(
                                      "w-full transition-all",
                                      pr.costCenter && !isValidCostCenter(pr.costCenter, pr.entityCode) &&
                                        "border-red-500 focus-visible:ring-red-500"
                                    )}
                                  >
                                    <SelectValue placeholder="Select cost center" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {pr.costCenter && !isValidCostCenter(pr.costCenter, pr.entityCode) && (
                                      <SelectItem value={pr.costCenter} disabled>
                                        {pr.costCenter} (Invalid)
                                      </SelectItem>
                                    )}
                                    {getCostCentersForEntity(pr.entityCode).map((cc) => (
                                      <SelectItem key={cc.code} value={cc.code}>
                                        {cc.code} — {cc.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                {pr.costCenter && !isValidCostCenter(pr.costCenter, pr.entityCode) && (
                                  <p className="text-xs text-red-600 flex items-center gap-1 mt-1.5">
                                    <AlertCircle className="h-3 w-3" />
                                    Cost center is not valid for entity {pr.entityCode}
                                  </p>
                                )}
                                {pr.costCenter &&
                                  isValidCostCenter(pr.costCenter, pr.entityCode) &&
                                  cockpit.failed.some((f) => f.id === "fail-cost-center") && (
                                    <p className="text-xs text-orange-600 flex items-center gap-1 mt-1.5">
                                      <AlertCircle className="h-3 w-3" />
                                      Cost center updated — re-run checks to continue
                                    </p>
                                  )}
                              </>
                            ) : (
                              <div className="p-2 rounded-md bg-muted/30 text-sm text-foreground border">
                                {po?.costCenter || "—"}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>

                {/* Attachments */}
                <AccordionItem value="attachments" ref={attachmentsRef} className="border rounded-md px-4 bg-white">
                  <AccordionTrigger className="hover:no-underline py-3">
                    <span className="font-semibold text-sm">{po ? "Evidence / References" : "Attachments Checklist"}</span>
                  </AccordionTrigger>
                  <AccordionContent className="pt-2 pb-4">
                    {po?.poNumber === "PO-4516638113" ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-2.5 rounded-md border bg-muted/30">
                          <div className="flex items-center gap-3">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <div>
                              <div className="text-sm font-medium">Info Record 5301133479</div>
                              <div className="text-xs text-muted-foreground">Validated pricing source: EUR 61.6/PAK</div>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowSourceDialog(true)}
                          >
                            View
                          </Button>
                        </div>
                        <div className="flex items-center justify-between p-2.5 rounded-md border bg-muted/30">
                          <div className="flex items-center gap-3">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <div>
                              <div className="text-sm font-medium">Historical PO Records</div>
                              <div className="text-xs text-muted-foreground">18 previous orders on file (consistent pattern)</div>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowHistoryDialog(true)}
                          >
                            View
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground">
                        <p>No required attachments for this item.</p>
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              {/* Sticky Action Bar - Re-run Checks CTA */}
              {pr && onRerunChecks && (
                <div className="sticky bottom-0 left-0 right-0 bg-white border-t shadow-lg mt-6 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">
                        {cockpit.failed.length > 0
                          ? `Fix ${cockpit.failed.length} validation ${cockpit.failed.length === 1 ? "issue" : "issues"} and re-run checks`
                          : "All fields valid — ready to re-run checks"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Validation will update the PR phase and clear blockers
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => onTabChange("overview")}
                      >
                        Back to Overview
                      </Button>
                      <Button
                        onClick={handleRerunChecksFromDetails}
                        disabled={cockpit.failed.length > 0}
                        className="min-w-[140px]"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Re-run checks
                      </Button>
                    </div>
                  </div>
                </div>
              )}
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
                        {event.keyDiff && (
                          <p className="text-sm font-medium text-foreground mt-2">{event.keyDiff}</p>
                        )}
                        <div className="flex flex-wrap gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            Who: {event.actor}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            What: {event.action}
                          </Badge>
                          {/* Evidence Links */}
                          {event.evidenceLinks && event.evidenceLinks.length > 0 && (
                            <>
                              {event.evidenceLinks.map((evidence, idx) => (
                                <Badge
                                  key={idx}
                                  variant="secondary"
                                  className="text-xs cursor-pointer hover:bg-secondary/80 transition-colors"
                                  onClick={evidence.onClick}
                                >
                                  <Info className="h-3 w-3 mr-1" />
                                  {evidence.label}
                                </Badge>
                              ))}
                            </>
                          )}
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

      {/* Source of Supply Dialog */}
      <Dialog open={showSourceDialog} onOpenChange={setShowSourceDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{po ? "Pricing Basis" : "Source of Supply"}</DialogTitle>
            <DialogDescription>
              Pricing and vendor information for PL568T
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-medium text-muted-foreground">Info Record</div>
                <div className="text-sm font-semibold mt-1">5301133479</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Price</div>
                <div className="text-sm font-semibold mt-1">EUR 61.6/PAK</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Vendor</div>
                <div className="text-sm font-semibold mt-1">1165336 (AESCULAP)</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Purchasing Group</div>
                <div className="text-sm font-semibold mt-1">7EF</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Material</div>
                <div className="text-sm font-semibold mt-1">PL568T</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Plant</div>
                <div className="text-sm font-semibold mt-1">DE01</div>
              </div>
              <div className="col-span-2">
                <div className="text-sm font-medium text-muted-foreground">Conversion Factor</div>
                <div className="text-sm font-semibold mt-1">120 pieces per PAK</div>
              </div>
            </div>
            <div className="border-t pt-4">
              <div className="text-sm text-muted-foreground">
                This info record has been validated and is the preferred source for this material.
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Historical POs Dialog */}
      <Dialog open={showHistoryDialog} onOpenChange={setShowHistoryDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Historical POs for PL568T</DialogTitle>
            <DialogDescription>
              Last 3 purchase orders for this material (18 POs total on record)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4">
            <div className="border rounded-md p-3 bg-muted/50">
              <div className="flex justify-between items-start mb-2">
                <div className="text-sm font-semibold">PO-4516638098</div>
                <Badge variant="outline" className="text-xs">Closed</Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <div>Date: 2025-11-15</div>
                <div>Qty: 2,288 PAK</div>
                <div>Amount: EUR 140,940.80</div>
                <div>Vendor: AESCULAP</div>
              </div>
            </div>
            <div className="border rounded-md p-3 bg-muted/50">
              <div className="flex justify-between items-start mb-2">
                <div className="text-sm font-semibold">PO-4516637882</div>
                <Badge variant="outline" className="text-xs">Closed</Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <div>Date: 2025-07-22</div>
                <div>Qty: 2,288 PAK</div>
                <div>Amount: EUR 140,940.80</div>
                <div>Vendor: AESCULAP</div>
              </div>
            </div>
            <div className="border rounded-md p-3 bg-muted/50">
              <div className="flex justify-between items-start mb-2">
                <div className="text-sm font-semibold">PO-4516637456</div>
                <Badge variant="outline" className="text-xs">Closed</Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <div>Date: 2025-03-10</div>
                <div>Qty: 2,288 PAK</div>
                <div>Amount: EUR 140,940.80</div>
                <div>Vendor: AESCULAP</div>
              </div>
            </div>
            <div className="border-t pt-3">
              <div className="text-xs text-muted-foreground">
                Consistent ordering pattern: Fixed lot size (2,288 PAK) approximately every 120 days.
                Stable supplier relationship with AESCULAP since 2020.
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
