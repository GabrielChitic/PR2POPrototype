# BBraun PL568T Data Flow Diagram

## Complete PR→PO Journey Visualization

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         MATERIAL MASTER DATA                            │
│                                                                         │
│  Material: PL568T                                                       │
│  Description: CLIP LIGATURE MED.LARGE 20MAGAS.=120PCS.                 │
│  Commodity Group: D05AA19AE (Surgical Clips - Medical Grade)           │
│  Base UOM: ST (pieces) | Order UOM: PAK (package)                      │
│  Conversion: 120 pieces = 1 PAK                                         │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         PLANT DATA (DE01)                               │
│                                                                         │
│  Fixed Lot Size: 45,760 pieces                                          │
│  Safety Stock: 30,440 pieces                                            │
│  Lead Time: 120 days                                                    │
│  GR Processing: 3 days                                                  │
│  MRP Group: FX (Fixed lot sizing)                                       │
│  Procurement Type: F (External)                                         │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      PURCHASING DATA                                    │
│                                                                         │
│  Vendor: 1165336 - AESCULAP                                             │
│  Info Record: 5301133479                                                │
│  Price: EUR 61.6 per PAK                                                │
│  Purchasing Group: 7EF (Surgical Supplies)                              │
│  Payment Terms: N002                                                    │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    STOCK LEVEL TRIGGER                                  │
│                                                                         │
│  Current Stock: 28,500 pieces                                           │
│  Safety Stock: 30,440 pieces                                            │
│  Status: ⚠️ BELOW SAFETY STOCK                                          │
│                                                                         │
│  → Trigger: Auto-generate PR for Fixed Lot Size                        │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                  PURCHASE REQUISITION CREATED                           │
│                                                                         │
│  PR Number: PR-4546245893                                               │
│  Material: PL568T                                                       │
│  Quantity: 2,288 PAK (274,560 pieces)                                   │
│  Unit Price: EUR 61.6/PAK                                               │
│  Total Value: EUR 140,940.80                                            │
│  Requester: Hans Dietrich (Inventory Planner)                           │
│  Cost Center: 7200 (Medical Supplies Department)                        │
│  GL Account: 400100 (Consumable Medical Supplies)                       │
│  Commodity Group: D05AA19AE                                             │
│  Delivery Date: +120 days (lead time)                                   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      SOURCE DETERMINATION                               │
│                                                                         │
│  System searches for source of supply...                                │
│  ✓ Info Record 5301133479 found                                        │
│  ✓ Vendor: 1165336 (AESCULAP)                                           │
│  ✓ Price: EUR 61.6/PAK (matches info record)                           │
│  ✓ Lead time: 120 days confirmed                                        │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    GATEKEEP VALIDATION                                  │
│                                                                         │
│  ✓ Material specification valid                                         │
│  ✓ Commodity group D05AA19AE confirmed                                  │
│  ✓ Cost center 7200 exists and active                                   │
│  ✓ GL account 400100 valid for entity                                   │
│  ✓ Budget check passed                                                  │
│  ✓ Vendor 1165336 active and approved                                   │
│                                                                         │
│  Status: ALL CHECKS PASSED                                              │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│              APPROVAL TIER DETERMINATION                                │
│                                                                         │
│  PR Value: EUR 140,940.80                                               │
│  Tier Range: EUR 50,000 - EUR 150,000                                   │
│  Tier: 3 - "High Value"                                                 │
│  Approvers Required: 3 levels                                           │
│  Estimated Time: 80 hours                                               │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
        ┌───────────────────────────────────────────┐
        │   PR APPROVAL WORKFLOW (Tier 3)           │
        └───────────────────────────────────────────┘
                        │
        ┌───────────────┴────────────────┐
        │                                │
        ▼                                ▼
