import { useState, useEffect } from "react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Card } from "../ui/Card";
import { ShoppingCart, FileText, Briefcase, Upload, AlertCircle, X, Check, FileIcon, Calendar, Building2 } from "lucide-react";
import type { DraftPR, PurchaseInfo, RequestType, CLMContract, UploadedFile } from "../../types/workflow";

interface Step2Props {
  draft: DraftPR;
  onUpdate: (info: Partial<PurchaseInfo>) => void;
  onNext: () => void;
  onBack: () => void;
  onUpdateDraft?: (updates: Partial<DraftPR>) => void;
}

// Helper: Generate mock CLM contracts based on service request
function generateMockCLMContracts(draft: DraftPR): CLMContract[] {
  const category = draft.lineItems[0]?.category || "Professional Services";
  const supplier = draft.lineItems[0]?.supplier || "Unknown";

  const contracts: CLMContract[] = [
    {
      id: "CLM-2024-001",
      name: "Global IT Services Framework Agreement",
      supplier: "Accenture",
      supplierId: "SUP-ACC-001",
      contractId: "FWK-IT-2024-001",
      category: "IT Services",
      validFrom: "2024-01-01",
      validUntil: "2027-12-31",
      region: "EU",
      relevanceHint: "Matches category: IT Services, Region: EU",
      status: "active",
    },
    {
      id: "CLM-2023-045",
      name: "Professional Services Master Agreement",
      supplier: "Deloitte",
      supplierId: "SUP-DEL-001",
      contractId: "MSA-PS-2023-045",
      category: "Professional Services",
      validFrom: "2023-03-15",
      validUntil: "2026-03-14",
      region: "Global",
      relevanceHint: "Matches category: Professional Services, Global coverage",
      status: "active",
    },
    {
      id: "CLM-2024-012",
      name: "Consulting Services Framework",
      supplier: "PwC",
      supplierId: "SUP-PWC-001",
      contractId: "CSF-2024-012",
      category: "Consulting",
      validFrom: "2024-06-01",
      validUntil: "2025-12-31",
      region: "EMEA",
      relevanceHint: "Matches category: Consulting, EMEA region",
      status: "expiring_soon",
    },
  ];

  // If supplier matches one from line items, boost that contract to the top
  const matchingSupplierContracts = contracts.filter(c =>
    supplier.toLowerCase().includes(c.supplier.toLowerCase()) ||
    c.supplier.toLowerCase().includes(supplier.toLowerCase())
  );
  const otherContracts = contracts.filter(c =>
    !(supplier.toLowerCase().includes(c.supplier.toLowerCase()) ||
      c.supplier.toLowerCase().includes(supplier.toLowerCase()))
  );

  return [...matchingSupplierContracts, ...otherContracts];
}

