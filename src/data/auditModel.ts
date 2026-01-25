// ============================================================================
// AUDIT MODEL
// Enhanced audit event structure with evidence links
// ============================================================================

export interface AuditEvidence {
  type: 'info-record' | 'po-history' | 'ekes-confirmation' | 'rule-snapshot' | 'document';
  label: string;
  reference: string;
  onClick?: () => void;
}

export interface AuditDiff {
  field: string;
  oldValue: string;
  newValue: string;
}

export interface EnhancedAuditEvent {
  id: string;
  timestamp: Date;
  actor: string;
  action: string;
  reason?: string;
  details?: string;
  keyDiff?: string;
  evidenceLinks?: AuditEvidence[];
  diffs?: AuditDiff[];
}

/**
 * Create audit event for BBraun conversion
 */
export function createConversionAudit(prNumber: string, poNumber: string): EnhancedAuditEvent[] {
  const now = new Date();

  return [
    {
      id: `audit-conversion-1-${Date.now()}`,
      timestamp: now,
      actor: "Emily Rodriguez",
      action: "Conversion started",
      reason: "PR approved and ready for PO creation",
      details: "Initiating PO creation from approved PR",
      evidenceLinks: []
    },
    {
      id: `audit-conversion-2-${Date.now()}`,
      timestamp: new Date(now.getTime() + 1000),
      actor: "System",
      action: `PO created: ${poNumber}`,
      details: `Purchase Order successfully created from ${prNumber}`,
      keyDiff: `PO Number: ${poNumber}, Amount: EUR 140,940.80`,
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
      id: `audit-conversion-3-${Date.now()}`,
      timestamp: new Date(now.getTime() + 2000),
      actor: "System",
      action: "Handoff to PO workbench",
      details: "PR conversion complete, PO now active in PO workbench",
      diffs: [] // No material diffs
    }
  ];
}

/**
 * Create audit event for dispatch
 */
export function createDispatchAudit(poNumber: string): EnhancedAuditEvent[] {
  const now = new Date();

  return [
    {
      id: `audit-dispatch-1-${Date.now()}`,
      timestamp: now,
      actor: "Emily Rodriguez",
      action: "Dispatch triggered",
      reason: "User initiated PO dispatch to supplier",
      details: "User initiated PO dispatch to supplier",
      evidenceLinks: []
    },
    {
      id: `audit-dispatch-2-${Date.now()}`,
      timestamp: new Date(now.getTime() + 1000),
      actor: "System",
      action: "PO sent to supplier",
      details: "PO transmitted to AESCULAP via EDI/IDOC (demo simulation)",
      keyDiff: "Dispatch method: EDI/IDOC, Supplier: 1165336 (AESCULAP)",
      evidenceLinks: []
    },
    {
      id: `audit-dispatch-3-${Date.now()}`,
      timestamp: new Date(now.getTime() + 2000),
      actor: "System",
      action: "Awaiting supplier confirmation",
      details: "PO successfully dispatched, waiting for supplier acknowledgment",
      evidenceLinks: []
    }
  ];
}

/**
 * Create audit event for EKES confirmation
 */
export function createConfirmationAudit(): EnhancedAuditEvent[] {
  const now = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours later (simulated)

  return [
    {
      id: `audit-ekes-1-${Date.now()}`,
      timestamp: now,
      actor: "System",
      action: "Supplier confirmation received (EKES)",
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
      id: `audit-ekes-2-${Date.now()}`,
      timestamp: new Date(now.getTime() + 1000),
      actor: "System",
      action: "Confirmation validated",
      details: "Delta check passed: Qty matches, date within policy tolerance",
      keyDiff: "No deviations detected",
      diffs: [] // No material diffs - happy flow
    }
  ];
}
