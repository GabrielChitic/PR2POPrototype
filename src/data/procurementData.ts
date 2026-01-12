// ============================================================================
// PROCUREMENT CONSOLE DEMO DATASET
// ============================================================================

export interface AuditEvent {
  id: string;
  timestamp: Date;
  action: string;
  actor: string;
  details?: string;
  // Step 6: Key diffs for demo polish
  keyDiff?: string; // e.g., "Cost center changed: CC-RO-??? → CC-RO-BUCH-ENG"
  evidenceLabel?: string; // e.g., "Rule snapshot", "Transmission log"
}

export interface ProcurementPR {
  id: string;
  prNumber: string;
  title: string;
  phaseStep: string;
  topBlocker: string | null;
  age: string; // e.g., "2h", "1d"
  slaBreached: boolean;
  amount: number;
  currency: string;
  requester: string;
  assigneeOrQueue: string;
  // Flags for filtering
  unassigned: boolean;
  exception: boolean;
  hold: boolean;
  highValue: boolean;
  // Additional fields for detail view
  entityCode: string;
  createdAt: Date;
  auditTrail: AuditEvent[];
  // Coding/Accounting fields (Step 3)
  deliveryLocation?: string;
  needByDate?: string;
  costCenter?: string;
  glAccount?: string;
  commodityGroup?: string;
  lineItems?: Array<{
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
  }>;
  // Step 4: PR→PO linking
  linkedPoNumber?: string;
}

export interface ProcurementPO {
  id: string;
  poNumber: string;
  supplier: string;
  phaseStep: string;
  failureReason: string | null;
  age: string;
  slaBreached: boolean;
  amount: number;
  currency: string;
  assigneeOrResolverGroup: string;
  // Flags for filtering
  unassigned: boolean;
  exception: boolean;
  hold: boolean;
  highValue: boolean;
  dispatchFailed: boolean;
  // Additional fields for detail view
  createdAt: Date;
  auditTrail: AuditEvent[];
  // Step 4: PR→PO linking
  sourcePrNumber?: string;
  // Copied from PR
  entityCode?: string;
  deliveryLocation?: string;
  needByDate?: string;
  costCenter?: string;
  glAccount?: string;
  commodityGroup?: string;
  lineItems?: Array<{
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
  }>;
  // Dispatch tracking
  dispatchMethod?: string;
  dispatchStatus?: "Ready to send" | "Sent" | "Failed";
  // Step 5: Extended dispatch fields
  dispatchAttemptCount?: number;
  dispatchLastAttemptAt?: Date;
  dispatchFailureReason?: string;
  // Step 5: Confirmation tracking
  confirmationStatus?: "WAITING" | "RECEIVED" | "DEVIATION" | "NOT_USED";
  confirmedDeliveryDate?: string;
  confirmedQuantityDelta?: number;
  confirmationNote?: string;
  // Step 5: Change tracking
  changeStatus?: "NONE" | "PENDING" | "ACCEPTED" | "REJECTED";
  proposedChanges?: {
    deliveryDate?: string;
    quantity?: number;
  };
  changeDecisionAt?: Date;
  // Step 5: Close tracking
  closeStatus?: "OPEN" | "CLOSED_DEMO";
  closedAt?: Date;
}

// ============================================================================
// PR DATASET (6 items)
// ============================================================================

