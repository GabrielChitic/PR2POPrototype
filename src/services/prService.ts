import type { PurchaseRequisition, Persona, LineItem } from "../types";
import { classifyIntent, isQueryIntent } from "./intentClassifier";
import { inferContext } from "./contextInference";
import { routeToBackend } from "./backendRouter";
import { getCatalogItemByCategory } from "../data/mockData";

// ============================================================================
// PR SERVICE - Main orchestrator
// ============================================================================

let prCounter = 0;
const prs: Map<string, PurchaseRequisition> = new Map();

function generatePRNumber(): string {
  prCounter++;
  return `PR-${prCounter.toString().padStart(4, "0")}`;
}

function generateId(): string {
  return `pr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function extractQuantityAndDescription(
  message: string
): { quantity: number; description: string } {
  // Try to extract quantity from message
  const quantityMatch = message.match(/\b(\d+)\b/);
  const quantity = quantityMatch ? parseInt(quantityMatch[1], 10) : 1;

  // Use the message as description (clean it up a bit)
  let description = message.trim();
  if (description.length > 100) {
    description = description.substring(0, 100) + "...";
  }

  return { quantity, description };
}

function createLineItems(
  message: string,
  category: string
): LineItem[] {
  const { quantity, description } = extractQuantityAndDescription(message);
  const catalogItem = getCatalogItemByCategory(category);

  const lineItem: LineItem = {
    id: generateId(),
    description,
    quantity,
    unitOfMeasure: catalogItem?.unitOfMeasure || "EA",
    unitPrice: catalogItem?.typicalUnitPrice,
    totalPrice: catalogItem
      ? catalogItem.typicalUnitPrice * quantity
      : undefined,
    supplierName: catalogItem?.supplierName,
  };

  return [lineItem];
}

export function createPurchaseRequisition(
  message: string,
  persona: Persona
): PurchaseRequisition {
  // Step 1: Classify intent
  const intentClassification = classifyIntent(message);

  // Step 2: Infer context
  const contextInference = inferContext(message, persona);

  // Step 3: Route to backend
  const backendRouting = routeToBackend(
    intentClassification.type,
    contextInference
  );

  // Step 4: Create line items
  const lineItems = createLineItems(message, contextInference.category);

  // Step 5: Build PR object
  const prNumber = generatePRNumber();
  const pr: PurchaseRequisition = {
    id: generateId(),
    prNumber,
    status: "DRAFT",
    requestingPersona: persona,
    originalMessage: message,
    intentClassification,
    contextInference,
    backendRouting,
    lineItems,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // Step 6: Store in memory
  prs.set(prNumber, pr);

  return pr;
}

export function getPRByNumber(prNumber: string): PurchaseRequisition | undefined {
  // Normalize PR number (handle "PR-1", "PR1", "1", etc.)
  let normalizedNumber = prNumber.toUpperCase().trim();

  // Add PR- prefix if not present
  if (!normalizedNumber.startsWith("PR-") && !normalizedNumber.startsWith("PR")) {
    normalizedNumber = `PR-${normalizedNumber.padStart(4, "0")}`;
  } else if (normalizedNumber.startsWith("PR") && !normalizedNumber.startsWith("PR-")) {
    normalizedNumber = normalizedNumber.replace("PR", "PR-");
    // Ensure 4-digit padding
    const parts = normalizedNumber.split("-");
    if (parts[1]) {
      normalizedNumber = `PR-${parts[1].padStart(4, "0")}`;
    }
  }

  return prs.get(normalizedNumber);
}

export function getAllPRs(): PurchaseRequisition[] {
  return Array.from(prs.values()).sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
  );
}

export function extractPRNumber(message: string): string | null {
  // Try to extract PR number from message
  // Patterns: "PR-0001", "PR-1", "PR1", "pr 1", etc.
  const patterns = [
    /PR[-\s]?(\d+)/i,
    /pr[-\s]?(\d+)/i,
    /#(\d+)/,
  ];

  for (const pattern of patterns) {
    const match = message.match(pattern);
    if (match) {
      const number = match[1];
      return `PR-${number.padStart(4, "0")}`;
    }
  }

  return null;
}

// Helper to parse message and determine action
export interface ParsedMessage {
  action: "create" | "status" | "list" | "unknown";
  prNumber?: string;
  message: string;
}

export function parseMessage(message: string): ParsedMessage {
  const intent = classifyIntent(message);

  if (intent.type === "status_query") {
    const prNumber = extractPRNumber(message);
    return {
      action: "status",
      prNumber: prNumber || undefined,
      message,
    };
  }

  if (intent.type === "list_query") {
    return {
      action: "list",
      message,
    };
  }

  if (isQueryIntent(intent.type)) {
    return {
      action: "unknown",
      message,
    };
  }

  // Default to create
  return {
    action: "create",
    message,
  };
}

// Reset function for testing
export function resetPRStore(): void {
  prs.clear();
  prCounter = 0;
}
