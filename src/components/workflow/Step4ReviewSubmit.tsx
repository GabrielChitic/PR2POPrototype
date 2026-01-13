import { useState } from "react";
import { CheckCircle, AlertTriangle, XCircle, Package, DollarSign, Shield, ChevronRight, FileText, Edit } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Separator } from "../ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";
import type { DraftPR } from "../../types/workflow";

interface Step4Props {
  draft: DraftPR;
  onSubmit: () => void;
  onBack: () => void;
  onNavigateToStage: (stage: number) => void;
}

type ReadinessStatus = "ready" | "ready-with-warnings" | "not-ready";

interface BlockerItem {
  id: string;
  reason: string;
  fixStage: number;
  fixLabel: string;
}

// Helper: Compute readiness status
function computeReadiness(draft: DraftPR): {
  status: ReadinessStatus;
  blockers: BlockerItem[];
  warnings: string[];
} {
  const blockers: BlockerItem[] = [];
  const warnings: string[] = [];

  // Check items
  if (!draft.lineItems || draft.lineItems.length === 0) {
    blockers.push({
      id: "blocker-items",
      reason: "No items added to request",
      fixStage: 1,
      fixLabel: "Fix Items",
    });
  }

  // Check delivery details
  if (!draft.purchaseInfo?.needByDate) {
    blockers.push({
      id: "blocker-needby",
      reason: "Need-by date is missing",
      fixStage: 2,
      fixLabel: "Fix Delivery",
    });
  }

  if (!draft.purchaseInfo?.usage) {
    blockers.push({
      id: "blocker-usage",
      reason: "Business justification is missing",
      fixStage: 2,
      fixLabel: "Fix Delivery",
    });
  }

  // Check accounting
  const accountingValidation = draft.accountingValidation;
  if (accountingValidation?.commodityGroup === "block") {
    blockers.push({
      id: "blocker-commodity",
      reason: accountingValidation.reasons?.commodityGroup || "Invalid commodity group",
      fixStage: 3,
      fixLabel: "Fix Accounting",
    });
  }

  if (accountingValidation?.glAccount === "block") {
    blockers.push({
      id: "blocker-gl",
      reason: accountingValidation.reasons?.glAccount || "Invalid GL account",
      fixStage: 3,
      fixLabel: "Fix Accounting",
    });
  }

  if (accountingValidation?.costCenter === "block") {
    blockers.push({
      id: "blocker-cc",
      reason: accountingValidation.reasons?.costCenter || "Invalid cost center",
      fixStage: 3,
      fixLabel: "Fix Accounting",
    });
  }

  // Check policy checks
  const policyChecks = draft.policyChecks || [];
  const blockedChecks = policyChecks.filter(check => check.status === "block");
  blockedChecks.forEach(check => {
    blockers.push({
      id: `blocker-policy-${check.id}`,
      reason: check.message,
      fixStage: 3,
      fixLabel: "Fix Accounting",
    });
  });

  // Collect warnings
  const warnChecks = policyChecks.filter(check => check.status === "warn");
  warnChecks.forEach(check => {
    warnings.push(check.message);
  });

  // Determine status
  if (blockers.length > 0) {
    return { status: "not-ready", blockers, warnings };
  } else if (warnings.length > 0) {
    return { status: "ready-with-warnings", blockers, warnings };
  } else {
    return { status: "ready", blockers, warnings };
  }
}

// Helper: Get compliance badge
function getComplianceBadge(item: any) {
  if (!item.compliance) return null;

  const badges = [];

  if (item.compliance.preferred) {
    badges.push(
      <Badge key="preferred" variant="default" className="bg-green-600">
        Preferred
      </Badge>
    );
  } else {
    badges.push(
      <Badge key="non-preferred" variant="outline" className="border-amber-600 text-amber-600">
        Non-preferred
      </Badge>
    );
  }

  if (item.compliance.contractStatus === "valid") {
    badges.push(
      <Badge key="contract" variant="outline" className="border-green-600 text-green-600">
        Valid Contract
      </Badge>
    );
  } else if (item.compliance.contractStatus === "expired") {
    badges.push(
      <Badge key="contract" variant="outline" className="border-amber-600 text-amber-600">
        Expired Contract
      </Badge>
    );
  }

  if (!item.compliance.allowed) {
    badges.push(
      <Badge key="blocked" variant="destructive">
        Blocked
      </Badge>
    );
  }

  return <div className="flex flex-wrap gap-1">{badges}</div>;
}

