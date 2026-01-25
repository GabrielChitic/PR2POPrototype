# BBraun Demo Data Integration Guide

## Overview

This guide explains how to integrate the BBraun PL568T demo dataset into your PR2PO prototype application.

The demo data has been converted into TypeScript interfaces and is ready to use in your React application at:
```
/src/data/bbraunDemoData.ts
```

---

## What's Included

### 1. **Material Master Data**
Complete product information for surgical clip material PL568T:
- Material code, description, commodity group
- UOM conversion (pieces ↔ packages)
- Fixed lot size: 45,760 pieces
- Safety stock: 30,440 pieces
- Lead time: 120 days

### 2. **Approval Workflow**
Realistic multi-tier approval matrix with:
- **PR Approval**: 3-level workflow for high-value items (€50k-€150k)
- **PO Release**: 3-level release process for orders >€100k
- Named approvers with German pharmaceutical company roles
- SLA hours for each approval step
- Escalation rules and delegate assignments

### 3. **Demo Purchase Requisition**
`BBRAUN_DEMO_PR` - A realistic high-value PR:
- PR Number: PR-4546245893
- Amount: EUR 140,940.80
- Material: PL568T (2,288 PAK)
- Status: In approvals (Step 3 pending)
- Complete audit trail showing approval progress

### 4. **Demo Purchase Order**
`BBRAUN_DEMO_PO` - Corresponding PO after PR approval:
- PO Number: PO-4516638113
- Linked to PR-4546245893
- All releases complete
- Ready for dispatch to AESCULAP vendor

---

## Quick Start

### Import the Demo Data

```typescript
import {
  BBRAUN_DEMO_DATASET,
  BBRAUN_DEMO_PR,
  BBRAUN_DEMO_PO,
  BBRAUN_APPROVAL_WORKFLOW
} from '@/data/bbraunDemoData';
```

### Use in Procurement Module

#### Add to existing demo data arrays:

```typescript
// In procurementData.ts or your data file
import { BBRAUN_DEMO_PR, BBRAUN_DEMO_PO } from './bbraunDemoData';

export const DEMO_PRS: ProcurementPR[] = [
  ...existingPRs,
  BBRAUN_DEMO_PR,  // Add BBraun PR
];

export const DEMO_POS: ProcurementPO[] = [
  ...existingPOs,
  BBRAUN_DEMO_PO,  // Add BBraun PO
];
```

#### Access quick reference values:

```typescript
const { quickRef } = BBRAUN_DEMO_DATASET;

console.log(quickRef.materialCode);     // "PL568T"
console.log(quickRef.totalAmount);      // 140940.80
console.log(quickRef.commodityGroup);   // "D05AA19AE"
console.log(quickRef.fixedLotSize);     // 45760
```

---

## Use Cases

### 1. High-Value Approval Demo

Show realistic multi-tier approval workflow:

```typescript
import { BBRAUN_DEMO_PR, getCurrentApprovalStep } from '@/data/bbraunDemoData';

// Get current approval step
const workflow = BBRAUN_APPROVAL_WORKFLOW.pl568t_specific_workflow.pr_approval_flow;
const currentStep = getCurrentApprovalStep(BBRAUN_DEMO_PR.auditTrail, workflow);

console.log(currentStep?.approver);     // "Stefan Hoffmann"
console.log(currentStep?.role);         // "Finance Controller"
console.log(currentStep?.sla_hours);    // 48
```

### 2. PR→PO Conversion Journey

Demonstrate complete PR to PO flow:

```typescript
// Show PR with audit trail
const pr = BBRAUN_DEMO_PR;
console.log(`PR ${pr.prNumber} - Amount: €${pr.amount}`);
console.log(`Linked PO: ${pr.linkedPoNumber}`);

// Find linked PO
const po = BBRAUN_DEMO_PO;
console.log(`PO ${po.poNumber} - Source: ${po.sourcePrNumber}`);
```