┌──────────────────┐          ┌──────────────────┐
│  STEP 1          │          │  STEP 2          │
│                  │          │                  │
│  Michael         │──────────▶  Dr. Andrea      │
│  Schneider       │          │  Weber           │
│                  │          │                  │
│  Senior Buyer    │          │  Procurement     │
│  Surgical        │          │  Manager         │
│  Supplies        │          │                  │
│                  │          │                  │
│  Action:         │          │  Action:         │
│  Technical       │          │  Budget &        │
│  Review          │          │  Compliance      │
│                  │          │  Review          │
│  SLA: 8 hours    │          │  SLA: 24 hours   │
│  Status: ✓ Done  │          │  Status: ✓ Done  │
│  Time: 2h        │          │  Time: 20h       │
└──────────────────┘          └──────────────────┘
                                        │
                                        ▼
                              ┌──────────────────┐
                              │  STEP 3          │
                              │                  │
                              │  Stefan          │
                              │  Hoffmann        │
                              │                  │
                              │  Finance         │
                              │  Controller      │
                              │                  │
                              │  Action:         │
                              │  Financial       │
                              │  Authorization   │
                              │                  │
                              │  SLA: 48 hours   │
                              │  Status: ⏳ Pend │
                              └──────────────────┘
                                        │
                                        ▼
                      ┌──────────────────────────────┐
                      │  ALL APPROVALS COMPLETE      │
                      │  Total time: ~52 hours       │
                      └──────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    PR APPROVED - READY FOR PO                           │
│                                                                         │
│  PR Status: Approved                                                    │
│  Approval Chain Complete: ✓                                             │
│  Next Action: Convert to Purchase Order                                 │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                   PURCHASE ORDER CREATED                                │
│                                                                         │
│  PO Number: PO-4516638113                                               │
│  Source PR: PR-4546245893                                               │
│  Supplier: AESCULAP (1165336)                                           │
│  Quantity: 2,288 PAK                                                    │
│  Unit Price: EUR 61.6/PAK                                               │
│  Total Value: EUR 140,940.80                                            │
│  Incoterms: EXW                                                         │
│  Payment Terms: N002                                                    │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│              PO RELEASE TIER DETERMINATION                              │
│                                                                         │
│  PO Value: EUR 140,940.80                                               │
│  Tier Range: > EUR 100,000                                              │
│  Tier: 4 - "Senior Management"                                          │
│  Release Steps Required: 3 levels                                       │
│  Estimated Time: 76 hours                                               │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
        ┌───────────────────────────────────────────┐
        │   PO RELEASE WORKFLOW (Tier 4)            │
        └───────────────────────────────────────────┘
                        │
        ┌───────────────┴────────────────┐
        │                                │
        ▼                                ▼
┌──────────────────┐          ┌──────────────────┐
│  STEP 1          │          │  STEP 2          │
│                  │          │                  │
│  Michael         │──────────▶  Dr. Andrea      │
│  Schneider       │          │  Weber           │
│                  │          │                  │
│  Senior Buyer    │          │  Procurement     │
│                  │          │  Manager         │
│  Action:         │          │                  │
│  PO Creation     │          │  Action:         │
│  & Review        │          │  PO Release      │
│                  │          │  Level 1         │
│  SLA: 4 hours    │          │                  │
│  Status: ✓ Done  │          │  SLA: 24 hours   │
│  Time: 1h        │          │  Status: ✓ Done  │
└──────────────────┘          │  Time: 6h        │
                              └──────────────────┘
                                        │
                                        ▼
                              ┌──────────────────┐
                              │  STEP 3          │
                              │                  │
                              │  Thomas          │
                              │  Becker          │
                              │                  │
                              │  Director of     │
                              │  Strategic       │
                              │  Sourcing        │
                              │                  │
                              │  Action:         │
                              │  Final PO        │
                              │  Release         │
                              │                  │
                              │  SLA: 48 hours   │
                              │  Status: ✓ Done  │
                              │  Time: 20h       │
                              └──────────────────┘
                                        │
                                        ▼
                      ┌──────────────────────────────┐
                      │  ALL RELEASES COMPLETE       │
                      │  Total time: ~27 hours       │
                      └──────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    PO POSTED TO SAP                                     │
