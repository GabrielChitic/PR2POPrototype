// ============================================================================
// WORKFLOW-SPECIFIC TYPES FOR PR CREATION FLOW
// ============================================================================

export type WorkflowStep = 0 | 1 | 2 | 3 | 4 | 5;

// Phase name mapping for semantic labels
export type PhaseName =
  | "PHASE_0_BACKGROUND"
  | "PHASE_1_SHOP_SELECT"
  | "PHASE_2_DELIVERY_DETAILS"
  | "PHASE_3_ACCOUNTING_POLICY"
  | "PHASE_4_REVIEW_SUBMIT"
  | "PHASE_5_TRACK_APPROVALS";

// User-visible phase labels (Phase 0 is internal only)
export const PHASE_LABELS: Record<WorkflowStep, string> = {
  0: "Background Processing", // Internal only
  1: "Shop & Select",
  2: "Delivery & Details",
  3: "Accounting & Policy Checks",
  4: "Review & Submit",
  5: "Track & Approvals",
};

// Semantic phase name mapping
export const PHASE_NAMES: Record<WorkflowStep, PhaseName> = {
  0: "PHASE_0_BACKGROUND",
  1: "PHASE_1_SHOP_SELECT",
  2: "PHASE_2_DELIVERY_DETAILS",
  3: "PHASE_3_ACCOUNTING_POLICY",
  4: "PHASE_4_REVIEW_SUBMIT",
  5: "PHASE_5_TRACK_APPROVALS",
};

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

export type ContractStatus = "valid" | "expired" | "missing" | "issue";

export interface ComplianceInfo {
  preferred: boolean;
  preferredReason?: string;
  contractStatus: ContractStatus;
  contractReason?: string;
  allowed: boolean;
  blockedReason?: string;
}

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
  // Compliance tracking
  compliance?: ComplianceInfo;
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
  // R2 NON_CATALOG specific fields
  shipToSiteId?: string;
  shipToAddress?: string;
  deliveryInstructions?: string;
  deliveryContactName?: string;
  deliveryContactEmail?: string;
  deliveryContactPhone?: string;
  deliveryContactIsSelf?: boolean;
}

export type CheckStatus = "pass" | "warn" | "block";

export interface AccountingValidation {
  commodityGroup: CheckStatus;
  glAccount: CheckStatus;
  costCenter: CheckStatus;
  reasons?: {
    commodityGroup?: string;
    glAccount?: string;
    costCenter?: string;
  };
}

export interface PolicyCheckResult {
  id: string;
  checkName: string;
  status: CheckStatus;
  message: string;
  detail?: string;
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

// Lifecycle timeline node (expanded approval path)
export interface LifecycleNode {
  id: string;
  label: string; // e.g., "Submitted", "Manager approval", "PR approved"
  owner?: string; // e.g., "Sarah Johnson" (optional for system steps)
  status: "completed" | "in_progress" | "pending" | "on_hold";
  completedAt?: Date;
  helperText?: string; // e.g., "Waiting on Sarah Johnson"
}

// Submitted PR (stored in collection for My Requests)
export interface SubmittedPR {
  prNumber: string; // e.g., "PR-1234"
  prId: string; // internal ID
  title: string; // e.g., "15 Laptops"
  status: "pending_approval" | "on_hold" | "approved" | "po_created" | "rejected";
  currentStep: string; // e.g., "Manager approval"
  currentOwner?: string; // e.g., "Sarah Johnson"
  timeInStep: string; // e.g., "2h ago"
  submittedAt: Date;
  submittedBy: string; // requester name
  totalValue: number;
  lifecycleTimeline: LifecycleNode[];
  actionRequired?: RequesterAction;
  // Compact summaries
  itemsSummary: string; // e.g., "Dell Latitude 5430 × 15"
  deliverySummary: string; // e.g., "Bucharest, Need by: 2024-04-15"
  accountingSummary: string; // e.g., "IT-HW-LAPTOPS, 612000, CC-RO-BUCH-ENG"
  policySummary: string[]; // e.g., ["Preferred supplier ✓", "Valid contract ✓"]
  canEdit: boolean; // true if still in early stage
  // Reference to original draft (for editing)
  draftPR?: DraftPR;
}

// Requester action needed
export interface RequesterAction {
  id: string;
  type: "confirm_delivery" | "provide_info" | "approve_change" | "other";
  title: string; // e.g., "Confirm delivery contact"
  description: string; // why it's needed
  completedAt?: Date;
}

// Internal blocker tracking for Phase 0 (not visible in UI)
export interface InternalBlocker {
  id: string;
  type: "need_by_date" | "ship_to" | "cost_center" | "other";
  severity: "high" | "medium" | "low";
  description: string;
  resolved: boolean;
}

export interface DraftPR {
  draftId: string;
  prNumber?: string; // e.g., "PR-1234" (set when submitted)
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
  // Phase 0 metadata (extracted from first user message)
  requestStatement?: string; // Raw user message
  itemIntent?: string; // e.g., "laptops"
  inferredQuantity?: number; // e.g., 15
  inferredTimeframe?: string; // e.g., "April"
  inferredCity?: string; // e.g., "Bucharest"
  // Internal blocker tracking (not shown in UI per user preference)
  internalBlockers?: InternalBlocker[];
  // Stage 3: Accounting & Policy Checks
  entityCode?: string; // Read-only, e.g., "UIPATH-RO"
  commodityGroupId?: string;
  commodityGroupCode?: string;
  commodityGroupName?: string;
  glAccountId?: string;
  glAccountCode?: string;
  glAccountName?: string;
  costCenterId?: string;
  costCenterCode?: string;
  costCenterName?: string;
  accountingValidation?: AccountingValidation;
  policyChecks?: PolicyCheckResult[];
  // R2 account assignment
  accountAssignmentType?: "CostCenter" | "Project";
  wbsElement?: string;
  internalOrder?: string;
  // Journey type and quote details for non-catalog PDF path
  journeyType?: JourneyType;
  quoteDetails?: QuoteDetails;
}

// Uploaded file metadata
export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: Date;
}

// Quote details for non-catalog PDF journey
export interface QuoteDetails {
  supplierName: string;
  quoteNumber: string;
  quoteDate: string;
  currency: string;
  validity: string; // e.g., "14 days"
  paymentTerms: string; // e.g., "Net 30"
  leadTime: string; // e.g., "7–10 business days"
  deliveryTerms: string; // e.g., "DAP — Aarhus, Denmark"
  supplierLocation: string;
}

// Journey type for request
export type JourneyType = "CATALOG" | "NON_CATALOG";

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
  sku?: string; // SKU / Material ID
  name: string;
  description: string;
  category: string;
  unitPrice: number;
  currency: string;
  unitOfMeasure: string;
  supplier: string;
  supplierId?: string; // Supplier ID
  supplierName?: string;
  isPreferredSupplier: boolean;
  imageUrl?: string;
  keywords: string[];
  leadTimeDays?: number;
  specs?: Record<string, string>;
  // Compliance signals (visible at browse time)
  compliance: ComplianceInfo;
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
