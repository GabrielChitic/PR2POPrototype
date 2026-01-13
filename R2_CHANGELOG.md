# Journey R2 (Non-Catalog) - Implementation Changelog

## Version 2.0 - Journey R2 Complete
**Date:** January 14, 2026
**Status:** ✅ Production Ready

---

## 🎯 Summary

Implemented complete **Journey R2 (Non-Catalog / PDF-First)** workflow as a parallel procurement path to the existing Journey R1 (Catalog). This journey handles procurement requests based on external quotes/PDFs rather than catalog items.

**Key Achievement:** Complete journey separation - R1 and R2 are fully isolated with **zero breaking changes** to the existing catalog flow.

---

## 📦 What's New

### Stage 1: Choose Items (Quote Extraction)
- ✅ Quote extraction card with hardcoded demo data
- ✅ Compact request summary strip (replaced full card)
- ✅ Live total recalculation on quantity change
- ✅ EUR currency support
- ✅ Quote number display (Q-2026-0113)

**Files Modified:**
- `src/components/workflow/Step1ChooseItems.tsx`

### Stage 2: Delivery & Details (R2-Specific)
- ✅ Three-card layout: Delivery, Recipient, Business Context
- ✅ Site dropdown with 3 Aarhus/Copenhagen options
- ✅ Prefilled contact info (Ana Popescu)
- ✅ Business reason required field
- ✅ Quote strip at bottom
- ✅ Bug fix: Excluded "Clarify Your Need" section from R2

**Files Modified:**
- `src/components/workflow/Step2Container.tsx`
- `src/types/workflow.ts` (added R2 fields to PurchaseInfo)

### Stage 3: Accounting & Policy Checks (R2-Specific)
- ✅ Denmark-specific master data (6 cost centers, 5 GL accounts, 3 commodity groups)
- ✅ Prefill logic based on item category and location
- ✅ Account Assignment Type radio (Cost Center / Project)
- ✅ R2-specific policy checks (7 checks, all pass for happy path)
- ✅ Bug fix: Entity code consistency (UIPATH-RO throughout)

**Files Modified:**
- `src/components/workflow/Step3AccountingChecks.tsx`
- `src/data/accountingData.ts` (added Denmark data)
- `src/types/workflow.ts` (added accountAssignmentType)

### Stage 4: Review & Submit (R2-Specific)
- ✅ Professional header with subtitle
- ✅ Readiness verdict moved up (after header, before summary card)
- ✅ Header summary card with metadata and "View quote" button
- ✅ Accordion sections all auto-expanded
- ✅ **Reordered:** Delivery & Recipient section moved **before** Line Items
- ✅ Business reason added to Delivery & Recipient section
- ✅ Evidence section with quote display

**Files Modified:**
- `src/components/workflow/Step4ReviewSubmit.tsx`

### Stage 5: Track & Approvals (R2-Specific)
- ✅ **Buyer action step** added as step 2 in timeline (after Submitted, before Manager approval)
- ✅ SLA field in current status (4-column layout for R2 vs 3 for R1)
- ✅ Enhanced Request Details with Supplier and Evidence fields
- ✅ EUR currency display throughout
- ✅ Descriptive title format: "Warning vests — Aarhus"
- ✅ Supplier info in My Requests list

**Files Modified:**
- `src/components/workflow/Step5TrackApprovals.tsx`
- `src/modules/Requester/RequesterModuleV2.tsx` (R2 lifecycle generation)

### Type System Enhancements
- ✅ `JourneyType` enum: `"CATALOG" | "NON_CATALOG"`
- ✅ `QuoteDetails` interface for quote metadata
- ✅ `PurchaseInfo` extended with R2 fields (shipToSiteId, deliveryContactName, etc.)
- ✅ `DraftPR` extended with R2 fields (accountAssignmentType, journeyType, quoteDetails)

**Files Modified:**
- `src/types/workflow.ts`

### Demo Data Additions
- ✅ 3 Denmark commodity groups (SAFETY-PPE, MRO-SUPPLIES, OFFICE-SUPPLIES)
- ✅ 5 Denmark GL accounts (615200, 615100, 612000, 611500, 621000)
- ✅ 6 Denmark cost centers (Aarhus Maintenance, Aarhus Operations, etc.)
- ✅ Helper functions updated for Denmark-specific mapping

**Files Modified:**
- `src/data/accountingData.ts`

---

## 🐛 Bug Fixes

### 1. "Clarify Your Need" Section in Stage 2
**Issue:** Variant 2B (Free-Text Goods) appearing in R2 Stage 2
**Root Cause:** Line items had `type: "freeText"`, triggering wrong variant
**Fix:** Added `&& !isNonCatalog` exclusion to Variants 2B and 2C
**File:** `src/components/workflow/Step2Container.tsx`

### 2. Legacy Policy Checks in Stage 3
**Issue:** R1 policy checks showing instead of R2-specific checks
**Root Cause:** useEffect not detecting existing checks
**Fix:** Added R2 check ID detection and forced regeneration
**File:** `src/components/workflow/Step3AccountingChecks.tsx`

