# Data Structure Documentation

## Overview

This directory contains the data models and mock data for the PR2PO Prototype application.

## File Organization

### Core Data Files

#### `procurementData.ts`
- **Purpose**: Base procurement data types and standard demo data
- **Exports**:
  - TypeScript interfaces: `AuditEvent`, `ProcurementPR`, `ProcurementPO`
  - Demo datasets: `DEMO_PRS`, `DEMO_POS` (standard scenarios)
  - Helper functions: `getPRSlaStatus`, `getPOSlaStatus`, etc.

#### `bbraunDemoData.ts`
- **Purpose**: BBraun-specific demo data for R2 happy flow scenarios
- **Exports**:
  - BBraun material data: `BBRAUN_MATERIAL`, `BBRAUN_PLANT_DATA`, `BBRAUN_PURCHASING`
  - Approval workflow: `BBRAUN_APPROVAL_WORKFLOW`
  - Demo instances: `BBRAUN_DEMO_PR`, `BBRAUN_DEMO_PO`
- **Important**: Uses `import type` to avoid circular dependencies

#### `allProcurementData.ts` ⭐
- **Purpose**: Combined export file that merges base + BBraun data
- **Exports**:
  - `ALL_DEMO_PRS`: Array combining BBraun PR + standard PRs
  - `ALL_DEMO_POS`: Array combining BBraun PO + standard POs
  - Re-exports all types and helpers from both files
- **Usage**: **Always import from this file in your components**

### Other Data Files

- `catalogData.ts` - Product catalog data
- `accountingData.ts` - Accounting/GL account data
- `costCenterData.ts` - Cost center master data
- `mockData.ts` - Legacy mock data (may be deprecated)

## Architecture Decision: Avoiding Circular Dependencies

### The Problem (Fixed on 2026-01-23)

We encountered a circular dependency issue:
```
procurementData.ts → imports → bbraunDemoData.ts
bbraunDemoData.ts → imports → procurementData.ts
```

This caused module initialization failures in the browser with errors like:
```
The requested module does not provide an export named 'AuditEvent'
```

### The Solution

1. **Created `allProcurementData.ts`** as a one-way aggregator
2. **Used `import type`** in `bbraunDemoData.ts` for TypeScript types (compile-time only)
3. **Components import from `allProcurementData.ts`** instead of individual files

### Best Practices

✅ **DO**:
```typescript
// In your components
import { ALL_DEMO_PRS, ALL_DEMO_POS, type ProcurementPR } from '../../data/allProcurementData';
```

❌ **DON'T**:
```typescript
// Avoid direct imports in components
import { DEMO_PRS } from '../../data/procurementData';
import { BBRAUN_DEMO_PR } from '../../data/bbraunDemoData';
```

## Adding New Demo Scenarios

### For Standard Scenarios (non-BBraun)
1. Add your PR/PO objects to `DEMO_PRS` or `DEMO_POS` arrays in `procurementData.ts`
2. They will automatically appear in `ALL_DEMO_PRS`/`ALL_DEMO_POS`

### For New Vendor-Specific Scenarios
1. Create a new file like `vendorDemoData.ts`
2. Use `import type` for interfaces from `procurementData.ts`
3. Export your demo objects
4. Add them to `allProcurementData.ts`:
   ```typescript
   import { VENDOR_DEMO_PR } from './vendorDemoData';

   export const ALL_DEMO_PRS = [
     BBRAUN_DEMO_PR,
     VENDOR_DEMO_PR,
     ...DEMO_PRS,
   ];
   ```

## Module Loading Order

For future debugging, the correct loading order is:
1. `procurementData.ts` - Loads first (only exports, no imports from local files)
2. `bbraunDemoData.ts` - Loads second (imports types only via `import type`)
3. `allProcurementData.ts` - Loads last (imports from both above)
4. Components load and import from `allProcurementData.ts`

## Troubleshooting

### White screen with "does not provide an export" error
- **Cause**: Circular dependency or browser module cache
- **Fix**:
  1. Kill dev server: `kill $(lsof -ti:5177)`
  2. Clear Vite cache: `rm -rf node_modules/.vite .vite`
  3. Restart: `npm run dev`
  4. Hard refresh browser: `Cmd+Shift+R` or open in incognito

### Changes not reflecting
- Clear browser cache completely
- Use incognito/private window
- Check Network tab for 304 (cached) responses
