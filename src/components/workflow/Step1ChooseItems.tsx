import { useState } from "react";
import { Plus, Minus, Package, Filter, ArrowUpDown, Calendar } from "lucide-react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Card } from "../ui/Card";
import { StatusPill } from "../ui/StatusPill";
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
}: Step1Props) {
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [filterPreferred, setFilterPreferred] = useState(false);
  const [sortBy, setSortBy] = useState<"price-asc" | "price-desc" | "leadtime">("price-asc");

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

  const getQuantity = (itemId: string) => quantities[itemId] || 1;

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
    };

    onAddItem(mockItem, 1);
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-gray-50">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Catalog Grid (1A) */}
        {!showFreeTextForm && catalogResults.length > 0 && (
          <>
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Choose items from catalog</h2>
              <p className="text-sm text-gray-600">
                Found {catalogResults.length} matching items. Select and configure your order below.
              </p>
            </div>

            {/* Filters and Sort */}
            <div className="flex items-center justify-between gap-4 p-4 bg-white rounded-lg border border-gray-200">
              <div className="flex items-center gap-3">
                <Filter className="h-4 w-4 text-gray-500" />
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={filterPreferred}
                    onChange={(e) => setFilterPreferred(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-gray-700">Preferred suppliers only</span>
                </label>
              </div>

              <div className="flex items-center gap-2">
                <ArrowUpDown className="h-4 w-4 text-gray-500" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="text-sm border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-600"
                >
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="leadtime">Lead Time: Fastest First</option>
                </select>
              </div>
            </div>

            {/* Catalog Items Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredAndSortedResults.map((item) => {
                const isSelected = selectedItems.some((si) => si.id === item.id);
                const quantity = getQuantity(item.id);

                return (
                  <Card key={item.id} className="p-6 bg-white hover:shadow-lg transition-shadow">
                    <div className="flex gap-4">
                      {/* Thumbnail Image */}
                      <div className="flex-shrink-0">
                        <div className="w-24 h-24 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg flex items-center justify-center border border-blue-200">
                          <Package className="h-12 w-12 text-blue-400" />
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 space-y-3">
                        {/* Header with Name and Badge */}
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h4 className="font-semibold text-gray-900 text-base leading-tight">{item.name}</h4>
                            {item.isPreferredSupplier ? (
                              <StatusPill variant="approved">Preferred</StatusPill>
                            ) : (
                              <StatusPill variant="draft">Standard</StatusPill>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 line-clamp-2">{item.description}</p>
                        </div>

                        {/* Key Specs */}
                        {item.specs && Object.keys(item.specs).length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {Object.entries(item.specs).slice(0, 3).map(([key, value]) => (
                              <span
                                key={key}
                                className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded font-medium"
                              >
                                {key}: {value}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Price and Supplier Row */}
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <p className="text-xs text-gray-500">Supplier</p>
                            <p className="text-sm text-gray-900 font-medium">{item.supplierName || item.supplier}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-gray-900">${item.unitPrice.toFixed(2)}</p>
                            <p className="text-xs text-gray-500">{item.currency} / {item.unitOfMeasure}</p>
                          </div>
                        </div>

                        {/* Lead Time and Details Link */}
                        <div className="flex items-center justify-between text-xs">
                          {item.leadTimeDays && (
                            <p className="text-gray-600 flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {item.leadTimeDays} days lead time
                            </p>
                          )}
                          <a
                            href="#"
                            className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
                            onClick={(e) => e.preventDefault()}
                          >
                            View additional details →
                          </a>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                          {!isSelected ? (
                            <>
                              <div className="flex items-center gap-1 border-2 border-gray-300 rounded-lg bg-white">
                                <button
                                  onClick={() => handleQuantityChange(item.id, -1)}
                                  className="p-2 hover:bg-gray-100 rounded-l-lg transition-colors"
                                >
                                  <Minus className="h-4 w-4 text-gray-600" />
                                </button>
                                <span className="w-12 text-center font-semibold text-gray-900">{quantity}</span>
                                <button
                                  onClick={() => handleQuantityChange(item.id, 1)}
                                  className="p-2 hover:bg-gray-100 rounded-r-lg transition-colors"
                                >
                                  <Plus className="h-4 w-4 text-gray-600" />
                                </button>
                              </div>
                              <Button size="sm" onClick={() => onAddItem(item, quantity)}>
                                Add to Request
                              </Button>
                            </>
                          ) : (
                            <Button size="sm" variant="secondary" onClick={() => onRemoveItem(item.id)} className="ml-auto">
                              Remove
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </>
        )}

        {/* Free Text Form (1B) */}
        {showFreeTextForm && (
          <div className="space-y-6">
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <p className="text-sm text-amber-900">
                <strong>No catalog match found.</strong> Please provide details for a custom/free-text item request.
              </p>
            </div>

            <Card className="p-6 bg-white">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Free Text Item Details</h3>

              <div className="space-y-4">
                {/* Item Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Item Name <span className="text-red-600">*</span>
                  </label>
                  <Input
                    value={freeTextForm.itemName}
                    onChange={(e) => setFreeTextForm(prev => ({ ...prev, itemName: e.target.value }))}
                    placeholder="e.g., Consulting services for SAP rollout"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description <span className="text-red-600">*</span>
                  </label>
                  <textarea
                    value={freeTextForm.description}
                    onChange={(e) => setFreeTextForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Provide details about what you need..."
                    rows={3}
                    className="w-full border-2 border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-600"
                    required
                  />
                </div>

                {/* Estimated Value */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Estimated Budget <span className="text-red-600">*</span>
                    </label>
                    <Input
                      type="number"
                      value={freeTextForm.estimatedValue || ""}
                      onChange={(e) => setFreeTextForm(prev => ({ ...prev, estimatedValue: parseFloat(e.target.value) }))}
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                    <select
                      value={freeTextForm.currency}
                      onChange={(e) => setFreeTextForm(prev => ({ ...prev, currency: e.target.value }))}
                      className="w-full h-10 border-2 border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-600"
                    >
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                    </select>
                  </div>
                </div>

                {/* Delivery Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Desired Delivery Date <span className="text-red-600">*</span>
                  </label>
                  <Input
                    type="date"
                    value={freeTextForm.desiredDeliveryDate}
                    onChange={(e) => setFreeTextForm(prev => ({ ...prev, desiredDeliveryDate: e.target.value }))}
                    required
                  />
                </div>

                {/* Preferred Supplier */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preferred Supplier (Optional)
                  </label>
                  <Input
                    value={freeTextForm.preferredSupplier}
                    onChange={(e) => setFreeTextForm(prev => ({ ...prev, preferredSupplier: e.target.value }))}
                    placeholder="e.g., Accenture, Dell, etc."
                  />
                </div>

                {/* Submit Button */}
                <div className="flex justify-end pt-4">
                  <Button onClick={handleFreeTextSubmit} size="lg">
                    Add to Request
                  </Button>
                </div>
              </div>
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
  );
}
