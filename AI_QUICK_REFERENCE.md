# AI Quick Reference - PR2PO Prototype

## 🤖 For AI Assistants (Claude Code, Copilot, Cursor)

**Purpose:** Quick reference to continue development on this project from any machine.

---

## 📖 Start Here

### First-Time Context Load
When starting a new session on this project, read these files **in order**:

1. **THIS FILE** (you are here) - Overview and quick reference
2. **[README.md](./README.md)** - Project overview and features
3. **[DEVELOPMENT_LOG.md](./DEVELOPMENT_LOG.md)** - Journey R1 (Catalog) implementation history
4. **[R2_JOURNEY_DOCUMENTATION.md](./R2_JOURNEY_DOCUMENTATION.md)** - Journey R2 (Non-Catalog) complete documentation

**Time to Context:** ~10 minutes

---

## 🎯 Project Status (v2.0)

### What's Implemented
✅ **Journey R1 (Catalog)** - Complete 5-phase workflow for catalog items
✅ **Journey R2 (Non-Catalog)** - Complete 5-phase workflow for quote/PDF-based procurement
✅ **Journey Separation** - Both journeys fully isolated, zero breaking changes
✅ **Build Status** - TypeScript + Vite passing
✅ **Deployment** - Vercel-ready

### What's Not Implemented
❌ Real quote extraction (OCR/AI) - currently hardcoded demo
❌ Backend API - all data is mock/demo
❌ Authentication - no user login
❌ Real CLM integration - mock contracts
❌ Mobile responsive - desktop-optimized only

---

## 🔑 Key Concepts

### Journey Detection
```typescript
// R1 (Catalog)
draft.journeyType === "CATALOG"

// R2 (Non-Catalog)
draft.journeyType === "NON_CATALOG"
```

### Conditional Rendering Pattern
```typescript
const isNonCatalog = draft.journeyType === "NON_CATALOG";

// R2-specific UI
{isNonCatalog && (
  <R2Component />
)}

// R1-specific UI (exclude R2)
{!isNonCatalog && (
  <R1Component />
)}
```

### Data Flow
```
User Input → RequesterModuleV2.tsx (orchestrator)
  → DraftPR (single source of truth)
  → Step components (1-5)
  → SubmittedPR (after submit)
  → My Requests list
```

---

## 📁 Critical Files

### Orchestrator
- **`src/modules/Requester/RequesterModuleV2.tsx`** (1400+ lines)
  - Main workflow controller
  - Manages `draft` state (DraftPR)
  - Handles chat parsing and form updates
  - Generates lifecycle timelines (R1 vs R2)

### Type System
- **`src/types/workflow.ts`** (327 lines)
  - `JourneyType` - "CATALOG" | "NON_CATALOG"
  - `DraftPR` - All request data
  - `SubmittedPR` - After submission
  - `QuoteDetails` - R2 quote metadata

### Stage Components
- **`src/components/workflow/Step1ChooseItems.tsx`** - Catalog search (R1) or Quote extraction (R2)
- **`src/components/workflow/Step2Container.tsx`** - 3 variants (R1) + R2 variant
- **`src/components/workflow/Step3AccountingChecks.tsx`** - Accounting + policy checks (R1 + R2)
- **`src/components/workflow/Step4ReviewSubmit.tsx`** - Review accordion (R1 + R2)
- **`src/components/workflow/Step5TrackApprovals.tsx`** - Tracking + My Requests (R1 + R2)

### Demo Data
- **`src/data/catalogData.ts`** - 5 laptops for R1
- **`src/data/accountingData.ts`** - Master data (includes Denmark data for R2)

---

## 🧭 Common Tasks

### Task 1: Add New Field to R2 Stage 2
```typescript
// 1. Update type
// src/types/workflow.ts
export interface PurchaseInfo {
  // ... existing
  newR2Field?: string;
}

// 2. Add UI input
// src/components/workflow/Step2Container.tsx
{isNonCatalog && (
  <Input
    value={purchaseInfo.newR2Field}
    onChange={(e) => onUpdate({ newR2Field: e.target.value })}
  />
)}

// 3. Update validation if needed
const isValid = purchaseInfo.newR2Field?.trim().length > 0 && ...;

// 4. Display in Stage 4 if needed
// src/components/workflow/Step4ReviewSubmit.tsx
```

### Task 2: Add New Policy Check for R2
```typescript
// src/components/workflow/Step3AccountingChecks.tsx
function generateR2PolicyChecks(draft: DraftPR): PolicyCheckResult[] {
  const checks: PolicyCheckResult[] = [];

  // Add new check
  checks.push({
    id: "check-new-validation",
    checkName: "New validation rule",
    status: "pass", // or "warn" or "block"
    message: "Description of what was validated",
  });

  return checks;
}
```

### Task 3: Modify R2 Lifecycle Timeline
```typescript
// src/modules/Requester/RequesterModuleV2.tsx (handleStep4Submit)
if (isNonCatalog) {
  lifecycleTimeline = [
    { id: "lc-1", label: "Submitted", status: "completed", ... },
    { id: "lc-2", label: "Buyer action", status: "in_progress", ... },
    // Add new step here
    { id: "lc-new", label: "New approval step", status: "pending", ... },
    // ... rest of timeline
  ];
}
```

### Task 4: Test R2 Flow End-to-End
```bash
# 1. Start dev server
npm run dev

# 2. Open http://localhost:5178/ in browser

# 3. In chat, type:
"I need 50 warning vests for Aarhus site"

# 4. Follow stages 1-5, verify:
- Stage 1: Quote extraction with compact strip
- Stage 2: 3 cards (Delivery, Recipient, Business Context)
- Stage 3: Prefilled accounting (SAFETY-PPE, 615200, CC-DK-AAR-MAINT)
- Stage 4: Delivery section first, business reason included
- Stage 5: Buyer action step 2, SLA field, EUR currency

# 5. Check My Requests list:
- Title: "Warning vests — Aarhus"
- Current step: "Buyer action — Procurement review"
- Total: EUR 1,750
```