### 3. Commodity Group Validation

Show how commodity groups are used:

```typescript
import { BBRAUN_MATERIAL } from '@/data/bbraunDemoData';

const validateCommodityGroup = (material: MaterialMaster) => {
  if (material.commodity_group === "D05AA19AE") {
    return {
      valid: true,
      category: "Surgical Clips - Medical Grade",
      approvalRequired: true,
      regulatoryClass: "Class III Medical Device"
    };
  }
};

const result = validateCommodityGroup(BBRAUN_MATERIAL);
```

### 4. Fixed Lot Size Planning

Demonstrate MRP planning with fixed lot sizes:

```typescript
import { BBRAUN_PLANT_DATA } from '@/data/bbraunDemoData';

const checkReorderPoint = (currentStock: number) => {
  const { fixed_lot_size, safety_stock, lead_time_days } = BBRAUN_PLANT_DATA;

  // Calculate reorder point
  const dailyUsage = fixed_lot_size / 90; // Assume 90-day consumption cycle
  const reorderPoint = (dailyUsage * lead_time_days) + safety_stock;

  return {
    shouldReorder: currentStock < reorderPoint,
    orderQuantity: fixed_lot_size,
    reorderPoint: reorderPoint,
    daysOfStock: currentStock / dailyUsage
  };
};

const stockCheck = checkReorderPoint(28500); // Current stock below safety
console.log(stockCheck.shouldReorder);  // true
console.log(stockCheck.orderQuantity);  // 45760
```

### 5. Approval Tier Determination

Show how approval levels are determined by value:

```typescript
import { getApprovalTierForValue } from '@/data/bbraunDemoData';

const prValue = 140940.80;
const tier = getApprovalTierForValue(prValue, 'PR');

console.log(tier?.tier_name);          // "High Value"
console.log(tier?.approvers.length);   // 3
console.log(tier?.notes);              // Explanation why this tier
```

### 6. SLA Monitoring

Track approval SLA status:

```typescript
import { getApprovalSLAStatus, BBRAUN_DEMO_PR } from '@/data/bbraunDemoData';

const workflow = BBRAUN_APPROVAL_WORKFLOW.pl568t_specific_workflow.pr_approval_flow;
const currentStep = workflow.steps[2]; // Step 3: Finance Controller

const slaStatus = getApprovalSLAStatus(
  BBRAUN_DEMO_PR.createdAt,
  currentStep
);

console.log(slaStatus); // "On track" | "At risk" | "Breached"
```

---

## Component Integration Examples

### Display Approval Workflow

```typescript
import { BBRAUN_APPROVAL_WORKFLOW } from '@/data/bbraunDemoData';

function ApprovalStepsComponent() {
  const workflow = BBRAUN_APPROVAL_WORKFLOW.pl568t_specific_workflow.pr_approval_flow;

  return (
    <div>
      <h3>PR Approval Process ({workflow.total_approvers} approvers)</h3>
      <p>Estimated time: {workflow.estimated_total_time_hours} hours</p>

      {workflow.steps.map(step => (
        <div key={step.step}>
          <h4>Step {step.step}: {step.action}</h4>
          <p>Approver: {step.approver}</p>
          <p>Role: {step.role}</p>
          <p>SLA: {step.sla_hours} hours</p>
          <ul>
            {step.checks.map(check => (
              <li key={check}>{check}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
```

### Show Material Details

```typescript
import { BBRAUN_MATERIAL, BBRAUN_PURCHASING } from '@/data/bbraunDemoData';

function MaterialDetailsCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{BBRAUN_MATERIAL.material_code}</CardTitle>
        <CardDescription>{BBRAUN_MATERIAL.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div>
          <strong>Commodity Group:</strong> {BBRAUN_MATERIAL.commodity_group}
        </div>
        <div>
          <strong>Vendor:</strong> {BBRAUN_PURCHASING.vendor_name} ({BBRAUN_PURCHASING.vendor})
        </div>
        <div>
          <strong>Price:</strong> €{BBRAUN_PURCHASING.price_per_unit}/{BBRAUN_MATERIAL.order_uom}
        </div>
        <div>
          <strong>Purchasing Group:</strong> {BBRAUN_PURCHASING.purchasing_group}
        </div>
      </CardContent>
    </Card>
  );
}
```

