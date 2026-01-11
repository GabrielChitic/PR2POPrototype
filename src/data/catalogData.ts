import type { CatalogItem } from "../types/workflow";

export const CATALOG_ITEMS: CatalogItem[] = [
  {
    id: "cat-001",
    name: "ErgoChair Pro 3000",
    description: "Premium ergonomic office chair with lumbar support and adjustable armrests",
    category: "Facilities & Office",
    unitPrice: 450,
    currency: "USD",
    unitOfMeasure: "EA",
    supplier: "OFFICE_DEPOT",
    supplierName: "Office Depot",
    isPreferredSupplier: true,
    leadTimeDays: 7,
    keywords: ["chair", "ergonomic", "office", "furniture", "seating"],
    specs: { "Weight Capacity": "300 lbs", "Warranty": "5 years" },
    compliance: {
      preferred: true,
      contractStatus: "valid",
      allowed: true,
    },
  },
  {
    id: "cat-002",
    name: "Comfort Plus Office Chair",
    description: "Standard office chair with basic ergonomic features",
    category: "Facilities & Office",
    unitPrice: 250,
    currency: "USD",
    unitOfMeasure: "EA",
    supplier: "GENERIC_SUPPLIER",
    supplierName: "Generic Office Supplies",
    isPreferredSupplier: false,
    leadTimeDays: 14,
    keywords: ["chair", "office", "furniture", "seating"],
    specs: { "Warranty": "2 years" },
    compliance: {
      preferred: false,
      preferredReason: "Non-preferred supplier",
      contractStatus: "missing",
      contractReason: "No framework agreement",
      allowed: true,
    },
  },
  {
    id: "cat-003",
    sku: "DELL-LAT-5430-I7-16-512",
    name: "Dell Latitude 5430 Laptop",
    description: "14-inch business laptop, Intel i7, 16GB RAM, 512GB SSD",
    category: "IT Hardware",
    unitPrice: 1200,
    currency: "USD",
    unitOfMeasure: "EA",
    supplier: "DELL_DIRECT",
    supplierId: "SUP-10001",
    supplierName: "Dell Direct",
    isPreferredSupplier: true,
    leadTimeDays: 5,
    keywords: ["laptop", "computer", "dell", "latitude", "pc", "notebook", "5430"],
    specs: { "Processor": "Intel i7-1255U", "RAM": "16GB DDR4", "Storage": "512GB SSD", "Display": "14\" FHD" },
    compliance: {
      preferred: true,
      contractStatus: "valid",
      contractReason: "Dell Master Agreement valid until 2026",
      allowed: true,
    },
  },
  {
    id: "cat-004",
    sku: "HP-EB-840-G9-I7-16-512",
    name: "HP EliteBook 840 G9",
    description: "14-inch business laptop, Intel i7, 16GB RAM, 512GB SSD",
    category: "IT Hardware",
    unitPrice: 1350,
    currency: "USD",
    unitOfMeasure: "EA",
    supplier: "HP_DIRECT",
    supplierId: "SUP-10002",
    supplierName: "HP Direct",
    isPreferredSupplier: false,
    leadTimeDays: 10,
    keywords: ["laptop", "computer", "hp", "elitebook", "pc", "notebook", "840"],
    specs: { "Processor": "Intel i7-1265U", "RAM": "16GB DDR4", "Storage": "512GB SSD", "Display": "14\" FHD" },
    compliance: {
      preferred: false,
      preferredReason: "Non-preferred supplier - Dell preferred for laptops",
      contractStatus: "expired",
      contractReason: "HP framework expired in Jan 2025",
      allowed: true,
    },
  },
  {
    id: "cat-009",
    sku: "LNV-TP-X1C-G10-I7-16-512",
    name: "Lenovo ThinkPad X1 Carbon Gen 10",
    description: "14-inch ultralight business laptop, Intel i7, 16GB RAM, 512GB SSD",
    category: "IT Hardware",
    unitPrice: 1400,
    currency: "USD",
    unitOfMeasure: "EA",
    supplier: "LENOVO_DIRECT",
    supplierId: "SUP-10003",
    supplierName: "Lenovo Direct",
    isPreferredSupplier: true,
    leadTimeDays: 7,
    keywords: ["laptop", "computer", "lenovo", "thinkpad", "x1", "carbon", "pc", "notebook", "ultralight"],
    specs: { "Processor": "Intel i7-1260P", "RAM": "16GB LPDDR5", "Storage": "512GB SSD", "Weight": "2.48 lbs", "Display": "14\" WUXGA" },
    compliance: {
      preferred: true,
      contractStatus: "valid",
      contractReason: "Lenovo Master Agreement valid until 2026",
      allowed: false,
      blockedReason: "Blocked for contractors - only for full-time employees",
    },
  },
  {
    id: "cat-010",
    sku: "DELL-LAT-3420-I5-8-256",
    name: "Dell Latitude 3420 Laptop",
    description: "14-inch budget business laptop, Intel i5, 8GB RAM, 256GB SSD",
    category: "IT Hardware",
    unitPrice: 1100,
    currency: "USD",
    unitOfMeasure: "EA",
    supplier: "DELL_DIRECT",
    supplierId: "SUP-10001",
    supplierName: "Dell Direct",
    isPreferredSupplier: true,
    leadTimeDays: 14,
    keywords: ["laptop", "computer", "dell", "latitude", "pc", "notebook", "3420", "budget"],
    specs: { "Processor": "Intel i5-1135G7", "RAM": "8GB DDR4", "Storage": "256GB SSD", "Display": "14\" HD" },
    compliance: {
      preferred: true,
      contractStatus: "valid",
      contractReason: "Dell Master Agreement valid until 2026",
      allowed: true,
    },
  },
  {
    id: "cat-011",
    sku: "ACER-ASP5-A515-I5-8-512",
    name: "Acer Aspire 5 Laptop",
    description: "15.6-inch laptop, Intel i5, 8GB RAM, 512GB SSD",
    category: "IT Hardware",
    unitPrice: 950,
    currency: "USD",
    unitOfMeasure: "EA",
    supplier: "ACER_DIRECT",
    supplierId: "SUP-10005",
    supplierName: "Acer Direct",
    isPreferredSupplier: false,
    leadTimeDays: 12,
    keywords: ["laptop", "computer", "acer", "aspire", "pc", "notebook"],
    specs: { "Processor": "Intel i5-1135G7", "RAM": "8GB DDR4", "Storage": "512GB SSD", "Display": "15.6\" FHD" },
    compliance: {
      preferred: false,
      preferredReason: "Non-preferred supplier - Dell preferred for laptops",
      contractStatus: "missing",
      contractReason: "No framework agreement with Acer",
      allowed: true,
    },
  },
  {
    id: "cat-005",
    name: "LG 27-inch Monitor",
    description: "27-inch 4K UHD monitor with USB-C connectivity",
    category: "IT Hardware",
    unitPrice: 400,
    currency: "USD",
    unitOfMeasure: "EA",
    supplier: "ACME_LAPTOPS",
    supplierName: "LG Electronics",
    isPreferredSupplier: true,
    leadTimeDays: 3,
    keywords: ["monitor", "display", "screen", "lg", "4k"],
    specs: { "Resolution": "4K UHD", "Size": "27 inches", "Connectivity": "USB-C" },
    compliance: {
      preferred: true,
      contractStatus: "valid",
      allowed: true,
    },
  },
  {
    id: "cat-006",
    name: "Standing Desk Pro",
    description: "Electric height-adjustable standing desk, 60x30 inches",
    category: "Facilities & Office",
    unitPrice: 650,
    currency: "USD",
    unitOfMeasure: "EA",
    supplier: "OFFICE_DEPOT",
    supplierName: "Office Depot",
    isPreferredSupplier: true,
    leadTimeDays: 10,
    keywords: ["desk", "standing", "adjustable", "furniture", "workstation"],
    specs: { "Size": "60x30 inches", "Height Range": "25-50 inches" },
    compliance: {
      preferred: true,
      contractStatus: "valid",
      allowed: true,
    },
  },
  {
    id: "cat-007",
    name: "Wireless Keyboard & Mouse",
    description: "Logitech MX Keys and MX Master 3 bundle",
    category: "IT Hardware",
    unitPrice: 180,
    currency: "USD",
    unitOfMeasure: "EA",
    supplier: "ACME_LAPTOPS",
    supplierName: "Logitech",
    isPreferredSupplier: true,
    leadTimeDays: 2,
    keywords: ["keyboard", "mouse", "logitech", "wireless", "accessories"],
    specs: { "Type": "Wireless", "Battery Life": "5 months" },
    compliance: {
      preferred: true,
      contractStatus: "valid",
      allowed: true,
    },
  },
  {
    id: "cat-008",
    name: "Desk Lamp LED",
    description: "Adjustable LED desk lamp with USB charging port",
    category: "Facilities & Office",
    unitPrice: 65,
    currency: "USD",
    unitOfMeasure: "EA",
    supplier: "OFFICE_DEPOT",
    supplierName: "Office Depot",
    isPreferredSupplier: true,
    leadTimeDays: 3,
    keywords: ["lamp", "light", "led", "desk", "lighting"],
    specs: { "Brightness": "Adjustable", "Features": "USB charging port" },
    compliance: {
      preferred: true,
      contractStatus: "valid",
      allowed: true,
    },
  },
];