### 3. Entity Code Mismatch
**Issue:** Accounting shows "UIPATH-RO" but policy checks hardcoded "UIPATH-DK"
**Root Cause:** Hardcoded strings in policy check messages
**Fix:** Made messages dynamic using `draft.entityCode`
**File:** `src/components/workflow/Step3AccountingChecks.tsx`

### 4. TypeScript Build Error
**Issue:** Unused `MapPin` import causing build failure
**Root Cause:** Removed usage but forgot to remove import
**Fix:** Removed unused import
**File:** `src/components/workflow/Step4ReviewSubmit.tsx`

---

## 📊 Test Coverage

### Tested Scenarios
- ✅ R2 Stage 1: Quote extraction, quantity adjustment, navigation
- ✅ R2 Stage 2: All three cards, prefill, validation, site selection
- ✅ R2 Stage 3: Accounting prefill, policy checks generation, Denmark data
- ✅ R2 Stage 4: Accordion reordering, auto-expansion, business reason display
- ✅ R2 Stage 5: Buyer action step, SLA field, EUR currency, title format
- ✅ My Requests: R2 PR display with supplier, EUR currency, buyer action step
- ✅ Journey Separation: R1 completely unchanged, no regressions

### Demo Data Verified
- ✅ Item: Warning vest YELLOW w/reflex C470 S/M
- ✅ Supplier: Manufacturing A/S
- ✅ Quantity: 50, Unit Price: EUR 35.00, Total: EUR 1,750.00
- ✅ Quote: Q-2026-0113
- ✅ Site: AAR-DC-01 (Aarhus Distribution Center)
- ✅ Contact: Ana Popescu
- ✅ Accounting: SAFETY-PPE, 615200, CC-DK-AAR-MAINT
- ✅ Entity: UIPATH-RO

---

## 🔄 Breaking Changes

**None.** Journey R2 is completely isolated from Journey R1. All R2 UI is conditionally rendered based on `draft.journeyType === "NON_CATALOG"`.

---

## 📝 Files Changed

### Created
- `R2_JOURNEY_DOCUMENTATION.md` - Complete R2 documentation (64 KB)
- `R2_CHANGELOG.md` - This file

### Modified
- `README.md` - Added R2 features, examples, and references
- `src/types/workflow.ts` - Added R2 types
- `src/data/accountingData.ts` - Added Denmark data
- `src/components/workflow/Step1ChooseItems.tsx` - Quote extraction UI
- `src/components/workflow/Step2Container.tsx` - R2 variant
- `src/components/workflow/Step3AccountingChecks.tsx` - R2 accounting & checks
- `src/components/workflow/Step4ReviewSubmit.tsx` - R2 review layout
- `src/components/workflow/Step5TrackApprovals.tsx` - R2 tracking enhancements
- `src/modules/Requester/RequesterModuleV2.tsx` - R2 lifecycle generation

### Unchanged (R1 Protected)
- All other files remain unchanged
- R1 catalog flow completely unaffected
- Existing tests and demos still work

---

## 🚀 Deployment

### Build Status
- ✅ TypeScript compilation: **0 errors**
- ✅ Vite build: **Success**
- ✅ Bundle size: 651 KB (gzipped: 181 KB)

### Deployment Readiness
- ✅ All stages tested end-to-end
- ✅ R1 regression tested (no issues)
- ✅ Documentation complete
- ✅ Demo data verified
- ✅ Ready for Vercel deploy

---

## 📚 Documentation Updates

### New Files
- **R2_JOURNEY_DOCUMENTATION.md** - 500+ lines of comprehensive documentation
  - Demo scenario with test data
  - Stage-by-stage implementation details
  - Type definitions
  - Bug fixes and solutions
  - Testing checklist
  - Future enhancements
  - Troubleshooting guide

### Updated Files
- **README.md**
  - Added Journey R2 features section
  - Added R2 example workflow
  - Updated project status to v2.0
  - Added R2 documentation references
  - Updated file list with R2 components

---

## 🔮 Future Enhancements

See `R2_JOURNEY_DOCUMENTATION.md` section "Future Enhancements" for details:

### High Priority
- Real quote extraction (OCR/AI integration)
- Advanced buyer action workflow (queue management)
- SLA tracking and escalation

### Medium Priority
- Multi-quote comparison
- Supplier onboarding automation
- Real-time contract validity checks

### Low Priority
- Analytics dashboard (R1 vs R2 adoption)
- Quote accuracy tracking
- Supplier performance metrics

---

## 👥 Contributors

**Implementation:** Gabriel Chitic (gabriel.chitic@uipath.com)
**Date:** January 14, 2026
**AI Assistant:** Claude Code (Anthropic)

---

## 📞 Support

For questions or issues related to Journey R2:
1. Check `R2_JOURNEY_DOCUMENTATION.md` first
2. Review this changelog for recent changes
3. Check Git commit history for detailed changes
4. Contact: gabriel.chitic@uipath.com

---

**Version:** 2.0
**Status:** ✅ Production Ready
**Last Updated:** January 14, 2026
