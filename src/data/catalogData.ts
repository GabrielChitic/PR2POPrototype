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
  },
  {
    id: "cat-003",
    name: "Dell Latitude 5430 Laptop",
    description: "14-inch business laptop, Intel i7, 16GB RAM, 512GB SSD",
    category: "IT Hardware",
    unitPrice: 1200,
    currency: "USD",
    unitOfMeasure: "EA",
    supplier: "ACME_LAPTOPS",
    supplierName: "Dell Direct",
    isPreferredSupplier: true,
    leadTimeDays: 5,
    keywords: ["laptop", "computer", "dell", "latitude", "pc", "notebook", "5430"],
    specs: { "Processor": "Intel i7", "RAM": "16GB", "Storage": "512GB SSD" },
  },
  {
    id: "cat-004",
    name: "HP EliteBook 840",
    description: "14-inch business laptop, Intel i7, 16GB RAM, 512GB SSD",
    category: "IT Hardware",
    unitPrice: 1350,
    currency: "USD",
    unitOfMeasure: "EA",
    supplier: "HP_DIRECT",
    supplierName: "HP Direct",
    isPreferredSupplier: false,
    leadTimeDays: 10,
    keywords: ["laptop", "computer", "hp", "elitebook", "pc", "notebook"],
    specs: { "Processor": "Intel i7", "RAM": "16GB", "Storage": "512GB SSD" },
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
  },
];

export function searchCatalog(query: string): CatalogItem[] {
  const queryLower = query.toLowerCase();
  const keywords = queryLower.split(" ").filter((word) => word.length > 2);

  return CATALOG_ITEMS.filter((item) => {
    // Match against name, description, or keywords
    const nameMatch = item.name.toLowerCase().includes(queryLower);
    const descMatch = item.description.toLowerCase().includes(queryLower);
    const keywordMatch = item.keywords.some((keyword) =>
      keywords.some((queryWord) => keyword.includes(queryWord) || queryWord.includes(keyword))
    );

    return nameMatch || descMatch || keywordMatch;
  }).slice(0, 5); // Return top 5 matches
}
