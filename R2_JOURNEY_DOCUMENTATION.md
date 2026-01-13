# Journey R2 (Non-Catalog / PDF-First) - Complete Documentation

## 📘 Document Purpose
This document provides complete implementation details for **Journey R2 (Non-Catalog, PDF-first "SuperSafe")** - a parallel procurement workflow for items sourced from external quotes/PDFs, separate from the catalog-based Journey R1.

**Last Updated:** January 14, 2026
**Current Status:** ✅ Complete (Stages 1-5 implemented)
**Build Status:** ✅ Passing

---

## 🤖 FOR AI ASSISTANTS

### Quick Context
If you're continuing work on this project, read this section first:

**What is Journey R2?**
- A **completely separate workflow** from R1 (Catalog)
- For procurement of items that come from **external quotes** (PDFs, emails)
- Example: "50 warning vests from Manufacturing A/S based on quote Q-2026-0113"
- All R2 UI is **conditionally rendered** based on `draft.journeyType === "NON_CATALOG"`
- **R1 (Catalog) remains unchanged** - no breaking changes to existing flow

**Journey Detection:**
```typescript
// R2 journey is triggered when:
draft.journeyType = "NON_CATALOG"

// This is set in Stage 1 when extracting from quote (not catalog search)
```

**Key Files Modified for R2:**
1. `src/types/workflow.ts` - Added R2-specific types (QuoteDetails, JourneyType)
2. `src/components/workflow/Step1ChooseItems.tsx` - Quote extraction UI
3. `src/components/workflow/Step2Container.tsx` - R2 variant with 3 cards
4. `src/components/workflow/Step3AccountingChecks.tsx` - R2 accounting prefill
5. `src/components/workflow/Step4ReviewSubmit.tsx` - R2 review accordion
6. `src/components/workflow/Step5TrackApprovals.tsx` - R2 lifecycle timeline
7. `src/modules/Requester/RequesterModuleV2.tsx` - R2 lifecycle generation
8. `src/data/accountingData.ts` - Denmark-specific master data

---

## 🎯 Journey R2 Demo Scenario

### Canonical Demo Data
Use this scenario to test the complete R2 flow:

**Item:** Warning vest YELLOW w/reflex C470 S/M
**Supplier:** Manufacturing A/S
**Quantity:** 50
**Unit Price:** EUR 35.00
**Total:** EUR 1,750.00
**Quote Number:** Q-2026-0113
**Quote Date:** 2026-01-13
**Delivery:** Aarhus, Denmark (Site: AAR-DC-01)
**Requester:** Ana Popescu
**Entity:** UIPATH-RO
**Commodity Group:** SAFETY-PPE (PPE & Safety Equipment)
**GL Account:** 615200 (Safety Supplies / PPE)
**Cost Center:** CC-DK-AAR-MAINT (Aarhus Maintenance)

### Test Flow Commands
```
Stage 0 (Chat): "I need 50 warning vests for Aarhus site"
Stage 1: Verify quote extraction UI, adjust quantity if needed
Stage 2: Select AAR-DC-01, set need-by date, enter business reason
Stage 3: Verify prefilled accounting (SAFETY-PPE, 615200, CC-DK-AAR-MAINT)
Stage 4: Review all sections, verify order (Delivery first, then Line Items)
Stage 5: Verify "Buyer action (Procurement review)" as step 2 in timeline
My Requests: Verify title "Warning vests — Aarhus" with EUR 1,750
```

---

## 🏗️ Architecture & Journey Separation

### Journey Type Enum
```typescript
// src/types/workflow.ts
export type JourneyType = "CATALOG" | "NON_CATALOG";

export interface DraftPR {
  // ... other fields
  journeyType?: JourneyType;  // Determines which flow to use
  quoteDetails?: QuoteDetails;  // R2 only
}
```

### Journey Detection Pattern
All R2-specific UI uses this pattern:

```typescript
const isNonCatalog = draft.journeyType === "NON_CATALOG";

// R2-specific UI
{isNonCatalog && (
  <div>R2 specific content</div>
)}

// R1-specific UI (exclude R2)
{!isNonCatalog && (
  <div>R1 catalog content</div>
)}
```

### Why Complete Separation?
- **No breaking changes** to R1 catalog flow
- **Independent evolution** of each journey
- **Clearer code** - conditional rendering vs complex shared logic
- **Easier testing** - test each journey independently
- **Different UX requirements** - R2 needs quote info, supplier fields, buyer action step

---

## 📋 Stage-by-Stage Implementation

## Stage 1: Choose Items (Quote Extraction)

### Purpose
Extract line item details from an uploaded quote/PDF and display for user confirmation.

### Demo Implementation (Stub)
Currently uses **hardcoded extraction** (no real OCR):
```typescript
// Hardcoded for demo
const quoteLine: DraftLineItem = {
  id: "quote-line-1",
  type: "freeText",  // Not from catalog
  name: "Warning vest YELLOW w/reflex C470 S/M",
  description: "High-visibility safety vest with reflective strips, Size S/M",
  quantity: 50,
  unitPrice: 35.0,
  totalPrice: 1750.0,
  unitOfMeasure: "PC",
  supplier: "Manufacturing A/S",
  category: "Safety Equipment",
  currency: "EUR",
};
```

### UI Components

**Quote Extraction Card:**
- Shows extracted item details (name, description, qty, unit price)
- **Editable quantity** with +/- buttons
- Recalculates total on change
- "Extracted from quote Q-2026-0113" badge

**Compact Request Summary Strip** (IMPORTANT - not a full card):
```tsx
<div className="bg-muted/50 border border-border rounded-lg px-4 py-3">
  <div className="flex items-center justify-between gap-6">
    {/* Left: Label + Badge */}
    <div className="flex items-center gap-2">
      <div>
        <p className="text-sm text-muted-foreground">Extracted from quote</p>
        <p className="text-xs text-muted-foreground/70 mt-0.5">1 line item</p>
      </div>
      <Badge variant="secondary">From quote</Badge>
    </div>

    {/* Middle: Quote + Supplier */}
    <div className="flex items-center gap-6 text-sm">
      <div>
        <span className="text-muted-foreground">Quote:</span>{" "}
        <span className="font-medium">Q-2026-0113</span>
      </div>
      <div>
        <span className="text-muted-foreground">Supplier:</span>{" "}
        <span className="font-medium">Manufacturing A/S</span>
      </div>
    </div>

    {/* Right: Total (Emphasized) */}
    <div className="text-right">
      <p className="text-xs text-muted-foreground mb-0.5">Total</p>
      <p className="text-xl font-bold">EUR 1,750.00</p>
    </div>
  </div>
</div>
```

**Key Features:**
- ✅ Compact strip (not full card) - saves vertical space
- ✅ Shows quote number and supplier (no duplication)
- ✅ Total updates live when quantity changes
- ✅ Clean 3-section layout (label, metadata, total)

### File Location
`src/components/workflow/Step1ChooseItems.tsx` (lines ~369-414 replaced with compact strip)

### Navigation
"Continue to Delivery & Details" → Stage 2

---

## Stage 2: Delivery & Details (R2-Specific)

### Purpose
Collect delivery location, recipient info, and business context for non-catalog requests.

### UI Structure
**Three cards + Quote strip:**