│                                                                         │
│  PO Document: 4516638113 created in SAP MM                              │
│  Status: Active                                                         │
│  Accounting Documents Posted                                            │
│  Purchase History Updated                                               │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    READY FOR DISPATCH                                   │
│                                                                         │
│  Dispatch Method: EDI/IDOC                                              │
│  Recipient: AESCULAP (Vendor 1165336)                                   │
│  Status: Ready to send                                                  │
│  Next Action: Transmit PO to supplier                                   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    DISPATCH TO SUPPLIER                                 │
│                                                                         │
│  PO transmitted via EDI to AESCULAP                                     │
│  Transmission Status: Sent                                              │
│  Awaiting: Order acknowledgment                                         │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                 SUPPLIER CONFIRMATION (Future)                          │
│                                                                         │
│  Expected: Delivery date confirmation                                   │
│  Expected: Quantity confirmation                                        │
│  Lead time: 120 days from PO date                                       │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                 GOODS RECEIPT (Future)                                  │
│                                                                         │
│  Expected Date: +120 days                                               │
│  Quantity: 2,288 PAK (274,560 pieces)                                   │
│  Storage Location: DE01                                                 │
│  Action: Update stock levels                                            │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Approval Matrix Summary

### PR Approval (Tier 3: High Value €50k-€150k)

```
Level 1: Michael Schneider (Senior Buyer)
   ├─ Role: Technical Review
   ├─ SLA: 8 hours
   ├─ Checks: Material spec, vendor, pricing, lead time
   └─ Status: Approved ✓

Level 2: Dr. Andrea Weber (Procurement Manager)
   ├─ Role: Budget & Compliance Review
   ├─ SLA: 24 hours
   ├─ Checks: Budget, commodity group, cost center, spend plan
   └─ Status: Approved ✓

Level 3: Stefan Hoffmann (Finance Controller)
   ├─ Role: Financial Authorization
   ├─ SLA: 48 hours
   ├─ Checks: Final budget, GL account, cost center, payment terms
   └─ Status: Pending ⏳

Total PR Approval Time: ~80 hours (3.3 days)
```

### PO Release (Tier 4: Senior Management >€100k)

```
Level 1: Michael Schneider (Senior Buyer)
   ├─ Role: PO Creation & Initial Review
   ├─ SLA: 4 hours
   ├─ Checks: PO from approved PR, quantities, prices, T&Cs
   └─ Status: Released ✓

Level 2: Dr. Andrea Weber (Procurement Manager)
   ├─ Role: PO Release Level 1
   ├─ SLA: 24 hours
   ├─ Checks: PR approval complete, vendor performance, alerts
   └─ Status: Released ✓

Level 3: Thomas Becker (Director of Strategic Sourcing)
   ├─ Role: Final PO Release
   ├─ SLA: 48 hours
   ├─ Checks: High-value auth, strategic alignment, supplier review
   └─ Status: Released ✓

Total PO Release Time: ~76 hours (3.2 days)
```

---

## Timeline Summary

```
Day 0 (T=0h):   Stock falls below safety level → PR auto-generated
Day 0 (T+2h):   Source determination complete
Day 0 (T+4h):   Gatekeep validation passed
Day 0 (T+4h):   Approval Step 1 (Michael Schneider) - Approved
Day 1 (T+24h):  Approval Step 2 (Dr. Andrea Weber) - Approved
Day 2 (T+52h):  Approval Step 3 (Stefan Hoffmann) - Pending
Day 3 (T+80h):  All PR approvals complete → PO created
Day 3 (T+81h):  PO Release Step 1 (Michael Schneider) - Released
Day 3 (T+87h):  PO Release Step 2 (Dr. Andrea Weber) - Released
Day 4 (T+107h): PO Release Step 3 (Thomas Becker) - Released
Day 4 (T+108h): PO posted to SAP
Day 4 (T+109h): PO ready for dispatch
Day 4 (T+110h): PO dispatched to AESCULAP
Day 124:        Expected goods receipt (+120 days lead time)
```

