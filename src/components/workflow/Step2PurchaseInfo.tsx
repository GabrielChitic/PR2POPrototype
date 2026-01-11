import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { RadioGroup, RadioGroupItem } from "../../components/ui/radio-group";
import { Checkbox } from "../../components/ui/checkbox";
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
          <div className="space-y-2">
            <Label htmlFor="usage">What is this used for? *</Label>
            <Input
              id="usage"
              value={purchaseInfo.usage}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => onUpdate({ usage: e.target.value })}
              placeholder="e.g., New employee onboarding, Office renovation"
            />
          </div>

          <div className="space-y-3">
            <Label>Is this part of a project?</Label>
            <RadioGroup
              value={purchaseInfo.isPartOfProject ? "yes" : "no"}
              onValueChange={(value) => {
                if (value === "yes") {
                  onUpdate({ isPartOfProject: true });
                } else {
                  onUpdate({ isPartOfProject: false, projectName: "" });
                }
              }}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="project-yes" />
                <Label htmlFor="project-yes" className="font-normal cursor-pointer">
                  Yes
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="project-no" />
                <Label htmlFor="project-no" className="font-normal cursor-pointer">
                  No
                </Label>
              </div>
            </RadioGroup>
            {purchaseInfo.isPartOfProject && (
              <Input
                value={purchaseInfo.projectName || ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => onUpdate({ projectName: e.target.value })}
                placeholder="Project name"
              />
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="deliver-to">Deliver to</Label>
              <Input
                id="deliver-to"
                value={purchaseInfo.deliverTo}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => onUpdate({ deliverTo: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={purchaseInfo.deliverToLocation}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => onUpdate({ deliverToLocation: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="need-by-date">Need by date</Label>
            <Input
              id="need-by-date"
              type="date"
              value={purchaseInfo.needByDate}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => onUpdate({ needByDate: e.target.value })}
            />
          </div>

          <div className="border-t pt-4 space-y-4">
            <Label className="text-sm font-medium">Quick compliance checks</Label>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="personal-data"
                  checked={purchaseInfo.involvesPersonalData}
                  onCheckedChange={(checked) =>
                    onUpdate({ involvesPersonalData: checked as boolean })
                  }
                />
                <Label
                  htmlFor="personal-data"
                  className="text-sm font-normal cursor-pointer"
                >
                  Involves personal data
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="third-party"
                  checked={purchaseInfo.involvesThirdParty}
                  onCheckedChange={(checked) =>
                    onUpdate({ involvesThirdParty: checked as boolean })
                  }
                />
                <Label
                  htmlFor="third-party"
                  className="text-sm font-normal cursor-pointer"
                >
                  Involves third-party services
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="special-approval"
                  checked={purchaseInfo.requiresSpecialApproval}
                  onCheckedChange={(checked) =>
                    onUpdate({ requiresSpecialApproval: checked as boolean })
                  }
                />
                <Label
                  htmlFor="special-approval"
                  className="text-sm font-normal cursor-pointer"
                >
                  Requires special approval
                </Label>
              </div>
            </div>
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