export const DEMO_PRS: ProcurementPR[] = [
  // PR-HAPPY: Catalog happy path (for future journeys)
  {
    id: "pr-001",
    prNumber: "PR-6728",
    title: "15 Laptops — Bucharest",
    phaseStep: "Ready for PO",
    topBlocker: null,
    age: "2h",
    slaBreached: false,
    amount: 18000,
    currency: "USD",
    requester: "Gabriel Chitic",
    assigneeOrQueue: "Unassigned",
    unassigned: true,
    exception: false,
    hold: false,
    highValue: false,
    entityCode: "UIPATH-RO",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    // Coding fields (all valid for clean PR)
    deliveryLocation: "Bucharest",
    needByDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    costCenter: "CC-RO-BUCH-ENG",
    glAccount: "612000",
    commodityGroup: "IT-HW-LAPTOPS",
    lineItems: [
      {
        id: "line-001",
        description: "Dell Latitude 5430 Laptop",
        quantity: 15,
        unitPrice: 1200,
      },
    ],
    auditTrail: [
      {
        id: "audit-pr-001-1",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        action: "PR Created",
        actor: "Gabriel Chitic",
        details: "Purchase request created via Requester module",
      },
      {
        id: "audit-pr-001-2",
        timestamp: new Date(Date.now() - 1.8 * 60 * 60 * 1000),
        action: "Passed gatekeep",
        actor: "System",
        details: "All validation checks passed",
      },
      {
        id: "audit-pr-001-3",
        timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000),
        action: "Approvals Complete",
        actor: "System",
        details: "All approvals received, ready for PO creation",
      },
      {
        id: "audit-pr-001-4",
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
        action: "Reached Ready for PO",
        actor: "System",
        details: "PR is ready for purchase order creation",
      },
    ],
  },

  // PR-EXCEPTION: Catalog exception (for future journeys)
  {
    id: "pr-002",
    prNumber: "PR-6729",
    title: "12 Laptops — Bucharest",
    phaseStep: "Gatekeep",
    topBlocker: "Invalid cost center",
    age: "4h",
    slaBreached: false,
    amount: 16200,
    currency: "USD",
    requester: "Sarah Johnson",
    assigneeOrQueue: "IT Procurement Queue",
    unassigned: false,
    exception: true,
    hold: false,
    highValue: false,
    entityCode: "UIPATH-RO",
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    // Coding fields (invalid cost center for exception)
    deliveryLocation: "Bucharest",
    needByDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    costCenter: "CC-INVALID-999", // INVALID - causes blocker
    glAccount: "612000",
    commodityGroup: "IT-HW-LAPTOPS",
    lineItems: [
      {
        id: "line-002",
        description: "HP EliteBook 840 G9",
        quantity: 12,
        unitPrice: 1350,
      },
    ],
    auditTrail: [
      {
        id: "audit-pr-002-1",
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
        action: "PR Created",
        actor: "Sarah Johnson",
        details: "Purchase request created",
      },
      {
        id: "audit-pr-002-2",
        timestamp: new Date(Date.now() - 3.5 * 60 * 60 * 1000),
        action: "Validation Failed",
        actor: "System",
        details: "Cost center CC-INVALID-999 is not valid for entity UIPATH-RO",
      },
      {
        id: "audit-pr-002-3",
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
        action: "Assigned to Queue",
        actor: "System",
        details: "Routed to IT Procurement Queue for cost center correction",
      },
    ],
  },

  // Additional PRs for realism
  {
    id: "pr-003",
    prNumber: "PR-6730",
    title: "Software subscription renewal — Adobe Creative Cloud",
    phaseStep: "Approvals",
    topBlocker: null,
    age: "1d",
    slaBreached: false,
    amount: 5400,
    currency: "USD",
    requester: "Michael Chen",
    assigneeOrQueue: "Emily Rodriguez",
    unassigned: false,
    exception: false,
    hold: true,
    highValue: false,
    entityCode: "UIPATH-US",
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    auditTrail: [
      {
        id: "audit-pr-003-1",
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
        action: "PR Created",
        actor: "Michael Chen",
        details: "Annual software subscription renewal",
      },
      {
        id: "audit-pr-003-2",
        timestamp: new Date(Date.now() - 20 * 60 * 60 * 1000),
        action: "Hold Applied",
        actor: "Emily Rodriguez",
        details: "Awaiting budget confirmation from Finance",
      },
    ],
  },

  {
    id: "pr-004",
    prNumber: "PR-6731",
    title: "Office supplies restock — Munich",
    phaseStep: "Ready for PO",
    topBlocker: null,
    age: "6h",
    slaBreached: false,
    amount: 850,
    currency: "EUR",
    requester: "Anna Schmidt",
    assigneeOrQueue: "Emily Rodriguez",
    unassigned: false,
    exception: false,
    hold: false,
    highValue: false,
    entityCode: "UIPATH-DE",
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    auditTrail: [
      {
        id: "audit-pr-004-1",
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
        action: "PR Created",
        actor: "Anna Schmidt",
        details: "Quarterly office supplies order",
      },
      {
        id: "audit-pr-004-2",
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
        action: "Auto-approved",
        actor: "System",
        details: "Below approval threshold, auto-approved",
      },
    ],
  },

  {
    id: "pr-005",
    prNumber: "PR-6732",
    title: "Laptop accessories bundle — New York",
    phaseStep: "Gatekeep",
    topBlocker: null,
    age: "3h",
    slaBreached: false,
    amount: 2400,
    currency: "USD",
    requester: "James Wilson",
    assigneeOrQueue: "Unassigned",
    unassigned: true,
    exception: false,
    hold: false,
    highValue: false,
    entityCode: "UIPATH-US",
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
    auditTrail: [
      {
        id: "audit-pr-005-1",
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
        action: "PR Created",
        actor: "James Wilson",
        details: "Laptop accessories for new hires",
      },
      {
        id: "audit-pr-005-2",
        timestamp: new Date(Date.now() - 2.5 * 60 * 60 * 1000),
        action: "Ingested",
        actor: "System",
        details: "Awaiting initial gatekeep review",
      },
    ],
  },

  {
    id: "pr-006",
    prNumber: "PR-6733",
    title: "CAPEX inspection machine — Tokyo lab",
    phaseStep: "Approvals",
    topBlocker: "Invalid cost center",
    age: "2d",
    slaBreached: true,
    amount: 75000,
    currency: "USD",
    requester: "Yuki Tanaka",
    assigneeOrQueue: "IT Procurement Queue",
    unassigned: false,
    exception: true,
    hold: true,
    highValue: true,
    entityCode: "UIPATH-JP",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    auditTrail: [
      {
        id: "audit-pr-006-1",
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        action: "PR Created",
        actor: "Yuki Tanaka",
        details: "High-value CAPEX equipment purchase",
      },
      {
        id: "audit-pr-006-2",
        timestamp: new Date(Date.now() - 1.8 * 24 * 60 * 60 * 1000),
        action: "Validation Failed",
        actor: "System",
        details: "Cost center code not found in master data",
      },
      {
        id: "audit-pr-006-3",
        timestamp: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000),
        action: "SLA Breached",
        actor: "System",
        details: "Item has been in exception state for over 24 hours",
      },
    ],
  },
];

