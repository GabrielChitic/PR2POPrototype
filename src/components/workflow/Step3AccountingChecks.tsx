import { useEffect } from "react";
import { Shield, CheckCircle, AlertTriangle, XCircle, Info, RefreshCw } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Badge } from "../ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { Separator } from "../ui/separator";
import { Label } from "../ui/label";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import type { DraftPR, CheckStatus, PolicyCheckResult } from "../../types/workflow";
import { COMMODITY_GROUPS, GL_ACCOUNTS, COST_CENTERS, getDefaultAccountingForCategory, getDefaultCostCenterForLocation } from "../../data/accountingData";

interface Step3Props {
  draft: DraftPR;
  onUpdate: (updates: Partial<DraftPR>) => void;
  onNext: () => void;
  onBack: () => void;
  onRunChecks?: () => void;
}

// Helper: Get status icon
function getStatusIcon(status: CheckStatus) {
  switch (status) {
    case "pass":
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    case "warn":
      return <AlertTriangle className="h-4 w-4 text-amber-600" />;
    case "block":
      return <XCircle className="h-4 w-4 text-destructive" />;
  }
}

// Helper: Get status badge variant
function getStatusBadge(status: CheckStatus) {
  switch (status) {
    case "pass":
      return <Badge variant="default" className="bg-green-600">Valid</Badge>;
    case "warn":
      return <Badge variant="outline" className="border-amber-600 text-amber-600">Warning</Badge>;
    case "block":
      return <Badge variant="destructive">Invalid</Badge>;
  }
}

// R2: Generate policy checks for happy path
function generateR2PolicyChecks(draft: DraftPR): PolicyCheckResult[] {
  const checks: PolicyCheckResult[] = [];
  const entityCode = draft.entityCode || "UIPATH-RO";
  const currency = draft.lineItems[0]?.currency || "EUR";
  const totalValue = draft.lineItems.reduce((sum, item) => sum + item.totalPrice, 0);
  const supplierName = draft.lineItems[0]?.supplier || "Manufacturing A/S";
  const quoteNumber = draft.quoteDetails?.quoteNumber || "Q-2026-0113";
  const deliverySite = draft.purchaseInfo?.shipToAddress?.split(",")[0] || "Aarhus";

  // Passed checks
  checks.push({
    id: "check-supplier-active",
    checkName: "Supplier exists and is active",
    status: "pass",
    message: `${supplierName} is an active supplier in the system.`,
  });

  checks.push({
    id: "check-quote-attached",
    checkName: "Quote attached and within validity",
    status: "pass",
    message: `Quote ${quoteNumber} is attached and valid for 30 days from issue date.`,
  });

  checks.push({
    id: "check-sourcing-threshold",
    checkName: "Spend below sourcing threshold",
    status: "pass",
    message: `${currency} ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })} is below the ${currency} 10,000 sourcing threshold for PPE category. No additional sourcing required.`,
  });

  checks.push({
    id: "check-currency-allowed",
    checkName: "Currency allowed for entity",
    status: "pass",
    message: `${currency} is an allowed currency for ${entityCode} entity.`,
  });

  checks.push({
    id: "check-site-valid",
    checkName: "Deliver-to site valid for entity",
    status: "pass",
    message: `Selected site (${deliverySite}) is valid for ${entityCode} entity.`,
  });

  checks.push({
    id: "check-accounting-complete",
    checkName: "Accounting complete",
    status: "pass",
    message: "All required accounting fields (Commodity Group, GL Account, Cost Center) are present.",
  });

  checks.push({
    id: "check-no-duplicates",
    checkName: "Duplicate check",
    status: "pass",
    message: "No similar open PR found for this supplier/item combination.",
  });

  // Optional warning: Lead time vs need-by date (only if need-by date is set and earlier than 2 weeks)
  if (draft.purchaseInfo?.needByDate) {
    const needByDate = new Date(draft.purchaseInfo.needByDate);
    const today = new Date();
    const twoWeeksFromNow = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000);

    if (needByDate < twoWeeksFromNow) {
      checks.push({
        id: "check-lead-time",
        checkName: "Lead time vs need-by date",
        status: "warn",
        message: "Need-by date is earlier than quoted lead time (2 weeks). Delivery may require expediting.",
        detail: "Consider adjusting the need-by date or discussing expedited shipping with the supplier.",
      });
    }
  }

  return checks;
}

