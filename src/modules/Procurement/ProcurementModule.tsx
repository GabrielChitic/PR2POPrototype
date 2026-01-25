import { useState } from "react";
import { MessageCircle, Settings2, Filter, X, AlertCircle, User, MessageSquare, MoreVertical, CheckCircle } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Badge } from "../../components/ui/badge";
import { ScrollArea } from "../../components/ui/scroll-area";
import { cn } from "../../lib/utils";
import {
  ALL_DEMO_PRS,
  ALL_DEMO_POS,
  type ProcurementPR,
  type ProcurementPO,
  type AuditEvent,
  getPRSlaStatus,
  getPOSlaStatus,
  getPRReason,
  getPRNextAction,
  getPOReason,
  getPONextAction,
  evaluatePrReadiness,
  convertBBraunPrToPo,
  resetBBraunPR,
  removeBBraunPO,
  isBBraunDemoInitial,
  getResetStatusMessage,
} from "../../data/allProcurementData";
import { PRPOFullDetail } from "../../components/PRPOFullDetail";
import { isValidCostCenter } from "../../data/costCenterData";
import { useToast } from "../../hooks/use-toast";

type WorkbenchTab = "pr" | "po";
type ViewFilter = "all" | "attention" | "unassigned" | "sla-risk" | "my-queue";

interface QuickFilter {
  id: string;
  label: string;
  active: boolean;
}