### Display Audit Trail with Approval Highlights

```typescript
import { formatApprovalHistory } from '@/data/bbraunDemoData';

function AuditTrailComponent({ pr }: { pr: ProcurementPR }) {
  const approvalHistory = formatApprovalHistory(pr.auditTrail);

  return (
    <div>
      <h3>Audit Trail</h3>

      {/* Show all events */}
      {pr.auditTrail.map(event => (
        <div key={event.id} className={
          event.action.toLowerCase().includes('approval')
            ? 'bg-blue-50'
            : ''
        }>
          <span className="font-bold">{event.timestamp.toLocaleString()}</span>
          <span> - {event.action}</span>
          <span className="text-muted-foreground"> by {event.actor}</span>
          <p className="text-sm">{event.details}</p>
          {event.keyDiff && (
            <Badge variant="outline">{event.keyDiff}</Badge>
          )}
        </div>
      ))}

      {/* Approval-specific summary */}
      <div className="mt-4">
        <h4>Approval History</h4>
        {approvalHistory.map((history, idx) => (
          <div key={idx}>{history}</div>
        ))}
      </div>
    </div>
  );
}
```

---

## Data Relationships

### Understanding the Data Flow

```
Material Master (PL568T)
    ↓
Plant Data (DE01) → Fixed Lot Size: 45,760 pieces
    ↓
Purchasing Data → Vendor 1165336 (AESCULAP), Price: €61.6/PAK
    ↓
Purchase Requisition (PR-4546245893)
    ↓ (Approval Workflow)
    ├─ Step 1: Michael Schneider (Technical Review) ✓
    ├─ Step 2: Dr. Andrea Weber (Budget Review) ✓
    └─ Step 3: Stefan Hoffmann (Financial Auth) ⏳ Pending
    ↓ (After all approvals)
Purchase Order (PO-4516638113)
    ↓ (Release Workflow)
    ├─ Step 1: Michael Schneider (Initial Review) ✓
    ├─ Step 2: Dr. Andrea Weber (Manager Approval) ✓
    └─ Step 3: Thomas Becker (Final Release) ✓
    ↓
Dispatch to Supplier (Ready to send)
```

---

## Demo Scenarios

### Scenario 1: Stock Replenishment Trigger

```typescript
// Current stock falls below safety level
const currentStock = 28500;  // pieces
const safetyStock = BBRAUN_PLANT_DATA.safety_stock; // 30440

if (currentStock < safetyStock) {
  // System triggers PR for fixed lot size
  const prQuantity = BBRAUN_PLANT_DATA.fixed_lot_size; // 45760 pieces
  const prQuantityPAK = Math.ceil(prQuantity / BBRAUN_MATERIAL.conversion_factor); // 382 PAK

  console.log(`Stock replenishment triggered!`);
  console.log(`Current: ${currentStock}, Safety: ${safetyStock}`);
  console.log(`Order quantity: ${prQuantityPAK} PAK (${prQuantity} pieces)`);
}
```

### Scenario 2: Approval Escalation

```typescript
const escalationRules = BBRAUN_APPROVAL_WORKFLOW.escalation_rules;

// Check if PR is breaching SLA
const pr = BBRAUN_DEMO_PR;
const ageHours = (new Date().getTime() - pr.createdAt.getTime()) / (1000 * 60 * 60);

if (ageHours > escalationRules.sla_breach.pr_approval.escalation_after_hours) {
  console.log(`⚠️ SLA breach! Escalating to: ${escalationRules.sla_breach.pr_approval.escalate_to}`);
}
```