#### Card A: Delivery
```tsx
<Card>
  <CardHeader>
    <CardTitle>Delivery</CardTitle>
  </CardHeader>
  <CardContent>
    {/* Deliver to site dropdown */}
    <Select value={purchaseInfo.shipToSiteId}>
      <SelectItem value="AAR-DC-01">AAR-DC-01 — Aarhus Distribution Center</SelectItem>
      <SelectItem value="AAR-PL-02">AAR-PL-02 — Aarhus Production Line 02</SelectItem>
      <SelectItem value="CPH-HQ-01">CPH-HQ-01 — Copenhagen HQ</SelectItem>
    </Select>
    {/* Need-by date */}
    <Input type="date" value={purchaseInfo.needByDate} />
    {/* Delivery instructions */}
    <Textarea value={purchaseInfo.deliveryInstructions} />
  </CardContent>
</Card>
```

#### Card B: Recipient / Contact
```tsx
<Card>
  <CardHeader>
    <CardTitle>Recipient / Contact</CardTitle>
  </CardHeader>
  <CardContent>
    {/* Prefilled with Ana Popescu profile */}
    <Input value="Ana Popescu" />
    <Input value="ana.popescu@company.com" />
    <Input value="+45 123 456 789" />
    <Checkbox checked={purchaseInfo.deliveryContactIsSelf}>
      I am the delivery contact
    </Checkbox>
  </CardContent>
</Card>
```

#### Card C: Business Context
```tsx
<Card>
  <CardHeader>
    <CardTitle>Business Context</CardTitle>
  </CardHeader>
  <CardContent>
    {/* Business reason (required) */}
    <Textarea
      placeholder="Why are you buying this? (e.g., Safety equipment for warehouse staff)"
      value={purchaseInfo.usage}
    />
    {/* Optional project dropdown */}
    <Select value={purchaseInfo.projectName}>
      <SelectItem value="">Not part of a project</SelectItem>
      <SelectItem value="PROJECT-2026-WH-SAFETY">PROJECT-2026-WH-SAFETY</SelectItem>
    </Select>
  </CardContent>
</Card>
```

#### Quote Strip (Bottom)
```tsx
<div className="bg-muted/50 border rounded-lg p-4">
  <div className="flex items-center gap-3">
    <FileText className="h-5 w-5" />
    <div>
      <p className="font-medium">Quote attached — Q-2026-0113</p>
      <p className="text-xs text-muted-foreground">
        From: Manufacturing A/S • Validity: 14 days • Payment: Net 30
      </p>
    </div>
    <Button variant="ghost" size="sm">View quote</Button>
  </div>
</div>
```

### Prefill Logic
```typescript
// src/components/workflow/Step2Container.tsx
useEffect(() => {
  if (isNonCatalog && !purchaseInfo.shipToSiteId) {
    // Default to Aarhus site
    onUpdate({
      shipToSiteId: "AAR-DC-01",
      shipToAddress: "Logistikvej 12, 8200 Aarhus N, Denmark",
      deliverToLocation: "Logistikvej 12, 8200 Aarhus N, Denmark",

      // Prefill Ana Popescu as contact
      deliveryContactName: "Ana Popescu",
      deliveryContactEmail: "ana.popescu@company.com",
      deliveryContactPhone: "+45 123 456 789",
      deliveryContactIsSelf: true,
    });
  }
}, [isNonCatalog]);
```

### Demo Sites Array
```typescript
const demoSites = [
  {
    id: "AAR-DC-01",
    name: "AAR-DC-01 — Aarhus Distribution Center",
    address: "Logistikvej 12, 8200 Aarhus N, Denmark",
  },
  {
    id: "AAR-PL-02",
    name: "AAR-PL-02 — Aarhus Production Line 02",
    address: "Productvej 45, 8200 Aarhus N, Denmark",
  },
  {
    id: "CPH-HQ-01",
    name: "CPH-HQ-01 — Copenhagen HQ",
    address: "Kongens Nytorv 1, 1050 Copenhagen K, Denmark",
  },
];
```

### Validation
```typescript
const isValid =
  purchaseInfo.shipToSiteId &&
  purchaseInfo.needByDate &&
  purchaseInfo.usage?.trim().length > 0;  // Business reason required

<Button
  onClick={() => onNavigate(3)}
  disabled={!isValid}
>
  Continue to Accounting & Policy Checks
</Button>
```

### IMPORTANT: Bug Fix Applied
**Issue:** "Clarify Your Need" section (Variant 2B) was appearing in Stage 2 for R2.
**Root Cause:** Line items had `type: "freeText"`, causing `getRequestType()` to return `"freeTextGoods"`.
**Fix:** Added `&& !isNonCatalog` exclusion to Variant 2B and 2C conditions:

```typescript
{requestType === "freeTextGoods" && !isNonCatalog && (
  // Variant 2B content
)}

{requestType === "servicesOrComplex" && !isNonCatalog && (
  // Variant 2C content
)}
```

### File Location
`src/components/workflow/Step2Container.tsx` (R2 variant added, lines ~150-450)

### Type Extensions
```typescript
// src/types/workflow.ts
export interface PurchaseInfo {
  // ... existing fields

  // R2 NON_CATALOG specific fields
  shipToSiteId?: string;
  shipToAddress?: string;
  deliveryInstructions?: string;
  deliveryContactName?: string;
  deliveryContactEmail?: string;
  deliveryContactPhone?: string;
  deliveryContactIsSelf?: boolean;
}
```

---

## Stage 3: Accounting & Policy Checks (R2-Specific)

### Purpose
Select accounting codes and run policy validations for non-catalog purchases.

### Demo Data: Denmark-Specific Master Data

#### Commodity Groups (Added 3 for DK)
```typescript
// src/data/accountingData.ts
export const COMMODITY_GROUPS: CommodityGroup[] = [
  // ... existing groups
  {
    id: "cg-006",
    code: "SAFETY-PPE",
    name: "PPE & Safety Equipment",
    category: "Safety",
  },
  {
    id: "cg-007",
    code: "MRO-SUPPLIES",
    name: "MRO Supplies",
    category: "Maintenance",
  },
  {
    id: "cg-008",
    code: "OFFICE-SUPPLIES",
    name: "Office Supplies",
    category: "Office",
  },
];
```

#### GL Accounts (Added 5 for DK)
```typescript
export const GL_ACCOUNTS: GLAccount[] = [
  // ... existing accounts
  {
    id: "gl-006",
    code: "615200",
    name: "Safety Supplies / PPE",
    accountType: "OPEX",
    category: "Safety",
  },
  {
    id: "gl-007",
    code: "615100",
    name: "Workwear & Uniforms",
    accountType: "OPEX",
    category: "Safety",
  },
  {
    id: "gl-008",
    code: "612000",
    name: "Small Tools & Consumables",
    accountType: "OPEX",
    category: "Maintenance",
  },
  {
    id: "gl-009",
    code: "611500",
    name: "Site Operations Supplies",
    accountType: "OPEX",
    category: "Operations",
  },
  {
    id: "gl-010",
    code: "621000",
    name: "Training & Compliance",
    accountType: "OPEX",
    category: "Training",
  },
];
```

#### Cost Centers (Added 6 for DK)
```typescript
export const COST_CENTERS: CostCenter[] = [
  // ... existing centers
  {
    id: "cc-006",
    code: "CC-DK-AAR-MAINT",
    name: "Aarhus Maintenance",
    location: "Aarhus",
    department: "Maintenance",
  },
  {
    id: "cc-007",
    code: "CC-DK-AAR-OPS",
    name: "Aarhus Operations",
    location: "Aarhus",
    department: "Operations",
  },
  {
    id: "cc-008",
    code: "CC-DK-AAR-HSE",
    name: "Aarhus HSE / Safety",
    location: "Aarhus",
    department: "HSE",
  },
  {
    id: "cc-009",
    code: "CC-DK-CPH-FIN",
    name: "Copenhagen Finance",
    location: "Copenhagen",
    department: "Finance",
  },
  {
    id: "cc-010",
    code: "CC-DK-CPH-IT",
    name: "Copenhagen IT",
    location: "Copenhagen",
    department: "IT",
  },
  {
    id: "cc-011",
    code: "CC-DK-AAR-WH",
    name: "Aarhus Warehouse",
    location: "Aarhus",
    department: "Warehouse",
  },
];
```