export function ProcurementModule() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<WorkbenchTab>("pr");
  const [selectedView, setSelectedView] = useState<ViewFilter>("all");
  const [quickFilters, setQuickFilters] = useState<QuickFilter[]>([
    { id: "breached", label: "Breached", active: false },
    { id: "at-risk", label: "At risk", active: false },
    { id: "on-hold", label: "On hold", active: false },
    { id: "exceptions", label: "Exceptions", active: false },
    { id: "high-value", label: "High value", active: false },
  ]);
  const [showAssistant, setShowAssistant] = useState(false);
  // Step 7: Assistant messages state
  const [assistantMessages, setAssistantMessages] = useState<Array<{
    id: string;
    role: "user" | "assistant";
    content: string;
    actions?: Array<{ label: string; onClick: () => void }>;
  }>>([]);
  const [assistantInput, setAssistantInput] = useState("");
  const [showDetailPanel, setShowDetailPanel] = useState(false);
  const [selectedPR, setSelectedPR] = useState<ProcurementPR | null>(null);
  const [selectedPO, setSelectedPO] = useState<ProcurementPO | null>(null);
  const [detailTab, setDetailTab] = useState<"overview" | "details" | "audit">("overview");
  const [requestInfoDialogOpen, setRequestInfoDialogOpen] = useState(false);

  // Full detail screen state
  const [showFullDetail, setShowFullDetail] = useState(false);
  const [fullDetailPR, setFullDetailPR] = useState<ProcurementPR | null>(null);
  const [fullDetailPO, setFullDetailPO] = useState<ProcurementPO | null>(null);
  const [fullDetailTab, setFullDetailTab] = useState<"overview" | "details" | "audit" | "collaboration">("overview");

  // Demo data state (mutable for assign actions)
  const [prs, setPrs] = useState<ProcurementPR[]>(ALL_DEMO_PRS);
  const [pos, setPos] = useState<ProcurementPO[]>(ALL_DEMO_POS);

  const toggleQuickFilter = (id: string) => {
    setQuickFilters((prev) =>
      prev.map((filter) =>
        filter.id === id ? { ...filter, active: !filter.active } : filter
      )
    );
  };

  // Filter PRs based on view and quick filters
  const filterPRs = (): ProcurementPR[] => {
    let filtered = [...prs];

    // Apply view filter first
    switch (selectedView) {
      case "attention":
        filtered = filtered.filter(
          (pr) => pr.topBlocker || pr.exception || pr.hold || pr.slaBreached
        );
        break;
      case "unassigned":
        filtered = filtered.filter((pr) => pr.unassigned);
        break;
      case "sla-risk":
        filtered = filtered.filter((pr) => pr.slaBreached);
        break;
      case "my-queue":
        // Fixed demo user/queue
        filtered = filtered.filter(
          (pr) => pr.assigneeOrQueue === "Emily Rodriguez" || pr.assigneeOrQueue === "IT Procurement Queue"
        );
        break;
      case "all":
      default:
        // Show all
        break;
    }

    // Apply quick filters (AND logic)
    const activeFilters = quickFilters.filter((f) => f.active);
    activeFilters.forEach((filter) => {
      switch (filter.id) {
        case "breached":
          filtered = filtered.filter((pr) => pr.slaBreached);
          break;
        case "at-risk":
          filtered = filtered.filter((pr) => getPRSlaStatus(pr) === "At risk");
          break;
        case "on-hold":
          filtered = filtered.filter((pr) => pr.hold);
          break;
        case "exceptions":
          filtered = filtered.filter((pr) => pr.exception || pr.topBlocker);
          break;
        case "high-value":
          filtered = filtered.filter((pr) => pr.highValue);
          break;
      }
    });

    return filtered;
  };

  // Filter POs based on view and quick filters
  const filterPOs = (): ProcurementPO[] => {
    let filtered = [...pos];

    // Apply view filter first
    switch (selectedView) {
      case "attention":
        filtered = filtered.filter(
          (po) => po.failureReason || po.exception || po.dispatchFailed || po.slaBreached
        );
        break;
      case "unassigned":
        filtered = filtered.filter((po) => po.unassigned);
        break;
      case "sla-risk":
        filtered = filtered.filter((po) => po.slaBreached);
        break;
      case "my-queue":
        // Fixed demo user/queue
        filtered = filtered.filter(
          (po) => po.assigneeOrResolverGroup === "Emily Rodriguez" || po.assigneeOrResolverGroup === "IT Procurement Queue"
        );
        break;
      case "all":
      default:
        // Show all
        break;
    }

    // Apply quick filters (AND logic)
    const activeFilters = quickFilters.filter((f) => f.active);
    activeFilters.forEach((filter) => {
      switch (filter.id) {
        case "breached":
          filtered = filtered.filter((po) => po.slaBreached);
          break;
        case "at-risk":
          filtered = filtered.filter((po) => getPOSlaStatus(po) === "At risk");
          break;
        case "on-hold":
          filtered = filtered.filter((po) => po.hold);
          break;
        case "exceptions":
          filtered = filtered.filter((po) => po.exception || po.failureReason);
          break;
        case "high-value":
          filtered = filtered.filter((po) => po.highValue);
          break;
      }
    });

    return filtered;
  };

  // Row action handlers
  // Step 6: Row click = full detail screen (like Open button)
  const handleRowClickPR = (pr: ProcurementPR) => {
    handleOpenPR(pr);
  };

  const handleRowClickPO = (po: ProcurementPO) => {
    handleOpenPO(po);
  };

  // Open button = full detail screen
  const handleOpenPR = (pr: ProcurementPR) => {
    setFullDetailPR(pr);
    setFullDetailPO(null);
    setFullDetailTab("overview");
    setShowFullDetail(true);
  };

  const handleOpenPO = (po: ProcurementPO) => {
    setFullDetailPO(po);
    setFullDetailPR(null);
    setFullDetailTab("overview");
    setShowFullDetail(true);
  };

  // Back to workbench
  const handleBackToWorkbench = () => {
    setShowFullDetail(false);
    setFullDetailPR(null);
    setFullDetailPO(null);
  };

  // Navigate between linked PR ↔ PO
  const handleNavigateToLinkedObject = (type: 'PR' | 'PO', number: string) => {
    if (type === 'PR') {
      const linkedPr = prs.find(p => p.prNumber === number);
      if (linkedPr) {
        setFullDetailPR(linkedPr);
        setFullDetailPO(null);
        setFullDetailTab("overview");
        // showFullDetail remains true
      } else {
        toast({
          title: "PR Not Found",
          description: `Could not find PR ${number}`,
          variant: "destructive"
        });
      }
    } else if (type === 'PO') {
      const linkedPo = pos.find(p => p.poNumber === number);
      if (linkedPo) {
        setFullDetailPO(linkedPo);
        setFullDetailPR(null);
        setFullDetailTab("overview");
        // showFullDetail remains true
      } else {
        toast({
          title: "PO Not Found",
          description: `Could not find PO ${number}`,
          variant: "destructive"
        });
      }
    }
  };

  const handleAssignPR = (prId: string, assignee: string) => {
    setPrs((prev) =>
      prev.map((pr) =>
        pr.id === prId
          ? { ...pr, assigneeOrQueue: assignee, unassigned: assignee === "Unassigned" }
          : pr
      )
    );
    // Update selected PR if it's the one being modified
    if (selectedPR && selectedPR.id === prId) {
      setSelectedPR((prev) =>
        prev ? { ...prev, assigneeOrQueue: assignee, unassigned: assignee === "Unassigned" } : null
      );
    }
  };

  const handleAssignPO = (poId: string, assignee: string) => {
    setPos((prev) =>
      prev.map((po) =>
        po.id === poId
          ? { ...po, assigneeOrResolverGroup: assignee, unassigned: assignee === "Unassigned" }
          : po
      )
    );
    // Update selected PO if it's the one being modified
    if (selectedPO && selectedPO.id === poId) {
      setSelectedPO((prev) =>
        prev ? { ...prev, assigneeOrResolverGroup: assignee, unassigned: assignee === "Unassigned" } : null
      );
    }
  };

  const handleRequestInfo = () => {
    setRequestInfoDialogOpen(true);
  };

  // Handle PR updates (e.g., cost center change)
  const handleUpdatePR = (updatedPR: ProcurementPR) => {
    setPrs((prev) =>
      prev.map((pr) => (pr.id === updatedPR.id ? updatedPR : pr))
    );
    // Also update the full detail state
    if (fullDetailPR && fullDetailPR.id === updatedPR.id) {
      setFullDetailPR(updatedPR);
    }
  };

  // Re-run checks and update PR state
  const handleRerunChecks = (prId: string) => {
    const pr = prs.find((p) => p.id === prId);
    if (!pr) return;

    // Validate all checks
    const allChecksPassed = validatePR(pr);

    const oldCostCenter = pr.costCenter;
    const oldPhase = pr.phaseStep;
    const oldBlocker = pr.topBlocker;

    let updatedPR = { ...pr };

    if (allChecksPassed) {
      // Clear blocker
      updatedPR.topBlocker = null;
      updatedPR.exception = false;

      // Progress phase
      if (pr.phaseStep === "Gatekeep") {
        updatedPR.phaseStep = "Ready for PO";
      }

      // Add audit events
      const newAuditEvents: AuditEvent[] = [
        {
          id: `audit-rerun-${Date.now()}`,
          timestamp: new Date(),
          action: "Checks re-run",
          actor: "System",
          details: "All validation checks passed",
        },
      ];

      if (oldCostCenter !== pr.costCenter) {
        newAuditEvents.unshift({
          id: `audit-cc-${Date.now()}`,
          timestamp: new Date(),
          action: "Cost center updated",
          actor: "Emily Rodriguez",
          details: `Cost center changed from ${oldCostCenter} to ${pr.costCenter}`,
        });
      }

      if (oldPhase === "Gatekeep" && updatedPR.phaseStep !== "Gatekeep") {
        newAuditEvents.push({
          id: `audit-phase-${Date.now()}`,
          timestamp: new Date(),
          action: "Passed gatekeep",
          actor: "System",
          details: "PR passed all gatekeep validations",
        });
        newAuditEvents.push({
          id: `audit-phase-progress-${Date.now()}`,
          timestamp: new Date(),
          action: `Phase changed: ${oldPhase} → ${updatedPR.phaseStep}`,
          actor: "System",
          details: "PR advanced to next phase",
        });
      }

      if (oldBlocker) {
        newAuditEvents.push({
          id: `audit-blocker-${Date.now()}`,
          timestamp: new Date(),
          action: "Blocker cleared",
          actor: "System",
          details: `Resolved: ${oldBlocker}`,
        });
      }

      updatedPR.auditTrail = [...updatedPR.auditTrail, ...newAuditEvents];
    } else {
      // Still has failures
      updatedPR.auditTrail = [
        ...updatedPR.auditTrail,
        {
          id: `audit-rerun-fail-${Date.now()}`,
          timestamp: new Date(),
          action: "Checks re-run — failures remain",
          actor: "System",
          details: `Validation failures still present: ${updatedPR.topBlocker}`,
        },
      ];
    }

    // Update PR in state
    setPrs((prev) =>
      prev.map((p) => (p.id === prId ? updatedPR : p))
    );

    // Update full detail state
    if (fullDetailPR && fullDetailPR.id === prId) {
      setFullDetailPR(updatedPR);
    }
  };

  // Validate all PR checks
  const validatePR = (pr: ProcurementPR): boolean => {
    // Check all required fields
    const hasDeliveryLocation = !!(pr.deliveryLocation && pr.deliveryLocation.trim() !== "");
    const hasNeedByDate = !!(pr.needByDate && pr.needByDate.trim() !== "");
    const hasLineItems = !!(pr.lineItems && pr.lineItems.length > 0 && pr.lineItems[0].quantity > 0);
    const hasCostCenter = !!(pr.costCenter && isValidCostCenter(pr.costCenter, pr.entityCode));
    const hasGLAccount = !!(pr.glAccount && pr.glAccount.trim() !== "");
    const hasCommodityGroup = !!(pr.commodityGroup && pr.commodityGroup.trim() !== "");

    return (
      hasDeliveryLocation &&
      hasNeedByDate &&
      hasLineItems &&
      hasCostCenter &&
      hasGLAccount &&
      hasCommodityGroup
    );
  };

  // Convert PR to PO
  const handleConvertToPO = (prId: string) => {
    const pr = prs.find((p) => p.id === prId);
    if (!pr) return;

    // Check readiness for BBraun PR
    if (pr.prNumber === "PR-4546245893") {
      const readiness = evaluatePrReadiness(pr);

      if (!readiness.isReadyForPo) {
        toast({
          title: "Cannot Convert to PO",
          description: `PR is not ready: ${readiness.topBlocker}`,
          variant: "destructive"
        });
        return;
      }

      // Use conversion mapper for BBraun PR
      const conversionResult = convertBBraunPrToPo(pr);
      const { po: newPO, auditEvents } = conversionResult;

      // Update PR to Handoff state with linkage
      const updatedPR: ProcurementPR = {
        ...pr,
        phaseStep: "Handoff to PO",
        linkedPoNumber: "PO-4516638113",
        auditTrail: [
          ...pr.auditTrail,
          ...auditEvents
        ],
      };

      // Add PO to state (prevents duplicate by checking if already exists)
      setPos((prev) => {
        const exists = prev.some(p => p.poNumber === "PO-4516638113");
        if (exists) {
          return prev; // Don't add duplicate
        }
        return [...prev, newPO];
      });

      // Update PR in state
      setPrs((prev) => prev.map((p) => (p.id === prId ? updatedPR : p)));

      // Update detail views
      if (fullDetailPR && fullDetailPR.id === prId) {
        setFullDetailPR(updatedPR);
      }

      // Show toast
      toast({
        title: "PO Created Successfully",
        description: "PO-4516638113 has been created and is ready for dispatch. Check the PO workbench.",
      });

      return;
    }

    // Generate new PO number
    const newPoNumber = `PO-${Math.floor(1000 + Math.random() * 9000)}`;
    const newPoId = `po-${Date.now()}`;

    // Create new PO object with data copied from PR
    const newPO: ProcurementPO = {
      id: newPoId,
      poNumber: newPoNumber,
      supplier: "Dell Direct", // Default supplier for catalog items
      phaseStep: "Create/Post",
      failureReason: null,
      age: "0m",
      slaBreached: false,
      amount: pr.amount,
      currency: pr.currency,
      assigneeOrResolverGroup: "Unassigned",
      unassigned: true,
      exception: false,
      hold: false,
      highValue: pr.highValue,
      dispatchFailed: false,
      createdAt: new Date(),
      // Link to source PR
      sourcePrNumber: pr.prNumber,
      // Copy data from PR
      entityCode: pr.entityCode,
      deliveryLocation: pr.deliveryLocation,
      needByDate: pr.needByDate,
      costCenter: pr.costCenter,
      glAccount: pr.glAccount,
      commodityGroup: pr.commodityGroup,
      lineItems: pr.lineItems,
      dispatchMethod: "Email/Network",
      dispatchStatus: "Ready to send",
      auditTrail: [
        {
          id: `audit-po-create-${Date.now()}`,
          timestamp: new Date(),
          action: "PO Created",
          actor: "System",
          details: `Created from ${pr.prNumber}`,
        },
      ],
    };

    // Run PO gate validation
    const gateChecksPassed = validatePOGate(newPO);

    if (gateChecksPassed) {
      // Gate passed - move to Dispatch
      newPO.phaseStep = "Dispatch";
      newPO.auditTrail.push({
        id: `audit-po-posted-${Date.now()}`,
        timestamp: new Date(),
        action: "Posted successfully",
        actor: "System",
        details: "All gate checks passed",
      });
      newPO.auditTrail.push({
        id: `audit-po-dispatch-${Date.now()}`,
        timestamp: new Date(),
        action: "Ready to dispatch",
        actor: "System",
        details: "PO ready to be sent to supplier",
      });
    } else {
      // Gate failed - stays in Create/Post
      newPO.failureReason = "Posting failed: validation gate check failed";
      newPO.exception = true;
      newPO.auditTrail.push({
        id: `audit-po-failed-${Date.now()}`,
        timestamp: new Date(),
        action: "Posting failed",
        actor: "System",
        details: "Gate validation check failed",
      });
    }

    // Update PR with link to PO and progress phase
    const updatedPR: ProcurementPR = {
      ...pr,
      linkedPoNumber: newPoNumber,
      phaseStep: "Converted",
      auditTrail: [
        ...pr.auditTrail,
        {
          id: `audit-pr-convert-${Date.now()}`,
          timestamp: new Date(),
          action: "Converted to PO",
          actor: "System",
          details: `${newPoNumber} created`,
        },
        {
          id: `audit-pr-handoff-${Date.now()}`,
          timestamp: new Date(),
          action: "Handoff to PO",
          actor: "System",
          details: "PR processing complete, now tracking via PO",
        },
      ],
    };

    // Update state
    setPrs((prev) => prev.map((p) => (p.id === prId ? updatedPR : p)));
    setPos((prev) => [...prev, newPO]);

    // Update full detail if currently viewing this PR
    if (fullDetailPR && fullDetailPR.id === prId) {
      setFullDetailPR(updatedPR);
    }

    // Switch to PO workbench to show the new PO
    setActiveTab("po");
  };

  // Validate PO pre-post gate
  const validatePOGate = (po: ProcurementPO): boolean => {
    const hasSupplier = !!(po.supplier && po.supplier.trim() !== "");
    const hasLines = !!(po.lineItems && po.lineItems.length > 0 && po.lineItems[0].quantity > 0);
    const hasDeliveryLocation = !!(po.deliveryLocation && po.deliveryLocation.trim() !== "");
    const hasCoding = !!(po.costCenter && po.glAccount && po.commodityGroup);
    const amountValid = po.amount > 0;

    return hasSupplier && hasLines && hasDeliveryLocation && hasCoding && amountValid;
  };

  // Retry posting for failed POs
  const handleRetryPosting = (poId: string) => {
    const po = pos.find((p) => p.id === poId);
    if (!po || !po.failureReason) return;

    // Simulate retry
    const retrySucceeded = true; // For demo, always succeed on retry

    const updatedPO: ProcurementPO = { ...po };

    if (retrySucceeded) {
      // Clear failure and move to Dispatch
      updatedPO.failureReason = null;
      updatedPO.exception = false;
      updatedPO.phaseStep = "Dispatch";
      updatedPO.auditTrail = [
        ...updatedPO.auditTrail,
        {
          id: `audit-po-retry-${Date.now()}`,
          timestamp: new Date(),
          action: "Retry posting succeeded",
          actor: "Emily Rodriguez",
          details: "Manual retry cleared the blocker",
        },
        {
          id: `audit-po-dispatch-retry-${Date.now()}`,
          timestamp: new Date(),
          action: "Ready to dispatch",
          actor: "System",
          details: "PO posted successfully on retry",
        },
      ];
    } else {
      // Retry failed (not used in demo but included for completeness)
      updatedPO.auditTrail = [
        ...updatedPO.auditTrail,
        {
          id: `audit-po-retry-fail-${Date.now()}`,
          timestamp: new Date(),
          action: "Retry posting failed",
          actor: "Emily Rodriguez",
          details: "Retry attempted but same error occurred",
        },
      ];
    }

    // Update state
    setPos((prev) => prev.map((p) => (p.id === poId ? updatedPO : p)));

    // Update full detail if currently viewing this PO
    if (fullDetailPO && fullDetailPO.id === poId) {
      setFullDetailPO(updatedPO);
    }
  };

  // Dispatch PO
  const handleDispatchPO = (poId: string) => {
    const po = pos.find((p) => p.id === poId);
    if (!po) return;

    // Safety check: prevent duplicate dispatch
    if (po.dispatchStatus !== "Ready to send") {
      toast({
        title: "Cannot Dispatch PO",
        description: po.dispatchStatus === "Sent"
          ? "PO has already been dispatched to supplier"
          : "PO is not ready for dispatch",
        variant: "destructive"
      });
      return;
    }

    const now = new Date();

    // BBraun Step 4 + 5: Dispatch to Sent, then show confirmation
    if (po.poNumber === "PO-4516638113") {
      const updatedPO: ProcurementPO = {
        ...po,
        phaseStep: "Dispatch",
        dispatchStatus: "Sent",
        dispatchAttemptCount: 1,
        dispatchLastAttemptAt: now,
        // Step 5: Add confirmation status (simulated instant confirmation for demo)
        confirmationStatus: "RECEIVED",
        confirmedDeliveryDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 120 days
        confirmedQuantityDelta: 0,
        confirmationNote: "Supplier confirmed order as requested. No deviations.",
        auditTrail: [
          ...po.auditTrail,
          {
            id: `audit-bbraun-dispatch-${Date.now()}`,
            timestamp: now,
            action: "Dispatch triggered (demo)",
            actor: "Emily Rodriguez",
            details: "User initiated PO dispatch to supplier",
          },
          {
            id: `audit-bbraun-dispatch-${Date.now() + 1}`,
            timestamp: new Date(now.getTime() + 1000),
            action: "PO sent to supplier (demo channel)",
            actor: "System",
            details: "PO transmitted to AESCULAP via EDI/IDOC (demo simulation)",
            keyDiff: "Dispatch method: EDI/IDOC, Supplier: 1165336 (AESCULAP)"
          },
          {
            id: `audit-bbraun-dispatch-${Date.now() + 2}`,
            timestamp: new Date(now.getTime() + 2000),
            action: "Awaiting supplier confirmation",
            actor: "System",
            details: "PO successfully dispatched, waiting for supplier acknowledgment",
          },
          {
            id: `audit-bbraun-ekes-${Date.now() + 3}`,
            timestamp: new Date(now.getTime() + 2 * 60 * 60 * 1000), // 2 hours later (simulated)
            action: "Supplier confirmation received (EKES)",
            actor: "System",
            details: "Confirmation type AB (Acknowledgment) received from AESCULAP",
            keyDiff: "Confirmed qty: 2,288 PAK · Confirmed delivery: 120 days · Status: Confirmed",
            evidenceLinks: [
              {
                type: 'ekes-confirmation',
                label: 'EKES Confirmation AB',
                reference: 'ekes-bbraun-001'
              }
            ]
          },
          {
            id: `audit-bbraun-validation-${Date.now() + 4}`,
            timestamp: new Date(now.getTime() + 2 * 60 * 60 * 1000 + 1000),
            action: "Confirmation validated",
            actor: "System",
            details: "Delta check passed: Qty matches, date within policy tolerance",
            keyDiff: "No deviations detected"
          },
        ],
      };

      setPos((prev) => prev.map((p) => (p.id === poId ? updatedPO : p)));

      if (fullDetailPO && fullDetailPO.id === poId) {
        setFullDetailPO(updatedPO);
      }

      toast({
        title: "PO Dispatched & Confirmed",
        description: "PO-4516638113 has been sent to AESCULAP. Supplier confirmation received.",
      });

      return;
    }

    // Generic dispatch for other POs - advance to Confirm phase
    const updatedPO: ProcurementPO = {
      ...po,
      dispatchStatus: "Sent",
      dispatchAttemptCount: (po.dispatchAttemptCount || 0) + 1,
      dispatchLastAttemptAt: new Date(),
      phaseStep: "Confirm",
      confirmationStatus: "RECEIVED", // For happy path demo, auto-receive
      confirmedDeliveryDate: po.needByDate, // Matches request
      confirmedQuantityDelta: 0,
      confirmationNote: "Supplier confirmed order as requested",
      closeStatus: "OPEN",
      auditTrail: [
        ...po.auditTrail,
        {
          id: `audit-po-sent-${Date.now()}`,
          timestamp: new Date(),
          action: "PO dispatched",
          actor: "System",
          details: "Dispatch message sent to supplier",
        },
        {
          id: `audit-po-confirm-received-${Date.now()}`,
          timestamp: new Date(),
          action: "Confirmation received",
          actor: "System",
          details: "Supplier confirmed order with no deviations",
        },
      ],
    };

    // Update state
    setPos((prev) => prev.map((p) => (p.id === poId ? updatedPO : p)));

    // Update full detail if currently viewing this PO
    if (fullDetailPO && fullDetailPO.id === poId) {
      setFullDetailPO(updatedPO);
    }
  };

  // Step 5: Simulate confirmation (for WAITING status)
  const handleSimulateConfirmation = (poId: string, deviation: boolean = false) => {
    const po = pos.find((p) => p.id === poId);
    if (!po || po.confirmationStatus !== "WAITING") return;

    const updatedPO: ProcurementPO = {
      ...po,
      confirmationStatus: deviation ? "DEVIATION" : "RECEIVED",
      confirmedDeliveryDate: deviation
        ? new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // +5 days
        : po.needByDate,
      confirmedQuantityDelta: 0,
      confirmationNote: deviation
        ? "Supplier confirmed later delivery date due to stock availability"
        : "Supplier confirmed order as requested",
      proposedChanges: deviation
        ? {
            deliveryDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          }
        : undefined,
      changeStatus: deviation ? "PENDING" : "NONE",
      auditTrail: [
        ...po.auditTrail,
        {
          id: `audit-po-confirm-${Date.now()}`,
          timestamp: new Date(),
          action: deviation ? "Deviation detected" : "Confirmation received",
          actor: "System",
          details: deviation
            ? "Supplier proposed delivery date change"
            : "Supplier confirmed order with no deviations",
        },
      ],
    };

    setPos((prev) => prev.map((p) => (p.id === poId ? updatedPO : p)));
    if (fullDetailPO && fullDetailPO.id === poId) {
      setFullDetailPO(updatedPO);
    }
  };

  // Step 5: Continue to Close (from Confirm RECEIVED)
  const handleContinueToClose = (poId: string) => {
    const po = pos.find((p) => p.id === poId);
    if (!po || po.confirmationStatus !== "RECEIVED") return;

    const updatedPO: ProcurementPO = {
      ...po,
      phaseStep: "Close",
      closeStatus: "CLOSED_DEMO",
      closedAt: new Date(),
      auditTrail: [
        ...po.auditTrail,
        {
          id: `audit-po-close-${Date.now()}`,
          timestamp: new Date(),
          action: "Closed (demo)",
          actor: "Emily Rodriguez",
          details: "PO lifecycle completed successfully",
        },
      ],
    };

    setPos((prev) => prev.map((p) => (p.id === poId ? updatedPO : p)));
    if (fullDetailPO && fullDetailPO.id === poId) {
      setFullDetailPO(updatedPO);
    }
  };

  // Step 5: Review change (from Confirm DEVIATION to Change phase)
  const handleReviewChange = (poId: string) => {
    const po = pos.find((p) => p.id === poId);
    if (!po || po.confirmationStatus !== "DEVIATION") return;

    const updatedPO: ProcurementPO = {
      ...po,
      phaseStep: "Change",
      auditTrail: [
        ...po.auditTrail,
        {
          id: `audit-po-review-change-${Date.now()}`,
          timestamp: new Date(),
          action: "Change under review",
          actor: "Emily Rodriguez",
          details: "Reviewing supplier proposed changes",
        },
      ],
    };

    setPos((prev) => prev.map((p) => (p.id === poId ? updatedPO : p)));
    if (fullDetailPO && fullDetailPO.id === poId) {
      setFullDetailPO(updatedPO);
    }
  };

  // Step 5: Accept change (from Change phase)
  const handleAcceptChange = (poId: string) => {
    const po = pos.find((p) => p.id === poId);
    if (!po || po.changeStatus !== "PENDING") return;

    const updatedPO: ProcurementPO = {
      ...po,
      changeStatus: "ACCEPTED",
      changeDecisionAt: new Date(),
      // Apply proposed changes
      needByDate: po.proposedChanges?.deliveryDate || po.needByDate,
      phaseStep: "Close",
      closeStatus: "CLOSED_DEMO",
      closedAt: new Date(),
      auditTrail: [
        ...po.auditTrail,
        {
          id: `audit-po-accept-change-${Date.now()}`,
          timestamp: new Date(),
          action: "Change accepted",
          actor: "Emily Rodriguez",
          details: "Supplier proposed changes approved and applied",
        },
        {
          id: `audit-po-close-after-change-${Date.now()}`,
          timestamp: new Date(),
          action: "Closed (demo)",
          actor: "Emily Rodriguez",
          details: "PO lifecycle completed with accepted changes",
        },
      ],
    };

    setPos((prev) => prev.map((p) => (p.id === poId ? updatedPO : p)));
    if (fullDetailPO && fullDetailPO.id === poId) {
      setFullDetailPO(updatedPO);
    }
  };

  // Step 5: Reject change (from Change phase)
  const handleRejectChange = (poId: string) => {
    const po = pos.find((p) => p.id === poId);
    if (!po || po.changeStatus !== "PENDING") return;

    const updatedPO: ProcurementPO = {
      ...po,
      changeStatus: "REJECTED",
      changeDecisionAt: new Date(),
      phaseStep: "Close",
      closeStatus: "CLOSED_DEMO",
      closedAt: new Date(),
      auditTrail: [
        ...po.auditTrail,
        {
          id: `audit-po-reject-change-${Date.now()}`,
          timestamp: new Date(),
          action: "Change rejected",
          actor: "Emily Rodriguez",
          details: "Supplier proposed changes declined",
        },
        {
          id: `audit-po-close-after-reject-${Date.now()}`,
          timestamp: new Date(),
          action: "Closed (demo)",
          actor: "Emily Rodriguez",
          details: "PO lifecycle completed with rejected changes",
        },
      ],
    };

    setPos((prev) => prev.map((p) => (p.id === poId ? updatedPO : p)));
    if (fullDetailPO && fullDetailPO.id === poId) {
      setFullDetailPO(updatedPO);
    }
  };

  // Step 5: Explicit close action (optional)
  const handleCloseDemo = (poId: string) => {
    const po = pos.find((p) => p.id === poId);
    if (!po || po.closeStatus === "CLOSED_DEMO") return;

    const updatedPO: ProcurementPO = {
      ...po,
      phaseStep: "Close",
      closeStatus: "CLOSED_DEMO",
      closedAt: new Date(),
      auditTrail: [
        ...po.auditTrail,
        {
          id: `audit-po-close-explicit-${Date.now()}`,
          timestamp: new Date(),
          action: "Closed (demo)",
          actor: "Emily Rodriguez",
          details: "PO manually closed",
        },
      ],
    };

    setPos((prev) => prev.map((p) => (p.id === poId ? updatedPO : p)));
    if (fullDetailPO && fullDetailPO.id === poId) {
      setFullDetailPO(updatedPO);
    }
  };

  // Reset BBraun demo state
  const handleResetBBraunDemo = () => {
    const bbraunPr = prs.find(p => p.prNumber === "PR-4546245893");

    if (!bbraunPr) {
      toast({
        title: "BBraun PR not found",
        description: "Cannot reset demo state",
        variant: "destructive"
      });
      return;
    }

    // Reset PR to initial state
    const resetPr = resetBBraunPR(bbraunPr);
    setPrs((prev) => prev.map((p) => p.prNumber === "PR-4546245893" ? resetPr : p));

    // Remove PO from list
    setPos((prev) => removeBBraunPO(prev));

    // Clear detail views if showing BBraun items
    if (fullDetailPR && fullDetailPR.prNumber === "PR-4546245893") {
      setFullDetailPR(resetPr);
    }
    if (fullDetailPO && fullDetailPO.poNumber === "PO-4516638113") {
      setFullDetailPO(null);
      setShowFullDetail(false);
    }

    toast({
      title: "BBraun Demo Reset",
      description: "PR-4546245893 returned to 'Ready for PO' state, PO removed",
    });
  };

  // Step 7: Assistant command handler
  const handleAssistantCommand = (userInput: string) => {
    const input = userInput.trim().toLowerCase();
    const userMessageId = `user-${Date.now()}`;
    const assistantMessageId = `assistant-${Date.now()}`;

    // Add user message
    setAssistantMessages((prev) => [
      ...prev,
      { id: userMessageId, role: "user", content: userInput },
    ]);

    // Parse and execute command
    if (input.includes("what needs attention") || input === "needs attention") {
      // A1: What needs attention
      setSelectedView("attention");
      const prCount = prs.filter((pr) => pr.exception || pr.hold || pr.topBlocker).length;
      const poCount = pos.filter((po) => po.exception || po.dispatchFailed || po.failureReason).length;

      setAssistantMessages((prev) => [
        ...prev,
        {
          id: assistantMessageId,
          role: "assistant",
          content: `Showing items that need attention.\n\nPRs: ${prCount} · POs: ${poCount}`,
          actions: [
            {
              label: "Open PR Needs Attention",
              onClick: () => {
                setActiveTab("pr");
                setSelectedView("attention");
              },
            },
            {
              label: "Open PO Needs Attention",
              onClick: () => {
                setActiveTab("po");
                setSelectedView("attention");
              },
            },
          ],
        },
      ]);
    } else if (input.includes("sla") && (input.includes("breach") || input.includes("breached"))) {
      // A2: Show SLA-breached items
      const breachedPRs = prs.filter((pr) => getPRSlaStatus(pr) === "Breached");
      const breachedPOs = pos.filter((po) => getPOSlaStatus(po) === "Breached");
      const top3 = [...breachedPRs.map((pr) => pr.prNumber), ...breachedPOs.map((po) => po.poNumber)].slice(0, 3);

      setAssistantMessages((prev) => [
        ...prev,
        {
          id: assistantMessageId,
          role: "assistant",
          content: `Showing SLA-breached items.\n\nFound: ${breachedPRs.length} PRs, ${breachedPOs.length} POs\n\nTop items: ${top3.join(", ") || "None"}`,
        },
      ]);
    } else if (input.includes("dispatch") && input.includes("fail")) {
      // A3: Show dispatch failures
      setActiveTab("po");
      const failedPOs = pos.filter((po) => po.dispatchFailed || po.dispatchStatus === "Failed");
      const top3 = failedPOs.slice(0, 3).map((po) => po.poNumber);

      setAssistantMessages((prev) => [
        ...prev,
        {
          id: assistantMessageId,
          role: "assistant",
          content: `Showing POs with dispatch failures.\n\nFound: ${failedPOs.length} POs\n\nTop items: ${top3.join(", ") || "None"}`,
        },
      ]);
    } else if (input.includes("why") && input.includes("block")) {
      // A4: Why is this blocked (contextual)
      if (fullDetailPR) {
        const blocker = fullDetailPR.topBlocker || "No blocker found";
        setAssistantMessages((prev) => [
          ...prev,
          {
            id: assistantMessageId,
            role: "assistant",
            content: `This PR is blocked because: ${blocker}`,
          },
        ]);
      } else if (fullDetailPO && fullDetailPO.failureReason) {
        setAssistantMessages((prev) => [
          ...prev,
          {
            id: assistantMessageId,
            role: "assistant",
            content: `This PO has a failure: ${fullDetailPO.failureReason}`,
          },
        ]);
      } else {
        setAssistantMessages((prev) => [
          ...prev,
          {
            id: assistantMessageId,
            role: "assistant",
            content: "Open a PR first (e.g., 'Open PR-6729') and I'll explain the blocker.",
          },
        ]);
      }
    } else if (input.match(/open\s+pr[-\s]*(\d+)/)) {
      // B1: Open PR-####
      const match = input.match(/open\s+pr[-\s]*(\d+)/);
      const prNumber = `PR-${match![1]}`;
      const pr = prs.find((p) => p.prNumber === prNumber);

      if (pr) {
        handleOpenPR(pr);
        setAssistantMessages((prev) => [
          ...prev,
          {
            id: assistantMessageId,
            role: "assistant",
            content: `Opened ${prNumber}.\n\nPhase: ${pr.phaseStep}\nBlocker: ${pr.topBlocker || "None"}\nRequester: ${pr.requester}\nAmount: ${pr.currency} ${pr.amount.toLocaleString()}`,
          },
        ]);
      } else {
        const availablePRs = prs.slice(0, 3).map((p) => p.prNumber).join(", ");
        setAssistantMessages((prev) => [
          ...prev,
          {
            id: assistantMessageId,
            role: "assistant",
            content: `I can't find ${prNumber}. Try one of: ${availablePRs}`,
          },
        ]);
      }
    } else if (input.match(/open\s+po[-\s]*(\d+)/)) {
      // B2: Open PO-####
      const match = input.match(/open\s+po[-\s]*(\d+)/);
      const poNumber = `PO-${match![1]}`;
      const po = pos.find((p) => p.poNumber === poNumber);

      if (po) {
        handleOpenPO(po);
        setAssistantMessages((prev) => [
          ...prev,
          {
            id: assistantMessageId,
            role: "assistant",
            content: `Opened ${poNumber}.\n\nPhase: ${po.phaseStep}\nFailure: ${po.failureReason || "None"}\nSupplier: ${po.supplier}\nAmount: ${po.currency} ${po.amount.toLocaleString()}`,
          },
        ]);
      } else {
        const availablePOs = pos.slice(0, 3).map((p) => p.poNumber).join(", ");
        setAssistantMessages((prev) => [
          ...prev,
          {
            id: assistantMessageId,
            role: "assistant",
            content: `I can't find ${poNumber}. Try one of: ${availablePOs}`,
          },
        ]);
      }
    } else {
      // Unknown command
      setAssistantMessages((prev) => [
        ...prev,
        {
          id: assistantMessageId,
          role: "assistant",
          content: "I didn't understand that. Try:\n• What needs attention?\n• Show SLA-breached items\n• Show dispatch failures\n• Open PR-6729\n• Open PO-6656\n• Why is this blocked?",
        },
      ]);
    }

    setAssistantInput("");
  };

  const getEmptyStateText = (workbench: WorkbenchTab, view: ViewFilter) => {
    if (workbench === "pr") {
      if (view === "all") {
        return {
          title: "No requests yet",
          subtitle: "Requests will appear here once ingestion is connected.",
          helper: "Create a request in the Requester module to generate PRs later.",
        };
      } else if (view === "attention") {
        return {
          title: "No PRs need attention",
          subtitle: "When a requisition fails readiness or needs a decision, it will appear here.",
        };
      }
    } else {
      // PO workbench
      if (view === "all") {
        return {
          title: "No orders yet",
          subtitle: "Orders will appear here once PO ingestion is connected.",
        };
      } else if (view === "attention") {
        return {
          title: "No POs need attention",
          subtitle: "Posting and dispatch failures will appear here.",
        };
      }
    }

    // Default fallback
    return {
      title: workbench === "pr" ? "No requests found" : "No orders found",
      subtitle: "Adjust your filters to see different items.",
    };
  };

  // Get filtered data for current tab
  const filteredPRs = filterPRs();
  const filteredPOs = filterPOs();
  const emptyState = getEmptyStateText(activeTab, selectedView);

  // If showing full detail, render that instead of workbench
  if (showFullDetail && (fullDetailPR || fullDetailPO)) {
    return <PRPOFullDetail
      pr={fullDetailPR}
      po={fullDetailPO}
      tab={fullDetailTab}
      onTabChange={setFullDetailTab}
      onBack={handleBackToWorkbench}
      onAssign={(id, assignee) => {
        if (fullDetailPR) handleAssignPR(id, assignee);
        if (fullDetailPO) handleAssignPO(id, assignee);
      }}
      onRequestInfo={handleRequestInfo}
      onUpdatePR={handleUpdatePR}
      onRerunChecks={handleRerunChecks}
      onConvertToPO={handleConvertToPO}
      onRetryPosting={handleRetryPosting}
      onDispatchPO={handleDispatchPO}
      onSimulateConfirmation={handleSimulateConfirmation}
      onContinueToClose={handleContinueToClose}
      onReviewChange={handleReviewChange}
      onAcceptChange={handleAcceptChange}
      onRejectChange={handleRejectChange}
      onCloseDemo={handleCloseDemo}
      onNavigateToLinkedObject={handleNavigateToLinkedObject}
    />;
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-muted/30">
      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden p-4">
        {/* Primary Workspace Card */}
        <Card className="flex-1 flex flex-col shadow-lg border-border/50">
          {/* Header */}
          <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-8 py-6">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Filter className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                    Procurement Console
                  </h1>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Triage requests and orders across systems
                  </p>
                </div>
              </div>

              {/* Demo Controls */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9">
                    <Settings2 className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={handleResetBBraunDemo}>
                    <div className="flex flex-col gap-1">
                      <div className="font-medium">Reset BBraun Demo</div>
                      <div className="text-xs text-muted-foreground">
                        {getResetStatusMessage(
                          prs.find(p => p.prNumber === "PR-4546245893"),
                          pos
                        )}
                      </div>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Tabs */}
          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as WorkbenchTab)}
            className="flex-1 flex flex-col overflow-hidden"
          >
            <div className="border-b bg-background/95 px-8">
              <TabsList className="bg-transparent">
                <TabsTrigger value="pr" className="data-[state=active]:bg-background">
                  Requests
                </TabsTrigger>
                <TabsTrigger value="po" className="data-[state=active]:bg-background">
                  Orders
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Shared Controls Row */}
            <div className="border-b bg-background/95 px-8 py-4 space-y-3">
              {/* Row A: Saved views (left) + Search placeholder (right) */}
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Saved views:</span>
                  <Select value={selectedView} onValueChange={(value: string) => setSelectedView(value as ViewFilter)}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All items</SelectItem>
                      <SelectItem value="attention">Needs attention</SelectItem>
                      <SelectItem value="unassigned">Unassigned</SelectItem>
                      <SelectItem value="sla-risk">SLA risk</SelectItem>
                      <SelectItem value="my-queue">My queue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Row B: Filter chips (left) + Columns (right) */}
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 flex-wrap">
                  {quickFilters.map((filter) => (
                    <Button
                      key={filter.id}
                      variant={filter.active ? "default" : "secondary"}
                      size="sm"
                      className={cn(
                        "gap-1.5",
                        filter.active && "bg-primary text-primary-foreground hover:bg-primary/90"
                      )}
                      onClick={() => toggleQuickFilter(filter.id)}
                    >
                      {filter.label}
                      {filter.active && <X className="h-3 w-3" />}
                    </Button>
                  ))}
                </div>

                <Button variant="outline" size="sm" className="gap-2">
                  <Settings2 className="h-4 w-4" />
                  Columns
                </Button>
              </div>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-hidden">
              <TabsContent value="pr" className="h-full m-0 p-8 overflow-auto">
                <div className="bg-background rounded-lg border shadow-sm">
                  {/* PR Table */}
                  <div className="overflow-auto">
                    <table className="w-full">
                      <thead className="border-b bg-muted/50">
                        <tr>
                          <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground whitespace-nowrap">
                            PR #
                          </th>
                          <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground whitespace-nowrap">
                            Title
                          </th>
                          <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground whitespace-nowrap">
                            Stage
                          </th>
                          <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground whitespace-nowrap">
                            Attention
                          </th>
                          <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground whitespace-nowrap">
                            SLA
                          </th>
                          <th className="text-right px-4 py-3 text-sm font-medium text-muted-foreground whitespace-nowrap">
                            Amount
                          </th>
                          <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground whitespace-nowrap">
                            Owner
                          </th>
                          <th className="text-right px-4 py-3 text-sm font-medium text-muted-foreground whitespace-nowrap w-16">
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredPRs.length === 0 ? (
                          <tr>
                            <td colSpan={8} className="px-4 py-16 text-center">
                              <div className="flex flex-col items-center gap-3 max-w-md mx-auto">
                                <div className="p-4 rounded-full bg-muted/30">
                                  <Filter className="h-8 w-8 text-muted-foreground/50" />
                                </div>
                                <div>
                                  <h3 className="text-lg font-semibold text-foreground mb-1">
                                    {emptyState.title}
                                  </h3>
                                  <p className="text-sm text-muted-foreground">
                                    {emptyState.subtitle}
                                  </p>
                                  {emptyState.helper && (
                                    <p className="text-xs text-muted-foreground mt-2">
                                      {emptyState.helper}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          filteredPRs.map((pr) => (
                            <tr
                              key={pr.id}
                              className={cn(
                                "border-b hover:bg-muted/50 transition-colors cursor-pointer",
                                selectedPR?.id === pr.id && "bg-muted/30"
                              )}
                              onClick={() => handleRowClickPR(pr)}
                            >
                              {/* PR # */}
                              <td className="px-4 py-3.5">
                                <div className="text-sm font-semibold text-foreground leading-tight">
                                  {pr.prNumber}
                                </div>
                                <div className="text-xs text-muted-foreground mt-1 leading-tight">
                                  {pr.entityCode}
                                </div>
                              </td>
                              {/* Title */}
                              <td className="px-4 py-3.5 max-w-xs">
                                <div className="text-sm font-semibold text-foreground leading-tight truncate">
                                  {pr.title}
                                </div>
                                <div className="text-xs text-muted-foreground mt-1 leading-tight">
                                  {pr.requester}
                                </div>
                              </td>
                              {/* Stage */}
                              <td className="px-4 py-3.5">
                                <Badge variant="outline" className="text-xs">
                                  {pr.phaseStep}
                                </Badge>
                              </td>
                              {/* Attention */}
                              <td className="px-4 py-3.5">
                                {getPRReason(pr) ? (
                                  <div>
                                    <Badge
                                      variant={pr.topBlocker ? "destructive" : pr.hold ? "secondary" : "default"}
                                      className="text-xs font-normal"
                                    >
                                      {getPRReason(pr)}
                                    </Badge>
                                    {(pr.topBlocker || pr.hold) && getPRNextAction(pr) && (
                                      <div className="text-xs text-muted-foreground mt-1 leading-tight">
                                        {getPRNextAction(pr)}
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-xs text-muted-foreground">—</span>
                                )}
                              </td>
                              {/* SLA */}
                              <td className="px-4 py-3.5">
                                <div className="flex items-center gap-1.5 text-sm">
                                  <span className="text-foreground">{pr.age}</span>
                                  <span className="text-muted-foreground">·</span>
                                  <span
                                    className={cn(
                                      "text-xs",
                                      getPRSlaStatus(pr) === "Breached" && "text-red-600 font-medium",
                                      getPRSlaStatus(pr) === "At risk" && "text-amber-600 font-medium",
                                      getPRSlaStatus(pr) === "On track" && "text-muted-foreground"
                                    )}
                                  >
                                    {getPRSlaStatus(pr)}
                                  </span>
                                </div>
                              </td>
                              {/* Amount */}
                              <td className="px-4 py-3.5 text-right text-sm font-semibold text-foreground">
                                {pr.currency} {pr.amount.toLocaleString()}
                              </td>
                              {/* Owner */}
                              <td className="px-4 py-3.5">
                                {pr.unassigned ? (
                                  <Badge variant="secondary" className="text-xs font-normal">
                                    Unassigned
                                  </Badge>
                                ) : (
                                  <span className="text-sm text-foreground">{pr.assigneeOrQueue}</span>
                                )}
                              </td>
                              {/* Actions Menu */}
                              <td className="px-4 py-3.5 text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                                    <DropdownMenuItem onClick={() => handleOpenPR(pr)}>
                                      Open
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleAssignPR(pr.id, "Emily Rodriguez")}>
                                      Assign to me
                                    </DropdownMenuItem>
                                    <DropdownMenuItem disabled>
                                      Put on hold
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={handleRequestInfo}>
                                      Add note
                                    </DropdownMenuItem>
                                    <DropdownMenuItem disabled>
                                      View audit trail
                                    </DropdownMenuItem>
                                    {pr.phaseStep === "Ready for PO" && (
                                      <DropdownMenuItem onClick={() => handleConvertToPO(pr.id)}>
                                        Convert to PO
                                      </DropdownMenuItem>
                                    )}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="po" className="h-full m-0 p-8 overflow-auto">
                <div className="bg-background rounded-lg border shadow-sm">
                  {/* PO Table */}
                  <div className="overflow-auto">
                    <table className="w-full">
                      <thead className="border-b bg-muted/50">
                        <tr>
                          <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground whitespace-nowrap">
                            PO #
                          </th>
                          <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground whitespace-nowrap">
                            Supplier
                          </th>
                          <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground whitespace-nowrap">
                            Stage
                          </th>
                          <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground whitespace-nowrap">
                            Attention
                          </th>
                          <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground whitespace-nowrap">
                            SLA
                          </th>
                          <th className="text-right px-4 py-3 text-sm font-medium text-muted-foreground whitespace-nowrap">
                            Amount
                          </th>
                          <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground whitespace-nowrap">
                            Owner
                          </th>
                          <th className="text-right px-4 py-3 text-sm font-medium text-muted-foreground whitespace-nowrap w-16">
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredPOs.length === 0 ? (
                          <tr>
                            <td colSpan={8} className="px-4 py-16 text-center">
                              <div className="flex flex-col items-center gap-3 max-w-md mx-auto">
                                <div className="p-4 rounded-full bg-muted/30">
                                  <Filter className="h-8 w-8 text-muted-foreground/50" />
                                </div>
                                <div>
                                  <h3 className="text-lg font-semibold text-foreground mb-1">
                                    {emptyState.title}
                                  </h3>
                                  <p className="text-sm text-muted-foreground">
                                    {emptyState.subtitle}
                                  </p>
                                  {emptyState.helper && (
                                    <p className="text-xs text-muted-foreground mt-2">
                                      {emptyState.helper}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          filteredPOs.map((po) => (
                            <tr
                              key={po.id}
                              className={cn(
                                "border-b hover:bg-muted/50 transition-colors cursor-pointer",
                                selectedPO?.id === po.id && "bg-muted/30"
                              )}
                              onClick={() => handleRowClickPO(po)}
                            >
                              {/* PO # */}
                              <td className="px-4 py-3.5">
                                <div className="text-sm font-semibold text-foreground leading-tight">
                                  {po.poNumber}
                                </div>
                              </td>
                              {/* Supplier */}
                              <td className="px-4 py-3.5 max-w-xs">
                                <div className="text-sm font-semibold text-foreground leading-tight truncate">
                                  {po.supplier}
                                </div>
                                {po.sourcePrNumber && (
                                  <div className="text-xs text-muted-foreground mt-1 leading-tight">
                                    from {po.sourcePrNumber}
                                  </div>
                                )}
                              </td>
                              {/* Stage */}
                              <td className="px-4 py-3.5">
                                <Badge variant="outline" className="text-xs">
                                  {po.phaseStep}
                                </Badge>
                              </td>
                              {/* Attention */}
                              <td className="px-4 py-3.5">
                                {getPOReason(po) ? (
                                  <div>
                                    <Badge
                                      variant={
                                        po.failureReason || po.dispatchStatus === "Failed"
                                          ? "destructive"
                                          : po.confirmationStatus === "DEVIATION" || po.changeStatus === "PENDING"
                                          ? "secondary"
                                          : "default"
                                      }
                                      className="text-xs font-normal"
                                    >
                                      {getPOReason(po)}
                                    </Badge>
                                    {(po.failureReason || po.dispatchStatus === "Failed" || po.confirmationStatus === "DEVIATION" || po.changeStatus === "PENDING") && getPONextAction(po) && (
                                      <div className="text-xs text-muted-foreground mt-1 leading-tight">
                                        {getPONextAction(po)}
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-xs text-muted-foreground">—</span>
                                )}
                              </td>
                              {/* SLA */}
                              <td className="px-4 py-3.5">
                                <div className="flex items-center gap-1.5 text-sm">
                                  <span className="text-foreground">{po.age}</span>
                                  <span className="text-muted-foreground">·</span>
                                  <span
                                    className={cn(
                                      "text-xs",
                                      getPOSlaStatus(po) === "Breached" && "text-red-600 font-medium",
                                      getPOSlaStatus(po) === "At risk" && "text-amber-600 font-medium",
                                      getPOSlaStatus(po) === "On track" && "text-muted-foreground"
                                    )}
                                  >
                                    {getPOSlaStatus(po)}
                                  </span>
                                </div>
                              </td>
                              {/* Amount */}
                              <td className="px-4 py-3.5 text-right text-sm font-semibold text-foreground">
                                {po.currency} {po.amount.toLocaleString()}
                              </td>
                              {/* Owner */}
                              <td className="px-4 py-3.5">
                                {po.unassigned ? (
                                  <Badge variant="secondary" className="text-xs font-normal">
                                    Unassigned
                                  </Badge>
                                ) : (
                                  <span className="text-sm text-foreground">{po.assigneeOrResolverGroup}</span>
                                )}
                              </td>
                              {/* Actions Menu */}
                              <td className="px-4 py-3.5 text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                                    <DropdownMenuItem onClick={() => handleOpenPO(po)}>
                                      Open
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleAssignPO(po.id, "Emily Rodriguez")}>
                                      Assign to me
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={handleRequestInfo}>
                                      Add note
                                    </DropdownMenuItem>
                                    <DropdownMenuItem disabled>
                                      View audit trail
                                    </DropdownMenuItem>
                                    {po.dispatchStatus === "Ready to send" && (
                                      <DropdownMenuItem onClick={() => handleDispatchPO(po.id)}>
                                        Send PO (demo)
                                      </DropdownMenuItem>
                                    )}
                                    {po.confirmationStatus === "RECEIVED" && (
                                      <DropdownMenuItem disabled>
                                        View confirmation
                                      </DropdownMenuItem>
                                    )}
                                    <DropdownMenuItem disabled>
                                      Create change / Amend
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </Card>

        {/* Detail Panel - Selected Item View */}
        {showDetailPanel && (selectedPR || selectedPO) && (
          <Card className="w-[500px] ml-4 shadow-lg border-border/50 flex flex-col">
            {/* Header Summary */}
            <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-foreground">
                      {selectedPR ? selectedPR.prNumber : selectedPO?.poNumber}
                    </h3>
                    {selectedPR?.slaBreached || selectedPO?.slaBreached ? (
                      <Badge variant="destructive" className="text-xs">
                        SLA Breached
                      </Badge>
                    ) : null}
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {selectedPR?.title || `Supplier: ${selectedPO?.supplier}`}
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Amount:</span>
                      <span className="font-medium">
                        {selectedPR ? `${selectedPR.currency} ${selectedPR.amount.toLocaleString()}` : `${selectedPO?.currency} ${selectedPO?.amount.toLocaleString()}`}
                      </span>
                    </div>
                    {selectedPR && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Entity:</span>
                          <span className="font-medium">{selectedPR.entityCode}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Requester:</span>
                          <span className="font-medium">{selectedPR.requester}</span>
                        </div>
                      </>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Phase/Step:</span>
                      <Badge variant="outline" className="text-xs">
                        {selectedPR ? selectedPR.phaseStep : selectedPO?.phaseStep}
                      </Badge>
                    </div>
                    {(selectedPR?.topBlocker || selectedPO?.failureReason) && (
                      <div className="flex items-start justify-between gap-2 pt-2 border-t">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <AlertCircle className="h-4 w-4 text-orange-600" />
                          Issue:
                        </span>
                        <span className="font-medium text-orange-600 text-right flex-1">
                          {selectedPR?.topBlocker || selectedPO?.failureReason}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Age:</span>
                      <span
                        className={cn(
                          "font-medium",
                          (selectedPR?.slaBreached || selectedPO?.slaBreached) && "text-red-600"
                        )}
                      >
                        {selectedPR ? selectedPR.age : selectedPO?.age}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Assignee:</span>
                      <span className="font-medium">
                        {selectedPR ? selectedPR.assigneeOrQueue : selectedPO?.assigneeOrResolverGroup}
                      </span>
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setShowDetailPanel(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Tabs */}
            <Tabs value={detailTab} onValueChange={(value: string) => setDetailTab(value as "overview" | "details" | "audit")} className="flex-1 flex flex-col">
              <div className="border-b bg-background/95 px-6">
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
                </TabsList>
              </div>

              <ScrollArea className="flex-1">
                <TabsContent value="overview" className="p-6 space-y-4 m-0">
                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-3">Key Fields</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between py-1">
                        <span className="text-muted-foreground">ID:</span>
                        <span className="font-mono text-xs">{selectedPR?.id || selectedPO?.id}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-muted-foreground">Created:</span>
                        <span className="text-xs">
                          {selectedPR?.createdAt.toLocaleString() || selectedPO?.createdAt.toLocaleString()}
                        </span>
                      </div>
                      {selectedPR && (
                        <>
                          <div className="flex justify-between py-1">
                            <span className="text-muted-foreground">Unassigned:</span>
                            <Badge variant={selectedPR.unassigned ? "secondary" : "outline"} className="text-xs">
                              {selectedPR.unassigned ? "Yes" : "No"}
                            </Badge>
                          </div>
                          <div className="flex justify-between py-1">
                            <span className="text-muted-foreground">Exception:</span>
                            <Badge variant={selectedPR.exception ? "destructive" : "outline"} className="text-xs">
                              {selectedPR.exception ? "Yes" : "No"}
                            </Badge>
                          </div>
                          <div className="flex justify-between py-1">
                            <span className="text-muted-foreground">Hold:</span>
                            <Badge variant={selectedPR.hold ? "secondary" : "outline"} className="text-xs">
                              {selectedPR.hold ? "Yes" : "No"}
                            </Badge>
                          </div>
                          <div className="flex justify-between py-1">
                            <span className="text-muted-foreground">High Value:</span>
                            <Badge variant={selectedPR.highValue ? "default" : "outline"} className="text-xs">
                              {selectedPR.highValue ? "Yes" : "No"}
                            </Badge>
                          </div>
                        </>
                      )}
                      {selectedPO && (
                        <>
                          <div className="flex justify-between py-1">
                            <span className="text-muted-foreground">Unassigned:</span>
                            <Badge variant={selectedPO.unassigned ? "secondary" : "outline"} className="text-xs">
                              {selectedPO.unassigned ? "Yes" : "No"}
                            </Badge>
                          </div>
                          <div className="flex justify-between py-1">
                            <span className="text-muted-foreground">Exception:</span>
                            <Badge variant={selectedPO.exception ? "destructive" : "outline"} className="text-xs">
                              {selectedPO.exception ? "Yes" : "No"}
                            </Badge>
                          </div>
                          <div className="flex justify-between py-1">
                            <span className="text-muted-foreground">Dispatch Failed:</span>
                            <Badge variant={selectedPO.dispatchFailed ? "destructive" : "outline"} className="text-xs">
                              {selectedPO.dispatchFailed ? "Yes" : "No"}
                            </Badge>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="details" className="p-6 m-0">
                  <div className="text-sm text-muted-foreground text-center py-8">
                    <p>Line items, delivery info, coding details, and attachments will appear here in Step 3+.</p>
                  </div>
                </TabsContent>

                <TabsContent value="audit" className="p-6 space-y-3 m-0">
                  {(selectedPR?.auditTrail || selectedPO?.auditTrail)?.map((event) => (
                    <div key={event.id} className="flex gap-3 pb-3 border-b last:border-0">
                      <div className="flex-shrink-0 mt-1">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <CheckCircle className="h-4 w-4 text-primary" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">{event.action}</p>
                        <p className="text-xs text-muted-foreground mt-1">{event.actor}</p>
                        {event.details && (
                          <p className="text-xs text-muted-foreground mt-1">{event.details}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          {event.timestamp.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </TabsContent>
              </ScrollArea>
            </Tabs>
          </Card>
        )}
      </div>

      {/* Floating Assistant Button */}
      <Button
        size="lg"
        className="fixed bottom-6 right-6 rounded-full h-14 w-14 shadow-lg z-30"
        onClick={() => setShowAssistant(true)}
        title="Assistant"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>

      {/* Assistant Drawer */}
      {showAssistant && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setShowAssistant(false)}
          />

          {/* Drawer */}
          <div className="fixed right-0 top-0 bottom-0 w-96 bg-background border-l shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <MessageCircle className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Procurement Assistant</h2>
                  <p className="text-xs text-muted-foreground">Ask about your queue</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowAssistant(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Chat Area - Step 7: Message rendering */}
            <div className="flex-1 overflow-auto p-6">
              {assistantMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="p-4 rounded-full bg-muted/30 mb-4">
                    <MessageCircle className="h-8 w-8 text-muted-foreground/50" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Ask me anything about your procurement queue:
                  </p>
                  <div className="text-xs text-muted-foreground space-y-2 bg-muted/30 rounded-lg p-4 max-w-xs">
                    <p className="font-medium">"What needs attention?"</p>
                    <p className="font-medium">"Open PR-6729"</p>
                    <p className="font-medium">"Show dispatch failures"</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {assistantMessages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        "flex",
                        message.role === "user" ? "justify-end" : "justify-start"
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-[85%] rounded-lg px-4 py-2.5 text-sm",
                          message.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-foreground"
                        )}
                      >
                        <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                        {message.actions && message.actions.length > 0 && (
                          <div className="flex flex-col gap-2 mt-3 pt-3 border-t border-border/40">
                            {message.actions.map((action, idx) => (
                              <Button
                                key={idx}
                                size="sm"
                                variant="outline"
                                className="justify-start text-xs h-8"
                                onClick={action.onClick}
                              >
                                {action.label}
                              </Button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Input Box - Step 7: Enabled with handler */}
            <div className="border-t bg-background/95 p-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ask about procurement items..."
                  className="flex-1 px-3 py-2 bg-background border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  value={assistantInput}
                  onChange={(e) => setAssistantInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && assistantInput.trim()) {
                      handleAssistantCommand(assistantInput);
                    }
                  }}
                />
                <Button
                  onClick={() => assistantInput.trim() && handleAssistantCommand(assistantInput)}
                  disabled={!assistantInput.trim()}
                >
                  Send
                </Button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Request Info Dialog */}
      <Dialog open={requestInfoDialogOpen} onOpenChange={setRequestInfoDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Information</DialogTitle>
            <DialogDescription>
              Request additional information from the requester or approver.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              This is a placeholder for the "Request Info" feature. In future steps, you'll be able to:
            </p>
            <ul className="list-disc list-inside text-sm text-muted-foreground mt-2 space-y-1">
              <li>Send a message to the requester</li>
              <li>Request clarification on specific fields</li>
              <li>Track response status</li>
            </ul>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setRequestInfoDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setRequestInfoDialogOpen(false)} disabled>
              Send Request (Coming Soon)
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