// ============================================================================
// PO DATASET (4 items)
// ============================================================================

export const DEMO_POS: ProcurementPO[] = [
  // Clean PO 1
  {
    id: "po-001",
    poNumber: "PO-3102",
    supplier: "Dell Direct",
    phaseStep: "Dispatch",
    failureReason: null,
    age: "1d",
    slaBreached: false,
    amount: 24000,
    currency: "USD",
    assigneeOrResolverGroup: "Emily Rodriguez",
    unassigned: false,
    exception: false,
    hold: false,
    highValue: false,
    dispatchFailed: false,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    auditTrail: [
      {
        id: "audit-po-001-1",
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
        action: "PO Created",
        actor: "System",
        details: "PO created from approved PR-6710",
      },
      {
        id: "audit-po-001-2",
        timestamp: new Date(Date.now() - 23 * 60 * 60 * 1000),
        action: "Posted to ERP",
        actor: "System",
        details: "Successfully posted to SAP",
      },
      {
        id: "audit-po-001-3",
        timestamp: new Date(Date.now() - 22 * 60 * 60 * 1000),
        action: "Dispatch Initiated",
        actor: "System",
        details: "Dispatch message sent to supplier",
      },
    ],
  },

  // Clean PO 2
  {
    id: "po-002",
    poNumber: "PO-3103",
    supplier: "Office Depot",
    phaseStep: "Create/Post",
    failureReason: null,
    age: "5h",
    slaBreached: false,
    amount: 1200,
    currency: "USD",
    assigneeOrResolverGroup: "Unassigned",
    unassigned: true,
    exception: false,
    hold: false,
    highValue: false,
    dispatchFailed: false,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
    auditTrail: [
      {
        id: "audit-po-002-1",
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
        action: "PO Created",
        actor: "System",
        details: "PO created from approved PR-6715",
      },
      {
        id: "audit-po-002-2",
        timestamp: new Date(Date.now() - 4.5 * 60 * 60 * 1000),
        action: "Awaiting Posting",
        actor: "System",
        details: "Queued for ERP posting",
      },
    ],
  },

  // PO with dispatch pending
  {
    id: "po-003",
    poNumber: "PO-3104",
    supplier: "HP Direct",
    phaseStep: "Dispatch",
    failureReason: null,
    age: "12h",
    slaBreached: false,
    amount: 8500,
    currency: "EUR",
    assigneeOrResolverGroup: "EU Procurement Queue",
    unassigned: false,
    exception: false,
    hold: false,
    highValue: false,
    dispatchFailed: false,
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
    auditTrail: [
      {
        id: "audit-po-003-1",
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
        action: "PO Created",
        actor: "System",
        details: "PO created from approved PR-6720",
      },
      {
        id: "audit-po-003-2",
        timestamp: new Date(Date.now() - 11 * 60 * 60 * 1000),
        action: "Posted to ERP",
        actor: "System",
        details: "Successfully posted to SAP",
      },
      {
        id: "audit-po-003-3",
        timestamp: new Date(Date.now() - 10 * 60 * 60 * 1000),
        action: "Dispatch Pending",
        actor: "System",
        details: "Awaiting dispatch confirmation from supplier",
      },
    ],
  },

  // PO with posting failure (Needs attention)
  {
    id: "po-004",
    poNumber: "PO-3105",
    supplier: "Accenture",
    phaseStep: "Create/Post",
    failureReason: "Posting failed: vendor not active in ERP",
    age: "8h",
    slaBreached: true,
    amount: 45000,
    currency: "USD",
    assigneeOrResolverGroup: "IT Procurement Queue",
    unassigned: false,
    exception: true,
    hold: false,
    highValue: false,
    dispatchFailed: false,
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
    auditTrail: [
      {
        id: "audit-po-004-1",
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
        action: "PO Created",
        actor: "System",
        details: "PO created from approved PR-6725",
      },
      {
        id: "audit-po-004-2",
        timestamp: new Date(Date.now() - 7.5 * 60 * 60 * 1000),
        action: "Posting Failed",
        actor: "System",
        details: "ERP rejected posting: vendor not active",
      },
      {
        id: "audit-po-004-3",
        timestamp: new Date(Date.now() - 7 * 60 * 60 * 1000),
        action: "Assigned to Queue",
        actor: "System",
        details: "Routed to IT Procurement Queue for resolution",
      },
      {
        id: "audit-po-004-4",
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
        action: "SLA Breached",
        actor: "System",
        details: "PO stuck in posting failure for over 6 hours",
      },
    ],
  },

  // Step 5: PO with confirmation deviation (Confirm → Change demo)
  {
    id: "po-005",
    poNumber: "PO-6657",
    supplier: "HP Direct",
    phaseStep: "Confirm",
    failureReason: null,
    age: "3h",
    slaBreached: false,
    amount: 16200,
    currency: "USD",
    assigneeOrResolverGroup: "Emily Rodriguez",
    unassigned: false,
    exception: true, // Deviation is an exception
    hold: false,
    highValue: false,
    dispatchFailed: false,
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
    sourcePrNumber: "PR-6730",
    entityCode: "UIPATH-RO",
    deliveryLocation: "Bucharest",
    needByDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 10 days from now
    costCenter: "CC-RO-BUCH-IT",
    glAccount: "612000",
    commodityGroup: "IT-HW-LAPTOPS",
    lineItems: [
      {
        id: "line-005",
        description: "HP EliteBook 840 G9",
        quantity: 12,
        unitPrice: 1350,
      },
    ],
    dispatchMethod: "Email/Network",
    dispatchStatus: "Sent",
    dispatchAttemptCount: 1,
    dispatchLastAttemptAt: new Date(Date.now() - 2.5 * 60 * 60 * 1000),
    confirmationStatus: "DEVIATION",
    confirmedDeliveryDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 15 days (5 days later)
    confirmedQuantityDelta: 0,
    confirmationNote: "Supplier confirmed later delivery date due to stock availability",
    proposedChanges: {
      deliveryDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // +5 days
    },
    changeStatus: "PENDING",
    closeStatus: "OPEN",
    auditTrail: [
      {
        id: "audit-po-005-1",
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
        action: "PO Created",
        actor: "System",
        details: "Created from PR-6730",
      },
      {
        id: "audit-po-005-2",
        timestamp: new Date(Date.now() - 2.8 * 60 * 60 * 1000),
        action: "Posted successfully",
        actor: "System",
        details: "All gate checks passed",
      },
      {
        id: "audit-po-005-3",
        timestamp: new Date(Date.now() - 2.5 * 60 * 60 * 1000),
        action: "PO dispatched",
        actor: "System",
        details: "Dispatch message sent to supplier",
      },
      {
        id: "audit-po-005-4",
        timestamp: new Date(Date.now() - 0.5 * 60 * 60 * 1000),
        action: "Confirmation received",
        actor: "System",
        details: "Supplier confirmed with deviation",
      },
      {
        id: "audit-po-005-5",
        timestamp: new Date(Date.now() - 0.5 * 60 * 60 * 1000),
        action: "Deviation detected",
        actor: "System",
        details: "Delivery date later than requested: +5 days",
      },
    ],
  },
];