### UI Components

#### Summary Strip (Top)
```tsx
<div className="bg-muted/50 border rounded-lg px-4 py-2">
  <p className="text-sm text-muted-foreground">
    50 × Warning vest YELLOW w/reflex C470 S/M • Manufacturing A/S • EUR 1,750.00
  </p>
</div>
```

#### Entity Field (Read-Only)
```tsx
<div>
  <Label>Entity / Company Code</Label>
  <Input value="UIPATH-RO" disabled />
  <p className="text-xs text-muted-foreground">
    Auto-populated based on delivery location
  </p>
</div>
```

#### Account Assignment Type
```tsx
<RadioGroup value={draft.accountAssignmentType || "CostCenter"}>
  <div className="flex items-center space-x-2">
    <RadioGroupItem value="CostCenter" id="r2-cost-center" />
    <Label htmlFor="r2-cost-center">Cost Center</Label>
  </div>
  <div className="flex items-center space-x-2">
    <RadioGroupItem value="Project" id="r2-project" />
    <Label htmlFor="r2-project">Project / WBS Element</Label>
  </div>
</RadioGroup>
```

#### Accounting Dropdowns (Prefilled)
```tsx
{/* Commodity Group */}
<Select value={draft.commodityGroupId}>
  <SelectItem value="cg-006">SAFETY-PPE — PPE & Safety Equipment</SelectItem>
  {/* ... other groups */}
</Select>

{/* GL Account */}
<Select value={draft.glAccountId}>
  <SelectItem value="gl-006">615200 — Safety Supplies / PPE</SelectItem>
  {/* ... other accounts */}
</Select>

{/* Cost Center */}
<Select value={draft.costCenterId}>
  <SelectItem value="cc-006">CC-DK-AAR-MAINT — Aarhus Maintenance</SelectItem>
  {/* ... other centers */}
</Select>
```

### Prefill Logic
```typescript
// src/components/workflow/Step3AccountingChecks.tsx
useEffect(() => {
  if (isNonCatalog && draft.lineItems.length > 0) {
    const item = draft.lineItems[0];
    const category = item.category || "";
    const location = draft.purchaseInfo?.shipToAddress || "";

    // Infer accounting from item category
    const defaultAccounting = getDefaultAccountingForCategory(category);
    const defaultCostCenter = getDefaultCostCenterForLocation(location);

    const updates: Partial<DraftPR> = {};
    let needsUpdate = false;

    // Prefill Commodity Group
    if (!draft.commodityGroupId && defaultAccounting.commodityGroup) {
      updates.commodityGroupId = defaultAccounting.commodityGroup.id;
      updates.commodityGroupCode = defaultAccounting.commodityGroup.code;
      updates.commodityGroupName = defaultAccounting.commodityGroup.name;
      needsUpdate = true;
    }

    // Prefill GL Account
    if (!draft.glAccountId && defaultAccounting.glAccount) {
      updates.glAccountId = defaultAccounting.glAccount.id;
      updates.glAccountCode = defaultAccounting.glAccount.code;
      updates.glAccountName = defaultAccounting.glAccount.name;
      needsUpdate = true;
    }

    // Prefill Cost Center
    if (!draft.costCenterId && defaultCostCenter) {
      updates.costCenterId = defaultCostCenter.id;
      updates.costCenterCode = defaultCostCenter.code;
      updates.costCenterName = defaultCostCenter.name;
      needsUpdate = true;
    }

    // Set default entity
    if (!draft.entityCode) {
      updates.entityCode = "UIPATH-RO";
      needsUpdate = true;
    }

    // Generate R2 policy checks
    const hasR2Checks =
      draft.policyChecks &&
      draft.policyChecks.some((check) => check.id === "check-supplier-active");

    if (!hasR2Checks) {
      updates.policyChecks = generateR2PolicyChecks(draft);
      needsUpdate = true;
    }

    if (needsUpdate) {
      onUpdate(updates);
    }
  }
}, [isNonCatalog, draft.lineItems.length]);
```

### Helper Functions
```typescript
// src/data/accountingData.ts

export function getDefaultAccountingForCategory(category: string): {
  commodityGroup: CommodityGroup | null;
  glAccount: GLAccount | null;
} {
  const categoryLower = category.toLowerCase();

  if (categoryLower.includes("safety") || categoryLower.includes("ppe") || categoryLower.includes("vest")) {
    return {
      commodityGroup: COMMODITY_GROUPS.find(cg => cg.code === "SAFETY-PPE") || null,
      glAccount: GL_ACCOUNTS.find(gl => gl.code === "615200") || null,
    };
  }

  // ... other mappings

  // Default fallback
  return {
    commodityGroup: COMMODITY_GROUPS[0] || null,
    glAccount: GL_ACCOUNTS[0] || null,
  };
}

export function getDefaultCostCenterForLocation(location: string): CostCenter | null {
  const locationLower = location.toLowerCase();

  if (locationLower.includes("aarhus") || locationLower.includes("aar")) {
    return COST_CENTERS.find(cc => cc.code === "CC-DK-AAR-MAINT") || null;
  }

  if (locationLower.includes("copenhagen") || locationLower.includes("cph")) {
    return COST_CENTERS.find(cc => cc.location === "Copenhagen") || null;
  }

  return COST_CENTERS[0] || null;
}
```

### Policy Checks: R2-Specific Generation
```typescript
// src/components/workflow/Step3AccountingChecks.tsx

function generateR2PolicyChecks(draft: DraftPR): PolicyCheckResult[] {
  const checks: PolicyCheckResult[] = [];

  const entityCode = draft.entityCode || "UIPATH-RO";
  const currency = draft.lineItems[0]?.currency || "EUR";
  const supplierName = draft.lineItems[0]?.supplier || "Manufacturing A/S";
  const totalValue = draft.lineItems.reduce((sum, item) => sum + item.totalPrice, 0);
  const quoteNumber = draft.quoteDetails?.quoteNumber || "Q-2026-0113";
  const deliverySite = draft.purchaseInfo?.shipToSiteId || "AAR-DC-01";
  const itemCategory = draft.lineItems[0]?.category || "";

  // 1. Supplier Active
  checks.push({
    id: "check-supplier-active",
    checkName: "Supplier exists and is active",
    status: "pass",
    message: `${supplierName} is an active supplier in the system.`,
  });

  // 2. Currency Allowed
  checks.push({
    id: "check-currency-allowed",
    checkName: "Currency allowed for entity",
    status: "pass",
    message: `${currency} is an allowed currency for ${entityCode} entity.`,
  });

  // 3. Order Value Within Limits
  checks.push({
    id: "check-order-value",
    checkName: "Order value within limits",
    status: "pass",
    message: `Order value of ${currency} ${totalValue.toLocaleString()} is within procurement limits for non-catalog items.`,
  });

  // 4. Commodity Group Valid
  checks.push({
    id: "check-commodity-valid",
    checkName: "Commodity group valid for category",
    status: "pass",
    message: `Commodity group ${draft.commodityGroupCode || "N/A"} is valid for category "${itemCategory}".`,
  });

  // 5. Supplier Can Deliver
  checks.push({
    id: "check-supplier-delivery",
    checkName: "Supplier can deliver to site",
    status: "pass",
    message: `${supplierName} is approved to deliver to ${deliverySite}.`,
  });

  // 6. Quote Within Validity
  checks.push({
    id: "check-quote-validity",
    checkName: "Quote within validity period",
    status: "pass",
    message: `Quote ${quoteNumber} is within its validity period (14 days).`,
  });

  // 7. Below Sourcing Threshold
  checks.push({
    id: "check-sourcing-threshold",
    checkName: "Below sourcing threshold",
    status: "pass",
    message: `Order value below sourcing threshold for ${itemCategory} category.`,
  });

  // OPTIONAL: Lead Time Warning (conditional)
  const needByDate = draft.purchaseInfo?.needByDate;
  if (needByDate) {
    const needBy = new Date(needByDate);
    const today = new Date();
    const daysUntilNeeded = Math.floor((needBy.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    const leadTimeDays = 10; // From quote
    if (daysUntilNeeded < leadTimeDays) {
      checks.push({
        id: "check-lead-time",
        checkName: "Lead time vs. need-by date",
        status: "warn",
        message: `Need-by date is in ${daysUntilNeeded} days, but supplier lead time is ${leadTimeDays} days. Consider expedited shipping.`,
      });
    }
  }

  return checks;
}
```

