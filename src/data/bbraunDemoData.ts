// ============================================================================
// BBRAUN PL568T DEMO DATASET
// Real SAP data from BBraun for material PL568T (Surgical Clips)
// ============================================================================
//
// IMPORTANT: Uses `import type` to avoid circular dependency with procurementData.ts
// Components should import from allProcurementData.ts, not directly from this file.
//
// ============================================================================

import type { ProcurementPR, ProcurementPO, AuditEvent } from './procurementData';

// ============================================================================
// APPROVAL WORKFLOW TYPES
// ============================================================================

export interface ApprovalStep {
  step: number;
  approver: string;
  role: string;
  action: string;
  checks: string[];
  sla_hours: number;
  can_reject: boolean;
  can_send_back: boolean;
  final_approval?: boolean;
}

export interface ApprovalFlow {
  total_approvers: number;
  estimated_total_time_hours: number;
  steps: ApprovalStep[];
}

export interface ApprovalTier {
  tier: number;
  tier_name: string;
  min_value: number;
  max_value: number;
  approvers: Array<{
    level: number;
    role: string;
    name: string;
    employee_id: string;
    title: string;
    approval_limit: number;
    auto_approve: boolean;
    sla_hours: number;
  }>;
  applicable_to_pl568t: boolean;
  notes: string;
}

export interface ApprovalWorkflow {
  approval_matrix_version: string;
  organization: string;
  purchasing_group: string;
  plant: string;
  currency: string;
  effective_date: string;
  approval_limits: {
    description: string;
    pr_approval_matrix: ApprovalTier[];
    po_approval_matrix: ApprovalTier[];
  };
  pl568t_specific_workflow: {
    material: string;
    description: string;
    standard_order_value: number;
    applicable_pr_tier: number;
    applicable_po_tier: number;
    pr_approval_flow: ApprovalFlow;
    po_release_flow: ApprovalFlow;
  };
  escalation_rules: {
    sla_breach: {
      pr_approval: {
        first_reminder_hours: number;
        escalation_after_hours: number;
        escalate_to: string;
      };
      po_release: {
        first_reminder_hours: number;
        escalation_after_hours: number;
        escalate_to: string;
      };
    };
    urgent_orders: {
      criteria: string;
      expedited_sla_reduction: number;
      parallel_approvals_allowed: boolean;
    };
  };
  approval_delegates: {
    description: string;
    delegates: Array<{
      primary: string;
      delegate: string;
      delegate_title: string;
      delegate_employee_id: string;
    }>;
  };
}

// ============================================================================
// MATERIAL MASTER DATA
// ============================================================================

export interface MaterialMaster {
  material_code: string;
  description: string;
  commodity_group: string;
  base_uom: string;
  order_uom: string;
  conversion_factor: number; // pieces per PAK
  material_type: string;
  industry_sector: string;
}

export interface MaterialPlantData {
  material_code: string;
  plant: string;
  fixed_lot_size: number;
  safety_stock: number;
  lead_time_days: number;
  gr_processing_time: number;
  mrp_group: string;
  procurement_type: string;
  abc_indicator: string;
}

export interface PurchasingData {
  material_code: string;
  vendor: string;
  vendor_name: string;
  purchasing_group: string;
  purchasing_org: string;
  plant: string;
  info_record: string;
  price_per_unit: number;
  currency: string;
  payment_terms: string;
  valid_from: string;
  incoterms: string;
}

// ============================================================================
// BBRAUN MATERIAL DATA: PL568T
// ============================================================================

export const BBRAUN_MATERIAL: MaterialMaster = {
  material_code: "PL568T",
  description: "CLIP LIGATURE MED.LARGE 20MAGAS.=120PCS.",
  commodity_group: "D05AA19AE",
  base_uom: "ST", // pieces
  order_uom: "PAK", // package
  conversion_factor: 120,
  material_type: "HAWA", // Trading goods
  industry_sector: "M", // Medical
};

export const BBRAUN_PLANT_DATA: MaterialPlantData = {
  material_code: "PL568T",
  plant: "DE01",
  fixed_lot_size: 45760, // Standard reorder quantity
  safety_stock: 30440,
  lead_time_days: 120,
  gr_processing_time: 3,
  mrp_group: "FX", // Fixed lot sizing
  procurement_type: "F", // External procurement
  abc_indicator: "A", // High-value item
};

