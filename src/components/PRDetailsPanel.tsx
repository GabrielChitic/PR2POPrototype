import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/Card";
import type { PurchaseRequisition } from "../types";
import { AlertCircle, Info } from "lucide-react";

interface PRDetailsPanelProps {
  pr: PurchaseRequisition | null;
}

export function PRDetailsPanel({ pr }: PRDetailsPanelProps) {
  if (!pr) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>PR Details</CardTitle>
          <CardDescription>
            Select or create a PR to view details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground text-center py-8">
            No PR selected
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full overflow-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{pr.prNumber}</span>
          <span className="text-sm font-normal px-3 py-1 bg-secondary rounded-full">
            {pr.status}
          </span>
        </CardTitle>
        <CardDescription>
          Created {pr.createdAt.toLocaleString()}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Human Review Warning */}
        {pr.intentClassification.needsHumanReview && (
          <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
            <div>
              <div className="font-medium text-amber-900 text-sm">
                Human Review Recommended
              </div>
              <div className="text-xs text-amber-700 mt-1">
                Confidence: {pr.intentClassification.confidence}
              </div>
            </div>
          </div>
        )}

        {/* Original Request */}
        <div>
          <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
            <Info className="h-4 w-4" />
            Original Request
          </h3>
          <p className="text-sm text-muted-foreground bg-muted p-3 rounded">
            {pr.originalMessage}
          </p>
        </div>

        {/* Requesting Persona */}
        <div>
          <h3 className="font-semibold text-sm mb-2">Requested By</h3>
          <div className="text-sm space-y-1">
            <div><span className="font-medium">{pr.requestingPersona.name}</span></div>
            <div className="text-muted-foreground">{pr.requestingPersona.role}</div>
            <div className="text-xs text-muted-foreground">
              {pr.requestingPersona.entity} • {pr.requestingPersona.location}
            </div>
          </div>
        </div>

        {/* Intent Classification */}
        <div>
          <h3 className="font-semibold text-sm mb-2">Intent Classification</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Type:</span>
              <span className="font-medium">{pr.intentClassification.type.replace(/_/g, " ")}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Confidence:</span>
              <span className="font-medium capitalize">{pr.intentClassification.confidence}</span>
            </div>
            <div className="mt-2">
              <div className="text-xs text-muted-foreground mb-1">Reasoning:</div>
              <ul className="text-xs space-y-1">
                {pr.intentClassification.reasoning.map((reason, idx) => (
                  <li key={idx} className="flex items-start gap-1">
                    <span className="text-muted-foreground">•</span>
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Context Inference */}
        <div>
          <h3 className="font-semibold text-sm mb-2">Context</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-muted-foreground">Entity:</span>
              <div className="font-medium">{pr.contextInference.entity}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Region:</span>
              <div className="font-medium">{pr.contextInference.region}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Location:</span>
              <div className="font-medium">{pr.contextInference.location}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Category:</span>
              <div className="font-medium">{pr.contextInference.category}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Urgency:</span>
              <div className="font-medium capitalize">{pr.contextInference.urgency}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Needed By:</span>
              <div className="font-medium">{pr.contextInference.neededBy}</div>
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xs text-muted-foreground mb-1">Inference Notes:</div>
            <ul className="text-xs space-y-1">
              {pr.contextInference.inferenceNotes.map((note, idx) => (
                <li key={idx} className="flex items-start gap-1">
                  <span className="text-muted-foreground">•</span>
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Backend Routing */}
        <div>
          <h3 className="font-semibold text-sm mb-2">Backend Routing</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">System:</span>
              <span className="font-medium font-mono text-xs bg-muted px-2 py-1 rounded">
                {pr.backendRouting.system}
              </span>
            </div>
            <div className="text-xs text-muted-foreground">
              {pr.backendRouting.reasoning}
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div>
          <h3 className="font-semibold text-sm mb-2">Line Items</h3>
          <div className="space-y-2">
            {pr.lineItems.map((item) => (
              <div key={item.id} className="border rounded-lg p-3 space-y-2">
                <div className="text-sm font-medium">{item.description}</div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground">Quantity:</span>
                    <div className="font-medium">
                      {item.quantity} {item.unitOfMeasure}
                    </div>
                  </div>
                  {item.unitPrice && (
                    <div>
                      <span className="text-muted-foreground">Unit Price:</span>
                      <div className="font-medium">${item.unitPrice}</div>
                    </div>
                  )}
                  {item.supplierName && (
                    <div className="col-span-2">
                      <span className="text-muted-foreground">Supplier:</span>
                      <div className="font-medium">{item.supplierName}</div>
                    </div>
                  )}
                  {item.totalPrice && (
                    <div className="col-span-2">
                      <span className="text-muted-foreground">Total:</span>
                      <div className="font-medium text-base">${item.totalPrice.toLocaleString()}</div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