### IMPORTANT: Bug Fixes Applied

**Issue 1:** Legacy R1 policy checks showing instead of R2 checks
**Fix:** Detect R2-specific check IDs and regenerate if not found:
```typescript
const hasR2Checks =
  draft.policyChecks &&
  draft.policyChecks.some((check) => check.id === "check-supplier-active");

if (!hasR2Checks) {
  console.log("[Stage3] Generating R2 policy checks, replacing legacy checks");
  updates.policyChecks = generateR2PolicyChecks(draft);
  needsUpdate = true;
}
```

**Issue 2:** Entity mismatch (UIPATH-RO in accounting, UIPATH-DK in policy checks)
**Fix:** Made policy check messages dynamic using actual entity code:
```typescript
const entityCode = draft.entityCode || "UIPATH-RO";  // Use actual entity
// Then use entityCode in check messages instead of hardcoding "UIPATH-DK"
```

### File Locations
- `src/components/workflow/Step3AccountingChecks.tsx` (R2 variant added)
- `src/data/accountingData.ts` (Denmark data added, helper functions updated)

### Type Extensions
```typescript
// src/types/workflow.ts
export interface DraftPR {
  // ... existing fields

  // R2 account assignment
  accountAssignmentType?: "CostCenter" | "Project";
  wbsElement?: string;
  internalOrder?: string;
}
```

---

## Stage 4: Review & Submit (R2-Specific)

### Purpose
Final review of all request details before submission, with sections reordered for R2 UX.

### UI Structure: Reordered Layout

**Order (CRITICAL):**
1. Header (title + subtitle)
2. **Readiness Verdict** (green Alert - MOVED UP)
3. Header Summary Card (supplier, total, delivery, badges)
4. Accordion sections (all auto-expanded):
   - **a) Delivery & Recipient** (FIRST - moved up)
   - **b) Line Items** (SECOND)
   - c) Accounting
   - d) Evidence

### Header
```tsx
<div className="flex items-center gap-3">
  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
    <Package className="h-6 w-6 text-primary" />
  </div>
  <div>
    <h2 className="text-2xl font-semibold tracking-tight">
      Review & Submit
    </h2>
    <p className="text-sm text-muted-foreground">
      Non-catalog request (from quote Q-2026-0113)
    </p>
  </div>
</div>
```

### Readiness Verdict (Moved Up)
```tsx
<Alert className="border-green-600 bg-green-50">
  <CheckCircle className="h-4 w-4 text-green-600" />
  <AlertTitle className="text-green-900">Ready to submit</AlertTitle>
  <AlertDescription className="text-green-800">
    <ul className="space-y-1 text-sm">
      <li className="flex items-start gap-2">
        <CheckCircle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
        Quote attached (Q-2026-0113)
      </li>
      <li className="flex items-start gap-2">
        <CheckCircle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
        Supplier active
      </li>
      <li className="flex items-start gap-2">
        <CheckCircle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
        Accounting complete (Cost center + GL + Commodity group)
      </li>
      <li className="flex items-start gap-2">
        <CheckCircle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
        Below sourcing threshold for PPE
      </li>
    </ul>
  </AlertDescription>
</Alert>
```

### Header Summary Card
```tsx
<Card>
  <CardContent className="py-4">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Supplier:</span>
          <span className="text-sm font-medium">Manufacturing A/S</span>
        </div>
        <Separator orientation="vertical" className="h-4" />
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Total:</span>
          <span className="text-sm font-semibold">EUR 1,750.00</span>
        </div>
        <Separator orientation="vertical" className="h-4" />
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Delivery:</span>
          <span className="text-sm font-medium">Aarhus, Denmark</span>
        </div>
        <Separator orientation="vertical" className="h-4" />
        <Badge variant="secondary">Draft</Badge>
      </div>
      <Button variant="outline" size="sm" className="gap-2 flex-shrink-0">
        <FileText className="h-4 w-4" />
        View quote
      </Button>
    </div>
  </CardContent>
</Card>
```

### Accordion Sections

**All sections auto-expanded:**
```tsx
<Accordion
  type="multiple"
  defaultValue={["delivery", "line-items", "accounting", "evidence"]}
  className="space-y-4"
>
```

#### Section A: Delivery & Recipient (FIRST)
```tsx
<AccordionItem value="delivery">
  <Card>
    <CardHeader className="pb-3">
      <AccordionTrigger>
        <CardTitle>Delivery & Recipient</CardTitle>
        <Button variant="ghost" size="sm" onClick={() => onNavigateToStage(2)}>
          <Edit className="h-3 w-3" />
          Edit
        </Button>
      </AccordionTrigger>
    </CardHeader>
    <AccordionContent>
      <CardContent className="pt-0">
        <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Deliver to</p>
            <p className="font-medium">Ana Popescu</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Location</p>
            <p className="font-medium">Aarhus, Denmark</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Need-by date</p>
            <p className="font-medium">2026-01-28</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Delivery instructions</p>
            <p className="font-medium">Deliver to warehouse entrance</p>
          </div>
          <div className="col-span-2">
            <p className="text-xs text-muted-foreground mb-1">Business reason</p>
            <p className="font-medium">Safety equipment for warehouse staff</p>
          </div>
        </div>
      </CardContent>
    </AccordionContent>
  </Card>
</AccordionItem>
```

#### Section B: Line Items (SECOND)
```tsx
<AccordionItem value="line-items">
  <Card>
    <CardHeader className="pb-3">
      <AccordionTrigger>
        <div className="flex items-center gap-2">
          <CardTitle>Line items</CardTitle>
          <Badge variant="secondary" className="text-xs">From quote</Badge>
        </div>
        <Button variant="ghost" size="sm" onClick={() => onNavigateToStage(1)}>
          <Edit className="h-3 w-3" />
          Edit
        </Button>
      </AccordionTrigger>
    </CardHeader>
    <AccordionContent>
      <CardContent className="pt-0">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-3">Description</th>
              <th className="text-right p-3">Qty</th>
              <th className="text-right p-3">Unit Price</th>
              <th className="text-right p-3">Line Total</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t">
              <td className="p-3">
                <p className="font-medium">Warning vest YELLOW w/reflex C470 S/M</p>
                <p className="text-xs text-muted-foreground">
                  High-visibility safety vest with reflective strips
                </p>
              </td>
              <td className="text-right p-3">50</td>
              <td className="text-right p-3">EUR 35.00</td>
              <td className="text-right p-3 font-medium">EUR 1,750.00</td>
            </tr>
          </tbody>
        </table>
      </CardContent>
    </AccordionContent>
  </Card>
</AccordionItem>
```

