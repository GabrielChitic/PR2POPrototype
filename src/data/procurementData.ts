// ============================================================================
// PROCUREMENT CONSOLE DEMO DATASET
// ============================================================================

export interface AuditEvent {
  id: string;
  timestamp: Date;
  action: string;
  actor: string;
  details?: string;
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
        timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000),
        action: "Approvals Complete",
        actor: "System",
        details: "All approvals received, ready for PO creation",
      },
      {
        id: "audit-pr-001-3",
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
        action: "Ingested to Procurement",
        actor: "System",
        details: "PR ingested into Procurement Console",
      },
    ],
  },

  // PR-EXCEPTION: Catalog exception (for future journeys)
  {
    id: "pr-002",
    prNumber: "PR-6729",
    title: "12 Laptops — Bucharest",
    phaseStep: "Gatekeep",
    topBlocker: "Non-preferred supplier — exception required",
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
        action: "Exception Detected",
        actor: "System",
        details: "Non-preferred supplier requires procurement approval",
      },
      {
        id: "audit-pr-002-3",
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
        action: "Assigned to Queue",
        actor: "System",
        details: "Routed to IT Procurement Queue for exception handling",
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
];