export function Step4ReviewSubmit({ draft, onSubmit, onBack, onNavigateToStage }: Step4Props) {
  const { status, blockers, warnings } = computeReadiness(draft);

  // Calculate totals
  const totalQuantity = draft.lineItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalValue = draft.lineItems.reduce((sum, item) => sum + item.totalPrice, 0);

  // R2 NON_CATALOG detection
  const isNonCatalog = draft.journeyType === "NON_CATALOG";

  // R2: State for loading
  const [isSubmitting, setIsSubmitting] = useState(false);

  // R2: Compute readiness for NON_CATALOG
  const computeR2Readiness = () => {
    const r2Warnings: string[] = [];

    // Check for warnings from policy checks
    const warnChecks = (draft.policyChecks || []).filter(check => check.status === "warn");
    warnChecks.forEach(check => {
      r2Warnings.push(check.message);
    });

    // All required fields present?
    const hasLineItems = draft.lineItems && draft.lineItems.length > 0 && draft.lineItems[0].quantity > 0 && draft.lineItems[0].unitPrice > 0;
    const hasDelivery = draft.purchaseInfo?.shipToSiteId && draft.purchaseInfo?.needByDate;
    const hasBusinessReason = draft.purchaseInfo?.usage && draft.purchaseInfo.usage.trim().length > 0;
    const hasAccounting = draft.commodityGroupId && draft.glAccountId && draft.costCenterId;

    const isReady = hasLineItems && hasDelivery && hasBusinessReason && hasAccounting;

    return {
      isReady,
      warnings: r2Warnings,
      reasons: [
        "Quote attached and within validity",
        "Supplier active",
        "Accounting complete (Cost center + GL + Commodity group)",
        "Below sourcing threshold for PPE",
      ],
    };
  };

  const r2Readiness = isNonCatalog ? computeR2Readiness() : null;

  // R2: Submit handler with loading state
  const handleR2Submit = () => {
    if (!r2Readiness?.isReady) return;

    setIsSubmitting(true);
    // Simulate brief loading
    setTimeout(() => {
      onSubmit();
    }, 1000);
  };

  return (
    <TooltipProvider>
      <div className="flex-1 flex flex-col overflow-hidden bg-muted/30">
        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* R2: NON_CATALOG Header Summary Card */}
            {isNonCatalog && (
              <>
                {/* Header */}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Package className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                      Review & Submit
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Non-catalog request (from quote {draft.quoteDetails?.quoteNumber || "Q-2026-0113"})
                    </p>
                  </div>
                </div>

                {/* Readiness Verdict - MOVED UP */}
                {r2Readiness?.warnings && r2Readiness.warnings.length > 0 ? (
                  <Alert className="border-amber-600 bg-amber-50">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    <AlertTitle className="text-amber-900">Ready with warnings</AlertTitle>
                    <AlertDescription className="text-amber-800">
                      <p className="mb-2">Your request can be submitted, but note:</p>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        {r2Readiness.warnings.slice(0, 2).map((warning, idx) => (
                          <li key={idx}>{warning}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert className="border-green-600 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertTitle className="text-green-900">Ready to submit</AlertTitle>
                    <AlertDescription className="text-green-800">
                      <ul className="space-y-1 text-sm">
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                          Quote attached ({draft.quoteDetails?.quoteNumber || "Q-2026-0113"})
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                          Supplier active
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                          Accounting complete (Cost center + GL + Commodity group)
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                          Below sourcing threshold for PPE
                        </li>
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Header Summary Card */}
                <Card>
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-wrap">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">Supplier:</span>
                          <span className="text-sm font-medium">{draft.lineItems[0]?.supplier || "Manufacturing A/S"}</span>
                        </div>
                        <Separator orientation="vertical" className="h-4" />
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">Total:</span>
                          <span className="text-sm font-semibold">{draft.lineItems[0]?.currency || "EUR"} {totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                        <Separator orientation="vertical" className="h-4" />
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">Delivery:</span>
                          <span className="text-sm font-medium">{draft.purchaseInfo?.shipToAddress?.split(",")[0] || "Aarhus"}, Denmark</span>
                        </div>
                        <Separator orientation="vertical" className="h-4" />
                        <Badge variant="secondary">Draft</Badge>
                      </div>
                      <Button variant="outline" size="sm" className="gap-2 flex-shrink-0">
                        <FileText className="h-4 w-4" />
                        View quote
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Preview Sections (Accordion) - All expanded by default */}
                <Accordion type="multiple" defaultValue={["delivery", "line-items", "accounting", "evidence"]} className="space-y-4">
                  {/* Delivery & Recipient (expanded by default) - MOVED TO TOP */}
                  <AccordionItem value="delivery">
                    <Card>
                      <CardHeader className="pb-3">
                        <AccordionTrigger className="hover:no-underline">
                          <div className="flex items-center justify-between w-full pr-4">
                            <CardTitle className="text-base font-semibold">Delivery & Recipient</CardTitle>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="gap-1 h-8 text-xs"
                              onClick={(e) => {
                                e.stopPropagation();
                                onNavigateToStage(2);
                              }}
                            >
                              <Edit className="h-3 w-3" />
                              Edit
                            </Button>
                          </div>
                        </AccordionTrigger>
                      </CardHeader>
                      <AccordionContent>
                        <CardContent className="pt-0">
                          <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Deliver to</p>
                              <p className="font-medium">
                                {draft.purchaseInfo?.deliveryContactName || "Ana Popescu"}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Location</p>
                              <p className="font-medium">{draft.purchaseInfo?.shipToAddress?.split(",")[0] || "Aarhus"}, Denmark</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Need-by date</p>
                              <p className="font-medium">{draft.purchaseInfo?.needByDate || "N/A"}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Delivery instructions</p>
                              <p className="font-medium">
                                {draft.purchaseInfo?.deliveryInstructions || "—"}
                              </p>
                            </div>
                            <div className="col-span-2">
                              <p className="text-xs text-muted-foreground mb-1">Business reason</p>
                              <p className="font-medium">
                                {draft.purchaseInfo?.usage || "N/A"}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </AccordionContent>
                    </Card>
                  </AccordionItem>

                  {/* Line Items (expanded by default) */}
                  <AccordionItem value="line-items">
                    <Card>
                      <CardHeader className="pb-3">
                        <AccordionTrigger className="hover:no-underline">
                          <div className="flex items-center justify-between w-full pr-4">
                            <div className="flex items-center gap-2">
                              <CardTitle className="text-base font-semibold">Line items</CardTitle>
                              <Badge variant="secondary" className="text-xs">From quote</Badge>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="gap-1 h-8 text-xs"
                              onClick={(e) => {
                                e.stopPropagation();
                                onNavigateToStage(1);
                              }}
                            >
                              <Edit className="h-3 w-3" />
                              Edit
                            </Button>
                          </div>
                        </AccordionTrigger>
                      </CardHeader>
                      <AccordionContent>
                        <CardContent className="pt-0">
                          <div className="border rounded-lg overflow-hidden">
                            <table className="w-full text-sm">
                              <thead className="bg-muted/50">
                                <tr>
                                  <th className="text-left p-3 font-medium">Description</th>
                                  <th className="text-right p-3 font-medium">Qty</th>
                                  <th className="text-right p-3 font-medium">Unit Price</th>
                                  <th className="text-right p-3 font-medium">Line Total</th>
                                </tr>
                              </thead>
                              <tbody>
                                {draft.lineItems.map((item) => (
                                  <tr key={item.id} className="border-t">
                                    <td className="p-3">
                                      <p className="font-medium">{item.name}</p>
                                      <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                                    </td>
                                    <td className="text-right p-3">{item.quantity}</td>
                                    <td className="text-right p-3">
                                      {item.currency || "EUR"} {item.unitPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </td>
                                    <td className="text-right p-3 font-medium">
                                      {item.currency || "EUR"} {item.totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </CardContent>
                      </AccordionContent>
                    </Card>
                  </AccordionItem>

                  {/* Accounting (expanded by default) */}
                  <AccordionItem value="accounting">
                    <Card>
                      <CardHeader className="pb-3">
                        <AccordionTrigger className="hover:no-underline">
                          <div className="flex items-center justify-between w-full pr-4">
                            <CardTitle className="text-base font-semibold">Accounting</CardTitle>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="gap-1 h-8 text-xs"
                              onClick={(e) => {
                                e.stopPropagation();
                                onNavigateToStage(3);
                              }}
                            >
                              <Edit className="h-3 w-3" />
                              Edit
                            </Button>
                          </div>
                        </AccordionTrigger>
                      </CardHeader>
                      <AccordionContent>
                        <CardContent className="pt-0">
                          <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Entity / Company</p>
                              <p className="text-sm font-medium">{draft.entityCode || "N/A"}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Commodity Group</p>
                              <p className="text-sm font-medium">{draft.commodityGroupCode || "N/A"}</p>
                              <p className="text-xs text-muted-foreground">{draft.commodityGroupName || ""}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">GL Account</p>
                              <p className="text-sm font-medium">{draft.glAccountCode || "N/A"}</p>
                              <p className="text-xs text-muted-foreground">{draft.glAccountName || ""}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Cost Center</p>
                              <p className="text-sm font-medium">{draft.costCenterCode || "N/A"}</p>
                              <p className="text-xs text-muted-foreground">{draft.costCenterName || ""}</p>
                            </div>
                          </div>
                        </CardContent>
                      </AccordionContent>
                    </Card>
                  </AccordionItem>

                  {/* Evidence (expanded by default) */}
                  <AccordionItem value="evidence">
                    <Card>
                      <CardHeader className="pb-3">
                        <AccordionTrigger className="hover:no-underline">
                          <CardTitle className="text-base font-semibold">Evidence</CardTitle>
                        </AccordionTrigger>
                      </CardHeader>
                      <AccordionContent>
                        <CardContent className="pt-0">
                          <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                            <div className="flex items-center gap-3">
                              <FileText className="h-5 w-5 text-muted-foreground" />
                              <div>
                                <p className="text-sm font-medium">
                                  Quote — {draft.quoteDetails?.quoteNumber || "Q-2026-0113"} (PDF)
                                </p>
                                <div className="flex items-center gap-1 mt-0.5">
                                  <CheckCircle className="h-3 w-3 text-green-600" />
                                  <span className="text-xs text-muted-foreground">Attached</span>
                                </div>
                              </div>
                            </div>
                            <Button variant="ghost" size="sm" className="text-xs">
                              Preview
                            </Button>
                          </div>
                        </CardContent>
                      </AccordionContent>
                    </Card>
                  </AccordionItem>
                </Accordion>
              </>
            )}

            {/* R1: Catalog Header (only show if NOT R2) */}
            {!isNonCatalog && (
              <>
                {/* Header */}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Package className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                      Review & Submit
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Final check before submitting your purchase request
                    </p>
                  </div>
                </div>
              </>
            )}

            {/* R1: Readiness Banner (only show if NOT R2) */}
            {!isNonCatalog && status === "ready" && (
              <Alert className="border-green-600 bg-green-50 dark:bg-green-950">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-900 dark:text-green-100">
                  Ready to submit
                </AlertTitle>
                <AlertDescription className="text-green-800 dark:text-green-200">
                  Your request is compliant and ready to submit. All checks passed.
                </AlertDescription>
              </Alert>
            )}

            {!isNonCatalog && status === "ready-with-warnings" && (
              <Alert className="border-amber-600 bg-amber-50 dark:bg-amber-950">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <AlertTitle className="text-amber-900 dark:text-amber-100">
                  Ready with warnings
                </AlertTitle>
                <AlertDescription className="text-amber-800 dark:text-amber-200">
                  <p className="mb-2">You can submit, but note the following:</p>
                  <ul className="list-disc list-inside space-y-1">
                    {warnings.slice(0, 3).map((warning, idx) => (
                      <li key={idx} className="text-sm">{warning}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {!isNonCatalog && status === "not-ready" && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertTitle>Not ready</AlertTitle>
                <AlertDescription>
                  <p className="mb-2">Fix the following issues before submitting:</p>
                  <div className="space-y-2 mt-3">
                    {blockers.slice(0, 3).map((blocker) => (
                      <div key={blocker.id} className="flex items-center justify-between bg-destructive/10 p-2 rounded">
                        <span className="text-sm">{blocker.reason}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onNavigateToStage(blocker.fixStage)}
                          className="ml-2"
                        >
                          {blocker.fixLabel}
                        </Button>
                      </div>
                    ))}
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* R1: Card 1: Request Header (only show if NOT R2) */}
            {!isNonCatalog && <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Request Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Requester</p>
                    <p className="text-sm font-medium">{draft.purchaseInfo?.deliverTo || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Entity / Company</p>
                    <p className="text-sm font-medium">{draft.entityCode || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Deliver to</p>
                    <p className="text-sm font-medium">{draft.purchaseInfo?.deliverToLocation || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Need-by date</p>
                    <p className="text-sm font-medium">{draft.purchaseInfo?.needByDate || "N/A"}</p>
                  </div>
                </div>
                <Separator />
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Business justification</p>
                  <p className="text-sm">{draft.purchaseInfo?.usage || "N/A"}</p>
                </div>
              </CardContent>
            </Card>}

            {/* R1: Card 2: Items (only show if NOT R2) */}
            {!isNonCatalog && <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Items ({draft.lineItems.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {draft.lineItems.map((item, index) => (
                  <div key={item.id}>
                    {index > 0 && <Separator className="my-4" />}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-start gap-3">
                          <span className="text-sm font-medium text-muted-foreground">{index + 1}.</span>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-foreground">{item.name}</p>
                            <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline" className="text-xs">
                                {item.supplier}
                              </Badge>
                              {getComplianceBadge(item)}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-sm font-medium">${item.unitPrice.toLocaleString()} × {item.quantity}</p>
                        <p className="text-sm text-muted-foreground">${item.totalPrice.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
                <Separator className="my-4" />
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="font-semibold text-foreground">Total</span>
                    <span className="text-sm text-muted-foreground">({totalQuantity} items)</span>
                  </div>
                  <span className="text-lg font-bold text-foreground">${totalValue.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>}

            {/* R1: Card 3: Accounting (only show if NOT R2) */}
            {!isNonCatalog && <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Accounting</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Commodity Group</p>
                    <p className="text-sm font-medium">{draft.commodityGroupCode || "N/A"}</p>
                    <p className="text-xs text-muted-foreground">{draft.commodityGroupName || ""}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">GL Account</p>
                    <p className="text-sm font-medium">{draft.glAccountCode || "N/A"}</p>
                    <p className="text-xs text-muted-foreground">{draft.glAccountName || ""}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Cost Center</p>
                    <p className="text-sm font-medium">{draft.costCenterCode || "N/A"}</p>
                    <p className="text-xs text-muted-foreground">{draft.costCenterName || ""}</p>
                  </div>
                </div>
              </CardContent>
            </Card>}

            {/* R1: Card 4: Policy Summary (only show if NOT R2) */}
            {!isNonCatalog && <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Policy Checks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {draft.policyChecks && draft.policyChecks.length > 0 ? (
                    draft.policyChecks.map((check) => (
                      <div key={check.id} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                        <div className="flex items-center gap-2">
                          {check.status === "pass" && <CheckCircle className="h-4 w-4 text-green-600" />}
                          {check.status === "warn" && <AlertTriangle className="h-4 w-4 text-amber-600" />}
                          {check.status === "block" && <XCircle className="h-4 w-4 text-destructive" />}
                          <span className="text-sm font-medium">{check.checkName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {check.status === "pass" && <Badge variant="default" className="bg-green-600">Pass</Badge>}
                          {check.status === "warn" && <Badge variant="outline" className="border-amber-600 text-amber-600">Warning</Badge>}
                          {check.status === "block" && <Badge variant="destructive">Blocked</Badge>}
                          {check.detail && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-6 w-6">
                                  <Shield className="h-3 w-3" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-xs max-w-xs">{check.detail}</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No policy checks configured.</p>
                  )}
                </div>
              </CardContent>
            </Card>}
          </div>
        </div>

        {/* Sticky Bottom Action Bar */}
        <div className="border-t bg-background p-4">
          <div className="max-w-4xl mx-auto flex justify-between">
            <Button variant="outline" onClick={onBack}>
              {isNonCatalog ? "Back to Accounting & Policy Checks" : "Back to Accounting"}
            </Button>
            <Button
              size="lg"
              onClick={isNonCatalog ? handleR2Submit : onSubmit}
              disabled={isNonCatalog ? !r2Readiness?.isReady || isSubmitting : status === "not-ready"}
              className="gap-2"
            >
              {isSubmitting ? "Creating PR in SAP/Ariba..." : "Submit Purchase Requisition"}
              {!isSubmitting && <ChevronRight className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
