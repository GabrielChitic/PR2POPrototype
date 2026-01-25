// ============================================================================
// PR → PO CONVERSION MAPPER
// Deterministic mapping contract for BBraun happy flow
// ============================================================================

import type { ProcurementPR, ProcurementPO, AuditEvent } from './procurementData';

/**
 * CONVERSION MAPPING CHECKLIST for BBraun PL568T:
 * ✓ PO number = 4516638113 (from dataset anchor)
 * ✓ Vendor = 1165336 (AESCULAP)
 * ✓ Plant/Entity = BBraun-DE01
 * ✓ Purchasing Group = 7EF
 * ✓ Line: PL568T, description, qty 2,288 PAK, unit price 61.6 EUR/PAK, total 140,940.80
 * ✓ Info Record = 5301133479
 * ✓ Commodity group = D05AA19AE
 * ✓ Cost center = 7200
 * ✓ GL Account = 400100
 * ✓ Delivery location = BBraun Plant DE01 - Melsungen
 * ✓ Need-by date = copied from PR
 */

export interface ConversionResult {
  po: ProcurementPO;
  auditEvents: AuditEvent[];
}

/**
 * Convert PR to PO for BBraun PL568T (PR-4546245893)
 * Returns fully populated PO object with no blank fields
 */
export function convertBBraunPrToPo(pr: ProcurementPR): ConversionResult {
  const now = new Date();

  // BBraun-specific mapping from dataset anchor
  const po: ProcurementPO = {
    id: "po-bbraun-001",
    poNumber: "PO-4516638113",
    supplier: "AESCULAP (1165336)",
    phaseStep: "Create/Post",
    failureReason: null,
    age: "Just now",
    slaBreached: false,
    amount: 140940.80,
    currency: "EUR",
    assigneeOrResolverGroup: "Michael Schneider",
    unassigned: false,
    exception: false,
    hold: false,
    highValue: true,
    dispatchFailed: false,
    createdAt: now,

    // Linkage
    sourcePrNumber: pr.prNumber,

    // Entity/Plant
    entityCode: "BBraun-DE01",
    deliveryLocation: "BBraun Plant DE01 - Melsungen",
    needByDate: pr.needByDate,

    // Accounting
    costCenter: "7200",
    glAccount: "400100",
    commodityGroup: "D05AA19AE",

    // Line Items
    lineItems: [
      {
        id: "line-bbraun-po-001",
        description: "CLIP LIGATURE MED.LARGE 20MAGAS.=120PCS.",
        quantity: 2288,
        unitPrice: 61.6,
      }
    ],

    // Dispatch
    dispatchMethod: "EDI/IDOC",
    dispatchStatus: "Ready to send",
    dispatchAttemptCount: 0,

    // Confirmation
    confirmationStatus: "WAITING",

    // Change tracking
    changeStatus: "NONE",
    closeStatus: "OPEN",

    // Initial audit trail
    auditTrail: [
      {
        id: "audit-bbraun-po-001-1",
        timestamp: now,
        action: "PO Created from PR",
        actor: "System",
        details: `Auto-conversion from ${pr.prNumber} after all approvals complete`,
        keyDiff: "Material: PL568T, Vendor: 1165336 (AESCULAP), Amount: EUR 140,940.80"
      },
      {
        id: "audit-bbraun-po-001-2",
        timestamp: new Date(now.getTime() + 1000),
        action: "Pricing sourced from info record 5301133479",
        actor: "System",
        details: "Price per unit: EUR 61.6/PAK, Total quantity: 2,288 PAK (274,560 pieces)",
        evidenceLinks: [
          {
            type: 'info-record',
            label: 'Info Record 5301133479',
            reference: '5301133479'
          },
          {
            type: 'po-history',
            label: 'Historical POs (18 on file)',
            reference: 'PL568T'
          }
        ]
      },
      {
        id: "audit-bbraun-po-001-3",
        timestamp: new Date(now.getTime() + 2000),
        action: "PO validated",
        actor: "System",
        details: "All validation checks passed: cost/conditions/qty/dates/spec",
        keyDiff: "Validation cockpit: All checks PASS"
      },
      {
        id: "audit-bbraun-po-001-4",
        timestamp: new Date(now.getTime() + 3000),
        action: "Posted to SAP",
        actor: "System",
        details: "PO successfully posted to SAP MM - Document number 4516638113 created",
        keyDiff: "SAP posting complete, PO active in system"
      },
      {
        id: "audit-bbraun-po-001-5",
        timestamp: new Date(now.getTime() + 4000),
        action: "Ready for dispatch",
        actor: "System",
        details: "PO ready to be transmitted to supplier via EDI/IDOC",
        keyDiff: "Awaiting dispatch trigger to send to AESCULAP"
      }
    ],
  };

  // PR audit events to append
  const prAuditEvents = [
    {
      id: `audit-bbraun-convert-${Date.now()}`,
      timestamp: now,
      action: "Conversion started (demo)",
      actor: "Emily Rodriguez",
      details: "Initiating PO creation from approved PR",
    },
    {
      id: `audit-bbraun-convert-${Date.now() + 1}`,
      timestamp: new Date(now.getTime() + 1000),
      action: "PO created: PO-4516638113",
      actor: "System",
      details: `Purchase Order successfully created from ${pr.prNumber}`,
      keyDiff: "PO Number: PO-4516638113, Amount: EUR 140,940.80"
    },
    {
      id: `audit-bbraun-convert-${Date.now() + 2}`,
      timestamp: new Date(now.getTime() + 2000),
      action: "Handoff to PO workbench",
      actor: "System",
      details: "PR conversion complete, PO now active in PO workbench",
    },
  ];

  return {
    po,
    auditEvents: prAuditEvents
  };
}

/**
 * Validate conversion mapping completeness
 * Returns list of any missing required fields
 */
export function validateConversionMapping(po: ProcurementPO): string[] {
  const missing: string[] = [];

  if (!po.poNumber) missing.push('PO number');
  if (!po.supplier) missing.push('Supplier');
  if (!po.entityCode) missing.push('Entity/Plant');
  if (!po.deliveryLocation) missing.push('Delivery location');
  if (!po.needByDate) missing.push('Need-by date');
  if (!po.costCenter) missing.push('Cost center');
  if (!po.glAccount) missing.push('GL account');
  if (!po.commodityGroup) missing.push('Commodity group');
  if (!po.lineItems || po.lineItems.length === 0) missing.push('Line items');
  if (po.lineItems && po.lineItems.length > 0) {
    const line = po.lineItems[0];
    if (!line.description) missing.push('Line description');
    if (!line.quantity || line.quantity <= 0) missing.push('Line quantity');
    if (!line.unitPrice || line.unitPrice <= 0) missing.push('Line unit price');
  }

  return missing;
}