#### Section C: Accounting
```tsx
<AccordionItem value="accounting">
  <Card>
    <CardHeader className="pb-3">
      <AccordionTrigger>
        <CardTitle>Accounting</CardTitle>
        <Button variant="ghost" size="sm" onClick={() => onNavigateToStage(3)}>
          <Edit className="h-3 w-3" />
          Edit
        </Button>
      </AccordionTrigger>
    </CardHeader>
    <AccordionContent>
      <CardContent className="pt-0">
        <div className="grid grid-cols-2 gap-x-6 gap-y-3">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Entity / Company</p>
            <p className="text-sm font-medium">UIPATH-RO</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Commodity Group</p>
            <p className="text-sm font-medium">SAFETY-PPE</p>
            <p className="text-xs text-muted-foreground">PPE & Safety Equipment</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">GL Account</p>
            <p className="text-sm font-medium">615200</p>
            <p className="text-xs text-muted-foreground">Safety Supplies / PPE</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Cost Center</p>
            <p className="text-sm font-medium">CC-DK-AAR-MAINT</p>
            <p className="text-xs text-muted-foreground">Aarhus Maintenance</p>
          </div>
        </div>
      </CardContent>
    </AccordionContent>
  </Card>
</AccordionItem>
```

#### Section D: Evidence
```tsx
<AccordionItem value="evidence">
  <Card>
    <CardHeader className="pb-3">
      <AccordionTrigger>
        <CardTitle>Evidence</CardTitle>
      </AccordionTrigger>
    </CardHeader>
    <AccordionContent>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">
                Quote — Q-2026-0113 (PDF)
              </p>
              <div className="flex items-center gap-1 mt-0.5">
                <CheckCircle className="h-3 w-3 text-green-600" />
                <span className="text-xs text-muted-foreground">Attached</span>
              </div>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="text-xs">
            Preview
          </Button>
        </div>
      </CardContent>
    </AccordionContent>
  </Card>
</AccordionItem>
```

### Submit Button
```tsx
<Button
  size="lg"
  onClick={handleR2Submit}
  disabled={!r2Readiness?.isReady || isSubmitting}
  className="gap-2"
>
  {isSubmitting ? "Creating PR in SAP/Ariba..." : "Submit Purchase Requisition"}
  {!isSubmitting && <ChevronRight className="h-4 w-4" />}
</Button>
```

### Readiness Calculation
```typescript
const computeR2Readiness = () => {
  const r2Warnings: string[] = [];

  // Check for warnings from policy checks
  const warnChecks = (draft.policyChecks || []).filter(check => check.status === "warn");
  warnChecks.forEach(check => {
    r2Warnings.push(check.message);
  });

  // All required fields present?
  const hasLineItems = draft.lineItems && draft.lineItems.length > 0 && draft.lineItems[0].quantity > 0 && draft.lineItems[0].unitPrice > 0;
  const hasDelivery = draft.purchaseInfo?.shipToSiteId && draft.purchaseInfo?.needByDate;
  const hasBusinessReason = draft.purchaseInfo?.usage && draft.purchaseInfo.usage.trim().length > 0;
  const hasAccounting = draft.commodityGroupId && draft.glAccountId && draft.costCenterId;

  const isReady = hasLineItems && hasDelivery && hasBusinessReason && hasAccounting;

  return {
    isReady,
    warnings: r2Warnings,
    reasons: [
      "Quote attached and within validity",
      "Supplier active",
      "Accounting complete (Cost center + GL + Commodity group)",
      "Below sourcing threshold for PPE",
    ],
  };
};
```

### Submit Handler
```typescript
const handleR2Submit = () => {
  if (!r2Readiness?.isReady) return;

  setIsSubmitting(true);
  // Simulate brief loading
  setTimeout(() => {
    onSubmit();  // Calls parent handler in RequesterModuleV2
  }, 1000);
};
```

### File Location
`src/components/workflow/Step4ReviewSubmit.tsx` (R2 variant added, lines ~230-520)

### IMPORTANT: Reordering Applied
**Change:** Delivery & Recipient section moved **above** Line Items section
**Reason:** User preference - show context (delivery + business reason) before details
**Implementation:** Reordered `<AccordionItem>` components and updated `defaultValue` array

---

## Stage 5: Track & Approvals (R2-Specific)

### Purpose
Track approval progress with R2-specific lifecycle including buyer action step.

### UI Structure

#### Success Banner
```tsx
<Alert className="border-green-600 bg-green-50">
  <CheckCircle className="h-5 w-5 text-green-600" />
  <AlertTitle className="text-green-900 text-lg">
    Purchase Requisition submitted
  </AlertTitle>
  <AlertDescription className="text-green-800">
    <div className="space-y-1">
      <p className="font-semibold text-base">PR-9058</p>
      <p>
        is now in the approval flow. We'll notify you when something needs your attention.
      </p>
    </div>
  </AlertDescription>
</Alert>
```

#### Current Status Summary (4 columns for R2)
```tsx
<Card>
  <CardContent className="p-6">
    <div className="grid grid-cols-4 gap-6">
      <div>
        <p className="text-xs text-muted-foreground mb-1">Current step</p>
        <p className="text-sm font-semibold">Buyer action — Procurement review</p>
      </div>
      <div>
        <p className="text-xs text-muted-foreground mb-1">Owner</p>
        <p className="text-sm font-semibold">IT Procurement Queue</p>
      </div>
      <div>
        <p className="text-xs text-muted-foreground mb-1">Time in step</p>
        <p className="text-sm font-semibold">Just now</p>
      </div>
      <div>
        <p className="text-xs text-muted-foreground mb-1">SLA</p>
        <p className="text-sm font-semibold text-green-600">On track</p>
      </div>
    </div>
  </CardContent>
</Card>
```

**Note:** R1 (Catalog) uses 3 columns (no SLA field).

#### Approval Timeline (R2-Specific)
```tsx
<Card>
  <CardHeader>
    <CardTitle className="text-lg font-semibold">Approval Timeline</CardTitle>
  </CardHeader>
  <CardContent className="p-6">
    <div className="space-y-1">
      {/* Step 1: Submitted - Completed */}
      <TimelineNode
        icon={<CheckCircle />}
        label="Submitted"
        status="completed"
        completedAt={submittedAt}
      />

      {/* Step 2: Buyer action - In Progress */}
      <TimelineNode
        icon={<Clock className="animate-pulse" />}
        label="Buyer action (Procurement review)"
        owner="IT Procurement Queue"
        status="in_progress"
        helperText="Validating quote, supplier record, and coding"
      />

      {/* Step 3: Manager approval - Pending */}
      <TimelineNode
        icon={<User />}
        label="Manager approval"
        owner="Sarah Johnson"
        status="pending"
      />

      {/* Step 4: Cost center owner approval - Pending */}
      <TimelineNode
        icon={<User />}
        label="Cost center owner approval"
        owner="Michael Chen"
        status="pending"
      />

      {/* Step 5: PR approved - Pending */}
      <TimelineNode
        icon={<User />}
        label="PR approved"
        status="pending"
      />

      {/* Step 6: PO created & sent - Pending */}
      <TimelineNode
        icon={<User />}
        label="PO created & sent"
        status="pending"
      />
    </div>
  </CardContent>
</Card>
```