export const BBRAUN_PURCHASING: PurchasingData = {
  material_code: "PL568T",
  vendor: "1165336",
  vendor_name: "AESCULAP",
  purchasing_group: "7EF",
  purchasing_org: "DEA1",
  plant: "DE01",
  info_record: "5301133479",
  price_per_unit: 61.6,
  currency: "EUR",
  payment_terms: "N002",
  valid_from: "2025-12-09",
  incoterms: "EXW",
};

// ============================================================================
// APPROVAL WORKFLOW DATA
// ============================================================================

export const BBRAUN_APPROVAL_WORKFLOW: ApprovalWorkflow = {
  approval_matrix_version: "1.0",
  organization: "BBraun - Purchasing Organization DEA1",
  purchasing_group: "7EF - Surgical Supplies",
  plant: "DE01",
  currency: "EUR",
  effective_date: "2024-01-01",

  approval_limits: {
    description: "Based on actual BBraun 7EF value distribution and industry standards for medical procurement",

    pr_approval_matrix: [
      {
        tier: 1,
        tier_name: "Standard",
        min_value: 0,
        max_value: 10000,
        approvers: [
          {
            level: 1,
            role: "Operational Buyer",
            name: "Michael Schneider",
            employee_id: "EMP001234",
            title: "Operational Buyer - Surgical Supplies",
            approval_limit: 10000,
            auto_approve: true,
            sla_hours: 4
          }
        ],
        applicable_to_pl568t: false,
        notes: "Single approval for routine purchases"
      },
      {
        tier: 3,
        tier_name: "High Value",
        min_value: 50000,
        max_value: 150000,
        approvers: [
          {
            level: 1,
            role: "Operational Buyer",
            name: "Michael Schneider",
            employee_id: "EMP001234",
            title: "Operational Buyer - Surgical Supplies",
            approval_limit: 150000,
            auto_approve: false,
            sla_hours: 8
          },
          {
            level: 2,
            role: "Head of Operational Purchasing",
            name: "Dr. Andrea Weber",
            employee_id: "EMP000987",
            title: "Head of Operational Purchasing - Medical Devices",
            approval_limit: 150000,
            auto_approve: false,
            sla_hours: 24
          },
          {
            level: 3,
            role: "Compliance Manager",
            name: "Stefan Hoffmann",
            employee_id: "EMP000654",
            title: "Compliance Manager - Procurement",
            approval_limit: 150000,
            auto_approve: false,
            sla_hours: 48
          }
        ],
        applicable_to_pl568t: true,
        notes: "Three-level approval with compliance review. PL568T orders (EUR 140,940.80) fall in this tier."
      }
    ],

    po_approval_matrix: [
      {
        tier: 4,
        tier_name: "Senior Management",
        min_value: 100000,
        max_value: 999999999,
        approvers: [
          {
            level: 1,
            role: "Operational Buyer",
            name: "Michael Schneider",
            employee_id: "EMP001234",
            title: "Operational Buyer - Surgical Supplies (7EF)",
            approval_limit: 999999999,
            auto_approve: false,
            sla_hours: 4
          },
          {
            level: 2,
            role: "Head of Operational Purchasing",
            name: "Dr. Andrea Weber",
            employee_id: "EMP000987",
            title: "Head of Operational Purchasing - Medical Devices",
            approval_limit: 999999999,
            auto_approve: false,
            sla_hours: 24
          },
          {
            level: 3,
            role: "Compliance Manager",
            name: "Thomas Becker",
            employee_id: "EMP000321",
            title: "Compliance Manager - Strategic Sourcing",
            approval_limit: 999999999,
            auto_approve: false,
            sla_hours: 48
          }
        ],
        applicable_to_pl568t: true,
        notes: "Three-level PO release for high-value orders. PL568T POs (EUR 140,940.80) require this level with compliance sign-off."
      }
    ]
  },

  pl568t_specific_workflow: {
    material: "PL568T",
    description: "CLIP LIGATURE MED.LARGE 20MAGAS.=120PCS.",
    standard_order_value: 140940.80,
    applicable_pr_tier: 3,
    applicable_po_tier: 4,

    pr_approval_flow: {
      total_approvers: 3,
      estimated_total_time_hours: 80,
      steps: [
        {
          step: 1,
          approver: "Michael Schneider",
          role: "Operational Buyer - Surgical Supplies",
          action: "Operational Review & Sourcing",
          checks: [
            "Verify material specification correct",
            "Confirm fixed lot size (45,760 pieces)",
            "Check preferred vendor (1165336 - AESCULAP)",
            "Validate info record pricing (EUR 61.6/PAK)",
            "Confirm delivery lead time (120 days)"
          ],
          sla_hours: 8,
          can_reject: true,
          can_send_back: true
        },
        {
          step: 2,
          approver: "Dr. Andrea Weber",
          role: "Head of Operational Purchasing",
          action: "Budget & Purchasing Approval",
          checks: [
            "Verify budget availability",
            "Validate cost center allocation",
            "Review against annual spend plan",
            "Confirm contract terms compliance",
            "Check purchasing policy adherence"
          ],
          sla_hours: 24,
          can_reject: true,
          can_send_back: true
        },
        {
          step: 3,
          approver: "Stefan Hoffmann",
          role: "Compliance Manager",
          action: "Compliance & Risk Review",
          checks: [
            "Commodity group compliance (D05AA19AE)",
            "Regulatory requirements validation",
            "Supplier compliance verification",
            "Contract and payment terms review",
            "Risk assessment for high-value procurement"
          ],
          sla_hours: 48,
          can_reject: true,
          can_send_back: true
        }
      ]
    },

    po_release_flow: {
      total_approvers: 3,
      estimated_total_time_hours: 76,
      steps: [
        {
          step: 1,
          approver: "Michael Schneider",
          role: "Operational Buyer",
          action: "PO Creation & Operational Review",
          checks: [
            "PO created from approved PR",
            "Quantities match PR",
            "Prices match info record",
            "Terms and conditions attached",
            "Delivery schedule confirmed"
          ],
          sla_hours: 4,
          can_reject: false,
          can_send_back: true
        },
        {
          step: 2,
          approver: "Dr. Andrea Weber",
          role: "Head of Operational Purchasing",
          action: "Purchasing Release Approval",
          checks: [
            "PR approval chain complete",
            "Vendor performance acceptable",
            "No supply chain alerts",
            "Contract compliance verified",
            "Purchasing policy adherence"
          ],
          sla_hours: 24,
          can_reject: true,
          can_send_back: true
        },
        {
          step: 3,
          approver: "Thomas Becker",
          role: "Compliance Manager",
          action: "Final Compliance Sign-off",
          checks: [
            "High-value compliance authorization",
            "Regulatory requirements met",
            "Supplier compliance verified",
            "Risk assessment complete",
            "Total spend and contract alignment"
          ],
          sla_hours: 48,
          can_reject: true,
          can_send_back: false,
          final_approval: true
        }
      ]
    }
  },

  escalation_rules: {
    sla_breach: {
      pr_approval: {
        first_reminder_hours: 4,
        escalation_after_hours: 24,
        escalate_to: "Dr. Klaus Müller (VP Procurement)"
      },
      po_release: {
        first_reminder_hours: 2,
        escalation_after_hours: 12,
        escalate_to: "Thomas Becker (Director)"
      }
    },
    urgent_orders: {
      criteria: "Delivery date < 30 days OR Stock < Safety stock",
      expedited_sla_reduction: 0.5,
      parallel_approvals_allowed: true
    }
  },

  approval_delegates: {
    description: "Backup approvers when primary is unavailable",
    delegates: [
      {
        primary: "Michael Schneider",
        delegate: "Julia Fischer",
        delegate_title: "Operational Buyer - Medical Consumables",
        delegate_employee_id: "EMP001567"
      },
      {
        primary: "Dr. Andrea Weber",
        delegate: "Martin Krause",
        delegate_title: "Deputy Head of Operational Purchasing",
        delegate_employee_id: "EMP001099"
      },
      {
        primary: "Stefan Hoffmann",
        delegate: "Sarah Meyer",
        delegate_title: "Deputy Compliance Manager",
        delegate_employee_id: "EMP000876"
      },
      {
        primary: "Thomas Becker",
        delegate: "Stefan Hoffmann",
        delegate_title: "Compliance Manager",
        delegate_employee_id: "EMP000654"
      }
    ]
  }
};

