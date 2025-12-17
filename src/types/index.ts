// ============================================================================
// PERSONA & USER CONTEXT
// ============================================================================

export interface Persona {
  id: string;
  name: string;
  role: string;
  entity: string;
  region: Region;
  location: string;
  businessUnit: string;
}

export type Region = "CEE" | "NA" | "EMEA" | "APAC" | "LATAM";

// ============================================================================
// INTENT CLASSIFICATION
// ============================================================================

export type IntentType =
  | "catalog_purchase"
  | "contract_call_off"
  | "services_sow"
  | "needs_sourcing"
  | "status_query"
  | "list_query"
  | "unknown";

export type ConfidenceLevel = "high" | "medium" | "low";

export interface IntentClassification {
  type: IntentType;
  confidence: ConfidenceLevel;
  confidenceScore: number; // 0-1
  needsHumanReview: boolean;
  reasoning: string[];
}

// ============================================================================
// CONTEXT INFERENCE
// ============================================================================

export type Category =
  | "IT Hardware"
  | "IT Software/SaaS"
  | "Marketing Services"
  | "Consulting Services"
  | "Facilities & Office"
  | "Legal Services"
  | "Facilities Management"
  | "Unknown";

export type UrgencyLevel = "low" | "medium" | "high";

export interface ContextInference {
  entity: string;
  region: Region;
  location: string;
  category: Category;
  urgency: UrgencyLevel;
  neededBy: string;
  inferenceNotes: string[];
}

// ============================================================================
// BACKEND ROUTING
// ============================================================================

export type BackendSystem =
  | "SAP_MM"
  | "Coupa"
  | "Local_ERP_X"
  | "Sourcing_HandOff";

export interface BackendRouting {
  system: BackendSystem;
  reasoning: string;
}

// ============================================================================
// LINE ITEMS
// ============================================================================

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitOfMeasure: string;
  unitPrice?: number;
  totalPrice?: number;
  supplierName?: string;
}

// ============================================================================
// PURCHASE REQUISITION
// ============================================================================

export type PRStatus = "DRAFT" | "SUBMITTED" | "APPROVED" | "REJECTED";

export interface PurchaseRequisition {
  id: string;
  prNumber: string; // e.g., "PR-0001"
  status: PRStatus;
  requestingPersona: Persona;
  originalMessage: string;
  intentClassification: IntentClassification;
  contextInference: ContextInference;
  backendRouting: BackendRouting;
  lineItems: LineItem[];
  createdAt: Date;
  updatedAt: Date;
  attachments?: string[];
}

// ============================================================================
// MOCK DATA STRUCTURES
// ============================================================================

export interface CatalogItem {
  category: Category;
  supplierName: string;
  typicalUnitPrice: number;
  unitOfMeasure: string;
}

export interface MockContract {
  id: string;
  type: "hardware" | "software" | "services" | "marketing";
  supplierName: string;
  entity: string;
  category: Category;
  description: string;
}

// ============================================================================
// CHAT MESSAGES
// ============================================================================

export type MessageRole = "user" | "assistant" | "system";

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  prNumber?: string; // Link to a PR if this message created/refers to one
}