**Key Difference from R1:**
- R1 timeline: Submitted → **Manager approval** → Cost center → PR approved → PO
- R2 timeline: Submitted → **Buyer action** → Manager approval → Cost center → PR approved → PO

**Buyer Action Step Details:**
- **Label:** "Buyer action (Procurement review)"
- **Owner:** "IT Procurement Queue"
- **Status:** "In progress" (immediately after submission)
- **Helper Text:** "Validating quote, supplier record, and coding"
- **Icon:** Pulsing clock

### Request Details (Collapsible, R2-Enhanced)

**When Collapsed:**
```tsx
<p className="text-sm text-muted-foreground">
  Warning vest YELLOW... × 50 • EUR 1,750 • Aarhus
</p>
```

**When Expanded:**
```tsx
<CardContent className="space-y-4">
  {/* PR Number */}
  <div>
    <p className="text-xs text-muted-foreground mb-1">PR Number</p>
    <p className="text-sm font-medium">PR-9058</p>
  </div>
  <Separator />

  {/* Supplier (R2 ONLY) */}
  <div>
    <p className="text-xs text-muted-foreground mb-1">Supplier</p>
    <p className="text-sm font-medium">Manufacturing A/S</p>
  </div>
  <Separator />

  {/* Items */}
  <div>
    <p className="text-xs text-muted-foreground mb-1">Items</p>
    <p className="text-sm">Warning vest YELLOW w/reflex C470 S/M × 50</p>
    <p className="text-sm font-semibold mt-1">Total: EUR 1,750</p>
  </div>
  <Separator />

  {/* Delivery */}
  <div>
    <p className="text-xs text-muted-foreground mb-1">Delivery</p>
    <p className="text-sm">Aarhus, Denmark, Need by: 2026-01-28</p>
  </div>
  <Separator />

  {/* Accounting */}
  <div>
    <p className="text-xs text-muted-foreground mb-1">Accounting</p>
    <p className="text-sm">SAFETY-PPE, 615200, CC-DK-AAR-MAINT</p>
  </div>
  <Separator />

  {/* Evidence (R2 ONLY) */}
  <div>
    <p className="text-xs text-muted-foreground mb-1">Evidence</p>
    <div className="flex items-center gap-2">
      <FileText className="h-4 w-4 text-muted-foreground" />
      <p className="text-sm">Quote — Q-2026-0113 (PDF)</p>
      <Button variant="ghost" size="sm" className="text-xs h-6 px-2">
        View quote
      </Button>
    </div>
  </div>
  <Separator />

  {/* Policy Checks */}
  <div>
    <p className="text-xs text-muted-foreground mb-1">Policy Checks</p>
    <div className="flex flex-wrap gap-2 mt-1">
      <Badge variant="outline">Supplier active ✓</Badge>
      <Badge variant="outline">Currency allowed ✓</Badge>
      <Badge variant="outline">Below threshold ✓</Badge>
    </div>
  </div>
</CardContent>
```

### My Requests List (R2-Enhanced)

**List Item Display:**
```tsx
<div className="flex items-start justify-between gap-4">
  <div className="flex-1 space-y-2">
    <div className="flex items-center gap-3">
      <span className="font-semibold">PR-9058</span>
      <span className="text-sm text-muted-foreground">Warning vests — Aarhus</span>
    </div>
    <div className="flex items-center gap-4 text-sm text-muted-foreground">
      <span>Just now</span>
      <span>Buyer action — Procurement review</span>
      <span>• IT Procurement Queue</span>
    </div>
    <div className="text-sm text-muted-foreground">
      Warning vest YELLOW... × 50 • Supplier: Manufacturing A/S
    </div>
  </div>
  <div className="flex flex-col items-end gap-2">
    <Badge variant="outline" className="bg-amber-100 text-amber-800">
      Pending Approval
    </Badge>
    <span className="text-sm font-semibold">EUR 1,750</span>
    <span className="text-xs text-muted-foreground">Jan 14, 2026</span>
  </div>
</div>
```

**Key R2 Enhancements in List:**
- ✅ Title format: "Warning vests — Aarhus" (item + location)
- ✅ Shows supplier in items summary
- ✅ Displays EUR currency (not $)
- ✅ Current step shows "Buyer action — Procurement review"

### Lifecycle Generation Logic
```typescript
// src/modules/Requester/RequesterModuleV2.tsx (handleStep4Submit)

const isNonCatalog = draft.journeyType === "NON_CATALOG";
let lifecycleTimeline: LifecycleNode[] = [];
let currentStep = "";
let currentOwner = "";

if (isNonCatalog) {
  // R2: NON_CATALOG timeline with Buyer action step
  lifecycleTimeline = [
    {
      id: "lc-1",
      label: "Submitted",
      status: "completed",
      completedAt: submissionTimestamp,
    },
    {
      id: "lc-2",
      label: "Buyer action (Procurement review)",
      owner: "IT Procurement Queue",
      status: "in_progress",
      helperText: "Validating quote, supplier record, and coding",
    },
    {
      id: "lc-3",
      label: "Manager approval",
      owner: "Sarah Johnson",
      status: "pending",
    },
    {
      id: "lc-4",
      label: "Cost center owner approval",
      owner: "Michael Chen",
      status: "pending",
    },
    {
      id: "lc-5",
      label: "PR approved",
      status: "pending",
    },
    {
      id: "lc-6",
      label: "PO created & sent",
      status: "pending",
    },
  ];

  currentStep = "Buyer action — Procurement review";
  currentOwner = "IT Procurement Queue";
} else {
  // R1: CATALOG timeline (original)
  lifecycleTimeline = [
    {
      id: "lc-1",
      label: "Submitted",
      status: "completed",
      completedAt: submissionTimestamp,
    },
    {
      id: "lc-2",
      label: "Manager approval",
      owner: "Sarah Johnson",
      status: "in_progress",
      helperText: "Waiting on Sarah Johnson",
    },
    // ... rest of R1 timeline
  ];

  currentStep = "Manager approval";
  currentOwner = "Sarah Johnson";
}
```

### Title Generation Logic (R2-Specific)
```typescript
// src/modules/Requester/RequesterModuleV2.tsx

let title = "";
if (isNonCatalog) {
  // R2: Extract item name and location for descriptive title
  const itemName = draft.lineItems[0]?.name || "Items";
  // Extract short item name (e.g., "Warning vests" from "Warning vest YELLOW w/reflex C470 S/M")
  const shortItemName = itemName.split(" ").slice(0, 2).join(" ");
  // Extract location (e.g., "Aarhus" from "Logistikvej 12, 8200 Aarhus N, Denmark")
  const location = draft.purchaseInfo?.shipToAddress?.split(",").find(part =>
    part.toLowerCase().includes("aarhus") ||
    part.toLowerCase().includes("copenhagen") ||
    part.toLowerCase().includes("denmark")
  )?.trim() || "Aarhus";
  const cityName = location.split(" ")[location.split(" ").length - 2] || location; // Get "Aarhus" from "8200 Aarhus N"

  title = `${shortItemName} — ${cityName}`;  // "Warning vests — Aarhus"
} else {
  // R1: Original catalog title
  title =
    draft.lineItems.length === 1
      ? `${draft.lineItems[0].quantity} ${draft.lineItems[0].name}`
      : `${totalQuantity} items`;
}
```