export function Step2Container({ draft, onUpdate, onNext, onBack, onUpdateDraft }: Step2Props) {
  // State for CLM contracts
  const [clmContracts, setCLMContracts] = useState<CLMContract[]>([]);
  const [selectedContractId, setSelectedContractId] = useState<string | null>(
    draft.selectedContract?.id || null
  );

  // State for uploaded files
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>(
    draft.uploadedFiles || []
  );

  // Load CLM contracts on mount (simulate CLM API call)
  useEffect(() => {
    if (draft.requestType === "servicesOrComplex" && draft.lineItems.length > 0) {
      const contracts = generateMockCLMContracts(draft);
      setCLMContracts(contracts);
    }
  }, [draft.requestType, draft.lineItems]);

  // Handle contract selection
  const handleSelectContract = (contract: CLMContract) => {
    setSelectedContractId(contract.id);
    if (onUpdateDraft) {
      onUpdateDraft({ selectedContract: contract });
    }
  };

  // Handle file upload (simulated)
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newFiles: UploadedFile[] = Array.from(files).map(file => ({
      id: `file-${Date.now()}-${Math.random()}`,
      name: file.name,
      size: file.size,
      type: file.type,
      uploadedAt: new Date(),
    }));

    const updated = [...uploadedFiles, ...newFiles];
    setUploadedFiles(updated);
    if (onUpdateDraft) {
      onUpdateDraft({ uploadedFiles: updated });
    }
  };

  // Handle file removal
  const handleRemoveFile = (fileId: string) => {
    const updated = uploadedFiles.filter(f => f.id !== fileId);
    setUploadedFiles(updated);
    if (onUpdateDraft) {
      onUpdateDraft({ uploadedFiles: updated });
    }
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };
  // Determine request type from draft
  const requestType = getRequestType(draft);

  // Calculate total PR value
  const totalValue = draft.lineItems.reduce((sum, item) => sum + item.totalPrice, 0);
  const ATTACHMENT_THRESHOLD = 10000; // $10,000
  const requiresAttachment = totalValue >= ATTACHMENT_THRESHOLD;

  // Form validation
  const purchaseInfo = draft.purchaseInfo || {
    usage: "",
    isPartOfProject: false,
    deliverTo: "",
    deliverToLocation: "",
    needByDate: "",
    involvesPersonalData: false,
    involvesThirdParty: false,
    requiresSpecialApproval: false,
  };

  const isValid2A =
    purchaseInfo.usage?.trim().length > 0 &&
    purchaseInfo.deliverTo?.trim().length > 0 &&
    purchaseInfo.deliverToLocation?.trim().length > 0 &&
    purchaseInfo.needByDate?.length > 0;

  const isValid2B =
    purchaseInfo.usage?.trim().length > 0 &&
    purchaseInfo.deliverTo?.trim().length > 0 &&
    purchaseInfo.deliverToLocation?.trim().length > 0 &&
    purchaseInfo.needByDate?.length > 0;

  const isValid2C =
    purchaseInfo.usage?.trim().length > 0 &&
    purchaseInfo.needByDate?.length > 0 &&
    purchaseInfo.deliverTo?.trim().length > 0 &&
    purchaseInfo.deliverToLocation?.trim().length > 0;

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-gray-50">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Variant 2A: Catalog Goods */}
        {requestType === "catalogGoods" && (
          <>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center">
                <ShoppingCart className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Quick Checkout</h2>
                <p className="text-sm text-gray-600">
                  Just a few details and you're done – no long forms here!
                </p>
              </div>
            </div>

            <Card className="p-6 bg-white">
              <div className="space-y-6">
                {/* Delivery & Recipient */}
                <div>
                  <h3 className="text-base font-semibold text-gray-900 mb-4">Delivery & Recipient</h3>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Deliver to <span className="text-red-600">*</span>
                        </label>
                        <Input
                          value={purchaseInfo.deliverTo}
                          onChange={(e) => onUpdate({ deliverTo: e.target.value })}
                          placeholder="Name of recipient"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Location <span className="text-red-600">*</span>
                        </label>
                        <Input
                          value={purchaseInfo.deliverToLocation}
                          onChange={(e) => onUpdate({ deliverToLocation: e.target.value })}
                          placeholder="Office or site location"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Need by date <span className="text-red-600">*</span>
                      </label>
                      <Input
                        type="date"
                        value={purchaseInfo.needByDate}
                        onChange={(e) => onUpdate({ needByDate: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-200"></div>

                {/* Business Context */}
                <div>
                  <h3 className="text-base font-semibold text-gray-900 mb-4">Business Context</h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        What is this for? <span className="text-red-600">*</span>
                      </label>
                      <textarea
                        value={purchaseInfo.usage}
                        onChange={(e) => onUpdate({ usage: e.target.value })}
                        placeholder="Brief reason or justification (1-2 lines)"
                        rows={2}
                        className="w-full border-2 border-gray-300 rounded-md px-3 py-2 text-base text-black shadow-sm transition-colors placeholder:text-gray-400 focus-visible:outline-none focus-visible:border-blue-600 focus-visible:ring-2 focus-visible:ring-blue-500/50"
                      />
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={purchaseInfo.isPartOfProject}
                          onChange={(e) => onUpdate({ isPartOfProject: e.target.checked })}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-gray-700">Part of a project or initiative</span>
                      </label>
                      {purchaseInfo.isPartOfProject && (
                        <Input
                          className="mt-2"
                          value={purchaseInfo.projectName || ""}
                          onChange={(e) => onUpdate({ projectName: e.target.value })}
                          placeholder="Project or initiative name"
                        />
                      )}
                    </div>
                  </div>
                </div>

                {/* Conditional Attachments */}
                {requiresAttachment && (
                  <>
                    <div className="border-t border-gray-200"></div>

                    <div>
                      <div className="flex items-start gap-2 p-4 bg-amber-50 border border-amber-200 rounded-lg mb-4">
                        <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-amber-900">
                            Supporting documentation required
                          </p>
                          <p className="text-xs text-amber-700 mt-1">
                            Orders over ${ATTACHMENT_THRESHOLD.toLocaleString()} require a quote or supporting document.
                          </p>
                        </div>
                      </div>

                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Upload quote or supporting document <span className="text-red-600">*</span>
                      </label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors cursor-pointer">
                        <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600 mb-1">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">
                          PDF, PNG, JPG up to 10MB
                        </p>
                      </div>
                    </div>
                  </>
                )}

                {!requiresAttachment && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-xs text-blue-700">
                      ✓ No additional documents required for this order. Technical fields (GL code, cost center, etc.) will be derived automatically.
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </>
        )}

        {/* Variant 2B: Free-Text Goods */}
        {requestType === "freeTextGoods" && (
          <>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-lg bg-amber-50 flex items-center justify-center">
                <FileText className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Clarify Your Need</h2>
                <p className="text-sm text-gray-600">
                  Help us understand what you need so we can find the best match.
                </p>
              </div>
            </div>

            <Card className="p-6 bg-white">
              <div className="space-y-6">
                {/* Usage & Context */}
                <div>
                  <h3 className="text-base font-semibold text-gray-900 mb-4">Usage & Context</h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        What is this used for? <span className="text-red-600">*</span>
                      </label>
                      <textarea
                        value={purchaseInfo.usage}
                        onChange={(e) => onUpdate({ usage: e.target.value })}
                        placeholder="Describe the business need or use case..."
                        rows={3}
                        className="w-full border-2 border-gray-300 rounded-md px-3 py-2 text-base text-black shadow-sm transition-colors placeholder:text-gray-400 focus-visible:outline-none focus-visible:border-blue-600 focus-visible:ring-2 focus-visible:ring-blue-500/50"
                      />
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={purchaseInfo.isPartOfProject}
                          onChange={(e) => onUpdate({ isPartOfProject: e.target.checked })}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-gray-700">This is for a specific project or cost center</span>
                      </label>
                      {purchaseInfo.isPartOfProject && (
                        <Input
                          className="mt-2"
                          value={purchaseInfo.projectName || ""}
                          onChange={(e) => onUpdate({ projectName: e.target.value })}
                          placeholder="Project name or cost center code"
                        />
                      )}
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-200"></div>

                {/* Specification Refinement */}
                <div>
                  <h3 className="text-base font-semibold text-gray-900 mb-2">
                    Specification Refinement
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Add brand/model or key specs if you care; otherwise procurement can suggest options.
                  </p>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Brand, model, or key requirements (optional)
                      </label>
                      <Input
                        placeholder="e.g., 'Lenovo ThinkPad' or 'must have USB-C charging'"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Additional specifications (optional)
                      </label>
                      <textarea
                        placeholder="Any other technical or quality requirements..."
                        rows={2}
                        className="w-full border-2 border-gray-300 rounded-md px-3 py-2 text-base text-black shadow-sm transition-colors placeholder:text-gray-400 focus-visible:outline-none focus-visible:border-blue-600 focus-visible:ring-2 focus-visible:ring-blue-500/50"
                      />
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-200"></div>

                {/* Supplier Preference */}
                <div>
                  <h3 className="text-base font-semibold text-gray-900 mb-4">Supplier Preference</h3>

                  {/* Check if supplier was mentioned in line items */}
                  {draft.lineItems.some(item => item.preferredSupplier) ? (
                    <div className="space-y-3">
                      <div className="flex items-start gap-2 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex-1">
                          <p className="text-sm text-blue-900">
                            You mentioned <strong>"{draft.lineItems[0].preferredSupplier}"</strong> as a preferred supplier.
                            I've mapped that to an internal vendor.
                          </p>
                        </div>
                        <Button size="sm" variant="secondary" className="flex-shrink-0">
                          Change
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500">
                        Supplier conflicts with preferred vendor policies will be flagged in validation.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                        <p className="text-sm text-gray-700">
                          I'll let procurement or the agent pick the best supplier for you.
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          If you strongly prefer a specific supplier, mention it here (optional)
                        </label>
                        <Input
                          placeholder="e.g., 'Dell', 'Accenture', etc."
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Divider */}
                <div className="border-t border-gray-200"></div>

                {/* Attachments */}
                <div>
                  <h3 className="text-base font-semibold text-gray-900 mb-2">
                    Supporting Documentation
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Upload a quote, screenshot, or brochure to help procurement find exactly what you need.
                  </p>

                  {requiresAttachment ? (
                    <div className="flex items-start gap-2 p-4 bg-amber-50 border border-amber-200 rounded-lg mb-4">
                      <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-amber-900">
                          Documentation required
                        </p>
                        <p className="text-xs text-amber-700 mt-1">
                          Free-text requests over ${ATTACHMENT_THRESHOLD.toLocaleString()} require supporting documentation.
                        </p>
                      </div>
                    </div>
                  ) : null}

                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload documents {requiresAttachment && <span className="text-red-600">*</span>}
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors cursor-pointer">
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-1">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">
                      Quote, brochure, screenshot - PDF, PNG, JPG up to 10MB
                    </p>
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-200"></div>

                {/* Delivery & Recipient */}
                <div>
                  <h3 className="text-base font-semibold text-gray-900 mb-4">Delivery & Recipient</h3>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Deliver to <span className="text-red-600">*</span>
                        </label>
                        <Input
                          value={purchaseInfo.deliverTo}
                          onChange={(e) => onUpdate({ deliverTo: e.target.value })}
                          placeholder="Name of recipient"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Location <span className="text-red-600">*</span>
                        </label>
                        <Input
                          value={purchaseInfo.deliverToLocation}
                          onChange={(e) => onUpdate({ deliverToLocation: e.target.value })}
                          placeholder="Office or site location"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Need by date <span className="text-red-600">*</span>
                      </label>
                      <Input
                        type="date"
                        value={purchaseInfo.needByDate}
                        onChange={(e) => onUpdate({ needByDate: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </>
        )}

        {/* Variant 2C: Services / Complex */}
        {requestType === "servicesOrComplex" && (
          <>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-lg bg-purple-50 flex items-center justify-center">
                <Briefcase className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Service Purchase – Scope & Risk</h2>
                <p className="text-sm text-gray-600">
                  More detail now means faster approvals and less back-and-forth later.
                </p>
              </div>
            </div>

            <Card className="p-6 bg-white">
              <div className="space-y-6">
                {/* Scope & Deliverables */}
                <div>
                  <h3 className="text-base font-semibold text-gray-900 mb-2">Scope & Deliverables</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    What will the supplier do or deliver?
                  </p>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Scope of work <span className="text-red-600">*</span>
                    </label>
                    <textarea
                      value={purchaseInfo.usage}
                      onChange={(e) => onUpdate({ usage: e.target.value })}
                      placeholder="Describe what the supplier will do, what deliverables you expect..."
                      rows={4}
                      className="w-full border-2 border-gray-300 rounded-md px-3 py-2 text-base text-black shadow-sm transition-colors placeholder:text-gray-400 focus-visible:outline-none focus-visible:border-blue-600 focus-visible:ring-2 focus-visible:ring-blue-500/50"
                    />
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-200"></div>

                {/* Timing */}
                <div>
                  <h3 className="text-base font-semibold text-gray-900 mb-4">Timing</h3>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Start date <span className="text-red-600">*</span>
                        </label>
                        <Input
                          type="date"
                          value={purchaseInfo.needByDate}
                          onChange={(e) => onUpdate({ needByDate: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          End date or duration
                        </label>
                        <Input
                          placeholder="e.g., 6 months, Dec 2025"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Frequency
                      </label>
                      <select className="w-full h-10 border-2 border-gray-300 rounded-md px-3 py-2 text-base text-black shadow-sm focus-visible:outline-none focus-visible:border-blue-600 focus-visible:ring-2 focus-visible:ring-blue-500/50">
                        <option>One-off project</option>
                        <option>Monthly recurring</option>
                        <option>Quarterly recurring</option>
                        <option>Annual recurring</option>
                        <option>On-demand / as-needed</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-200"></div>

                {/* Business Justification */}
                <div>
                  <h3 className="text-base font-semibold text-gray-900 mb-2">Business Justification</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Why is this service needed? What happens if not approved?
                  </p>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Business need <span className="text-red-600">*</span>
                      </label>
                      <textarea
                        placeholder="What problem does this solve? What business value does it provide?"
                        rows={3}
                        className="w-full border-2 border-gray-300 rounded-md px-3 py-2 text-base text-black shadow-sm transition-colors placeholder:text-gray-400 focus-visible:outline-none focus-visible:border-blue-600 focus-visible:ring-2 focus-visible:ring-blue-500/50"
                      />
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={purchaseInfo.isPartOfProject}
                          onChange={(e) => onUpdate({ isPartOfProject: e.target.checked })}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-gray-700">Part of a strategic initiative or project</span>
                      </label>
                      {purchaseInfo.isPartOfProject && (
                        <Input
                          className="mt-2"
                          value={purchaseInfo.projectName || ""}
                          onChange={(e) => onUpdate({ projectName: e.target.value })}
                          placeholder="Initiative or project name"
                        />
                      )}
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-200"></div>

                {/* Delivery Model & Locations */}
                <div>
                  <h3 className="text-base font-semibold text-gray-900 mb-4">Delivery Model & Locations</h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        How will work be performed? <span className="text-red-600">*</span>
                      </label>
                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="deliveryModel"
                            defaultChecked
                            className="text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">Remote</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="deliveryModel"
                            className="text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">On-site</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="deliveryModel"
                            className="text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">Hybrid</span>
                        </label>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Primary location <span className="text-red-600">*</span>
                        </label>
                        <Input
                          value={purchaseInfo.deliverToLocation}
                          onChange={(e) => onUpdate({ deliverToLocation: e.target.value })}
                          placeholder="City, country or office"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Additional locations (if any)
                        </label>
                        <Input
                          placeholder="Other cities/countries involved"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-200"></div>

                {/* Risk Toggles */}
                <div>
                  <h3 className="text-base font-semibold text-gray-900 mb-2">Risk Assessment</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    These questions help us route your request to the right approvers.
                  </p>

                  <div className="space-y-3 bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <label className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={purchaseInfo.involvesPersonalData}
                        onChange={(e) => onUpdate({ involvesPersonalData: e.target.checked })}
                        className="mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <span className="text-sm font-medium text-gray-900">Personal data involved</span>
                        <p className="text-xs text-gray-600 mt-0.5">
                          Will the supplier process customer or employee personal data?
                        </p>
                      </div>
                    </label>

                    <label className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        className="mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <span className="text-sm font-medium text-gray-900">Highly confidential data</span>
                        <p className="text-xs text-gray-600 mt-0.5">
                          Trade secrets, financial data, or other sensitive information?
                        </p>
                      </div>
                    </label>

                    <label className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={purchaseInfo.requiresSpecialApproval}
                        onChange={(e) => onUpdate({ requiresSpecialApproval: e.target.checked })}
                        className="mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <span className="text-sm font-medium text-gray-900">Supports critical or regulated process</span>
                        <p className="text-xs text-gray-600 mt-0.5">
                          Healthcare, financial services, or business-critical operations?
                        </p>
                      </div>
                    </label>

                    <label className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={purchaseInfo.involvesThirdParty}
                        onChange={(e) => onUpdate({ involvesThirdParty: e.target.checked })}
                        className="mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <span className="text-sm font-medium text-gray-900">Third-party subcontractors</span>
                        <p className="text-xs text-gray-600 mt-0.5">
                          Will the supplier use subcontractors or partners?
                        </p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-200"></div>

                {/* Service Owner */}
                <div>
                  <h3 className="text-base font-semibold text-gray-900 mb-2">Service Owner</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Who will accept the service and confirm completion?
                  </p>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Service owner <span className="text-red-600">*</span>
                      </label>
                      <Input
                        value={purchaseInfo.deliverTo}
                        onChange={(e) => onUpdate({ deliverTo: e.target.value })}
                        placeholder="Name of person or role"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Department
                      </label>
                      <Input
                        placeholder="e.g., IT, HR, Finance"
                      />
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-200"></div>

                {/* Documents & Contracts Section */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-base font-semibold text-gray-900 mb-2">
                      Documents & Contracts
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Upload supporting documents and link to an existing contract if applicable.
                    </p>
                  </div>

                  {/* Upload Section */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Upload Documents
                    </label>

                    {requiresAttachment && (
                      <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg mb-3">
                        <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-amber-700">
                          Services over ${ATTACHMENT_THRESHOLD.toLocaleString()} require supporting documentation (SoW, proposal, or quote).
                        </p>
                      </div>
                    )}

                    {/* Upload Area */}
                    <label className="block">
                      <input
                        type="file"
                        multiple
                        accept=".pdf,.doc,.docx,.xls,.xlsx"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 hover:bg-blue-50/50 transition-all cursor-pointer">
                        <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-700 font-medium mb-1">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">
                          SoW, proposals, quotes - PDF, DOCX up to 10MB
                        </p>
                      </div>
                    </label>

                    {/* Uploaded Files List */}
                    {uploadedFiles.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {uploadedFiles.map(file => (
                          <div
                            key={file.id}
                            className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg"
                          >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <FileIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {file.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {formatFileSize(file.size)}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => handleRemoveFile(file.id)}
                              className="p-1 hover:bg-gray-200 rounded transition-colors"
                              title="Remove file"
                            >
                              <X className="h-4 w-4 text-gray-500" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* CLM Contracts Section */}
                  <div>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900">
                          Existing Contracts (from CLM)
                        </h4>
                        <p className="text-xs text-gray-600 mt-0.5">
                          Suggested contracts based on scope and category
                        </p>
                      </div>
                      <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded font-medium">
                        Source: CLM
                      </span>
                    </div>

                    {clmContracts.length > 0 ? (
                      <div className="space-y-3">
                        {clmContracts.map(contract => {
                          const isSelected = selectedContractId === contract.id;
                          return (
                            <div
                              key={contract.id}
                              className={`p-4 border-2 rounded-lg transition-all cursor-pointer ${
                                isSelected
                                  ? "border-blue-500 bg-blue-50 shadow-sm"
                                  : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                              }`}
                              onClick={() => handleSelectContract(contract)}
                            >
                              <div className="flex items-start gap-3">
                                {/* Radio Button */}
                                <div className="flex items-center pt-1">
                                  <div
                                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                                      isSelected
                                        ? "border-blue-600 bg-blue-600"
                                        : "border-gray-300"
                                    }`}
                                  >
                                    {isSelected && <Check className="h-3 w-3 text-white" />}
                                  </div>
                                </div>

                                {/* Contract Info */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-2 mb-2">
                                    <h5 className="font-semibold text-gray-900 text-sm">
                                      {contract.name}
                                    </h5>
                                    <span
                                      className={`text-xs px-2 py-0.5 rounded font-medium flex-shrink-0 ${
                                        contract.status === "active"
                                          ? "bg-green-100 text-green-700"
                                          : contract.status === "expiring_soon"
                                          ? "bg-yellow-100 text-yellow-700"
                                          : "bg-red-100 text-red-700"
                                      }`}
                                    >
                                      {contract.status === "active"
                                        ? "Active"
                                        : contract.status === "expiring_soon"
                                        ? "Expiring Soon"
                                        : "Expired"}
                                    </span>
                                  </div>

                                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs mb-2">
                                    <div>
                                      <span className="text-gray-500">Supplier:</span>{" "}
                                      <span className="text-gray-900 font-medium">{contract.supplier}</span>
                                    </div>
                                    <div>
                                      <span className="text-gray-500">Contract ID:</span>{" "}
                                      <span className="text-gray-900 font-medium">{contract.contractId}</span>
                                    </div>
                                    <div>
                                      <span className="text-gray-500">Category:</span>{" "}
                                      <span className="text-gray-900 font-medium">{contract.category}</span>
                                    </div>
                                    <div>
                                      <span className="text-gray-500">Region:</span>{" "}
                                      <span className="text-gray-900 font-medium">{contract.region || "N/A"}</span>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-4 text-xs text-gray-600 mb-2">
                                    <div className="flex items-center gap-1">
                                      <Calendar className="h-3 w-3" />
                                      <span>
                                        Valid: {contract.validFrom} to {contract.validUntil}
                                      </span>
                                    </div>
                                  </div>

                                  <div className="p-2 bg-gray-50 rounded text-xs text-gray-700 border border-gray-200">
                                    <span className="font-medium">Relevance:</span> {contract.relevanceHint}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 text-center">
                        <p className="text-sm text-gray-600">
                          No matching contracts found in CLM
                        </p>
                      </div>
                    )}

                    {/* Selected Contract Confirmation */}
                    {selectedContractId && (
                      <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-start gap-2">
                          <Check className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                          <div className="text-xs text-green-800">
                            <p className="font-semibold mb-0.5">Contract selected</p>
                            <p>
                              This request will be treated as a call-off under{" "}
                              <span className="font-medium">
                                {clmContracts.find(c => c.id === selectedContractId)?.name}
                              </span>
                              .
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6">
          <Button variant="secondary" onClick={onBack}>
            Back to Items
          </Button>
          <Button
            onClick={onNext}
            disabled={
              (requestType === "catalogGoods" && !isValid2A) ||
              (requestType === "freeTextGoods" && !isValid2B) ||
              (requestType === "servicesOrComplex" && !isValid2C)
            }
          >
            Next: Review Summary
          </Button>
        </div>
      </div>
    </div>
  );
}

// Helper function to determine request type from draft
function getRequestType(draft: DraftPR): RequestType {
  // If explicitly set, use it
  if (draft.requestType) {
    return draft.requestType;
  }

  // Otherwise infer from line items and intent
  if (draft.lineItems.length === 0) {
    return "catalogGoods"; // Default
  }

  const hasService = draft.lineItems.some(item => item.type === "service");
  const hasFreeText = draft.lineItems.some(item => item.type === "freeText");
  const hasCatalogGoods = draft.lineItems.some(item => item.type === "goods");

  if (hasService) {
    return "servicesOrComplex";
  } else if (hasFreeText) {
    return "freeTextGoods";
  } else if (hasCatalogGoods) {
    return "catalogGoods";
  }

  // Fallback based on intentType
  if (draft.intentType === "service") {
    return "servicesOrComplex";
  } else if (draft.intentType === "freeText") {
    return "freeTextGoods";
  }

  return "catalogGoods";
}
