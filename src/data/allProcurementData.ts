// ============================================================================
// COMBINED PROCUREMENT DATA
// Combines base procurement data with BBraun demo data
// ============================================================================
//
// IMPORTANT: This file exists to prevent circular dependencies.
//
// Architecture:
// 1. procurementData.ts - Base types and demo data (PR/PO interfaces, helpers)
// 2. bbraunDemoData.ts - BBraun-specific demo data (imports TYPES from procurementData)
// 3. allProcurementData.ts - THIS FILE - Combines both datasets for use in components
//
// DO NOT import bbraunDemoData directly into procurementData or vice versa!
// Always import through this file in your components.
//
// ============================================================================

import { DEMO_PRS, DEMO_POS } from './procurementData';
import { BBRAUN_DEMO_PR, BBRAUN_DEMO_PO } from './bbraunDemoData';

// Re-export types
export * from './procurementData';
export * from './bbraunDemoData';
export * from './readiness';
export * from './conversion';
export * from './auditModel';
export * from './bbDemoReset';

// Combined arrays with BBraun data included
export const ALL_DEMO_PRS = [
  BBRAUN_DEMO_PR, // BBraun happy flow first
  ...DEMO_PRS,
];

export const ALL_DEMO_POS = [
  // BBRAUN_DEMO_PO is NOT included initially - it will be created when PR is converted
  ...DEMO_POS,
];
