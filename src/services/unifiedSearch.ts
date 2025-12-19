import { CATALOG_ITEMS } from "../data/catalogData";
import type { CatalogItem, IntentType, SearchMetadata, FreeTextItemDraft } from "../types/workflow";

// Service keywords for classification
const SERVICE_KEYWORDS = [
  "consulting", "consultation", "consulting", "consultancy",
  "service", "services", "support", "maintenance",
  "training", "workshop", "implementation",
  "audit", "assessment", "analysis",
  "development", "project", "rollout",
  "sap", "oracle", "salesforce", "workday"
];

/**
 * Classify user intent based on the query
 */
export function classifyIntent(query: string): IntentType {
  const queryLower = query.toLowerCase();

  // Check if it matches service keywords
  const isService = SERVICE_KEYWORDS.some(keyword =>
    queryLower.includes(keyword)
  );

  if (isService) {
    return "service";
  }

  // Default to goods for catalog search
  return "goods";
}

/**
 * Infer quantity from the query
 * Examples: "10 chairs", "3 laptops", "five monitors"
 */
export function inferQuantity(query: string): number {
  const quantityMatch = query.match(/^(\d+)\s/);
  if (quantityMatch) {
    return parseInt(quantityMatch[1], 10);
  }

  // Handle written numbers
  const writtenNumbers: Record<string, number> = {
    "one": 1, "two": 2, "three": 3, "four": 4, "five": 5,
    "six": 6, "seven": 7, "eight": 8, "nine": 9, "ten": 10
  };

  const queryLower = query.toLowerCase();
  for (const [word, num] of Object.entries(writtenNumbers)) {
    if (queryLower.startsWith(word + " ")) {
      return num;
    }
  }

  return 1;
}

/**
 * Unified search across catalog items
 * Returns items ranked by relevance
 */
export function unifiedSearch(query: string): CatalogItem[] {
  const queryLower = query.toLowerCase();
  const queryWords = queryLower
    .split(/\s+/)
    .filter(word => word.length > 2)
    .filter(word => !["the", "and", "for", "with"].includes(word));

  // Score each catalog item
  const scoredItems = CATALOG_ITEMS.map(item => {
    let score = 0;

    // Exact name match (highest priority)
    if (item.name.toLowerCase() === queryLower) {
      score += 100;
    }

    // Name contains query
    if (item.name.toLowerCase().includes(queryLower)) {
      score += 50;
    }

    // Description contains query
    if (item.description.toLowerCase().includes(queryLower)) {
      score += 20;
    }

    // Keyword matches
    queryWords.forEach(queryWord => {
      item.keywords.forEach(keyword => {
        if (keyword.includes(queryWord)) {
          score += 10;
        }
        if (queryWord.includes(keyword)) {
          score += 5;
        }
      });

      // Match against name words
      if (item.name.toLowerCase().includes(queryWord)) {
        score += 8;
      }

      // Match against description words
      if (item.description.toLowerCase().includes(queryWord)) {
        score += 3;
      }
    });

    // Boost preferred suppliers
    if (item.isPreferredSupplier) {
      score *= 1.1;
    }

    return { item, score };
  });

  // Filter and sort by score
  return scoredItems
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8) // Top 8 results
    .map(({ item }) => item);
}

/**
 * Auto-populate free text item draft from query
 */
export function autoPopulateFreeTextItem(query: string): Partial<FreeTextItemDraft> {
  const draft: Partial<FreeTextItemDraft> = {
    itemName: extractItemName(query),
    description: query.trim(),
    currency: "USD",
    preferredSupplier: extractSupplierName(query) || "",
  };

  // Try to extract budget
  const budgetMatch = query.match(/\$\s*(\d+(?:,\d{3})*(?:\.\d{2})?)/);
  if (budgetMatch) {
    const amount = parseFloat(budgetMatch[1].replace(/,/g, ""));
    draft.estimatedValue = amount;
  }

  // Try to extract date/timeline
  const datePhrase = extractDatePhrase(query);
  if (datePhrase) {
    draft.desiredDeliveryDate = datePhrase;
  }

  return draft;
}

/**
 * Extract item name from query (main noun phrase)
 */
function extractItemName(query: string): string {
  // Remove quantity prefix
  let cleaned = query.replace(/^(\d+|one|two|three|four|five|six|seven|eight|nine|ten)\s+/i, "");

  // Remove common prefixes
  cleaned = cleaned.replace(/^(I need|I want|Need|Want|Buy|Purchase|Get me)\s+/i, "");

  // Take first few words (up to 5 words or first clause)
  const words = cleaned.split(/\s+/);
  const itemWords = words.slice(0, Math.min(5, words.length));

  // Capitalize first letter
  const itemName = itemWords.join(" ");
  return itemName.charAt(0).toUpperCase() + itemName.slice(1);
}

/**
 * Extract supplier/brand name from query
 */
function extractSupplierName(query: string): string | null {
  const knownSuppliers = ["Dell", "HP", "Lenovo", "Apple", "Microsoft", "Logitech", "LG", "Samsung",
                          "Accenture", "Deloitte", "PWC", "KPMG", "EY", "SAP", "Oracle"];

  const queryLower = query.toLowerCase();
  for (const supplier of knownSuppliers) {
    if (queryLower.includes(supplier.toLowerCase())) {
      return supplier;
    }
  }

  return null;
}

/**
 * Extract date phrase from query
 */
function extractDatePhrase(query: string): string | null {
  // Simple pattern matching for common date phrases
  const patterns = [
    /by\s+(end\s+of\s+)?(\w+\s+\d{1,2})/i,
    /by\s+(\w+\s+\d{4})/i,
    /in\s+(\d+\s+(?:days?|weeks?|months?))/i,
    /next\s+(week|month|quarter)/i,
  ];

  for (const pattern of patterns) {
    const match = query.match(pattern);
    if (match) {
      return match[0];
    }
  }

  return null;
}

/**
 * Perform complete search with classification
 * Simulates the 4-second async search operation
 */
export async function performSearch(query: string): Promise<SearchMetadata> {
  // Simulate 4-second delay
  await new Promise(resolve => setTimeout(resolve, 4000));

  const intentType = classifyIntent(query);
  const inferredQuantity = inferQuantity(query);

  let matchedItems: CatalogItem[] = [];

  // Only search catalog for goods intent
  if (intentType === "goods") {
    matchedItems = unifiedSearch(query);
  }

  // If no matches or service intent, treat as free text
  const finalIntent: IntentType =
    (intentType === "service" || matchedItems.length === 0)
      ? "freeText"
      : "goods";

  return {
    originalQuery: query,
    intentType: finalIntent,
    inferredQuantity,
    matchedItems,
    timestamp: new Date(),
  };
}
