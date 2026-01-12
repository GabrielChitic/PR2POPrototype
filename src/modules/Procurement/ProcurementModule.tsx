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
  DEMO_PRS,
  DEMO_POS,
  type ProcurementPR,
  type ProcurementPO,
  type AuditEvent,
  getPRSlaStatus,
  getPOSlaStatus,
  getPRReason,
  getPRNextAction,
  getPOReason,
  getPONextAction,
} from "../../data/procurementData";
import { PRPOFullDetail } from "../../components/PRPOFullDetail";
import { isValidCostCenter } from "../../data/costCenterData";

type WorkbenchTab = "pr" | "po";
type ViewFilter = "all" | "attention" | "unassigned" | "sla-risk" | "my-queue";

interface QuickFilter {
  id: string;
  label: string;
  active: boolean;
}

export function ProcurementModule() {
  const [activeTab, setActiveTab] = useState<WorkbenchTab>("pr");
  const [selectedView, setSelectedView] = useState<ViewFilter>("all");
  const [quickFilters, setQuickFilters] = useState<QuickFilter[]>([
    { id: "unassigned", label: "Unassigned", active: false },
    { id: "sla-breached", label: "SLA breached", active: false },
    { id: "holds", label: "Holds", active: false },
    { id: "exceptions", label: "Exceptions", active: false },
    { id: "high-value", label: "High value", active: false },
  ]);
  const [showAssistant, setShowAssistant] = useState(false);
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
  const [prs, setPrs] = useState<ProcurementPR[]>(DEMO_PRS);
  const [pos, setPos] = useState<ProcurementPO[]>(DEMO_POS);

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
        case "unassigned":
          filtered = filtered.filter((pr) => pr.unassigned);
          break;
        case "sla-breached":
          filtered = filtered.filter((pr) => pr.slaBreached);
          break;
        case "holds":
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
        case "unassigned":
          filtered = filtered.filter((po) => po.unassigned);
          break;
        case "sla-breached":
          filtered = filtered.filter((po) => po.slaBreached);
          break;
        case "holds":
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
    if (!pr || pr.phaseStep !== "Ready for PO") return;

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
    if (!po || po.dispatchStatus !== "Ready to send") return;

    const updatedPO: ProcurementPO = {
      ...po,
      dispatchStatus: "Sent",
      dispatchAttemptCount: (po.dispatchAttemptCount || 0) + 1,
      dispatchLastAttemptAt: new Date(),
      // Step 5: After successful dispatch, advance to Confirm and wait for confirmation
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
    />;
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-muted/20">
      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden p-4">
        {/* Primary Workspace Card */}
        <Card className="flex-1 flex flex-col shadow-lg border-border/50">
          {/* Header */}
          <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-8 py-6">
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
                  PR Workbench (Requests)
                </TabsTrigger>
                <TabsTrigger value="po" className="data-[state=active]:bg-background">
                  PO Workbench (Orders)
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Shared Controls Row */}
            <div className="border-b bg-background/95 px-8 py-4">
              <div className="flex items-center gap-4 flex-wrap">
                {/* Views Dropdown */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Views:</span>
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

                {/* Divider */}
                <div className="h-6 w-px bg-border" />

                {/* Quick Filter Chips */}
                <div className="flex items-center gap-2 flex-wrap">
                  {quickFilters.map((filter) => (
                    <Badge
                      key={filter.id}
                      variant={filter.active ? "default" : "outline"}
                      className={cn(
                        "cursor-pointer hover:bg-primary/10 transition-colors",
                        filter.active && "bg-primary text-primary-foreground"
                      )}
                      onClick={() => toggleQuickFilter(filter.id)}
                    >
                      {filter.label}
                      {filter.active && <X className="ml-1 h-3 w-3" />}
                    </Badge>
                  ))}
                </div>

                {/* Divider */}
                <div className="h-6 w-px bg-border" />

                {/* Columns Button */}
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
                            Title / Line summary
                          </th>
                          <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground whitespace-nowrap">
                            Phase / Step
                          </th>
                          <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground whitespace-nowrap">
                            Blocker / Exception
                          </th>
                          <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground whitespace-nowrap">
                            Age / SLA
                          </th>
                          <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground whitespace-nowrap">
                            Amount
                          </th>
                          <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground whitespace-nowrap">
                            Requester
                          </th>
                          <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground whitespace-nowrap">
                            Assignee / Queue
                          </th>
                          <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground whitespace-nowrap">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredPRs.length === 0 ? (
                          <tr>
                            <td colSpan={9} className="px-4 py-16 text-center">
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
                              <td className="px-4 py-3 text-sm font-medium text-foreground">
                                {pr.prNumber}
                              </td>
                              {/* Title / Line summary */}
                              <td className="px-4 py-3 text-sm text-foreground max-w-xs">
                                {pr.title}
                              </td>
                              {/* Phase / Step */}
                              <td className="px-4 py-3 text-sm">
                                <Badge variant="outline" className="text-xs">
                                  {pr.phaseStep}
                                </Badge>
                              </td>
                              {/* Reason / Next Action (Step 6) */}
                              <td className="px-4 py-3 text-sm">
                                {getPRReason(pr) ? (
                                  <div className="space-y-1">
                                    <Badge
                                      variant={pr.topBlocker ? "destructive" : pr.hold ? "secondary" : "default"}
                                      className="text-xs"
                                    >
                                      {getPRReason(pr)}
                                    </Badge>
                                    {getPRNextAction(pr) && (
                                      <div className="text-xs text-muted-foreground">
                                        {getPRNextAction(pr)}
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-muted-foreground">—</span>
                                )}
                              </td>
                              {/* Age / SLA (Step 6) */}
                              <td className="px-4 py-3 text-sm">
                                <div className="space-y-1">
                                  <div className="text-foreground">{pr.age}</div>
                                  <Badge
                                    variant={
                                      getPRSlaStatus(pr) === "Breached"
                                        ? "destructive"
                                        : getPRSlaStatus(pr) === "At risk"
                                        ? "secondary"
                                        : "outline"
                                    }
                                    className="text-xs"
                                  >
                                    {getPRSlaStatus(pr)}
                                  </Badge>
                                </div>
                              </td>
                              {/* Amount */}
                              <td className="px-4 py-3 text-sm font-medium text-foreground">
                                {pr.currency} {pr.amount.toLocaleString()}
                              </td>
                              {/* Requester */}
                              <td className="px-4 py-3 text-sm text-foreground">
                                {pr.requester}
                              </td>
                              {/* Assignee / Queue */}
                              <td className="px-4 py-3 text-sm">
                                {pr.unassigned ? (
                                  <Badge variant="secondary" className="text-xs">
                                    Unassigned
                                  </Badge>
                                ) : (
                                  <span className="text-foreground">{pr.assigneeOrQueue}</span>
                                )}
                              </td>
                              {/* Actions */}
                              <td className="px-4 py-3 text-sm">
                                <div className="flex items-center gap-2" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-8"
                                    onClick={() => handleOpenPR(pr)}
                                  >
                                    Open
                                  </Button>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                        <User className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem
                                        onClick={() => handleAssignPR(pr.id, "Emily Rodriguez")}
                                      >
                                        Assign to me
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={() => handleAssignPR(pr.id, "Unassigned")}
                                      >
                                        Unassign
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 w-8 p-0"
                                    onClick={handleRequestInfo}
                                  >
                                    <MessageSquare className="h-4 w-4" />
                                  </Button>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                        <MoreVertical className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem disabled>
                                        Apply suggested fix
                                      </DropdownMenuItem>
                                      <DropdownMenuItem disabled>Route</DropdownMenuItem>
                                      <DropdownMenuItem disabled>Re-run checks</DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
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
                            Source PR
                          </th>
                          <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground whitespace-nowrap">
                            Phase / Step
                          </th>
                          <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground whitespace-nowrap">
                            Failure reason
                          </th>
                          <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground whitespace-nowrap">
                            Age / SLA
                          </th>
                          <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground whitespace-nowrap">
                            Amount
                          </th>
                          <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground whitespace-nowrap">
                            Assignee / Resolver group
                          </th>
                          <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground whitespace-nowrap">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredPOs.length === 0 ? (
                          <tr>
                            <td colSpan={9} className="px-4 py-16 text-center">
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
                              <td className="px-4 py-3 text-sm font-medium text-foreground">
                                {po.poNumber}
                              </td>
                              {/* Supplier */}
                              <td className="px-4 py-3 text-sm text-foreground">
                                {po.supplier}
                              </td>
                              {/* Source PR */}
                              <td className="px-4 py-3 text-sm text-muted-foreground">
                                {po.sourcePrNumber ? (
                                  <span className="text-foreground">{po.sourcePrNumber}</span>
                                ) : (
                                  <span>—</span>
                                )}
                              </td>
                              {/* Phase / Step */}
                              <td className="px-4 py-3 text-sm">
                                <Badge variant="outline" className="text-xs">
                                  {po.phaseStep}
                                </Badge>
                              </td>
                              {/* Reason / Next Action (Step 6) */}
                              <td className="px-4 py-3 text-sm max-w-xs">
                                {getPOReason(po) ? (
                                  <div className="space-y-1">
                                    <Badge
                                      variant={
                                        po.failureReason || po.dispatchStatus === "Failed"
                                          ? "destructive"
                                          : po.confirmationStatus === "DEVIATION" || po.changeStatus === "PENDING"
                                          ? "secondary"
                                          : "default"
                                      }
                                      className="text-xs"
                                    >
                                      {getPOReason(po)}
                                    </Badge>
                                    {getPONextAction(po) && (
                                      <div className="text-xs text-muted-foreground">
                                        {getPONextAction(po)}
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-muted-foreground">—</span>
                                )}
                              </td>
                              {/* Age / SLA (Step 6) */}
                              <td className="px-4 py-3 text-sm">
                                <div className="space-y-1">
                                  <div className="text-foreground">{po.age}</div>
                                  <Badge
                                    variant={
                                      getPOSlaStatus(po) === "Breached"
                                        ? "destructive"
                                        : getPOSlaStatus(po) === "At risk"
                                        ? "secondary"
                                        : "outline"
                                    }
                                    className="text-xs"
                                  >
                                    {getPOSlaStatus(po)}
                                  </Badge>
                                </div>
                              </td>
                              {/* Amount */}
                              <td className="px-4 py-3 text-sm font-medium text-foreground">
                                {po.currency} {po.amount.toLocaleString()}
                              </td>
                              {/* Assignee / Resolver group */}
                              <td className="px-4 py-3 text-sm">
                                {po.unassigned ? (
                                  <Badge variant="secondary" className="text-xs">
                                    Unassigned
                                  </Badge>
                                ) : (
                                  <span className="text-foreground">{po.assigneeOrResolverGroup}</span>
                                )}
                              </td>
                              {/* Actions */}
                              <td className="px-4 py-3 text-sm">
                                <div className="flex items-center gap-2" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-8"
                                    onClick={() => handleOpenPO(po)}
                                  >
                                    Open
                                  </Button>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                        <User className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem
                                        onClick={() => handleAssignPO(po.id, "Emily Rodriguez")}
                                      >
                                        Assign to me
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={() => handleAssignPO(po.id, "Unassigned")}
                                      >
                                        Unassign
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 w-8 p-0"
                                    onClick={handleRequestInfo}
                                  >
                                    <MessageSquare className="h-4 w-4" />
                                  </Button>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                        <MoreVertical className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem disabled>
                                        Apply suggested fix
                                      </DropdownMenuItem>
                                      <DropdownMenuItem disabled>Route</DropdownMenuItem>
                                      <DropdownMenuItem disabled>Re-run checks</DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
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

            {/* Chat Area */}
            <div className="flex-1 overflow-auto p-6">
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="p-4 rounded-full bg-muted/30 mb-4">
                  <MessageCircle className="h-8 w-8 text-muted-foreground/50" />
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Ask me anything about your procurement queue:
                </p>
                <div className="text-xs text-muted-foreground space-y-2 bg-muted/30 rounded-lg p-4 max-w-xs">
                  <p className="font-medium">"What needs attention?"</p>
                  <p className="font-medium">"Why is this blocked?"</p>
                  <p className="font-medium">"Show SLA-breached PRs."</p>
                </div>
              </div>
            </div>

            {/* Input Box */}
            <div className="border-t bg-background/95 p-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ask about procurement items..."
                  className="flex-1 px-3 py-2 bg-background border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  disabled
                />
                <Button disabled>Send</Button>
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
