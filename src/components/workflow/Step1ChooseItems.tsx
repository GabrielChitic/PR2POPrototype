import { useState } from "react";
import { Plus, Minus, Package, Filter, ArrowUpDown, Calendar, AlertCircle, CheckCircle, AlertTriangle, XCircle, FileCheck, Info } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Checkbox } from "../ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Badge } from "../ui/badge";
import { StatusPill } from "../ui/StatusPill";
import { Separator } from "../ui/separator";
import { Alert, AlertDescription } from "../ui/alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import type { CatalogItem, DraftLineItem, FreeTextItemDraft } from "../../types/workflow";

interface Step1Props {
  catalogResults: CatalogItem[];
  selectedItems: DraftLineItem[];
  onAddItem: (item: CatalogItem, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onNext: () => void;
  onAddCustomService: () => void;
  freeTextDraft?: Partial<FreeTextItemDraft> | null;
  onUpdateFreeTextDraft?: (draft: Partial<FreeTextItemDraft>) => void;
  inferredQuantity?: number; // Quantity from chat (e.g., "15 laptops")
}

export function Step1ChooseItems({
  catalogResults,
  selectedItems,
  onAddItem,
  onRemoveItem,
  onUpdateQuantity,
  onNext,
  onAddCustomService: _onAddCustomService,
  freeTextDraft,
  onUpdateFreeTextDraft: _onUpdateFreeTextDraft,
  inferredQuantity,
}: Step1Props) {
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [filterPreferred, setFilterPreferred] = useState(false);
  const [sortBy, setSortBy] = useState<"price-asc" | "price-desc" | "leadtime">("price-asc");

  // Default quantity to use for all items (from chat or 1)
  const defaultQuantity = inferredQuantity || 1;

  // Free text form state
  const [freeTextForm, setFreeTextForm] = useState<Partial<FreeTextItemDraft>>(
    freeTextDraft || {
      itemName: "",
      description: "",
      estimatedValue: 0,
      currency: "USD",
      desiredDeliveryDate: "",
      preferredSupplier: "",
    }
  );

  const getQuantity = (itemId: string) => quantities[itemId] || defaultQuantity;

  const handleQuantityChange = (itemId: string, delta: number) => {
    const current = getQuantity(itemId);
    const newQty = Math.max(1, current + delta);
    setQuantities((prev) => ({ ...prev, [itemId]: newQty }));
  };

  // Filter and sort catalog results
  const filteredAndSortedResults = (() => {
    let results = [...catalogResults];

    if (filterPreferred) {
      results = results.filter(item => item.isPreferredSupplier);
    }

    results.sort((a, b) => {
      switch (sortBy) {
        case "price-asc":
          return a.unitPrice - b.unitPrice;
        case "price-desc":
          return b.unitPrice - a.unitPrice;
        case "leadtime":
          return (a.leadTimeDays || 999) - (b.leadTimeDays || 999);
        default:
          return 0;
      }
    });

    return results;
  })();

  const showFreeTextForm = catalogResults.length === 0 && freeTextDraft;

  const handleFreeTextSubmit = () => {
    // Validate required fields
    if (!freeTextForm.itemName || !freeTextForm.estimatedValue || !freeTextForm.desiredDeliveryDate) {
      alert("Please fill in all required fields");
      return;
    }

    // Create a free text line item (using onAddItem with a mock catalog item)
    const mockItem: CatalogItem = {
      id: `freetext-${Date.now()}`,
      name: freeTextForm.itemName!,
      description: freeTextForm.description!,
      category: freeTextForm.category || "General",
      unitPrice: freeTextForm.estimatedValue!,
      currency: freeTextForm.currency!,
      unitOfMeasure: "EA",
      supplier: freeTextForm.preferredSupplier || "TBD",
      supplierName: freeTextForm.preferredSupplier,
      isPreferredSupplier: false,
      keywords: [],
      compliance: {
        preferred: false,
        contractStatus: "missing",
        allowed: true,
      },
    };

    onAddItem(mockItem, 1);
  };

  return (
    <TooltipProvider>
      <div className="flex-1 overflow-y-auto p-8 bg-muted/30">
        <div className="max-w-6xl mx-auto space-y-6">
        {/* Catalog Grid (1A) */}
        {!showFreeTextForm && catalogResults.length > 0 && (
          <>
            <div>
              <h2 className="text-2xl font-semibold tracking-tight mb-2">Choose items from catalog</h2>
              <p className="text-sm text-muted-foreground">
                Found {catalogResults.length} matching items. Select and configure your order below.
              </p>
            </div>

            {/* Filters and Sort */}
            <Card>
              <CardContent className="flex items-center justify-between gap-4 p-4">
                <div className="flex items-center gap-3">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="filter-preferred"
                      checked={filterPreferred}
                      onCheckedChange={(checked) => setFilterPreferred(checked as boolean)}
                    />
                    <Label
                      htmlFor="filter-preferred"
                      className="text-sm font-normal cursor-pointer"
                    >
                      Preferred suppliers only
                    </Label>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                  <Select value={sortBy} onValueChange={(value: string) => setSortBy(value as any)}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="price-asc">Price: Low to High</SelectItem>
                      <SelectItem value="price-desc">Price: High to Low</SelectItem>
                      <SelectItem value="leadtime">Lead Time: Fastest First</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Catalog Items Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredAndSortedResults.map((item) => {
                const isSelected = selectedItems.some((si) => si.id === item.id);
                const quantity = getQuantity(item.id);

                return (
                  <Card key={item.id} className="overflow-hidden transition-all hover:shadow-md">
                    <CardContent className="p-6">
                      <div className="flex gap-4">
                        {/* Thumbnail Image */}
                        <div className="flex-shrink-0">
                          <div className="w-24 h-24 bg-gradient-to-br from-primary/10 to-primary/20 rounded-lg flex items-center justify-center border border-primary/20">
                            <Package className="h-12 w-12 text-primary/60" />
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 space-y-3">
                          {/* Header with Name and Badge */}
                          <div>
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <h4 className="font-semibold text-base leading-tight">{item.name}</h4>
                              {item.isPreferredSupplier ? (
                                <StatusPill variant="approved">Preferred</StatusPill>
                              ) : (
                                <Badge variant="outline">Standard</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                          </div>

                          {/* Compliance Signals */}
                          <div className="flex flex-wrap items-center gap-2">
                            {/* Preferred/Non-Preferred */}
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Badge
                                  variant={item.compliance.preferred ? "default" : "outline"}
                                  className="text-xs font-normal cursor-help gap-1"
                                >
                                  {item.compliance.preferred ? (
                                    <>
                                      <CheckCircle className="h-3 w-3" />
                                      Preferred
                                    </>
                                  ) : (
                                    <>
                                      <AlertTriangle className="h-3 w-3" />
                                      Non-preferred
                                    </>
                                  )}
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-xs">
                                  {item.compliance.preferred ? "Preferred supplier" : item.compliance.preferredReason || "Non-preferred supplier"}
                                </p>
                              </TooltipContent>
                            </Tooltip>

                            {/* Contract Status */}
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Badge
                                  variant={item.compliance.contractStatus === "valid" ? "default" : "outline"}
                                  className="text-xs font-normal cursor-help gap-1"
                                >
                                  {item.compliance.contractStatus === "valid" ? (
                                    <>
                                      <FileCheck className="h-3 w-3" />
                                      Contract
                                    </>
                                  ) : (
                                    <>
                                      <AlertTriangle className="h-3 w-3" />
                                      Contract {item.compliance.contractStatus}
                                    </>
                                  )}
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-xs">
                                  {item.compliance.contractReason || `Contract status: ${item.compliance.contractStatus}`}
                                </p>
                              </TooltipContent>
                            </Tooltip>

                            {/* Blocked/Allowed */}
                            {!item.compliance.allowed && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Badge variant="destructive" className="text-xs font-normal cursor-help gap-1">
                                    <XCircle className="h-3 w-3" />
                                    Blocked
                                  </Badge>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="text-xs max-w-[200px]">
                                    {item.compliance.blockedReason || "This item is blocked by policy"}
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            )}

                            {/* Info icon for more details */}
                            {item.compliance.allowed && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-5 w-5 p-0">
                                    <Info className="h-3 w-3 text-muted-foreground" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="text-xs font-medium mb-1">Compliance Details:</p>
                                  <ul className="text-xs space-y-0.5 text-muted-foreground">
                                    <li>• Supplier: {item.compliance.preferred ? "Preferred" : "Non-preferred"}</li>
                                    <li>• Contract: {item.compliance.contractStatus}</li>
                                    <li>• Status: Allowed</li>
                                  </ul>
                                </TooltipContent>
                              </Tooltip>
                            )}
                          </div>

                          {/* Price and Supplier Row */}
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <p className="text-xs text-muted-foreground">Supplier</p>
                              <p className="text-sm font-medium">{item.supplierName || item.supplier}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold">${item.unitPrice.toFixed(2)}</p>
                              <p className="text-xs text-muted-foreground">{item.currency} / {item.unitOfMeasure}</p>
                            </div>
                          </div>

                          {/* Lead Time and Details Link */}
                          <div className="flex items-center justify-between text-xs">
                            {item.leadTimeDays && (
                              <p className="text-muted-foreground flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {item.leadTimeDays} days lead time
                              </p>
                            )}
                            <Button
                              variant="link"
                              size="sm"
                              className="h-auto p-0 text-xs"
                              onClick={(e: React.MouseEvent<HTMLButtonElement>) => e.preventDefault()}
                            >
                              View details →
                            </Button>
                          </div>

                          <Separator />

                          {/* Actions */}
                          <div className="flex items-center justify-between pt-1">
                            {!isSelected ? (
                              <>
                                <div className="flex items-center border rounded-md">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-9 w-9 rounded-r-none"
                                    onClick={() => handleQuantityChange(item.id, -1)}
                                    disabled={!item.compliance.allowed}
                                  >
                                    <Minus className="h-4 w-4" />
                                  </Button>
                                  <div className="w-12 text-center font-semibold text-sm border-x">
                                    {quantity}
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-9 w-9 rounded-l-none"
                                    onClick={() => handleQuantityChange(item.id, 1)}
                                    disabled={!item.compliance.allowed}
                                  >
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                </div>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span>
                                      <Button
                                        size="sm"
                                        onClick={() => onAddItem(item, quantity)}
                                        disabled={!item.compliance.allowed}
                                      >
                                        Add to Request
                                      </Button>
                                    </span>
                                  </TooltipTrigger>
                                  {!item.compliance.allowed && (
                                    <TooltipContent>
                                      <p className="text-xs">Blocked: {item.compliance.blockedReason || "This item cannot be added"}</p>
                                    </TooltipContent>
                                  )}
                                </Tooltip>
                              </>
                            ) : (
                              <Button size="sm" variant="secondary" onClick={() => onRemoveItem(item.id)} className="ml-auto">
                                Remove
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </>
        )}

        {/* Free Text Form (1B) */}
        {showFreeTextForm && (
          <div className="space-y-6">
            <Alert variant="warning">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>No catalog match found.</strong> Please provide details for a custom/free-text item request.
              </AlertDescription>
            </Alert>

            <Card>
              <CardHeader>
                <CardTitle>Free Text Item Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Item Name */}
                <div className="space-y-2">
                  <Label htmlFor="item-name">
                    Item Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="item-name"
                    value={freeTextForm.itemName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFreeTextForm(prev => ({ ...prev, itemName: e.target.value }))}
                    placeholder="e.g., Consulting services for SAP rollout"
                    required
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">
                    Description <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="description"
                    value={freeTextForm.description}
                    onChange={(e) => setFreeTextForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Provide details about what you need..."
                    rows={3}
                    required
                  />
                </div>

                {/* Estimated Value */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="estimated-budget">
                      Estimated Budget <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="estimated-budget"
                      type="number"
                      value={freeTextForm.estimatedValue || ""}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFreeTextForm(prev => ({ ...prev, estimatedValue: parseFloat(e.target.value) }))}
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select
                      value={freeTextForm.currency}
                      onValueChange={(value: string) => setFreeTextForm(prev => ({ ...prev, currency: value }))}
                    >
                      <SelectTrigger id="currency">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="GBP">GBP</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Delivery Date */}
                <div className="space-y-2">
                  <Label htmlFor="delivery-date">
                    Desired Delivery Date <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="delivery-date"
                    type="date"
                    value={freeTextForm.desiredDeliveryDate}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFreeTextForm(prev => ({ ...prev, desiredDeliveryDate: e.target.value }))}
                    required
                  />
                </div>

                {/* Preferred Supplier */}
                <div className="space-y-2">
                  <Label htmlFor="preferred-supplier">
                    Preferred Supplier (Optional)
                  </Label>
                  <Input
                    id="preferred-supplier"
                    value={freeTextForm.preferredSupplier}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFreeTextForm(prev => ({ ...prev, preferredSupplier: e.target.value }))}
                    placeholder="e.g., Accenture, Dell, etc."
                  />
                </div>

                {/* Submit Button */}
                <div className="flex justify-end pt-4">
                  <Button onClick={handleFreeTextSubmit} size="lg">
                    Add to Request
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Selected Items Basket */}
        {selectedItems.length > 0 && (
          <div className="border-t border-gray-200 pt-6 space-y-4">
            <h3 className="text-base font-semibold text-gray-900">My Request ({selectedItems.length})</h3>
            <div className="space-y-3">
              {selectedItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 bg-blue-50 border border-blue-100 rounded-xl"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{item.name}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      Qty: {item.quantity} × ${item.unitPrice} = <span className="font-semibold">${item.totalPrice}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 border-2 border-gray-200 bg-white rounded-lg">
                      <button
                        onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="p-1.5 hover:bg-gray-100 rounded-l-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <Minus className="h-3 w-3 text-gray-600" />
                      </button>
                      <span className="w-8 text-center text-sm font-semibold text-gray-900">{item.quantity}</span>
                      <button
                        onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                        className="p-1.5 hover:bg-gray-100 rounded-r-lg transition-colors"
                      >
                        <Plus className="h-3 w-3 text-gray-600" />
                      </button>
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => onRemoveItem(item.id)}>
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end pt-4">
              <Button onClick={onNext} size="lg">
                Next: Purchase Information
              </Button>
            </div>
          </div>
        )}
        </div>
      </div>
    </TooltipProvider>
  );
}
