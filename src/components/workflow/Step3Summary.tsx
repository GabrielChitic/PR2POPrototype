import { Button } from "../ui/Button";
import { Edit, FileText, CheckCircle } from "lucide-react";
import type { DraftPR } from "../../types/workflow";

interface Step3Props {
  draft: DraftPR;
  onEdit: (step: 1 | 2) => void;
  onConfirm: () => void;
  onBack: () => void;
}

export function Step3Summary({ draft, onEdit, onConfirm, onBack }: Step3Props) {
  const totalValue = draft.lineItems.reduce((sum, item) => sum + item.totalPrice, 0);

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-1">Summary & Confirmation</h2>
          <p className="text-sm text-muted-foreground">
            Please review your request before running validations
          </p>
        </div>

        {/* Purchase Info Summary */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium">Purchase Information</h3>
            <Button size="sm" variant="ghost" onClick={() => onEdit(2)}>
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-muted-foreground">Usage:</span>
              <p className="font-medium">{draft.purchaseInfo?.usage || "N/A"}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Deliver to:</span>
              <p className="font-medium">
                {draft.purchaseInfo?.deliverTo} ({draft.purchaseInfo?.deliverToLocation})
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Need by:</span>
              <p className="font-medium">{draft.purchaseInfo?.needByDate}</p>
            </div>
            {draft.purchaseInfo?.isPartOfProject && (
              <div>
                <span className="text-muted-foreground">Project:</span>
                <p className="font-medium">{draft.purchaseInfo.projectName}</p>
              </div>
            )}
          </div>
        </div>

        {/* Contract Information (for services) */}
        {draft.selectedContract && (
          <div className="border-2 border-green-200 bg-green-50 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-green-900">Linked Contract</h3>
                  <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded font-medium">
                    CLM
                  </span>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-green-900">
                    {draft.selectedContract.name}
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs text-green-800">
                    <div>
                      <span className="text-green-600">Contract ID:</span>{" "}
                      {draft.selectedContract.contractId}
                    </div>
                    <div>
                      <span className="text-green-600">Supplier:</span>{" "}
                      {draft.selectedContract.supplier}
                    </div>
                    <div>
                      <span className="text-green-600">Category:</span>{" "}
                      {draft.selectedContract.category}
                    </div>
                    <div>
                      <span className="text-green-600">Valid until:</span>{" "}
                      {draft.selectedContract.validUntil}
                    </div>
                  </div>
                  <p className="text-xs text-green-700 mt-2 pt-2 border-t border-green-200">
                    This request will be treated as a call-off under this existing contract.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Uploaded Documents */}
        {draft.uploadedFiles && draft.uploadedFiles.length > 0 && (
          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="h-4 w-4 text-gray-600" />
              <h3 className="font-medium">Attached Documents ({draft.uploadedFiles.length})</h3>
            </div>
            <div className="space-y-2">
              {draft.uploadedFiles.map(file => (
                <div key={file.id} className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded">
                  <span className="font-medium text-gray-900">{file.name}</span>
                  <span className="text-xs text-gray-500">
                    {(file.size / 1024).toFixed(1)} KB
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Line Items */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium">Items ({draft.lineItems.length})</h3>
            <Button size="sm" variant="ghost" onClick={() => onEdit(1)}>
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
          </div>
          <div className="space-y-3">
            {draft.lineItems.map((item) => (
              <div key={item.id} className="flex items-start justify-between py-2 border-b last:border-0">
                <div>
                  <p className="font-medium text-sm">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Supplier: {item.supplier}
                    {item.isPreferredSupplier && (
                      <span className="ml-2 text-green-600">✓ Preferred</span>
                    )}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">${item.totalPrice.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.quantity} × ${item.unitPrice}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t flex justify-between items-center">
            <span className="font-semibold">Total Value:</span>
            <span className="text-xl font-bold">${totalValue.toLocaleString()}</span>
          </div>
        </div>

        <div className="flex justify-between pt-6">
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button onClick={onConfirm} size="lg">
            Confirm & Run Checks
          </Button>
        </div>
      </div>
    </div>
  );
}
