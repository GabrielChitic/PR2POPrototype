// ============================================================================
// BBRAUN DEMO RESET
// Reset BBraun demo state to initial condition
// ============================================================================

import type { ProcurementPR, ProcurementPO } from './procurementData';
import { BBRAUN_DEMO_PR } from './bbraunDemoData';

/**
 * Reset BBraun PR to initial "Ready for PO" state
 * Removes conversion audit events and linked PO
 */
export function resetBBraunPR(currentPr: ProcurementPR): ProcurementPR {
  // Clone the original demo PR
  const resetPr: ProcurementPR = {
    ...BBRAUN_DEMO_PR,
    phaseStep: "Ready for PO",
    linkedPoNumber: undefined,
    // Keep only the original audit trail (before conversion)
    auditTrail: BBRAUN_DEMO_PR.auditTrail.filter(
      event => !event.action.toLowerCase().includes('conversion') &&
               !event.action.toLowerCase().includes('handoff') &&
               !event.action.toLowerCase().includes('po created')
    )
  };

  return resetPr;
}

/**
 * Remove BBraun PO from PO list
 * Returns filtered list without the BBraun demo PO
 */
export function removeBBraunPO(poList: ProcurementPO[]): ProcurementPO[] {
  return poList.filter(po => po.poNumber !== "PO-4516638113");
}

/**
 * Check if BBraun demo is in initial state
 */
export function isBBraunDemoInitial(
  pr: ProcurementPR | undefined,
  poList: ProcurementPO[]
): boolean {
  if (!pr || pr.prNumber !== "PR-4546245893") {
    return false;
  }

  // Check if PR is in "Ready for PO" state and not converted
  const prIsInitial = pr.phaseStep === "Ready for PO" && !pr.linkedPoNumber;

  // Check if PO doesn't exist
  const poExists = poList.some(po => po.poNumber === "PO-4516638113");

  return prIsInitial && !poExists;
}

/**
 * Get reset status message
 */
export function getResetStatusMessage(
  pr: ProcurementPR | undefined,
  poList: ProcurementPO[]
): string {
  if (isBBraunDemoInitial(pr, poList)) {
    return "BBraun demo is in initial state";
  }

  const prExists = pr && pr.prNumber === "PR-4546245893";
  const poExists = poList.some(po => po.poNumber === "PO-4516638113");

  if (prExists && poExists) {
    return "BBraun PR converted to PO";
  } else if (prExists && !poExists) {
    return "BBraun PR exists, PO not yet created";
  } else {
    return "BBraun PR not found";
  }
}