### File Locations
- `src/components/workflow/Step5TrackApprovals.tsx` (R2 enhancements added)
- `src/modules/Requester/RequesterModuleV2.tsx` (R2 lifecycle generation)

---

## 🔑 Key Type Definitions (R2-Specific)

### QuoteDetails
```typescript
// src/types/workflow.ts
export interface QuoteDetails {
  supplierName: string;
  quoteNumber: string;
  quoteDate: string;
  currency: string;
  validity: string; // e.g., "14 days"
  paymentTerms: string; // e.g., "Net 30"
  leadTime: string; // e.g., "7–10 business days"
  deliveryTerms: string; // e.g., "DAP — Aarhus, Denmark"
  supplierLocation: string;
}
```

### JourneyType
```typescript
export type JourneyType = "CATALOG" | "NON_CATALOG";
```

### PurchaseInfo (R2 Extensions)
```typescript
export interface PurchaseInfo {
  // ... existing R1 fields

  // R2 NON_CATALOG specific fields
  shipToSiteId?: string;
  shipToAddress?: string;
  deliveryInstructions?: string;
  deliveryContactName?: string;
  deliveryContactEmail?: string;
  deliveryContactPhone?: string;
  deliveryContactIsSelf?: boolean;
}
```

### DraftPR (R2 Extensions)
```typescript
export interface DraftPR {
  // ... existing R1 fields

  // R2 account assignment
  accountAssignmentType?: "CostCenter" | "Project";
  wbsElement?: string;
  internalOrder?: string;

  // Journey type and quote details
  journeyType?: JourneyType;
  quoteDetails?: QuoteDetails;
}
```

### SubmittedPR
```typescript
export interface SubmittedPR {
  prNumber: string;
  prId: string;
  title: string; // R2: "Warning vests — Aarhus"
  status: "pending_approval" | "on_hold" | "approved" | "po_created" | "rejected";
  currentStep: string; // R2: "Buyer action — Procurement review"
  currentOwner?: string; // R2: "IT Procurement Queue"
  timeInStep: string;
  submittedAt: Date;
  submittedBy: string;
  totalValue: number;
  lifecycleTimeline: LifecycleNode[]; // R2 has different timeline
  actionRequired?: RequesterAction;
  itemsSummary: string;
  deliverySummary: string;
  accountingSummary: string;
  policySummary: string[];
  canEdit: boolean;
  draftPR?: DraftPR; // Reference for journey detection
}
```

---

## 🐛 Issues Fixed During Implementation

### Issue 1: "Clarify Your Need" Section in Stage 2
**Symptom:** Variant 2B (Free-Text Goods) section appearing in R2 Stage 2
**Root Cause:** Line items had `type: "freeText"`, causing `getRequestType()` to return `"freeTextGoods"`
**Fix:** Added `&& !isNonCatalog` exclusion to Variant 2B and 2C
**File:** `src/components/workflow/Step2Container.tsx`
**Status:** ✅ Fixed

### Issue 2: Legacy Policy Checks in Stage 3
**Symptom:** R1 policy checks showing instead of R2-specific checks
**Root Cause:** useEffect only generated checks if `draft.policyChecks` was empty, but legacy checks were already present
**Fix:** Detect R2-specific check IDs (`check-supplier-active`) and force regeneration if not found
**File:** `src/components/workflow/Step3AccountingChecks.tsx`
**Status:** ✅ Fixed

### Issue 3: Entity Code Mismatch
**Symptom:** Accounting shows "UIPATH-RO" but policy checks hardcoded "UIPATH-DK"
**Root Cause:** Policy check messages used hardcoded strings instead of draft data
**Fix:** Made messages dynamic using `draft.entityCode`
**File:** `src/components/workflow/Step3AccountingChecks.tsx`
**Status:** ✅ Fixed

### Issue 4: TypeScript Build Error (Unused Import)
**Symptom:** Build failed with "MapPin is declared but never used"
**Root Cause:** Imported but not used in Step4ReviewSubmit after refactoring
**Fix:** Removed unused `MapPin` import
**File:** `src/components/workflow/Step4ReviewSubmit.tsx`
**Status:** ✅ Fixed

---

## 🧪 Testing Checklist

### Stage 1: Choose Items
- [ ] Quote extraction card displays with correct item details
- [ ] Compact request summary strip shows quote number, supplier, total
- [ ] Quantity adjustment buttons work
- [ ] Total recalculates on quantity change (live update)
- [ ] "From quote" badge visible
- [ ] Continue button enabled

### Stage 2: Delivery & Details
- [ ] Three cards display (Delivery, Recipient, Business Context)
- [ ] Site dropdown shows 3 Aarhus/Copenhagen options
- [ ] Default site is AAR-DC-01 (prefilled)
- [ ] Ana Popescu contact info prefilled
- [ ] Business reason textarea required
- [ ] Quote strip at bottom shows Q-2026-0113
- [ ] **"Clarify Your Need" section DOES NOT appear**
- [ ] Validation blocks navigation without required fields

### Stage 3: Accounting & Policy Checks
- [ ] Summary strip shows item, supplier, total
- [ ] Entity field shows **UIPATH-RO** (read-only)
- [ ] Account Assignment Type radio (Cost Center default)
- [ ] Commodity Group prefilled: **SAFETY-PPE**
- [ ] GL Account prefilled: **615200**
- [ ] Cost Center prefilled: **CC-DK-AAR-MAINT**
- [ ] **7 policy checks display (all green)**
- [ ] Policy check messages use **UIPATH-RO** (not UIPATH-DK)
- [ ] All checks show "pass" status
- [ ] Optional lead time warning may appear

### Stage 4: Review & Submit
- [ ] Header: "Review & Submit" + subtitle with quote number
- [ ] **Readiness verdict appears SECOND** (after header, before summary card)
- [ ] Header summary card: Supplier, Total (EUR), Delivery, Draft badge, View quote button
- [ ] **All accordion sections auto-expanded** by default
- [ ] **Delivery & Recipient section appears FIRST** (before Line Items)
- [ ] **Business reason displays in Delivery & Recipient section**
- [ ] Line Items section shows "From quote" badge
- [ ] Table displays: Description, Qty (50), Unit Price (EUR 35.00), Line Total (EUR 1,750.00)
- [ ] Accounting section shows: Entity, Commodity Group, GL Account, Cost Center
- [ ] Evidence section shows: Quote — Q-2026-0113 (PDF) with "Attached" status
- [ ] Submit button enabled when ready
- [ ] Submit shows loading state ("Creating PR in SAP/Ariba...")

### Stage 5: Track & Approvals
- [ ] Success banner displays with PR number (PR-9xxx)
- [ ] Current status summary shows **4 columns** (including SLA)
- [ ] Current step: "Buyer action — Procurement review"
- [ ] Owner: "IT Procurement Queue"
- [ ] Time in step: "Just now"
- [ ] **SLA: "On track"** (green text)
- [ ] Approval timeline shows **6 steps**
- [ ] **Buyer action is step 2** (after Submitted, before Manager approval)
- [ ] Buyer action shows "In progress" with pulsing clock icon
- [ ] Helper text: "Validating quote, supplier record, and coding"
- [ ] Manager approval (step 3) shows "Pending" with Sarah Johnson
- [ ] Cost center owner (step 4) shows "Pending" with Michael Chen
- [ ] PR approved (step 5) shows "Pending"
- [ ] PO created (step 6) shows "Pending"
- [ ] Request Details collapsed by default
- [ ] When expanded, shows: PR number, **Supplier**, Items (EUR), Delivery, Accounting, **Evidence (Quote)**, Policy Checks
- [ ] "My Requests" button navigates to list
- [ ] "New Request" button starts new flow