**Total PR→PO Time:** ~110 hours (~4.6 days)
**Total Lead Time to Delivery:** 124 days

---

## Value Breakdown

```
Quantity Calculation:
├─ Fixed Lot Size: 45,760 pieces (1 reorder cycle)
├─ Standard Order: 274,560 pieces (6× lot size)
└─ Order in PAK: 274,560 ÷ 120 = 2,288 PAK

Price Calculation:
├─ Unit Price: EUR 61.6 per PAK
├─ Order Quantity: 2,288 PAK
└─ Total Value: 2,288 × 61.6 = EUR 140,940.80

Cost Allocation:
├─ Cost Center: 7200 (Medical Supplies Department)
├─ GL Account: 400100 (Consumable Medical Supplies)
└─ Commodity Group: D05AA19AE (Surgical Clips)
```

---

## Key Data Points Reference

| Field | Value | Source |
|-------|-------|--------|
| Material | PL568T | SAP MARA table |
| Description | CLIP LIGATURE MED.LARGE 20MAGAS.=120PCS. | SAP MARA table |
| Commodity Group | D05AA19AE | SAP MARA table ✅ |
| Fixed Lot Size | 45,760 pieces | SAP MARC table ✅ |
| Safety Stock | 30,440 pieces | SAP MARC table ✅ |
| Lead Time | 120 days | SAP MARC table ✅ |
| Vendor | 1165336 (AESCULAP) | SAP EINA/LFA1 tables ✅ |
| Price | EUR 61.6/PAK | SAP EINA table ✅ |
| Purchasing Group | 7EF | SAP EINA table ✅ |
| Plant | DE01 | SAP MARC table ✅ |
| PR Number | PR-4546245893 | SAP EBAN table ✅ |
| PO Number | PO-4516638113 | SAP EKKO table ✅ |
| Total Amount | EUR 140,940.80 | Calculated ✅ |
| Cost Center | 7200 | Demo value (EKKN not in extract) |
| GL Account | 400100 | Demo value (EKKN not in extract) |
| Approvers | Michael/Andrea/Stefan/Thomas | Demo names (users not in extract) |

✅ = Real BBraun SAP data
Demo value = Realistic but not from BBraun extracts

---

## Data Architecture

```
TypeScript Interfaces:
├─ MaterialMaster           (Material code, description, commodity group)
├─ MaterialPlantData        (Fixed lot, safety stock, lead time, MRP)
├─ PurchasingData          (Vendor, price, info record, payment terms)
├─ ApprovalWorkflow        (Approval matrix configuration)
│   ├─ ApprovalTier        (Value ranges, approvers for tier)
│   ├─ ApprovalFlow        (Complete approval process)
│   └─ ApprovalStep        (Individual step details)
├─ ProcurementPR           (Purchase requisition)
│   ├─ LineItems           (Material, quantity, price)
│   └─ AuditEvent[]        (Approval history, actions)
└─ ProcurementPO           (Purchase order)
    ├─ LineItems           (Material, quantity, price)
    └─ AuditEvent[]        (Release history, actions)

Helper Functions:
├─ getApprovalTierForValue()     → Determine tier by amount
├─ getCurrentApprovalStep()      → Find current pending step
├─ getApprovalSLAStatus()        → Check if on track/at risk/breached
└─ formatApprovalHistory()       → Format audit trail for display
```

---

**Created:** 2026-01-23
**Source:** Real BBraun SAP MM/FI Data + Industry-standard approval workflows
**Location:** `/src/data/bbraunDemoData.ts`