// ============================================================================
// DEMO PR: PL568T HIGH-VALUE ORDER
// ============================================================================

const now = new Date();
const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
const halfDayAgo = new Date(now.getTime() - 12 * 60 * 60 * 1000);
const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);

export const BBRAUN_DEMO_PR: ProcurementPR = {
  id: "pr-bbraun-001",
  prNumber: "PR-4546245893",
  title: "PL568T CLIP LIGATURE MED.LARGE - Surgical Supplies Restock",
  phaseStep: "Ready for PO",
  topBlocker: null,
  age: "2h",
  slaBreached: false,
  amount: 140940.80,
  currency: "EUR",
  requester: "Hans Dietrich (Inventory Planner)",
  assigneeOrQueue: "Unassigned",
  unassigned: true,
  exception: false,
  hold: false,
  highValue: true,
  entityCode: "BBraun-DE01",
  createdAt: twoHoursAgo,

  // Accounting assignment
  deliveryLocation: "BBraun Plant DE01 - Melsungen",
  needByDate: new Date(now.getTime() + 120 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 120 days (lead time)
  costCenter: "7200", // Medical Supplies Department
  glAccount: "400100", // Consumable Medical Supplies
  commodityGroup: "D05AA19AE",

  lineItems: [
    {
      id: "line-bbraun-001",
      description: "CLIP LIGATURE MED.LARGE 20MAGAS.=120PCS.",
      quantity: 2288, // PAK
      unitPrice: 61.6, // EUR per PAK
    }
  ],

  linkedPoNumber: undefined, // Will be set when converted to PO

  auditTrail: [
    {
      id: "audit-bbraun-pr-001-1",
      timestamp: twoDaysAgo,
      action: "PR Created",
      actor: "Hans Dietrich",
      details: "Auto-generated from MRP run - Stock below safety level (30,440 pieces)",
      keyDiff: "Material: PL568T, Qty: 2,288 PAK (274,560 pieces), Fixed lot size order"
    },
    {
      id: "audit-bbraun-pr-001-2",
      timestamp: new Date(twoDaysAgo.getTime() + 30 * 60 * 1000),
      action: "Source determination",
      actor: "System",
      details: "Info record 5301133479 found - Vendor 1165336 (AESCULAP)",
      keyDiff: "Price: EUR 61.6/PAK, Lead time: 120 days"
    },
    {
      id: "audit-bbraun-pr-001-3",
      timestamp: new Date(twoDaysAgo.getTime() + 2 * 60 * 60 * 1000),
      action: "Gatekeep validation passed",
      actor: "System",
      details: "All mandatory fields validated, commodity group D05AA19AE confirmed"
    },
    {
      id: "audit-bbraun-pr-001-4",
      timestamp: new Date(twoDaysAgo.getTime() + 4 * 60 * 60 * 1000),
      action: "Approval Step 1: Operational Review",
      actor: "Michael Schneider (Operational Buyer)",
      details: "Approved - Specification confirmed, vendor available, lead time acceptable",
      keyDiff: "Approval tier 3 triggered (High Value: EUR 140,940.80)"
    },
    {
      id: "audit-bbraun-pr-001-5",
      timestamp: oneDayAgo,
      action: "Approval Step 2: Purchasing Approval",
      actor: "Dr. Andrea Weber (Head of Operational Purchasing)",
      details: "Approved - Budget confirmed within annual spend plan, purchasing policy compliant",
      keyDiff: "Cost center 7200 validated, budget allocation approved"
    },
    {
      id: "audit-bbraun-pr-001-6",
      timestamp: new Date(twoHoursAgo.getTime() + 30 * 60 * 1000),
      action: "Approval Step 3: Compliance Review",
      actor: "Stefan Hoffmann (Compliance Manager)",
      details: "Approved - Compliance review complete. Commodity group D05AA19AE verified. Regulatory requirements met.",
      keyDiff: "All compliance checks passed for high-value procurement"
    },
    {
      id: "audit-bbraun-pr-001-7",
      timestamp: new Date(twoHoursAgo.getTime() + 35 * 60 * 1000),
      action: "All approvals complete",
      actor: "System",
      details: "All approval steps completed successfully. PR ready for PO conversion.",
      keyDiff: "Ready for PO conversion"
    },
    {
      id: "audit-bbraun-pr-001-8",
      timestamp: new Date(twoHoursAgo.getTime() + 40 * 60 * 1000),
      action: "Readiness checks passed",
      actor: "System",
      details: "All validation checks passed: Material, quantity, pricing, source of supply, accounting",
    }
  ]
};

// ============================================================================
// DEMO PO: PL568T HIGH-VALUE ORDER
// ============================================================================

export const BBRAUN_DEMO_PO: ProcurementPO = {
  id: "po-bbraun-001",
  poNumber: "PO-4516638113",
  supplier: "AESCULAP (1165336)",
  phaseStep: "Dispatch",
  failureReason: null,
  age: "1d",
  slaBreached: false,
  amount: 140940.80,
  currency: "EUR",
  assigneeOrResolverGroup: "Michael Schneider",
  unassigned: false,
  exception: false,
  hold: false,
  highValue: true,
  dispatchFailed: false,
  createdAt: twoHoursAgo,

  // PR linkage
  sourcePrNumber: "PR-4546245893",

  // Accounting (copied from PR)
  entityCode: "BBraun-DE01",
  deliveryLocation: "BBraun Plant DE01 - Melsungen",
  needByDate: new Date(now.getTime() + 120 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  costCenter: "7200",
  glAccount: "400100",
  commodityGroup: "D05AA19AE",

  lineItems: [
    {
      id: "line-bbraun-po-001",
      description: "CLIP LIGATURE MED.LARGE 20MAGAS.=120PCS.",
      quantity: 2288,
      unitPrice: 61.6,
    }
  ],

  // Dispatch tracking
  dispatchMethod: "EDI/IDOC",
  dispatchStatus: "Ready to send",
  dispatchAttemptCount: 0,

  // Confirmation tracking
  confirmationStatus: "WAITING",

  // Change tracking
  changeStatus: "NONE",
  closeStatus: "OPEN",

  auditTrail: [
    {
      id: "audit-bbraun-po-001-1",
      timestamp: twoHoursAgo,
      action: "PO Created from PR",
      actor: "System",
      details: "Auto-conversion from PR-4546245893 after all approvals complete",
      keyDiff: "PR approval cycle: 52 hours (3 levels)"
    },
    {
      id: "audit-bbraun-po-001-2",
      timestamp: new Date(twoHoursAgo.getTime() + 10 * 60 * 1000),
      action: "PO Release Step 1: Operational Review",
      actor: "Michael Schneider (Operational Buyer)",
      details: "Released - PO created from approved PR, quantities and prices match",
      keyDiff: "Info record 5301133479 pricing confirmed: EUR 61.6/PAK"
    },
    {
      id: "audit-bbraun-po-001-3",
      timestamp: new Date(twoHoursAgo.getTime() + 30 * 60 * 1000),
      action: "PO Release Step 2: Purchasing Approval",
      actor: "Dr. Andrea Weber (Head of Operational Purchasing)",
      details: "Released - PR approval chain complete, vendor performance: 98% on-time delivery",
      keyDiff: "Vendor 1165336 (AESCULAP) - Strategic supplier with excellent track record"
    },
    {
      id: "audit-bbraun-po-001-4",
      timestamp: new Date(twoHoursAgo.getTime() + 90 * 60 * 1000),
      action: "PO Release Step 3: Compliance Sign-off",
      actor: "Thomas Becker (Compliance Manager)",
      details: "Released - Compliance authorization granted, regulatory requirements met, total annual spend tracking: EUR 2.5M",
      keyDiff: "Supplier compliance verified, spend within approved limits"
    },
    {
      id: "audit-bbraun-po-001-5",
      timestamp: new Date(twoHoursAgo.getTime() + 95 * 60 * 1000),
      action: "Posted to SAP",
      actor: "System",
      details: "PO successfully posted to SAP MM - Document number 4516638113 created",
      keyDiff: "SAP posting complete, PO active in system"
    },
    {
      id: "audit-bbraun-po-001-6",
      timestamp: new Date(twoHoursAgo.getTime() + 100 * 60 * 1000),
      action: "Ready for dispatch",
      actor: "System",
      details: "PO ready to be transmitted to supplier via EDI/IDOC",
      keyDiff: "Awaiting dispatch trigger to send to AESCULAP"
    }
  ]
};

// ============================================================================
// SUPPLIER CONFIRMATION (EKES) DATA
// ============================================================================

export interface SupplierConfirmation {
  id: string;
  poNumber: string;
  confirmationType: "LA" | "AB" | "LP"; // LA = Shipping notification, AB = Acknowledgment, LP = Delivery date
  confirmedQuantity: number;
  confirmedQuantityUnit: string;
  confirmedDeliveryDate: string;
  receivedAt: Date;
  status: "Confirmed" | "Partially Confirmed" | "Deviation";
  notes?: string;
}

export const BBRAUN_EKES_CONFIRMATION: SupplierConfirmation = {
  id: "ekes-bbraun-001",
  poNumber: "PO-4516638113",
  confirmationType: "AB", // Acknowledgment
  confirmedQuantity: 2288,
  confirmedQuantityUnit: "PAK",
  confirmedDeliveryDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 120 days (lead time)
  receivedAt: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours after dispatch (demo)
  status: "Confirmed",
  notes: "Supplier confirmed order as requested. No deviations."
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get approval tier for a given value
 */
export function getApprovalTierForValue(
  value: number,
  documentType: 'PR' | 'PO'
): ApprovalTier | null {
  const matrix = documentType === 'PR'
    ? BBRAUN_APPROVAL_WORKFLOW.approval_limits.pr_approval_matrix
    : BBRAUN_APPROVAL_WORKFLOW.approval_limits.po_approval_matrix;

  return matrix.find(tier => value >= tier.min_value && value <= tier.max_value) || null;
}

/**
 * Get current approval step for a PR/PO
 */
export function getCurrentApprovalStep(
  auditTrail: AuditEvent[],
  workflow: ApprovalFlow
): ApprovalStep | null {
  // Find the last approval action
  const approvalActions = auditTrail.filter(event =>
    event.action.toLowerCase().includes('approval') ||
    event.action.toLowerCase().includes('release')
  );

  if (approvalActions.length === 0) {
    return workflow.steps[0]; // First step
  }

  // Return next pending step
  const lastStepNumber = approvalActions.length;
  if (lastStepNumber < workflow.steps.length) {
    return workflow.steps[lastStepNumber];
  }

  return null; // All approvals complete
}

/**
 * Calculate SLA status for approval steps
 */
export function getApprovalSLAStatus(
  createdAt: Date,
  currentStep: ApprovalStep
): 'On track' | 'At risk' | 'Breached' {
  const now = new Date();
  const ageHours = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
  const slaHours = currentStep.sla_hours;

  if (ageHours >= slaHours) return 'Breached';
  if (ageHours >= slaHours * 0.75) return 'At risk';
  return 'On track';
}

/**
 * Format approval history for display
 */
export function formatApprovalHistory(auditTrail: AuditEvent[]): string[] {
  return auditTrail
    .filter(event =>
      event.action.toLowerCase().includes('approval') ||
      event.action.toLowerCase().includes('release')
    )
    .map(event => `${event.actor}: ${event.details}`);
}

// ============================================================================
// EXPORT ALL DEMO DATA
// ============================================================================

export const BBRAUN_DEMO_DATASET = {
  material: BBRAUN_MATERIAL,
  plantData: BBRAUN_PLANT_DATA,
  purchasing: BBRAUN_PURCHASING,
  approvalWorkflow: BBRAUN_APPROVAL_WORKFLOW,
  demoPR: BBRAUN_DEMO_PR,
  demoPO: BBRAUN_DEMO_PO,

  // Quick reference values
  quickRef: {
    materialCode: "PL568T",
    description: "CLIP LIGATURE MED.LARGE 20MAGAS.=120PCS.",
    commodityGroup: "D05AA19AE",
    vendor: "1165336",
    vendorName: "AESCULAP",
    purchasingGroup: "7EF",
    plant: "DE01",
    quantity: 45760, // Fixed lot size in pieces
    quantityUOM: "ST",
    orderQuantity: 2288, // Order quantity in PAK
    orderUOM: "PAK",
    pricePerUnit: 61.6,
    currency: "EUR",
    totalAmount: 140940.80,
    costCenter: "7200",
    costCenterName: "Medical Supplies Department",
    glAccount: "400100",
    glAccountName: "Consumable Medical Supplies",
    fixedLotSize: 45760,
    safetyStock: 30440,
    leadTimeDays: 120,
    poNumber: "4516638113",
    prNumber: "4546245893",
    infoRecord: "5301133479"
  }
};
