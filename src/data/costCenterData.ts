// ============================================================================
// COST CENTER MASTER DATA
// ============================================================================

export interface CostCenter {
  code: string;
  name: string;
  entity: string;
  location: string;
  department: string;
  active: boolean;
}

// Valid cost centers for UIPATH-RO entity
export const VALID_COST_CENTERS: CostCenter[] = [
  {
    code: "CC-RO-BUCH-ENG",
    name: "Bucharest Engineering",
    entity: "UIPATH-RO",
    location: "Bucharest",
    department: "Engineering",
    active: true,
  },
  {
    code: "CC-RO-BUCH-IT",
    name: "Bucharest IT Operations",
    entity: "UIPATH-RO",
    location: "Bucharest",
    department: "IT",
    active: true,
  },
  {
    code: "CC-RO-CJ-OPS",
    name: "Cluj Operations",
    entity: "UIPATH-RO",
    location: "Cluj",
    department: "Operations",
    active: true,
  },
  {
    code: "CC-RO-TM-FIN",
    name: "Timisoara Finance",
    entity: "UIPATH-RO",
    location: "Timisoara",
    department: "Finance",
    active: true,
  },
  {
    code: "CC-RO-BUCH-HR",
    name: "Bucharest Human Resources",
    entity: "UIPATH-RO",
    location: "Bucharest",
    department: "HR",
    active: true,
  },
  {
    code: "CC-RO-BUCH-MKT",
    name: "Bucharest Marketing",
    entity: "UIPATH-RO",
    location: "Bucharest",
    department: "Marketing",
    active: true,
  },
  {
    code: "CC-RO-BUCH-SALES",
    name: "Bucharest Sales",
    entity: "UIPATH-RO",
    location: "Bucharest",
    department: "Sales",
    active: true,
  },
];

// Validation function
export function isValidCostCenter(costCenter: string, entity: string): boolean {
  return VALID_COST_CENTERS.some(
    (cc) => cc.code === costCenter && cc.entity === entity && cc.active
  );
}

// Get cost centers for entity
export function getCostCentersForEntity(entity: string): CostCenter[] {
  return VALID_COST_CENTERS.filter((cc) => cc.entity === entity && cc.active);
}
