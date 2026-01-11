import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import { Alert, AlertDescription } from "../ui/alert";
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
    <div className="flex-1 overflow-y-auto p-8 bg-muted/30">
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight mb-2">Summary & Confirmation</h2>
          <p className="text-sm text-muted-foreground">
            Please review your request before running validations
          </p>
        </div>

        {/* Purchase Info Summary */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-base font-medium">Purchase Information</CardTitle>
            <Button size="sm" variant="ghost" onClick={() => onEdit(2)}>
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">Usage</span>
                <p className="font-medium">{draft.purchaseInfo?.usage || "N/A"}</p>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">Deliver to</span>
                <p className="font-medium">
                  {draft.purchaseInfo?.deliverTo} ({draft.purchaseInfo?.deliverToLocation})
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">Need by</span>
                <p className="font-medium">{draft.purchaseInfo?.needByDate}</p>
              </div>
              {draft.purchaseInfo?.isPartOfProject && (
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground">Project</span>
                  <p className="font-medium">{draft.purchaseInfo.projectName}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Contract Information (for services) */}
        {draft.selectedContract && (
          <Alert variant="success" className="border-2">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Linked Contract</h3>
                <Badge variant="secondary" className="text-xs">
                  CLM
                </Badge>
              </div>
              <div className="space-y-3">
                <p className="text-sm font-medium">
                  {draft.selectedContract.name}
                </p>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="space-y-1">
                    <span className="text-muted-foreground">Contract ID</span>
                    <p className="font-medium">{draft.selectedContract.contractId}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-muted-foreground">Supplier</span>
                    <p className="font-medium">{draft.selectedContract.supplier}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-muted-foreground">Category</span>
                    <p className="font-medium">{draft.selectedContract.category}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-muted-foreground">Valid until</span>
                    <p className="font-medium">{draft.selectedContract.validUntil}</p>
                  </div>
                </div>
                <Separator />
                <p className="text-xs text-muted-foreground">
                  This request will be treated as a call-off under this existing contract.
                </p>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Uploaded Documents */}
        {draft.uploadedFiles && draft.uploadedFiles.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-base font-medium">
                  Attached Documents ({draft.uploadedFiles.length})
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {draft.uploadedFiles.map(file => (
                  <div key={file.id} className="flex items-center justify-between text-sm p-3 bg-muted/50 rounded-md border">
                    <span className="font-medium">{file.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {(file.size / 1024).toFixed(1)} KB
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Line Items */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-base font-medium">Items ({draft.lineItems.length})</CardTitle>
            <Button size="sm" variant="ghost" onClick={() => onEdit(1)}>
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-0">
              {draft.lineItems.map((item, index) => (
                <div key={item.id}>
                  <div className="flex items-start justify-between py-3">
                    <div className="flex-1 space-y-1">
                      <p className="font-medium text-sm">{item.name}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1">{item.description}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>Supplier: {item.supplier}</span>
                        {item.isPreferredSupplier && (
                          <Badge variant="outline" className="h-5 text-xs">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Preferred
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-sm font-semibold">${item.totalPrice.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.quantity} × ${item.unitPrice}
                      </p>
                    </div>
                  </div>
                  {index < draft.lineItems.length - 1 && <Separator />}
                </div>
              ))}
            </div>
            <Separator className="my-4" />
            <div className="flex justify-between items-center">
              <span className="font-semibold">Total Value</span>
              <span className="text-2xl font-bold">${totalValue.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>

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