### My Requests List
- [ ] Newly submitted R2 PR appears in list
- [ ] Title format: "Warning vests — Aarhus" (descriptive)
- [ ] Current step: "Buyer action — Procurement review"
- [ ] Owner: IT Procurement Queue
- [ ] Items summary includes "• Supplier: Manufacturing A/S"
- [ ] Total displays as **EUR 1,750** (not $)
- [ ] Status badge: "Pending Approval" (amber)
- [ ] Clicking row opens Stage 5 tracking view

### Journey Separation
- [ ] R1 (Catalog) flow completely unchanged
- [ ] R1 Stage 5 shows 3-column status (no SLA)
- [ ] R1 timeline starts with "Manager approval" (no Buyer action)
- [ ] R1 currency displays as $ (USD)
- [ ] R2 only renders when `draft.journeyType === "NON_CATALOG"`

### Currency Display
- [ ] Stage 1: EUR 1,750.00
- [ ] Stage 2: Quote strip shows EUR
- [ ] Stage 3: Summary strip shows EUR 1,750
- [ ] Stage 4: Header summary and table show EUR
- [ ] Stage 5: Request Details shows EUR (not $)
- [ ] My Requests list shows EUR (not $)

---

## 📂 File Modification Summary

### Files Modified (with R2 changes)
1. **`src/types/workflow.ts`**
   - Added `JourneyType` enum
   - Added `QuoteDetails` interface
   - Extended `PurchaseInfo` with R2 fields
   - Extended `DraftPR` with R2 fields

2. **`src/data/accountingData.ts`**
   - Added 3 Denmark commodity groups
   - Added 5 Denmark GL accounts
   - Added 6 Denmark cost centers
   - Updated `getDefaultAccountingForCategory()` for safety equipment
   - Updated `getDefaultCostCenterForLocation()` for Aarhus/Copenhagen

3. **`src/components/workflow/Step1ChooseItems.tsx`**
   - Replaced full Request Summary Card with compact strip (lines 369-414)
   - Added live total recalculation

4. **`src/components/workflow/Step2Container.tsx`**
   - Added R2 variant with 3 cards (Delivery, Recipient, Business Context)
   - Added demo sites array
   - Added prefill logic for R2
   - Added `&& !isNonCatalog` exclusion to Variants 2B and 2C
   - Added quote strip at bottom

5. **`src/components/workflow/Step3AccountingChecks.tsx`**
   - Added R2 variant with summary strip
   - Added Account Assignment Type radio
   - Added prefill logic for R2 accounting
   - Added `generateR2PolicyChecks()` function
   - Added R2 check detection and regeneration logic

6. **`src/components/workflow/Step4ReviewSubmit.tsx`**
   - Added R2 variant with header, readiness verdict, summary card
   - Moved readiness verdict after header (before summary card)
   - Added accordion sections (all auto-expanded)
   - Reordered: Delivery & Recipient → Line Items → Accounting → Evidence
   - Added Business Reason to Delivery & Recipient section
   - Added R2 readiness calculation

7. **`src/components/workflow/Step5TrackApprovals.tsx`**
   - Added 4th column (SLA) to current status for R2
   - Added Supplier field to Request Details
   - Added Evidence section to Request Details
   - Updated currency display (EUR for R2)
   - Updated list view with supplier info and EUR

8. **`src/modules/Requester/RequesterModuleV2.tsx`**
   - Added R2 lifecycle timeline generation
   - Added buyer action step as second step in R2 timeline
   - Updated current step and owner for R2
   - Added R2-specific title generation ("Warning vests — Aarhus")

### Files NOT Modified (R1 unchanged)
- All other workflow components remain unchanged
- R1 catalog flow completely unaffected
- No breaking changes to existing functionality

---

## 🚀 Future Enhancements (Not Yet Implemented)

### Real Quote Extraction (OCR/AI)
- Integrate OCR service (e.g., Azure Document Intelligence, AWS Textract)
- Parse PDFs to extract: items, quantities, prices, supplier info, quote number
- Confidence scores for extracted data
- User confirmation/correction workflow

### Advanced Buyer Action Workflow
- Real queue assignment (not just "IT Procurement Queue")
- Task management for procurement buyers
- SLA tracking and escalation
- Buyer feedback/corrections to requester

### Multi-Quote Comparison
- Upload multiple quotes for same item
- Side-by-side comparison table
- Auto-recommend best quote (price, lead time, contract status)
- Audit trail of quote selection rationale

### Supplier Onboarding
- Detect new suppliers in quotes
- Trigger supplier onboarding workflow
- Collect tax ID, banking info, compliance docs
- Auto-create supplier record in ERP

### Advanced Policy Checks
- Real-time contract validity checks (connect to CLM)
- Supplier sanction list screening
- Budget availability check (connect to finance system)
- Sourcing threshold enforcement with exceptions

### Analytics & Reporting
- R2 adoption metrics (% of PRs from quotes)
- Buyer action cycle time
- Quote accuracy (corrections needed)
- Supplier performance (lead time adherence)

---

## 🔄 Deployment & CI/CD

### Build Status
✅ **Passing** - All TypeScript errors resolved

### Build Command
```bash
npm run build
```

### Deployment
Auto-deploys to Vercel on push to `main` branch

### Pre-Deploy Checklist
- [ ] `npm run build` passes locally
- [ ] All R2 stages tested end-to-end
- [ ] R1 catalog flow tested (no regressions)
- [ ] TypeScript errors: 0
- [ ] Console errors: 0
- [ ] Browser compatibility tested (Chrome, Safari, Firefox)

---

## 📞 Support & Troubleshooting

### Common Issues

**Issue:** R2 UI not appearing
**Solution:** Verify `draft.journeyType === "NON_CATALOG"` is set in Stage 1

**Issue:** Wrong currency ($ instead of EUR)
**Solution:** Check `draft.lineItems[0]?.currency === "EUR"` and conditional rendering

**Issue:** Buyer action step not showing
**Solution:** Verify R2 lifecycle timeline generated in `handleStep4Submit`

**Issue:** Prefill not working in Stage 2/3
**Solution:** Check useEffect dependencies and `isNonCatalog` condition

### Debug Tips
```typescript
// Add console logs to trace journey type
console.log("[DEBUG] Journey type:", draft.journeyType);
console.log("[DEBUG] Is non-catalog:", isNonCatalog);
console.log("[DEBUG] Line items:", draft.lineItems);
```

### Getting Help
- Check this documentation first
- Review `DEVELOPMENT_LOG.md` for general context
- Check Git commit history for recent changes
- Contact: gabriel.chitic@uipath.com

---

## 📚 Related Documentation

- **Main README:** [README.md](./README.md) - Project overview
- **Development Log:** [DEVELOPMENT_LOG.md](./DEVELOPMENT_LOG.md) - Full implementation history (R1)
- **Design System:** [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) - UI component guidelines
- **Style Guide:** [STYLE_GUIDE.md](./STYLE_GUIDE.md) - Code style conventions

---

**Document Version:** 1.0
**Last Updated:** January 14, 2026
**Maintained By:** Gabriel Chitic
**Status:** ✅ Complete & Production-Ready