// ============================================================================
// STEP 6: DEMO HARDENING HELPERS
// ============================================================================

// SLA thresholds for demo
const SLA_THRESHOLDS = {
  PR: {
    Gatekeep: 4 * 60, // 4 hours in minutes
    Reviews: 8 * 60, // 8 hours
    Approvals: 12 * 60, // 12 hours
    "Ready for PO": 24 * 60, // 24 hours
  },
  PO: {
    "Create/Post": 2 * 60, // 2 hours
    Dispatch: 2 * 60, // 2 hours
    Confirm: 24 * 60, // 24 hours
    Change: 4 * 60, // 4 hours
    Close: 0, // No SLA for close
  },
};

// Convert age string to minutes
function ageToMinutes(age: string): number {
  const match = age.match(/^(\d+)([hd])$/);
  if (!match) return 0;
  const value = parseInt(match[1], 10);
  const unit = match[2];
  if (unit === "h") return value * 60;
  if (unit === "d") return value * 24 * 60;
  return 0;
}

// Compute SLA status for PR
export function getPRSlaStatus(pr: ProcurementPR): "On track" | "At risk" | "Breached" {
  const ageMinutes = ageToMinutes(pr.age);
  const threshold = SLA_THRESHOLDS.PR[pr.phaseStep as keyof typeof SLA_THRESHOLDS.PR] || 24 * 60;

  if (ageMinutes >= threshold) return "Breached";
  if (ageMinutes >= threshold * 0.75) return "At risk";
  return "On track";
}

