import { Shield, CheckCircle, AlertTriangle, XCircle, Info, RefreshCw } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Badge } from "../ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { Separator } from "../ui/separator";
import type { DraftPR, CheckStatus } from "../../types/workflow";
import { COMMODITY_GROUPS, GL_ACCOUNTS, COST_CENTERS } from "../../data/accountingData";

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

export function Step3AccountingChecks({ draft, onUpdate, onNext, onBack, onRunChecks }: Step3Props) {
  const accountingValidation = draft.accountingValidation || {
    commodityGroup: "pass",
    glAccount: "pass",
    costCenter: "pass",
  };

  const policyChecks = draft.policyChecks || [];

  // Check if there are any blocking issues
  const hasBlockers =
    accountingValidation.commodityGroup === "block" ||
    accountingValidation.glAccount === "block" ||
    accountingValidation.costCenter === "block" ||
    policyChecks.some(check => check.status === "block");

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
              Back to Delivery
            </Button>
            <Button onClick={onNext} disabled={hasBlockers}>
              Next: Review & Submit
            </Button>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
