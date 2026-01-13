// Accounting Master Data for Stage 3

export interface CommodityGroup {
  id: string;
  code: string;
  name: string;
  category: string;
}

export interface GLAccount {
  id: string;
  code: string;
  name: string;
  accountType: "OPEX" | "CAPEX";
  category: string;
}

export interface CostCenter {
  id: string;
  code: string;
  name: string;
  location: string;
  department: string;
}

// Commodity Groups
export const COMMODITY_GROUPS: CommodityGroup[] = [
  {
    id: "cg-001",
    code: "IT-HW-LAPTOPS",
    name: "IT Hardware - Laptops",
    category: "IT Hardware",
  },
  {
    id: "cg-002",
    code: "IT-HW-DESKTOPS",
    name: "IT Hardware - Desktops",
    category: "IT Hardware",
  },
  {
    id: "cg-003",
    code: "IT-HW-MONITORS",
    name: "IT Hardware - Monitors",
    category: "IT Hardware",
  },
  {
    id: "cg-004",
    code: "OFFICE-FURN",
    name: "Office Furniture",
    category: "Facilities & Office",
  },
  {
    id: "cg-005",
    code: "IT-SW-LICENSES",
    name: "IT Software Licenses",
    category: "IT Software",
  },
  // R2 Denmark specific
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

// GL Accounts
export const GL_ACCOUNTS: GLAccount[] = [
  {
    id: "gl-001",
    code: "612000",
    name: "IT Equipment (OPEX)",
    accountType: "OPEX",
    category: "IT Hardware",
  },
  {
    id: "gl-002",
    code: "615000",
    name: "IT Equipment (CAPEX)",
    accountType: "CAPEX",
    category: "IT Hardware",
  },
  {
    id: "gl-003",
    code: "620000",
    name: "Office Equipment & Furniture",
    accountType: "OPEX",
    category: "Facilities & Office",
  },
  {
    id: "gl-004",
    code: "625000",
    name: "Software Licenses",
    accountType: "OPEX",
    category: "IT Software",
  },
  {
    id: "gl-005",
    code: "630000",
    name: "Professional Services",
    accountType: "OPEX",
    category: "Services",
  },
  // R2 Denmark specific
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

// Cost Centers
export const COST_CENTERS: CostCenter[] = [
  {
    id: "cc-001",
    code: "CC-RO-BUCH-ENG",
    name: "Engineering - Bucharest",
    location: "Bucharest",
    department: "Engineering",
  },
  {
    id: "cc-002",
    code: "CC-RO-BUCH-PROD",
    name: "Product - Bucharest",
    location: "Bucharest",
    department: "Product",
  },
  {
    id: "cc-003",
    code: "CC-US-NYC-ENG",
    name: "Engineering - New York",
    location: "New York",
    department: "Engineering",
  },
  {
    id: "cc-004",
    code: "CC-US-NYC-SALES",
    name: "Sales - New York",
    location: "New York",
    department: "Sales",
  },
  {
    id: "cc-005",
    code: "CC-UK-LON-ENG",
    name: "Engineering - London",
    location: "London",
    department: "Engineering",
  },
  // R2 Denmark specific
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

// Mapping rules: Category → Commodity Group + GL Account
export function getDefaultAccountingForCategory(category: string): {
  commodityGroup: CommodityGroup | null;
  glAccount: GLAccount | null;
} {
  const categoryLower = category.toLowerCase();

  if (categoryLower.includes("it hardware") || categoryLower.includes("laptop") || categoryLower.includes("computer")) {
    return {
      commodityGroup: COMMODITY_GROUPS.find(cg => cg.code === "IT-HW-LAPTOPS") || null,
      glAccount: GL_ACCOUNTS.find(gl => gl.code === "612000") || null,
    };
  }

  if (categoryLower.includes("facilities") || categoryLower.includes("office") || categoryLower.includes("furniture")) {
    return {
      commodityGroup: COMMODITY_GROUPS.find(cg => cg.code === "OFFICE-FURN") || null,
      glAccount: GL_ACCOUNTS.find(gl => gl.code === "620000") || null,
    };
  }

  // R2: Safety equipment
  if (categoryLower.includes("safety") || categoryLower.includes("ppe") || categoryLower.includes("vest")) {
    return {
      commodityGroup: COMMODITY_GROUPS.find(cg => cg.code === "SAFETY-PPE") || null,
      glAccount: GL_ACCOUNTS.find(gl => gl.code === "615200") || null,
    };
  }

  // Default fallback
  return {
    commodityGroup: COMMODITY_GROUPS[0] || null,
    glAccount: GL_ACCOUNTS[0] || null,
  };
}

// Get default cost center for a location
export function getDefaultCostCenterForLocation(location: string): CostCenter | null {
  const locationLower = location.toLowerCase();

  if (locationLower.includes("bucharest")) {
    return COST_CENTERS.find(cc => cc.location === "Bucharest") || null;
  }

  if (locationLower.includes("new york") || locationLower.includes("nyc")) {
    return COST_CENTERS.find(cc => cc.location === "New York") || null;
  }

  if (locationLower.includes("london")) {
    return COST_CENTERS.find(cc => cc.location === "London") || null;
  }

  // R2: Aarhus
  if (locationLower.includes("aarhus") || locationLower.includes("aar")) {
    return COST_CENTERS.find(cc => cc.code === "CC-DK-AAR-MAINT") || null;
  }

  // R2: Copenhagen
  if (locationLower.includes("copenhagen") || locationLower.includes("cph")) {
    return COST_CENTERS.find(cc => cc.location === "Copenhagen") || null;
  }

  // Default fallback
  return COST_CENTERS[0] || null;
}
