import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import type { PurchaseInfo } from "../../types/workflow";

interface Step2Props {
  purchaseInfo: PurchaseInfo;
  onUpdate: (info: Partial<PurchaseInfo>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function Step2PurchaseInfo({ purchaseInfo, onUpdate, onNext, onBack }: Step2Props) {
  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-1">Purchase Information</h2>
          <p className="text-sm text-muted-foreground">
            Help us route this correctly by providing a bit more context
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              What is this used for? *
            </label>
            <Input
              value={purchaseInfo.usage}
              onChange={(e) => onUpdate({ usage: e.target.value })}
              placeholder="e.g., New employee onboarding, Office renovation"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              Is this part of a project?
            </label>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={purchaseInfo.isPartOfProject}
                  onChange={() => onUpdate({ isPartOfProject: true })}
                />
                <span className="text-sm">Yes</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={!purchaseInfo.isPartOfProject}
                  onChange={() => onUpdate({ isPartOfProject: false, projectName: "" })}
                />
                <span className="text-sm">No</span>
              </label>
            </div>
            {purchaseInfo.isPartOfProject && (
              <Input
                className="mt-2"
                value={purchaseInfo.projectName || ""}
                onChange={(e) => onUpdate({ projectName: e.target.value })}
                placeholder="Project name"
              />
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Deliver to</label>
              <Input
                value={purchaseInfo.deliverTo}
                onChange={(e) => onUpdate({ deliverTo: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Location</label>
              <Input
                value={purchaseInfo.deliverToLocation}
                onChange={(e) => onUpdate({ deliverToLocation: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Need by date</label>
            <Input
              type="date"
              value={purchaseInfo.needByDate}
              onChange={(e) => onUpdate({ needByDate: e.target.value })}
            />
          </div>

          <div className="border-t pt-4 space-y-3">
            <p className="text-sm font-medium">Quick compliance checks</p>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={purchaseInfo.involvesPersonalData}
                onChange={(e) => onUpdate({ involvesPersonalData: e.target.checked })}
              />
              <span className="text-sm">Involves personal data</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={purchaseInfo.involvesThirdParty}
                onChange={(e) => onUpdate({ involvesThirdParty: e.target.checked })}
              />
              <span className="text-sm">Involves third-party services</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={purchaseInfo.requiresSpecialApproval}
                onChange={(e) => onUpdate({ requiresSpecialApproval: e.target.checked })}
              />
              <span className="text-sm">Requires special approval</span>
            </label>
          </div>
        </div>

        <div className="flex justify-between pt-6">
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button onClick={onNext} disabled={!purchaseInfo.usage}>
            Next: Review Summary
          </Button>
        </div>
      </div>
    </div>
  );
}