---

## ⚠️ Important Rules

### DO NOT Break R1
- ✅ Always wrap R2 code in `{isNonCatalog && ...}`
- ✅ Always wrap R1 code in `{!isNonCatalog && ...}` when adding R2
- ✅ Test R1 catalog flow after every R2 change
- ✅ Keep `draft.journeyType` as single source of truth

### DO NOT Introduce Breaking Changes
- ❌ Don't rename existing types/interfaces
- ❌ Don't change existing R1 demo data
- ❌ Don't modify R1 logic without conditional checks
- ❌ Don't add required fields to shared types without defaults

### DO Follow TypeScript Best Practices
- ✅ Use explicit type annotations (avoid `any`)
- ✅ Use optional chaining (`?.`) for nested properties
- ✅ Add type guards for union types
- ✅ Run `npm run build` before committing

---

## 🐛 Common Issues & Fixes

### Issue: R2 UI Not Rendering
**Check:**
```typescript
console.log("Journey type:", draft.journeyType);
console.log("Is non-catalog:", isNonCatalog);
```
**Fix:** Verify `draft.journeyType === "NON_CATALOG"` is set in Stage 1

### Issue: Wrong Currency ($ instead of EUR)
**Check:**
```typescript
console.log("Currency:", draft.lineItems[0]?.currency);
```
**Fix:** Verify currency display uses conditional:
```typescript
{isNonCatalog
  ? `${draft.lineItems[0]?.currency || "EUR"} ${total}`
  : `$${total}`}
```

### Issue: R1 Flow Broken After R2 Changes
**Check:** Test R1 catalog search flow
**Fix:** Ensure all R2 code is wrapped in `{isNonCatalog && ...}`

### Issue: TypeScript Build Errors
**Check:** Run `npm run build`
**Fix:**
- TS6133 (unused var): Prefix with `_` or remove
- TS7006 (implicit any): Add explicit type annotations
- TS2307 (module not found): Check import paths

---

## 📦 Build & Deploy

### Local Development
```bash
npm install          # Install dependencies
npm run dev          # Start dev server (usually port 5173)
npm run build        # TypeScript + Vite build (must pass)
npm run preview      # Preview production build
```

### Deployment (Vercel)
```bash
git add .
git commit -m "feat: description"
git push origin main  # Auto-deploys to Vercel
```

**Build Configuration:**
- Framework: Vite
- Build command: `npm run build`
- Output directory: `dist`
- Node version: 18.x

---

## 📚 Full Documentation

### Journey R1 (Catalog)
- **[DEVELOPMENT_LOG.md](./DEVELOPMENT_LOG.md)** - Complete implementation history
- Features: Natural language parsing, chat shortcuts, 3 request type variants

### Journey R2 (Non-Catalog)
- **[R2_JOURNEY_DOCUMENTATION.md](./R2_JOURNEY_DOCUMENTATION.md)** - Complete documentation
- Features: Quote extraction, buyer action step, Denmark data, EUR support

### General
- **[README.md](./README.md)** - Project overview and quick start
- **[R2_CHANGELOG.md](./R2_CHANGELOG.md)** - R2 implementation changes
- **[DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)** - UI component guidelines
- **[STYLE_GUIDE.md](./STYLE_GUIDE.md)** - Code conventions

---

## 🎓 Learning Path

### Beginner (New to Project)
1. Read README.md (15 min)
2. Run `npm run dev` and test R1 flow (10 min)
3. Test R2 flow with demo data (10 min)
4. Read R2_JOURNEY_DOCUMENTATION.md sections 1-3 (20 min)
**Total: 55 minutes**

### Intermediate (Ready to Code)
1. Read this file completely (10 min)
2. Read DEVELOPMENT_LOG.md Phase 11-12 (15 min)
3. Read R2_JOURNEY_DOCUMENTATION.md completely (30 min)
4. Try Task 1 or Task 2 from Common Tasks (30 min)
**Total: 85 minutes**

### Advanced (Architecture Changes)
1. Read all documentation files (2 hours)
2. Review all critical files listed above (1 hour)
3. Understand type system and data flow (30 min)
4. Plan changes with journey separation in mind
**Total: 3.5 hours**

---

## 💬 Prompt Templates

### Continue Development
```
"I'm continuing the PR2PO Prototype. I've read AI_QUICK_REFERENCE.md and understand:
- Journey R1 (Catalog) and R2 (Non-Catalog) are fully separated
- Current version: v2.0 with both journeys complete
- Entry point: RequesterModuleV2.tsx
- Type system: workflow.ts

I want to [describe your task]. Which files should I modify?"
```

### Add R2 Feature
```
"I want to add [feature] to Journey R2 (Non-Catalog). I understand:
- R2 UI is conditionally rendered with isNonCatalog
- Changes must not affect R1
- Need to update types, UI components, and possibly lifecycle

Can you guide me through the implementation?"
```

### Debug Issue
```
"I'm seeing [issue] in Journey R2. I've checked:
- draft.journeyType is 'NON_CATALOG'
- isNonCatalog conditional is present
- R1 flow still works

Can you help debug?"
```

---

## 🔗 Quick Links

- **Repository:** https://github.com/GabrielChitic/PR2POPrototype.git
- **Local Dev:** http://localhost:5173/ (or next available port)
- **Vercel Dashboard:** [Check for deployment URL]
- **Contact:** gabriel.chitic@uipath.com

---

**Last Updated:** January 14, 2026
**Version:** 2.0
**Status:** ✅ Ready for Continued Development