export function Step3AccountingChecks({ draft, onUpdate, onNext, onBack, onRunChecks }: Step3Props) {
  const accountingValidation = draft.accountingValidation || {
    commodityGroup: "pass",
    glAccount: "pass",
    costCenter: "pass",
  };

  const policyChecks = draft.policyChecks || [];

  // R2 NON_CATALOG detection
  const isNonCatalog = draft.journeyType === "NON_CATALOG";

  // Check if there are any blocking issues
  const hasBlockers =
    accountingValidation.commodityGroup === "block" ||
    accountingValidation.glAccount === "block" ||
    accountingValidation.costCenter === "block" ||
    policyChecks.some(check => check.status === "block");

  // R2 validation
  const isValidR2 =
    draft.commodityGroupId &&
    draft.glAccountId &&
    draft.costCenterId &&
    draft.accountAssignmentType &&
    (draft.accountAssignmentType === "CostCenter" || draft.wbsElement);

  // Initialize R2 defaults on mount
  useEffect(() => {
    if (!isNonCatalog || draft.lineItems.length === 0) {
      return;
    }

    const updates: Partial<DraftPR> = {};
    let needsUpdate = false;

    // Set entity to UIPATH-DK
    if (!draft.entityCode) {
      updates.entityCode = "UIPATH-DK";
      needsUpdate = true;
    }

    // Infer accounting from item category (Safety Equipment)
    const firstItem = draft.lineItems[0];
    const category = firstItem.category || "Safety Equipment";
    const defaultAccounting = getDefaultAccountingForCategory(category);

    if (!draft.commodityGroupId && defaultAccounting.commodityGroup) {
      updates.commodityGroupId = defaultAccounting.commodityGroup.id;
      updates.commodityGroupCode = defaultAccounting.commodityGroup.code;
      updates.commodityGroupName = defaultAccounting.commodityGroup.name;
      needsUpdate = true;
    }

    if (!draft.glAccountId && defaultAccounting.glAccount) {
      updates.glAccountId = defaultAccounting.glAccount.id;
      updates.glAccountCode = defaultAccounting.glAccount.code;
      updates.glAccountName = defaultAccounting.glAccount.name;
      needsUpdate = true;
    }

    // Infer cost center from delivery location (Aarhus)
    const location = draft.purchaseInfo?.deliverToLocation || "Aarhus";
    const defaultCostCenter = getDefaultCostCenterForLocation(location);

    if (!draft.costCenterId && defaultCostCenter) {
      updates.costCenterId = defaultCostCenter.id;
      updates.costCenterCode = defaultCostCenter.code;
      updates.costCenterName = defaultCostCenter.name;
      needsUpdate = true;
    }

    // Default account assignment type to Cost Center
    if (!draft.accountAssignmentType) {
      updates.accountAssignmentType = "CostCenter";
      needsUpdate = true;
    }

    // Always regenerate policy checks for R2 (to replace any R1 legacy checks)
    const r2PolicyChecks = generateR2PolicyChecks(draft);
    // Check if we need to update: check for R2-specific check IDs
    const hasR2Checks =
      draft.policyChecks &&
      draft.policyChecks.some((check) => check.id === "check-supplier-active");

    if (!hasR2Checks) {
      console.log("[Stage3] Generating R2 policy checks, replacing legacy checks");
      updates.policyChecks = r2PolicyChecks;
      needsUpdate = true;
    }

    // Initialize accounting validation (all pass for R2 happy path)
    if (!draft.accountingValidation) {
      updates.accountingValidation = {
        commodityGroup: "pass",
        glAccount: "pass",
        costCenter: "pass",
      };
      needsUpdate = true;
    }

    if (needsUpdate) {
      console.log("[Stage3] Updating draft with R2 defaults:", updates);
      onUpdate(updates);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isNonCatalog, draft.lineItems.length, draft.entityCode, draft.commodityGroupId]);

  return (
    <TooltipProvider>
      <div className="flex-1 overflow-y-auto p-8 bg-muted/30">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                Accounting & Policy Checks
              </h2>
              <p className="text-sm text-muted-foreground">
                We've prefilled coding and validated key rules. Fix any issues before continuing.
              </p>
            </div>
          </div>

          {/* R2: Summary Strip */}
          {isNonCatalog && draft.lineItems.length > 0 && (
            <div className="bg-muted/50 border border-border rounded-lg px-4 py-2">
              <p className="text-sm text-muted-foreground">
                {draft.lineItems[0].quantity} × {draft.lineItems[0].name} •{" "}
                {draft.lineItems[0].supplier} •{" "}
                {draft.lineItems[0].currency || "EUR"}{" "}
                {draft.lineItems
                  .reduce((sum, item) => sum + item.totalPrice, 0)
                  .toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{" "}
                • {draft.purchaseInfo?.shipToAddress?.split(",")[0] || "Aarhus"} (DK)
              </p>
            </div>
          )}

          {/* Card A: Accounting Fields */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">Accounting</CardTitle>
                {onRunChecks && (
                  <Button variant="ghost" size="sm" onClick={onRunChecks} className="gap-2">
                    <RefreshCw className="h-3 w-3" />
                    Re-run checks
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Entity Code (Read-only) */}
              <div className="grid grid-cols-[1fr_auto] gap-4 items-center">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Entity / Company Code
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 px-3 py-2 bg-muted/50 border border-border rounded-md text-sm text-muted-foreground">
                      {draft.entityCode || "UIPATH-RO"}
                    </div>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Info className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">Entity is determined by your profile and cannot be changed here.</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
                <div className="pt-6">
                  {getStatusIcon("pass")}
                </div>
              </div>

              <Separator />

              {/* Commodity Group */}
              <div className="grid grid-cols-[1fr_auto] gap-4 items-center">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Commodity Group <span className="text-destructive">*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <Select
                      value={draft.commodityGroupId || ""}
                      onValueChange={(value: string) => {
                        const selected = COMMODITY_GROUPS.find(cg => cg.id === value);
                        if (selected) {
                          onUpdate({
                            commodityGroupId: selected.id,
                            commodityGroupCode: selected.code,
                            commodityGroupName: selected.name,
                          });
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select commodity group" />
                      </SelectTrigger>
                      <SelectContent>
                        {COMMODITY_GROUPS.map((cg) => (
                          <SelectItem key={cg.id} value={cg.id}>
                            {cg.code} - {cg.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {draft.commodityGroupCode && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Info className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">Auto-assigned based on item category: {draft.commodityGroupName}</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                </div>
                <div className="pt-6">
                  {getStatusIcon(accountingValidation.commodityGroup)}
                </div>
              </div>

              {/* GL Account */}
              <div className="grid grid-cols-[1fr_auto] gap-4 items-center">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    GL Account <span className="text-destructive">*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <Select
                      value={draft.glAccountId || ""}
                      onValueChange={(value: string) => {
                        const selected = GL_ACCOUNTS.find(gl => gl.id === value);
                        if (selected) {
                          onUpdate({
                            glAccountId: selected.id,
                            glAccountCode: selected.code,
                            glAccountName: selected.name,
                          });
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select GL account" />
                      </SelectTrigger>
                      <SelectContent>
                        {GL_ACCOUNTS.map((gl) => (
                          <SelectItem key={gl.id} value={gl.id}>
                            {gl.code} - {gl.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {draft.glAccountCode && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Info className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">Auto-assigned: {draft.glAccountName}</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                </div>
                <div className="pt-6">
                  {getStatusIcon(accountingValidation.glAccount)}
                </div>
              </div>

              {/* Cost Center */}
              <div className="grid grid-cols-[1fr_auto] gap-4 items-center">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Cost Center <span className="text-destructive">*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <Select
                      value={draft.costCenterId || ""}
                      onValueChange={(value: string) => {
                        const selected = COST_CENTERS.find(cc => cc.id === value);
                        if (selected) {
                          onUpdate({
                            costCenterId: selected.id,
                            costCenterCode: selected.code,
                            costCenterName: selected.name,
                          });
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select cost center" />
                      </SelectTrigger>
                      <SelectContent>
                        {COST_CENTERS.map((cc) => (
                          <SelectItem key={cc.id} value={cc.id}>
                            {cc.code} - {cc.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {draft.costCenterCode && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Info className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">Default cost center for {draft.purchaseInfo?.deliverToLocation}: {draft.costCenterName}</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                </div>
                <div className="pt-6">
                  {getStatusIcon(accountingValidation.costCenter)}
                </div>
              </div>

              {/* R2: Account Assignment Type */}
              {isNonCatalog && (
                <>
                  <Separator />
                  <div>
                    <Label className="text-sm font-medium text-foreground mb-2 block">
                      Account Assignment Type <span className="text-destructive">*</span>
                    </Label>
                    <RadioGroup
                      value={draft.accountAssignmentType || "CostCenter"}
                      onValueChange={(value: "CostCenter" | "Project") => {
                        onUpdate({ accountAssignmentType: value });
                        // Clear WBS if switching to Cost Center
                        if (value === "CostCenter") {
                          onUpdate({ wbsElement: undefined, internalOrder: undefined });
                        }
                      }}
                      className="flex gap-6"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="CostCenter" id="acc-cost-center" />
                        <Label htmlFor="acc-cost-center" className="font-normal cursor-pointer">
                          Cost Center
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Project" id="acc-project" />
                        <Label htmlFor="acc-project" className="font-normal cursor-pointer">
                          Project / WBS
                        </Label>
                      </div>
                    </RadioGroup>

                    {/* WBS Element (conditional) */}
                    {draft.accountAssignmentType === "Project" && (
                      <div className="mt-3">
                        <Label htmlFor="wbs-element" className="text-sm mb-1">
                          WBS Element / Project Code <span className="text-destructive">*</span>
                        </Label>
                        <Select
                          value={draft.wbsElement || ""}
                          onValueChange={(value: string) => onUpdate({ wbsElement: value })}
                        >
                          <SelectTrigger id="wbs-element">
                            <SelectValue placeholder="Select WBS element" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="WBS-2026-SAFETY">
                              WBS-2026-SAFETY - Safety Compliance 2026
                            </SelectItem>
                            <SelectItem value="WBS-2026-MAINT-Q1">
                              WBS-2026-MAINT-Q1 - Plant Maintenance Q1
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Card B: Policy Checks */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Policy Checks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {policyChecks.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No policy checks configured.</p>
                ) : (
                  policyChecks.map((check) => (
                    <div key={check.id} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                      <div className="pt-0.5">
                        {getStatusIcon(check.status)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <p className="text-sm font-medium text-foreground">{check.checkName}</p>
                          {getStatusBadge(check.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">{check.message}</p>
                        {check.detail && (
                          <details className="mt-2">
                            <summary className="text-xs text-primary cursor-pointer hover:underline">
                              Show details
                            </summary>
                            <p className="text-xs text-muted-foreground mt-1 pl-4">{check.detail}</p>
                          </details>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between pt-6">
            <Button variant="outline" onClick={onBack}>
              {isNonCatalog ? "Back to Delivery & Details" : "Back to Delivery"}
            </Button>
            <Button
              onClick={onNext}
              disabled={isNonCatalog ? !isValidR2 : hasBlockers}
            >
              Next: Review & Submit
            </Button>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