### Scenario 3: Delegate Assignment

```typescript
const delegates = BBRAUN_APPROVAL_WORKFLOW.approval_delegates.delegates;

const findDelegate = (primaryApprover: string) => {
  const delegation = delegates.find(d => d.primary === primaryApprover);
  return delegation
    ? `${delegation.delegate} (${delegation.delegate_title})`
    : "No delegate configured";
};

console.log(findDelegate("Michael Schneider"));
// Output: "Julia Fischer (Senior Buyer - Medical Consumables)"
```

---

## Testing Checklist

Use this checklist when testing the BBraun demo data integration:

- [ ] PR displays correctly in Procurement module list
- [ ] High-value badge shown for €140k+ amount
- [ ] Commodity group "D05AA19AE" displays in details
- [ ] Cost center "7200" and GL account "400100" are shown
- [ ] Audit trail shows 3 approval steps
- [ ] Linked PO reference "PO-4516638113" appears
- [ ] PO displays with correct supplier "AESCULAP"
- [ ] PO shows source PR "PR-4546245893"
- [ ] Line items show 2,288 PAK at €61.6/PAK
- [ ] Total amount calculated correctly: €140,940.80
- [ ] Approval workflow steps display with approver names
- [ ] SLA hours shown for each approval level
- [ ] Material details show fixed lot size and safety stock

---

## Troubleshooting

### Issue: Approval workflow not showing

**Solution:** Ensure you're importing the approval workflow:

```typescript
import { BBRAUN_APPROVAL_WORKFLOW } from '@/data/bbraunDemoData';
```

### Issue: Amounts not matching

**Check calculation:**
```typescript
const quantity = 2288; // PAK
const price = 61.6;    // EUR/PAK
const total = quantity * price; // Should be 140940.80
```

### Issue: Audit trail timestamps seem old

**This is expected** - The demo data uses relative timestamps (2 days ago, 1 day ago, etc.) to simulate a realistic timeline. Timestamps are calculated relative to `new Date()`.

---

## API Reference

### Types

- `MaterialMaster` - Material master data
- `MaterialPlantData` - Plant-specific MRP data
- `PurchasingData` - Vendor and pricing info
- `ApprovalWorkflow` - Complete approval matrix
- `ApprovalTier` - Single tier in approval matrix
- `ApprovalFlow` - Complete approval process steps
- `ApprovalStep` - Individual approval step

### Functions

- `getApprovalTierForValue(value, type)` - Determine approval tier
- `getCurrentApprovalStep(auditTrail, workflow)` - Get current step
- `getApprovalSLAStatus(createdAt, currentStep)` - Check SLA status
- `formatApprovalHistory(auditTrail)` - Format approval events

### Constants

- `BBRAUN_DEMO_DATASET` - Complete dataset object
- `BBRAUN_MATERIAL` - Material master
- `BBRAUN_PLANT_DATA` - Plant data
- `BBRAUN_PURCHASING` - Purchasing data
- `BBRAUN_APPROVAL_WORKFLOW` - Workflow configuration
- `BBRAUN_DEMO_PR` - Demo purchase requisition
- `BBRAUN_DEMO_PO` - Demo purchase order

---

## Next Steps

1. **Import the demo data** into your procurement module
2. **Test the display** of PR and PO in the UI
3. **Implement approval workflow visualization** using the workflow data
4. **Add commodity group validation** in your gatekeep logic
5. **Create MRP planning demo** using fixed lot size data

---

## Source Data

All data derived from real BBraun SAP extracts for material PL568T. Source files located in:
```
BBraun_Data/Demo_Dataset_PL568T_Enhanced/
```

**Last Updated:** 2026-01-23
**Data Source:** Real BBraun SAP MM/FI Tables
**Approval Workflow:** Based on BBraun 7EF value distribution + industry standards
