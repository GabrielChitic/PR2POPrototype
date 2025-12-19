// ============================================================================
// WORKFLOW-SPECIFIC TYPES FOR PR CREATION FLOW
// ============================================================================

export type WorkflowStep = 0 | 1 | 2 | 3 | 4 | 5;

export type PRStatus =
  | "DRAFT"
  | "IN_PROGRESS"
  | "CONFIRMED"
  | "VALIDATED"
  | "SUBMITTED"
  | "IN_APPROVAL"
  | "APPROVED"
  | "REJECTED"
  | "PO_CREATED";

export type ItemType = "goods" | "service" | "freeText" | "unknown";
export type IntentType = "goods" | "service" | "freeText";
export type RequestType = "catalogGoods" | "freeTextGoods" | "servicesOrComplex";

export interface DraftLineItem {
  id: string;
  type: ItemType;
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  unitOfMeasure: string;
  supplier: string;
  category?: string;
  isPreferredSupplier?: boolean;
  // For free text items
  estimatedValue?: number;
  currency?: string;
  desiredDeliveryDate?: string;
  preferredSupplier?: string;
}

export interface PurchaseInfo {
  usage: string;
  isPartOfProject: boolean;
  projectName?: string;
  deliverTo: string;
  deliverToLocation: string;
  needByDate: string;
  involvesPersonalData: boolean;
  involvesThirdParty: boolean;
  requiresSpecialApproval: boolean;
}

export interface ValidationIssue {
  id: string;
  type: "error" | "warning" | "suggestion";
  message: string;
  field?: string;
  canFix: boolean;
  fixAction?: string;
}

export interface ApprovalStep {
  id: string;
  role: string;
  approverName: string;
  status: "pending" | "approved" | "rejected" | "skipped";
  order: number;
}

export interface DraftPR {
  draftId: string;
  title?: string;
  currentStep: WorkflowStep;
  status: PRStatus;
  lineItems: DraftLineItem[];
  purchaseInfo: PurchaseInfo | null;
  validationIssues: ValidationIssue[];
  approvalPath: ApprovalStep[];
  attachments: string[];
  requesterNotes: string;
  createdAt: Date;
  updatedAt: Date;
  // For smart search
  intentType?: IntentType;
  lastSearchResults?: CatalogItem[];
  // Request type for Step 2 variant switching
  requestType?: RequestType;
  // Uploaded files with metadata
  uploadedFiles?: UploadedFile[];
  // Selected CLM contract for services
  selectedContract?: CLMContract;
}

// Uploaded file metadata
export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: Date;
}

// CLM Contract
export interface CLMContract {
  id: string;
  name: string;
  supplier: string;
  supplierId: string;
  contractId: string;
  category: string;
  validFrom: string;
  validUntil: string;
  region?: string;
  relevanceHint: string;
  status: "active" | "expiring_soon" | "expired";
}

// Catalog items for search
export interface CatalogItem {
  id: string;
  name: string;
  description: string;
  category: string;
  unitPrice: number;
  currency: string;
  unitOfMeasure: string;
  supplier: string;
  supplierName?: string;
  isPreferredSupplier: boolean;
  imageUrl?: string;
  keywords: string[];
  leadTimeDays?: number;
  specs?: Record<string, string>;
}

// Free text item form data
export interface FreeTextItemDraft {
  itemName: string;
  description: string;
  estimatedValue: number;
  currency: string;
  desiredDeliveryDate: string;
  preferredSupplier: string;
  category?: string;
}

// Search metadata
export interface SearchMetadata {
  originalQuery: string;
  intentType: IntentType;
  inferredQuantity: number;
  matchedItems: CatalogItem[];
  timestamp: Date;
}