export function searchCatalog(query: string): CatalogItem[] {
  const queryLower = query.toLowerCase();
  const keywords = queryLower.split(" ").filter((word) => word.length > 2);

  const results = CATALOG_ITEMS.filter((item) => {
    // Match against name, description, or keywords
    const nameMatch = item.name.toLowerCase().includes(queryLower);
    const descMatch = item.description.toLowerCase().includes(queryLower);
    const keywordMatch = item.keywords.some((keyword) =>
      keywords.some((queryWord) => keyword.includes(queryWord) || queryWord.includes(keyword))
    );

    return nameMatch || descMatch || keywordMatch;
  });

  // Sort for deterministic order: preferred allowed items first, then by price ascending
  results.sort((a, b) => {
    // Allowed items before blocked items
    if (a.compliance.allowed !== b.compliance.allowed) {
      return a.compliance.allowed ? -1 : 1;
    }
    // Preferred items before non-preferred
    if (a.compliance.preferred !== b.compliance.preferred) {
      return a.compliance.preferred ? -1 : 1;
    }
    // Then by price ascending
    return a.unitPrice - b.unitPrice;
  });

  // Return top 6 matches for laptops, 5 for others
  const isLaptopSearch = queryLower.includes("laptop") || queryLower.includes("pc") || queryLower.includes("computer");
  return results.slice(0, isLaptopSearch ? 6 : 5);
}