// Compute SLA status for PO
export function getPOSlaStatus(po: ProcurementPO): "On track" | "At risk" | "Breached" {
  const ageMinutes = ageToMinutes(po.age);
  const threshold = SLA_THRESHOLDS.PO[po.phaseStep as keyof typeof SLA_THRESHOLDS.PO] || 24 * 60;

  if (threshold === 0) return "On track"; // No SLA for close
  if (ageMinutes >= threshold) return "Breached";
  if (ageMinutes >= threshold * 0.75) return "At risk";
  return "On track";
}

// Get reason badge text for PR
export function getPRReason(pr: ProcurementPR): string | null {
  if (pr.topBlocker) return pr.topBlocker;
  if (pr.hold) return "On hold";
  if (pr.phaseStep === "Ready for PO") return "Ready for conversion";
  return null;
}

// Get next action hint for PR
export function getPRNextAction(pr: ProcurementPR): string | null {
  if (pr.topBlocker === "Invalid cost center") {
    return "Select a valid cost center and rerun checks";
  }
  if (pr.topBlocker) {
    return "Fix validation issues in Details tab";
  }
  if (pr.hold) {
    return "Resolve hold condition before proceeding";
  }
  if (pr.phaseStep === "Ready for PO") {
    return "Convert to Purchase Order";
  }
  if (pr.phaseStep === "Gatekeep") {
    return "Complete validation checks";
  }
  if (pr.phaseStep === "Approvals") {
    return "Waiting for approvals";
  }
  return null;
}

// Get reason badge text for PO
export function getPOReason(po: ProcurementPO): string | null {
  if (po.failureReason) return po.failureReason;
  if (po.dispatchStatus === "Failed") return "Dispatch failed";
  if (po.confirmationStatus === "DEVIATION") return "Confirmation deviation";
  if (po.changeStatus === "PENDING") return "Change decision pending";
  if (po.phaseStep === "Dispatch" && po.dispatchStatus === "Ready to send") {
    return "Ready to send";
  }
  if (po.phaseStep === "Close" && po.closeStatus === "CLOSED_DEMO") {
    return "Closed";
  }
  return null;
}

// Get next action hint for PO
export function getPONextAction(po: ProcurementPO): string | null {
  if (po.failureReason || po.dispatchStatus === "Failed") {
    return "Retry dispatch or route to resolver group";
  }
  if (po.confirmationStatus === "DEVIATION" || po.changeStatus === "PENDING") {
    return "Review supplier deviation and accept/reject change";
  }
  if (po.phaseStep === "Dispatch" && po.dispatchStatus === "Ready to send") {
    return "Send PO to supplier";
  }
  if (po.confirmationStatus === "RECEIVED") {
    return "Continue to close";
  }
  if (po.phaseStep === "Close") {
    return "View audit trail";
  }
  if (po.phaseStep === "Create/Post") {
    return "Complete posting validation";
  }
  return null;
}
