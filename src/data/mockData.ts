import type { Persona, CatalogItem, MockContract } from "../types";

// ============================================================================
// PERSONAS
// ============================================================================

export const PERSONAS: Persona[] = [
  {
    id: "persona-1",
    name: "Ana Popescu",
    role: "IT Project Manager",
    entity: "RO01",
    region: "CEE",
    location: "Bucharest",
    businessUnit: "IT",
  },
  {
    id: "persona-2",
    name: "John Smith",
    role: "Marketing Manager",
    entity: "US01",
    region: "NA",
    location: "New York",
    businessUnit: "Marketing",
  },
];

// ============================================================================
// CATALOG DATA
// ============================================================================

export const CATALOG: CatalogItem[] = [
  {
    category: "IT Hardware",
    supplierName: "ACME_LAPTOPS",
    typicalUnitPrice: 900,
    unitOfMeasure: "EA",
  },
  {
    category: "IT Software/SaaS",
    supplierName: "CLOUD_SOFT",
    typicalUnitPrice: 150,
    unitOfMeasure: "LICENSE",
  },
  {
    category: "Marketing Services",
    supplierName: "BRIGHT_ADS",
    typicalUnitPrice: 3000,
    unitOfMeasure: "MONTH",
  },
  {
    category: "Consulting Services",
    supplierName: "GLOBEX_CONSULTING",
    typicalUnitPrice: 1200,
    unitOfMeasure: "DAY",
  },
  {
    category: "Facilities & Office",
    supplierName: "OFFICE_DEPOT",
    typicalUnitPrice: 200,
    unitOfMeasure: "EA",
  },
];

// ============================================================================
// MOCK CONTRACTS
// ============================================================================

export const MOCK_CONTRACTS: MockContract[] = [
  {
    id: "contract-1",
    type: "hardware",
    supplierName: "ACME_LAPTOPS",
    entity: "RO01",
    category: "IT Hardware",
    description: "IT Hardware supply contract for Romanian entity",
  },
  {
    id: "contract-2",
    type: "marketing",
    supplierName: "BRIGHT_ADS",
    entity: "US01",
    category: "Marketing Services",
    description: "Marketing agency retainer for US operations",
  },
  {
    id: "contract-3",
    type: "services",
    supplierName: "GLOBEX_CONSULTING",
    entity: "US01",
    category: "Consulting Services",
    description: "Consulting services framework agreement",
  },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function getCatalogItemByCategory(category: string): CatalogItem | undefined {
  return CATALOG.find((item) => item.category === category);
}

export function getContractByEntityAndCategory(
  entity: string,
  category: string
): MockContract | undefined {
  return MOCK_CONTRACTS.find(
    (contract) => contract.entity === entity && contract.category === category
  );
}
